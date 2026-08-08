import type { ReactNode } from "react";

const bars = [0.3, 0.55, 0.85, 1, 0.6, 0.4, 0.75, 0.5, 0.9, 0.45, 0.65, 0.35, 0.8, 0.5, 0.3];

export function SpeechCard({
  flag,
  text,
  tone = "blue",
  className = "",
  delay = "0s",
}: {
  flag: ReactNode;
  text: string;
  tone?: "blue" | "purple";
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`animate-float-soft rounded-2xl border border-border/70 bg-card/90 px-4 py-3 shadow-[var(--shadow-float)] backdrop-blur ${className}`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold">
        <span className="flex items-center">{flag}</span>
        {text}
      </div>
      <div className="mt-2 flex h-4 items-center gap-[2px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`animate-wave w-[2px] rounded-full ${
              tone === "blue" ? "bg-primary" : "bg-primary-glow"
            }`}
            style={{
              height: `${h * 100}%`,
              animationDelay: `${i * 0.09}s`,
              opacity: tone === "purple" ? 0.7 : 0.8,
            }}
          />
        ))}
      </div>
    </div>
  );
}