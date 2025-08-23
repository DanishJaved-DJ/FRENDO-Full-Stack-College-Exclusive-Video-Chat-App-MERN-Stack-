// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ userData, children }) => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [match, setMatch] = useState(null);

  useEffect(() => {
    if (!userData) return;

    const s = io(import.meta.env.VITE_BACKEND_DOMAIN, {
      transports: ["websocket"],
      auth: { token: userData.token },
    });

    setSocket(s);

    // ✅ On connect/reconnect
    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
      s.emit("user-online", {
        userId: userData.userId || userData._id, // depends on your shape
        username: userData.username,
        avatarUrl: userData.avatarUrl,
      });
    });

    // --- Core events ---
    s.on("active-user-count", (count) => setActiveUsers(count));
    s.on("friend-status-update", (users) => setOnlineUsers(users));

    s.on("match-found", ({ partnerSocket, partnerData }) => {
      setMatch({ socketId: partnerSocket, user: partnerData });
    });

    s.on("match-confirmed", ({ partner }) => {
      setMatch({ socketId: partner.socketId, user: partner });
    });

    s.on("partner-decline", () => {
      setMatch(null);
      s.emit("join-queue");
    });

    s.on("partner-skipped", () => {
      setMatch(null);
      s.emit("join-queue");
    });

    // --- WebRTC signaling events ---
    s.on("webrtc-offer", ({ from, sdp }) => {
      console.log("📩 Received offer from:", from);
      // Handled in VideoPlayer / useWebRTC hook
    });

    s.on("webrtc-answer", ({ from, sdp }) => {
      console.log("📩 Received answer from:", from);
    });

    s.on("webrtc-ice-candidate", ({ from, candidate }) => {
      console.log("📩 Received ICE candidate from:", from);
    });

    // Cleanup
    return () => {
      console.log("🛑 Socket disconnected");
      s.disconnect();
    };
  }, [userData]);

  // --- Signaling emitters ---
  const sendOffer = (to, sdp) => {
    if (!socket) return;
    socket.emit("webrtc-offer", { to, sdp });
  };

  const sendAnswer = (to, sdp) => {
    if (!socket) return;
    socket.emit("webrtc-answer", { to, sdp });
  };

  const sendIceCandidate = (to, candidate) => {
    if (!socket) return;
    socket.emit("webrtc-ice-candidate", { to, candidate });
  };

  return (
    <SocketContext.Provider
      value={{
        activeUsers,
        socket,
        onlineUsers,
        match,
        setMatch,
        sendOffer,
        sendAnswer,
        sendIceCandidate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
