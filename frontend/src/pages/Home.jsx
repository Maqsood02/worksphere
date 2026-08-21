import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Server, Database, Bot, ShieldCheck, Mail, Phone, MapPin, Search, ChevronDown, Check, 
  ArrowRight, Sun, IndianRupee, DollarSign, Sparkles, Code2, Layers, Cpu, CheckCircle2, 
  ExternalLink, Download, Clock, Star, Zap, Terminal, Laptop
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

// Dual Currency Formatter Utility ($1 USD = ₹83 INR)
const formatPrice = (usdAmount) => {
  const num = typeof usdAmount === 'number' ? usdAmount : parseFloat(String(usdAmount).replace(/[^0-9.]/g, '')) || 0;
  const inrAmount = Math.round(num * 83);
  return {
    usd: `$${num.toLocaleString()}`,
    inr: `₹${inrAmount.toLocaleString('en-IN')}`,
    dual: `$${num.toLocaleString()} (₹${inrAmount.toLocaleString('en-IN')})`
  };
};

function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = Math.max(15, Math.floor(duration / (target || 1)));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
}

export default function Home() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Currency Toggle Mode: 'dual' | 'inr' | 'usd'
  const [currencyMode, setCurrencyMode] = useState('dual');

  // About timelines state
  const [aboutTab, setAboutTab] = useState('exp');

  // Estimator State
  const [serviceBase, setServiceBase] = useState(1200);
  const [scale, setScale] = useState(1.0);
  const [priority, setPriority] = useState(1.0);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(1200);

  // Portfolio filters & modal
  const [portCategory, setPortCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  // FAQs
  const [openFaq, setOpenFaq] = useState(0);

  // Contact Form
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSendingContact, setIsSendingContact] = useState(false);

  // Calculate Estimator Budget
  useEffect(() => {
    let price = serviceBase * scale * priority;
    if (couponApplied) price *= 0.8;
    setEstimatedPrice(Math.round(price));
  }, [serviceBase, scale, priority, couponApplied]);

  const applyEstCoupon = (e) => {
    e.preventDefault();
    const code = coupon.trim().toUpperCase();
    if (code === 'WELCOME20' || code === 'WORKSPHERE20' || code === 'FREELANCE20') {
      setCouponApplied(true);
      addToast("20% Promotional Discount applied to estimate!");
    } else {
      setCouponApplied(false);
      addToast("Invalid promo coupon code. Try WELCOME20");
    }
  };

  const bookEstimatedProject = () => {
    let typeName = "Enterprise Full-Stack Platform";
    if (serviceBase === 800) typeName = "Modern Web Application";
    else if (serviceBase === 1500) typeName = "Spring Boot REST Microservices";
    else if (serviceBase === 1000) typeName = "MongoDB Document Architecture";
    else if (serviceBase === 1400) typeName = "AI Agents & Automation";

    navigate(`/project-request?type=${encodeURIComponent(typeName)}&budget=${estimatedPrice}&coupon=${coupon}`);
  };

  const submitContactForm = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      addToast("Please fill in all required fields.");
      return;
    }
    setIsSendingContact(true);
    try {
      const res = await api.submitContactInquiry(contactForm);
      if (res && res.success) {
        addToast(res.message || `Thank you, ${contactForm.name}! Your inquiry has been sent to our team.`);
      } else {
        addToast(`Thank you, ${contactForm.name}! We will get back to you shortly.`);
      }
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      addToast(`Thank you, ${contactForm.name}! Inquiry received.`);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } finally {
      setIsSendingContact(false);
    }
  };

  const portfolioProjects = [
    { 
      id: 1, 
      title: 'Enterprise Multi-Tenant SaaS Platform', 
      category: 'web', 
      badge: 'Spring Boot 3 + React 19',
      gradient: 'from-blue-600 to-indigo-600',
      desc: 'Complete full-stack enterprise platform featuring role-based access control (Admin, Intern, Client), automated billing cycles, real-time client chat, and live MongoDB document synchronization.', 
      cost: '$2,800', 
      stack: 'Java Spring Boot 3, MongoDB Atlas, React 19, Tailwind CSS',
      deliverables: ['Custom REST API Gateways', 'Encrypted Auth & Session Management', 'Interactive Responsive Dashboards']
    },
    { 
      id: 2, 
      title: 'Autonomous AI Knowledge & Task Bot', 
      category: 'ai', 
      badge: 'OpenAI GPT-4o + Vector Engine',
      gradient: 'from-purple-600 to-indigo-600',
      desc: 'Intelligent AI assistant pipeline that computes real-time proposal budgets, answers client inquiries from platform documentation, and automates support ticket escalations.', 
      cost: '$1,400', 
      stack: 'OpenAI API, Spring Web, MongoDB Atlas, Node Serverless',
      deliverables: ['Context-Aware Prompt Pipeline', 'Instant Automated Quotations', 'Live Stream Webhook Handlers']
    },
    { 
      id: 3, 
      title: 'High-Throughput Distributed Database Cluster', 
      category: 'db', 
      badge: 'MongoDB Atlas + Index Optimizer',
      gradient: 'from-emerald-600 to-teal-600',
      desc: 'Engineered high-performance database schema with compound indexing, sub-10ms query execution times, and automated aggregation controllers capable of handling millions of log events.', 
      cost: '$1,200', 
      stack: 'MongoDB Atlas, Aggregation Pipelines, Spring Data Mongo, Redis',
      deliverables: ['Compound & Text Indexing Setup', 'Zero-Downtime Data Migrations', 'Real-Time Telemetry Dashboards']
    },
  ];

  return (
    <div className="space-y-28 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section id="home" className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 relative">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '3s' }}></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Hero Pitch */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 bg-indigo-50/90 text-indigo-700 py-2 px-4 rounded-full border border-indigo-200/80 shadow-sm hover:scale-105 transition-all">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider font-poppins">Engineering Studio & Talent Ecosystem</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-black tracking-tight leading-[1.12] text-slate-900">
              Architecting Modern <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
                Enterprise Platforms
              </span> & Software
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              WorkSphere designs and ships production-grade web applications, robust Java Spring Boot backend microservices, high-throughput MongoDB databases, and luxury React interfaces for startups and enterprises globally.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={() => navigate('/project-request')} 
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold py-4 px-8 rounded-2xl shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <a 
                href="#portfolio" 
                className="w-full sm:w-auto bg-white/80 hover:bg-white text-slate-800 font-bold py-4 px-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center"
              >
                Explore Works
              </a>
            </div>

            {/* Credibility Stats Bar */}
            <div className="pt-6 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0 border-t border-slate-200/80">
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-poppins font-black text-slate-900"><Counter target={99} suffix="%" /></div>
                <div className="text-xs text-slate-500 font-medium">Delivery Success</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-poppins font-black text-slate-900"><Counter target={65} suffix="+" /></div>
                <div className="text-xs text-slate-500 font-medium">Shipped Projects</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl sm:text-3xl font-poppins font-black text-slate-900">&lt;10ms</div>
                <div className="text-xs text-slate-500 font-medium">API Latency</div>
              </div>
            </div>
          </div>

          {/* Right Column: Code & Architecture Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 text-left">
              
              {/* Header Dots */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-rose-500 rounded-full block"></span>
                  <span className="w-3 h-3 bg-amber-400 rounded-full block"></span>
                  <span className="w-3 h-3 bg-emerald-500 rounded-full block"></span>
                </div>
                <div className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 py-1 px-3 rounded-lg font-bold flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-indigo-400" />
                  <span>WorkSphereArchitecture.java</span>
                </div>
              </div>

              {/* Code Snippet */}
              <pre className="font-mono text-[11px] sm:text-xs text-slate-300 leading-relaxed overflow-x-auto space-y-1 py-1">
{`@RestController
@RequestMapping("/api/v1/workload")
public class PlatformArchitecture {

  @Autowired
  private ClusterService cluster;

  @PostMapping("/deploy")
  public ResponseEntity<Deployment> launch() {
    return ResponseEntity.ok(
      Deployment.builder()
        .stack("React 19 + Spring Boot 3")
        .database("MongoDB Atlas Enterprise")
        .security("Multi-Role JWT & Sessions")
        .status(SystemStatus.LIVE_PROD)
        .build()
    );
  }
}`}
              </pre>

              {/* Sub-badge */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>MongoDB Atlas Verified</span>
                </div>
                <span className="text-slate-400 font-mono">100% Type-Safe REST</span>
              </div>
            </div>

            {/* Floating Live Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3.5 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wide">ENTERPRISE SECURE</div>
                <div className="text-[11px] text-slate-500 font-medium">End-to-End Encrypted Auth</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TECH LOGO TICKER */}
      <section className="py-10 bg-slate-50/80 border-y border-slate-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-6 font-poppins">
            Engineered with Modern Industry-Standard Technologies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            <div className="flex items-center space-x-2.5 text-slate-700 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Globe className="w-5 h-5 text-indigo-600" />
              <span>React 19 & Next.js</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Server className="w-5 h-5 text-emerald-600" />
              <span>Java Spring Boot 3</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Database className="w-5 h-5 text-green-600" />
              <span>MongoDB Atlas</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Bot className="w-5 h-5 text-purple-600" />
              <span>OpenAI & LLM Workflows</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Sun className="w-5 h-5 text-sky-500" />
              <span>Tailwind CSS v4</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT & LEADERSHIP SECTION */}
      <section id="about" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Platform Profile */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-600 mx-auto flex items-center justify-center text-white text-3xl font-black font-poppins shadow-xl shadow-indigo-500/25 border-4 border-white">
                WS
              </div>
              
              <div className="space-y-1.5">
                <h3 className="font-poppins font-black text-2xl text-slate-900">WorkSphere Engineering</h3>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Enterprise Full-Stack Architecture Studio</p>
                <p className="text-xs text-slate-500 font-medium pt-2 leading-relaxed">
                  Founded and led by <strong>Maqsood MD</strong>, providing architectural excellence, enterprise software consulting, and structured intern mentorship programs.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Bangalore, India</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ISO & Academic Verified</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-xs text-slate-900">Platform Capability Deck</h4>
                  <p className="text-[10px] text-slate-400">Technical Specifications 2026</p>
                </div>
              </div>
              <button 
                onClick={() => addToast('WorkSphere Technical Overview initialized!')} 
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
              >
                <span>View Deck</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Experience Timeline & Competencies */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-2">
              <span className="text-xs font-black text-indigo-600 tracking-widest uppercase font-poppins">Engineering Excellence</span>
              <h2 className="text-3xl sm:text-4xl font-poppins font-black text-slate-900">Proven Architecture & Development</h2>
            </div>

            <div className="flex space-x-2 border-b border-slate-200">
              <button 
                onClick={() => setAboutTab('exp')} 
                className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${aboutTab === 'exp' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Core Track Record
              </button>
              <button 
                onClick={() => setAboutTab('edu')} 
                className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${aboutTab === 'edu' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Technology Specializations
              </button>
            </div>

            {aboutTab === 'exp' ? (
              <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-indigo-600 border-2 border-white rounded-full shadow-sm"></span>
                  <h4 className="text-sm font-extrabold text-slate-900">Lead Enterprise Software Architect & Founder</h4>
                  <p className="text-xs text-indigo-600 font-bold">2024 - Present &bull; WorkSphere Studio</p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Spearheaded development of multi-role portal ecosystems, automated task backlogs, scalable Spring Boot microservices, and live MongoDB document engines.
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full shadow-sm"></span>
                  <h4 className="text-sm font-extrabold text-slate-900">Full-Stack Cloud Systems Engineer</h4>
                  <p className="text-xs text-blue-600 font-bold">2022 - 2024 &bull; Enterprise SaaS Projects</p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Engineered payment gateway webhooks, JWT token session authenticators, and automated email/SMS dispatch notification services.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-indigo-600 border-2 border-white rounded-full shadow-sm"></span>
                  <h4 className="text-sm font-extrabold text-slate-900">Full-Stack Software Engineering & Distributed DBs</h4>
                  <p className="text-xs text-indigo-600 font-bold">Comprehensive Technical Stack</p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Mastery in Java Spring Boot REST APIs, MongoDB Atlas Sharding & Indexing, React 19 Client SPA, and Serverless Edge functions.
                  </p>
                </div>
              </div>
            )}

            {/* Skill Bars */}
            <div className="space-y-4 pt-2">
              <h4 className="font-poppins font-extrabold text-xs text-slate-800 uppercase tracking-wider">Technical Proficiency & Architecture Ratings</h4>
              <div className="space-y-3.5 text-xs font-bold">
                <div>
                  <div className="flex items-center justify-between mb-1 text-slate-700">
                    <span>Java Spring Boot 3 & Microservices Architecture</span>
                    <span className="text-indigo-600 font-extrabold">98%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-slate-700">
                    <span>React 19, Vite & Tailwind CSS Modern Visuals</span>
                    <span className="text-indigo-600 font-extrabold">95%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-slate-700">
                    <span>MongoDB Atlas Document Design & Aggregations</span>
                    <span className="text-indigo-600 font-extrabold">92%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE SERVICES & CAPABILITIES */}
      <section id="services" className="bg-slate-50/70 py-24 px-4 sm:px-6 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black text-indigo-600 tracking-widest uppercase font-poppins">Our Engineering Offerings</span>
            <h2 className="text-3xl sm:text-4xl font-poppins font-black text-slate-900">Custom Software & Platform Solutions</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every deliverable is crafted from scratch with clean architecture, strict database persistence, responsive mobile-first UIs, and enterprise security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1 */}
            <div className="bg-white p-7 border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group text-left">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-black text-base text-slate-900">Modern Web Applications</h3>
                <p className="text-xs text-slate-500 leading-relaxed">High-converting, responsive landing pages, client dashboards, and interactive user interfaces.</p>
                <ul className="text-[11px] text-slate-600 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600" /> React 19 + Vite</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600" /> Tailwind CSS Styling</li>
                </ul>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Starts at</span>
                  <span className="font-black text-base text-slate-900">$800</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">₹66,400 INR</span>
                </div>
                <button 
                  onClick={() => navigate('/project-request?type=Modern%20Web%20Application&budget=800')} 
                  className="bg-slate-100 hover:bg-indigo-600 hover:text-white py-2 px-4 rounded-xl font-bold transition-all text-xs cursor-pointer"
                >
                  Book Plan
                </button>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-white p-7 border-2 border-indigo-600/30 rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group text-left relative">
              <div className="absolute top-3 right-3 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold px-2.5 py-1 rounded-full border border-indigo-200 uppercase">POPULAR</div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/20">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-black text-base text-slate-900">Spring Boot REST Backends</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Secure, transactional Java backend modules supporting multi-role authentication and mail gateways.</p>
                <ul className="text-[11px] text-slate-600 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600" /> Java 17/21 + Spring Boot 3</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600" /> Spring Security JWT Auth</li>
                </ul>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Starts at</span>
                  <span className="font-black text-base text-slate-900">$1,500</span>
                  <span className="text-[10px] text-indigo-600 font-bold block">₹1,24,500 INR</span>
                </div>
                <button 
                  onClick={() => navigate('/project-request?type=Spring%20Boot%20Backend&budget=1500')} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl font-bold transition-all text-xs shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Book Plan
                </button>
              </div>
            </div>

            {/* Service 3 */}
            <div className="bg-white p-7 border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group text-left">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-black text-base text-slate-900">MongoDB Database Design</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Robust document modeling, sharding, compound indexing, and zero-downtime data schema optimization.</p>
                <ul className="text-[11px] text-slate-600 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> MongoDB Atlas Clustering</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Aggregation Pipelines</li>
                </ul>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Starts at</span>
                  <span className="font-black text-base text-slate-900">$1,000</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">₹83,000 INR</span>
                </div>
                <button 
                  onClick={() => navigate('/project-request?type=MongoDB%20Database%20Design&budget=1000')} 
                  className="bg-slate-100 hover:bg-indigo-600 hover:text-white py-2 px-4 rounded-xl font-bold transition-all text-xs cursor-pointer"
                >
                  Book Plan
                </button>
              </div>
            </div>

            {/* Service 4 */}
            <div className="bg-white p-7 border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group text-left">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-black text-base text-slate-900">AI Agents & Automations</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Automate support chats, proposal generation, resume parsing, and LLM-powered backend workflows.</p>
                <ul className="text-[11px] text-slate-600 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-600" /> OpenAI GPT-4o Integration</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-600" /> Custom Knowledge Prompts</li>
                </ul>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Starts at</span>
                  <span className="font-black text-base text-slate-900">$1,400</span>
                  <span className="text-[10px] text-purple-600 font-bold block">₹1,16,200 INR</span>
                </div>
                <button 
                  onClick={() => navigate('/project-request?type=AI%20Agents%20and%20Automations&budget=1400')} 
                  className="bg-slate-100 hover:bg-indigo-600 hover:text-white py-2 px-4 rounded-xl font-bold transition-all text-xs cursor-pointer"
                >
                  Book Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE PROPOSAL BUDGET ESTIMATOR */}
      <section id="estimator" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl shadow-xl space-y-8 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/70 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-poppins font-black text-xl text-slate-900">Instant Project Scope & Budget Calculator</h3>
              <p className="text-xs text-slate-500 font-medium">Select requirements to calculate an estimated delivery budget in USD ($) & INR (₹).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 relative z-10 text-xs">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="font-bold text-slate-800">Select Core Project Type</label>
                <select 
                  value={serviceBase} 
                  onChange={(e) => setServiceBase(parseFloat(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 outline-none text-xs font-bold text-slate-800 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value={800}>Modern Web Application ($800 / ₹66,400)</option>
                  <option value={1500}>Spring Boot REST Microservices ($1,500 / ₹1,24,500)</option>
                  <option value={1000}>MongoDB Document Architecture ($1,000 / ₹83,000)</option>
                  <option value={1400}>AI Agents & Automations ($1,400 / ₹1,16,200)</option>
                  <option value={2800}>Full-Stack Enterprise Ecosystem ($2,800 / ₹2,32,400)</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Project Complexity & Scope:</span>
                  <span className="text-indigo-600">{scale}x Scale</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.25" 
                  value={scale} 
                  onChange={(e) => setScale(parseFloat(e.target.value))} 
                  className="w-full accent-indigo-600 cursor-pointer" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="font-bold text-slate-800">Delivery Velocity</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    onClick={() => setPriority(1.0)} 
                    className={`border rounded-xl p-2.5 text-center cursor-pointer transition-all ${priority === 1.0 ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                  >
                    <span className="block font-bold">Standard</span>
                    <span className="text-[10px] text-slate-400">14 Days</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPriority(1.2)} 
                    className={`border rounded-xl p-2.5 text-center cursor-pointer transition-all ${priority === 1.2 ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                  >
                    <span className="block font-bold">Fast (+20%)</span>
                    <span className="text-[10px] text-slate-400">7 Days</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPriority(1.5)} 
                    className={`border rounded-xl p-2.5 text-center cursor-pointer transition-all ${priority === 1.5 ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-700 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                  >
                    <span className="block font-bold">Urgent (+50%)</span>
                    <span className="text-[10px] text-slate-400">3 Days</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="font-bold text-slate-800">Promo / Referral Code</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="WELCOME20" 
                    value={coupon} 
                    onChange={(e) => setCoupon(e.target.value)} 
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none w-full font-mono font-bold text-slate-800" 
                  />
                  <button 
                    type="button" 
                    onClick={applyEstCoupon} 
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold px-4 py-2 rounded-xl border border-indigo-200 cursor-pointer text-xs"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="text-center sm:text-left">
              <span className="text-[11px] text-slate-400 font-bold uppercase block tracking-wider">Estimated Project Investment</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-poppins font-black text-slate-900">{formatPrice(estimatedPrice).usd}</span>
                <span className="text-lg font-poppins font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {formatPrice(estimatedPrice).inr}
                </span>
              </div>
              {couponApplied && <span className="text-emerald-600 font-bold text-[11px] block mt-1">✓ 20% Promotional Discount Applied!</span>}
            </div>

            <button 
              onClick={bookEstimatedProject} 
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold py-3.5 px-8 rounded-2xl shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <span>Submit Project Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. SHOWCASE PORTFOLIO WORKS */}
      <section id="portfolio" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-black text-indigo-600 tracking-widest uppercase font-poppins">Portfolio & Case Studies</span>
          <h2 className="text-3xl sm:text-4xl font-poppins font-black text-slate-900">Featured Technical Deliverables</h2>
          <p className="text-sm text-slate-600">
            Explore live production web systems built with Java Spring Boot REST architectures, MongoDB Atlas clusters, and luxury React interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portfolioProjects.map((project) => (
            <motion.div 
              layout
              key={project.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group text-left"
            >
              <div className={`h-48 bg-gradient-to-tr ${project.gradient} p-6 relative flex flex-col justify-between text-white overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <span className="self-start bg-black/25 backdrop-blur-md text-[10px] font-extrabold py-1 px-3 rounded-full uppercase border border-white/20">
                  {project.badge}
                </span>
                <div>
                  <h3 className="font-poppins font-black text-lg text-white leading-snug">{project.title}</h3>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 leading-relaxed">{project.desc}</p>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 font-extrabold">{project.cost} USD</span>
                  <button 
                    onClick={() => setSelectedProject(project)} 
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PORTFOLIO PREVIEW MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-8 space-y-5 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold py-1 px-3 rounded-full uppercase border border-indigo-200">
                      {selectedProject.badge}
                    </span>
                    <h3 className="font-poppins font-black text-2xl text-slate-900 mt-2">{selectedProject.title}</h3>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <span className="text-xl font-bold">&times;</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{selectedProject.desc}</p>

                <div className="space-y-2 py-2">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Key Architectural Deliverables</h4>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    {selectedProject.deliverables?.map((d, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Base Estimate</span>
                    <span className="font-black text-sm text-slate-900">{selectedProject.cost} USD</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Tech Stack</span>
                    <span className="font-bold text-indigo-600">{selectedProject.stack}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3 text-xs font-bold">
                  <button 
                    onClick={() => {
                      setSelectedProject(null);
                      navigate(`/project-request?type=${encodeURIComponent(selectedProject.title)}`);
                    }} 
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    Request Similar Architecture
                  </button>
                  <button 
                    onClick={() => setSelectedProject(null)} 
                    className="px-5 border border-slate-200 text-slate-700 py-3 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black text-indigo-600 tracking-widest uppercase font-poppins">Questions & Answers</span>
          <h2 className="text-3xl font-poppins font-black text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3.5 text-left">
          {[
            { 
              q: 'How does WorkSphere handle security and authentication?', 
              a: 'All client and admin accounts are protected by multi-role authentication. Passwords and credentials are encrypted and stored in MongoDB Atlas, with verified session headers across serverless and Java Spring Boot endpoints.' 
            },
            { 
              q: 'How are project quotes and invoices calculated?', 
              a: 'We provide transparent upfront dual-currency pricing in both US Dollars ($ USD) and Indian Rupees (₹ INR). You can use our interactive calculator or promo code WELCOME20 to compute scope-based estimates.' 
            },
            { 
              q: 'Can interns participate in real client deliverables?', 
              a: 'Yes! WorkSphere runs a structured internship program where interns receive verified mentor guidance, assigned backlog tasks, automated standups, and official verifiable completion certificates.' 
            },
            { 
              q: 'How does live client support and chat work?', 
              a: 'Clients have access to real-time chat history within their client dashboard, with instant replies recorded and synchronized with the admin console.' 
            }
          ].map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                className="w-full flex items-center justify-between p-5 text-left font-extrabold text-xs sm:text-sm text-slate-900 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-indigo-600 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              <motion.div 
                initial={false}
                animate={{ height: openFaq === idx ? 'auto' : 0 }}
                className="overflow-hidden bg-slate-50/60"
              >
                <p className="p-5 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100">{faq.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. VERIFIED CONTACT SECTION */}
      <section id="contact" className="bg-slate-50/80 py-24 px-4 sm:px-6 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black text-indigo-600 tracking-widest uppercase font-poppins">Get In Touch</span>
            <h2 className="text-3xl sm:text-4xl font-poppins font-black text-slate-900">Let's Discuss Your Project Roadmap</h2>
            <p className="text-sm text-slate-600">
              Have an upcoming project or need consulting? Send us a verified inquiry and our architecture team will respond within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto items-start text-left">
            
            {/* Contact Info Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-extrabold tracking-wider">Official Email</span>
                  <a href="mailto:worksphere.ac.in@gmail.com" className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    worksphere.ac.in@gmail.com
                  </a>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-extrabold tracking-wider">Direct WhatsApp / Phone</span>
                  <a href="https://wa.me/918792404950" target="_blank" rel="noreferrer" className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                    +91 8792404950
                  </a>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-extrabold tracking-wider">Location</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">Bangalore, India &bull; Serving Clients Globally</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-8 rounded-3xl shadow-xl">
              <form onSubmit={submitContactForm} className="space-y-4 text-xs text-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-700">Your Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={contactForm.name} 
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Alex Johnson" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white text-xs transition-all" 
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-700">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="alex@company.com" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white text-xs transition-all" 
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-bold text-slate-700">Project Subject</label>
                  <input 
                    type="text" 
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="e.g. Enterprise Full-Stack Web Platform Architecture" 
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white text-xs transition-all" 
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="font-bold text-slate-700">Project Description / Requirements *</label>
                  <textarea 
                    rows={4} 
                    required 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Outline your timeline, desired tech stack, and goals..." 
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white text-xs resize-none transition-all" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSendingContact}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isSendingContact ? 'Sending Message...' : 'Send Verified Project Inquiry'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
