const onlineUsers = new Map();         // socket.id => userData
const userIdToSocket = new Map();      // userId => socket.id
const socketToUserId = new Map();      // socket.id => userId
const pendingCalls = new Map();        // fromSocketId => timeoutId

const queue = [];
const matches = new Map();             // socket.id => partnerSocketId
const skipNextUserMap = new Map();     // socket.id => Set of socket ids to skip

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // === USER ONLINE ===
    socket.on("user-online", (userData) => {
      socket.data = { ...userData, accepted: false };
      onlineUsers.set(socket.id, userData);
      userIdToSocket.set(userData.userId, socket.id);
      socketToUserId.set(socket.id, userData.userId);

      io.emit("active-user-count", onlineUsers.size);
      broadcastUserList(io);
    });

    // === JOIN QUEUE ===
    socket.on("join-queue", () => {
      if (!queue.includes(socket.id) && !matches.has(socket.id)) {
        queue.push(socket.id);
        attemptMatch(io);
      }
    });

    // === SKIP NEXT USER ===
    socket.on("skip-next-user", (userSocketToSkip) => {
      if (!skipNextUserMap.has(socket.id)) {
        skipNextUserMap.set(socket.id, new Set());
      }
      skipNextUserMap.get(socket.id).add(userSocketToSkip);
      attemptMatch(io);
    });

    // === ACCEPT MATCH ===
    socket.on("request-accept", () => {
      socket.data.accepted = true;
      const partner = matches.get(socket.id);

      if (partner) {
        io.to(partner).emit("partner-accepted", {
          user: onlineUsers.get(socket.id),
        });

        const partnerData = io.sockets.sockets.get(partner)?.data;
        if (partnerData?.accepted) {
          const userA = onlineUsers.get(socket.id);
          const userB = onlineUsers.get(partner);
          io.to(socket.id).emit("match-confirmed", { partner: { socketId: partner, ...userB } });
          io.to(partner).emit("match-confirmed", { partner: { socketId: socket.id, ...userA } });
        }
      }
    });

    // === DECLINE MATCH ===
    socket.on("request-decline", () => {
      handleSkipOrDecline(socket, io, "decline");
    });

    // === SKIP MATCH ===
    socket.on("skip", () => {
      handleSkipWhileMatched(socket, io);
    });

    // === TEXT MESSAGE ===
    socket.on("send-message", ({ to, message }) => {
      if (!to || !message || !io.sockets.sockets.get(to)) return;
      io.to(to).emit("receive-message", {
        from: socket.id,
        user: onlineUsers.get(socket.id),
        message,
      });
    });

    // === FILE TRANSFER ===
    socket.on("send-file", ({ to, fileUrl, fileType, fileName, fileSize }) => {
      if (!to || !fileUrl || !io.sockets.sockets.get(to)) return;
      io.to(to).emit("receive-file", {
        from: socket.id,
        user: onlineUsers.get(socket.id),
        fileUrl,
        fileType,
        fileName,
        fileSize,
        time: Date.now(),
      });
    });

    // === FRIEND REQUEST ===
    socket.on("send-friend-request", ({ to }) => {
      const toSocketId = userIdToSocket.get(to);
      if (toSocketId && io.sockets.sockets.get(toSocketId)) {
        io.to(toSocketId).emit("friend-request-received", {
          from: socket.id,
          user: onlineUsers.get(socket.id),
        });
      }
    });

    socket.on("friend-response", ({ to, accepted }) => {
      const toSocketId = userIdToSocket.get(to);
      if (toSocketId && io.sockets.sockets.get(toSocketId)) {
        io.to(toSocketId).emit("friend-response-received", {
          from: socket.id,
          accepted,
          user: onlineUsers.get(socket.id),
        });
      }
    });

    // === FRIEND CALL ===
    socket.on("friend-call", ({ to }) => {
      const toSocketId = userIdToSocket.get(to);
      const fromUser = onlineUsers.get(socket.id);
      const toUser = onlineUsers.get(toSocketId);

      if (!toSocketId || !fromUser || !toUser || !io.sockets.sockets.get(toSocketId)) return;

      io.to(toSocketId).emit("incoming-friend-call", {
        from: socket.id,
        user: fromUser,
      });

      const timeoutId = setTimeout(() => {
        io.to(socket.id).emit("friend-call-timeout", {
          message: "Call timed out. No response from friend.",
        });
        pendingCalls.delete(socket.id);
      }, 30000);

      pendingCalls.set(socket.id, timeoutId);
    });

    socket.on("accept-friend-call", ({ from }) => {
      if (!io.sockets.sockets.get(from)) return;
      matches.set(socket.id, from);
      matches.set(from, socket.id);
      clearTimeout(pendingCalls.get(from));
      pendingCalls.delete(from);

      const userA = onlineUsers.get(socket.id);
      const userB = onlineUsers.get(from);
      io.to(from).emit("match-confirmed", { partner: { socketId: socket.id, ...userA } });
      io.to(socket.id).emit("match-confirmed", { partner: { socketId: from, ...userB } });
    });

    socket.on("reject-friend-call", ({ from }) => {
      clearTimeout(pendingCalls.get(from));
      pendingCalls.delete(from);
      if (io.sockets.sockets.get(from)) {
        io.to(from).emit("friend-call-rejected", {
          user: onlineUsers.get(socket.id),
        });
      }
    });

    // === WEBRTC SIGNALING ===
    socket.on("webrtc-offer", ({ to, offer }) => {
      if (io.sockets.sockets.get(to)) {
        io.to(to).emit("webrtc-offer", {
          from: socket.id,
          offer,
        });
      }
    });

    socket.on("webrtc-answer", ({ to, answer }) => {
      if (io.sockets.sockets.get(to)) {
        io.to(to).emit("webrtc-answer", {
          from: socket.id,
          answer,
        });
      }
    });

    socket.on("webrtc-ice-candidate", ({ to, candidate }) => {
      if (io.sockets.sockets.get(to)) {
        io.to(to).emit("webrtc-ice-candidate", {
          from: socket.id,
          candidate,
        });
      }
    });

    // === LEAVE QUEUE ===
    socket.on("leave-queue", () => {
      const idx = queue.indexOf(socket.id);
      if (idx !== -1) queue.splice(idx, 1);
      matches.delete(socket.id);
    });

    // === DISCONNECT ===
    socket.on("disconnect", () => {
      const userId = socketToUserId.get(socket.id);
      onlineUsers.delete(socket.id);
      userIdToSocket.delete(userId);
      socketToUserId.delete(socket.id);

      const timeoutId = pendingCalls.get(socket.id);
      if (timeoutId) {
        clearTimeout(timeoutId);
        pendingCalls.delete(socket.id);
      }

      const index = queue.indexOf(socket.id);
      if (index !== -1) queue.splice(index, 1);

      handleSkipOrDecline(socket, io, "disconnect");
      skipNextUserMap.delete(socket.id);

      io.emit("active-user-count", onlineUsers.size);
      broadcastUserList(io);
    });
  });
};

