import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, PlusCircle, Bot, Layout, CreditCard, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { text: 'Go to Home Page', action: () => navigate('/'), icon: Home, category: 'Nav' },
    { text: 'Submit Project Proposal Form', action: () => navigate('/project-request'), icon: PlusCircle, category: 'Action' },
    { text: 'Open Client Workspace Dashboard', action: () => navigate('/client/dashboard'), icon: Layout, category: 'Dash' },
    { text: 'Open Admin Control Panel', action: () => navigate('/admin/dashboard'), icon: Layout, category: 'Dash' },
    { text: 'Compare Pricing Packages', action: () => { navigate('/'); setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 300); }, icon: CreditCard, category: 'Nav' },
    { text: 'Read Freelance FAQs', action: () => { navigate('/'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 300); }, icon: HelpCircle, category: 'Nav' },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.text.toLowerCase().includes(query.toLowerCase())
  );

  const executeCommand = (cmd) => {
    cmd.action();
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-text-light mr-3" />
              <input
                type="text"
                placeholder="Type a command to search... (e.g. Services, About, Dashboard)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full py-4 text-base bg-transparent border-0 outline-none text-text-dark placeholder-text-light"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-text-light border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50"
              >
                ESC
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto p-2">
              <div className="px-3 py-2 text-xs font-semibold text-text-light uppercase tracking-wider">Quick Commands</div>
              
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-light">No matching commands found.</div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => executeCommand(cmd)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer text-sm"
                    >
                      <div className="flex items-center space-x-3 text-text-dark font-medium">
                        <Icon className="w-4 h-4 text-primary" />
                        <span>{cmd.text}</span>
                      </div>
                      <span className="text-[10px] text-text-light bg-slate-100 px-2 py-0.5 rounded-md font-mono">{cmd.category}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
