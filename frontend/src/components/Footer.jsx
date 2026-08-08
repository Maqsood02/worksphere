import React from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { addToast } = useApp();

  return (
    <footer className="bg-slate-50 border-t border-slate-100 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm text-text-light">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.jpg"
              alt="WorkSphere Emblem"
              className="h-14 w-auto object-contain rounded-xl p-0.5 bg-white border border-slate-200/80 shadow-sm shadow-cyan-500/10 shrink-0"
            />
            <div className="flex flex-col justify-center">
              <h3 className="font-poppins font-extrabold text-2xl tracking-tight bg-gradient-to-r from-cyan-600 via-primary to-indigo-600 bg-clip-text text-transparent leading-none">
                WorkSphere
              </h3>
              <p className="text-[10px] font-bold tracking-widest text-cyan-600 uppercase mt-1">
                CONNECT • COLLABORATE • SUCCEED
              </p>
            </div>
          </div>
          <p className="max-w-xs leading-relaxed">Crafting high-performance web applications, beautiful UI/UX, and robust Java/MongoDB backends for companies worldwide.</p>
          <div className="flex items-center space-x-3 pt-2 text-slate-500">
            {/* Github */}
            <a href="#" className="hover:text-primary transition-colors" aria-label="GitHub">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd" />
              </svg>
            </a>
            {/* Linkedin */}
            <a href="#" className="hover:text-primary transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
            {/* Twitter */}
            <a href="#" className="hover:text-primary transition-colors" aria-label="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-poppins font-semibold text-sm text-text-dark uppercase tracking-wider mb-4">Core Services</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-primary transition-colors">Spring Boot Backend</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Enterprise Web Apps</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">MongoDB Database Design</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Full-Stack Platforms</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">UI/UX Prototypes</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-poppins font-semibold text-sm text-text-dark uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="/#about" className="hover:text-primary transition-colors">About Story</a></li>
            <li><a href="/#portfolio" className="hover:text-primary transition-colors">Showcase Portfolio</a></li>
            <li><a href="/#pricing" className="hover:text-primary transition-colors">Simple Pricing</a></li>
            <li><a href="/#blog" className="hover:text-primary transition-colors">Tech Blog</a></li>
            <li><a href="/project-request" className="hover:text-primary transition-colors">Hire Request</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-poppins font-semibold text-sm text-text-dark uppercase tracking-wider mb-2">Subscribe to newsletter</h4>
          <p className="text-xs leading-relaxed">Receive occasional insights about Java backend security, frontend motion design, and SaaS architectures.</p>
          <div className="flex items-center space-x-2">
            <input type="email" placeholder="Your email address" className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-text-dark outline-none focus:border-primary/50 w-full" />
            <button className="bg-primary text-white p-2.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all" onClick={() => addToast('Thank you for subscribing!')}>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 border-t border-slate-200/50 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs">
        <p>&copy; 2026 WorkSphere. All rights reserved. Created with Java & MongoDB.</p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