// === HELPERS ===
function broadcastUserList(io) {
  const usersArr = Array.from(onlineUsers.entries()).map(([sid, data]) => ({
    socketId: sid,
    ...data,
  }));
  io.emit("friend-status-update", usersArr);
}

function attemptMatch(io) {
  if (queue.length < 2) return;

  for (let i = 0; i < queue.length; i++) {
    for (let j = i + 1; j < queue.length; j++) {
      const a = queue[i], b = queue[j];
      if (!skipNextUserMap.get(a)?.has(b) && !skipNextUserMap.get(b)?.has(a)) {
        queue.splice(j, 1);
        queue.splice(i, 1);
        matches.set(a, b);
        matches.set(b, a);

        io.to(a).emit("match-found", { partnerSocket: b, partnerData: onlineUsers.get(b) });
        io.to(b).emit("match-found", { partnerSocket: a, partnerData: onlineUsers.get(a) });
        return;
      }
    }
  }
}

function handleSkipWhileMatched(socket, io) {
  const partner = matches.get(socket.id);
  if (partner) {
    if (io.sockets.sockets.get(partner)) {
      io.to(partner).emit("partner-skipped", {
        user: onlineUsers.get(socket.id),
        message: "Your partner has skipped.",
      });
    }
    io.to(socket.id).emit("skipped-partner", {
      user: onlineUsers.get(partner),
      message: "You have skipped.",
    });

    matches.delete(partner);
    matches.delete(socket.id);
    queue.push(partner, socket.id);
    attemptMatch(io);
  } else if (!queue.includes(socket.id)) {
    queue.push(socket.id);
    attemptMatch(io);
  }
}

function handleSkipOrDecline(socket, io, reason) {
  const partner = matches.get(socket.id);
  if (partner) {
    if (io.sockets.sockets.get(partner)) {
      io.to(partner).emit("partner-" + reason, {
        user: onlineUsers.get(socket.id),
      });
    }
    matches.delete(partner);
    if (reason !== "decline") queue.push(partner);
  }

  matches.delete(socket.id);
  if (reason !== "decline") queue.push(socket.id);
  attemptMatch(io);
}
