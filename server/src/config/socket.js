// Features:
// - multi-tab / multi-socket per user
// - match confirm timeout
// - matchmaking race protection (simple locking)
// - skip-next-user cooldown + cleanup
// - robust disconnect cleanup
// - safer friend-call handling with pendingCalls timeouts
// - preserves your event API (match-found, match-confirmed, etc.)

const MATCH_CONFIRM_TIMEOUT_MS = 7_000; // how long to wait for both users to accept
const FRIEND_CALL_TIMEOUT_MS = 10_000;   // friend call ringing timeout
const SKIP_COOLDOWN_MS = 3_000;          // minimum ms between skip-next-user calls from same socket

const onlineUsers = new Map();           // socket.id => userData
const userIdToSockets = new Map();       // userId => Set<socketId>
const socketToUserId = new Map();        // socket.id => userId
const pendingCalls = new Map();          // fromSocketId => timeoutId

const queue = new Set();                 // Set<socketId> waiting for random match (FIFO-ish via iteration)
const matches = new Map();               // socket.id => partnerSocketId
const skipNextUserMap = new Map();       // socket.id => Set<socketId> to avoid
const matchConfirmTimers = new Map();    // socket.id => timeoutId for acceptance window
const matchingLocks = new Set();         // socket.id => boolean lock to prevent race
const skipTimestamps = new Map();        // socket.id => lastSkipTimestamp (ms)

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.data = { accepted: false };

    // === USER ONLINE ===
    socket.on("user-online", (userData) => {
      socket.data = { ...socket.data, ...userData, accepted: false };

      onlineUsers.set(socket.id, userData);
      socketToUserId.set(socket.id, userData.userId);

      // multi-socket support
      if (!userIdToSockets.has(userData.userId)) userIdToSockets.set(userData.userId, new Set());
      userIdToSockets.get(userData.userId).add(socket.id);

      io.emit("active-user-count", onlineUsers.size);
      broadcastUserList(io);
    });

    // === JOIN QUEUE ===
    socket.on("join-queue", () => {
      if (matches.has(socket.id)) return; // ignore if already matched
      if (!queue.has(socket.id)) {
        queue.add(socket.id);
        attemptMatchSafe(io, socket.id);
      }
    });

    // === SKIP NEXT USER === (with cooldown)
    socket.on("skip-next-user", (userSocketToSkip) => {
      const now = Date.now();
      const last = skipTimestamps.get(socket.id) || 0;
      if (now - last < SKIP_COOLDOWN_MS) return; // silencing rapid skip spams

      skipTimestamps.set(socket.id, now);

      if (!skipNextUserMap.has(socket.id)) skipNextUserMap.set(socket.id, new Set());
      skipNextUserMap.get(socket.id).add(userSocketToSkip);

      // If they were matched to that user, break it immediately
      if (matches.get(socket.id) === userSocketToSkip) {
        handleSkipWhileMatched(socket, io);
        return;
      }

      // Try to find a match again excluding that user
      attemptMatchSafe(io, socket.id);
    });

    // === ACCEPT / DECLINE MATCH ===
    socket.on("request-accept", () => {
      socket.data.accepted = true;
      const partner = matches.get(socket.id);
      if (!partner) return;

      const partnerSocket = io.sockets.sockets.get(partner);
      if (!partnerSocket) {
        // partner not present — cleanup
        cleanupMatchPair(io, socket.id, partner);
        return;
      }

      io.to(partner).emit("partner-accepted", { user: onlineUsers.get(socket.id) });

      if (partnerSocket.data?.accepted) {
        // both accepted -> finalize
        clearMatchConfirmTimerForPair(socket.id, partner);
        confirmMatch(io, socket.id, partner);
      }
    });

    socket.on("request-decline", () => {
      handleSkipOrDecline(socket, io, "decline");
    });

    // === SKIP MATCH ===
    socket.on("skip", () => handleSkipWhileMatched(socket, io));

    // === TEXT & FILE ===
    socket.on("send-message", ({ to, message }) => {
      // if destination is a userId (not socketId) we might want to support both; current contract uses socket id
      io.to(to).emit("receive-message", { from: socket.id, user: onlineUsers.get(socket.id), message });
    });

    socket.on("send-file", ({ to, fileUrl, fileType, fileName, fileSize }) =>
      io.to(to).emit("receive-file", { from: socket.id, user: onlineUsers.get(socket.id), fileUrl, fileType, fileName, fileSize, time: Date.now() })
    );

    // === FRIEND REQUESTS ===
    socket.on("send-friend-request", ({ to }) => {
      const setOfSockets = userIdToSockets.get(to);
      if (!setOfSockets) return;
      for (const toSocketId of setOfSockets) {
        io.to(toSocketId).emit("friend-request-received", { from: socket.id, user: onlineUsers.get(socket.id) });
      }
    });

    socket.on("friend-response", ({ to, accepted }) => {
      const setOfSockets = userIdToSockets.get(to);
      if (!setOfSockets) return;
      for (const toSocketId of setOfSockets) {
        io.to(toSocketId).emit("friend-response-received", { from: socket.id, accepted, user: onlineUsers.get(socket.id) });
      }
    });

    // === FRIEND CALLS ===
    socket.on("friend-call", ({ to }) => {
      const setOfSockets = userIdToSockets.get(to);
      if (!setOfSockets || setOfSockets.size === 0) return;

      // Only start friend-call if caller is not matched or pending to avoid overwriting
      if (matches.has(socket.id)) {
        io.to(socket.id).emit("friend-call-failed", { message: "You are currently in a match." });
        return;
      }

      // Notify all active sockets of the target user
      for (const toSocketId of setOfSockets) {
        io.to(toSocketId).emit("incoming-friend-call", { from: socket.id, user: onlineUsers.get(socket.id) });
      }

      // set timeout so caller gets notified of no-answer
      const timeoutId = setTimeout(() => {
        io.to(socket.id).emit("friend-call-timeout", { message: "Call timed out." });
        pendingCalls.delete(socket.id);
      }, FRIEND_CALL_TIMEOUT_MS);
      pendingCalls.set(socket.id, timeoutId);
    });

    socket.on("accept-friend-call", ({ from }) => {
      // Ensure the caller still exists
      const callerSocket = io.sockets.sockets.get(from);
      if (!callerSocket) {
        io.to(socket.id).emit("friend-call-failed", { message: "Caller is no longer available." });
        return;
      }

      // If either party is matched already, reject (safety)
      if (matches.has(socket.id) || matches.has(from)) {
        io.to(from).emit("friend-call-rejected", { user: onlineUsers.get(socket.id) });
        return;
      }

      // clear pending call timer for caller
      clearTimeout(pendingCalls.get(from));
      pendingCalls.delete(from);

      // set matches both ways and confirm
      matches.set(socket.id, from);
      matches.set(from, socket.id);

      // clear any pending match-confirm timers if present (friend calls go to confirmed immediately)
      clearMatchConfirmTimerForPair(socket.id, from);

      confirmMatch(io, socket.id, from);
    });

    socket.on("reject-friend-call", ({ from }) => {
      clearTimeout(pendingCalls.get(from));
      pendingCalls.delete(from);
      io.to(from).emit("friend-call-rejected", { user: onlineUsers.get(socket.id) });
    });

    // === WEBRTC SIGNALS ===
    ["webrtc-offer", "webrtc-answer", "webrtc-ice-candidate"].forEach(event =>
      socket.on(event, ({ to, ...payload }) => io.to(to).emit(event, { from: socket.id, ...payload }))
    );

    // === LEAVE QUEUE ===
    socket.on("leave-queue", () => {
      queue.delete(socket.id);
      // if they were in the middle of a match-wait, break it
      if (matches.has(socket.id)) {
        const partner = matches.get(socket.id);
        cleanupMatchPair(io, socket.id, partner);
      }
    });

    // === DISCONNECT ===
    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);

      // remove from online users
      onlineUsers.delete(socket.id);
      const userId = socketToUserId.get(socket.id);
      socketToUserId.delete(socket.id);

      // remove socket from userIdToSockets
      if (userId && userIdToSockets.has(userId)) {
        const s = userIdToSockets.get(userId);
        s.delete(socket.id);
        if (s.size === 0) userIdToSockets.delete(userId);
      }

      // clear pending call if caller
      clearTimeout(pendingCalls.get(socket.id));
      pendingCalls.delete(socket.id);

      // leave queue
      queue.delete(socket.id);

      // if matched, inform partner and re-queue partner
      const partner = matches.get(socket.id);
      if (partner) {
        handleSkipOrDecline(socket, io, "disconnect");
      }

      // remove this socket id from any skipNextUserMap sets
      cleanupSocketFromSkips(socket.id);

      skipNextUserMap.delete(socket.id);
      matchingLocks.delete(socket.id);
      skipTimestamps.delete(socket.id);

      io.emit("active-user-count", onlineUsers.size);
      broadcastUserList(io);
    });
  });
};

