import React from "react";
import { useSocketEvents } from "../hook/useSocketEvent";

const OnlineUsersPanel = () => {
  const { activeUserCount, onlineUsers } = useSocketEvents();

  return (
    <div className="p-4 bg-white shadow-md rounded-xl">
      <h2 className="text-xl font-bold mb-2">Online Users ({activeUserCount})</h2>
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {onlineUsers.map((user) => (
          <li key={user.socketId} className="flex items-center gap-3">
            <img
              src={user.avatar || "/default-avatar.png"}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
            <span>{user.username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsersPanel;
