import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AlertCircle, ShieldCheck, Sparkles, User, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';
import OtpVerificationModal from '../components/OtpVerificationModal';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function Login() {
  const { login, addToast, user } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const navigate = useNavigate();

  const handleRoleRedirect = (role, usernameVal) => {
    const r = (role || '').toUpperCase();
    const u = (usernameVal || '').toLowerCase().trim();
    if (r.includes('ADMIN') || u === 'worksphere') {
      navigate('/admin/dashboard');
    } else if (r.includes('INTERN') || u === 'maqsood' || u === 'chinmaykv') {
      navigate('/intern/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  const autofillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    addToast(`Autofilled credentials for @${u}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await login(username, password);
      if (data && data.success) {
        handleRoleRedirect(data.user.role, data.user.username);
      } else if (data && data.requireOtpVerification) {
        setShowOtpModal(true);
        addToast(data.message || 'OTP code sent to your email.');
      } else {
        let msg = data?.message || "Invalid credentials.";
        if (msg.includes('Account not found') || msg.includes('not found')) msg = 'Account not found.';
        if (msg.includes('Incorrect password') || msg.includes('password')) msg = 'Incorrect password.';
        if (msg.includes('Username required') || msg.includes('enter username')) msg = 'Username required.';
        if (msg.includes('Password required') || msg.includes('enter password')) msg = 'Password required.';
        setError(msg);
      }
    } catch (err) {
      console.error(err);
      setError("Server connection error.");
    }
  };

  return (
    <div className="min-h-[85vh] mesh-gradient-bg flex items-center justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Soft Glow Blobs */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/80 shadow-2xl relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Authentication
          </div>
          <h2 className="text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500">Log in to access your projects, sprint tasks, or workspace.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" /> Username or ID
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="client, intern, or admin"
              required
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-secondary" /> Password
              </label>
              <button 
                type="button" 
                className="text-[11px] text-indigo-600 hover:underline font-bold cursor-pointer" 
                onClick={() => setShowForgotPasswordModal(true)}
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-11 py-3 text-slate-900 placeholder-slate-400 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary via-indigo-600 to-secondary text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In Securely</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>



        <div className="text-center pt-2 border-t border-slate-200/80">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-black">
              Register Here &rarr;
            </Link>
          </p>
        </div>

      </div>

      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        username={username}
        onSuccess={() => {
          if (user?.role) handleRoleRedirect(user.role);
          else navigate('/client/dashboard');
        }}
      />

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSuccess={(id, newPass) => {
          if (id) setUsername(id);
          if (newPass) setPassword(newPass);
        }}
      />
    </div>
  );
}