// -------------------- Helpers --------------------

function attemptMatchSafe(io, newSocketId) {
  // quick guard: if new socket is already matched or not in queue -> no-op
  if (!queue.has(newSocketId) || matches.has(newSocketId)) return;

  // prevent simultaneous attempts involving same socket
  if (matchingLocks.has(newSocketId)) return;

  matchingLocks.add(newSocketId);
  try {
    attemptMatch(io, newSocketId);
  } finally {
    matchingLocks.delete(newSocketId);
  }
}

function attemptMatch(io, newSocketId) {
  // iterate through queue and find first eligible partner
  for (let partnerSocketId of queue) {
    if (partnerSocketId === newSocketId) continue;
    if (matches.has(partnerSocketId)) continue;
    if (matches.has(newSocketId)) break; // newSocket got matched by another attempt

    // skip sets
    if (skipNextUserMap.get(partnerSocketId)?.has(newSocketId)) continue;
    if (skipNextUserMap.get(newSocketId)?.has(partnerSocketId)) continue;

    // found a partner: remove both from queue and set a temporary 'proposed' match
    queue.delete(partnerSocketId);
    queue.delete(newSocketId);

    // mark them as "pending confirmation"
    matches.set(partnerSocketId, newSocketId);
    matches.set(newSocketId, partnerSocketId);

    // reset accept flags
    const partnerSocket = io.sockets.sockets.get(partnerSocketId);
    const newSocket = io.sockets.sockets.get(newSocketId);
    if (partnerSocket) partnerSocket.data.accepted = false;
    if (newSocket) newSocket.data.accepted = false;

    // emit found event to both sides
    io.to(partnerSocketId).emit("match-found", { partnerSocket: newSocketId, partnerData: onlineUsers.get(newSocketId) });
    io.to(newSocketId).emit("match-found", { partnerSocket: partnerSocketId, partnerData: onlineUsers.get(partnerSocketId) });

    // start a confirmation timer. If both sides don't call "request-accept" in time, rollback.
    startMatchConfirmTimer(io, newSocketId, partnerSocketId);

    return;
  }
  // no matches found — keep in queue
}

