import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { User as UserIcon, Lock, Mic, Bell, Volume2, Video, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LinguaLive AI" },
      { name: "description", content: "Manage your profile, audio/video devices, and default listening language." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [listeningLanguage, setListeningLanguage] = useState(user?.listeningLanguage || "Telugu");
  const [savedMsg, setSavedMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg("Settings saved successfully.");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your account details, audio/video devices, and listening language preferences.
          </p>
        </div>

        <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
          {[
            { id: "profile", label: "Profile", icon: UserIcon },
            { id: "account", label: "Account & Password", icon: Lock },
            { id: "audio", label: "Audio & Video", icon: Mic },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "language", label: "Default Listening Language", icon: Volume2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {savedMsg && (
          <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <Check size={16} className="text-emerald-600" />
            {savedMsg}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            {activeTab === "profile" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Profile Information</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Account & Security</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "audio" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Audio & Video Setup</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Microphone Device</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none">
                    <option>Default Microphone (Internal Array)</option>
                    <option>Wireless Earbuds Mic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Speaker Device</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none">
                    <option>Default Speakers (Headphones)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => alert("Testing microphone & speakers...")}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Mic size={14} /> Test Audio
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Testing camera feed...")}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Video size={14} /> Test Video
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Notification Settings</h3>

                <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-blue-600" />
                  Meeting Reminders (Email & In-App)
                </label>

                <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-blue-600" />
                  Meeting Invitations
                </label>
              </div>
            )}

            {activeTab === "language" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Default Listening Language</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This is the language you want to hear during live meetings. You can speak naturally in any language.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Language I want to hear</label>
                  <select
                    value={listeningLanguage}
                    onChange={(e) => setListeningLanguage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Telugu">🇮🇳 Telugu (తెలుగు)</option>
                    <option value="English">🇬🇧 English</option>
                    <option value="German">🇩🇪 German (Deutsch)</option>
                    <option value="Hindi">🇮🇳 Hindi (हिन्दी)</option>
                    <option value="French">🇫🇷 French (Français)</option>
                    <option value="Spanish">🇪🇸 Spanish (Español)</option>
                    <option value="Tamil">🇮🇳 Tamil (தமிழ்)</option>
                    <option value="Kannada">🇮🇳 Kannada (కన్నడ)</option>
                    <option value="Malayalam">🇮🇳 Malayalam (മലയാളം)</option>
                    <option value="Japanese">🇯🇵 Japanese (日本語)</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
