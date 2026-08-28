import React from "react";
import { Mic, Cpu, Volume2 } from "lucide-react";

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="mx-auto max-w-[1260px] px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Simple 3-Step Flow
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            How Real-Time Translation Works
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            No complex setup. Just select what language you want to hear and speak naturally.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-8 relative">
            <span className="text-4xl font-extrabold text-blue-600/20 absolute top-6 right-6">01</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold mb-6">
              <Mic size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">1. Speak Naturally</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Speak in Telugu, English, Hindi, or any combination of languages during the call.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-8 relative">
            <span className="text-4xl font-extrabold text-blue-600/20 absolute top-6 right-6">02</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold mb-6">
              <Cpu size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">2. Deepgram & Gemini AI</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Deepgram transcribes speech into text; Gemini translates it into each listener's preferred language.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-8 relative">
            <span className="text-4xl font-extrabold text-blue-600/20 absolute top-6 right-6">03</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold mb-6">
              <Volume2 size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">3. ElevenLabs Voice Delivery</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              ElevenLabs generates spoken voice audio in the listener's target language and plays it automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
