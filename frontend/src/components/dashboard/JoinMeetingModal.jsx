import React, { useState } from "react";
import { X, Link2, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const languages = [
  { name: "Telugu", flag: "🇮🇳" },
  { name: "English", flag: "🇬🇧" },
  { name: "German", flag: "🇩🇪" },
  { name: "Hindi", flag: "🇮🇳" },
  { name: "French", flag: "🇫🇷" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "Tamil", flag: "🇮🇳" },
  { name: "Japanese", flag: "🇯🇵" },
];

export const JoinMeetingModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialMeetingId = "",
}) => {
  const { user } = useAuth();
  const [meetingId, setMeetingId] = useState(initialMeetingId);
  const [listeningLanguage, setListeningLanguage] = useState(user?.listeningLanguage || "Telugu");
  const [step, setStep] = useState("enterId");

  if (!isOpen) return null;

  const handleNext = (e) => {
    e.preventDefault();
    if (!meetingId.trim()) return;
    setStep("chooseLanguage");
  };

  const handleJoin = () => {
    onSuccess(meetingId.trim(), listeningLanguage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl z-10 border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Link2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Join a Meeting</h3>
              <p className="text-xs text-slate-500">Enter meeting ID to join conversation</p>
            </div>
          </div>

          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {step === "enterId" ? (
          <form onSubmit={handleNext} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meeting ID or Link</label>
              <input
                type="text"
                required
                placeholder="e.g. 849-204-192"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Continue
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Choose the language you want to hear</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Every participant selects their own listening language independently.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {languages.map((lang) => (
                <button
                  key={lang.name}
                  type="button"
                  onClick={() => setListeningLanguage(lang.name)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                    listeningLanguage === lang.name
                      ? "border-blue-600 bg-blue-50/80 text-blue-700 ring-1 ring-blue-600"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {listeningLanguage === lang.name && <CheckCircle2 size={15} className="text-blue-600" />}
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200/80 text-xs text-emerald-800 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600 shrink-0" />
              <span>You're ready. Speak naturally in any language.</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep("enterId")}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleJoin}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
              >
                Join Meeting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
