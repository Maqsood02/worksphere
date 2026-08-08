import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, Database, Bot, ShieldCheck, Mail, Phone, MapPin, Search, ChevronDown, Check, ArrowRight, Sun, IndianRupee, DollarSign, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

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

function Counter({ target }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = Math.abs(Math.floor(duration / (target || 1))) || 50;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}</span>;
}

export default function Home() {
  const { addToast } = useApp();
  const navigate = useNavigate();

  // Currency Toggle Mode: 'dual' | 'inr' | 'usd'
  const [currencyMode, setCurrencyMode] = useState('dual');

  // About timelines state
  const [aboutTab, setAboutTab] = useState('exp');

  // Estimator State
  const [serviceBase, setServiceBase] = useState(800);
  const [scale, setScale] = useState(1.0);
  const [priority, setPriority] = useState(1.2);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(1152);

  // Portfolio filters
  const [portCategory, setPortCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  // FAQs
  const [openFaq, setOpenFaq] = useState(null);

  // Contact Form
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  // Calculate Estimator Budget
  useEffect(() => {
    let price = serviceBase * scale * priority;
    if (couponApplied) price *= 0.8;
    setEstimatedPrice(Math.round(price));
  }, [serviceBase, scale, priority, couponApplied]);

  const applyEstCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === 'WELCOME20' || code === 'FREELANCE20') {
      setCouponApplied(true);
      addToast("20% Coupon Code applied successfully!");
    } else {
      setCouponApplied(false);
      addToast("Invalid promo coupon code.");
    }
  };

  const bookEstimatedProject = () => {
    let typeName = "Website Development";
    if (serviceBase === 1500) typeName = "Spring Boot Backend";
    else if (serviceBase === 1000) typeName = "MongoDB Design";
    else if (serviceBase === 1200) typeName = "AI Chatbot integrations";

    navigate(`/project-request?type=${encodeURIComponent(typeName)}&budget=${estimatedPrice}&coupon=${coupon}`);
  };

  const submitContactForm = (e) => {
    e.preventDefault();
    addToast(`Thank you, ${contactForm.name}! Your inquiry was received. We will contact you at ${contactForm.email} shortly.`);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const portfolioProjects = [
    { id: 1, title: 'Enterprise E-Commerce SaaS', category: 'web', desc: 'Complete Spring Boot and MongoDB web application. Features multi-role login, product catalog database indices, shopping carts, and dynamic invoice generation.', cost: '$3,500', stack: 'Spring Boot, MongoDB, Thymeleaf' },
    { id: 2, title: 'OpenAI Knowledge Chatbot', category: 'ai', desc: 'Real-time assistant bot executing pricing estimation, FAQ lookup, and checking status database timelines for clients automatically.', cost: '$1,200', stack: 'OpenAI Api, Spring Web, MongoDB' },
    { id: 3, title: 'High-Volume Database Logs', category: 'db', desc: 'Re-architected collections, added indexing compounds, and crafted dashboard aggregate controllers querying millions of logs.', cost: '$1,800', stack: 'MongoDB Indexing, Aggregate API, Java' },
  ];

  return (
    <div className="space-y-24">
      {/* HERO SECTION */}
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
              <button onClick={() => navigate('/project-request')} className="w-full sm:w-auto text-center bg-primary hover:bg-indigo-700 text-white font-medium py-3.5 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300">
                Book Free Call
              </button>
              <a href="#portfolio" className="w-full sm:w-auto text-center border border-slate-200 hover:border-primary/50 text-text-dark bg-white/50 backdrop-blur-sm font-medium py-3.5 px-8 rounded-full hover:scale-105 active:scale-95 transition-all duration-300">
                View Portfolio
              </a>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 border-t border-slate-100">
              <div>
                <div className="text-2xl font-poppins font-bold text-text-dark"><Counter target={99} />%</div>
                <div className="text-xs text-text-light">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl font-poppins font-bold text-text-dark"><Counter target={60} />+</div>
                <div className="text-xs text-text-light">Completed Works</div>
              </div>
              <div>
                <div className="text-2xl font-poppins font-bold text-text-dark"><Counter target={5} />+</div>
                <div className="text-xs text-text-light">Years Experience</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="glass-card p-6 border border-white/40 rounded-2xl shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl"></div>
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

            <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-xl shadow-xl border border-white/50 flex items-center space-x-3 animate-float">
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

      {/* TECH STRIP */}
      <section className="py-12 bg-slate-50/50 border-y border-slate-100/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-text-light uppercase tracking-widest mb-6">Expertise in Trusted Technologies</p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-60">
            <div className="flex items-center space-x-2 text-sm font-semibold text-text-dark">
              <Globe className="w-5 h-5 text-amber-600" />
              <span>React 19</span>
            </div>
            <div className="flex items-center space-x-2 text-sm font-semibold text-text-dark">
              <Server className="w-5 h-5 text-emerald-600" />
              <span>Spring Boot 3</span>
            </div>
            <div className="flex items-center space-x-2 text-sm font-semibold text-text-dark">
              <Database className="w-5 h-5 text-green-500" />
              <span>MongoDB</span>
            </div>
            <div className="flex items-center space-x-2 text-sm font-semibold text-text-dark">
              <Sun className="w-5 h-5 text-indigo-500" />
              <span>Tailwind CSS v4</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl group">
              <div className="h-96 w-full bg-gradient-to-tr from-primary/10 via-accent/5 to-secondary/15 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent mx-auto flex items-center justify-center text-white text-3xl font-bold font-poppins shadow-xl shadow-primary/20">
                    AD
                  </div>
                  <h3 className="font-poppins font-bold text-xl text-text-dark">Alex Developer</h3>
                  <p className="text-xs text-text-light font-mono bg-white/70 py-1 px-3 rounded-full border border-slate-100">Senior Full-Stack Engineer</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500"><Globe className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-semibold text-sm text-text-dark">Alex_Resume.pdf</h4>
                  <p className="text-xs text-text-light">Updated July 2026</p>
                </div>
              </div>
              <button onClick={() => addToast('Resume download simulated!')} className="text-xs font-bold text-primary hover:underline flex items-center space-x-1">
                <span>Download CV</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-bold text-primary tracking-widest uppercase font-poppins">My Background</span>
              <h2 class="text-3xl font-poppins font-extrabold text-text-dark">Educational Roadmap & Experience</h2>
            </div>

            <div className="flex space-x-2 border-b border-slate-200">
              <button 
                onClick={() => setAboutTab('exp')} 
                className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${aboutTab === 'exp' ? 'border-primary text-primary' : 'border-transparent text-text-light'}`}
              >
                Experience
              </button>
              <button 
                onClick={() => setAboutTab('edu')} 
                className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${aboutTab === 'edu' ? 'border-primary text-primary' : 'border-transparent text-text-light'}`}
              >
                Education
              </button>
            </div>

            {aboutTab === 'exp' ? (
              <div className="relative pl-6 border-l border-slate-200 space-y-8">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 bg-primary border-4 border-white rounded-full"></span>
                  <h4 className="text-sm font-bold text-text-dark">Lead Freelance Software Engineer</h4>
                  <p className="text-xs text-text-light font-semibold">2024 - Present • Remote</p>
                  <p className="text-xs text-text-light mt-2 leading-relaxed">Deliver high-quality Java Spring Boot backends and React clients with MongoDB connections.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 bg-accent border-4 border-white rounded-full"></span>
                  <h4 className="text-sm font-bold text-text-dark">Senior Java Backend Developer</h4>
                  <p className="text-xs text-text-light font-semibold">2021 - 2024 • SaaS Corp</p>
                  <p className="text-xs text-text-light mt-2 leading-relaxed">Engineered robust payment APIs and microservices. Improved database queries speed by 40%.</p>
                </div>
              </div>
            ) : (
              <div className="relative pl-6 border-l border-slate-200 space-y-8">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 bg-primary border-4 border-white rounded-full"></span>
                  <h4 className="text-sm font-bold text-text-dark">M.S. in Computer Science</h4>
                  <p className="text-xs text-text-light font-semibold">2019 - 2021 • Tech Institute</p>
                  <p className="text-xs text-text-light mt-2 leading-relaxed">Specialized in Distributed Web Systems, Java Core programming, and Database clustering.</p>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4">
              <h4 className="font-poppins font-semibold text-sm text-text-dark">Skills Proficiency</h4>
              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span>React 19 & Framer Motion</span>
                    <span>92%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span>Java Spring Boot REST</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span>MongoDB Database Clustering</span>
                    <span>90%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full transition-all duration-1000" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="bg-slate-50/50 py-24 px-6 border-y border-slate-100/50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-primary tracking-widest uppercase font-poppins">Premium Packages</span>
            <h2 className="text-3xl md:text-4xl font-poppins font-extrabold text-text-dark">Professional Freelance Services</h2>
            <p className="text-sm text-text-light">Select from high-quality standard layouts, secure microservices, and AI integrations. All prices shown in USD ($) and INR (₹).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Website Dev */}
            <div className="glass-card p-6 border border-white/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-bold text-base text-text-dark">Website Development</h3>
                <p className="text-xs text-text-light leading-relaxed">High-conversion, stunning responsive landing pages styled with Tailwind CSS.</p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                <div>
                  <span className="text-text-light block text-[10px]">Starts at</span>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-base text-text-dark">$800</span>
                    <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">₹66,400 INR</span>
                  </div>
                </div>
                <button onClick={() => navigate('/project-request?type=Website%20Development')} className="bg-slate-100 hover:bg-primary hover:text-white py-2 px-4 rounded-xl font-medium transition-all">Hire</button>
              </div>
            </div>

            {/* Spring Boot */}
            <div className="glass-card p-6 border border-white/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-bold text-base text-text-dark">Spring Boot REST</h3>
                <p className="text-xs text-text-light leading-relaxed">Secure, transactional Java backend modules supporting multi-role authentication.</p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                <div>
                  <span className="text-text-light block text-[10px]">Starts at</span>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-base text-text-dark">$1,500</span>
                    <span className="text-indigo-600 font-bold text-[11px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">₹1,24,500 INR</span>
                  </div>
                </div>
                <button onClick={() => navigate('/project-request?type=Spring%20Boot%20Backend')} className="bg-slate-100 hover:bg-primary hover:text-white py-2 px-4 rounded-xl font-medium transition-all">Hire</button>
              </div>
            </div>

            {/* MongoDB */}
            <div className="glass-card p-6 border border-white/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-bold text-base text-text-dark">MongoDB Database Design</h3>
                <p className="text-xs text-text-light leading-relaxed">Highly responsive database schemas, indexing setup, and data migration.</p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                <div>
                  <span className="text-text-light block text-[10px]">Starts at</span>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-base text-text-dark">$1,000</span>
                    <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">₹83,000 INR</span>
                  </div>
                </div>
                <button onClick={() => navigate('/project-request?type=MongoDB%20Design')} className="bg-slate-100 hover:bg-primary hover:text-white py-2 px-4 rounded-xl font-medium transition-all">Hire</button>
              </div>
            </div>

            {/* AI solutions */}
            <div className="glass-card p-6 border border-white/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-poppins font-bold text-base text-text-dark">AI Chatbot Solutions</h3>
                <p className="text-xs text-text-light leading-relaxed">Integrate smart language models to automate sales prompts and lead filters.</p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                <div>
                  <span className="text-text-light block text-[10px]">Starts at</span>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-base text-text-dark">$1,200</span>
                    <span className="text-cyan-600 font-bold text-[11px] bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">₹99,600 INR</span>
                  </div>
                </div>
                <button onClick={() => navigate('/project-request?type=AI%20Integrations')} className="bg-slate-100 hover:bg-primary hover:text-white py-2 px-4 rounded-xl font-medium transition-all">Hire</button>
              </div>
            </div>
          </div>

          {/* AI Price Estimator Widget */}
          <div className="glass-card max-w-3xl mx-auto p-8 border border-white/60 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center space-x-3 relative z-10">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl text-white">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-lg text-text-dark">AI Proposal Price Estimator</h3>
                <p className="text-xs text-text-light">Select parameters below to compute an automated estimate proposal budget in USD ($) & INR (₹).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 relative z-10 text-xs">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="font-semibold text-text-dark">Service Category</label>
                  <select 
                    value={serviceBase} 
                    onChange={(e) => setServiceBase(parseFloat(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-xs"
                  >
                    <option value={800}>Website Development ($800 / ₹66,400)</option>
                    <option value={1500}>Spring Boot Backend ($1,500 / ₹1,24,500)</option>
                    <option value={1000}>MongoDB Database Design ($1,000 / ₹83,000)</option>
                    <option value={1200}>AI Chatbot integrations ($1,200 / ₹99,600)</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="font-semibold text-text-dark">Project Scale: <span className="font-bold text-primary">{scale}x</span></label>
                  <input type="range" min="0.5" max="2.0" step="0.25" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full accent-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="font-semibold text-text-dark">Delivery Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setPriority(1.0)} className={`border rounded-xl p-3 text-center cursor-pointer ${priority === 1.0 ? 'border-primary bg-primary/5 font-bold text-primary' : 'border-slate-200'}`}>
                      <span className="block">Standard</span>
                      <span className="text-[9px] text-text-light font-normal">Normal</span>
                    </button>
                    <button onClick={() => setPriority(1.2)} className={`border rounded-xl p-3 text-center cursor-pointer ${priority === 1.2 ? 'border-primary bg-primary/5 font-bold text-primary' : 'border-slate-200'}`}>
                      <span className="block">Fast (+20%)</span>
                      <span className="text-[9px] text-text-light font-normal">Express</span>
                    </button>
                    <button onClick={() => setPriority(1.5)} className={`border rounded-xl p-3 text-center cursor-pointer ${priority === 1.5 ? 'border-primary bg-primary/5 font-bold text-primary' : 'border-slate-200'}`}>
                      <span className="block">Express (+50%)</span>
                      <span className="text-[9px] text-text-light font-normal">Urgent</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="font-semibold text-text-dark">Promo Coupon Discount</label>
                  <div className="flex space-x-2">
                    <input type="text" placeholder="WELCOME20" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none w-full" />
                    <button onClick={applyEstCoupon} className="bg-slate-100 hover:bg-slate-200 font-bold px-4 py-2 rounded-xl text-text-dark">Apply</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between relative z-10">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <span className="text-[10px] text-text-light font-semibold uppercase block">Estimated Quote (Dual Currency)</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-poppins font-bold text-text-dark">{formatPrice(estimatedPrice).usd}</span>
                  <span className="text-xl font-poppins font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {formatPrice(estimatedPrice).inr}
                  </span>
                </div>
                {couponApplied && <span className="text-emerald-500 font-bold text-[9px] block mt-1">20% Coupon Code applied!</span>}
              </div>
              <button onClick={bookEstimatedProject} className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-white font-medium py-3 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Book Project Proposal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="bg-slate-50/50 py-24 px-6 border-y border-slate-100/50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
              <IndianRupee className="w-3.5 h-3.5" /> <DollarSign className="w-3.5 h-3.5" /> Dual Currency Pricing (INR ₹ & USD $)
            </div>
            <h2 className="text-3xl md:text-4xl font-poppins font-extrabold text-text-dark">Upfront Pricing Packages</h2>
            <p className="text-sm text-text-light">Transparent rates with complete breakdown in both Indian Rupees (₹) and US Dollars ($).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Tier */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-xl card-hover-lift flex flex-col justify-between group">
              <div className="space-y-6">
                <span className="text-xs font-bold text-text-light uppercase tracking-wider">Basic Tier</span>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-poppins font-extrabold text-text-dark">$800</span>
                    <span className="text-xs text-slate-400 font-medium">USD</span>
                  </div>
                  <div className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-extrabold font-poppins">
                    ₹66,400 INR
                  </div>
                  <p className="text-xs text-text-light pt-1">Ideal for custom high-speed landing pages and visual portfolios.</p>
                </div>
                <ul className="text-xs text-text-light space-y-3 pt-6 border-t border-slate-100">
                  <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Custom HTML/CSS/JS Layout</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Tailwind CSS Styles</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> 3 revisions, 5 days delivery</li>
                </ul>
              </div>
              <button onClick={() => navigate('/project-request?type=Website%20Development&budget=800')} className="w-full text-center bg-slate-100 hover:bg-primary hover:text-white py-3.5 rounded-2xl text-xs font-bold mt-8 transition-all cursor-pointer">Hire Basic Package ($800 / ₹66,400)</button>
            </div>

            {/* Standard Tier */}
            <div className="bg-white border-2 border-primary p-8 rounded-3xl shadow-xl card-hover-lift flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-4 py-1.5 uppercase rounded-bl-xl tracking-widest font-poppins animate-pulse">RECOMMENDED</div>
              <div className="space-y-6">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Premium Stack</span>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-poppins font-extrabold text-text-dark">$1,800</span>
                    <span className="text-xs text-slate-400 font-medium">USD</span>
                  </div>
                  <div className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-xl text-xs font-extrabold font-poppins">
                    ₹1,49,400 INR
                  </div>
                  <p className="text-xs text-text-light pt-1">Perfect for startup SaaS applications, multi-page portals, and DB persistence.</p>
                </div>
                <ul className="text-xs text-text-light space-y-3 pt-6 border-t border-slate-100">
                  <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Java Spring Boot REST API</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> MongoDB database structure</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> React SPA Client Front</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> 5 revisions, 12 days delivery</li>
                </ul>
              </div>
              <button onClick={() => navigate('/project-request?type=Spring%20Boot%20Backend&budget=1800')} className="w-full text-center bg-primary text-white hover:bg-indigo-700 py-3.5 rounded-2xl text-xs font-bold mt-8 transition-all shadow-md shadow-primary/20 cursor-pointer">Hire Recommended Plan ($1,800 / ₹1,49,400)</button>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-xl card-hover-lift flex flex-col justify-between group">
              <div className="space-y-6">
                <span className="text-xs font-bold text-text-light uppercase tracking-wider">Enterprise Pro</span>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-poppins font-extrabold text-text-dark">$3,500</span>
                    <span className="text-xs text-slate-400 font-medium">USD</span>
                  </div>
                  <div className="inline-block bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-xl text-xs font-extrabold font-poppins">
                    ₹2,90,500 INR
                  </div>
                  <p className="text-xs text-text-light pt-1">Advanced automation integration, custom chatbot engines, and payment flows.</p>
                </div>
                <ul className="text-xs text-text-light space-y-3 pt-6 border-t border-slate-100">
                  <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Custom AI Chatbot integration</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Active Stripe / PayPal APIs checkout</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-2" /> Unlimited revisions, 20 days delivery</li>
                </ul>
              </div>
              <button onClick={() => navigate('/project-request?type=Full-Stack%20Enterprise&budget=3500')} className="w-full text-center bg-slate-100 hover:bg-primary hover:text-white py-3.5 rounded-2xl text-xs font-bold mt-8 transition-all cursor-pointer">Hire Enterprise Plan ($3,500 / ₹2,90,500)</button>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section id="portfolio" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-primary tracking-widest uppercase font-poppins">Showcase Projects</span>
          <h2 className="text-3xl md:text-4xl font-poppins font-extrabold text-text-dark">My Latest Showcase Works</h2>
          <p className="text-sm text-text-light">Browse actual systems compiled using Java Spring Boot REST APIs, MongoDB document storage, and modern React visual dynamics.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
          {['all', 'web', 'ai', 'db'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setPortCategory(cat)}
              className={`py-2 px-5 rounded-full text-xs font-medium transition-all ${portCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-text-dark hover:bg-slate-200'}`}
            >
              {cat === 'all' ? 'All Works' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioProjects
            .filter((p) => portCategory === 'all' || p.category === portCategory)
            .map((project) => (
              <motion.div 
                layout
                key={project.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="h-48 bg-gradient-to-tr from-primary/10 to-accent/20 relative flex items-center justify-center p-6">
                  <Database className="w-16 h-16 text-primary/45 group-hover:scale-110 transition-transform duration-500" />
                  <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold py-1 px-3 rounded-full uppercase">React + REST</span>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="font-poppins font-bold text-lg text-text-dark">{project.title}</h3>
                  <p className="text-xs text-text-light leading-relaxed">{project.desc.slice(0, 80)}...</p>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-semibold">
                    <button onClick={() => setSelectedProject(project)} className="text-primary hover:underline flex items-center space-x-1">
                      <span>Preview Modal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <a href="#" className="text-text-light hover:text-text-dark" aria-label="GitHub">
                      <svg className="w-5 h-5 fill-current inline-block" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* PORTFOLIO PREVIEW MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold py-1 px-3 rounded-full uppercase">{selectedProject.category}</span>
                    <h3 className="font-poppins font-extrabold text-2xl text-text-dark mt-2">{selectedProject.title}</h3>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="text-text-light hover:text-text-dark p-1.5 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-xs text-text-light leading-relaxed">{selectedProject.desc}</p>
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-text-light block">Est. Cost</span>
                    <span className="font-bold text-sm text-text-dark">{selectedProject.cost}</span>
                  </div>
                  <div>
                    <span className="text-text-light block">Tech Stack</span>
                    <span className="font-semibold text-text-dark">{selectedProject.stack}</span>
                  </div>
                </div>
                <div className="pt-2 flex space-x-3 text-xs font-semibold">
                  <button onClick={() => addToast('Simulating deployment live preview!')} className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all">Live Demo</button>
                  <button className="flex-1 border border-slate-200 text-text-dark py-2.5 rounded-xl hover:bg-slate-50">GitHub Code</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-primary tracking-widest uppercase font-poppins">Help Guide</span>
          <h2 className="text-3xl font-poppins font-extrabold text-text-dark">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: 'How does the platform authenticate users?', a: 'The backend uses Spring Security sessions with CORS configured to accept request credentials. Logins and signups register cookies in the browser securely.' },
            { q: 'Can I apply custom promo discount codes?', a: 'Yes! Slide estimator categories, enter coupon WELCOME20 or FREELANCE20 to instantly subtract 20% from estimated invoice costs.' },
            { q: 'How does the support desk live chat synchronize?', a: 'The React dashboard client queries REST API chat thread histories periodically, updating inbox lists for the client and admin support panels.' }
          ].map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-text-dark"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-text-light transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              <motion.div 
                initial={false}
                animate={{ height: openFaq === idx ? 'auto' : 0 }}
                className="overflow-hidden bg-slate-50/50"
              >
                <p className="p-5 text-xs text-text-light leading-relaxed">{faq.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" class="bg-slate-50/50 py-24 px-6 border-t border-slate-100/50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-primary tracking-widest uppercase font-poppins">Get In Touch</span>
            <h2 class="text-3xl font-poppins font-extrabold text-text-dark">Let's Discuss Your Project Roadmap</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-primary/10 rounded-xl text-primary"><Mail className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] text-text-light block uppercase font-bold">Email Address</span>
                  <a href="mailto:alex@developer.com" className="text-sm font-semibold text-text-dark hover:underline">alex@developer.com</a>
                </div>
              </div>
              <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-accent/10 rounded-xl text-accent"><Phone className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] text-text-light block uppercase font-bold">Phone / WhatsApp</span>
                  <a href="https://wa.me/1234567890" className="text-sm font-semibold text-text-dark hover:underline">+1 234 567 890</a>
                </div>
              </div>
              <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><MapPin className="w-5 h-5" /></div>
                <div>
                  <span className="text-[10px] text-text-light block uppercase font-bold">Location</span>
                  <span className="text-sm font-semibold text-text-dark">Silicon Valley, CA</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-100 p-8 rounded-3xl shadow-lg">
              <form onSubmit={submitContactForm} className="space-y-5 text-xs text-text-dark">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-semibold">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={contactForm.name} 
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="John Doe" 
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs" 
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-semibold">Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="john@company.com" 
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs" 
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="font-semibold">Message Subject</label>
                  <input 
                    type="text" 
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="Spring Boot Backend Integration" 
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs" 
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="font-semibold">Message Content *</label>
                  <textarea 
                    rows={5} 
                    required 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Let's build a secure payment portal..." 
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs resize-none" 
                  />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all">
                  Send Verified Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
