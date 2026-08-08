import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white/95 border border-slate-200 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center space-x-3 pointer-events-auto max-w-sm"
          >
            <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-xs text-text-dark font-semibold leading-relaxed">
              {toast.message}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
