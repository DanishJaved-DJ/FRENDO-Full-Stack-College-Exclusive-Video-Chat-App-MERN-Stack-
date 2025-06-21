import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ userData, children }) => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [match, setMatch] = useState(null);
  const [incomingSignal, setIncomingSignal] = useState(null);
 

  useEffect(() => {
    if (!userData) return;
    const s = io("http://localhost:3000");
    setSocket(s);

    s.emit("user-online", userData);

    s.on("active-user-count", (count) => {
      console.log("Active users:", count);
      setActiveUsers(count);
    });

    s.on("friend-status-update", (users) => {
      setOnlineUsers(users);
    });

    s.on("match-found", ({ partnerSocket, partnerData }) => {
      setMatch({ socketId: partnerSocket, user: partnerData });
    });

    s.on("match-confirmed", ({ partner }) => {
      console.log("Match confirmed with:", partner);
    });

    s.on("partner-decline", () => {
      // alert("Partner declined. Searching again...");
      s.emit("join-queue");
    });

    s.on("partner-skipped", () => {
      // alert("Partner skipped.");
      s.emit("join-queue");
    });

    s.on("signal", ({ from, signal, user }) => {
      setIncomingSignal({ from, signal, user });
    });

  

    return () => s.disconnect();
  }, [userData]);

  return (
    <SocketContext.Provider value={{ activeUsers, socket, onlineUsers, match, setMatch, incomingSignal }}>
      {children}
    </SocketContext.Provider>
  );
};
