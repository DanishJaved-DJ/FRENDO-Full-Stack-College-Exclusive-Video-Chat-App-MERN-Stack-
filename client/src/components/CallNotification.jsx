import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

const CallNotification = ({ user, acceptCall, rejectCall }) => {
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (!user) return;

    setVisible(true);
    setShow(true);

    const fadeOut = setTimeout(() => setShow(false), 9500);
    const hide = setTimeout(() => setVisible(false), 10000);

    return () => {
      clearTimeout(fadeOut);
      clearTimeout(hide);
    };
  }, [user]);

  if (!visible || !user) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] transition-transform duration-500 ease-in-out ${
        show ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
      }`}
      style={{ pointerEvents: "none" }}
    >
      <div
        className="bg-white border border-gray-200 rounded-xl shadow-xl px-6 py-4 flex flex-col gap-2 w-80"
        style={{
          pointerEvents: "auto",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-lg">
            {user?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="font-semibold text-gray-900">{user?.username}</span>
        </div>
        <div className="text-gray-700 text-sm mb-3">Incoming call...</div>
        <div className="flex gap-2">
          <button
            className="flex-1 bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-400 text-white font-semibold py-2 rounded-lg shadow hover:opacity-90 transition"
            onClick={() => {
              acceptCall();
              setVisible(false);
            }}
          >
            Confirm
          </button>
          <button
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition"
            onClick={() => {
              rejectCall();
              setVisible(false);
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
