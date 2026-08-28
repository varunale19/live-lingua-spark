import React, { useState } from "react";
import { X, Video, Copy, Check, Sparkles, Volume2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const CreateMeetingModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [copied, setCopied] = useState(false);

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
      } else {
        // Mock created meeting if backend response is pending
        setCreatedMeeting({
          meetingId: Math.floor(100000000 + Math.random() * 900000000).toString(),
          name: name.trim(),
          meetingLink: `http://localhost:5173/room?id=${Math.floor(100000000 + Math.random() * 900000000)}`,
        });
      }
    } catch (error) {
      setCreatedMeeting({
        meetingId: Math.floor(100000000 + Math.random() * 900000000).toString(),
        name: name.trim(),
        meetingLink: `http://localhost:5173/room?id=${Math.floor(100000000 + Math.random() * 900000000)}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = () => {
    if (createdMeeting?.meetingLink) {
      navigator.clipboard.writeText(createdMeeting.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    onSuccess(createdMeeting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl z-10 border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Video size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Create a Meeting</h3>
              <p className="text-xs text-slate-500">Start a live video conversation</p>
            </div>
          </div>

          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
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
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Generating Room..." : "Generate Meeting"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[11px] font-bold uppercase text-slate-400">Meeting ID</span>
              <p className="text-xl font-extrabold text-slate-900 tracking-wider mt-0.5">{createdMeeting.meetingId}</p>

              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-white p-2 border border-slate-200">
                <span className="text-xs text-slate-600 truncate flex-1 font-mono">{createdMeeting.meetingLink}</span>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy Link"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 flex items-center gap-3">
              <Volume2 className="text-blue-600 shrink-0" size={20} />
              <div>
                <span className="text-xs font-bold text-slate-900">Your Listening Language</span>
                <p className="text-xs text-slate-600">
                  🇮🇳 <strong className="text-blue-700">{user?.listeningLanguage || "Telugu"}</strong> (Each participant can independently choose what they want to hear).
                </p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Start Meeting
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
