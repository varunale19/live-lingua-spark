import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Video,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Plus,
  Copy,
  Check,
  MoreVertical,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Radio,
  X,
  Volume2,
  XCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "My Meetings — LinguaLive AI" },
      { name: "description", content: "View and manage your translation meetings and participant listening preferences." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDetailsMeeting, setSelectedDetailsMeeting] = useState(null);
  const [confirmCancelMeeting, setConfirmCancelMeeting] = useState(null); // Stores meeting object to delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Form states for schedule modal
  const [schedName, setSchedName] = useState("");
  const [schedDesc, setSchedDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMeetings(true);
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      fetchMeetings(false); // Silent background polling
    }, 4000);

    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click", closeMenu);
    };
  }, []);

  const fetchMeetings = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("http://localhost:5000/api/meetings", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.meetings) {
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error("Fetch meetings error:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const copyMeetingId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJoinRoom = async (meetingId) => {
    try {
      await fetch("http://localhost:5000/api/meetings/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ meetingId }),
      });
    } catch (e) {}
    navigate({ to: "/room", search: { id: meetingId } });
  };

  // Permanent Delete Confirmation Execution
  const executePermanentDelete = async () => {
    if (!confirmCancelMeeting) return;
    setIsDeleting(true);
    try {
      const res = await fetch("http://localhost:5000/api/meetings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ meetingId: confirmCancelMeeting.meetingId }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmCancelMeeting(null);
        fetchMeetings(false);
      }
    } catch (err) {
      console.error("Error deleting meeting:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/meetings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: schedName.trim(),
          description: schedDesc.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsScheduleModalOpen(false);
        setSchedName("");
        setSchedDesc("");
        fetchMeetings(false);
      }
    } catch (error) {
      console.error("Schedule error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "upcoming" && (m.status === "upcoming" || m.status === "scheduled")) ||
      (activeTab === "live" && m.status === "live") ||
      (activeTab === "completed" && m.status === "completed");

    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.meetingId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const counts = {
    all: meetings.length,
    upcoming: meetings.filter((m) => m.status === "upcoming" || m.status === "scheduled").length,
    live: meetings.filter((m) => m.status === "live").length,
    completed: meetings.filter((m) => m.status === "completed").length,
  };

  const getAvatarBg = (name) => {
    const safeName = typeof name === "string" && name.length > 0 ? name : "A";
    const char = safeName.charAt(0).toUpperCase();
    if (char >= "A" && char <= "H") return "bg-blue-600 text-white";
    if (char >= "I" && char <= "P") return "bg-purple-600 text-white";
    return "bg-indigo-600 text-white";
  };

  const liveMeeting = meetings.find((m) => m.status === "live");

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Meetings</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            View and manage your translation meetings and participant listening preferences.
          </p>
        </div>

        {/* Live Notification Banner */}
        {liveMeeting && (
          <div className="rounded-2xl bg-emerald-600 text-white p-4 border border-emerald-500 flex items-center justify-between gap-4 shadow-lg shadow-emerald-500/20 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <div>
                <p className="font-extrabold text-sm flex items-center gap-2">
                  <span>LIVE MEETING IN PROGRESS</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
                    #{liveMeeting.meetingId}
                  </span>
                </p>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  "{liveMeeting.name}" is running now ({liveMeeting.time}). Click Enter Room to join immediately.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleJoinRoom(liveMeeting.meetingId)}
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-emerald-700 shadow-md hover:bg-emerald-50 transition-all shrink-0 cursor-pointer"
            >
              Enter Room
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Info Banner */}
        <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-100/80 flex items-center gap-3 text-xs text-blue-900 shadow-2xs">
          <Info size={18} className="text-blue-600 shrink-0" />
          <span className="font-medium leading-relaxed">
            Participants can speak naturally in any language or combination of languages. Each participant receives translated audio in their own selected listening language.
          </span>
        </div>

        {/* Tabs, Search & Action Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All Meetings
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "upcoming"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Upcoming
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === "upcoming" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {counts.upcoming}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("live")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "live"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === "live" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                {counts.live}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "completed"
                  ? "bg-slate-800 text-white shadow-md shadow-slate-700/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Completed
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === "completed" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {counts.completed}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              onClick={() => {
                setSchedName("");
                setSchedDesc("");
                setIsScheduleModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer shrink-0"
            >
              <Plus size={16} />
              Schedule Meeting
            </button>
          </div>
        </div>

        {/* Meetings Table Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 font-bold uppercase tracking-wider text-[11px] text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">MEETING</th>
                  <th className="px-6 py-3.5">PARTICIPANTS</th>
                  <th className="px-6 py-3.5">LISTENING LANGUAGES</th>
                  <th className="px-6 py-3.5">DATE & TIME</th>
                  <th className="px-6 py-3.5">DURATION</th>
                  <th className="px-6 py-3.5">STATUS</th>
                  <th className="px-6 py-3.5">ACTION</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Loading meetings from MongoDB...
                    </td>
                  </tr>
                ) : filteredMeetings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No meetings found in this view.
                    </td>
                  </tr>
                ) : (
                  filteredMeetings.map((m) => {
                    const isLive = m.status === "live";
                    const isUpcoming = m.status === "upcoming" || m.status === "scheduled";
                    const isCompleted = m.status === "completed";
                    const participants = m.participants || [];

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* MEETING */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`relative flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                                isLive
                                  ? "bg-emerald-50 text-emerald-600"
                                  : isUpcoming
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-purple-50 text-purple-600"
                              }`}
                            >
                              <Video size={18} />
                              {isLive && (
                                <span className="absolute -bottom-1 rounded-full bg-red-600 px-1 py-[1px] text-[8px] font-extrabold uppercase text-white tracking-tighter">
                                  LIVE
                                </span>
                              )}
                            </div>

                            <div>
                              <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-mono text-slate-400">ID: {m.meetingId}</span>
                                <button
                                  onClick={(e) => copyMeetingId(m.meetingId, e)}
                                  className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                  title="Copy Meeting ID"
                                >
                                  {copiedId === m.meetingId ? (
                                    <Check size={12} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* PARTICIPANTS */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 overflow-hidden">
                              {participants.slice(0, 3).map((p, idx) => {
                                const displayName = p?.displayName || p?.name || "Participant";
                                return (
                                  <div
                                    key={idx}
                                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold ${getAvatarBg(
                                      displayName
                                    )}`}
                                  >
                                    {displayName.charAt(0).toUpperCase()}
                                  </div>
                                );
                              })}
                              {participants.length > 3 && (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600">
                                  +{participants.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                              {participants.length} {participants.length === 1 ? "participant" : "participants"}
                            </span>
                          </div>
                        </td>

                        {/* LISTENING LANGUAGES */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {participants.slice(0, 2).map((p, idx) => {
                              const pName = p?.name || p?.displayName || "user";
                              return (
                                <div key={idx} className="flex items-center gap-1.5 text-xs">
                                  <span className="text-slate-500 font-medium">{pName}:</span>
                                  <span className="font-bold text-blue-700">{p?.listeningLanguage || "Telugu"}</span>
                                </div>
                              );
                            })}
                            {participants.length > 2 && (
                              <span className="text-[11px] font-semibold text-slate-400 hover:text-slate-600">
                                +{participants.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* DATE & TIME */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                              <Calendar size={13} className="text-slate-400" />
                              {m.date}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 font-bold text-[11px]">
                              <Clock size={13} className="text-blue-500" />
                              {m.time}
                            </div>
                          </div>
                        </td>

                        {/* DYNAMIC DURATION */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {m.duration && m.duration !== "—" ? (
                            <div>
                              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                                <Clock size={13} className="text-slate-400" />
                                {m.duration}
                              </div>

                              {isLive ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 mt-1">
                                  {m.durationLabel}
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                                  {m.durationLabel}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">—</span>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isUpcoming && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                              Upcoming
                            </span>
                          )}

                          {isLive && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              Live
                            </span>
                          )}

                          {isCompleted && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                              <CheckCircle2 size={13} className="text-slate-500" />
                              Completed
                            </span>
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isUpcoming && (
                              <button
                                onClick={() => handleJoinRoom(m.meetingId)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
                              >
                                Join Room
                                <ArrowRight size={13} />
                              </button>
                            )}

                            {isLive && (
                              <button
                                onClick={() => handleJoinRoom(m.meetingId)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all cursor-pointer"
                              >
                                Enter Room
                                <ArrowRight size={13} />
                              </button>
                            )}

                            {isCompleted && (
                              <button
                                onClick={() => setSelectedDetailsMeeting(m)}
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                View Details
                              </button>
                            )}

                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === m.meetingId ? null : m.meetingId);
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {openMenuId === m.meetingId && (
                                <div className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100 text-xs font-semibold animate-in fade-in zoom-in-95 duration-150">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      setConfirmCancelMeeting(m); // Triggers Warning Confirmation Box
                                    }}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                    Cancel Meeting
                                  </button>
                                  <button
                                    onClick={(e) => copyMeetingId(m.meetingId, e)}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                  >
                                    <Copy size={14} />
                                    Copy Meeting ID
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="bg-slate-50/60 border-t border-slate-200/80 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              Showing <strong className="text-slate-900">{filteredMeetings.length > 0 ? 1 : 0}</strong> to{" "}
              <strong className="text-slate-900">{filteredMeetings.length}</strong> of{" "}
              <strong className="text-slate-900">{meetings.length}</strong> meetings
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 disabled:opacity-50">
                  <ChevronLeft size={16} />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600">
                  1
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50">
                  2
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                  <ChevronRight size={16} />
                </button>
              </div>

              <select className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none">
                <option>10 per page</option>
                <option>25 per page</option>
                <option>50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Warning Modal before Permanent Deletion */}
      {confirmCancelMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setConfirmCancelMeeting(null)}
          />

          <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl z-10 border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Cancel & Delete Meeting?</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: #{confirmCancelMeeting.meetingId}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-red-50/70 p-4 border border-red-100 text-xs text-red-900 space-y-2">
              <p className="font-semibold leading-relaxed">
                Are you sure you want to cancel and permanently delete <strong className="text-red-950 font-extrabold">"{confirmCancelMeeting.name}"</strong>?
              </p>
              <p className="text-[11px] text-red-700 leading-normal">
                ⚠️ This action will completely erase this meeting and all participant records from MongoDB. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelMeeting(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Keep Meeting
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={executePermanentDelete}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:bg-red-700 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                {isDeleting ? "Deleting..." : "Yes, Delete Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsScheduleModalOpen(false)} />

          <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl z-10 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Schedule a Meeting</h3>
                  <p className="text-xs text-slate-500">Create a translation room for your session</p>
                </div>
              </div>

              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Call"
                  value={schedName}
                  onChange={(e) => setSchedName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Multilingual project discussion"
                  value={schedDesc}
                  onChange={(e) => setSchedDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="rounded-xl bg-blue-50/70 p-3.5 border border-blue-100 text-xs text-slate-600">
                <span className="font-bold text-blue-700 flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} /> Automatic Lifecycle Tracking
                </span>
                Start time and duration are automatically recorded when you enter and finish the meeting room.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? "Creating Meeting..." : "Create Meeting"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Completed Meeting Details Modal */}
      {selectedDetailsMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedDetailsMeeting(null)} />

          <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl z-10 border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{selectedDetailsMeeting.name}</h3>
                  <p className="text-xs font-mono text-slate-400">ID: #{selectedDetailsMeeting.meetingId}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailsMeeting(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Status</span>
                  <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Completed
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Recorded Duration</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDetailsMeeting.duration}</p>
                </div>

                <div className="col-span-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Date & Time</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {selectedDetailsMeeting.date} ({selectedDetailsMeeting.time})
                  </p>
                </div>
              </div>

              {selectedDetailsMeeting.description && (
                <div className="pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Description</span>
                  <p className="text-slate-600 mt-0.5">{selectedDetailsMeeting.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                Participants & Listening Languages
              </h4>

              <div className="space-y-2">
                {(selectedDetailsMeeting.participants || []).map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/70 p-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs">
                        {(p.displayName || p.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900">{p.displayName || p.name}</span>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-700 border border-blue-100 text-[11px]">
                      🎧 Listening: {p.listeningLanguage || "Telugu"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedDetailsMeeting(null)}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
