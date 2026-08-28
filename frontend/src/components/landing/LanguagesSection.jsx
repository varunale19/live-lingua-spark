import React from "react";

const languagesList = [
  { name: "Telugu", flag: "🇮🇳", native: "తెలుగు" },
  { name: "English", flag: "🇬🇧", native: "English" },
  { name: "Hindi", flag: "🇮🇳", native: "हिन्दी" },
  { name: "German", flag: "🇩🇪", native: "Deutsch" },
  { name: "French", flag: "🇫🇷", native: "Français" },
  { name: "Spanish", flag: "🇪🇸", native: "Español" },
  { name: "Tamil", flag: "🇮🇳", native: "தமிழ்" },
  { name: "Kannada", flag: "🇮🇳", native: "కన్నడ" },
  { name: "Malayalam", flag: "🇮🇳", native: "മലയാളം" },
  { name: "Japanese", flag: "🇯🇵", native: "日本語" },
  { name: "Chinese", flag: "🇨🇳", native: "中文" },
  { name: "Korean", flag: "🇰🇷", native: "한국어" },
];

export const LanguagesSection = () => {
  return (
    <section id="languages" className="py-20 bg-slate-50/60 border-t border-slate-100">
      <div className="mx-auto max-w-[1260px] px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Global Coverage
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Supported Languages
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Listen to any meeting in your native language with AI translation.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {languagesList.map((lang) => (
            <div
              key={lang.name}
              className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs"
            >
              <span className="text-2xl">{lang.flag}</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{lang.name}</h4>
                <p className="text-xs text-slate-500">{lang.native}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
