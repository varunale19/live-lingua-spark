import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Video, Link2, Sparkles, Volume2, ArrowRight } from "lucide-react";
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

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listeningLanguage, setListeningLanguage] = useState("Telugu");
  const [joinIdInput, setJoinIdInput] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  useEffect(() => {
    if (user?.listeningLanguage) {
      setListeningLanguage(user.listeningLanguage);
    }
  }, [user]);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinIdInput.trim()) return;
    setIsJoinOpen(true);
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
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {user?.name || "User"} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Start a multilingual conversation or join an existing meeting.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-lg shadow-blue-500/15">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-200">
            <Sparkles size={14} /> Automatic Spoken-Language Detection
          </div>
          <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">
            "Speak naturally. Choose what you want to hear."
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed max-w-3xl">
            You don't need to tell LinguaLive what language you're speaking. Speak naturally—even mix languages like Telugu, English, and Hindi—and choose the language you want to hear.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <Volume2 size={24} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Language I Want to Hear
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl">
                  {listeningLanguage === "German"
                    ? "🇩🇪"
                    : listeningLanguage === "English"
                    ? "🇬🇧"
                    : listeningLanguage === "French"
                    ? "🇫🇷"
                    : "🇮🇳"}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{listeningLanguage}</h3>
              </div>
            </div>
          </div>

          <a
            href="/language-preferences"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all self-start sm:self-auto"
          >
            Change Listening Language
            <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-4">
                <Video size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">🎥 Create a Meeting</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Start a live video conversation and invite participants. Each participant can hear the call in their own preferred language.
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
            >
              Create Meeting
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
                <Link2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">🔗 Join a Meeting</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Enter a meeting ID to join an existing conversation and choose what language you want to hear.
              </p>
            </div>

            <form onSubmit={handleJoinSubmit} className="mt-6 space-y-3">
              <input
                type="text"
                placeholder="Enter Meeting ID (e.g. 849-204-192)"
                value={joinIdInput}
                onChange={(e) => setJoinIdInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                className="w-full rounded-xl border border-blue-600 bg-blue-50 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100 transition-all cursor-pointer"
              >
                Join Meeting
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
      />
    </DashboardLayout>
  );
}
