import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import VideoPlayer from "../components/VideoPlayer";
import FileUploader from "../components/FileShare";
import { useNavigate } from "react-router-dom";
import { IoIosPersonAdd } from "react-icons/io";
import { PiSkipForwardFill } from "react-icons/pi";
import { toast } from "sonner";
import RequestPopUp from "../components/RequestPopUp";
import { TiTick } from "react-icons/ti";
import { isfriend } from "../helper/IsFriend";
import EmojiPicker from "emoji-picker-react";

const ChatBox = () => {
  const { socket, match } = useSocket();
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [friendRequestResponse, setFriendRequestResponse] = useState(false);
  const navigate = useNavigate();

  const handleSkip = () => {
    socket.emit("skip");
  };

  // Receive File from partner
  useEffect(() => {
    socket.on(
      "receive-file",
      ({ from, fileUrl, fileName, fileType, fileSize, time }) => {
        setMessages((prev) => [
          ...prev,
          {
            type: "file",
            from,
            fileUrl,
            fileName,
            fileType,
            fileSize,
            time: time || Date.now(),
          },
        ]);
      }
    );

    return () => {
      socket.off("receive-file");
    };
  }, [socket]);

  // Handle messages and events
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = ({ message, user }) => {
      setMessages((prev) => [...prev, { message, user }]);
    };

    const handlePartnerSkipped = () => {
      toast.info("Partner skipped");
      navigate("/match-find");
    };

    const handleFriendRequest = ({ user }) => {
      setFriendRequestResponse(true);
      setUserData(user);
      toast(`Friend request from ${user.username}`);
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("partner-skipped", handlePartnerSkipped);
    socket.on("skipped-partner", handlePartnerSkipped);
    socket.on("friend-request-received", handleFriendRequest);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("partner-skipped", handlePartnerSkipped);
      socket.off("skipped-partner", handlePartnerSkipped);
      socket.off("friend-request-received", handleFriendRequest);
    };
  }, [socket, navigate]);

  const sendMessage = () => {
    if (!input.trim() || !match) return;
    socket.emit("send-message", { to: match.socketId, message: input });
    setMessages((prev) => [...prev, { message: input, user: "me" }]);
    setInput("");
  };

  const sendFriendRequest = () => {
    if (!match) return toast.error("No active partner.");
    socket.emit("send-friend-request", { to: match.socketId });
    toast.success("Friend request sent!");
  };

  // Auto scroll to latest message
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen w-screen flex bg-gradient-to-tr from-gray-200 via-purple-200 to-yellow-100 p-0">
      {friendRequestResponse && <RequestPopUp user={userData} />}

      {/* LEFT - Video */}
      <div className="flex flex-col items-center justify-center w-1/2 max-w-2xl bg-white rounded-l-3xl shadow-2xl m-8">
        {!match ? (
          <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Waiting for a match...
            </h1>
          </div>
        ) : (
          <>
            <VideoPlayer />
            <div className="flex items-center justify-center p-6 space-x-4">
              <button
                className="mt-4 font-bold px-4 py-2 rounded-full shadow-lg hover:opacity-80 transition"
                onClick={handleSkip}
              >
                <PiSkipForwardFill className="inline-block mr-2 text-3xl text-gray-700" />
              </button>
              {isfriend(match._id) ? (
                <span className="mt-4 px-2 py-2 rounded-full shadow-lg bg-green-100 flex items-center">
                  <TiTick className="inline-block text-3xl text-green-600 mr-1" />
                  <span className="text-green-700 font-semibold">
                    Already a friend
                  </span>
                </span>
              ) : (
                <button
                  className="mt-4 font-bold px-2 py-2 rounded-full shadow-lg hover:opacity-80 transition cursor-pointer"
                  onClick={sendFriendRequest}
                >
                  <IoIosPersonAdd className="inline-block mr-2 text-3xl text-pink-700" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* RIGHT - Chat UI */}
      <div className="relative flex flex-col w-1/2 max-w-2xl bg-white rounded-r-3xl shadow-2xl m-8 p-0">
        <div className="flex items-center justify-center py-6 border-b border-gray-200">
          <h2 className="font-bold text-xl text-gray-800">Text Chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-white via-pink-50 to-yellow-50 rounded-b-3xl">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.user === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs ${
                  msg.user === "me"
                    ? "bg-gradient-to-br from-pink-400 to-yellow-400 text-white"
                    : "bg-gray-100 text-gray-800"
                } px-4 py-2 rounded-2xl shadow ${
                  msg.user === "me" ? "rounded-br-none" : "rounded-bl-none"
                }`}
              >
                <p className="text-xs mb-1 font-semibold">
                  {msg.user === "me"
                    ? "You"
                    : msg.user?.username || msg.from || "Partner"}
                </p>

                {/* FILE HANDLING */}
                {msg.type === "file" && (
                  <div className="mb-2 space-y-1">
                    {msg.fileType?.startsWith("image") ? (
                      <img
                        src={msg.fileUrl}
                        alt={msg.fileName}
                        className="max-h-48 max-w-xs rounded-lg border border-pink-200 shadow-md object-contain"
                      />
                    ) : msg.fileType?.startsWith("video") ? (
                      <video
                        controls
                        src={msg.fileUrl}
                        className="max-h-48 max-w-xs rounded-lg border border-yellow-200 shadow-md"
                      />
                    ) : msg.fileType?.startsWith("audio") ? (
                      <audio controls className="w-full">
                        <source src={msg.fileUrl} type={msg.fileType} />
                        Your browser does not support audio playback.
                      </audio>
                    ) : null}
                    <a
                      href={msg.fileUrl}
                      download={msg.fileName}
                      className="mt-1 text-xs text-blue-700 underline hover:text-blue-900 break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {msg.fileName}
                      {msg.fileSize
                        ? ` (${(msg.fileSize / 1024).toFixed(1)} KB)`
                        : ""}
                    </a>
                  </div>
                )}

                {msg.message && <p className="break-words">{msg.message}</p>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex items-center px-6 py-4 border-t border-gray-200 bg-white rounded-b-3xl space-x-2">
          {/* Emoji Picker */}
          <div className="relative">
            <button
              type="button"
              className="text-2xl focus:outline-none"
              onClick={() => setShowEmoji((v) => !v)}
              title="Add emoji"
            >
              😊
            </button>
            {showEmoji && (
              <div className="absolute bottom-12 left-0 z-10">
                <EmojiPicker
                  onEmojiClick={(emojiObject) => {
                    setInput((prev) => prev + emojiObject.emoji);
                    setShowEmoji(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* File Uploader */}
          <FileUploader
            socket={socket}
            toSocketId={match?.socketId}
            onFileSent={(fileData) =>
              setMessages((prev) => [...prev, { type: "file", ...fileData }])
            }
          />

          {/* Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border-none outline-none bg-gray-100 rounded-full px-4 py-2 text-gray-800"
            placeholder="Type a message"
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-tr from-pink-600 to-yellow-500 text-white font-bold px-6 py-2 rounded-full shadow hover:opacity-90 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
