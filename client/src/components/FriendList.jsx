import { useSocket } from "../context/SocketContext";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TbFriends, TbPhoneCall } from "react-icons/tb";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import CallNotification from "./CallNotification";
import Context from "../context/Context";
import Api from "../serverApi/Api";
import { useSelector } from "react-redux";
import ViewFriendProfile from "./ViewFriendProfile";

const FriendList = () => {
  const { socket, onlineUsers } = useSocket();
  const [friends, setFriends] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showFriendProfile, setShowFriendProfile] = useState(null);
  const [callingTo, setCallingTo] = useState(null);
  const navigate = useNavigate();
  const context = useContext(Context);
  const user = useSelector((state) => state?.user?.user);

  // 📞 Start call
  const handleCall = (friendUserId, friendName) => {
    if (callingTo) return;
    socket.emit("friend-call", { to: friendUserId });
    setCallingTo(friendUserId);
    toast.success(`Calling ${friendName}...`);
  };

  // ✅ Accept incoming call
  const acceptCall = () => {
    if (!incomingCall) return;
    socket.emit("accept-friend-call", { from: incomingCall.from });
    setIncomingCall(null);
  };

  // ❌ Reject incoming call
  const rejectCall = () => {
    if (!incomingCall) return;
    socket.emit("reject-friend-call", { from: incomingCall.from });
    setIncomingCall(null);
  };

  // 🔌 Listen to socket events
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ from, user }) => {
      setIncomingCall({ from, user });
    };

    const handleRejected = ({ user }) => {
      toast.error(`${user.username} rejected your call`);
      setCallingTo(null);
    };

    const handleTimeout = ({ message }) => {
      toast.error(message || "Call timed out");
      setCallingTo(null);
    };

    const handleMatched = ({ partner }) => {
      toast.success(`Matched with ${partner.username}`);
      navigate("/chatting"); // ✅ navigate both caller & receiver
      setCallingTo(null);
    };

    socket.on("incoming-friend-call", handleIncomingCall);
    socket.on("friend-call-rejected", handleRejected);
    socket.on("friend-call-timeout", handleTimeout);
    socket.on("match-confirmed", handleMatched);

    return () => {
      socket.off("incoming-friend-call", handleIncomingCall);
      socket.off("friend-call-rejected", handleRejected);
      socket.off("friend-call-timeout", handleTimeout);
      socket.off("match-confirmed", handleMatched);
    };
  }, [socket, context, navigate]);

  // 📦 Fetch friend list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch(Api.getFriends.url, {
          method: Api.getFriends.method,
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.token}` },
        });
        const data = await res.json();
        setFriends(data.friendsList.accepted || []);
      } catch (err) {
        console.error("Failed to fetch friends:", err);
      }
    };
    fetchFriends();
  }, []);

  return (
    <div className="relative h-full">
      {/* Incoming call notification */}
      {incomingCall && (
        <div className="fixed bottom-4 right-4 z-50">
          <CallNotification
            user={incomingCall.user}
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
          {friends.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <TbFriends className="text-8xl opacity-35 text-gray-300 mb-4" />
              <li className="text-center text-gray-400 text-lg font-medium">No friends found</li>
            </div>
          ) : (
            friends.map((friend) => {
              const friendId = String(friend.user._id);
              // ✅ Check if friend is online by comparing userId
              const isOnline = onlineUsers.some((u) => String(u.userId) === friendId);
              const isBeingCalled = callingTo === friendId;

              return (
                <li
                  key={friendId}
                  className={`flex items-center px-6 py-4 hover:bg-gray-50 transition group ${
                    !isOnline ? "opacity-50" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative mr-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-yellow-400 p-1">
                      <img
                        src={friend.user.avatarUrl || `https://ui-avatars.com/api/?name=${friend.user.username}`}
                        alt={friend.user.username}
                        className="w-full h-full rounded-full object-cover bg-white"
                      />
                    </div>
                    {/* Online status dot */}
                    <span
                      className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? "bg-green-400" : "bg-gray-300"
                      }`}
                    />
                  </div>

                  {/* Username */}
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

                  {/* Call button */}
                  {isOnline && (
                    <button
                      className="ml-4 p-2 rounded-full hover:bg-pink-100 transition text-pink-500"
                      onClick={() => handleCall(friend.user._id, friend.user.username)}
                      disabled={isBeingCalled}
                    >
                      {isBeingCalled ? (
                        <span className="animate-pulse flex items-center">
                          <FaSpinner className="text-xl animate-spin" />
                          <span className="ml-2 text-sm font-medium">Calling...</span>
                        </span>
                      ) : (
                        <TbPhoneCall className="text-2xl" />
                      )}
                    </button>
                  )}

                  {/* View profile modal */}
                  {showFriendProfile && showFriendProfile._id === friend.user._id && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
                      onClick={() => setShowFriendProfile(null)}
                    >
                      <div
                        className="bg-white rounded-lg shadow-lg p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ViewFriendProfile user={friend.user} />
                      </div>
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default FriendList;
