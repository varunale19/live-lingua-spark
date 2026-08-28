import React from "react";
import { AudioLines } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-[1260px] px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mx-auto mb-6">
            <AudioLines size={28} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            About LinguaLive AI
          </h2>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            LinguaLive AI is built using the MERN stack (MongoDB, Express, React, Node.js) and powered by WebRTC, Socket.IO, Deepgram, Gemini 1.5 Flash, and ElevenLabs. It empowers global teams and individuals to communicate seamlessly without language barriers.
          </p>
        </div>

        <div className="mt-16 border-t border-slate-100 pt-8 text-xs font-semibold text-slate-500">
          © 2026 LinguaLive AI. All rights reserved. MERN Stack Web Application.
        </div>
      </div>
    </section>
  );
};
