import React, { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Volume2,
  Sparkles,
  Users,
  MessageSquare,
  Globe,
  Radio,
  AlertCircle,
  Play,
} from "lucide-react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/room")({
  head: () => ({
    meta: [
      { title: "Live Meeting — LinguaLive AI" },
      { name: "description", content: "Real-time multilingual WebRTC video meeting with AI voice translation." },
    ],
  }),
  component: LiveMeetingRoom,
});

const supportedLanguages = [
  { name: "Telugu", flag: "🇮🇳" },
  { name: "English", flag: "🇬BW" },
  { name: "German", flag: "🇩🇪" },
  { name: "French", flag: "🇫🇷" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "Hindi", flag: "🇮🇳" },
  { name: "Tamil", flag: "🇮🇳" },
  { name: "Kannada", flag: "🇮🇳" },
  { name: "Japanese", flag: "🇯🇵" },
];

function LiveMeetingRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const search = useSearch({ strict: false });
  const roomId = search?.id || "276-243-823";

  const [listeningLanguage, setListeningLanguage] = useState(user?.listeningLanguage || "Telugu");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const [socket, setSocket] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [role, setRole] = useState("PARTICIPANT"); // "HOST" or "PARTICIPANT"
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Pipeline Status State Machine
  const [aiStatus, setAiStatus] = useState({
    status: "LISTENING",
    message: "🎤 Listening for speech...",
  });

  const [translatedLogs, setTranslatedLogs] = useState([]);

  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);

  // Step 0: Fetch Scoped Room Info & Role Permissions from Backend
  useEffect(() => {
    async function fetchRoomDetails() {
      try {
        const res = await fetch(`http://localhost:5000/api/meetings/room-info/${roomId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setRole(data.role || "PARTICIPANT");
          setRoomInfo(data.meeting);
        }
      } catch (err) {
        console.error("Error fetching room info:", err);
      }
    }

    async function startMeetingOnJoin() {
      try {
        await fetch("http://localhost:5000/api/meetings/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ meetingId: roomId, listeningLanguage }),
        });
      } catch (e) {
        console.error("Error starting meeting on room join:", e);
      }
    }

    fetchRoomDetails();
    startMeetingOnJoin();

    // Autoplay Unlock Gesture Listener
    const unlockAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      setAutoplayBlocked(false);
    };

    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, [roomId, listeningLanguage]);

  // Step 1: Real Microphone Initialization & Diagnostics
  useEffect(() => {
    async function setupMedia() {
      try {
        console.log("[Mic] Requesting microphone permission...");
        setAiStatus({ status: "MIC_REQUESTING", message: "🎤 Requesting microphone permission..." });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        mediaStreamRef.current = stream;

        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        if (audioTracks.length > 0) {
          const track = audioTracks[0];
          console.log("[Mic] Permission granted");
          console.log(`[Mic] Audio tracks: ${audioTracks.length}`);
          console.log(`[Mic] Track state: ${track.readyState}`);
          console.log(`[Mic] Track enabled: ${track.enabled}`);
          console.log("[Mic] Microphone initialized successfully");

          if (track.readyState === "live" && track.enabled) {
            setAiStatus({ status: "LISTENING", message: "🎤 Listening for speech..." });
          } else {
            console.error("[Mic] ERROR: Track inactive or muted");
            setAiStatus({ status: "ERROR", message: "⚠️ Microphone unavailable" });
          }
        } else {
          console.error("[Mic] ERROR: No audio track found in stream");
          setAiStatus({ status: "ERROR", message: "⚠️ No microphone found" });
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(`[Mic] ERROR: ${err.name} - ${err.message}`);

        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setAiStatus({ status: "ERROR", message: "⚠️ Microphone permission denied" });
        } else if (err.name === "NotFoundError") {
          setAiStatus({ status: "ERROR", message: "⚠️ Microphone device not found" });
        } else {
          setAiStatus({ status: "ERROR", message: `⚠️ Mic error: ${err.message}` });
        }
      }
    }

    setupMedia();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Step 2: Setup Socket.IO Connection & Signal Handlers
  useEffect(() => {
    const s = io("http://localhost:5000", { credentials: true });
    socketRef.current = s;
    setSocket(s);

    console.log("[Socket] 🔗 Connecting to backend...");

    s.on("connect", () => {
      console.log("[Socket] ✅ Connected to server. Emitting join-room...");
      s.emit("join-room", {
        roomId,
        userId: user?.id || socketRef.current?.id || "usr_guest",
        userName: user?.name || "Participant",
        listeningLanguage,
      });
    });

    s.on("room-participants-updated", (list) => {
      setParticipants(list);
    });

    s.on("ai-translation-status", (data) => {
      console.log("[Socket] 🤖 Pipeline Status:", data.status, "-", data.message);
      setAiStatus(data);
    });

    s.on("translated-speech-delivered", (data) => {
      console.log("[TTS] Audio generated for:", data.targetListeningLanguage);
      console.log("[TTS] Speaking:", data.translatedText);

      const newLog = {
        id: Math.random().toString(36).substring(2, 9),
        senderName: data.senderName,
        speakerLanguage: data.speakerLanguage || "English",
        originalTranscript: data.originalTranscript,
        translatedText: data.translatedText,
        targetListeningLanguage: data.targetListeningLanguage,
        audioBase64: data.audioBase64,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setTranslatedLogs((prev) => [newLog, ...prev]);

      // Autoplay translated audio
      if (data.audioBase64) {
        try {
          const audioUrl = `data:${data.mimeType || "audio/mp3"};base64,${data.audioBase64}`;
          const audio = new Audio(audioUrl);
          audio.volume = 0.9;

          setAiStatus({ status: "PLAYING", message: "🔊 Playing translated audio..." });

          audio.play()
            .then(() => {
              console.log("[TTS] ✅ Audio playback started");
              setAutoplayBlocked(false);
            })
            .catch((e) => {
              console.warn("[TTS] ❌ Autoplay blocked by browser policy:", e.message);
              setAutoplayBlocked(true);
            });

          audio.onended = () => {
            setAiStatus({ status: "LISTENING", message: "🎤 Listening for speech..." });
          };
        } catch (err) {
          console.error("[TTS] Failed to play audio:", err);
        }
      }
    });

    return () => {
      s.disconnect();
    };
  }, [roomId, user, listeningLanguage]);

  // Step 3: Audio MediaRecorder Capture Loop
  useEffect(() => {
    if (!socket || !mediaStreamRef.current || !isMicOn) return;

    const audioTracks = mediaStreamRef.current.getAudioTracks();
    if (audioTracks.length === 0 || !audioTracks[0].enabled) return;

    let intervalId = null;

    try {
      const audioStream = new MediaStream();
      audioTracks.forEach((track) => audioStream.addTrack(track));

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(audioStream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (!event.data || event.data.size === 0 || !isMicOn) return;

        if (!socketRef.current) return;

        const reader = new FileReader();
        reader.readAsDataURL(event.data);
        reader.onloadend = () => {
          const base64Data = reader.result.split(",")[1];
          if (base64Data && base64Data.length > 500) {
            console.log("[STT] Sending audio chunk...");
            socketRef.current.emit("speech-audio-chunk", {
              roomId,
              audioBase64: base64Data,
              mimeType,
            });
          }
        };
      };

      mediaRecorder.start();

      intervalId = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          try {
            mediaRecorderRef.current.stop();
            if (isMicOn) mediaRecorderRef.current.start();
          } catch (err) {}
        }
      }, 3000);
    } catch (err) {
      console.error("[MediaRecorder] Setup error:", err);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
    };
  }, [socket, isMicOn, roomId]);

  const handleLanguageChange = (newLang) => {
    setListeningLanguage(newLang);
    if (socketRef.current) {
      console.log("[Language] Target listening language changed to:", newLang);
      socketRef.current.emit("change-listening-language", { roomId, listeningLanguage: newLang });
    }
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const nextState = !isMicOn;
        audioTrack.enabled = nextState;
        setIsMicOn(nextState);

        if (!nextState) {
          console.log("[Mic] Track enabled: false (Muted)");
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            try {
              mediaRecorderRef.current.stop();
            } catch (e) {}
          }
          setAiStatus({ status: "MUTED", message: "🔇 Microphone muted" });
        } else {
          console.log("[Mic] Track enabled: true (Listening)");
          setAiStatus({ status: "LISTENING", message: "🎤 Listening for speech..." });
        }
      }
    }
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const handleTestSpeech = (sampleText) => {
    if (socketRef.current) {
      console.log("[TestSpeech] Emitting prompt:", sampleText);
      setAiStatus({ status: "PROCESSING", message: "✨ Processing test speech prompt..." });
      socketRef.current.emit("speech-audio-chunk", {
        roomId,
        textPrompt: sampleText,
      });
    }
  };

  const handleLeaveOrEndMeeting = async () => {
    try {
      const endpoint = role === "HOST" ? "http://localhost:5000/api/meetings/end" : "http://localhost:5000/api/meetings/end";
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ meetingId: roomId }),
      });
    } catch (e) {
      console.error("Error leaving room:", e);
    }
    navigate({ to: "/meetings" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 px-6 py-3.5 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
            <Radio size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm text-slate-100">LinguaLive AI Room</h1>
              {role === "HOST" && (
                <span className="rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  HOST
                </span>
              )}
            </div>
            {role === "HOST" ? (
              <p className="text-[11px] font-mono text-slate-400">
                ID: #{roomId} {roomInfo?.hostName ? `• Host: ${roomInfo.hostName}` : ""}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 font-medium">Real-Time Multilingual Translation Active</p>
            )}
          </div>
        </div>

        {/* Header Right: Language Selector & Leave/End Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
            <Globe size={14} className="text-blue-400 shrink-0" />
            <span className="text-slate-400 font-medium hidden sm:inline">I want to hear:</span>
            <select
              value={listeningLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent font-bold text-blue-400 focus:outline-none cursor-pointer text-xs"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.name} value={lang.name} className="bg-slate-900 text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLeaveOrEndMeeting}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
              role === "HOST"
                ? "bg-red-600 shadow-red-500/20 hover:bg-red-700"
                : "bg-slate-800 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            <PhoneOff size={14} />
            {role === "HOST" ? "End Meeting" : "Leave Meeting"}
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 p-4 md:p-6 gap-6 overflow-hidden">
        {/* Left Side: Video Cards & Pipeline Status (2 Cols) */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          {/* Participant Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {/* Local User Video */}
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800/90 overflow-hidden min-h-[260px] flex items-center justify-center group shadow-xl">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  isVideoOn ? "opacity-100" : "opacity-0"
                }`}
              />

              {!isVideoOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-500 space-y-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-2xl font-bold text-slate-300">
                    {(user?.name || "P").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Camera Off</span>
                </div>
              )}

              {/* User Label Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-slate-950/70 backdrop-blur-md px-3 py-1.5 text-xs text-white border border-white/10">
                <span className="font-bold flex items-center gap-1.5 truncate">
                  {user?.name || "You"} (You)
                </span>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-500/20 text-blue-300 px-2 py-0.5 text-[10px] font-bold border border-blue-400/30">
                    🎧 {listeningLanguage}
                  </span>
                  {isMicOn ? (
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  ) : (
                    <MicOff size={13} className="text-red-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Remote Participants or Waiting State */}
            {participants.filter((p) => p.socketId !== socket?.id).length > 0 ? (
              participants
                .filter((p) => p.socketId !== socket?.id)
                .map((p, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-3xl bg-slate-900 border border-slate-800/90 overflow-hidden min-h-[260px] flex items-center justify-center shadow-xl"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/30 text-2xl font-bold text-purple-300 border border-purple-500/30">
                        {p.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-slate-300">{p.userName}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-slate-950/70 backdrop-blur-md px-3 py-1.5 text-xs text-white border border-white/10">
                      <span className="font-bold truncate">{p.userName}</span>
                      <span className="rounded-full bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-bold border border-purple-400/30">
                        🎧 {p.listeningLanguage || "Telugu"}
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col items-center justify-center text-center space-y-3 text-slate-500">
                <Users size={32} className="text-slate-600" />
                <div>
                  <p className="font-extrabold text-sm text-slate-300">Waiting for other participants...</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Share Meeting ID <strong className="font-mono text-blue-400">#{roomId}</strong> for others to join.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Pipeline Status Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                <Sparkles size={18} className="animate-spin-slow" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                  REAL-TIME AI PIPELINE
                </span>
                <p className="text-xs font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                  {aiStatus.message}
                </p>
              </div>
            </div>

            {/* Test Prompts / Autoplay Alert */}
            <div className="flex items-center gap-2">
              {autoplayBlocked && (
                <button
                  onClick={() => {
                    if (audioContextRef.current) audioContextRef.current.resume();
                    setAutoplayBlocked(false);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer animate-pulse"
                >
                  <Play size={12} />
                  Click to enable audio
                </button>
              )}

              <button
                onClick={() => handleTestSpeech("Hello, how are you today?")}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Test English Prompt
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Live Translated Feed */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-400" />
              <h2 className="font-extrabold text-sm text-slate-100">Live Translated Feed</h2>
            </div>
            <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              Listening: {listeningLanguage}
            </span>
          </div>

          {/* Transcript Feed Content */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[460px]">
            {translatedLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Volume2 size={32} className="text-slate-700" />
                <p className="text-xs font-medium text-slate-400">
                  Spoken translation audio will appear here in real time.
                </p>
                <p className="text-[11px] text-slate-600">
                  Speak into your mic or click test speech prompt above.
                </p>
              </div>
            ) : (
              translatedLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl bg-slate-950 border border-slate-800/80 p-3.5 space-y-2 shadow-md animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-slate-200">
                      {log.senderName} • <span className="text-slate-400 font-normal">{log.speakerLanguage} (Detected)</span>
                    </span>
                    <span className="font-mono text-slate-500">{log.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-400 italic">"{log.originalTranscript}"</p>

                  <div className="pt-1.5 border-t border-slate-800/60 flex items-start gap-2">
                    <span className="text-xs text-blue-400 font-bold shrink-0">↓ {log.targetListeningLanguage}</span>
                    <p className="text-xs font-bold text-blue-300 leading-relaxed">
                      "{log.translatedText}"
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="border-t border-slate-800 pt-3 flex items-center justify-center gap-3">
            <button
              onClick={toggleMic}
              className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer ${
                isMicOn
                  ? "bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700"
                  : "bg-red-600/90 text-white shadow-red-500/20 hover:bg-red-600"
              }`}
            >
              {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
              {isMicOn ? "Mic ON" : "Mic OFF"}
            </button>

            <button
              onClick={toggleVideo}
              className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all border shadow-md cursor-pointer ${
                isVideoOn
                  ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  : "bg-red-600/90 border-red-500 text-white hover:bg-red-600"
              }`}
            >
              {isVideoOn ? <VideoIcon size={16} /> : <VideoOff size={16} />}
              {isVideoOn ? "Camera ON" : "Camera OFF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
