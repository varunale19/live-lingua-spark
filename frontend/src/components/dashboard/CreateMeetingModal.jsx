import React, { useState } from "react";
import { X, Video, Copy, Check, Sparkles, Volume2, Key, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export const CreateMeetingModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/meetings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      const data = await res.json();
      if (data.success && data.meeting) {
        setCreatedMeeting(data.meeting);
        toast.success("Meeting created successfully!");
      } else {
        toast.error(data.message || "Failed to create meeting");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Network error while creating meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyMeetingId = () => {
    if (createdMeeting?.meetingId) {
      navigator.clipboard.writeText(createdMeeting.meetingId);
      setCopiedId(true);
      toast.success("Meeting ID copied to clipboard!");
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const copyPassword = () => {
    if (createdMeeting?.password) {
      navigator.clipboard.writeText(createdMeeting.password);
      setCopiedPass(true);
      toast.success("Meeting Password copied to clipboard!");
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleStart = () => {
    onSuccess(createdMeeting);
    onClose();
  };

  const handleModalClose = () => {
    setCreatedMeeting(null);
    setName("");
    setDescription("");
    setShowPassword(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleModalClose} />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl z-10 border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Video size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {createdMeeting ? "Meeting Created 🎉" : "Create a Meeting"}
              </h3>
              <p className="text-xs text-slate-500">
                {createdMeeting ? "Share credentials with participants" : "Start a live video conversation"}
              </p>
            </div>
          </div>

          <button onClick={handleModalClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {!createdMeeting ? (
          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Germany Client Call"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Optional Description</label>
              <input
                type="text"
                placeholder="e.g. Project status sync & live translation test"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="rounded-xl bg-blue-50/70 p-3.5 border border-blue-100 text-xs text-slate-600">
              <span className="font-bold text-blue-700 flex items-center gap-1.5 mb-1">
                <Sparkles size={14} /> Automatic Spoken-Language Detection
              </span>
              You can speak naturally in any language (Telugu, English, Hindi, etc.). No need to select what language you speak!
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Generating Room..." : "Generate Meeting"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Meeting ID Field */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meeting ID</span>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-mono text-lg font-extrabold text-slate-900 tracking-wider">
                  {createdMeeting.meetingId}
                </span>
                <button
                  type="button"
                  onClick={copyMeetingId}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  {copiedId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  {copiedId ? "Copied" : "Copy ID"}
                </button>
              </div>
            </div>

            {/* Meeting Password Field */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Key size={11} className="text-blue-600" /> Meeting Password
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Protected
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                    {showPassword ? createdMeeting.password : "••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200"
                >
                  {copiedPass ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  {copiedPass ? "Copied" : "Copy Password"}
                </button>
              </div>
            </div>

            {/* Notice */}
            <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-100 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Share both the <strong>Meeting ID</strong> and <strong>Meeting Password</strong> with participants to let them join.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
            >
              Start Meeting
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
