import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Video, Users, Languages, Settings as SettingsIcon, AudioLines, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Meetings", href: "/meetings", icon: Video },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Language Preferences", href: "/language-preferences", icon: Languages },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 shrink-0 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                <AudioLines size={20} />
              </span>
              <span className="text-[17px] font-bold tracking-tight text-slate-900">LinguaLive</span>
            </Link>
          </div>

          <div className="p-4 mx-3 my-3 rounded-2xl bg-blue-50/60 border border-blue-100/80 flex items-center gap-3">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name || "User Avatar"}
                className="h-9 w-9 rounded-xl object-cover border border-blue-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>

          <nav className="px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles size={14} className="text-blue-600" /> AI Processing
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Automatic spoken-language detection is enabled. Speak naturally in any language!
            </p>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};
