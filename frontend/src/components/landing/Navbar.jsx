import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AudioLines, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Navbar = () => {
  const { user, openAuthModal, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1260px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2563eb] text-white shadow-md shadow-blue-500/20">
            <AudioLines size={20} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            LinguaLive <span className="text-[#2563eb]">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
            How It Works
          </a>
          <a href="#languages" className="hover:text-blue-600 transition-colors">
            Languages
          </a>
          <a href="#about" className="hover:text-blue-600 transition-colors">
            About
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all"
              >
                <User size={15} />
                Dashboard ({user.name ? user.name.split(" ")[0] : "User"})
              </button>
              <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => openAuthModal("login")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
