import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import { BsCameraVideoFill, BsCameraVideoOff } from "react-icons/bs";
import { FaVolumeMute } from "react-icons/fa";
import { GiSpeaker } from "react-icons/gi";

const VideoPlayer = () => {
  const { socket, match } = useSocket();
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [isMicOn, setMicOn] = useState(true);
  const [isCamOn, setCamOn] = useState(true);
  const [callStartTime, setCallStartTime] = useState(null);
  const [duration, setDuration] = useState("00:00");

  // Call timer
  useEffect(() => {
    if (!callStartTime) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
      const min = String(Math.floor(elapsed / 60)).padStart(2, "0");
      const sec = String(elapsed % 60).padStart(2, "0");
      setDuration(`${min}:${sec}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStartTime]);

  useEffect(() => {
    if (!socket || !match?.socketId) return;

    // Check browser compatibility
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("🚫 Your browser doesn't support video/audio.");
      console.error("getUserMedia is not supported by this browser.");
      return;
    }

    let p;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (localRef.current) {
          localRef.current.srcObject = currentStream;
        }

        const initiator = String(socket.id) < String(match.socketId);
        console.log(`[Peer] This client is ${initiator ? "initiator" : "receiver"}`);

        p = new SimplePeer({
          initiator,
          trickle: false,
          stream: currentStream,
        });

        p.on("signal", (signal) => {
          console.log("[Signal] Sending to:", match.socketId, signal);
          socket.emit("signal", { to: match.socketId, signal });
        });

        p.on("stream", (remoteStream) => {
          console.log("[Stream] Received remote stream");
          if (remoteRef.current) {
            remoteRef.current.srcObject = remoteStream;
            remoteRef.current.onloadedmetadata = () => {
              remoteRef.current.play().catch((err) => {
                console.error("Autoplay error:", err);
                toast.error("🔇 Autoplay blocked. Click to unmute.");
              });
            };
          }
          setCallStartTime(Date.now());
          toast.success("📞 Call started");
        });

        p.on("close", () => {
          toast.error("📴 Call ended");
          setPeer(null);
          setCallStartTime(null);
          setDuration("00:00");
        });

        p.on("error", (err) => {
          console.error("Peer error:", err);
        });

        socket.on("signal", ({ from, signal }) => {
          if (from === match.socketId) {
            console.log("[Signal] Received from:", from, signal);
            p.signal(signal);
          }
        });

        socket.on("partner-disconnect", () => {
          toast.error("❌ Partner disconnected");
          p.destroy();
        });

        setPeer(p);
      })
      .catch((err) => {
        toast.error(`🚫 ${err.name}: ${err.message}`);
        console.error("getUserMedia error:", err);
      });

    return () => {
      p?.destroy();
      stream?.getTracks().forEach((t) => t.stop());
      socket.off("signal");
      socket.off("partner-disconnect");
      setStream(null);
      setPeer(null);
      setCallStartTime(null);
      setDuration("00:00");
    };
  }, [socket, match?.socketId]);

  const toggleMic = () => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
      toast(audioTrack.enabled ? "🎙️ Mic unmuted" : "🔇 Mic muted");
    }
  };

  const toggleCamera = () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
      toast(videoTrack.enabled ? "📷 Camera on" : "🚫 Camera off");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6 w-full bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-100 min-h-[60vh] rounded-2xl shadow-2xl border border-gray-100">
      <div className="relative w-full max-w-xl aspect-[4/5] rounded-3xl overflow-hidden bg-black shadow-xl border-4 border-white">
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-3xl"
        />
        <video
          ref={localRef}
          autoPlay
          muted
          playsInline
          className="absolute w-1/4 bottom-4 right-4 border-4 border-white rounded-xl shadow-lg object-cover"
        />
      </div>

      <div className="flex items-center gap-6 mt-4">
        <button
          onClick={toggleMic}
          className={`transition-all bg-white/80 hover:bg-pink-100 rounded-full p-3 shadow-lg border-2 border-pink-200 text-xl ${
            isMicOn ? "text-pink-500" : "text-gray-400"
          }`}
        >
          {isMicOn ? <GiSpeaker /> : <FaVolumeMute />}
        </button>
        <button
          onClick={toggleCamera}
          className={`transition-all bg-white/80 hover:bg-purple-100 rounded-full p-3 shadow-lg border-2 border-purple-200 text-xl ${
            isCamOn ? "text-purple-500" : "text-gray-400"
          }`}
        >
          {isCamOn ? <BsCameraVideoFill /> : <BsCameraVideoOff />}
        </button>
        <span className="text-lg font-semibold text-gray-700 bg-white/80 rounded-full px-3 py-1 shadow">
          {duration}
        </span>
      </div>
    </div>
  );
};

export default VideoPlayer;
