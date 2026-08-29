import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Video, Link2, AudioLines, ShieldCheck, Bell, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { CreateMeetingModal } from "../components/dashboard/CreateMeetingModal";
import { JoinMeetingModal } from "../components/dashboard/JoinMeetingModal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LinguaLive AI" },
      { name: "description", content: "Start a multilingual video conversation or join an existing meeting." },
    ],
  }),
  component: Dashboard,
});

/* Modern SaaS Illustration for Create Meeting (Blue Tones + Invite Badge) */
function CreateMeetingIllustration() {
  return (
    <div className="relative w-28 h-24 shrink-0 select-none pointer-events-none hidden sm:block">
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft background aura */}
        <circle cx="60" cy="50" r="42" fill="#EFF6FF" />
        <circle cx="60" cy="50" r="30" fill="#DBEAFE" fillOpacity="0.6" />

        {/* Back Person (Left) */}
        <g opacity="0.8">
          <circle cx="34" cy="34" r="9" fill="#93C5FD" />
          <path d="M22 58C22 50.268 28.268 44 36 44C43.732 44 50 50.268 50 58V64H22V58Z" fill="#93C5FD" />
        </g>

        {/* Back Person (Right) */}
        <g opacity="0.8">
          <circle cx="86" cy="34" r="9" fill="#93C5FD" />
          <path d="M70 58C70 50.268 76.268 44 84 44C91.732 44 98 50.268 98 58V64H70V58Z" fill="#93C5FD" />
        </g>

        {/* Center-Left Person */}
        <g>
          <circle cx="48" cy="38" r="11" fill="#3B82F6" />
          <path d="M32 68C32 58.0589 40.0589 50 50 50C59.9411 50 68 58.0589 68 68V76H32V68Z" fill="#3B82F6" />
        </g>

        {/* Center-Right Front Person */}
        <g>
          <circle cx="72" cy="36" r="12" fill="#2563EB" />
          <path d="M54 70C54 58.9543 62.9543 50 74 50C85.0457 50 94 58.9543 94 70V76H54V70Z" fill="#2563EB" />
        </g>

        {/* Floating Invite (+) Badge */}
        <g filter="drop-shadow(0px 3px 5px rgba(37, 99, 235, 0.25))">
          <circle cx="94" cy="22" r="12" fill="#FFFFFF" />
          <circle cx="94" cy="22" r="10" fill="#2563EB" />
          <path d="M94 17V27M89 22H99" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

/* Modern SaaS Illustration for Join Meeting (Green Tones + Doorway/Arrow Badge) */
function JoinMeetingIllustration() {
  return (
    <div className="relative w-28 h-24 shrink-0 select-none pointer-events-none hidden sm:block">
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft background aura */}
        <circle cx="68" cy="50" r="42" fill="#ECFDF5" />
        <circle cx="68" cy="50" r="30" fill="#D1FAE5" fillOpacity="0.7" />

        {/* Back Person (Right) */}
        <g opacity="0.8">
          <circle cx="86" cy="35" r="9.5" fill="#6EE7B7" />
          <path d="M70 60C70 51.7157 76.7157 45 85 45C93.2843 45 100 51.7157 100 60V66H70V60Z" fill="#6EE7B7" />
        </g>

        {/* Left Person in Group */}
        <g>
          <circle cx="56" cy="38" r="11" fill="#10B981" />
          <path d="M40 68C40 58.0589 48.0589 50 58 50C67.9411 50 76 58.0589 76 68V76H40V68Z" fill="#10B981" />
        </g>

        {/* Center Main Person in Group */}
        <g>
          <circle cx="76" cy="36" r="12" fill="#059669" />
          <path d="M58 70C58 58.9543 66.9543 50 78 50C89.0457 50 98 58.9543 98 70V76H58V70Z" fill="#059669" />
        </g>

        {/* Doorway / Joining Arrow Badge */}
        <g filter="drop-shadow(0px 3px 5px rgba(5, 150, 105, 0.25))">
          <rect x="12" y="18" width="28" height="28" rx="9" fill="#FFFFFF" />
          <rect x="14" y="20" width="24" height="24" rx="7" fill="#059669" />
          {/* Doorway outline */}
          <path d="M21 38V26C21 24.8954 21.8954 24 23 24H29C30.1046 24 31 24.8954 31 26V38" stroke="#A7F3D0" strokeWidth="1.4" strokeLinecap="round" />
          {/* Entering Arrow */}
          <path d="M19 32H28M25 29L28 32L25 35" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [joinIdInput, setJoinIdInput] = useState("");
  const [joinPasswordInput, setJoinPasswordInput] = useState("");
  const [showJoinPassword, setShowJoinPassword] = useState(false);
  const [isVerifyingJoin, setIsVerifyingJoin] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinIdInput.trim()) {
      toast.error("Please enter a Meeting ID");
      return;
    }
    if (!joinPasswordInput.trim()) {
      toast.error("Please enter the Meeting Password");
      return;
    }

    setIsVerifyingJoin(true);
    try {
      const res = await fetch("http://localhost:5000/api/meetings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          meetingId: joinIdInput.trim(),
          password: joinPasswordInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsJoinOpen(true);
      } else {
        toast.error(data.message || "Failed to verify meeting credentials.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Network error verifying meeting.");
    } finally {
      setIsVerifyingJoin(false);
    }
  };

  const handleStartMeeting = (meeting) => {
    navigate({ to: "/room", search: { id: meeting.meetingId } });
  };

  const handleJoinMeetingSuccess = (roomId) => {
    navigate({ to: "/room", search: { id: roomId } });
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 space-y-8 max-w-6xl">
        {/* 1. TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {user?.name || "User"} 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Start a multilingual conversation or join an existing meeting.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name || "User Avatar"}
                  className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. AI TRANSLATION INFORMATION CARD */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs hover:border-slate-300 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Left side: AI Translation Status */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0 shadow-xs">
                <AudioLines size={24} />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50/80 px-2.5 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  AI Translation Status
                </span>
                <h3 className="text-base font-bold text-slate-900 pt-0.5">
                  Automatic Spoken-Language Detection
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We automatically detect what others are speaking. You can speak in any supported language.
                </p>
              </div>
            </div>

            {/* Right side: Secure & Private */}
            <div className="flex items-start gap-4 pt-5 md:pt-0 md:pl-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0 shadow-xs">
                <ShieldCheck size={24} />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Protected Stream
                </span>
                <h3 className="text-base font-bold text-slate-900 pt-0.5">
                  Secure & Private
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your conversations are securely processed and protected.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN ACTION CARDS */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* CARD 1 — CREATE A MEETING */}
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-b from-white via-white to-blue-50/30 p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-5">
                  <Video size={28} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Create a Meeting</h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs">
                  Start a new live meeting and invite participants to join.
                </p>
              </div>

              {/* People illustration with (+) symbol */}
              <CreateMeetingIllustration />
            </div>

            <div className="mt-8 pt-4 border-t border-blue-100/60">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 px-6 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer"
              >
                <Plus size={18} />
                + Create Meeting
              </button>
            </div>
          </div>

          {/* CARD 2 — JOIN A MEETING */}
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-white via-white to-emerald-50/30 p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 mb-5">
                  <Link2 size={28} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Join a Meeting</h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs">
                  Enter a meeting ID and password to join an existing conversation.
                </p>
              </div>

              {/* People illustration with doorway/join symbol */}
              <JoinMeetingIllustration />
            </div>

            <form onSubmit={handleJoinSubmit} className="mt-8 pt-4 border-t border-emerald-100/60 space-y-3">
              {/* Meeting ID Input */}
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Meeting ID (e.g. 849-204-192)"
                  value={joinIdInput}
                  onChange={(e) => setJoinIdInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs font-mono"
                />
              </div>

              {/* Meeting Password Input with Eye Icon */}
              <div className="relative">
                <input
                  type={showJoinPassword ? "text" : "password"}
                  required
                  placeholder="Meeting Password"
                  value={joinPasswordInput}
                  onChange={(e) => setJoinPasswordInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-11 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowJoinPassword(!showJoinPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showJoinPassword ? "Hide Password" : "Show Password"}
                >
                  {showJoinPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifyingJoin}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 px-6 text-sm font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Link2 size={18} />
                {isVerifyingJoin ? "Verifying..." : "Join Meeting"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <CreateMeetingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleStartMeeting}
      />
      <JoinMeetingModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={handleJoinMeetingSuccess}
        initialMeetingId={joinIdInput}
        initialPassword={joinPasswordInput}
      />
    </DashboardLayout>
  );
}
