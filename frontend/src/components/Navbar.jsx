import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { user, logout, addToast } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (anchorId) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/${anchorId}`);
    } else {
      document.getElementById(anchorId.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    const data = await logout();
    if (data && data.success) {
      navigate('/login');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'glass-navbar border-slate-100 shadow-sm' : 'border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between transition-all duration-300">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group hover:scale-105 transition-transform duration-300">
          <img
            src="/logo.jpg"
            alt="WorkSphere Emblem"
            className="h-11 sm:h-12 w-auto object-contain rounded-xl p-0.5 bg-white border border-slate-200/80 shadow-sm shadow-cyan-500/10 group-hover:shadow-cyan-500/20 transition-all shrink-0"
          />
          <div className="flex flex-col justify-center">
            <span className="font-poppins font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-cyan-600 via-primary to-indigo-600 bg-clip-text text-transparent leading-none">
              WorkSphere
            </span>
            <span className="text-[9.5px] font-bold tracking-widest text-cyan-600 uppercase mt-1 hidden sm:block">
              CONNECT • COLLABORATE • SUCCEED
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium">
          <button onClick={() => handleNavClick('#home')} className="text-text-light hover:text-primary transition-colors cursor-pointer outline-none">Home</button>
          <button onClick={() => handleNavClick('#about')} className="text-text-light hover:text-primary transition-colors cursor-pointer outline-none">About</button>
          <button onClick={() => handleNavClick('#services')} className="text-text-light hover:text-primary transition-colors cursor-pointer outline-none">Services</button>
          <button onClick={() => handleNavClick('#portfolio')} className="text-text-light hover:text-primary transition-colors cursor-pointer outline-none">Portfolio</button>
          <button onClick={() => handleNavClick('#pricing')} className="text-text-light hover:text-primary transition-colors cursor-pointer outline-none">Pricing</button>
          <button onClick={() => handleNavClick('#blog')} className="text-text-light hover:text-primary transition-colors cursor-pointer outline-none">Blog</button>
          <button onClick={() => handleNavClick('#faq')} className="text-text-light hover:text-primary transition-colors cursor-pointer outline-none">FAQ</button>
          <button onClick={() => handleNavClick('#contact')} className="text-text-light hover:text-primary transition-colors cursor-pointer outline-none">Contact</button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => addToast("Press Ctrl + K anywhere to open search commands!")}
            className="p-2 text-text-light hover:text-primary hover:bg-slate-100 rounded-full transition-all"
            title="Search Commands (Ctrl + K)"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => addToast("Premium White Theme optimized for reading comfort.")}
            className="p-2 text-text-light hover:text-primary hover:bg-slate-100 rounded-full transition-all"
          >
            <Sun className="w-5 h-5" />
          </button>

          {/* Auth buttons & Dashboard links for Desktop */}
          {!user ? (
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login" className="text-sm font-medium text-text-light hover:text-primary transition-colors py-2 px-4">Login</Link>
              <Link to="/register" className="text-sm font-medium bg-slate-100 text-text-dark hover:bg-slate-200 py-2 px-4 rounded-xl transition-all">Sign Up</Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3 text-xs">
              {user.role === 'ROLE_ADMIN' ? (
                <Link to="/admin/dashboard" className="font-semibold text-primary hover:underline py-2">Admin Panel</Link>
              ) : user.role === 'ROLE_INTERN' ? (
                <Link to="/intern/dashboard" className="font-semibold text-indigo-600 hover:underline py-2">Intern Portal</Link>
              ) : (
                <Link to="/client/dashboard" className="font-semibold text-primary hover:underline py-2">Workspace</Link>
              )}
              <button onClick={handleLogout} className="font-semibold text-rose-500 hover:text-rose-700 py-2 px-2 cursor-pointer">Logout</button>
            </div>
          )}

          <Link to="/project-request" className="hidden sm:inline-flex bg-gradient-to-r from-primary to-accent text-white font-medium text-sm py-2 px-5 rounded-full hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Hire Me
          </Link>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-text-light hover:text-primary rounded-xl transition-colors cursor-pointer">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-6 py-6 space-y-3 shadow-xl">
          <button onClick={() => handleNavClick('#home')} className="block w-full text-left text-base font-medium text-text-light hover:text-primary py-2 border-b border-slate-50">Home</button>
          <button onClick={() => handleNavClick('#about')} className="block w-full text-left text-base font-medium text-text-light hover:text-primary py-2 border-b border-slate-50">About</button>
          <button onClick={() => handleNavClick('#services')} className="block w-full text-left text-base font-medium text-text-light hover:text-primary py-2 border-b border-slate-50">Services</button>
          <button onClick={() => handleNavClick('#portfolio')} className="block w-full text-left text-base font-medium text-text-light hover:text-primary py-2 border-b border-slate-50">Portfolio</button>
          <button onClick={() => handleNavClick('#pricing')} className="block w-full text-left text-base font-medium text-text-light hover:text-primary py-2 border-b border-slate-50">Pricing</button>
          <button onClick={() => handleNavClick('#contact')} className="block w-full text-left text-base font-medium text-text-light hover:text-primary py-2">Contact</button>
          
          <div className="pt-2 pb-1">
            <Link 
              to="/project-request" 
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center font-bold bg-gradient-to-r from-primary to-accent text-white py-3 px-4 rounded-xl shadow-md shadow-primary/20"
            >
              Hire Me
            </Link>
          </div>

          {!user ? (
            <div className="pt-2 flex flex-col space-y-2.5">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-center font-medium text-text-light py-2.5 px-4 rounded-xl border border-slate-200">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="text-center font-medium bg-primary text-white py-2.5 px-4 rounded-xl">Sign Up</Link>
            </div>
          ) : (
            <div className="pt-2 flex flex-col space-y-2.5">
              {user.role === 'ROLE_ADMIN' ? (
                <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="text-center font-bold text-white bg-indigo-600 py-2.5 px-4 rounded-xl shadow-sm">Admin Panel</Link>
              ) : user.role === 'ROLE_INTERN' ? (
                <Link to="/intern/dashboard" onClick={() => setMobileOpen(false)} className="text-center font-bold text-white bg-indigo-600 py-2.5 px-4 rounded-xl shadow-sm">Intern Portal</Link>
              ) : (
                <Link to="/client/dashboard" onClick={() => setMobileOpen(false)} className="text-center font-bold text-white bg-primary py-2.5 px-4 rounded-xl shadow-sm">Workspace</Link>
              )}
              <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="text-center font-bold text-rose-600 py-2.5 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 cursor-pointer">Logout</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
