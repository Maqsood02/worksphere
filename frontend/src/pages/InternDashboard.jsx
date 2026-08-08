import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  GraduationCap, CheckCircle, Clock, Calendar, Award, 
  Send, ExternalLink, PlusCircle, ShieldCheck, 
  BookOpen, FileText, CheckCircle2, Printer, X, Sparkles, DollarSign
} from 'lucide-react';

export default function InternDashboard() {
  const { user, addToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'standup', 'curriculum', 'certificates'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Submit Task Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log Standup Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [standupHours, setStandupHours] = useState(8);
  const [standupSummary, setStandupSummary] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  // Certificate Modal State
  const [showCertModal, setShowCertModal] = useState(false);

  // Task Filter
  const [taskFilter, setTaskFilter] = useState('ALL');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const r = (user.role || '').toUpperCase();
    if (r !== 'INTERN' && r !== 'ROLE_INTERN') {
      if (r === 'ADMIN' || r === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
      return;
    }
    fetchInternData();
  }, [user]);

  const fetchInternData = async () => {
    setLoading(true);
    try {
      const res = await api.getInternOverview();
      if (res && res.success) {
        setData(res);
      } else {
        addToast(res?.message || "Failed to load intern dashboard data.");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitInternTask(selectedTask.id, {
        submissionUrl,
        notes: submissionNotes
      });
      if (res && res.success) {
        addToast(res.message);
        setSelectedTask(null);
        setSubmissionUrl('');
        setSubmissionNotes('');
        fetchInternData();
      } else {
        addToast(res?.message || "Failed to submit task.");
      }
    } catch (err) {
      console.error(err);
      addToast("Error submitting task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStandupSubmit = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    try {
      const res = await api.logInternAttendance({
        hours: standupHours,
        summary: standupSummary
      });
      if (res && res.success) {
        addToast(res.message);
        setShowLogModal(false);
        setStandupSummary('');
        fetchInternData();
      } else {
        addToast(res?.message || "Failed to record standup.");
      }
    } catch (err) {
      console.error(err);
      addToast("Error recording standup log.");
    } finally {
      setIsLogging(false);
    }
  };

  const handleCertificateRequest = async () => {
    try {
      const res = await api.requestInternCertificate();
      if (res && res.success) {
        addToast(res.message);
      } else {
        addToast(res?.message || "Certificate request failed.");
      }
    } catch (err) {
      console.error(err);
      addToast("Error requesting certificate.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Loading your Internship Portal...</p>
      </div>
    );
  }

  const { profile, stats, tasks = [], attendanceLogs = [], learningModules = [], certificate } = data || {};
  const isPaid = profile?.stipendType !== 'UNPAID';
  const hasCertificate = certificate && certificate.issued;

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'ALL') return true;
    return t.status === taskFilter;
  });

  return (
    <div className="min-h-screen pt-28 sm:pt-32 pb-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* High-Contrast Header Profile Card */}
      <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-2xl overflow-hidden border border-indigo-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 border border-white/20">
              <GraduationCap className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase border border-indigo-400/30">
                  {profile?.track || 'Software Engineering Track'}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Intern
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                  isPaid 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}>
                  {isPaid ? `Paid Stipend (${profile?.stipendAmount || '$1,500/mo'})` : 'Academic Credit (Unpaid)'}
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-poppins font-extrabold tracking-tight text-white drop-shadow-sm">
                Welcome back, {user?.name || profile?.name || 'Intern'}!
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-indigo-100/90 font-medium">
                {profile?.mentorName && (
                  <span>Mentor: <strong className="text-white font-bold">{profile.mentorName}</strong></span>
                )}
                {profile?.mentorName && profile?.performanceRating && <span className="hidden sm:inline">•</span>}
                {profile?.performanceRating && (
                  <span>Rating: <strong className="text-amber-300 font-bold">★ {profile.performanceRating}</strong></span>
                )}
                {(profile?.startDate || profile?.endDate) && <span className="hidden sm:inline">•</span>}
                {(profile?.startDate || profile?.endDate) && (
                  <span>Period: <span className="text-indigo-200">{profile?.startDate} to {profile?.endDate}</span></span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30"
            >
              <PlusCircle className="w-4 h-4" /> Log Daily Standup
            </button>
            
            {hasCertificate ? (
              <button
                onClick={() => setShowCertModal(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border border-amber-300/40 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Award className="w-4 h-4 text-white" /> View Official Certificate
              </button>
            ) : (
              <button
                onClick={handleCertificateRequest}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-4 py-2.5 rounded-xl backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Award className="w-4 h-4 text-amber-300" /> Request Certificate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tasks Completed</span>
            <CheckCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-poppins font-extrabold text-slate-800">{stats?.tasksCompleted}</span>
            <span className="text-xs text-slate-500 font-semibold">/ {stats?.tasksTotal} assigned</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(stats?.tasksCompleted / (stats?.tasksTotal || 1)) * 100}%` }}></div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Hours Logged</span>
            <Clock className="w-5 h-5 text-cyan-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-poppins font-extrabold text-slate-800">{stats?.hoursLogged}</span>
            <span className="text-xs text-slate-500 font-semibold">Hours</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">✓ Meets 40h/week goal</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Attendance Rate</span>
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-poppins font-extrabold text-slate-800">
              {attendanceLogs.length === 0 ? '0%' : (stats?.attendanceRate || '100%')}
            </span>
            <span className={`text-xs font-bold ${attendanceLogs.length === 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
              {attendanceLogs.length === 0 ? 'No Standups Yet' : 'Active Streak'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {attendanceLogs.length === 0 
              ? 'Log daily standup above to build streak' 
              : `${attendanceLogs.length} standup log${attendanceLogs.length > 1 ? 's' : ''} recorded`}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Stipend Status</span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-poppins font-extrabold text-slate-800">
              {isPaid ? (profile?.stipendAmount || '$1,500 / mo') : 'Unpaid'}
            </span>
          </div>
          <p className={`text-[11px] font-bold ${isPaid ? 'text-indigo-600' : 'text-amber-600'}`}>
            {isPaid ? stats?.stipendStatus : 'Academic Credit Internship'}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 space-x-8 text-sm font-semibold text-slate-500 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'tasks' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Assigned Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('standup')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'standup' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" /> Standup & Attendance Logs
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'curriculum' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Learning Curriculum
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'certificates' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> Official Certificates
        </button>
      </div>

      {/* TAB 1: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-poppins font-extrabold text-slate-800">Sprint Backlog & Admin Tasks</h3>
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              {['ALL', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'PENDING'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    taskFilter === filter ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  {filter.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 p-12 rounded-3xl text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No Sprint Tasks Assigned Yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your assigned program admin & mentor will assign your sprint backlog deliverables shortly. You can also log your daily standup hours!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTasks.map(task => (
                <div key={task.id} className="glass-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                        {task.id}
                      </span>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        task.status === 'SUBMITTED' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        task.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-base font-poppins font-bold text-slate-800">{task.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
                  </div>

                  {task.submissionUrl && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-700 block">Submitted Deliverable:</span>
                      <a href={task.submissionUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium flex items-center gap-1 text-[11px] truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" /> {task.submissionUrl}
                      </a>
                      {task.submissionNotes && <p className="text-[11px] text-slate-500 italic">"{task.submissionNotes}"</p>}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Due: {task.deadline}
                    </span>
                    
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> {task.status === 'SUBMITTED' ? 'Update Submission' : 'Submit Deliverable'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STANDUP LOGS */}
      {activeTab === 'standup' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-poppins font-extrabold text-slate-800">Daily Standup & Timesheet Log</h3>
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Log Today's Work
            </button>
          </div>

          <div className="glass-card bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Entry ID</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Hours</th>
                    <th className="py-4 px-6">Standup Summary</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {attendanceLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-indigo-600">{log.id}</td>
                      <td className="py-4 px-6">{log.date}</td>
                      <td className="py-4 px-6 font-bold">{log.hours} hrs</td>
                      <td className="py-4 px-6 max-w-md">{log.summary}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CURRICULUM */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <h3 className="text-lg font-poppins font-extrabold text-slate-800">Learning Roadmap & Skill Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {learningModules.map(mod => (
              <div key={mod.id} className="glass-card bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2.5 py-1 rounded-md">
                    {mod.category}
                  </span>
                  {mod.completed && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>

                <h4 className="text-base font-poppins font-bold text-slate-800">{mod.title}</h4>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Module Progress</span>
                    <span>{mod.progressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${mod.progressPct}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-poppins font-extrabold text-slate-800">Official Internship Certificate</h3>
            
            {hasCertificate ? (
              <button
                onClick={() => setShowCertModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-2"
              >
                <Award className="w-4 h-4" /> Open Official Certificate
              </button>
            ) : (
              <button
                onClick={handleCertificateRequest}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-300" /> Request Admin Issuance
              </button>
            )}
          </div>

          {hasCertificate ? (
            <div className="glass-card bg-gradient-to-br from-amber-500/10 via-white to-indigo-500/10 p-8 rounded-3xl border border-amber-300/80 shadow-lg space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700">Issued & Verified</span>
                <Award className="w-8 h-8 text-amber-500" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-poppins font-extrabold text-slate-800">
                  {certificate.track || 'Full-Stack Software Engineering'} Certificate
                </h4>
                <p className="text-xs text-slate-600">
                  Awarded to <strong className="text-slate-900">{certificate.name}</strong> for successful program completion.
                </p>
              </div>

              <div className="pt-4 border-t border-amber-200/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Certificate ID: {certificate.certificateId}</span>
                <button
                  onClick={() => setShowCertModal(true)}
                  className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-all"
                >
                  View / Print Printable Certificate
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded-3xl text-center space-y-3">
              <Award className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">Certificate Not Yet Generated</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Complete your assigned deliverables. Admin will generate your official Certificate of Completion upon finishing the internship!
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: PRINTABLE OFFICIAL CERTIFICATE */}
      {showCertModal && certificate && (
        <div className="certificate-modal-backdrop fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-lg overflow-y-auto p-4 sm:p-6">
          <div className="min-h-full flex items-center justify-center py-6">
            <div className="certificate-modal-container bg-slate-900 w-full max-w-4xl p-2 sm:p-4 rounded-[2.5rem] shadow-2xl border border-amber-400/40 relative print:m-0 print:border-0 print:p-0 print:bg-white my-auto">
              
              {/* Inner Certificate Sheet with Ornamental Gold Borders */}
              <div className="certificate-sheet bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 w-full rounded-[2rem] border-[6px] sm:border-[8px] border-double border-amber-500/90 p-6 sm:p-10 text-slate-900 space-y-4 sm:space-y-5 relative overflow-hidden shadow-2xl print:border-8 print:shadow-none">
                
                {/* Subtle Watermark Logo Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
                  <img src="/logo.jpg" alt="Watermark" className="w-[400px] h-[400px] object-contain" />
                </div>

                {/* Ornamental Top Corner Flourishes */}
                <div className="absolute top-3 left-4 text-amber-500/60 font-mono text-xs select-none">❖ ❖ ❖</div>
                <div className="absolute top-3 right-14 text-amber-500/60 font-mono text-xs select-none">❖ ❖ ❖</div>

                <button
                  onClick={() => setShowCertModal(false)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 transition-colors print:hidden shadow-sm z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Brand Header */}
                <div className="brand-header text-center space-y-2.5 border-b-2 border-amber-300/80 pb-4 relative z-10">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-white p-2 shadow-md border border-amber-200/90 flex items-center justify-center">
                    <img 
                      src="/logo.jpg" 
                      alt="WorkSphere Logo" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  
                  <div className="inline-block bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-5 py-1 rounded-full text-[11px] font-poppins font-black uppercase tracking-[0.2em] shadow-md border border-amber-300">
                    Official Certificate of Internship Completion
                  </div>
                </div>

                {/* Recipient & Achievement Details */}
                <div className="recipient-section text-center space-y-3 py-1 relative z-10">
                  <p className="text-xs sm:text-sm font-serif italic text-slate-600 font-semibold tracking-wide">This is to proudly certify that</p>
                  
                  <div className="space-y-1">
                    <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight drop-shadow-sm">
                      {certificate.name}
                    </h1>
                    <div className="w-40 h-1.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 mx-auto rounded-full shadow-sm"></div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-serif pt-1.5">
                    has successfully completed an intensive Software Engineering Internship in <strong className="text-indigo-950 font-sans font-black uppercase tracking-wide text-xs sm:text-sm">{certificate.track || profile?.track || 'Full-Stack Software Engineering'}</strong> at WorkSphere Technologies, demonstrating exceptional technical mastery, project delivery, and dedication to engineering excellence.
                  </p>
                </div>

                {/* Certificate Metadata Grid */}
                <div className="metadata-grid pt-4 border-t border-amber-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-700 bg-white/90 p-3.5 sm:p-4 rounded-2xl border border-amber-200/80 shadow-md relative z-10 backdrop-blur-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Issue Date</span>
                    <span className="font-extrabold text-slate-900">{certificate.issueDate || '2026-08-07'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Grade Rating</span>
                    <span className="font-extrabold text-amber-600">{certificate.grade || 'DISTINCTION'} ({profile?.performanceRating || '4.9 / 5.0'})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Credential ID</span>
                    <span className="font-mono text-[11px] font-extrabold text-slate-900">{certificate.certificateId || 'WS-CERT-2026-884'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Verification Status</span>
                    <span className="font-mono text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> VERIFIED OFFICIAL
                    </span>
                  </div>
                </div>

                {/* Signatures & 3D Gold Holographic Security Seal */}
                <div 
                  className="signatures-section flex flex-row items-center justify-between relative z-10"
                  style={{
                    marginTop: '24px',
                    paddingTop: '20px',
                    borderTop: '2px solid #fcd34d',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}
                >
                  <div 
                    className="signature-box"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      minWidth: '180px'
                    }}
                  >
                    <span 
                      className="signature-name font-serif italic font-black text-slate-900"
                      style={{
                        fontSize: '16px',
                        fontWeight: '900',
                        borderBottom: '2px solid #94a3b8',
                        paddingBottom: '4px',
                        marginBottom: '6px',
                        lineHeight: '1.3',
                        display: 'inline-block',
                        color: '#0f172a'
                      }}
                    >
                      {profile?.mentorName || 'Dr. Sarah Jenkins'}
                    </span>
                    <span 
                      className="signature-role uppercase font-bold"
                      style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        letterSpacing: '0.1em',
                        color: '#64748b',
                        lineHeight: '1.2',
                        display: 'block',
                        marginTop: '2px'
                      }}
                    >
                      Lead Engineering Supervisor
                    </span>
                  </div>

                  {/* 3D Royal Gold Holographic Security Badge */}
                  <div 
                    className="rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 flex flex-col items-center justify-center text-slate-950 font-black shrink-0"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      border: '2px solid #ffffff',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-slate-950 mb-0.5 animate-pulse" />
                    <span style={{ fontSize: '8px', lineHeight: '1', fontWeight: '900' }}>OFFICIAL</span>
                    <span style={{ fontSize: '8px', lineHeight: '1', fontWeight: '900' }}>VERIFIED</span>
                  </div>

                  <div 
                    className="signature-box-right"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      minWidth: '180px',
                      textAlign: 'right'
                    }}
                  >
                    <span 
                      className="signature-name font-serif italic font-black text-slate-900"
                      style={{
                        fontSize: '16px',
                        fontWeight: '900',
                        borderBottom: '2px solid #94a3b8',
                        paddingBottom: '4px',
                        marginBottom: '6px',
                        lineHeight: '1.3',
                        display: 'inline-block',
                        color: '#0f172a'
                      }}
                    >
                      WorkSphere Executive Board
                    </span>
                    <span 
                      className="signature-role uppercase font-bold"
                      style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        letterSpacing: '0.1em',
                        color: '#64748b',
                        lineHeight: '1.2',
                        display: 'block',
                        marginTop: '2px'
                      }}
                    >
                      Certification Authority
                    </span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-center pt-2 print:hidden relative z-10">
                  <button
                    onClick={() => window.print()}
                    className="bg-gradient-to-r from-indigo-600 via-primary to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-extrabold px-7 py-3 rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Printer className="w-4 h-4" /> Print Official Certificate / Save PDF
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT TASK */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white w-full max-w-lg p-6 rounded-3xl shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-poppins font-bold text-slate-800">Submit Deliverable for {selectedTask.id}</h3>
            <p className="text-xs text-slate-600 font-medium">{selectedTask.title}</p>

            <form onSubmit={handleTaskSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col space-y-1.5">
                <label>GitHub PR / Live Demo URL *</label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://github.com/org/repo/pull/12"
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label>Submission Notes / Execution Details</label>
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe your implementation, tests run, or key features built..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to Mentor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG STANDUP */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-white w-full max-w-lg p-6 rounded-3xl shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-poppins font-bold text-slate-800">Record Daily Standup Log</h3>
            
            <form onSubmit={handleStandupSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex flex-col space-y-1.5">
                <label>Hours Worked Today *</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={standupHours}
                  onChange={(e) => setStandupHours(e.target.value)}
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label>Daily Summary & Tasks Completed *</label>
                <textarea
                  value={standupSummary}
                  onChange={(e) => setStandupSummary(e.target.value)}
                  rows={4}
                  placeholder="What did you build today? Any code merged or blockers faced?"
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLogging}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                >
                  {isLogging ? 'Saving...' : 'Save Standup Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