function startMatchConfirmTimer(io, a, b) {
  // ensure any previous timers are cleared
  clearMatchConfirmTimerForPair(a, b);

  const timeoutA = setTimeout(() => {
    // if still pending, rollback both and requeue
    if (matches.get(a) === b && matches.get(b) === a) {
      io.to(a).emit("match-timeout", { message: "Match timed out (no accept)." });
      io.to(b).emit("match-timeout", { message: "Match timed out (no accept)." });
      rollbackMatchToQueue(io, a, b);
    }
  }, MATCH_CONFIRM_TIMEOUT_MS);

  // store both references so cleanup is easy
  matchConfirmTimers.set(a, timeoutA);
  matchConfirmTimers.set(b, timeoutA); // same timeout referenced by both
}

function clearMatchConfirmTimerForPair(a, b) {
  const t = matchConfirmTimers.get(a);
  if (t) {
    clearTimeout(t);
    matchConfirmTimers.delete(a);
    matchConfirmTimers.delete(b);
  }
}

function rollbackMatchToQueue(io, a, b) {
  // cleanup match entries
  matches.delete(a);
  matches.delete(b);

  // requeue if sockets still connected and present
  if (!matches.has(a) && io.sockets.sockets.get(a)) queue.add(a);
  if (!matches.has(b) && io.sockets.sockets.get(b)) queue.add(b);

  // attempt to rematch quickly
  attemptMatchSafe(io, a);
  attemptMatchSafe(io, b);
}

