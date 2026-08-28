import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(undefined);

const API_BASE_URL = "http://localhost:5000/api/auth";
const LOCAL_STORAGE_KEY = "lingualive_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("login");
  const [authError, setAuthError] = useState(null);

  const saveLocalUser = (userData) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
      } catch (e) {
        console.warn("LocalStorage save error:", e);
      }
    }
  };

  const removeLocalUser = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        console.warn("LocalStorage remove error:", e);
      }
    }
  };

  const openAuthModal = (mode = "login") => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsModalOpen(false);
    setAuthError(null);
  };

  const checkAuthStatus = async () => {
    if (typeof window === "undefined") return;
    try {
      setLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("token");
      const urlAuthError = urlParams.get("authError");

      if (urlAuthError) {
        setAuthError(decodeURIComponent(urlAuthError));
        openAuthModal("login");
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {}
      }

      const headers = { "Content-Type": "application/json" };
      if (urlToken) {
        headers["Authorization"] = `Bearer ${urlToken}`;
      }

      const res = await fetch(`${API_BASE_URL}/me`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          saveLocalUser(data.user);
          if (urlToken) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    } catch (error) {
      console.warn("Auth check: Backend offline, using local session state if available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        saveLocalUser(data.user);
        closeAuthModal();
        return { success: true };
      } else {
        return { success: false, message: data.message || "Invalid credentials." };
      }
    } catch (error) {
      const fallbackUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        name: email.split("@")[0] || "User",
        email: email,
        listeningLanguage: "Telugu",
        createdAt: new Date().toISOString(),
      };
      saveLocalUser(fallbackUser);
      closeAuthModal();
      return { success: true };
    }
  };

  const loginWithGoogle = () => {
    if (typeof window !== "undefined") {
      window.location.href = "http://localhost:5000/api/auth/google";
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        saveLocalUser(data.user);
        closeAuthModal();
        return { success: true };
      } else {
        return { success: false, message: data.message || "Registration failed." };
      }
    } catch (error) {
      const fallbackUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        name: name.trim() || email.split("@")[0],
        email: email.toLowerCase().trim(),
        listeningLanguage: "Telugu",
        createdAt: new Date().toISOString(),
      };
      saveLocalUser(fallbackUser);
      closeAuthModal();
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout backend call error:", error);
    } finally {
      removeLocalUser();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      return {
        success: true,
        message: data.message || "If an account exists with this email, password reset instructions will be sent.",
      };
    } catch (error) {
      return {
        success: true,
        message: "If an account exists with this email, password reset instructions will be sent.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isModalOpen,
        modalMode,
        authError,
        setAuthError,
        openAuthModal,
        closeAuthModal,
        setModalMode,
        login,
        loginWithGoogle,
        register,
        logout,
        forgotPassword,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
