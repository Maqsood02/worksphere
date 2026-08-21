import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Server, Database, Bot, ShieldCheck, Mail, Phone, MapPin, Search, ChevronDown, Check, 
  ArrowRight, Sun, IndianRupee, DollarSign, Sparkles, Code2, Layers, Cpu, CheckCircle2, 
  ExternalLink, Download, Clock, Star, Zap, Terminal, Laptop, X, ArrowUpRight
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
    else if (serviceBase === 1400) typeName = "AI Agents & Automations";

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
      gradient: 'from-blue-600 via-indigo-600 to-indigo-800',
      icon: Layers,
      desc: 'Complete full-stack enterprise platform featuring role-based access control (Admin, Intern, Client), automated billing cycles, real-time client chat, and live MongoDB document synchronization.', 
      usd: '$2,800 USD', 
      inr: '₹2,32,400 INR',
      stack: 'Java Spring Boot 3, MongoDB Atlas, React 19, Tailwind CSS',
      deliverables: ['Custom REST API Gateways', 'Encrypted Auth & Session Management', 'Interactive Responsive Dashboards']
    },
    { 
      id: 2, 
      title: 'Autonomous AI Knowledge & Task Bot', 
      category: 'ai', 
      badge: 'OpenAI GPT-4o + Vector Engine',
      gradient: 'from-purple-600 via-indigo-600 to-violet-800',
      icon: Bot,
      desc: 'Intelligent AI assistant pipeline that computes real-time proposal budgets, answers client inquiries from platform documentation, and automates support ticket escalations.', 
      usd: '$1,400 USD', 
      inr: '₹1,16,200 INR',
      stack: 'OpenAI API, Spring Web, MongoDB Atlas, Node Serverless',
      deliverables: ['Context-Aware Prompt Pipeline', 'Instant Automated Quotations', 'Live Stream Webhook Handlers']
    },
    { 
      id: 3, 
      title: 'High-Throughput Distributed Database Cluster', 
      category: 'db', 
      badge: 'MongoDB Atlas + Index Optimizer',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-800',
      icon: Database,
      desc: 'Engineered high-performance database schema with compound indexing, sub-10ms query execution times, and automated aggregation controllers capable of handling millions of log events.', 
      usd: '$1,200 USD', 
      inr: '₹99,600 INR',
      stack: 'MongoDB Atlas, Aggregation Pipelines, Spring Data Mongo, Redis',
      deliverables: ['Compound & Text Indexing Setup', 'Zero-Downtime Data Migrations', 'Real-Time Telemetry Dashboards']
    },
  ];

  return (
    <div className="space-y-28 overflow-hidden">
      
      {/* 1. ORIGINAL HERO SECTION & THEME */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center py-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary py-2 px-4 rounded-full border border-primary/20 hover:scale-105 transition-transform duration-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider font-poppins">Available for Freelance Projects</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-poppins font-extrabold tracking-tight leading-[1.1] text-text-dark">
              Transforming Ideas Into <br />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Powerful Digital Solutions
              </span>
            </h1>

            <p className="text-base sm:text-lg text-text-light max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              I build custom, premium, and highly animated web applications. Specialized in high-performance Java Spring Boot backends, MongoDB document designs, and luxury React interfaces.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={() => navigate('/project-request')} 
                className="w-full sm:w-auto text-center bg-primary hover:bg-indigo-700 text-white font-medium py-3.5 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                Book Free Call
              </button>
              <a 
                href="#portfolio" 
                className="w-full sm:w-auto text-center border border-slate-200 hover:border-primary/50 text-text-dark bg-white/50 backdrop-blur-sm font-medium py-3.5 px-8 rounded-full hover:scale-105 active:scale-95 transition-all duration-300"
              >
                View Portfolio
              </a>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 border-t border-slate-100">
              <div>
                <div className="text-2xl font-poppins font-bold text-text-dark"><Counter target={99} suffix="%" /></div>
                <div className="text-xs text-text-light">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl font-poppins font-bold text-text-dark"><Counter target={65} suffix="+" /></div>
                <div className="text-xs text-text-light">Completed Works</div>
              </div>
              <div>
                <div className="text-2xl font-poppins font-bold text-text-dark"><Counter target={5} suffix="+" /></div>
                <div className="text-xs text-text-light">Years Experience</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="glass-card p-6 border border-white/40 rounded-2xl shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 text-left">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100/60 mb-4">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 bg-red-400 rounded-full block"></span>
                  <span className="w-3 h-3 bg-yellow-400 rounded-full block"></span>
                  <span className="w-3 h-3 bg-emerald-400 rounded-full block"></span>
                </div>
                <div className="text-[10px] font-mono text-text-light bg-slate-100/80 py-1 px-3 rounded-lg">FreelanceController.java</div>
              </div>
              <pre className="font-mono text-[10px] sm:text-xs text-left text-slate-700 leading-relaxed overflow-x-auto space-y-1 py-2">
{`@RestController
@RequestMapping("/api/projects")
public class FreelanceController {

  @PostMapping("/hire")
  public ResponseEntity<Project> hireMe() {
    Project clientProject = Project.builder()
      .stack("React + Spring Boot + MongoDB")
      .animations("60fps Motion Canvas")
      .aesthetics("Glassmorphic Design")
      .build();
      
    return ResponseEntity.ok(
      projectService.deliver(clientProject)
    );
  }
}`}
              </pre>
            </div>

            <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-xl shadow-xl border border-white/50 flex items-center space-x-3 animate-float text-left">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-text-dark">SECURE CONTRACT</div>
                <div className="text-[10px] text-text-light">Spring Security + MongoDB</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TECH STRIP */}
      <section className="py-10 bg-slate-50/70 border-y border-slate-100/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-6 font-poppins">
            Expertise in Trusted Technologies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            <div className="flex items-center space-x-2.5 text-slate-700 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Globe className="w-5 h-5 text-indigo-600" />
              <span>React 19</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Server className="w-5 h-5 text-emerald-600" />
              <span>Spring Boot 3</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Database className="w-5 h-5 text-green-600" />
              <span>MongoDB Atlas</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Bot className="w-5 h-5 text-purple-600" />
              <span>OpenAI Integrations</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Sun className="w-5 h-5 text-sky-500" />
              <span>Tailwind CSS v4</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section id="about" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl group bg-white p-8 text-center space-y-5">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-accent mx-auto flex items-center justify-center text-white text-3xl font-black font-poppins shadow-xl shadow-primary/25 border-4 border-white">
                WS
              </div>
              <div>
                <h3 className="font-poppins font-black text-2xl text-slate-900">WorkSphere Platform</h3>
                <p className="text-xs text-primary font-bold uppercase tracking-wider mt-0.5">Engineering Leadership & Architecture</p>
                <p className="text-xs text-slate-500 font-medium pt-3 leading-relaxed">
                  Led by <strong>Maqsood MD</strong>, delivering enterprise web systems, high-performance Java microservices, and specialized intern development programs.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Bangalore, India</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Platform</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Layers className="w-5 h-5" /></div>
                <div className="text-left">
                  <h4 className="font-bold text-xs text-slate-900">WorkSphere Architecture Deck</h4>
                  <p className="text-[10px] text-slate-400">Technical Overview 2026</p>
                </div>
              </div>
              <button 
                onClick={() => addToast('Architecture Overview initialized!')} 
                className="text-xs font-bold text-primary hover:underline flex items-center space-x-1 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200"
              >
                <span>View Deck</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold text-primary tracking-widest uppercase font-poppins">Engineering Background</span>
              <h2 className="text-3xl sm:text-4xl font-poppins font-extrabold text-text-dark">Educational Roadmap & Experience</h2>
            </div>

            <div className="flex space-x-2 border-b border-slate-200">
              <button 
                onClick={() => setAboutTab('exp')} 
                className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${aboutTab === 'exp' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Experience
              </button>
              <button 
                onClick={() => setAboutTab('edu')} 
                className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${aboutTab === 'edu' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Education & Tech
              </button>
            </div>

            {aboutTab === 'exp' ? (
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full shadow-sm"></span>
                  <h4 className="text-sm font-extrabold text-slate-900">Lead Enterprise Software Architect</h4>
                  <p className="text-xs text-primary font-semibold">2024 - Present &bull; WorkSphere Platform</p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">Deliver high-quality Java Spring Boot backends and React clients with MongoDB document connections.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-accent border-2 border-white rounded-full shadow-sm"></span>
                  <h4 className="text-sm font-extrabold text-slate-900">Senior Java Backend Developer</h4>
                  <p className="text-xs text-accent font-semibold">2021 - 2024 &bull; SaaS Enterprise Systems</p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">Engineered robust payment APIs and microservices. Improved database query speed by 40%.</p>
                </div>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full shadow-sm"></span>
                  <h4 className="text-sm font-extrabold text-slate-900">Distributed Web Systems & Computer Science</h4>
                  <p className="text-xs text-primary font-semibold">Specialized Engineering Curriculum</p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">Specialized in Distributed Web Systems, Java Core programming, and Database clustering.</p>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <h4 className="font-poppins font-extrabold text-xs text-slate-800 uppercase tracking-wider">Skills Proficiency</h4>
              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <div className="flex items-center justify-between mb-1 text-slate-700">
                    <span>React 19 & Framer Motion</span>
                    <span className="text-primary font-bold">95%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div className="h-full bg-primary rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1 text-slate-700">
                    <span>Java Spring Boot REST & Security</span>
                    <span className="text-primary font-bold">98%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div className="h-full bg-accent rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1 text-slate-700">
                    <span>MongoDB Database Clustering</span>
                    <span className="text-primary font-bold">92%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div className="h-full bg-secondary rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE SERVICES SECTION (ENHANCED MODERN CARDS) */}
      <section id="services" className="bg-gradient-to-b from-slate-50/70 via-slate-50 to-indigo-50/20 py-24 px-6 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider font-poppins">
              <Sparkles className="w-3.5 h-3.5" /> Premium Engineering Packages
            </span>
            <h2 className="text-3xl md:text-4xl font-poppins font-black text-slate-900">Professional Freelance Services</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tailored high-performance software modules with strict database persistence and dual currency transparent pricing in USD ($) and INR (₹).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Website Dev */}
            <div className="bg-white p-7 border border-slate-200/80 hover:border-primary/50 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group text-left relative overflow-hidden">
              <div className="space-y-4">
                <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-black text-lg text-slate-900">Website Development</h3>
                <p className="text-xs text-slate-500 leading-relaxed">High-conversion, stunning responsive landing pages styled with modern Tailwind CSS.</p>
              </div>
              
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-end justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Starts at</span>
                  <div className="flex flex-col mt-0.5">
                    <span className="font-black text-lg text-slate-900">$800 <span className="text-xs font-bold text-slate-400">USD</span></span>
                    <span className="text-emerald-700 font-extrabold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 inline-block w-fit mt-1">
                      ₹66,400 INR
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/project-request?type=Website%20Development&budget=800')} 
                  className="bg-slate-100 hover:bg-primary hover:text-white py-2.5 px-4 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-sm active:scale-95"
                >
                  Hire
                </button>
              </div>
            </div>

            {/* Spring Boot */}
            <div className="bg-white p-7 border-2 border-primary/50 rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group text-left relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                POPULAR
              </div>
              <div className="space-y-4">
                <div className="w-13 h-13 rounded-2xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/25">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-black text-lg text-slate-900">Spring Boot REST</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Secure, transactional Java backend modules supporting multi-role authentication.</p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-end justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Starts at</span>
                  <div className="flex flex-col mt-0.5">
                    <span className="font-black text-lg text-slate-900">$1,500 <span className="text-xs font-bold text-slate-400">USD</span></span>
                    <span className="text-indigo-700 font-extrabold text-[11px] bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200 inline-block w-fit mt-1">
                      ₹1,24,500 INR
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/project-request?type=Spring%20Boot%20Backend&budget=1500')} 
                  className="bg-primary hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl font-bold transition-all text-xs shadow-md shadow-primary/25 active:scale-95 cursor-pointer"
                >
                  Hire
                </button>
              </div>
            </div>

            {/* MongoDB */}
            <div className="bg-white p-7 border border-slate-200/80 hover:border-emerald-500/50 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group text-left relative overflow-hidden">
              <div className="space-y-4">
                <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-black text-lg text-slate-900">MongoDB Database Design</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Highly responsive database schemas, indexing setup, and live data migrations.</p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-end justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Starts at</span>
                  <div className="flex flex-col mt-0.5">
                    <span className="font-black text-lg text-slate-900">$1,000 <span className="text-xs font-bold text-slate-400">USD</span></span>
                    <span className="text-emerald-700 font-extrabold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 inline-block w-fit mt-1">
                      ₹83,000 INR
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/project-request?type=MongoDB%20Design&budget=1000')} 
                  className="bg-slate-100 hover:bg-emerald-600 hover:text-white py-2.5 px-4 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-sm active:scale-95"
                >
                  Hire
                </button>
              </div>
            </div>

            {/* AI solutions */}
            <div className="bg-white p-7 border border-slate-200/80 hover:border-purple-500/50 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group text-left relative overflow-hidden">
              <div className="space-y-4">
                <div className="w-13 h-13 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-black text-lg text-slate-900">AI Chatbot Solutions</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Integrate smart language models to automate sales prompts, FAQ lookups, and lead filters.</p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-end justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Starts at</span>
                  <div className="flex flex-col mt-0.5">
                    <span className="font-black text-lg text-slate-900">$1,200 <span className="text-xs font-bold text-slate-400">USD</span></span>
                    <span className="text-purple-700 font-extrabold text-[11px] bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 inline-block w-fit mt-1">
                      ₹99,600 INR
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/project-request?type=AI%20Integrations&budget=1200')} 
                  className="bg-slate-100 hover:bg-purple-600 hover:text-white py-2.5 px-4 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-sm active:scale-95"
                >
                  Hire
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ESTIMATOR SECTION (MODERN ULTRA-CLEAN DESIGN) */}
      <section id="estimator" className="py-12 px-6 max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 border border-slate-200/80 rounded-3xl shadow-xl space-y-6 relative overflow-hidden text-left hover:shadow-2xl transition-all">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center space-x-3.5 relative z-10">
            <div className="p-3 bg-gradient-to-tr from-primary to-accent rounded-2xl text-white shadow-md shadow-primary/25">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-poppins font-black text-xl text-slate-900">AI Proposal Price Estimator</h3>
              <p className="text-xs text-slate-500 font-medium">Select parameters below to compute an automated estimate proposal budget in USD ($) & INR (₹).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 relative z-10 text-xs">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="font-bold text-slate-800">Service Category</label>
                <select 
                  value={serviceBase} 
                  onChange={(e) => setServiceBase(parseFloat(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-xs font-bold text-slate-800 focus:border-primary focus:bg-white transition-all cursor-pointer shadow-sm"
                >
                  <option value={800}>Website Development ($800 / ₹66,400)</option>
                  <option value={1500}>Spring Boot Backend ($1,500 / ₹1,24,500)</option>
                  <option value={1000}>MongoDB Database Design ($1,000 / ₹83,000)</option>
                  <option value={1200}>AI Chatbot integrations ($1,200 / ₹99,600)</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Project Scale & Complexity:</span>
                  <span className="text-primary font-black">{scale}x Scale</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.25" 
                  value={scale} 
                  onChange={(e) => setScale(parseFloat(e.target.value))} 
                  className="w-full accent-primary cursor-pointer" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="font-bold text-slate-800">Delivery Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setPriority(1.0)} 
                    className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${priority === 1.0 ? 'border-primary bg-primary/10 font-black text-primary shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                  >
                    <span className="block font-bold">Standard</span>
                    <span className="text-[10px] text-slate-400">Normal</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPriority(1.2)} 
                    className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${priority === 1.2 ? 'border-primary bg-primary/10 font-black text-primary shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                  >
                    <span className="block font-bold">Fast (+20%)</span>
                    <span className="text-[10px] text-slate-400">Express</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPriority(1.5)} 
                    className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${priority === 1.5 ? 'border-primary bg-primary/10 font-black text-primary shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                  >
                    <span className="block font-bold">Express (+50%)</span>
                    <span className="text-[10px] text-slate-400">Urgent</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="font-bold text-slate-800">Promo Coupon Discount</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="WELCOME20" 
                    value={coupon} 
                    onChange={(e) => setCoupon(e.target.value)} 
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none w-full font-mono font-bold text-xs text-slate-800 uppercase" 
                  />
                  <button 
                    type="button" 
                    onClick={applyEstCoupon} 
                    className="bg-primary/10 hover:bg-primary hover:text-white font-extrabold px-4 py-2 rounded-xl text-primary border border-primary/20 cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Estimated Quote (Dual Currency)</span>
              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="text-3xl font-poppins font-black text-slate-900">{formatPrice(estimatedPrice).usd}</span>
                <span className="text-lg font-poppins font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {formatPrice(estimatedPrice).inr}
                </span>
              </div>
              {couponApplied && <span className="text-emerald-600 font-bold text-[10px] block mt-1">✓ 20% Promotional Discount Applied!</span>}
            </div>
            <button 
              onClick={bookEstimatedProject} 
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-extrabold py-3.5 px-8 rounded-full shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <span>Book Project Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. SHOWCASE PORTFOLIO (WITH INDIAN RUPEES & ULTRA-MODERN CARDS) */}
      <section id="portfolio" className="py-20 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider font-poppins">
            <Sparkles className="w-3.5 h-3.5" /> Showcase Deliverables
          </span>
          <h2 className="text-3xl md:text-4xl font-poppins font-black text-slate-900">My Latest Showcase Works</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Browse actual systems compiled using Java Spring Boot REST APIs, MongoDB document storage, and modern React visual dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portfolioProjects.map((project) => {
            const ProjectIcon = project.icon;
            return (
              <motion.div 
                layout
                key={project.id}
                className="bg-white border border-slate-200/80 hover:border-primary/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group text-left"
              >
                {/* Header Banner */}
                <div className={`h-48 bg-gradient-to-tr ${project.gradient} p-6 relative flex flex-col justify-between text-white overflow-hidden`}>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="bg-black/30 backdrop-blur-md text-[9px] font-black py-1 px-3 rounded-full uppercase border border-white/20 tracking-wider">
                      {project.badge}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                      <ProjectIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-poppins font-black text-xl text-white leading-snug">{project.title}</h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-500 leading-relaxed">{project.desc}</p>
                  
                  {/* DUAL CURRENCY BADGES (USD $ & INR ₹) */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Investment</span>
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 mt-0.5">
                        <span className="text-sm font-black text-slate-900">{project.usd}</span>
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 w-fit">
                          {project.inr}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedProject(project)} 
                      className="text-primary hover:text-indigo-800 font-extrabold text-xs flex items-center gap-1 cursor-pointer bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl border border-primary/20 transition-all active:scale-95 shrink-0"
                    >
                      <span>Preview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* PORTFOLIO PREVIEW MODAL (WITH INDIAN RUPEES DUAL PRICING) */}
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
                    <span className="bg-primary/10 text-primary text-[10px] font-extrabold py-1 px-3 rounded-full uppercase border border-primary/20">
                      {selectedProject.badge}
                    </span>
                    <h3 className="font-poppins font-black text-2xl text-slate-900 mt-2">{selectedProject.title}</h3>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{selectedProject.desc}</p>

                <div className="space-y-2 py-2">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Architecture Deliverables</h4>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    {selectedProject.deliverables?.map((d, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* MODAL DUAL CURRENCY BOX */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Cost (USD / INR)</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-black text-sm text-slate-900">{selectedProject.usd}</span>
                      <span className="font-extrabold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {selectedProject.inr}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tech Stack</span>
                    <span className="font-bold text-primary">{selectedProject.stack}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3 text-xs font-bold">
                  <button 
                    onClick={() => {
                      setSelectedProject(null);
                      navigate(`/project-request?type=${encodeURIComponent(selectedProject.title)}`);
                    }} 
                    className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-primary/25 cursor-pointer"
                  >
                    Request Similar Build
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
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto space-y-14">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-primary tracking-widest uppercase font-poppins">Help Guide</span>
          <h2 className="text-3xl font-poppins font-black text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4 text-left">
          {[
            { q: 'How does the platform authenticate users?', a: 'The backend uses Spring Security sessions with CORS configured to accept request credentials. Logins and signups register cookies in the browser securely.' },
            { q: 'Can I apply custom promo discount codes?', a: 'Yes! Slide estimator categories, enter coupon WELCOME20 or FREELANCE20 to instantly subtract 20% from estimated invoice costs.' },
            { q: 'How does the support desk live chat synchronize?', a: 'The React dashboard client queries REST API chat thread histories periodically, updating inbox lists for the client and admin support panels.' }
          ].map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-primary/40 transition-colors">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                className="w-full flex items-center justify-between p-5 text-left font-bold text-xs sm:text-sm text-slate-800 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-primary transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              <motion.div 
                initial={false}
                animate={{ height: openFaq === idx ? 'auto' : 0 }}
                className="overflow-hidden bg-slate-50/50"
              >
                <p className="p-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 font-medium">{faq.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CONTACT SECTION */}
      <section id="contact" className="bg-slate-50/70 py-24 px-6 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-primary tracking-widest uppercase font-poppins">Get In Touch</span>
            <h2 className="text-3xl font-poppins font-black text-slate-900">Let's Discuss Your Project Roadmap</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto items-start text-left">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-primary/10 rounded-xl text-primary"><Mail className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Official Email</span>
                  <a href="mailto:worksphere.ac.in@gmail.com" className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-primary transition-colors">worksphere.ac.in@gmail.com</a>
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-accent/10 rounded-xl text-accent"><Phone className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Phone / WhatsApp</span>
                  <a href="https://wa.me/918792404950" target="_blank" rel="noreferrer" className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-primary transition-colors">+91 8792404950</a>
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><MapPin className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Location</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">Bangalore, India &bull; Global Remote</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 p-8 rounded-3xl shadow-lg">
              <form onSubmit={submitContactForm} className="space-y-4 text-xs text-text-dark">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-700">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={contactForm.name} 
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="John Doe" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-xs transition-all" 
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-bold text-slate-700">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="john@company.com" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-xs transition-all" 
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="font-bold text-slate-700">Message Subject</label>
                  <input 
                    type="text" 
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Spring Boot Backend Integration" 
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-xs transition-all" 
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="font-bold text-slate-700">Message Content *</label>
                  <textarea 
                    rows={4} 
                    required 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Let's build a secure payment portal..." 
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary text-xs resize-none transition-all" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSendingContact}
                  className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/10 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  {isSendingContact ? 'Sending Message...' : 'Send Verified Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
