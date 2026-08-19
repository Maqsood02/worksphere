import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('worksphere_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  
  const saveUserSession = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('worksphere_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('worksphere_user');
    }
  };

  // Custom Toast trigger
  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    
    // Auto-remove toast after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check auth session on application mount
  const checkAuth = async () => {
    try {
      const data = await api.me();
      if (data && data.authenticated && data.user) {
        saveUserSession(data.user);
        syncUnreadChatCount();
      } else {
        const saved = localStorage.getItem('worksphere_user');
        if (!saved) {
          saveUserSession(null);
        }
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncUnreadChatCount = async () => {
    try {
      const data = await api.getUnreadCount();
      if (data && data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Perform User login
  const loginUser = async (username, password) => {
    const data = await api.login(username, password);
    if (data && data.success) {
      saveUserSession(data.user);
      addToast(`Welcome back, ${data.user.name}!`);
      syncUnreadChatCount();
    }
    return data;
  };

  // Perform User registration
  const registerUser = async (payload) => {
    const data = await api.register(payload);
    if (data && data.success) {
      saveUserSession(data.user);
      addToast(`Account created! Welcome, ${data.user.name}.`);
    }
    return data;
  };

  // Perform User logout (Instant UI response)
  const logoutUser = () => {
    saveUserSession(null);
    setUnreadCount(0);
    addToast("Logged out successfully.");
    api.logout().catch(() => {});
  };

  // Verify OTP
  const verifyOtpCode = async (username, otp) => {
    const data = await api.verifyOtp(username, otp);
    if (data && data.success) {
      saveUserSession(data.user);
      syncUnreadChatCount();
    }
    return data;
  };

  // Resend OTP
  const resendOtpCode = async (username) => {
    return await api.resendOtp(username);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      loading,
      unreadCount,
      toasts,
      addToast,
      login: loginUser,
      register: registerUser,
      verifyOtp: verifyOtpCode,
      resendOtp: resendOtpCode,
      logout: logoutUser,
      checkAuth,
      syncUnreadChatCount
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
