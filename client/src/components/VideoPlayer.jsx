import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import { BsCameraVideoFill, BsCameraVideoOff } from "react-icons/bs";
import { FaVolumeMute } from "react-icons/fa";
import { GiSpeaker } from "react-icons/gi";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

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

  // ICE candidate queueing for out-of-order arrival
  const remoteCandidatesQueue = useRef([]);

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

    let localStream, pc;
    let cleanupFns = [];

    let isOfferer = socket.id > match.socketId; // One is always offerer, one answerer

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(async (currentStream) => {
        localStream = currentStream;
        setStream(currentStream);
        if (localRef.current) {
          localRef.current.srcObject = currentStream;
        }

        pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Add all local tracks to the connection
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });

        // Set up ontrack handler
        pc.ontrack = (event) => {
          if (remoteRef.current) {
            remoteRef.current.srcObject = event.streams[0];
            setCallStartTime(Date.now());
            // toast.success("✅ Call connected!");
          }
        };

        // ICE candidate collection
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc-candidate", {
              to: match.socketId,
              candidate: event.candidate
            });
          }
        };

        // Only the offerer creates and sends the offer
        if (isOfferer) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-offer", { to: match.socketId, offer });
        }

        // --- Signaling event handlers with state checks and candidate queueing ---
        const handleOffer = async ({ from, offer }) => {
          if (from !== match.socketId) return;
          if (pc.signalingState !== "stable") {
            console.warn("Offer ignored: Not in 'stable' state.", pc.signalingState);
            return;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc-answer", { to: match.socketId, answer });

          // Apply any queued ICE candidates
          remoteCandidatesQueue.current.forEach(candidate =>
            pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {})
          );
          remoteCandidatesQueue.current = [];
        };

        const handleAnswer = async ({ from, answer }) => {
          if (from !== match.socketId) return;
          if (pc.signalingState !== "have-local-offer") {
            console.warn("Answer ignored: Not in 'have-local-offer' state.", pc.signalingState);
            return;
          }
          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          // Apply any queued ICE candidates
          remoteCandidatesQueue.current.forEach(candidate =>
            pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {})
          );
          remoteCandidatesQueue.current = [];
        };

        const handleCandidate = async ({ from, candidate }) => {
          if (from !== match.socketId) return;
          if (!pc.remoteDescription || !pc.remoteDescription.type) {
            // Queue until remoteDescription is set
            remoteCandidatesQueue.current.push(candidate);
          } else {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              // ignore duplicate/invalid candidates
            }
          }
        };

        const handlePartnerDisconnect = () => {
          toast.error("❌ Your partner has disconnected.");
          pc.close();
        };

        socket.on("webrtc-offer", handleOffer);
        socket.on("webrtc-answer", handleAnswer);
        socket.on("webrtc-candidate", handleCandidate);
        socket.on("partner-disconnect", handlePartnerDisconnect);

        cleanupFns = [
          () => socket.off("webrtc-offer", handleOffer),
          () => socket.off("webrtc-answer", handleAnswer),
          () => socket.off("webrtc-candidate", handleCandidate),
          () => socket.off("partner-disconnect", handlePartnerDisconnect),
        ];

        // Clean up
        return () => {
          pc.close();
          localStream?.getTracks().forEach(track => track.stop());
          cleanupFns.forEach(fn => fn());
          setStream(null);
          pcRef.current = null;
          setCallStartTime(null);
          setDuration("00:00");
          if (localRef.current) localRef.current.srcObject = null;
          if (remoteRef.current) remoteRef.current.srcObject = null;
        };
      })
      .catch((err) => {
        if (err.name === "NotAllowedError") {
          toast.error("🚫 Camera/Mic access denied. Please enable permissions in your browser.");
        } else {
          toast.error(`🚫 Error accessing camera/mic: ${err.message}`);
        }
      });

    // Unmount effect: forcibly clean up
    return () => {
      try { pc && pc.close(); } catch {}
      try { localStream && localStream.getTracks().forEach(t => t.stop()); } catch {}
      cleanupFns.forEach(fn => fn());
      setStream(null);
      pcRef.current = null;
      setCallStartTime(null);
      setDuration("00:00");
      if (localRef.current) localRef.current.srcObject = null;
      if (remoteRef.current) remoteRef.current.srcObject = null;
    };

  }, [socket, match?.socketId]);

  const toggleMic = () => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
      // toast(audioTrack.enabled ? "🎙️ Mic is ON" : "🔇 Mic is OFF");
    }
  };

  const toggleCamera = () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
      // toast(videoTrack.enabled ? "📷 Camera is ON" : "🚫 Camera is OFF");
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
          onClick={() => remoteRef.current?.play().catch(() => {})}
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
          aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
        >
          {isMicOn ? <GiSpeaker /> : <FaVolumeMute />}
        </button>
        <button
          onClick={toggleCamera}
          className={`transition-all bg-white/80 hover:bg-purple-100 rounded-full p-3 shadow-lg border-2 border-purple-200 text-xl ${
            isCamOn ? "text-purple-500" : "text-gray-400"
          }`}
          aria-label={isCamOn ? "Turn off camera" : "Turn on camera"}
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