function confirmMatch(io, a, b) {
  const userA = onlineUsers.get(a);
  const userB = onlineUsers.get(b);
  io.to(a).emit("match-confirmed", { partner: { socketId: b, ...userB } });
  io.to(b).emit("match-confirmed", { partner: { socketId: a, ...userA } });
  // once confirmed, clear confirm timers
  clearMatchConfirmTimerForPair(a, b);
}

function broadcastUserList(io) {
  io.emit("friend-status-update",
    Array.from(onlineUsers.entries()).map(([socketId, data]) => ({ socketId, ...data }))
  );
}

function handleSkipWhileMatched(socket, io) {
  const partner = matches.get(socket.id);
  if (partner) {
    io.to(partner).emit("partner-skipped", { user: onlineUsers.get(socket.id) });
    io.to(socket.id).emit("skipped-partner", { user: onlineUsers.get(partner) });

    // remove match
    matches.delete(socket.id);
    matches.delete(partner);

    // requeue both if they're still connected
    if (io.sockets.sockets.get(socket.id)) queue.add(socket.id);
    if (io.sockets.sockets.get(partner)) queue.add(partner);

    // try rematching
    attemptMatchSafe(io, socket.id);
    attemptMatchSafe(io, partner);
  } else {
    // not matched, ensure they're in queue to find a partner
    queue.add(socket.id);
    attemptMatchSafe(io, socket.id);
  }
}

function handleSkipOrDecline(socket, io, reason) {
  const partner = matches.get(socket.id);
  if (!partner) return;

  io.to(partner).emit("partner-" + reason, { user: onlineUsers.get(socket.id) });

  // delete both match pointers
  matches.delete(partner);
  matches.delete(socket.id);

  // requeue partner if present
  if (io.sockets.sockets.get(partner)) queue.add(partner);
  if (io.sockets.sockets.get(socket.id)) queue.add(socket.id);

  // clear confirm timer for the pair
  clearMatchConfirmTimerForPair(socket.id, partner);

  attemptMatchSafe(io, partner);
  attemptMatchSafe(io, socket.id);
}

function cleanupMatchPair(io, a, b) {
  // Inform partner and requeue partner
  if (b && io.sockets.sockets.get(b)) {
    io.to(b).emit("partner-disconnected", { user: onlineUsers.get(a) });
    matches.delete(b);
    queue.add(b);
    attemptMatchSafe(io, b);
  }
  // cleanup a's pointers
  matches.delete(a);
  clearMatchConfirmTimerForPair(a, b);
}

function clearTimeoutForSocketMap(map, key) {
  const id = map.get(key);
  if (id) {
    clearTimeout(id);
    map.delete(key);
  }
}

// Remove a socket id from all skip sets (used on disconnect)
function cleanupSocketFromSkips(socketId) {
  for (const [sId, skipSet] of skipNextUserMap.entries()) {
    if (skipSet.has(socketId)) skipSet.delete(socketId);
    if (skipSet.size === 0) skipNextUserMap.delete(sId);
  }
}

export default setupSocket;
