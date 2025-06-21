import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import VideoPlayer from "../components/VideoPlayer";
import FileShare from "../components/FileShare";
import { useNavigate } from "react-router-dom";
import { IoIosPersonAdd } from "react-icons/io";
import { PiSkipForwardFill } from "react-icons/pi";
import { HiMiniPause } from "react-icons/hi2";
import { toast } from "sonner";
import RequestPopUp from "../components/RequestPopUp";
import { TiTick } from "react-icons/ti";
import { isfriend } from "../helper/IsFriend";

const ChatBox = () => {
  const { socket, match } = useSocket();
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFileShare, setShowFileShare] = useState(false);
  const [file, setFile] = useState(null);

  const [friendRequestResponse, setFriendRequestResponse] = useState(false);
  const navigate = useNavigate();

  console.log("Match data:", match);
  

  const handleSkip = () => {
    socket.emit("skip");
  };   

  React.useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = ({ message, user }) => {
      setMessages((prev) => [...prev, { message, user }]);
    };

    const handlePartnerSkipped = () => {
      toast.info("skipped");
      navigate("/match-find");
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("partner-skipped", handlePartnerSkipped);
    socket.on("skipped-partner", handlePartnerSkipped);
     socket.on("friend-request-received", ({ user }) => {
            setFriendRequestResponse(true);
          setUserData(user);
    toast(`Friend request from ${user.username}`);
  });

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("partner-skipped", handlePartnerSkipped);
      socket.off("skipped-partner", handlePartnerSkipped);
      socket.off("friend-request-received");
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
   
  // Always scroll to bottom when messages change
  const messagesEndRef = React.useRef(null);
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <div className="h-screen w-screen flex bg-gradient-to-tr from-gray-200 via-purple-200 to-yellow-100 p-0">
        <div>
          {friendRequestResponse && (
            <RequestPopUp
              user={userData}
            />
          )}
        </div>
        <div className="flex flex-col items-center justify-center w-1/2 
        max-w-2xl bg-white rounded-l-3xl shadow-2xl m-8">
          {
            !match && (
              <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
                <h1 className="text-2xl font-bold text-gray-800">Waiting for a match...</h1>
              </div>
            )
          }
          {match && <VideoPlayer />}
          <div className="flex items-center justify-center p-6 space-x-4">
            <button className="mt-4 font-bold px-4 py-2 rounded-full shadow-lg hover:opacity-80 transition"
              onClick={handleSkip}>
              <PiSkipForwardFill className="inline-block mr-2 text-3xl text-gray-700" />
            </button>
            {isfriend(match._id) ? (
              <span className="mt-4 px-2 py-2 rounded-full shadow-lg bg-green-100 flex items-center">
                <TiTick className="inline-block text-3xl text-green-600 mr-1" />
                <span className="text-green-700 font-semibold">Already a friend</span>
              </span>
            ) : (
              <button className="mt-4 font-bold px-2 py-2 rounded-full shadow-lg hover:opacity-80 transition cursor-pointer"
                onClick={sendFriendRequest}>
                <IoIosPersonAdd className="inline-block mr-2 text-3xl text-pink-700" />
              </button>
            )}
          </div>
        </div>
        <div className="relative flex flex-col w-1/2 max-w-2xl bg-white rounded-r-3xl shadow-2xl m-8 p-0">
          <div className="flex items-center justify-center py-6 border-b border-gray-200">
            <h2 className="font-bold text-xl text-gray-800">Text Chat</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-white via-pink-50 to-yellow-50 rounded-b-3xl">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.user === "me" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs ${msg.user === "me" ? "bg-gradient-to-br from-pink-400 to-yellow-400 text-white" : "bg-gray-100 text-gray-800"} px-4 py-2 rounded-2xl shadow ${msg.user === "me" ? "rounded-br-none" : "rounded-bl-none"}`}>
                  <p className="text-xs mb-1 font-semibold">
                    {msg.user === "me" ? "You" : msg.user.username}
                  </p>
                  {/* Show file if present */}
                  {msg.file && (
                    <div className="mb-2">
                      {msg.file.type.startsWith("image/") ? (
                        <img src={msg.file.url} alt="shared" className="max-h-40 rounded-lg" />
                      ) : (
                        <a
                          href={msg.file.url}
                          download={msg.file.name}
                          className="text-blue-500 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {msg.file.name}
                        </a>
                      )}
                    </div>
                  )}
                  <p className="break-words">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center px-6 py-4 border-t border-gray-200 bg-white rounded-b-3xl space-x-2">
            {/* Emoji Picker Button */}
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
                <div className="absolute bottom-12 left-0 z-10 bg-white border rounded shadow-lg p-4 max-h-60 w-64 overflow-y-auto grid grid-cols-8 gap-1">
                  {["😀","😂","😍","😎","😭","😡","👍","🙏","🎉","🥳","😅","🤔","😇","😜","😱","😏","😬","🤩","😤","😢","😃","😆","😉","😋","😝","😛","😚","😘","😗","😙","😐","😑","😶","🙄","😒","😓","😔","😕","😖","😞","😟","😠","😡","😢","😣","😤","😥","😦","😧","😨","😩","😪","😫","😬","😭","😮","😯","😰","😱","😲","😳","😴","😵","😶‍🌫️"].map((emoji) => (
                    <button
                      key={emoji}
                      className="text-xl hover:bg-gray-100 rounded"
                      onClick={() => {
                        setInput(input + emoji);
                        setShowEmoji(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* File Upload */}
            <FileShare />
            {/* Input Field */}
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
    </>
  );
};

export default ChatBox;
