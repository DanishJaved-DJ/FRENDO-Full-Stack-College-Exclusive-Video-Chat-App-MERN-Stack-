import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import Api from "../serverApi/Api";
import { TbFriends, TbPhoneCall } from "react-icons/tb";
import { toast } from "sonner";
import CallNotification from "./CallNotification";
import { useNavigate } from "react-router-dom";
import { useContext } from 'react';
import Context from '../context/Context';
import { useSelector } from 'react-redux';
import ViewFriendProfile from "./ViewFriendProfile"; 


const FriendList = () => {
  const { onlineUsers, socket } = useSocket();
  const [friends, setFriends] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(null);
  const navigate = useNavigate();

   const context = useContext(Context);
    const user = useSelector((state) => state?.user?.user);

    const handleCall = (friendUserId) => {
  socket.emit("friend-call", { to: friendUserId });
  setIsCalling(true);
};

useEffect(() => {
  if (!socket) return;

  socket.on("incoming-friend-call", ({ from, user }) => {
    setIncomingCall({ from, user });
  });

  socket.on("friend-call-rejected", ({ user }) => {
    toast.error(`${user.username} rejected your call`);
  });

  socket.on("friend-call-timeout", ({ message }) => {
    toast.error(message || "Call timed out");
  });

  socket.on("match-confirmed", ({ partner }) => {
    toast.success(`Matched with ${partner.username}`);
    context.setPartner(partner);
    navigate("/chatting");
  });

  return () => {
    socket.off("incoming-friend-call");
    socket.off("friend-call-rejected");
    socket.off("friend-call-timeout");
    socket.off("match-confirmed");
  };
}, [socket]);

const acceptCall = () => {
  socket.emit("accept-friend-call", { from: incomingCall.from });
  setIncomingCall(null);
};

const rejectCall = () => {
  socket.emit("reject-friend-call", { from: incomingCall.from });
  setIncomingCall(null);
};


  useEffect(() => {
    const fetchFriends = async () => {
      const res = await fetch(Api.getFriends.url, {
        method: Api.getFriends.method,
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.token}` },
      });
      const data = await res.json();
      setFriends(data.friendsList.accepted);
    };
    fetchFriends();
  }, []);
  
  return (
    <div className="relative h-full">
      {incomingCall && (
        <CallNotification
          user={incomingCall.user}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
        />
      )}
      {incomingCall && (
        <div className="fixed bottom-4 right-4 z-50">
          <CallNotification
            user={user}
            acceptCall={acceptCall}
            rejectCall={rejectCall}
          />
        </div>
      )}
      <div>
        <div className="flex items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-pink-100 via-purple-100 to-yellow-100">
          <TbFriends className="text-3xl text-pink-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Friends</h2>
        </div>
        <ul className="h-full divide-y divide-gray-100">
          {friends.length === 0 && (
            <div className="flex flex-col items-center py-12">
              <TbFriends className="text-8xl opacity-35 text-gray-300 mb-4" />
              <li className="text-center text-gray-400 text-lg font-medium">No friends found</li>
            </div>
          )}
          {friends.map((friend) => {
            const isOnline = onlineUsers.some((u) => String(u._id) === String(friend.user._id));
            return (
              <>
              <li
              key={friend.user._id}
              className={`flex items-center px-6 py-4 hover:bg-gray-50 transition group ${!isOnline ? "opacity-50" : ""}`}
              >
              <div className="relative mr-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-yellow-400 p-1">
                <img
                src={friend.user.avatarUrl || `https://ui-avatars.com/api/?name=${friend.user.username}`}
                alt={friend.user.username}
                className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <span
                className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-white ${
                isOnline ? "bg-green-400" : "bg-gray-300"
                }`}
              ></span>
              </div>
              <div className="flex-1">
              <span
                className="block font-semibold text-gray-800 group-hover:text-pink-500 transition cursor-pointer hover:underline"
                onClick={() => setShowFriendProfile(friend.user)}
              >
                {friend.user.username}
              </span>
              <span className="text-xs text-gray-400">
                {isOnline ? "Online" : "Offline"}
              </span>
              </div>
              {isOnline && (
              <button
                className="ml-4 p-2 rounded-full hover:bg-pink-100 transition text-pink-500"
                onClick={() => {
                  handleCall(friend.user._id);
                  toast.success(`Calling ${friend.user.username}`);
                  setTimeout(() => setIsCalling(false), 10000);
                }}
                disabled={isCalling}
              >
                {isCalling ? (
                <span className="animate-pulse flex items-center">
                <TbPhoneCall className="text-2xl animate-spin-slow" />
                <span className="ml-2 text-sm font-medium text-pink-500"
                >Calling...</span>
                </span>
                ) : (
                <TbPhoneCall className="text-2xl" />
                )}
              </button>
              )}
              </li>
              {showFriendProfile && showFriendProfile._id === friend.user._id && (
              <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
              onClick={() => setShowFriendProfile(null)}
              >
              <div
                className="bg-white rounded-lg shadow-lg p-6 relative"
                onClick={e => e.stopPropagation()}
              >
                <ViewFriendProfile user={friend.user} />
              </div>
              </div>
              )}
              </>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default FriendList;
