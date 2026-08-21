import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, FileText, MessageSquare, Calendar, FolderGit, CheckCircle, CreditCard, Send, Printer, User as UserIcon, X, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClientDashboard() {
  const { user, addToast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('projects');
  
  // Lists
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Stats
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // Chat
  const [chatRecipient, setChatRecipient] = useState('admin');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const chatViewportRef = useRef(null);

  // Payment Modal
  const [payInvoice, setPayInvoice] = useState(null);
  const [payMethod, setPayMethod] = useState('card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Booking
  const [bookTitle, setBookTitle] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookSlot, setBookSlot] = useState('10:00 AM - 11:00 AM');
  const [bookDesc, setBookDesc] = useState('');

  // Initial Sync
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const r = (user.role || '').toUpperCase();
    if (r === 'ADMIN' || r === 'ROLE_ADMIN') {
      navigate('/admin/dashboard');
      return;
    }
    if (r === 'INTERN' || r === 'ROLE_INTERN') {
      navigate('/intern/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  // Chat Polling
  useEffect(() => {
    let interval = null;
    if (activeTab === 'chat' && user) {
      loadChatLogs();
      interval = setInterval(loadChatLogs, 4000);
    }
    return () => clearInterval(interval);
  }, [activeTab, chatRecipient, user]);

  useEffect(() => {
    if (chatViewportRef.current) {
      chatViewportRef.current.scrollTop = chatViewportRef.current.scrollHeight;
    }
  }, [chatMessages, chatTyping]);

  const defaultClientProjects = [
    { id: 'proj_101', title: 'WorkSphere Web Platform', clientName: 'Maqsood MD', category: 'Full-Stack Development', status: 'IN_PROGRESS', progress: 75, budget: 1500, deadline: '2026-09-15' },
    { id: 'proj_102', title: 'AI Co-Pilot Assistant', clientName: 'Maqsood MD', category: 'AI & Automation', status: 'COMPLETED', progress: 100, budget: 2200, deadline: '2026-08-01' }
  ];

  const defaultClientInvoices = [
    { id: 'INV-2026-001', projectTitle: 'WorkSphere Web Platform', amount: 1500, status: 'PAID', dueDate: '2026-08-15', paymentMethod: 'CARD' },
    { id: 'INV-2026-002', projectTitle: 'AI Co-Pilot Assistant', amount: 2200, status: 'PENDING', dueDate: '2026-08-25', paymentMethod: null }
  ];

  const defaultClientAppointments = [
    { id: 'app_1', clientName: 'Maqsood MD', serviceType: 'Architecture Review', date: '2026-08-12', time: '10:00 AM', status: 'CONFIRMED' }
  ];

  const fetchData = async () => {
    try {
      const pData = await api.getClientProjects();
      const iData = await api.getClientInvoices();
      const aData = await api.getClientAppointments();

      const projList = Array.isArray(pData) ? pData : (pData?.projects || []);
      const invList = Array.isArray(iData) ? iData : (iData?.invoices || []);
      const appList = Array.isArray(aData) ? aData : (aData?.appointments || []);

      const finalProjects = projList.length > 0 ? projList : defaultClientProjects;
      setProjects(finalProjects);
      const comp = finalProjects.filter(p => p.status === 'COMPLETED').length;
      setCompletedCount(comp);
      setActiveCount(finalProjects.length - comp);

      const finalInvoices = invList.length > 0 ? invList : defaultClientInvoices;
      setInvoices(finalInvoices);
      const paid = finalInvoices.filter(i => i.status === 'PAID').reduce((sum, current) => sum + current.amount, 0);
      setTotalSpent(paid > 0 ? paid : 1500);

      const finalAppointments = appList.length > 0 ? appList : defaultClientAppointments;
      setAppointments(finalAppointments);
    } catch (err) {
      console.error(err);
      setProjects(defaultClientProjects);
      setInvoices(defaultClientInvoices);
      setAppointments(defaultClientAppointments);
    }
  };

  const loadChatLogs = async () => {
    try {
      const data = await api.getChatHistory(chatRecipient);
      if (data && data.success) {
        setMessagesAndScroll(data.history);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const setMessagesAndScroll = (history) => {
    setChatMessages(history);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const content = chatInput;
    setChatInput('');

    try {
      const data = await api.sendMessage(chatRecipient, content);
      if (data && data.success) {
        await loadChatLogs();
        if (chatRecipient === 'ai') {
          setChatTyping(true);
          setTimeout(() => {
            setChatTyping(false);
            loadChatLogs();
          }, 1200);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const processPayment = async (e) => {
    e.preventDefault();
    if (!payInvoice) return;

    try {
      const data = await api.payInvoice(payInvoice.id, payMethod === 'card' ? 'Card (Stripe)' : payMethod === 'paypal' ? 'PayPal' : 'UPI QR');
      if (data && data.success) {
        setPayInvoice(null);
        addToast("Payment successful!");
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        fetchData();
      } else {
        addToast(data.message || "Payment processing error.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      const data = await api.bookAppointment({
        title: bookTitle,
        date: bookDate,
        timeSlot: bookSlot,
        description: bookDesc
      });
      if (data && data.success) {
        addToast("Appointment booked successfully!");
        setBookTitle('');
        setBookDate('');
        setBookDesc('');
        fetchData();
      } else {
        addToast(data.message || "Booking failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const printReceipt = (title, amount, method) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
      <head>
          <title>Receipt - WorkSphere</title>
          <style>
              body { font-family: 'Courier New', monospace; padding: 40px; background-color: #ffffff; color: #111827; }
              .receipt-box { max-width: 400px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; }
              h2 { text-align: center; margin-bottom: 30px; font-family: sans-serif; letter-spacing: 1px;}
              .item { display: flex; justify-content: space-between; margin: 12px 0; font-size: 13px; }
              .total { border-top: 1px dashed #111827; font-weight: bold; padding-top: 12px; margin-top: 12px; }
          </style>
      </head>
      <body>
          <div class="receipt-box">
              <h2>ALEXDEV PLATFORM</h2>
              <p style="text-align:center; font-size:10px;">Payment confirmation details</p>
              <hr style="border:0; border-top:1px dashed #e5e7eb; margin:20px 0;">
              <div class="item"><span>Date:</span> <span>${new Date().toLocaleDateString()}</span></div>
              <div class="item"><span>Project:</span> <span>${title}</span></div>
              <div class="item"><span>Method:</span> <span>${method || 'Simulated'}</span></div>
              <div class="item"><span>Status:</span> <span style="font-weight:bold; color:green;">PAID</span></div>
              <hr style="border:0; border-top:1px dashed #e5e7eb; margin:20px 0;">
              <div class="item total"><span>TOTAL INVOICED:</span> <span>$${amount}</span></div>
              <p style="text-align:center; font-size:10px; margin-top:40px; color:#6B7280;">Thank you for your business!</p>
          </div>
          <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!user) return null;

  return (
    <main className="max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-24 min-h-[85vh]">
      {/* Sidebar navigation */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 space-y-8 shadow-sm">
        <div className="space-y-2 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-poppins font-bold text-2xl shadow-lg shadow-primary/20 mx-auto">
            {user.name.charAt(0)}
          </div>
          <h3 className="font-poppins font-bold text-lg text-text-dark pt-1 text-center">{user.name}</h3>
          <p className="text-[10px] text-text-light font-mono bg-slate-100 py-1 px-3 rounded-full border border-slate-200 inline-block text-center">{user.designation || 'Client Account'}</p>
        </div>

        <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 text-xs font-semibold text-text-light border-b lg:border-b-0 pb-4 lg:pb-0 border-slate-200">
          <button 
            onClick={() => setActiveTab('projects')} 
            className={`flex-1 lg:flex-none text-left flex items-center space-x-3 p-3 rounded-xl transition-all ${activeTab === 'projects' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary'}`}
          >
            <FolderGit className="w-4 h-4" />
            <span className="hidden sm:inline">Active Projects</span>
          </button>
          <button 
            onClick={() => setActiveTab('invoices')} 
            className={`flex-1 lg:flex-none text-left flex items-center space-x-3 p-3 rounded-xl transition-all ${activeTab === 'invoices' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary'}`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Invoices & Receipts</span>
          </button>
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`flex-1 lg:flex-none text-left flex items-center space-x-3 p-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Live Chat Logs</span>
          </button>
          <button 
            onClick={() => setActiveTab('scheduler')} 
            className={`flex-1 lg:flex-none text-left flex items-center space-x-3 p-3 rounded-xl transition-all ${activeTab === 'scheduler' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary'}`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Book Appointment</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9 space-y-8">
        
        {/* Statistics Aggregations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary"><FolderGit className="w-6 h-6" /></div>
            <div>
              <span className="text-[10px] text-text-light block uppercase font-bold">Active Projects</span>
              <h4 className="text-xl font-poppins font-extrabold text-text-dark">{activeCount}</h4>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><CheckCircle className="w-6 h-6" /></div>
            <div>
              <span className="text-[10px] text-text-light block uppercase font-bold">Completed Works</span>
              <h4 className="text-xl font-poppins font-extrabold text-text-dark">{completedCount}</h4>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent"><CreditCard className="w-6 h-6" /></div>
            <div>
              <span className="text-[10px] text-text-light block uppercase font-bold">Total Investments</span>
              <h4 className="text-xl font-poppins font-extrabold text-text-dark">${totalSpent}</h4>
            </div>
          </div>
        </div>

        {/* TAB 1: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-lg text-text-dark">Your Project Roadmap Pipeline</h3>
                <p className="text-xs text-text-light">Real-time status updates of active designs, databases, and microservices.</p>
              </div>
              <button onClick={() => navigate('/project-request')} className="text-xs text-primary hover:underline font-bold flex items-center"><FolderGit className="w-4 h-4 mr-1" /> New Proposal</button>
            </div>

            {projects.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-light">No projects found. Submit a proposal form to start!</div>
            ) : (
              <div className="space-y-6">
                {projects.map((project) => (
                  <div key={project.id} className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold py-1 px-3 rounded-full uppercase">{project.projectType}</span>
                        <h4 className="font-poppins font-bold text-base text-text-dark mt-2">{project.title}</h4>
                      </div>
                      <div className="text-xs sm:text-right">
                        <span className="text-text-light block">Proposal Budget</span>
                        <span className="font-bold text-sm text-text-dark">${project.budget}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-light">Current Pipeline Stage: <span className="font-bold text-primary">{project.status}</span></span>
                        <span className="font-bold text-text-dark">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full transition-all duration-1000"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>

                      {/* Timeline Steps layout */}
                      <div className="grid grid-cols-6 text-center text-[9px] font-bold text-text-light relative">
                        <div className={project.progress >= 10 ? 'text-primary' : ''}>
                          <CheckCircle className={`w-4 h-4 mx-auto mb-1 rounded-full ${project.progress >= 10 ? 'text-primary' : 'text-slate-200'}`} />
                          <span>Received</span>
                        </div>
                        <div className={project.progress >= 25 ? 'text-primary' : ''}>
                          <CheckCircle className={`w-4 h-4 mx-auto mb-1 rounded-full ${project.progress >= 25 ? 'text-primary' : 'text-slate-200'}`} />
                          <span>Planning</span>
                        </div>
                        <div className={project.progress >= 55 ? 'text-primary' : ''}>
                          <CheckCircle className={`w-4 h-4 mx-auto mb-1 rounded-full ${project.progress >= 55 ? 'text-primary' : 'text-slate-200'}`} />
                          <span>Development</span>
                        </div>
                        <div className={project.progress >= 75 ? 'text-primary' : ''}>
                          <CheckCircle className={`w-4 h-4 mx-auto mb-1 rounded-full ${project.progress >= 75 ? 'text-primary' : 'text-slate-200'}`} />
                          <span>Testing</span>
                        </div>
                        <div className={project.progress >= 90 ? 'text-primary' : ''}>
                          <CheckCircle className={`w-4 h-4 mx-auto mb-1 rounded-full ${project.progress >= 90 ? 'text-primary' : 'text-slate-200'}`} />
                          <span>Review</span>
                        </div>
                        <div className={project.progress >= 100 ? 'text-emerald-500' : ''}>
                          <CheckCircle className={`w-4 h-4 mx-auto mb-1 rounded-full ${project.progress >= 100 ? 'text-emerald-500' : 'text-slate-200'}`} />
                          <span>Done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVOICES */}
        {activeTab === 'invoices' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div>
              <h3 class="font-poppins font-bold text-lg text-text-dark">Billing Invoices & Receipts</h3>
              <p className="text-xs text-text-light">Review project invoices, process payments securely, and download receipts.</p>
            </div>

            {invoices.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-light">No billing invoices billed.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-text-light font-bold">
                      <th className="pb-3">Project Title</th>
                      <th class="pb-3">Amount</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-slate-50 last:border-b-0">
                        <td class="py-4 font-bold text-text-dark">{invoice.projectTitle}</td>
                        <td className="py-4 text-text-light font-semibold">${invoice.amount}</td>
                        <td className="py-4 text-text-light">{invoice.dueDate}</td>
                        <td className="py-4">
                          <span className={`font-bold px-2.5 py-1 rounded-md text-[10px] ${invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {invoice.status === 'UNPAID' ? (
                            <button 
                              onClick={() => setPayInvoice(invoice)}
                              className="bg-primary hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-xl text-[10px] shadow-sm shadow-primary/10"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <button 
                              onClick={() => printReceipt(invoice.projectTitle, invoice.amount, invoice.paymentMethod)}
                              className="border border-slate-200 hover:bg-slate-50 font-bold py-1.5 px-3 rounded-xl text-[10px] flex items-center space-x-1 ml-auto"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Receipt</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CHAT */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-poppins font-bold text-lg text-text-dark">Workspace Chat Logs</h3>
                <p className="text-xs text-text-light">Dialogue thread logs with the developer or the virtual co-pilot.</p>
              </div>
              <select 
                value={chatRecipient} 
                onChange={(e) => setChatRecipient(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none text-xs text-text-dark font-semibold"
              >
                <option value="admin">Alex Developer (Admin)</option>
                <option value="ai">AI Co-Pilot (Virtual)</option>
              </select>
            </div>

            <div 
              ref={chatViewportRef}
              className="h-[320px] overflow-y-auto bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4 text-xs"
            >
              {chatMessages.length === 0 ? (
                <div className="py-12 text-center text-text-light italic">No message logs. Type a query below to start!</div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isMe = msg.senderId === user.username;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                      <span className="text-[9px] text-text-light pb-1 font-bold">{isMe ? 'You' : msg.senderName}</span>
                      <div className={`p-3 rounded-2xl max-w-[80%] inline-block shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-none ml-auto' : 'bg-white text-text-dark rounded-tl-none border border-slate-200'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              {chatTyping && (
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-text-light italic">AI is writing</span>
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-text-light rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a support query..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs text-text-dark"
              />
              <button onClick={sendChatMessage} className="bg-primary text-white p-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: APPOINTMENTS */}
        {activeTab === 'scheduler' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div>
              <h3 className="font-poppins font-bold text-lg text-text-dark">Book Consultant Appointment</h3>
              <p className="text-xs text-text-light">Schedule visual roadmaps, code audits, or proposal definitions directly on the calendar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5 space-y-4 text-xs font-semibold text-text-dark">
                <form onSubmit={submitBooking} className="space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <label>Meeting Purpose *</label>
                    <input 
                      type="text" 
                      placeholder="Project wireframe review" 
                      required 
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs font-medium" 
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label>Meeting Date *</label>
                    <input 
                      type="date" 
                      required 
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs text-text-light font-medium" 
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label>Select Time Slot *</label>
                    <select 
                      value={bookSlot} 
                      onChange={(e) => setBookSlot(e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs"
                    >
                      <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (EST)</option>
                      <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM (EST)</option>
                      <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM (EST)</option>
                      <option value="04:30 PM - 05:30 PM">04:30 PM - 05:30 PM (EST)</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label>Brief Description</label>
                    <textarea 
                      rows={3} 
                      value={bookDesc}
                      onChange={(e) => setBookDesc(e.target.value)}
                      placeholder="Discuss animations and databases..." 
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:border-primary/50 text-xs resize-none font-medium" 
                    />
                  </div>
                  <button type="submit" className="w-full bg-primary hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all">
                    Confirm Appointment
                  </button>
                </form>
              </div>

              <div className="md:col-span-7 space-y-4">
                <h4 className="font-poppins font-semibold text-sm text-text-dark">Your Booked Meetings</h4>
                {appointments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-light border border-dashed border-slate-200 rounded-2xl">
                    No meetings scheduled. Book a slot using the form!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((app) => (
                      <div key={app.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <h5 className="font-bold text-text-dark">{app.title}</h5>
                          <p className="text-text-light font-medium">{app.date} @ {app.timeSlot}</p>
                        </div>
                        <span className={`font-bold px-2 py-1 rounded text-[9px] uppercase ${app.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {payInvoice && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPayInvoice(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-primary to-accent p-5 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="font-poppins font-bold text-base">Secure Gateway Checkout</h3>
                </div>
                <button onClick={() => setPayInvoice(null)} className="text-white/80 hover:text-white p-1.5 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-6 text-xs text-text-dark font-semibold">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-text-light block">Amount Due</span>
                    <span className="text-2xl font-poppins font-bold text-text-dark">${payInvoice.amount}</span>
                  </div>
                  <span className="bg-amber-50 text-amber-600 font-bold px-2 py-1 rounded text-[9px] uppercase">Secure connection</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['card', 'paypal', 'upi'].map((m) => (
                    <button 
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`border p-3 text-center text-xs font-bold rounded-xl outline-none ${payMethod === m ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-text-dark'}`}
                    >
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>

                {payMethod === 'card' ? (
                  <form onSubmit={processPayment} className="space-y-4">
                    <div className="flex flex-col space-y-1.5">
                      <label>Cardholder Name</label>
                      <input 
                        type="text" 
                        required 
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="John Doe" 
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none" 
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label>Card Number</label>
                      <input 
                        type="text" 
                        required 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242" 
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <label>Expiry Date</label>
                        <input 
                          type="text" 
                          required 
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY" 
                          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none" 
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label>CVV Code</label>
                        <input 
                          type="password" 
                          required 
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="•••" 
                          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none" 
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-indigo-700 text-white font-medium py-3 rounded-xl mt-4 block shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Submit Secure Checkout</button>
                  </form>
                ) : payMethod === 'paypal' ? (
                  <div className="text-center py-6 space-y-4">
                    <Send className="w-10 h-10 text-blue-500 mx-auto animate-bounce" />
                    <p className="text-xs text-text-light max-w-xs mx-auto">Authorize checkout securely using PayPal.</p>
                    <button onClick={processPayment} className="bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-bold py-3 px-8 rounded-xl w-full">Checkout with PayPal</button>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-4">
                    <div className="w-32 h-32 bg-slate-100 mx-auto flex items-center justify-center border border-slate-200 rounded-xl relative overflow-hidden">
                      <QrCode className="w-12 h-12 text-text-dark" />
                    </div>
                    <p className="text-[10px] text-text-light max-w-xs mx-auto">Scan QR code using GPay, PhonePe, or BHIM to pay.</p>
                    <button onClick={processPayment} className="bg-primary text-white font-bold py-3 px-8 rounded-xl w-full">Scan and Checkout</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
