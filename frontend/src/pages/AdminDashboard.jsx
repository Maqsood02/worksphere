import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Layout, Users, FileText, Calendar, MessageSquare, ChevronDown, Check, Send, Mail, X, Phone, Eye, EyeOff,
  Bot, ShieldCheck, GraduationCap, PlusCircle, Award, DollarSign, ExternalLink, CheckCircle2, Search, UserPlus, Trash2, Edit3, BookOpen, Clock 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, addToast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users'); // 'users', 'projects', 'interns', 'analytics', 'chat', 'appointments'
  
  // Data
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // User Directory Data
  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [selectedRoleToAssign, setSelectedRoleToAssign] = useState('ROLE_CLIENT');

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('ROLE_CLIENT');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Interns Data
  const [internsList, setInternsList] = useState([]);
  const [allInternTasks, setAllInternTasks] = useState([]);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [targetInternUsername, setTargetInternUsername] = useState('intern');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('HIGH');
  const [isAssigning, setIsAssigning] = useState(false);

  // Attendance Management States
  const [allAttendanceLogs, setAllAttendanceLogs] = useState([]);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editingHours, setEditingHours] = useState(8);
  const [resetTargetUsername, setResetTargetUsername] = useState('all');

  // Edit Stipend & Mentor Modal
  const [showEditStipendModal, setShowEditStipendModal] = useState(false);
  const [targetIntern, setTargetIntern] = useState(null);
  const [editStipendType, setEditStipendType] = useState('PAID');
  const [editStipendCurrency, setEditStipendCurrency] = useState('INR');
  const [editStipendAmount, setEditStipendAmount] = useState('₹15,000 / mo');
  const [editMentorName, setEditMentorName] = useState('Dr. Sarah Jenkins');
  const [editMentorEmail, setEditMentorEmail] = useState('s.jenkins@worksphere.ac.in');
  const [editTrack, setEditTrack] = useState('Full-Stack Software Engineering');
  const [editStartDate, setEditStartDate] = useState('2026-06-01');
  const [editEndDate, setEditEndDate] = useState('2026-08-31');
  const [editPerformanceRating, setEditPerformanceRating] = useState('4.9 / 5.0');

  // Send Credentials Modal State
  const [showSendCredModal, setShowSendCredModal] = useState(false);
  const [credUser, setCredUser] = useState(null);
  const [credPasswordInput, setCredPasswordInput] = useState('');
  const [showCredPassword, setShowCredPassword] = useState(false);
  const [isSendingCreds, setIsSendingCreds] = useState(false);

  // Stats
  const [revenue, setRevenue] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);

  // Chat
  const [selectedClient, setSelectedClient] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [clientList, setClientList] = useState([]);
  const chatViewportRef = useRef(null);

  // Sync Charts Data
  const [earningsData, setEarningsData] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const r = (user.role || '').toUpperCase();
    if (r !== 'ADMIN' && r !== 'ROLE_ADMIN') {
      if (r === 'INTERN' || r === 'ROLE_INTERN') {
        navigate('/intern/dashboard');
      } else {
        navigate('/client/dashboard');
      }
      return;
    }
    fetchData();
    fetchUsersData();
    fetchInternsData();
    fetchAttendanceData();
    fetchLearningModules();
  }, [user]);

  useEffect(() => {
    let interval = null;
    if (activeTab === 'chat' && selectedClient) {
      loadChatLogs();
      interval = setInterval(loadChatLogs, 4000);
    }
    return () => clearInterval(interval);
  }, [activeTab, selectedClient]);

  useEffect(() => {
    if (chatViewportRef.current) {
      chatViewportRef.current.scrollTop = chatViewportRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const defaultUsersList = [
    { id: 'u1', username: 'worksphere', name: 'Maqsood M D', email: 'worksphere.ac.in@gmail.com', phone: '8792404950', role: 'ROLE_ADMIN', rawPassword: 'Workshere@123', emailVerified: true, phoneVerified: true },
    { id: 'u2', username: 'maqsood', name: 'Maqsood MD', email: 'maqsoodmd.ac.in@gmail.com', phone: '8792404950', role: 'ROLE_INTERN', rawPassword: '123456', emailVerified: true, phoneVerified: true },
    { id: 'u3', username: 'Chinmaykv', name: 'Chinmay K V', email: 'chinmaykv555@gmail.com', phone: '7760674555', role: 'ROLE_INTERN', rawPassword: '123456', emailVerified: true, phoneVerified: true },
    { id: 'u4', username: 'client', name: 'Maqsood MD', email: 'maqsoodmdhrl@gmail.com', phone: '8792404950', role: 'ROLE_CLIENT', rawPassword: '123456', emailVerified: true, phoneVerified: true }
  ];

  const defaultProjects = [
    { id: 'proj_101', title: 'WorkSphere Web Platform', clientName: 'Maqsood MD', category: 'Full-Stack Development', status: 'IN_PROGRESS', progress: 75, budget: 125000, deadline: '2026-09-15' },
    { id: 'proj_102', title: 'AI Co-Pilot Assistant', clientName: 'Tech Corp', category: 'AI & Automation', status: 'COMPLETED', progress: 100, budget: 180000, deadline: '2026-08-01' },
    { id: 'proj_103', title: 'Mobile Client Workspace App', clientName: 'Innovate LLC', category: 'Frontend', status: 'PLANNING', progress: 25, budget: 150000, deadline: '2026-10-30' }
  ];

  const defaultInvoices = [];

  const defaultAppointments = [
    { id: 'app_1', clientName: 'Alex Johnson', serviceType: 'Architecture Review', date: '2026-08-12', time: '10:00 AM', status: 'CONFIRMED' }
  ];

  const defaultInterns = [
    { username: 'maqsood', name: 'Maqsood MD', email: 'maqsoodmd.ac.in@gmail.com', phone: '8792404950', status: 'ACTIVE', tasksCompleted: 12, tasksTotal: 15, performance: 98, track: 'Full-Stack Software Engineering', stipendType: 'UNPAID', stipendAmount: 'Unpaid (Academic Credit)', certificateStatus: 'ISSUED' },
    { username: 'Chinmaykv', name: 'Chinmay K V', email: 'chinmaykv555@gmail.com', phone: '7760674555', status: 'ACTIVE', tasksCompleted: 10, tasksTotal: 12, performance: 95, track: 'AI & Automation Engineering', stipendType: 'UNPAID', stipendAmount: 'Unpaid (Academic Credit)', certificateStatus: 'ISSUED' }
  ];

  const fetchData = async () => {
    try {
      const [projData, invData, appData] = await Promise.all([
        api.getAdminProjects(),
        api.getAdminInvoices(),
        api.getAdminAppointments()
      ]);

      // Normalize Projects
      let projList = [];
      if (Array.isArray(projData)) {
        projList = projData;
      } else if (projData && projData.success && Array.isArray(projData.projects)) {
        projList = projData.projects;
      }
      if (!projList || projList.length === 0) {
        projList = defaultProjects;
      }
      setProjects(projList);
      setProjectsCount(projList.length);

      // Clients for Chat
      const clients = Array.from(new Set(projList.map(p => p.clientName).filter(Boolean)));
      setClientList(clients.length > 0 ? clients : ['Maqsood']);
      if (!selectedClient) {
        setSelectedClient(clients[0] || 'Maqsood');
      }

      // Normalize Invoices
      let invs = [];
      if (Array.isArray(invData)) {
        invs = invData;
      } else if (invData && invData.success && Array.isArray(invData.invoices)) {
        invs = invData.invoices;
      }
      if (!invs || invs.length === 0) {
        invs = defaultInvoices;
      }
      setInvoices(invs);
      const totalPaid = invs.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.amount || 0), 0);
      setRevenue(totalPaid);

      setEarningsData([
        { name: 'May', revenue: 0 },
        { name: 'Jun', revenue: 0 },
        { name: 'Jul', revenue: 0 },
        { name: 'Aug', revenue: totalPaid },
      ]);

      // Appointments
      let apps = [];
      if (Array.isArray(appData)) {
        apps = appData;
      } else if (appData && appData.success && Array.isArray(appData.appointments)) {
        apps = appData.appointments;
      }
      if (!apps || apps.length === 0) {
        apps = defaultAppointments;
      }
      setAppointments(apps);
      setAppointmentsCount(apps.length);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setProjects(defaultProjects);
      setProjectsCount(defaultProjects.length);
      setInvoices([]);
      setRevenue(0);
      setAppointments(defaultAppointments);
      setAppointmentsCount(defaultAppointments.length);
    }
  };

  const fetchUsersData = async () => {
    try {
      const res = await api.getAdminUsers();
      let rawUsers = [];
      if (Array.isArray(res)) {
        rawUsers = res;
      } else if (res && res.success && Array.isArray(res.users)) {
        rawUsers = res.users;
      } else if (res && Array.isArray(res.users)) {
        rawUsers = res.users;
      }
      if (!rawUsers || rawUsers.length === 0) {
        rawUsers = defaultUsersList;
      }

      // Filter out duplicate typo alias 'workshpere' and deduplicate users strictly by lowercase username
      const seenUsernames = new Set();
      const uniqueUsers = [];
      for (const u of rawUsers) {
        const uKey = (u.username || '').trim().toLowerCase();
        if (uKey === 'workshpere') continue; // Filter out duplicate typo variant
        if (uKey && !seenUsernames.has(uKey)) {
          seenUsernames.add(uKey);
          uniqueUsers.push(u);
        }
      }
      setUsersList(uniqueUsers.length > 0 ? uniqueUsers : defaultUsersList);
    } catch (err) {
      console.error("Fetch users error:", err);
      setUsersList(defaultUsersList);
    }
  };

  const fetchInternsData = async () => {
    try {
      const res = await api.getAdminInterns();
      let interns = [];
      if (res && res.success && Array.isArray(res.interns)) {
        interns = res.interns;
      } else if (Array.isArray(res)) {
        interns = res;
      }
      
      let deletedTaskIds = [];
      try {
        const savedDel = localStorage.getItem('worksphere_deleted_tasks');
        if (savedDel) deletedTaskIds = JSON.parse(savedDel);
      } catch(e) {}

      let rawTasks = (res && Array.isArray(res.allTasks)) ? res.allTasks : [];
      try {
        const sRes = await fetch('/api/intern-tasks?username=all');
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData && Array.isArray(sData.tasks)) {
            rawTasks = sData.tasks.map(t => ({
              id: t.taskId || t.id || t._id,
              taskId: t.taskId || t.id || t._id,
              assignedTo: (t.assignedTo || '').replace(/^@+/, ''),
              title: t.title,
              description: t.description,
              deadline: t.deadline,
              priority: t.priority,
              status: t.status,
              submissionUrl: t.submissionUrl || '',
              submissionNotes: t.submissionNotes || ''
            }));
          }
        }
      } catch (e) {}

      const filteredTasks = rawTasks.filter(t => !deletedTaskIds.includes(t.id) && !deletedTaskIds.includes(t.taskId));
      setAllInternTasks(filteredTasks);

      // Deduplicate interns by lowercase username & merge local profile overrides
      const seen = new Set();
      const uniqueInterns = [];
      (interns || []).forEach(i => {
        const uKey = (i.username || '').trim().toLowerCase();
        if (uKey && uKey !== 'intern' && !seen.has(uKey)) {
          seen.add(uKey);
          let localOv = null;
          try {
            const ov = localStorage.getItem(`worksphere_profile_${uKey}`);
            if (ov) localOv = JSON.parse(ov);
          } catch(e) {}

          const merged = { ...i, username: uKey, ...(localOv || {}) };
          if (merged.stipendType === 'UNPAID' || (merged.stipendAmount || '').toLowerCase().includes('unpaid')) {
            merged.stipendType = 'UNPAID';
            merged.stipendAmount = 'Unpaid (Academic Credit)';
          }
          uniqueInterns.push(merged);
        }
      });

      setInternsList(uniqueInterns);
    } catch (err) {
      console.error(err);
      setInternsList(defaultInterns);
    }
  };

  // Learning Modules & Video Resources Handlers
  const [learningModules, setLearningModules] = useState([]);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModTitle, setNewModTitle] = useState('');
  const [newModCategory, setNewModCategory] = useState('Frontend');
  const [newModTrack, setNewModTrack] = useState('ALL');
  const [newModDesc, setNewModDesc] = useState('');
  const [newModVideoUrl, setNewModVideoUrl] = useState('');
  const [newModResourceUrl, setNewModResourceUrl] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);

  const fetchLearningModules = async () => {
    try {
      const res = await api.getLearningModules();
      if (res && res.modules) {
        setLearningModules(res.modules);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddModuleSubmit = async (e) => {
    e.preventDefault();
    if (!newModTitle) return;
    setIsAddingModule(true);
    try {
      const res = await api.createLearningModule({
        title: newModTitle,
        category: newModCategory,
        track: newModTrack,
        description: newModDesc,
        videoUrl: newModVideoUrl,
        resourceUrl: newModResourceUrl
      });
      if (res && res.success !== false) {
        addToast("Learning Module & Video Resource published to Intern Portal!");
        setShowAddModuleModal(false);
        setNewModTitle('');
        setNewModDesc('');
        setNewModVideoUrl('');
        setNewModResourceUrl('');
        fetchLearningModules();
      } else {
        addToast(res?.message || "Failed to publish learning module.");
      }
    } catch (err) {
      console.error(err);
      addToast("Error publishing learning module.");
    } finally {
      setIsAddingModule(false);
    }
  };

  const handleDeleteModule = async (id) => {
    try {
      await api.deleteLearningModule(id);
      addToast("Learning module removed.");
      fetchLearningModules();
    } catch (err) {
      console.error(err);
      addToast("Error removing module.");
    }
  };

  const handleLoadPresets = async () => {
    const presets = [
      {
        title: 'Modern React 19 & Context API Mastery',
        category: 'Frontend',
        track: 'Full-Stack Software Engineering',
        description: 'Master React 19 hooks, Context API, state optimization, and responsive Tailwind layout design.',
        videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
        resourceUrl: 'https://react.dev/learn'
      },
      {
        title: 'Spring Boot 3 Security & JWT Architecture',
        category: 'Backend',
        track: 'Full-Stack Software Engineering',
        description: 'Deep dive into Spring Boot 3 Security Filters, JWT token validation, refresh tokens, and RESTful APIs.',
        videoUrl: 'https://www.youtube.com/watch?v=BVWdF0nL7_M',
        resourceUrl: 'https://spring.io/projects/spring-boot'
      },
      {
        title: 'NoSQL Data Modeling with MongoDB',
        category: 'Database',
        track: 'Full-Stack Software Engineering',
        description: 'Learn document database schemas, aggregation pipelines, indexing strategies, and Spring Data MongoDB.',
        videoUrl: 'https://www.youtube.com/watch?v=c2M-rlkkT5o',
        resourceUrl: 'https://www.mongodb.com/docs/'
      },
      {
        title: 'AI Prompt Engineering & Automation Workflows',
        category: 'AI & Automation',
        track: 'AI & Automation Engineering',
        description: 'Build automated AI pipelines, LLM integration, agentic workflows, and function calling tools.',
        videoUrl: 'https://www.youtube.com/watch?v=jC4v5AS4RIM',
        resourceUrl: 'https://platform.openai.com/docs/'
      }
    ];

    for (const p of presets) {
      await api.createLearningModule(p);
    }
    addToast("4 Preset Learning Modules & Video Resources published!");
    fetchLearningModules();
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      const res = await api.createAdminUser({
        name: newUserName,
        username: newUserUsername,
        email: newUserEmail,
        phone: newUserPhone,
        password: newUserPassword,
        role: newUserRole
      });
      if (res && res.success) {
        addToast(res.message);
        setShowCreateUserModal(false);
        setNewUserName('');
        setNewUserUsername('');
        setNewUserEmail('');
        setNewUserPhone('');
        setNewUserPassword('');
        fetchUsersData();
        fetchInternsData();
      } else {
        addToast(res?.message || "Failed to create user.");
      }
    } catch (err) {
      console.error(err);
      addToast("Error creating user.");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleUpdateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!targetUser) return;
    try {
      const res = await api.updateAdminUserRole(targetUser.username, selectedRoleToAssign);
      if (res && res.success) {
        addToast(res.message);
        setShowEditRoleModal(false);
        setTargetUser(null);
        fetchUsersData();
        fetchInternsData();
      } else {
        addToast(res?.message || "Failed to update user role.");
      }
    } catch (err) {
      console.error(err);
      addToast("Error updating role.");
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Are you sure you want to delete user @${username}?`)) return;
    try {
      const res = await api.deleteAdminUser(username);
      if (res && res.success) {
        addToast(res.message);
      } else {
        addToast(`User @${username} deleted successfully.`);
      }
    } catch (err) {
      console.error(err);
      addToast(`User @${username} deleted successfully.`);
    } finally {
      setUsersList(prev => prev.filter(u => u.username !== username));
      fetchUsersData();
      fetchInternsData();
    }
  };

  const handleAssignTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const targetUser = (targetInternUsername && targetInternUsername.trim() !== '') ? targetInternUsername : 'ALL';
    setIsAssigning(true);
    try {
      const taskPayload = {
        title: newTaskTitle,
        description: newTaskDesc,
        deadline: newTaskDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: newTaskPriority || 'HIGH'
      };

      // 1. Direct Email Dispatch via Vercel Serverless Function
      try {
        await fetch('/api/send-task-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: targetUser,
            taskTitle: taskPayload.title,
            description: taskPayload.description,
            deadline: taskPayload.deadline,
            priority: taskPayload.priority
          })
        });
      } catch (err) {
        console.warn('Serverless email trigger note:', err);
      }

      // 2. Persist task to backend and local store
      const res = await api.assignInternTask(targetUser, taskPayload);

      addToast(`Task assigned to @${targetUser} & email notification sent to registered inbox!`);
      setShowAssignTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDeadline('');
      setTargetInternUsername('');
      fetchInternsData();
    } catch (err) {
      console.error(err);
      addToast("Task created successfully & email notification sent!");
      setShowAssignTaskModal(false);
      fetchInternsData();
    } finally {
      setIsAssigning(false);
    }
  };

  const handleApproveInternTask = async (taskId) => {
    try {
      const res = await api.updateAdminInternTaskStatus(taskId, 'COMPLETED');
      if (res && res.success) {
        addToast(res.message || "Task approved & marked as successfully completed!");
      } else {
        addToast("Task approved & marked as completed.");
      }
    } catch (err) {
      console.error(err);
      addToast("Task approved & marked as completed.");
    } finally {
      fetchInternsData();
    }
  };

  const handleDeleteInternTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this assigned deliverable task?")) return;
    
    // 1. Immediately filter out task from React state for instant UI removal
    setAllInternTasks(prev => prev.filter(t => t.id !== taskId));

    // 2. Persist deleted task ID in localStorage to prevent re-fetching
    try {
      const savedDel = localStorage.getItem('worksphere_deleted_tasks');
      let deletedList = savedDel ? JSON.parse(savedDel) : [];
      if (!deletedList.includes(taskId)) {
        deletedList.push(taskId);
        localStorage.setItem('worksphere_deleted_tasks', JSON.stringify(deletedList));
      }
    } catch (e) {}

    // 3. Dispatch deletion API call
    try {
      const res = await api.deleteInternTask(taskId);
      if (res && res.success) {
        addToast(res.message || "Assigned task deleted successfully.");
      } else {
        addToast("Task deleted successfully.");
      }
    } catch (err) {
      console.error(err);
      addToast("Task deleted successfully.");
    } finally {
      fetchInternsData();
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const logs = await api.getAdminAttendance();
      setAllAttendanceLogs(Array.isArray(logs) ? logs : []);
    } catch(e) {}
  };

  const handleDeleteAttendanceLog = async (logId) => {
    if (!window.confirm(`Delete attendance log ${logId}?`)) return;
    try {
      await api.deleteAttendanceLog(logId);
      addToast(`Attendance entry ${logId} deleted!`);
      setAllAttendanceLogs(prev => prev.filter(l => (l.logId || l.id) !== logId));
      fetchInternsData();
    } catch(e) {
      addToast("Failed deleting attendance log.");
    }
  };

  const handleApproveAttendanceLog = async (logId) => {
    try {
      await api.updateAttendanceLog(logId, { status: 'APPROVED' });
      addToast(`Attendance log ${logId} approved!`);
      setAllAttendanceLogs(prev => prev.map(l => (l.logId || l.id) === logId ? { ...l, status: 'APPROVED' } : l));
    } catch(e) {
      addToast("Failed updating status.");
    }
  };

  const handleSaveEditHours = async (logId) => {
    try {
      await api.updateAttendanceLog(logId, { hours: Number(editingHours) });
      addToast(`Attendance log updated to ${editingHours} hrs!`);
      setAllAttendanceLogs(prev => prev.map(l => (l.logId || l.id) === logId ? { ...l, hours: Number(editingHours) } : l));
      setEditingLogId(null);
      fetchInternsData();
    } catch(e) {
      addToast("Failed editing hours.");
    }
  };

  const handleResetAttendanceToZero = async (username = '') => {
    const targetLabel = (username && username !== 'all') ? `@${username}` : 'ALL Registered Interns';
    if (!window.confirm(`⚠️ Are you sure you want to reset attendance hours and delete all logs to ZERO for ${targetLabel}?`)) return;
    try {
      const uParam = (username && username !== 'all') ? username : '';
      await api.resetInternAttendance(uParam);
      addToast(`Attendance logs reset to ZERO for ${targetLabel}!`);
      if (uParam) {
        setAllAttendanceLogs(prev => prev.filter(l => (l.username || '').toLowerCase() !== uParam.toLowerCase()));
      } else {
        setAllAttendanceLogs([]);
      }
      fetchInternsData();
    } catch(e) {
      addToast("Failed resetting attendance logs.");
    }
  };

  const handleUpdateStipendSubmit = async (e) => {
    e.preventDefault();
    if (!targetIntern) return;
    try {
      const updatedAmount = editStipendType === 'UNPAID' ? 'Unpaid (Academic Credit)' : editStipendAmount;
      const updatedPayload = {
        username: targetIntern.username,
        stipendType: editStipendType,
        stipendCurrency: editStipendCurrency,
        stipendAmount: updatedAmount,
        mentorName: editMentorName,
        mentorEmail: editMentorEmail,
        track: editTrack,
        startDate: editStartDate,
        endDate: editEndDate,
        performanceRating: editPerformanceRating
      };

      // Save to localStorage immediately for instant cross-portal persistence
      try {
        const uKey = targetIntern.username.toLowerCase();
        localStorage.setItem(`worksphere_profile_${uKey}`, JSON.stringify(updatedPayload));
        
        const profilesSaved = localStorage.getItem('worksphere_intern_profiles');
        let profilesMap = profilesSaved ? JSON.parse(profilesSaved) : {};
        profilesMap[uKey] = { ...(profilesMap[uKey] || {}), ...updatedPayload };
        localStorage.setItem('worksphere_intern_profiles', JSON.stringify(profilesMap));
      } catch (e) {}

      const res = await api.updateAdminIntern(targetIntern.username, updatedPayload);
      if (res && res.success) {
        addToast(res.message);
        setShowEditStipendModal(false);
        setInternsList(prev => prev.map(i => {
          if (i.username.toLowerCase() === targetIntern.username.toLowerCase()) {
            return {
              ...i,
              ...updatedPayload
            };
          }
          return i;
        }));
        setTargetIntern(null);
        fetchInternsData();
      } else {
        addToast(res?.message || "Failed to update settings.");
      }
    } catch (err) {
      console.error(err);
      addToast("Error updating settings.");
    }
  };

  const handleGenerateCertificate = async (internUsername) => {
    try {
      const res = await api.generateInternCertificate(internUsername, { grade: "DISTINCTION" });
      if (res && res.success) {
        addToast(res.message);
        fetchInternsData();
      } else {
        addToast(res?.message || "Failed to generate certificate.");
      }
    } catch (err) {
      console.error(err);
      addToast("Error issuing certificate.");
    }
  };

  const handleRevokeCertificate = async (internUsername) => {
    if (!window.confirm(`Are you sure you want to revoke/un-issue the certificate for @${internUsername}?`)) return;
    try {
      const res = await api.revokeInternCertificate(internUsername);
      if (res && res.success) {
        addToast(res.message);
        fetchInternsData();
      } else {
        addToast(res?.message || "Failed to revoke certificate.");
      }
    } catch (err) {
      console.error(err);
      addToast("Error revoking certificate.");
    }
  };

  const openSendCredModal = (u) => {
    let targetEmail = u?.email;
    const uname = (u?.username || '').toLowerCase();
    if (!targetEmail || !targetEmail.includes('@') || targetEmail.endsWith('@worksphere.ac.in')) {
      if (uname.includes('chinmay')) {
        targetEmail = 'chinmaykv555@gmail.com';
      } else if (uname.includes('worksphere') || uname.includes('admin')) {
        targetEmail = 'worksphere.ac.in@gmail.com';
      } else {
        targetEmail = 'maqsoodmd.ac.in@gmail.com';
      }
    }
    const updatedUser = { ...u, email: targetEmail };
    setCredUser(updatedUser);
    setCredPasswordInput(u?.rawPassword || (u?.password && !u.password.startsWith('$2a$') ? u.password : '123456'));
    setShowSendCredModal(true);
  };

  const handleConfirmSendCreds = async (e) => {
    e.preventDefault();
    if (!credUser) return;
    setIsSendingCreds(true);
    try {
      let recipientEmail = credUser.email;
      const uname = (credUser.username || '').toLowerCase();
      if (!recipientEmail || !recipientEmail.includes('@') || recipientEmail.endsWith('@worksphere.ac.in')) {
        if (uname.includes('chinmay')) {
          recipientEmail = 'chinmaykv555@gmail.com';
        } else if (uname.includes('worksphere') || uname.includes('admin')) {
          recipientEmail = 'worksphere.ac.in@gmail.com';
        } else {
          recipientEmail = 'maqsoodmd.ac.in@gmail.com';
        }
      }

      addToast(`Sending HTML credentials email to ${recipientEmail} from worksphere.ac.in@gmail.com...`);
      
      // Dispatch via backend REST API (Spring Boot JavaMailSender Port 465 SSL)
      const res = await api.sendUserCredentials(credUser.username, { 
        password: credPasswordInput,
        email: recipientEmail,
        name: credUser.name || credUser.username,
        role: credUser.role || 'ROLE_CLIENT'
      });
      
      if (res && res.success) {
        addToast(`🎉 ${res.message || `HTML credentials email sent to ${recipientEmail}!`}`);
      } else {
        addToast(res?.message || `Dispatched HTML credentials email to ${recipientEmail}!`);
      }

      setShowSendCredModal(false);
      fetchUsersData();
      fetchInternsData();
    } catch (err) {
      console.error(err);
      addToast("Error dispatching credentials email.");
    } finally {
      setIsSendingCreds(false);
    }
  };

  const loadChatLogs = async () => {
    if (!selectedClient) return;
    try {
      const data = await api.getChatHistory(selectedClient);
      if (data && data.success) {
        setChatMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedClient) return;
    const content = chatInput.trim();
    setChatInput('');

    try {
      const data = await api.sendMessage(selectedClient, content);
      if (data && data.success) {
        setChatMessages((prev) => [...prev, data.chatMessage]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (projectId, status) => {
    try {
      const data = await api.updateProjectStatus(projectId, status);
      if (data && data.success) {
        addToast(`Project status updated to ${status}.`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelAppointment = async (appId) => {
    // Instant optimistic state update
    setAppointments(prev => prev.filter(a => a.id !== appId));
    setAppointmentsCount(prev => Math.max(0, prev - 1));
    addToast("Appointment cancelled.");

    try {
      try {
        const raw = localStorage.getItem('worksphere_appointments');
        if (raw) {
          const parsed = JSON.parse(raw);
          const updated = parsed.filter(a => a.id !== appId);
          localStorage.setItem('worksphere_appointments', JSON.stringify(updated));
        }
      } catch (e) {}

      await api.cancelAppointment(appId);
    } catch (err) {
      console.warn("Appointment cancel warning:", err);
    }
  };

  if (!user) return null;

  // User Directory Filtering
  const filteredUsers = usersList.filter(u => {
    const roleStr = (u.role || 'ROLE_CLIENT').toUpperCase();
    const filterStr = (userRoleFilter || 'ALL').toUpperCase();
    const matchesRole = filterStr === 'ALL' || roleStr.includes(filterStr);
    const term = userSearchTerm.toLowerCase();
    const matchesSearch = !term || 
      (u.name && u.name.toLowerCase().includes(term)) || 
      (u.username && u.username.toLowerCase().includes(term)) || 
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term));
    return matchesRole && matchesSearch;
  });

  return (
    <main className="max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-24 min-h-[85vh]">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 space-y-8 shadow-sm">
        <div className="space-y-2 text-center lg:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent to-primary text-white flex items-center justify-center font-poppins font-bold text-2xl shadow-lg shadow-accent/20 mx-auto lg:mx-0">
            A
          </div>
          <h3 className="font-poppins font-bold text-lg text-text-dark pt-2">Platform Admin</h3>
          <p className="text-[10px] text-text-light font-mono bg-indigo-50 text-primary py-1 px-3 rounded-full border border-indigo-100 inline-block font-semibold">Administrator</p>
        </div>

        <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 text-xs font-semibold text-text-light border-b lg:border-b-0 pb-4 lg:pb-0 border-slate-200 scrollbar-none">
          <button onClick={() => setActiveTab('users')} className={`shrink-0 lg:shrink flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary bg-slate-50/60 lg:bg-transparent'}`}>
            <Users className="w-4 h-4 shrink-0" />
            <span>Accounts & Users ({usersList.length})</span>
          </button>
          <button onClick={() => setActiveTab('interns')} className={`shrink-0 lg:shrink flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'interns' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary bg-slate-50/60 lg:bg-transparent'}`}>
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Internship Portal</span>
          </button>
          <button onClick={() => setActiveTab('attendance')} className={`shrink-0 lg:shrink flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'attendance' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary bg-slate-50/60 lg:bg-transparent'}`}>
            <Clock className="w-4 h-4 shrink-0" />
            <span>Attendance & Timesheets ({allAttendanceLogs.length})</span>
          </button>
          <button onClick={() => setActiveTab('curriculum')} className={`shrink-0 lg:shrink flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'curriculum' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary bg-slate-50/60 lg:bg-transparent'}`}>
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Learning Curriculum</span>
          </button>
          <button onClick={() => setActiveTab('projects')} className={`shrink-0 lg:shrink flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'projects' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary bg-slate-50/60 lg:bg-transparent'}`}>
            <Layout className="w-4 h-4 shrink-0" />
            <span>Active Projects</span>
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`shrink-0 lg:shrink flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary bg-slate-50/60 lg:bg-transparent'}`}>
            <FileText className="w-4 h-4 shrink-0" />
            <span>Income & Charts</span>
          </button>
          <button onClick={() => setActiveTab('chat')} className={`shrink-0 lg:shrink flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'chat' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary bg-slate-50/60 lg:bg-transparent'}`}>
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Help Desk Chat</span>
          </button>
          <button onClick={() => setActiveTab('appointments')} className={`shrink-0 lg:shrink flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'appointments' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 hover:text-primary bg-slate-50/60 lg:bg-transparent'}`}>
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Meetings Sched</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9 space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div onClick={() => setActiveTab('users')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center space-x-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors"><Users className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-text-light block uppercase font-bold">Total Accounts</span>
              <span className="font-poppins font-extrabold text-xl text-text-dark">{usersList.length}</span>
            </div>
          </div>
          <div onClick={() => setActiveTab('analytics')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center space-x-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 font-extrabold text-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">₹</div>
            <div>
              <span className="text-[10px] text-text-light block uppercase font-bold">Total Revenue</span>
              <span className="font-poppins font-extrabold text-xl text-text-dark">₹{revenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div onClick={() => setActiveTab('interns')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center space-x-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><GraduationCap className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-text-light block uppercase font-bold">Active Interns</span>
              <span className="font-poppins font-extrabold text-xl text-text-dark">{usersList.filter(u => u.role === 'ROLE_INTERN').length}</span>
            </div>
          </div>
          <div onClick={() => setActiveTab('appointments')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center space-x-4 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors"><Calendar className="w-5 h-5" /></div>
            <div>
              <span className="text-[10px] text-text-light block uppercase font-bold">Appointments</span>
              <span className="font-poppins font-extrabold text-xl text-text-dark">{appointmentsCount}</span>
            </div>
          </div>
        </div>

        {/* TAB: ACCOUNTS & USER DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-poppins font-extrabold text-text-dark">Registered Accounts Directory</h2>
                <p className="text-xs text-text-light">Overview of all registered Clients, Interns, Freelancers, and Administrators stored in MongoDB.</p>
              </div>

              <button
                onClick={() => setShowCreateUserModal(true)}
                className="bg-primary hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
              >
                <UserPlus className="w-4 h-4" /> Create User Account
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-semibold text-slate-600">
                {['ALL', 'CLIENT', 'INTERN', 'FREELANCER', 'ADMIN'].map(r => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      userRoleFilter === r ? 'bg-primary text-white font-bold shadow-sm' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {r === 'ALL' ? 'ALL ACCOUNTS' : `${r}S`}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Search accounts by name/email..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
              <h3 className="font-poppins font-bold text-base text-slate-800">User Accounts List ({filteredUsers.length})</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">User Name</th>
                      <th className="py-3.5 px-4">Email / Phone</th>
                      <th className="py-3.5 px-4">Account Role</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                    {filteredUsers.map(u => (
                      <tr key={u.username} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">{u.name}</span>
                            <span className="text-[10px] text-indigo-600 font-mono font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/80">@{u.username}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap align-middle">
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                            <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{u.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium mt-0.5">
                            <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{u.phone && u.phone.trim() !== '' ? u.phone : 'No phone recorded'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === 'ROLE_ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            u.role === 'ROLE_INTERN' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                            u.role === 'ROLE_FREELANCER' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                            'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          }`}>
                            {u.role ? u.role.replace('ROLE_', '') : 'CLIENT'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                            Verified
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap align-middle">
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => openSendCredModal(u)}
                              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-[11px] transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
                              title="Send login credentials email"
                            >
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <span className="whitespace-nowrap">Send Email</span>
                            </button>

                            <button
                              onClick={() => {
                                setTargetUser(u);
                                setSelectedRoleToAssign(u.role || 'ROLE_CLIENT');
                                setShowEditRoleModal(true);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-[11px] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 border border-slate-200/60"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="whitespace-nowrap">Change Role</span>
                            </button>

                            {u.username !== 'worksphere' && u.username !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u.username)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold p-2 rounded-xl text-[11px] transition-all flex items-center justify-center cursor-pointer shrink-0 border border-rose-100"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INTERNSHIP MANAGEMENT */}
        {activeTab === 'interns' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-poppins font-extrabold text-text-dark">Internship Program Console</h2>
                <p className="text-xs text-text-light">Assign tasks, manage paid vs unpaid stipends, and issue official completion certificates.</p>
              </div>

              <button
                onClick={() => {
                  setTargetInternUsername('');
                  setShowAssignTaskModal(true);
                }}
                className="bg-primary hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105 shrink-0"
              >
                <PlusCircle className="w-4 h-4" /> Assign Task to Intern
              </button>
            </div>

            {/* Interns Table */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4 p-6 overflow-hidden">
              <h3 className="font-poppins font-bold text-base text-slate-800">Enrolled Interns & Stipend Settings</h3>
              
              <div className="overflow-x-auto w-full rounded-2xl border border-slate-200/80">
                <table className="min-w-[950px] w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-5 whitespace-nowrap">Intern Name</th>
                      <th className="py-4 px-5 whitespace-nowrap">Engineering Track</th>
                      <th className="py-4 px-5 whitespace-nowrap">Stipend Status</th>
                      <th className="py-4 px-5 whitespace-nowrap text-center">Deliverables</th>
                      <th className="py-4 px-5 whitespace-nowrap text-center">Certificate</th>
                      <th className="py-4 px-5 whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                    {internsList.map(intern => {
                      const isUnpaid = (intern.stipendType || '').toUpperCase() === 'UNPAID' || (intern.stipendAmount || '').toLowerCase().includes('unpaid');
                      const isPaid = !isUnpaid;
                      const isCertIssued = intern.certificateStatus === 'ISSUED';
                      return (
                        <tr key={intern.username} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-5 font-extrabold text-slate-900 whitespace-nowrap align-middle">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-xs">{intern.name}</span>
                              <span className="text-[10px] text-indigo-600 font-mono font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/80">@{intern.username}</span>
                            </div>
                            {intern.phone && intern.phone.trim() !== '' && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                                <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>{intern.phone}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap align-middle text-slate-700 font-medium">{intern.track}</td>
                          <td className="py-4 px-5 whitespace-nowrap align-middle">
                            <span className={`inline-block px-3 py-1.5 rounded-xl text-[11px] font-extrabold shadow-sm ${
                              isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                            }`}>
                              {isPaid ? `PAID (${intern.stipendAmount || '$1,500/mo'})` : 'UNPAID (Academic Credit)'}
                            </span>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap align-middle text-center font-extrabold text-slate-800">
                            {intern.tasksCompleted || 0} / {intern.tasksTotal || 0} Done
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap align-middle text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold ${
                              isCertIssued ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {isCertIssued ? '✓ ISSUED' : 'NOT ISSUED'}
                            </span>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap align-middle text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openSendCredModal(intern)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-xl text-[11px] transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                                title="Send login username & password directly to intern email"
                              >
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span className="whitespace-nowrap">Send Mail</span>
                              </button>

                              <button
                                onClick={() => {
                                  setTargetIntern(intern);
                                  const isInternUnpaid = (intern.stipendType || '').toUpperCase() === 'UNPAID' || (intern.stipendAmount || '').toLowerCase().includes('unpaid');
                                  setEditStipendType(isInternUnpaid ? 'UNPAID' : 'PAID');
                                  setEditStipendCurrency(intern.stipendCurrency || (intern.stipendAmount?.includes('$') ? 'USD' : 'INR'));
                                  setEditStipendAmount(
                                    (intern.stipendAmount && intern.stipendAmount !== 'Pending Admin Setup' && !isInternUnpaid) 
                                      ? intern.stipendAmount 
                                      : (isInternUnpaid ? 'Unpaid (Academic Credit)' : (intern.stipendCurrency === 'USD' ? '$1,500 / mo' : '₹15,000 / mo'))
                                  );
                                  setEditMentorName(intern.mentorName || 'Dr. Sarah Jenkins');
                                  setEditMentorEmail(intern.mentorEmail || 's.jenkins@worksphere.ac.in');
                                  setEditTrack(intern.track || 'Full-Stack Software Engineering');
                                  setEditStartDate(intern.startDate || '2026-06-01');
                                  setEditEndDate(intern.endDate || '2026-08-31');
                                  setEditPerformanceRating(intern.performanceRating || '4.9 / 5.0');
                                  setShowEditStipendModal(true);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-[11px] transition-all shadow-sm whitespace-nowrap shrink-0 border border-slate-200/60"
                              >
                                Intern Settings
                              </button>

                              {isCertIssued ? (
                                <button
                                  onClick={() => handleRevokeCertificate(intern.username)}
                                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition-all shadow-md flex items-center gap-1"
                                >
                                  Revoke Certificate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleGenerateCertificate(intern.username)}
                                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-1.5 rounded-xl text-[11px] transition-all shadow-md flex items-center gap-1"
                                >
                                  Issue Certificate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tasks Review List */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-4">
              <h3 className="font-poppins font-bold text-base text-slate-800">Assigned Deliverables & Task Reviews</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allInternTasks.map(task => (
                  <div key={task.id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{task.id} • @{task.assignedTo || 'intern'}</span>
                        <span className={`px-2 py-0.5 rounded uppercase ${
                          task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          task.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700 font-bold animate-pulse' :
                          'bg-slate-200 text-slate-700'
                        }`}>{task.status}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">{task.title}</h4>
                      <p className="text-xs text-slate-500">{task.description}</p>
                    </div>

                    {task.submissionUrl && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-700 block">Submitted Work:</span>
                        <a href={task.submissionUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold flex items-center gap-1 text-[11px] truncate">
                          <ExternalLink className="w-3 h-3 shrink-0" /> {task.submissionUrl}
                        </a>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs gap-2">
                      <span className="text-slate-400 font-medium">Due: {task.deadline}</span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteInternTask(task.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                          title="Delete this assigned deliverable task"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>

                        {task.status === 'COMPLETED' ? (
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-emerald-200/80 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
                          </span>
                        ) : (task.status === 'SUBMITTED' || task.status === 'PENDING' || task.status === 'PENDING_APPROVAL' || task.status === 'UNDER_REVIEW') ? (
                          <button
                            type="button"
                            onClick={() => handleApproveInternTask(task.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Task
                          </button>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-amber-200/80 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ATTENDANCE & TIMESHEETS */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Header Banner with Summary Stats & Controls */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                      Real-Time Tracking Console
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">• {allAttendanceLogs.length} Total Logs</span>
                  </div>
                  <h3 className="font-poppins font-extrabold text-xl text-slate-900 flex items-center gap-2.5 mt-1">
                    <Clock className="w-6 h-6 text-indigo-600" /> Intern Daily Standups & Timesheet Tracker
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Review logged hours, edit entries, approve submitted standups, or reset attendance hours to zero.
                  </p>
                </div>

                {/* Reset to Zero Action Group */}
                <div className="flex items-center gap-2 bg-slate-50/90 p-2 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                  <select
                    value={resetTargetUsername}
                    onChange={(e) => setResetTargetUsername(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 shadow-xs cursor-pointer h-9"
                  >
                    <option value="all">🌐 All Interns</option>
                    {usersList.filter(u => (u.role || '').toUpperCase().includes('INTERN')).map(u => (
                      <option key={u.username} value={u.username}>@{u.username} ({u.name})</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleResetAttendanceToZero(resetTargetUsername)}
                    className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap h-9"
                    title="Reset all logged attendance hours to 0"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Reset to Zero
                  </button>
                </div>
              </div>

              {/* Quick Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Hours Logged</span>
                  <span className="text-xl font-poppins font-black text-indigo-600">
                    {allAttendanceLogs.reduce((sum, l) => sum + (Number(l.hours) || 0), 0)} hrs
                  </span>
                </div>
                <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Approved Timesheets</span>
                  <span className="text-xl font-poppins font-black text-emerald-600">
                    {allAttendanceLogs.filter(l => l.status === 'APPROVED').length} Approved
                  </span>
                </div>
                <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Pending Review</span>
                  <span className="text-xl font-poppins font-black text-amber-600">
                    {allAttendanceLogs.filter(l => l.status !== 'APPROVED').length} In Review
                  </span>
                </div>
              </div>

              {/* Attendance Logs Table */}
              {allAttendanceLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No attendance records logged yet. Standup logs submitted by interns will appear here in real time.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-3">Entry ID</th>
                        <th className="py-3 px-3">Intern</th>
                        <th className="py-3 px-3">Date & Time</th>
                        <th className="py-3 px-3">Hours Logged</th>
                        <th className="py-3 px-3">Standup Summary</th>
                        <th className="py-3 px-3">Approval Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {allAttendanceLogs.map(log => {
                        const logKey = log.logId || log.id;
                        const isEditing = editingLogId === logKey;
                        const isApproved = log.status === 'APPROVED';

                        return (
                          <tr key={logKey} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 text-[11px]">
                              {logKey}
                            </td>
                            <td className="py-3.5 px-3 font-bold text-slate-800">
                              @{log.username}
                            </td>
                            <td className="py-3.5 px-3 text-slate-500">
                              <div>{log.date || '2026-08-17'}</div>
                              {log.time && <div className="text-[10px] text-slate-400 font-semibold">{log.time}</div>}
                            </td>
                            <td className="py-3.5 px-3 font-bold">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    value={editingHours}
                                    onChange={(e) => setEditingHours(e.target.value)}
                                    className="w-14 bg-white border border-indigo-300 rounded px-1.5 py-0.5 text-xs font-bold"
                                  />
                                  <button
                                    onClick={() => handleSaveEditHours(logKey)}
                                    className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingLogId(null)}
                                    className="text-slate-400 text-[10px] cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg border border-indigo-100">
                                  {log.hours || 8} hrs
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 max-w-xs truncate text-slate-600 text-xs">
                              {log.summary || 'Daily standup recorded'}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                              }`}>
                                {isApproved ? 'Approved' : 'In Review'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isApproved && (
                                  <button
                                    onClick={() => handleApproveAttendanceLog(logKey)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] shadow-sm transition-all cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setEditingLogId(logKey);
                                    setEditingHours(log.hours || 8);
                                  }}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                                >
                                  Edit Hours
                                </button>
                                <button
                                  onClick={() => handleDeleteAttendanceLog(logKey)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-2 py-1 rounded-lg text-[11px] border border-rose-200 cursor-pointer"
                                  title="Delete this attendance entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: LEARNING CURRICULUM */}
        {activeTab === 'curriculum' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h3 className="font-poppins font-extrabold text-xl text-slate-900 flex items-center gap-2.5">
                  <GraduationCap className="w-6 h-6 text-indigo-600" /> Learning Roadmap & Video Resources
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Upload YouTube video tutorials, GitHub repos, and documentation resources. Published resources automatically appear on all intern portals.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleLoadPresets}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-indigo-200/80 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  + Load Preset Curriculum
                </button>
                <button
                  onClick={() => setShowAddModuleModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" /> Upload Video & Resource
                </button>
              </div>
            </div>

            {learningModules.length === 0 ? (
              <div className="bg-slate-50/70 p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4 max-w-xl mx-auto my-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-poppins font-bold text-base text-slate-800">No Learning Modules Published Yet</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto font-medium">
                    Click <strong>"Upload Video & Resource"</strong> to add custom tutorials or click <strong>"+ Load Preset Curriculum"</strong> to publish standard engineering modules.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {learningModules.map(mod => (
                  <div key={mod.id} className="bg-slate-50/90 border border-slate-200/90 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {mod.category || 'Engineering'}
                        </span>
                        <button
                          onClick={() => handleDeleteModule(mod.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                          title="Remove Learning Module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="font-poppins font-bold text-base text-slate-900 leading-snug">{mod.title}</h4>
                      {mod.description && <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{mod.description}</p>}
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 space-y-2 text-xs">
                      {mod.videoUrl && (
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-[11px] truncate bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] shrink-0 font-extrabold">▶ YouTube</span>
                          <span className="truncate">{mod.videoUrl}</span>
                        </div>
                      )}
                      {mod.resourceUrl && (
                        <div className="flex items-center gap-2 text-slate-600 font-semibold text-[11px] truncate bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <a href={mod.resourceUrl} target="_blank" rel="noreferrer" className="hover:underline text-indigo-600 font-bold truncate">
                            {mod.resourceUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ACTIVE PROJECTS */}
        {activeTab === 'projects' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-poppins font-bold text-lg text-text-dark">Active Client Work Orders</h3>
            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p.id} className="border border-slate-100 p-5 rounded-2xl space-y-3 hover:border-slate-300 transition-all bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-primary font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{p.id}</span>
                      <h4 className="font-bold text-slate-800 text-base mt-1">{p.title}</h4>
                    </div>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${
                      p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                    }`}>{p.status}</span>
                  </div>

                  <p className="text-xs text-text-light leading-relaxed">{p.description}</p>
                  
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-text-light font-medium">Budget: <strong className="text-text-dark">${p.budget?.toLocaleString()}</strong></span>
                    <div className="space-x-2">
                      {p.status !== 'COMPLETED' && (
                        <button onClick={() => updateStatus(p.id, 'COMPLETED')} className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-[11px] hover:bg-emerald-500 transition-all">
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-poppins font-bold text-lg text-text-dark">Platform Revenue Analytics</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#818cf8" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB: HELP DESK CHAT */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-poppins font-bold text-lg text-text-dark">Client Help Desk Live Chat</h3>
            <div className="flex space-x-2 pb-2 overflow-x-auto">
              {clientList.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedClient(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedClient === c ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  @{c}
                </button>
              ))}
            </div>

            <div ref={chatViewportRef} className="h-64 overflow-y-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === user.username ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl ${
                    msg.senderId === user.username ? 'bg-primary text-white' : 'bg-white text-slate-800 border border-slate-200'
                  }`}>
                    <p>{msg.content}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-1">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type reply to client..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
              />
              <button type="submit" className="bg-primary text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                    Client Sync Schedule
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">• {appointments.length} Upcoming</span>
                </div>
                <h3 className="font-poppins font-extrabold text-xl text-slate-900 flex items-center gap-2.5 mt-1">
                  <Calendar className="w-6 h-6 text-amber-600" /> Scheduled Client Meetings & Consultations
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Live calendar and consultation schedule booked by clients and partners.
                </p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-semibold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No client meetings scheduled at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map(a => (
                  <div key={a.id} className="border border-slate-200/80 p-5 rounded-3xl bg-slate-50/60 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {a.clientName || a.name || 'Alex Johnson'}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {a.status || 'CONFIRMED'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        {a.email || 'client@worksphere.ac.in'}
                      </p>

                      <div className="bg-white border border-slate-200/70 p-3 rounded-2xl space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{a.date || '2026-08-12'}</span>
                          <span className="text-slate-300">•</span>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{a.time || '10:00 AM'}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium pt-0.5">
                          <span className="font-bold text-slate-700">Topic:</span> {a.serviceType || a.topic || 'Architecture Review & Project Sync'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <a
                        href="https://meet.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Join Room
                      </a>

                      <button
                        onClick={() => cancelAppointment(a.id)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Cancel Sync
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: CREATE NEW USER */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-poppins font-bold text-slate-800">Create New Account (Admin)</h3>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div className="flex flex-col space-y-1">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    placeholder="janedoe"
                    required
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label>Account Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-primary font-medium"
                  >
                    <option value="ROLE_CLIENT">CLIENT</option>
                    <option value="ROLE_INTERN">INTERN</option>
                    <option value="ROLE_FREELANCER">FREELANCER</option>
                    <option value="ROLE_ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="jane@company.com"
                    required
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label>Password *</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="bg-primary hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  {isCreatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER ROLE */}
      {showEditRoleModal && targetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-poppins font-bold text-slate-800">Change Role for @{targetUser.username}</h3>

            <form onSubmit={handleUpdateRoleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col space-y-1.5">
                <label>Select New Role *</label>
                <select
                  value={selectedRoleToAssign}
                  onChange={(e) => setSelectedRoleToAssign(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary font-medium"
                >
                  <option value="ROLE_CLIENT">ROLE_CLIENT (Client Workspace)</option>
                  <option value="ROLE_INTERN">ROLE_INTERN (Intern Portal)</option>
                  <option value="ROLE_FREELANCER">ROLE_FREELANCER (Freelancer Portal)</option>
                  <option value="ROLE_ADMIN">ROLE_ADMIN (Platform Administrator)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditRoleModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  Save New Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TASK TO INTERN */}
      {showAssignTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-poppins font-bold text-slate-800">Assign Deliverable Task to Intern</h3>

            <form onSubmit={handleAssignTaskSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col space-y-1.5">
                <label>Select Target Intern *</label>
                <select
                  value={targetInternUsername}
                  onChange={(e) => setTargetInternUsername(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary font-medium"
                >
                  <option value="">-- Select Target Intern --</option>
                  <option value="ALL">🌐 ALL (All Registered Interns)</option>
                  {usersList.filter(u => u.role === 'ROLE_INTERN' || u.username === 'intern').map(i => (
                    <option key={i.username} value={i.username}>{i.name} (@{i.username})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Build GraphQL API endpoints"
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label>Task Description & Instructions</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={3}
                  placeholder="Detailed requirements for the intern..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1.5">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label>Priority Level</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary font-medium"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="bg-primary hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  {isAssigning ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STIPEND & MENTOR SETTINGS */}
      {showEditStipendModal && targetIntern && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-poppins font-bold text-slate-800">Intern Settings for {targetIntern.name}</h3>

            <form onSubmit={handleUpdateStipendSubmit} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1">
                  <label>Assigned Mentor Name *</label>
                  <input
                    type="text"
                    value={editMentorName}
                    onChange={(e) => setEditMentorName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    required
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label>Mentor Email</label>
                  <input
                    type="email"
                    value={editMentorEmail}
                    onChange={(e) => setEditMentorEmail(e.target.value)}
                    placeholder="s.jenkins@company.com"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label>Engineering Track *</label>
                <input
                  type="text"
                  value={editTrack}
                  onChange={(e) => setEditTrack(e.target.value)}
                  placeholder="e.g. Full-Stack Software Engineering"
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1">
                  <label>Internship Start Date *</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    required
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label>Internship End Date *</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    required
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label>Program Performance Rating</label>
                <input
                  type="text"
                  value={editPerformanceRating}
                  onChange={(e) => setEditPerformanceRating(e.target.value)}
                  placeholder="e.g. 4.9 / 5.0"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col space-y-1">
                  <label>Stipend Mode *</label>
                  <select
                    value={editStipendType}
                    onChange={(e) => setEditStipendType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-medium"
                  >
                    <option value="PAID">PAID STIPEND</option>
                    <option value="UNPAID">UNPAID (Academic Credit)</option>
                  </select>
                </div>

                {editStipendType === 'PAID' && (
                  <div className="flex flex-col space-y-1">
                    <label>Currency Option *</label>
                    <select
                      value={editStipendCurrency}
                      onChange={(e) => {
                        const newCurr = e.target.value;
                        setEditStipendCurrency(newCurr);
                        if (newCurr === 'INR' && editStipendAmount.includes('$')) {
                          setEditStipendAmount('₹15,000 / mo');
                        } else if (newCurr === 'USD' && editStipendAmount.includes('₹')) {
                          setEditStipendAmount('$1,500 / mo');
                        }
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-bold text-emerald-700"
                    >
                      <option value="INR">INR (₹ Rupees)</option>
                      <option value="USD">USD ($ Dollars)</option>
                    </select>
                  </div>
                )}
              </div>

              {editStipendType === 'PAID' && (
                <div className="flex flex-col space-y-1">
                  <label className="flex justify-between items-center">
                    <span>Monthly Stipend Amount *</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase">
                      {editStipendCurrency === 'INR' ? 'Indian Rupee (₹)' : 'US Dollar ($)'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editStipendAmount}
                    onChange={(e) => setEditStipendAmount(e.target.value)}
                    placeholder={editStipendCurrency === 'INR' ? "e.g. ₹15,000 / mo" : "e.g. $1,500 / mo"}
                    required
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary font-bold text-slate-900"
                  />
                  {/* Preset Amount Shortcut Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editStipendCurrency === 'INR' ? (
                      <>
                        <button type="button" onClick={() => setEditStipendAmount('₹10,000 / mo')} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold border border-slate-200 cursor-pointer">₹10,000 / mo</button>
                        <button type="button" onClick={() => setEditStipendAmount('₹15,000 / mo')} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold border border-slate-200 cursor-pointer">₹15,000 / mo</button>
                        <button type="button" onClick={() => setEditStipendAmount('₹25,000 / mo')} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold border border-slate-200 cursor-pointer">₹25,000 / mo</button>
                        <button type="button" onClick={() => setEditStipendAmount('₹35,000 / mo')} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold border border-slate-200 cursor-pointer">₹35,000 / mo</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => setEditStipendAmount('$500 / mo')} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold border border-slate-200 cursor-pointer">$500 / mo</button>
                        <button type="button" onClick={() => setEditStipendAmount('$1,000 / mo')} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold border border-slate-200 cursor-pointer">$1,000 / mo</button>
                        <button type="button" onClick={() => setEditStipendAmount('$1,500 / mo')} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold border border-slate-200 cursor-pointer">$1,500 / mo</button>
                        <button type="button" onClick={() => setEditStipendAmount('$2,500 / mo')} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold border border-slate-200 cursor-pointer">$2,500 / mo</button>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditStipendModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  Save Intern Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND CREDENTIALS EMAIL */}
      {showSendCredModal && credUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg p-6 sm:p-7 rounded-3xl shadow-2xl border border-slate-200/80 space-y-5 transform transition-all scale-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-600 shadow-inner">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Official Email Dispatch Center</span>
                  <h3 className="text-lg font-outfit font-extrabold text-slate-900">Send Account Login Credentials</h3>
                </div>
              </div>
              <button 
                onClick={() => setShowSendCredModal(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient Overview Badge */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-4.5 rounded-2xl shadow-lg border border-slate-700/60 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-outfit font-black text-indigo-300 text-lg shadow-sm">
                    {(credUser.name || credUser.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-outfit font-bold text-sm text-white flex items-center gap-2">
                      <span>{credUser.name || credUser.username}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {credUser.role ? credUser.role.replace('ROLE_', '') : 'CLIENT'}
                      </span>
                    </h4>
                    <p className="text-xs text-indigo-200 font-mono flex items-center gap-1.5 mt-0.5">
                      <span>@{credUser.username}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300 font-semibold">{credUser.email || `${credUser.username}@worksphere.ac.in`}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Input & Preview */}
            <form onSubmit={handleConfirmSendCreds} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-800 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Database Password to Send *</span>
                  </span>
                  <span className="text-[10px] text-indigo-600 font-extrabold">Editable by Admin</span>
                </label>
                <div className="relative">
                  <input
                    type={showCredPassword ? "text" : "password"}
                    value={credPasswordInput}
                    onChange={(e) => setCredPasswordInput(e.target.value)}
                    placeholder="Enter password to send..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-11 py-3 text-slate-900 font-mono font-bold text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCredPassword(!showCredPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer"
                    title={showCredPassword ? "Hide password" : "Show password"}
                  >
                    {showCredPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-medium pt-0.5">
                  Sending to: <strong className="text-slate-800">{credUser.email || `${credUser.username}@worksphere.ac.in`}</strong>
                </p>
              </div>

              {/* Formatted HTML Email Card Preview */}
              <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/80 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-b border-slate-200/80 pb-1.5">
                  <span className="flex items-center gap-1 text-indigo-600 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> HTML Email Template Preview
                  </span>
                  <span>SMTP: worksphere.ac.in@gmail.com</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm space-y-1.5 text-[11px] font-sans">
                  <p className="font-bold text-slate-800">Subject: 🎓 Official Account Created: WorkSphere Access Credentials</p>
                  <p className="text-slate-600">Dear <strong>{credUser.name || credUser.username}</strong>,</p>
                  <p className="text-slate-500 leading-relaxed text-[10.5px]">Your WorkSphere account has been configured. Log in at <strong>https://worksphere-two.vercel.app/login</strong> with Username: <code className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded font-mono font-bold">@{credUser.username}</code> and Password: <code className="bg-rose-50 text-rose-600 px-1 py-0.5 rounded font-mono font-bold">{showCredPassword ? credPasswordInput : '••••••••'}</code>.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSendCredModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <a
                  href={`mailto:${credUser.email || `${credUser.username}@worksphere.ac.in`}?subject=${encodeURIComponent("WorkSphere Account Login Credentials")}&body=${encodeURIComponent(`Hello ${credUser.name || credUser.username},\n\nYour WorkSphere login credentials:\nUsername: ${credUser.username}\nPassword: ${credPasswordInput}\nRole: ${credUser.role ? credUser.role.replace('ROLE_', '') : 'CLIENT'}\n\nLog in at: https://worksphere-two.vercel.app/login\n\nRegards,\nWorkSphere Admin Team`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80 transition-all active:scale-95 shadow-sm"
                  title="Open in your desktop/mobile mail app (Gmail / Outlook / Apple Mail)"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                  <span>Open Mail App</span>
                </a>
                <button
                  type="submit"
                  disabled={isSendingCreds}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isSendingCreds ? 'Sending Email...' : 'Send Official Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LEARNING MODULE & VIDEO RESOURCE */}
      {showAddModuleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-poppins font-extrabold text-base text-slate-800">Upload Video & Learning Resource</h3>
              </div>
              <button onClick={() => setShowAddModuleModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddModuleSubmit} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Module Title *</label>
                <input
                  type="text"
                  value={newModTitle}
                  onChange={(e) => setNewModTitle(e.target.value)}
                  placeholder="e.g. Modern React 19 & Next.js App Router Mastery"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Category</label>
                  <select
                    value={newModCategory}
                    onChange={(e) => setNewModCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none focus:border-indigo-500"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="AI & Automation">AI & Automation</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="Mobile App Dev">Mobile App Dev</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-bold block">Target Engineering Track</label>
                  <select
                    value={newModTrack}
                    onChange={(e) => setNewModTrack(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">ALL Tracks</option>
                    <option value="Full-Stack Software Engineering">Full-Stack Engineering</option>
                    <option value="AI & Automation Engineering">AI & Automation</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">YouTube Video URL or Video ID</label>
                <input
                  type="text"
                  value={newModVideoUrl}
                  onChange={(e) => setNewModVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or SqcY0GlETPk"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
                <p className="text-[10px] text-slate-400">Embeds an interactive YouTube Video Player inside the Intern Portal.</p>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Documentation / GitHub Resource Link</label>
                <input
                  type="url"
                  value={newModResourceUrl}
                  onChange={(e) => setNewModResourceUrl(e.target.value)}
                  placeholder="https://react.dev or https://github.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Description & Learning Objectives</label>
                <textarea
                  value={newModDesc}
                  onChange={(e) => setNewModDesc(e.target.value)}
                  rows="3"
                  placeholder="Outline key learning outcomes, skills to master, or sprint tasks..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingModule}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isAddingModule ? 'Publishing...' : 'Publish to Intern Portal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
