import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AlertCircle, UserCheck, GraduationCap, Sparkles, User, Mail, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import OtpVerificationModal from '../components/OtpVerificationModal';

export default function Register() {
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('ROLE_CLIENT'); // ROLE_CLIENT, ROLE_INTERN, ROLE_FREELANCER
  const [error, setError] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const navigate = useNavigate();

    // Security criteria evaluation
    const passLength = password.length >= 8;
    const passUpper = /[A-Z]/.test(password);
    const passLower = /[a-z]/.test(password);
    const passDigit = /[0-9]/.test(password);
    const passSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isPasswordValid = passLength && passUpper && passLower && passDigit && passSpecial;

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);

      if (!isPasswordValid) {
        setError("Password must be 8+ chars with uppercase, lowercase, number & special char (!@#$).");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match. Please retype your password.");
        return;
      }

      try {
        const data = await register({ name, email, phone, username, password, role });
        if (data && (data.success || data.requireOtpVerification)) {
          if (data.requireOtpVerification) {
            setShowOtpModal(true);
          } else {
            if (role === 'ROLE_INTERN') {
              navigate('/intern/dashboard');
            } else {
              navigate('/client/dashboard');
            }
          }
        } else {
          setError(data?.message || "Registration failed.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to connect to authentication server.");
      }
    };

  const handleOtpSuccess = () => {
    if (role === 'ROLE_INTERN') {
      navigate('/intern/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] mesh-gradient-bg flex items-center justify-center py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Soft Glow Blobs */}
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="glass-card w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-white/80 shadow-2xl relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Join WorkSphere Ecosystem
          </div>
          <h2 className="text-3xl font-outfit font-extrabold text-slate-900 tracking-tight">Create Your Account</h2>
          <p className="text-xs text-slate-500">Choose your role to get started with client tools or internship sprints.</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setRole('ROLE_CLIENT')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              role === 'ROLE_CLIENT' 
                ? 'bg-white text-emerald-700 shadow-md shadow-emerald-500/10 font-bold border border-emerald-200' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Client</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('ROLE_INTERN')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              role === 'ROLE_INTERN' 
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-500/10 font-bold border border-indigo-200' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Intern</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('ROLE_FREELANCER')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              role === 'ROLE_FREELANCER' 
                ? 'bg-white text-cyan-700 shadow-md shadow-cyan-500/10 font-bold border border-cyan-200' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Freelancer</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" /> Full Name *
            </label>
            <input
              type="text"
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-slate-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" /> Email Address *
              </label>
              <input
                type="email"
                id="reg-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'ROLE_INTERN' ? "alex.intern@worksphere.ac.in" : "john@company.com"}
                required
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reg-phone" className="text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone Number *
              </label>
              <input
                type="text"
                id="reg-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
                required
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-username" className="text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" /> Choose Username *
            </label>
            <input
              type="text"
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={role === 'ROLE_INTERN' ? "alex_intern" : "johndoe"}
              required
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-500" /> Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="reg-password"
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
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm-password" className="text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-500" /> Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="reg-confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-11 py-3 text-slate-900 placeholder-slate-400 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Security Strength Meter & Policy Checklist */}
          {password.length > 0 && (() => {
            const criteriaCount = [passLength, passUpper, passLower, passDigit, passSpecial].filter(Boolean).length;
            let strengthText = 'Weak';
            let strengthColor = 'text-rose-600';
            let strengthBarBg = 'bg-rose-500';
            let barWidth = '20%';

            if (criteriaCount === 5 && password.length >= 10) {
              strengthText = 'Very Strong 🛡️';
              strengthColor = 'text-emerald-700';
              strengthBarBg = 'bg-gradient-to-r from-emerald-500 to-indigo-600';
              barWidth = '100%';
            } else if (criteriaCount === 5) {
              strengthText = 'Strong ✓';
              strengthColor = 'text-emerald-600';
              strengthBarBg = 'bg-emerald-500';
              barWidth = '80%';
            } else if (criteriaCount >= 3) {
              strengthText = 'Medium';
              strengthColor = 'text-amber-600';
              strengthBarBg = 'bg-amber-500';
              barWidth = '50%';
            }

            return (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-[11px] font-medium shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Password Security Strength:</span>
                  <span className={`font-extrabold text-xs ${strengthColor}`}>{strengthText}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${strengthBarBg} transition-all duration-300 rounded-full`} style={{ width: barWidth }}></div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1 border-t border-slate-200/60">
                  <span className={`flex items-center gap-1 font-bold ${passLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passLength ? '✓' : '•'} 8+ Characters
                  </span>
                  <span className={`flex items-center gap-1 font-bold ${passUpper ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passUpper ? '✓' : '•'} 1 Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1 font-bold ${passLower ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passLower ? '✓' : '•'} 1 Lowercase (a-z)
                  </span>
                  <span className={`flex items-center gap-1 font-bold ${passDigit ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passDigit ? '✓' : '•'} 1 Number (0-9)
                  </span>
                  <span className={`flex items-center gap-1 font-bold ${passSpecial ? 'text-emerald-600' : 'text-slate-400'} col-span-2`}>
                    {passSpecial ? '✓' : '•'} 1 Special Character (!@#$%^&*)
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary via-indigo-600 to-secondary text-white font-bold text-sm py-3.5 px-6 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{role === 'ROLE_INTERN' ? 'Register Intern Account' : role === 'ROLE_FREELANCER' ? 'Register Freelancer Account' : 'Create Client Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-slate-200/80">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-black">
              Log In Instead &rarr;
            </Link>
          </p>
        </div>
      </div>

      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        username={username}
        email={email}
        phone={phone}
        onSuccess={handleOtpSuccess}
      />
    </div>
  );
}
