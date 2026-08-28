import React from "react";
import { Mic, Volume2, ShieldCheck, Zap, Globe2, Sparkles } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Zero Language Setup Required",
    description:
      "Never worry about configuring what language you speak. Speak naturally in Telugu, English, Hindi, or mix languages effortlessly.",
  },
  {
    icon: Volume2,
    title: "Language I Want to Hear Preference",
    description:
      "Select your preferred listening language once. Every participant in the meeting receives audio tailored to their specific preference.",
  },
  {
    icon: Zap,
    title: "Sub-Second Ultra-Low Latency",
    description:
      "Deepgram STT, Gemini Flash translation, and ElevenLabs TTS run in real time to keep conversations fluid.",
  },
  {
    icon: Globe2,
    title: "Multi-Language Conversation Support",
    description:
      "Supports 100+ global languages including Telugu, Hindi, Tamil, German, English, French, Spanish, Japanese, and more.",
  },
  {
    icon: Mic,
    title: "HD WebRTC Audio & Video",
    description:
      "Direct browser-to-browser peer communication with automated micro-audio chunk streaming.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise MERN Security",
    description:
      "MongoDB encrypted user preferences, HTTP-only JWT cookies, and strict CORS protection.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-slate-50/60 border-t border-slate-100">
      <div className="mx-auto max-w-[1260px] px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Powered by AI Innovation
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Designed for Natural Multilingual Conversations
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Eliminating language barriers in live video meetings with automatic speech processing.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-5">
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{f.title}</h3>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
