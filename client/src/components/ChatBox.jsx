import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";

const ChatBox = () => {
  const { socket, match } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  React.useEffect(() => {
    socket?.on("receive-message", ({ message, user }) => {
      setMessages((prev) => [...prev, { message, user }]);
    });
  }, [socket]);

  const sendMessage = () => {
    if (!input.trim() || !match) return;
    socket.emit("send-message", { to: match.socketId, message: input });
    setMessages((prev) => [...prev, { message: input, user: "me" }]);
    setInput("");
  };

  return (
    <div className="border p-3 rounded shadow-md">
      <h2 className="font-semibold">Text Chat</h2>
      <div className="h-40 overflow-y-auto bg-gray-100 p-2 my-2 rounded">
        {messages.map((msg, i) => (
          <div key={i} className={msg.user === "me" ? "text-right" : "text-left"}>
            <p className="text-sm">{msg.user === "me" ? "You" : msg.user.username}:</p>
            <p className="bg-white inline-block px-2 py-1 rounded">{msg.message}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border px-2 py-1 w-full rounded"
          placeholder="Type a message"
        />
        <button onClick={sendMessage} className="bg-green-500 text-white px-3 rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
