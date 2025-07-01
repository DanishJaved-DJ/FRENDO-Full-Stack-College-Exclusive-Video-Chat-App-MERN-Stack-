import React from "react";
import { useSocket } from "../context/SocketContext";
import MatchModal from "../components/MatchModal.jsx";
import ChatBox from "../components/ChatBox.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import { TiTick } from "react-icons/ti";
import { toast } from "sonner";

const Home = () => {
  const { socket, match } = useSocket();
  const [loading, setLoading] = React.useState(true);
  const [isAccepted, setIsAccepted] = React.useState(false);
  const [isPartnerAccepted, setIsPartnerAccepted] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (match) {
      setLoading(false);
    }
  }, [match]);

  const handleAccept = () => {
    socket?.emit("request-accept");
    setIsAccepted(true);
  };

  React.useEffect(() => {
    const partnerAcceptedHandler = ({ user }) => {
      setIsPartnerAccepted(true);
    };
    socket.on("partner-accepted", partnerAcceptedHandler);
    return () => socket.off("partner-accepted", partnerAcceptedHandler);
  }, [socket]);

  const handleDecline = () => {
    socket?.emit("request-decline");
    setLoading(true);
  };

  const handleStop = () => {
    socket?.emit("exit");
  };

  const handleEnd = () => {
    socket?.emit("leave-queue");
    setLoading(true);
  };

  React.useEffect(() => {
    if (isAccepted && isPartnerAccepted) {
      setTimeout(() => navigate("/chatting"), 1200);
    }
  }, [isAccepted, isPartnerAccepted, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-pink-200 via-purple-200 to-yellow-100 font-sans transition-all duration-700">
      <h1 className="text-4xl font-extrabold text-gray-900 m-8 tracking-tight drop-shadow-2xl transition-all duration-500">
        FRENDO Matchmaking..
      </h1>
      <div className="flex flex-1 items-center justify-center w-full h-full gap-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 w-64">
            <div className="animate-spin rounded-full h-32 w-32 border-8 border-pink-400 border-t-transparent shadow-2xl"></div>
          </div>
        ) : (
          match && (
            <div
              className={`w-full max-w-3xl h-full rounded-3xl flex gap-8 justify-center p-10 shadow-2xl border border-gray-200 transition-all duration-700
                backdrop-blur-lg bg-white/40 hover:bg-white/60
                ${
                  isAccepted && isPartnerAccepted
                    ? "bg-gradient-to-br from-green-200/80 to-green-100/80"
                    : isAccepted
                    ? "bg-gradient-to-br from-blue-200/80 to-blue-100/80"
                    : isPartnerAccepted
                    ? "bg-gradient-to-br from-yellow-200/80 to-yellow-100/80"
                    : "bg-white/40"
                }
                hover:scale-105
              `}
              style={{
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <img
                src={
                  match?.user?.avatarUrl ||
                  `https://i.pravatar.cc/150?u=${match?.user?.username || "default"}`
                }
                alt={match?.user?.username}
                className={`rounded-full border-4 w-48 h-48 object-cover shadow-xl transition-all duration-700
                  ${
                    isAccepted && isPartnerAccepted
                      ? "border-green-400 animate-pulse"
                      : isAccepted
                      ? "border-blue-400 animate-pulse"
                      : isPartnerAccepted
                      ? "border-yellow-400 animate-pulse"
                      : "border-gradient-to-tr from-pink-400 via-yellow-400 to-purple-400"
                  }
                  hover:scale-105
                `}
                style={{
                  transition: "box-shadow 0.5s, border-color 0.5s, transform 0.3s",
                }}
              />
              <div className="flex flex-col justify-center bg-white/70 rounded-2xl p-8 shadow-lg transition-all duration-500">
                <div className="flex text-xl font-semibold gap-2 mb-4">
                  <span className="text-pink-500 font-bold text-2xl text-center">{match?.user?.username}</span>
                </div>
                <div className="flex text-lg font-medium gap-2 mb-2">
                  <span className="text-gray-700">I Speak:</span>
                  <span className="text-purple-500">hindi/English</span>
                </div>
                <div className="flex text-lg font-medium gap-2">
                 <div>
              <span className="font-semibold ">Hobbies:</span>
              <span className="ml-2 text-gray-700">
                {match?.user?.hobbies && match?.user?.hobbies.length > 0 ? (
                  <div className="flex flex-col gap-1 mt-2">
                    {match?.user?.hobbies.map((hobby, idx) => (
                      <div key={idx} className="bg-blue-100 rounded px-2 py-1  font-semibold uppercase text-[#d75c28] w-fit">
                        {hobby}
                      </div>
                    ))}
                  </div>
                ) : 'N/A'}
              </span>
            </div>
                </div>
                {(isAccepted || isPartnerAccepted) && (
                  <div className="mt-4">
                    {isAccepted && !isPartnerAccepted && (
                      <span className="text-blue-700 font-bold animate-pulse">You accepted. Waiting for partner...</span>
                    )}
                    {isPartnerAccepted && !isAccepted && (
                      <span className="text-yellow-700 font-bold animate-pulse">Partner accepted. Waiting for you...</span>
                    )}
                    {isAccepted && isPartnerAccepted && (
                      <span className="text-green-700 font-bold animate-bounce">Both accepted! Redirecting...</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
      {match && (
        <div className="flex gap-6 mt-8">
          <button
            className={`bg-gradient-to-r from-green-700 to-green-400 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all duration-300
              hover:from-pink-500 hover:to-yellow-500 hover:scale-105 active:scale-95
              ${isAccepted ? "opacity-70 cursor-not-allowed" : ""}
            `}
            onClick={handleAccept}
            disabled={isAccepted}
          >
            <TiTick className="inline-block mr-2 text-xl" />
            {isAccepted ? "Accepted" : "Accept"}
          </button>
          <button
            className={`bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 px-8 py-3 rounded-full font-bold shadow-md transition-all duration-300
              hover:from-gray-400 hover:to-gray-500 hover:scale-105 active:scale-95
              ${isAccepted ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={handleDecline}
            disabled={isAccepted}
          >
            <FaArrowRight className="inline-block mr-2" />
            Decline
          </button>
        </div>
      )}
      <Link
        to="/home"
        className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-12 py-4 rounded-full mt-10 cursor-pointer hover:from-pink-500 hover:to-yellow-500 transition-all duration-300 font-bold shadow-lg tracking-wide hover:scale-105 active:scale-95"
        onClick={handleEnd}
      >
        STOP
      </Link>
    </div>
  );
};

export default Home;
