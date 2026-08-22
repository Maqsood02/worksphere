import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const msg = typeof toast.message === 'string' ? toast.message : '';
          const isSuccess = toast.type === 'success' || 
            msg.includes('✓') || 
            msg.includes('🎉') || 
            msg.toLowerCase().includes('success') || 
            msg.toLowerCase().includes('approved') || 
            msg.toLowerCase().includes('completed') || 
            msg.toLowerCase().includes('submitted');
          
          const isWarning = toast.type === 'warning' || msg.includes('⚠️') || msg.toLowerCase().includes('revision');

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-2xl shadow-xl flex items-center space-x-3 pointer-events-auto max-w-sm backdrop-blur-md border ${
                isSuccess
                  ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-900/30'
                  : isWarning
                  ? 'bg-amber-950/90 text-amber-100 border-amber-500/40 shadow-amber-900/30'
                  : 'bg-white/95 text-slate-800 border-slate-200'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isWarning
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-indigo-50 text-indigo-600'
              }`}>
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 animate-bounce" />
                ) : isWarning ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>
              <div className="text-xs font-bold leading-relaxed">
                {toast.message}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
