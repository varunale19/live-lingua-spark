import React from "react";
import { Volume2 } from "lucide-react";

export const SpeechCard = ({ flag, text, tone = "blue", className = "", delay = "0s" }) => {
  const isBlue = tone === "blue";
  return (
    <div
      className={`animate-fade-up flex items-center gap-2.5 rounded-2xl p-3 shadow-xl backdrop-blur-md transition-all ${
        isBlue
          ? "border border-blue-200/80 bg-white/90 text-slate-900 shadow-blue-500/10"
          : "border border-purple-200/80 bg-white/90 text-slate-900 shadow-purple-500/10"
      } ${className}`}
      style={{ animationDelay: delay }}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-base shrink-0">
        {flag}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-extrabold tracking-tight">{text}</span>
        <Volume2 size={14} className={isBlue ? "text-blue-600" : "text-purple-600"} />
      </div>
    </div>
  );
};
