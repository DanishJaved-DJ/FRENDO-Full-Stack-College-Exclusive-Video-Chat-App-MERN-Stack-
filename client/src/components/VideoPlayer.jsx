import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import { BsCameraVideoFill, BsCameraVideoOff } from "react-icons/bs";
import { FaVolumeMute } from "react-icons/fa";
import { GiSpeaker } from "react-icons/gi";

const ICE_SERVERS = { iceServers: [] }; // Add STUN/TURN later if needed

const MAX_MEDIA_ATTEMPTS = 5;

const VideoPlayerRaw = () => {
  const { socket, match } = useSocket();
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pcRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isMicOn, setMicOn] = useState(true);
  const [isCamOn, setCamOn] = useState(true);
  const [callStartTime, setCallStartTime] = useState(null);
  const [duration, setDuration] = useState("00:00");
  const remoteCandidatesQueue = useRef([]);

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

    let localStream;
    let pc;
    let isCancelled = false;

    const getMediaStream = async () => {
      let attempts = 0;
      while (attempts < MAX_MEDIA_ATTEMPTS) {
        try {
          return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (err) {
          attempts++;
          console.warn(`🎥 Media attempt ${attempts} failed: ${err.name}`);
          if (attempts >= MAX_MEDIA_ATTEMPTS) throw err;
          await new Promise(res => setTimeout(res, 500));
        }
      }
    };

    const start = async () => {
      try {
        pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        localStream = await getMediaStream();
        if (isCancelled) {
          localStream.getTracks().forEach(t => t.stop());
          return;
        }

        setStream(localStream);
        if (localRef.current) localRef.current.srcObject = localStream;
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        pc.ontrack = (event) => {
          if (remoteRef.current) {
            remoteRef.current.srcObject = event.streams[0];
            setCallStartTime(Date.now());
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && socket && match?.socketId) {
            socket.emit("webrtc-ice-candidate", {
              to: match.socketId,
              candidate: event.candidate,
            });
          }
        };

        const isOfferer = socket.id > match.socketId;
        if (isOfferer && pc.signalingState !== "closed") {
          const offer = await pc.createOffer();
          if (pc.signalingState === "closed") return;
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-offer", { to: match.socketId, offer });
        }

        // === SIGNALING HANDLERS ===
        const handleOffer = async ({ from, offer }) => {
          if (from !== match.socketId || !pc || pc.signalingState === "closed") return;
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          if (pc.signalingState === "closed") return;
          await pc.setLocalDescription(answer);
          socket.emit("webrtc-answer", { to: match.socketId, answer });

          for (const cand of remoteCandidatesQueue.current) {
            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
          remoteCandidatesQueue.current = [];
        };

        const handleAnswer = async ({ from, answer }) => {
          if (from !== match.socketId || !pc || pc.signalingState === "closed") return;
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          for (const cand of remoteCandidatesQueue.current) {
            await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
          remoteCandidatesQueue.current = [];
        };

        const handleCandidate = async ({ from, candidate }) => {
          if (from !== match.socketId || !pc) return;
          if (!pc.remoteDescription || !pc.remoteDescription.type) {
            remoteCandidatesQueue.current.push(candidate);
          } else {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
          }
        };

        const handleDisconnect = () => {
          toast.error("❌ Partner disconnected.");
          pc.close();
        };

        socket.on("webrtc-offer", handleOffer);
        socket.on("webrtc-answer", handleAnswer);
        socket.on("webrtc-ice-candidate", handleCandidate);
        socket.on("partner-disconnect", handleDisconnect);

        return () => {
          socket.off("webrtc-offer", handleOffer);
          socket.off("webrtc-answer", handleAnswer);
          socket.off("webrtc-ice-candidate", handleCandidate);
          socket.off("partner-disconnect", handleDisconnect);
        };
      } catch (err) {
        toast.error("🚫 Media access / start error: " + err.message);
        console.error("Media access / start error:", err);
      }
    };

    const cleanup = () => {
      isCancelled = true;
      try { pc && pc.close(); } catch {}
      try { localStream?.getTracks().forEach(t => t.stop()); } catch {}
      setStream(null);
      setDuration("00:00");
      setCallStartTime(null);
      if (localRef.current) localRef.current.srcObject = null;
      if (remoteRef.current) remoteRef.current.srcObject = null;
      pcRef.current = null;
    };

    start();
    return cleanup;

  }, [socket, match?.socketId]);

  const toggleMic = () => {
    const audioTrack = stream?.getAudioTracks?.()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    const videoTrack = stream?.getVideoTracks?.()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
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

export default VideoPlayerRaw;
