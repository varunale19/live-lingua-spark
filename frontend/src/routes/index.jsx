import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Play, Zap } from "lucide-react";

import heroPeople from "@/assets/hero-people.jpg";
import { Navbar } from "@/components/landing/Navbar";
import { SpeechCard } from "@/components/landing/SpeechCard";
import { FlagDE, FlagUS } from "@/components/landing/Flags";

import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LanguagesSection } from "@/components/landing/LanguagesSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { useAuth } from "@/context/AuthContext";

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

function Index() {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate({ to: "/dashboard" });
    } else {
      openAuthModal("register");
    }
  };

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
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-600 border border-blue-100">
                <Zap size={14} className="fill-blue-600 text-blue-600" />
                Real-time AI Voice Translation
              </span>

              <h1 className="mt-5 text-[2.75rem] font-extrabold leading-[1.08] tracking-tight sm:text-[3.25rem] text-slate-900">
                Real Conversations.
                <br />
                <span className="text-[#2563eb]">
                  No Language Limits.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
                Speak in your language, hear in theirs.
                <br />
                Instantly. Accurately. Naturally.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={handleGetStarted}
                  className="rounded-xl bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 cursor-pointer"
                >
                  {user ? "Go to Dashboard" : "Get Started Free"}
                </button>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2.5 rounded-xl border border-blue-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#2563eb] shadow-sm transition-colors hover:bg-blue-50/50"
                >
                  Watch Demo
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#2563eb] text-[#2563eb]">
                    <Play size={10} className="fill-current translate-x-[0.5px]" />
                  </span>
                </a>
              </div>
            </div>

            <div className="animate-fade-up relative" style={{ animationDelay: "0.15s" }}>
              <div className="relative mx-auto max-w-[620px]">
                <img
                  src={heroPeople}
                  alt="Two professionals wearing wireless earbuds having a translated conversation"
                  width={1200}
                  height={1008}
                  className="w-full rounded-2xl object-cover [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]"
                />

                <div
                  aria-hidden
                  className="pointer-events-none absolute left-[50%] top-[34%] flex h-24 -translate-x-1/2 -translate-y-1/2 items-center gap-[3px] opacity-30"
                >
                  {Array.from({ length: 28 }).map((_, i) => {
                    const h = 20 + Math.abs(Math.sin(i * 1.3)) * 70 * (1 - Math.abs(i - 13.5) / 20);
                    return (
                      <span
                        key={i}
                        className="animate-wave w-[3px] rounded-full bg-primary/60"
                        style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }}
                      />
                    );
                  })}
                </div>

                <SpeechCard
                  flag={<FlagUS />}
                  text="How are you?"
                  tone="blue"
                  className="absolute left-[28%] top-[14%] sm:left-[30%]"
                />

                <SpeechCard
                  flag={<FlagDE />}
                  text="Wie geht es dir?"
                  tone="purple"
                  delay="1.5s"
                  className="absolute left-[44%] top-[50%] sm:left-[46%]"
                />
              </div>
            </div>
          </div>
        </section>

        <FeaturesSection />
        <HowItWorksSection />
        <LanguagesSection />
        <AboutSection />
      </main>
    </div>
  );
}
