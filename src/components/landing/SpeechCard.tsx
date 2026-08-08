const bars = [0.4, 0.75, 1, 0.55, 0.9, 0.35, 0.7, 0.5, 0.85, 0.45];

export function SpeechCard({
  flag,
  text,
  tone = "blue",
  className = "",
  delay = "0s",
}: {
  flag: string;
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
        <span className="text-base">{flag}</span>
        {text}
      </div>
      <div className="mt-2 flex h-5 items-end gap-[3px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className={`animate-wave w-[3px] rounded-full ${
              tone === "blue" ? "bg-primary" : "bg-primary-glow"
            }`}
            style={{
              height: `${h * 100}%`,
              animationDelay: `${i * 0.09}s`,
              opacity: tone === "purple" ? 0.85 : 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}