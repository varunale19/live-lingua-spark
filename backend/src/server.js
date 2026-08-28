import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

import { transcribeAudioChunk } from "./services/deepgramService.js";
import { translateWithGemini } from "./services/geminiService.js";
import { generateElevenLabsVoice } from "./services/elevenlabsService.js";
import { MeetingParticipant } from "./models/MeetingParticipant.js";

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration allowing all local development ports
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/contacts", contactRoutes);

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "LinguaLive AI Backend Server (Node.js/Express)",
    version: "1.0.0",
    hasDeepgram: Boolean(process.env.DEEPGRAM_API_KEY),
    hasGemini: Boolean(process.env.GEMINI_API_KEY),
    hasElevenLabs: Boolean(process.env.ELEVENLABS_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Memory map for active WebRTC rooms & participant state
const roomsMap = new Map();

// Socket.IO for WebRTC Signaling & Real-Time AI Pipeline
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // 1. JOIN ROOM & BROADCAST PARTICIPANT LIST
  socket.on("join-room", async ({ roomId, userId, userName, listeningLanguage }) => {
    const cleanRoomId = roomId.trim();
    socket.join(cleanRoomId);

    const userLang = listeningLanguage || "Telugu";
    const displayName = userName || "Participant";

    const participant = {
      socketId: socket.id,
      userId: userId || socket.id,
      userName: displayName,
      listeningLanguage: userLang,
    };

    let participantsList = roomsMap.get(cleanRoomId) || [];
    participantsList = participantsList.filter((p) => p.socketId !== socket.id);
    participantsList.push(participant);
    roomsMap.set(cleanRoomId, participantsList);

    console.log(
      `[Room ${cleanRoomId}] ${displayName} (${socket.id}) joined. Listening Language: ${userLang}. Total: ${participantsList.length}`
    );

    io.to(cleanRoomId).emit("room-participants-updated", participantsList);
    socket.to(cleanRoomId).emit("user-joined-webrtc", { socketId: socket.id, userName: displayName });
  });

  // 2. CHANGE LISTENING LANGUAGE DURING MEETING
  socket.on("change-listening-language", async ({ roomId, listeningLanguage }) => {
    const cleanRoomId = roomId.trim();
    let participantsList = roomsMap.get(cleanRoomId) || [];

    participantsList = participantsList.map((p) => {
      if (p.socketId === socket.id) {
        return { ...p, listeningLanguage };
      }
      return p;
    });

    roomsMap.set(cleanRoomId, participantsList);
    console.log(`[Room ${cleanRoomId}] Socket ${socket.id} updated listening language to ${listeningLanguage}`);

    const targetUser = participantsList.find((p) => p.socketId === socket.id);
    if (targetUser && targetUser.userId) {
      try {
        await MeetingParticipant.findOneAndUpdate(
          { userId: targetUser.userId, meetingId: cleanRoomId },
          { listeningLanguage },
          { upsert: true }
        );
      } catch (err) {}
    }

    io.to(cleanRoomId).emit("room-participants-updated", participantsList);
  });

  // 3. WebRTC PEER SIGNALING
  socket.on("webrtc-offer", ({ toSocketId, offer }) => {
    io.to(toSocketId).emit("webrtc-offer", { fromSocketId: socket.id, offer });
  });

  socket.on("webrtc-answer", ({ toSocketId, answer }) => {
    io.to(toSocketId).emit("webrtc-answer", { fromSocketId: socket.id, answer });
  });

  socket.on("webrtc-ice-candidate", ({ toSocketId, candidate }) => {
    io.to(toSocketId).emit("webrtc-ice-candidate", { fromSocketId: socket.id, candidate });
  });

  // 4. REAL-TIME AI PIPELINE: Audio Speech Chunk -> Deepgram STT -> Gemini Translation -> ElevenLabs TTS -> Delivery
  socket.on("speech-audio-chunk", async ({ roomId, audioBase64, mimeType, textPrompt }) => {
    const cleanRoomId = roomId.trim();
    const participantsList = roomsMap.get(cleanRoomId) || [];
    const speaker = participantsList.find((p) => p.socketId === socket.id);
    const speakerName = speaker ? speaker.userName : "Participant";

    let rawTranscript = "";
    let detectedSpokenLang = "English";

    // Step A: Deepgram Speech-To-Text & Automatic Spoken Language Detection
    if (audioBase64) {
      try {
        const buffer = Buffer.from(audioBase64, "base64");
        const sttResult = await transcribeAudioChunk(buffer, mimeType || "audio/webm");
        rawTranscript = sttResult.transcript;
        detectedSpokenLang = sttResult.detectedLanguage || "English";
      } catch (err) {
        console.error("STT error:", err);
      }
    }

    if (!rawTranscript && textPrompt) {
      rawTranscript = textPrompt;
    }

    // If silence / no speech detected, revert status to Listening
    if (!rawTranscript) {
      io.to(socket.id).emit("ai-translation-status", {
        status: "LISTENING",
        speakerName,
        message: "🎤 Listening for speech...",
      });
      return;
    }

    // Step B: Speech Detected Broadcast
    io.to(cleanRoomId).emit("ai-translation-status", {
      status: "SPEECH_DETECTED",
      speakerName,
      rawTranscript,
      detectedLanguage: detectedSpokenLang,
      message: `🎤 Speech detected (${detectedSpokenLang}): "${rawTranscript}"`,
    });

    // Step C: Translate and Deliver (to other participants OR self if testing alone)
    const targets = participantsList.length === 1 ? participantsList : participantsList.filter((p) => p.socketId !== socket.id);

    for (const recipient of targets) {
      const targetLang = recipient.listeningLanguage || "Telugu";

      io.to(recipient.socketId).emit("ai-translation-status", {
        status: "TRANSLATING",
        speakerName,
        targetLanguage: targetLang,
        message: `🌐 Translating (${detectedSpokenLang} → ${targetLang})...`,
      });

      // Gemini Translation
      const translatedText = await translateWithGemini(rawTranscript, targetLang, detectedSpokenLang);

      if (!translatedText) continue;

      io.to(recipient.socketId).emit("ai-translation-status", {
        status: "SYNTHESIZING",
        speakerName,
        targetLanguage: targetLang,
        message: `🔊 Synthesizing ${targetLang} voice via ElevenLabs...`,
      });

      // ElevenLabs TTS
      const { audioBase64: ttsAudioBase64, mimeType: ttsMime } = await generateElevenLabsVoice(
        translatedText,
        targetLang
      );

      // Deliver translated audio stream & transcript to recipient!
      io.to(recipient.socketId).emit("translated-speech-delivered", {
        senderSocketId: socket.id,
        senderName: speakerName,
        speakerLanguage: detectedSpokenLang,
        originalTranscript: rawTranscript,
        translatedText,
        audioBase64: ttsAudioBase64,
        mimeType: ttsMime,
        targetListeningLanguage: targetLang,
        timestamp: new Date().toISOString(),
      });

      io.to(cleanRoomId).emit("ai-translation-status", {
        status: "LISTENING",
        speakerName,
        message: "🎤 Listening for speech...",
      });
    }
  });

  // DISCONNECT HANDLER
  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);

    roomsMap.forEach((participants, roomId) => {
      const filtered = participants.filter((p) => p.socketId !== socket.id);
      if (filtered.length !== participants.length) {
        roomsMap.set(roomId, filtered);
        io.to(roomId).emit("room-participants-updated", filtered);
        io.to(roomId).emit("user-left-webrtc", { socketId: socket.id });
      }
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 LinguaLive AI Real-Time Node.js Server listening on http://localhost:${PORT}`);
});
