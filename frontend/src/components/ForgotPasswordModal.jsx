import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, X, ArrowRight, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function ForgotPasswordModal({ isOpen, onClose, onSuccess }) {
  const { addToast } = useApp();
  const [step, setStep] = useState(1); // Step 1: Identifier input, Step 2: OTP + New Password
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const inputRefs = useRef([]);

  if (!isOpen) return null;

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      addToast('Please enter your email, phone, or username.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.forgotPassword(identifier.trim());
      if (res && res.success) {
        setUserEmail(res.email || identifier);
        addToast(res.message || 'Reset code sent to your email!');
        setStep(2);
      } else {
        addToast(res?.message || 'Account not found matching this email or username.');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to send reset code. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      addToast('Please enter the full 6-digit OTP code.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      addToast('Please enter a new password (min 4 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        identifier: identifier.trim(),
        otp: fullOtp,
        newPassword: newPassword.trim(),
      });

      if (res && res.success) {
        addToast(res.message || 'Password reset successfully!');
        if (onSuccess) onSuccess(identifier, newPassword);
        onClose();
        // Reset modal state
        setStep(1);
        setOtp(['', '', '', '', '', '']);
        setNewPassword('');
      } else {
        addToast(res?.message || 'Invalid verification code or failed reset.');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600 shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-poppins font-extrabold text-xl text-slate-900">
              {step === 1 ? 'Forgot Password?' : 'Set New Password'}
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              {step === 1
                ? 'Enter your registered email, phone, or username to receive a password reset code.'
                : `Enter the 6-digit OTP code sent to ${userEmail || identifier} and your new password.`}
            </p>
          </div>

          {/* Step 1 Form */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" /> Account Email or Username
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="worksphere.ac.in@gmail.com or username"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-xs font-medium outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending Reset Code...</span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2 Form */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 text-[11px] text-indigo-900 leading-relaxed">
                <span className="font-bold">⚡ Verification Code Sent:</span> Check email <strong>{userEmail || identifier}</strong>. (Or use master test OTP: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-indigo-600 border border-indigo-200">123456</code>)
              </div>
              {/* OTP Boxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>6-Digit Verification Code *</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline"
                  >
                    Change Email
                  </button>
                </label>
                <div className="flex justify-between gap-1 sm:gap-2" onPaste={handlePaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-9 sm:w-11 h-11 sm:h-12 text-center text-base sm:text-lg font-mono font-extrabold bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-indigo-600 shrink-0"
                    />
                  ))}
                </div>
              </div>

              {/* New Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">New Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-11 py-3 text-slate-900 text-xs font-medium outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Resetting Password...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reset Password & Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
