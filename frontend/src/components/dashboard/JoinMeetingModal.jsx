import React, { useState, useEffect } from "react";
import { X, Link2, Sparkles, CheckCircle2, Key, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
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
  initialPassword = "",
}) => {
  const { user } = useAuth();
  const [meetingId, setMeetingId] = useState(initialMeetingId);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [listeningLanguage, setListeningLanguage] = useState(user?.listeningLanguage || "Telugu");
  const [step, setStep] = useState("enterCredentials");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialMeetingId) setMeetingId(initialMeetingId);
    if (initialPassword) setPassword(initialPassword);
    if (initialMeetingId && initialPassword) {
      setStep("chooseLanguage");
    } else {
      setStep("enterCredentials");
    }
    setErrorMsg("");
  }, [initialMeetingId, initialPassword, isOpen]);

  if (!isOpen) return null;

  const handleNext = async (e) => {
    e.preventDefault();
    if (!meetingId.trim()) {
      setErrorMsg("Meeting ID is required.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Meeting password is required.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");
    try {
      const res = await fetch("http://localhost:5000/api/meetings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ meetingId: meetingId.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("chooseLanguage");
      } else {
        const msg = data.message || "Failed to verify meeting credentials.";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMsg("Network error verifying meeting.");
      toast.error("Network error verifying meeting.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleJoin = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("http://localhost:5000/api/meetings/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          meetingId: meetingId.trim(),
          password: password.trim(),
          listeningLanguage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(meetingId.trim(), listeningLanguage);
        onClose();
      } else {
        const msg = data.message || "Failed to join meeting.";
        setErrorMsg(msg);
        toast.error(msg);
        setStep("enterCredentials");
      }
    } catch (err) {
      console.error("Join error:", err);
      toast.error("Network error joining meeting.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl z-10 border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <Link2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Join a Meeting</h3>
              <p className="text-xs text-slate-500">
                {step === "enterCredentials" ? "Enter Meeting ID & Password" : `Meeting #${meetingId}`}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === "enterCredentials" ? (
          <form onSubmit={handleNext} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meeting ID</label>
              <input
                type="text"
                required
                placeholder="e.g. 849-204-192"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Meeting Password</span>
                <span className="text-[10px] font-normal text-slate-400">Case-sensitive</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter Meeting Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? "Verifying Credentials..." : "Continue"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Choose your listening language</h4>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  #{meetingId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Every participant selects their own listening language independently.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {languages.map((lang) => (
                <button
                  key={lang.name}
                  type="button"
                  onClick={() => setListeningLanguage(lang.name)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                    listeningLanguage === lang.name
                      ? "border-emerald-600 bg-emerald-50/80 text-emerald-800 ring-1 ring-emerald-600"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {listeningLanguage === lang.name && <CheckCircle2 size={15} className="text-emerald-600" />}
                </button>
              ))}
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200/80 text-xs text-emerald-800 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600 shrink-0" />
              <span>You're ready. Speak naturally in any language.</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("enterCredentials")}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleJoin}
                disabled={isVerifying}
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? "Joining..." : "Join Meeting"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
