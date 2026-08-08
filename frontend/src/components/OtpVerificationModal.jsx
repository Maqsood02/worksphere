import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Phone, RefreshCw, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OtpVerificationModal({ isOpen, onClose, username, email, phone, onSuccess }) {
  const { verifyOtp, resendOtp, addToast } = useApp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (isOpen && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      addToast('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    const data = await verifyOtp(username, otpCode);
    setLoading(false);

    if (data && data.success) {
      addToast('Email & Phone Number verified successfully! Access granted.');
      if (onSuccess) onSuccess(data);
      onClose();
    } else {
      addToast(data?.message || 'Invalid OTP code. Please check and try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    const data = await resendOtp(username);
    setLoading(false);

    if (data && data.success) {
      addToast('New 6-digit OTP codes have been sent to your Email & Phone Number.');
      setResendTimer(60);
      setCanResend(false);
    } else {
      addToast(data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-8 relative overflow-hidden text-center"
          >
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 via-primary to-indigo-600 rounded-2xl p-[2px] shadow-lg shadow-cyan-500/20 mx-auto mb-5 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>

            <h2 className="font-poppins font-extrabold text-2xl text-text-dark tracking-tight">
              Verify Email & Phone
            </h2>
            <p className="text-xs text-text-light mt-1.5 max-w-xs mx-auto leading-relaxed">
              Enter the 6-digit security code sent to your registered Email & SMS Phone Number
            </p>

            {/* Badges for Email and Phone */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-600">
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                <Mail className="w-3 h-3 text-emerald-600" />
                <span>{email || 'Email OTP'}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-1" />
              </span>
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full">
                <Phone className="w-3 h-3 text-sky-600" />
                <span>{phone || 'SMS OTP'}</span>
                <CheckCircle2 className="w-3 h-3 text-sky-600 ml-1" />
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="flex justify-between items-center gap-1 sm:gap-2 max-w-sm mx-auto" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-9 sm:w-11 h-11 sm:h-13 text-center text-lg sm:text-xl font-bold font-mono text-text-dark bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner shrink-0"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-95 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Verify Both & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Resend Section */}
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-text-light">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Didn't receive code?</span>
              </span>
              <button
                onClick={handleResend}
                disabled={!canResend || loading}
                className="font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>{canResend ? 'Resend Codes' : `Resend in ${resendTimer}s`}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
