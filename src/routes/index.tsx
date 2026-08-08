import { createFileRoute } from "@tanstack/react-router";
import { Play, Sparkles, Zap, AudioLines, ShieldCheck } from "lucide-react";

import heroPeople from "@/assets/hero-people.jpg";
import { Navbar } from "@/components/landing/Navbar";
import { SpeechCard } from "@/components/landing/SpeechCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LinguaLive AI — Real-Time AI Voice Translation" },
      {
        name: "description",
        content:
          "Speak in your language, hear in theirs. LinguaLive AI delivers instant, natural real-time voice and video translation for global conversations.",
      },
      { property: "og:title", content: "LinguaLive AI — Real-Time AI Voice Translation" },
      {
        property: "og:description",
        content:
          "Real conversations, no language limits. Instant, accurate and natural AI voice translation.",
      },
    ],
  }),
  component: Index,
});

const logos = ["Google", "Microsoft", "airbnb", "Spotify", "amazon"];

const features = [
  {
    icon: Zap,
    title: "Instant Translation",
    lines: ["Real-time voice translation", "in any language."],
    wrap: "bg-primary-soft text-primary",
  },
  {
    icon: AudioLines,
    title: "Natural Voices",
    lines: ["Human-like AI voices for", "better conversations."],
    wrap: "bg-brand-orange-soft text-brand-orange",
  },
  {
    icon: ShieldCheck,
    title: "Private & Secure",
    lines: ["Your conversations are", "encrypted and protected."],
    wrap: "bg-brand-green-soft text-brand-green",
  },
];

function Index() {
  return (
    <div id="top" className="min-h-screen bg-background">
      <Navbar />

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(60%_60%_at_70%_20%,var(--primary-soft),transparent_70%)]"
          />
          <div className="relative mx-auto grid max-w-[1260px] items-center gap-10 px-6 pb-8 pt-12 lg:grid-cols-[43%_57%] lg:pt-16">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkles size={14} />
                Real-time AI Voice Translation
              </span>

              <h1 className="mt-5 text-[2.75rem] font-extrabold leading-[1.08] tracking-tight sm:text-[3.25rem]">
                Real Conversations.
                <br />
                <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                  No Language Limits.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                Speak in your language, hear in theirs. Instantly. Accurately. Naturally.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#top"
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition-all hover:bg-primary-glow hover:shadow-[var(--shadow-float)]"
                >
                  Get Started Free
                </a>
                <a
                  href="#top"
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-card px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft">
                    <Play size={12} className="fill-current" />
                  </span>
                  Watch Demo
                </a>
              </div>
            </div>

            <div className="animate-fade-up relative" style={{ animationDelay: "0.15s" }}>
              <svg
                aria-hidden
                viewBox="0 0 600 200"
                className="absolute left-1/2 top-1/2 w-[85%] -translate-x-1/2 -translate-y-1/2 text-primary opacity-[0.14] blur-[1px]"
              >
                <path
                  d="M0 100 Q 60 20 120 100 T 240 100 T 360 100 T 480 100 T 600 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </svg>

              <div className="relative">
                <img
                  src={heroPeople}
                  alt="Two professionals wearing wireless earbuds having a translated conversation"
                  width={1200}
                  height={1008}
                  className="mx-auto w-full max-w-[620px] [mask-image:linear-gradient(to_bottom,black_72%,transparent_100%)]"
                />

                <SpeechCard
                  flag="🇺🇸"
                  text="How are you?"
                  tone="blue"
                  className="absolute left-0 top-[18%] sm:left-4"
                />
                <SpeechCard
                  flag="🇩🇪"
                  text="Wie geht es dir?"
                  tone="purple"
                  delay="1.5s"
                  className="absolute bottom-[18%] right-0 sm:right-2"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1260px] px-6 pb-12 pt-2 text-center">
          <p className="text-sm text-muted-foreground">
            Trusted by teams and individuals worldwide
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
            {logos.map((l) => (
              <span key={l} className="text-lg font-semibold text-muted-foreground">
                {l}
              </span>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-[1260px] px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, lines, wrap }) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${wrap}`}>
                  <Icon size={20} />
                </span>
                <h2 className="mt-4 text-base font-bold">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {lines[0]}
                  <br />
                  {lines[1]}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div id="how-it-works" className="scroll-mt-20" />
        <div id="languages" className="scroll-mt-20" />
        <div id="pricing" className="scroll-mt-20" />
      </main>
    </div>
  );
}
