import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Volume2, Sparkles, Check, Mic, ArrowDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

export const Route = createFileRoute("/language-preferences")({
  head: () => ({
    meta: [
      { title: "Language Preferences — LinguaLive AI" },
      { name: "description", content: "Choose the language you want to hear during conversations." },
    ],
  }),
  component: LanguagePreferencesPage,
});

const supportedLanguages = [
  { name: "Telugu", native: "తెలుగు", flag: "🇮🇳", region: "Indian" },
  { name: "Hindi", native: "हिन्दी", flag: "🇮🇳", region: "Indian" },
  { name: "Tamil", native: "தமிழ்", flag: "🇮🇳", region: "Indian" },
  { name: "Kannada", native: "కన్నడ", flag: "🇮🇳", region: "Indian" },
  { name: "Malayalam", native: "മലയാളം", flag: "🇮🇳", region: "Indian" },
  { name: "Bengali", native: "বাংলা", flag: "🇮🇳", region: "Indian" },
  { name: "Marathi", native: "మరాఠీ", flag: "🇮🇳", region: "Indian" },

  { name: "English", native: "English", flag: "🇬🇧", region: "International" },
  { name: "German", native: "Deutsch", flag: "🇩🇪", region: "International" },
  { name: "French", native: "Français", flag: "🇫🇷", region: "International" },
  { name: "Spanish", native: "Español", flag: "🇪🇸", region: "International" },
  { name: "Italian", native: "Italiano", flag: "🇮🇹", region: "International" },
  { name: "Japanese", native: "日本語", flag: "🇯🇵", region: "International" },
  { name: "Chinese", native: "中文", flag: "🇨🇳", region: "International" },
  { name: "Korean", native: "한국어", flag: "🇰🇷", region: "International" },
  { name: "Arabic", native: "العربية", flag: "🇸🇦", region: "International" },
];

function LanguagePreferencesPage() {
  const { user } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(user?.listeningLanguage || "Telugu");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.listeningLanguage) {
      setSelectedLanguage(user.listeningLanguage);
    }
  }, [user]);

  const handleSave = async (langName) => {
    setSelectedLanguage(langName);
    try {
      await fetch("http://localhost:5000/api/user/listening-language", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listeningLanguage: langName }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Update language error:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 space-y-8 max-w-5xl">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-600 border border-blue-100 mb-2">
            <Volume2 size={13} />
            Output Audio Preference
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Language Preferences</h1>
          <p className="mt-1 text-sm text-slate-600">
            Choose the language you want to hear during conversations.
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 p-6 shadow-sm">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Language I want to hear
          </label>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {supportedLanguages.find((l) => l.name === selectedLanguage)?.flag || "🇮🇳"}
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{selectedLanguage}</h2>
                <p className="text-xs text-slate-500">
                  {supportedLanguages.find((l) => l.name === selectedLanguage)?.native || "తెలుగు"}
                </p>
              </div>
            </div>

            {saved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 animate-pulse">
                <Check size={14} /> Saved Preference
              </span>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
            You can speak naturally in any language or mix multiple languages. LinguaLive automatically processes the conversation and delivers it in your selected listening language.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
              <Sparkles size={16} />
              <span>Real-Time Mixed-Language Processing</span>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-100">
              No need to select the language you speak.
            </span>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Mic size={14} className="text-blue-600" /> Your Speech
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800 font-bold">
                  Mixed-language speech
                </span>
              </div>
              <p className="text-base font-bold text-slate-900 font-serif italic leading-snug">
                "Hey bro, రేపు meeting ఉంది, so please उसको शाम को call చేయి."
              </p>
              <p className="mt-2 text-[11px] text-slate-500">(Mix of English + Telugu + Hindi)</p>
            </div>

            <div className="flex flex-col items-center gap-1 text-blue-600 shrink-0">
              <span className="text-[11px] font-bold bg-blue-600 text-white px-3 py-1 rounded-full shadow-sm">
                AI Auto-Processing
              </span>
              <ArrowDown size={20} className="text-blue-500 animate-bounce mt-1" />
            </div>

            <div className="flex-1 w-full rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <Volume2 size={14} /> Language I want to hear: {selectedLanguage}
                </span>
                <span className="text-lg">
                  {supportedLanguages.find((l) => l.name === selectedLanguage)?.flag || "🇮🇳"}
                </span>
              </div>
              <p className="text-base font-bold text-slate-900 font-serif italic leading-snug">
                "రేపు మీటింగ్ ఉంది, కాబట్టి దయచేసి అతనికి సాయంత్రం కాల్ చేయండి."
              </p>
              <p className="mt-2 text-[11px] text-blue-600 font-semibold">Delivered in {selectedLanguage} audio</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-slate-900 mb-4">Supported Listening Languages</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {supportedLanguages.map((lang) => {
              const isSelected = selectedLanguage === lang.name;
              return (
                <button
                  key={lang.name}
                  onClick={() => handleSave(lang.name)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "border-slate-200/80 bg-white text-slate-900 hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <h4 className="text-sm font-bold">{lang.name}</h4>
                      <p className={`text-xs ${isSelected ? "text-blue-100" : "text-slate-500"}`}>{lang.native}</p>
                    </div>
                  </div>

                  {isSelected && <Check size={18} className="text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
