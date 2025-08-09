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

    // Always emit user-online on connect & reconnect
    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
      s.emit("user-online", {
        userId: userData.userId || userData._id,  // depends on your shape
        username: userData.username,
        avatarUrl: userData.avatarUrl,
      });
    });

    s.on("active-user-count", (count) => {
      setActiveUsers(count);
    });

    s.on("friend-status-update", (users) => {
      setOnlineUsers(users);
    });

    s.on("match-found", ({ partnerSocket, partnerData }) => {
      setMatch({ socketId: partnerSocket, user: partnerData });
    });

    s.on("match-confirmed", ({ partner }) => {
      setMatch({ socketId: partner.socketId, user: partner });
    });

    s.on("partner-decline", () => {
      s.emit("join-queue");
    });

    s.on("partner-skipped", () => {
      s.emit("join-queue");
    });

    // Clean up
    return () => {
      console.log("🛑 Socket disconnected");
      s.disconnect();
    };
  }, [userData]);

  return (
    <SocketContext.Provider value={{ activeUsers, socket, onlineUsers, match, setMatch }}>
      {children}
    </SocketContext.Provider>
  );
};
