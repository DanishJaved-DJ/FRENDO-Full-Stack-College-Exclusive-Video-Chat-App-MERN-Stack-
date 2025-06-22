const onlineUsers = new Map(); // socket.id => userData
const queue = [];
const matches = new Map();
const skipNextUserMap = new Map(); // socket.id => Set of socket ids to skip

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // 1. User connected
    socket.on("user-online", (userData) => {
      socket.data = { ...userData, accepted: false };
      onlineUsers.set(socket.id, userData);
      console.log(`[User] Online: ${userData.userId} (Socket: ${socket.id})`);

      io.emit("active-user-count", onlineUsers.size);

      const usersArr = Array.from(onlineUsers.entries()).map(([sid, data]) => ({
        socketId: sid,
        ...data,
      }));
      io.emit("friend-status-update", usersArr);
    });

    // 2. Join matchmaking queue
    socket.on("join-queue", () => {
      if (!queue.includes(socket.id)) {
        queue.push(socket.id);
        console.log(`[Queue] Socket joined: ${socket.id}. Queue:`, queue);
        attemptMatch(io);
      }
    });

    // 2b. Skip next user (by socket id)
    socket.on("skip-next-user", (userSocketToSkip) => {
      if (!skipNextUserMap.has(socket.id)) {
        skipNextUserMap.set(socket.id, new Set());
      }
      skipNextUserMap.get(socket.id).add(userSocketToSkip);
      console.log(`[SkipNextUser] ${socket.id} will skip next match with ${userSocketToSkip}`);
      attemptMatch(io);
    });

    // 3. Accept/decline logic
    socket.on("request-accept", () => {
      socket.data.accepted = true;
      const partner = matches.get(socket.id);

      if (partner) {
        // Notify the partner that this user accepted
        io.to(partner).emit("partner-accepted", {
          user: onlineUsers.get(socket.id),
        });

        // Check if both accepted
        if (io.sockets.sockets.get(partner)?.data?.accepted) {
          const userA = onlineUsers.get(socket.id);
          const userB = onlineUsers.get(partner);

          io.to(socket.id).emit("match-confirmed", { partner: userB });
          io.to(partner).emit("match-confirmed", { partner: userA });

          console.log(`[Match] Confirmed: ${socket.id} <-> ${partner}`);
        }
      }
    });

    socket.on("request-decline", () => {
      console.log(`[Match] ${socket.id} declined match`);
      handleSkipOrDecline(socket, io, "decline");
    });

    socket.on("skip", () => {
      console.log(`[Match] ${socket.id} skipped current match`);
      handleSkipWhileMatched(socket, io);
    });

    // --- WebRTC RAW SIGNALING EVENTS ---
    socket.on("webrtc-offer", ({ to, offer }) => {
      io.to(to).emit("webrtc-offer", { from: socket.id, offer });
    });

    socket.on("webrtc-answer", ({ to, answer }) => {
      io.to(to).emit("webrtc-answer", { from: socket.id, answer });
    });

    socket.on("webrtc-candidate", ({ to, candidate }) => {
      io.to(to).emit("webrtc-candidate", { from: socket.id, candidate });
    });
    // -----------------------------------

    socket.on("send-message", ({ to, message }) => {
      io.to(to).emit("receive-message", {
        from: socket.id,
        user: onlineUsers.get(socket.id),
        message,
      });
    });

    socket.on("send-file", ({ to, fileUrl, fileType }) => {
      io.to(to).emit("receive-file", {
        from: socket.id,
        user: onlineUsers.get(socket.id),
        fileUrl,
        fileType,
      });
    });

    socket.on("send-friend-request", ({ to }) => {
      io.to(to).emit("friend-request-received", {
        from: socket.id,
        user: onlineUsers.get(socket.id),
      });
    });

    socket.on("friend-response", ({ to, accepted }) => {
      const fromUser = onlineUsers.get(socket.id);
      io.to(to).emit("friend-response-received", {
        from: socket.id,
        accepted,
        user: fromUser,
      });
    });

    // Exit queue
    socket.on("leave-queue", () => {
      const idx = queue.indexOf(socket.id);
      if (idx !== -1) queue.splice(idx, 1);
      matches.delete(socket.id);
      console.log(`[Queue] ${socket.id} left queue and redirected to /home`);
      console.log(queue);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      onlineUsers.delete(socket.id);
      io.emit("active-user-count", onlineUsers.size);

      const usersArr = Array.from(onlineUsers.entries()).map(([sid, data]) => ({
        socketId: sid,
        ...data,
      }));
      io.emit("friend-status-update", usersArr);

      handleSkipOrDecline(socket, io, "disconnect");
      skipNextUserMap.delete(socket.id);
    });
  });
};

// Matchmaking
function attemptMatch(io) {
  if (queue.length >= 2) {
    for (let i = 0; i < queue.length; i++) {
      for (let j = i + 1; j < queue.length; j++) {
        const a = queue[i];
        const b = queue[j];
        const aSkips = skipNextUserMap.get(a)?.has(b);
        const bSkips = skipNextUserMap.get(b)?.has(a);

        if (!aSkips && !bSkips) {
          queue.splice(j, 1);
          queue.splice(i, 1);
          matches.set(a, b);
          matches.set(b, a);

          io.to(a).emit("match-found", {
            partnerSocket: b,
            partnerData: onlineUsers.get(b),
          });
          io.to(b).emit("match-found", {
            partnerSocket: a,
            partnerData: onlineUsers.get(a),
          });

          console.log(`[Matchmaking] Match found: ${a} <-> ${b}`);
          return;
        }
      }
    }
  }
}

function handleSkipWhileMatched(socket, io) {
  const partner = matches.get(socket.id);
  if (partner) {
    io.to(partner).emit("partner-skipped", {
      user: onlineUsers.get(socket.id),
      message: "Your partner has skipped.",
    });
    io.to(socket.id).emit("skipped-partner", {
      user: onlineUsers.get(partner),
      message: "You have skipped.",
    });

    matches.delete(partner);
    matches.delete(socket.id);
    queue.push(partner, socket.id);

    attemptMatch(io);
  } else {
    if (!queue.includes(socket.id)) {
      queue.push(socket.id);
      attemptMatch(io);
    }
  }
}

function handleSkipOrDecline(socket, io, reason) {
  const partner = matches.get(socket.id);
  if (partner) {
    io.to(partner).emit("partner-" + reason, {
      user: onlineUsers.get(socket.id),
    });
    matches.delete(partner);
    queue.push(partner);
  }
  matches.delete(socket.id);
  queue.push(socket.id);
  attemptMatch(io);
}