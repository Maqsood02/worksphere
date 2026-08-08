import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import FloatingChat from './components/FloatingChat';
import CommandPalette from './components/CommandPalette';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectRequest from './pages/ProjectRequest';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InternDashboard from './pages/InternDashboard';

// Cursor Glow Follower Component
function CursorGlow() {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow-element';
    document.body.appendChild(cursor);

    const handleMouseMove = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cursor.remove();
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-50/20 text-text-dark flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
          <CursorGlow />
          <Navbar />
          <CommandPalette />
          
          <div className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/project-request" element={<ProjectRequest />} />
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/intern/dashboard" element={<InternDashboard />} />
            </Routes>
          </div>
          
          <Footer />
          <FloatingChat />
          <Toast />
        </div>
      </Router>
    </AppProvider>
  );
}
