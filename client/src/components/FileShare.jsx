import React from "react";
import { useSocket } from "../context/SocketContext";
import { IoAttach } from "react-icons/io5";

const FileShare = () => {
  const { socket, match } = useSocket();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !match) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      socket.emit("send-file", {
        to: match.socketId,
        fileName: file.name,
        fileType: file.type,
        fileData: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-4 py-2 rounded-full cursor-pointer shadow-lg flex items-center transition-transform hover:scale-105">
        <IoAttach className="inline-block mr-2 text-xl" />
        <span className="font-semibold">Attach</span>
        <input type="file" onChange={handleFileChange} hidden />
      </label>
    </div>
  );
};

export default FileShare;
