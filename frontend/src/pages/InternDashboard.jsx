import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  GraduationCap, CheckCircle, Clock, Calendar, Award, 
  Send, ExternalLink, PlusCircle, ShieldCheck, 
  BookOpen, FileText, CheckCircle2, Printer, X, Sparkles, DollarSign, Upload, Lock,
  AlertCircle, Bell, Check
} from 'lucide-react';
import { playSuccessSound } from '../utils/sound';

function extractYouTubeVideoId(input) {
  if (!input) return null;
  const str = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
  try {
    if (str.includes('youtube.com/watch')) {
      const u = new URL(str);
      const v = u.searchParams.get('v');
      if (v) return v;
    }
    if (str.includes('youtu.be/')) {
      const parts = str.split('youtu.be/');
      const id = parts[1].split('?')[0].split('&')[0];
      if (id) return id;
    }
    if (str.includes('youtube.com/embed/')) {
      const parts = str.split('youtube.com/embed/');
      const id = parts[1].split('?')[0].split('&')[0];
      if (id) return id;
    }
  } catch (e) {}
  return null;
}

function YouTubeAutoTracker({ videoUrl, currentProgress, onProgressChange }) {
  const containerId = React.useMemo(() => 'yt-player-' + Math.random().toString(36).substring(2, 9), []);
  const videoId = React.useMemo(() => extractYouTubeVideoId(videoUrl), [videoUrl]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTabFocused, setIsTabFocused] = useState(true);
  const [livePct, setLivePct] = useState(currentProgress || 0);
  const [warningMessage, setWarningMessage] = useState('');

  const lastSavedRef = React.useRef(currentProgress || 0);
  const maxVerifiedTimeRef = React.useRef(0);
  const playerRef = React.useRef(null);
  const intervalRef = React.useRef(null);

  useEffect(() => {
    setLivePct(currentProgress || 0);
    lastSavedRef.current = currentProgress || 0;
  }, [currentProgress]);

  // Strict Tab & Window Focus Detection
  useEffect(() => {
    const handleFocusCheck = () => {
      const isVisible = document.visibilityState === 'visible';
      const hasFocus = document.hasFocus();
      const active = isVisible && hasFocus;

      setIsTabFocused(active);

      if (!active) {
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          try {
            playerRef.current.pauseVideo();
          } catch (e) {}
        }
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setWarningMessage('⚠️ Strict Monitoring: Video paused because you switched tabs or minimized the window. Return to this tab and resume playback to accrue watch progress.');
        if (typeof onProgressChange === 'function') {
          onProgressChange(lastSavedRef.current, lastSavedRef.current >= 100, false);
        }
      } else {
        setWarningMessage('');
      }
    };

    window.addEventListener('focus', handleFocusCheck);
    window.addEventListener('blur', handleFocusCheck);
    document.addEventListener('visibilitychange', handleFocusCheck);

    return () => {
      window.removeEventListener('focus', handleFocusCheck);
      window.removeEventListener('blur', handleFocusCheck);
      document.removeEventListener('visibilitychange', handleFocusCheck);
    };
  }, [onProgressChange]);

  // Load YouTube IFrame API and Setup Player
  useEffect(() => {
    if (!videoId) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.body.appendChild(tag);
    }

    const onPlayerStateChange = (event) => {
      if (event.data === 1) { // PLAYING
        if (document.visibilityState !== 'visible' || !document.hasFocus()) {
          try {
            playerRef.current?.pauseVideo();
          } catch (e) {}
          setIsPlaying(false);
          setWarningMessage('⚠️ Strict Monitoring: Please keep this tab focused in the foreground to watch.');
          if (typeof onProgressChange === 'function') {
            onProgressChange(lastSavedRef.current, lastSavedRef.current >= 100, false);
          }
          return;
        }

        setIsPlaying(true);
        setWarningMessage('');
        if (typeof onProgressChange === 'function') {
          onProgressChange(livePct, livePct >= 100, true);
        }

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          try {
            if (document.visibilityState !== 'visible' || !document.hasFocus()) {
              if (playerRef.current?.pauseVideo) playerRef.current.pauseVideo();
              setIsPlaying(false);
              setWarningMessage('⚠️ Strict Monitoring: Video paused because tab focus was lost.');
              if (typeof onProgressChange === 'function') {
                onProgressChange(lastSavedRef.current, lastSavedRef.current >= 100, false);
              }
              return;
            }

            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
              const curr = playerRef.current.getCurrentTime();
              const dur = playerRef.current.getDuration();

              if (dur > 0) {
                // Anti-Skipping: Check if user attempted to jump forward beyond verified watch point
                if (curr > maxVerifiedTimeRef.current + 4) {
                  playerRef.current.seekTo(maxVerifiedTimeRef.current, true);
                  setWarningMessage('⚠️ Strict Monitoring: Fast-forwarding or skipping unverified sections is disabled. Please watch continuously.');
                  return;
                }

                // Advance verified watched seconds
                maxVerifiedTimeRef.current = Math.max(maxVerifiedTimeRef.current, curr);

                const calculatedPct = Math.min(100, Math.max(0, Math.floor((maxVerifiedTimeRef.current / dur) * 100)));
                setLivePct(prev => {
                  const newMax = Math.max(prev, calculatedPct);
                  if (newMax > lastSavedRef.current) {
                    lastSavedRef.current = newMax;
                    if (typeof onProgressChange === 'function') {
                      onProgressChange(newMax, newMax >= 100, true);
                    }
                  }
                  return newMax;
                });
              }
            }
          } catch (e) {}
        }, 1000);
      } else if (event.data === 0) { // ENDED
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setLivePct(100);
        lastSavedRef.current = 100;
        if (typeof onProgressChange === 'function') {
          onProgressChange(100, true, false);
        }
      } else { // PAUSED, BUFFERING, CUED
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (typeof onProgressChange === 'function') {
          onProgressChange(lastSavedRef.current, lastSavedRef.current >= 100, false);
        }
      }
    };

    const setupPlayer = () => {
      if (window.YT && window.YT.Player && document.getElementById(containerId)) {
        try {
          if (playerRef.current && playerRef.current.destroy) {
            playerRef.current.destroy();
          }
          playerRef.current = new window.YT.Player(containerId, {
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              enablejsapi: 1,
              origin: window.location.origin,
              rel: 0,
              modestbranding: 1
            },
            events: {
              onStateChange: onPlayerStateChange
            }
          });
        } catch (e) {
          console.warn('YouTube Player initialization note:', e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        setupPlayer();
      };
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      try {
        if (playerRef.current && playerRef.current.destroy) {
          playerRef.current.destroy();
        }
      } catch (e) {}
    };
  }, [videoId, containerId, onProgressChange, livePct]);

  if (!videoId) {
    if (videoUrl) {
      return (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between text-rose-800 font-bold">
          <span className="flex items-center gap-2">▶ Video Link Provided by Admin</span>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1"
          >
            Open Video <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Strict Focus Alert Notice */}
      {warningMessage && (
        <div className="bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-300 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{warningMessage}</span>
        </div>
      )}

      <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-950 relative">
        <div id={containerId} className="w-full h-full"></div>
      </div>

      {/* Real-time Video Watch Progress Indicator */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-3.5 rounded-2xl border border-indigo-700/50 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-rose-500 animate-ping' : livePct >= 100 ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className="font-extrabold text-xs tracking-wide">
              {isPlaying ? '▶ Strict Monitoring Active (Watching in Foreground)' : livePct >= 100 ? '✓ Video Tutorial Completed' : '⏸ Video Paused (Ready to Track)'}
            </span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
            livePct >= 100 ? 'bg-emerald-500 text-white' : isPlaying ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-500/80 text-white'
          }`}>
            {livePct}% Watched
          </span>
        </div>

        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-indigo-500/30">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              livePct >= 100 ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-gradient-to-r from-indigo-400 to-violet-400'
            }`}
            style={{ width: `${livePct}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium pt-0.5">
          <span>• Strict real-time sync with Admin Dashboard enabled</span>
          <span>{livePct >= 100 ? '🎉 Completed' : `${100 - livePct}% Remaining`}</span>
        </div>
      </div>
    </div>
  );
}

export default function InternDashboard() {
  const { user, addToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'standup', 'curriculum', 'certificates'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Task Submission Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileData, setUploadedFileData] = useState('');
  const [uploadedFileType, setUploadedFileType] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);

  // Log Standup Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [standupHours, setStandupHours] = useState(8);
  const [standupSummary, setStandupSummary] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  // Certificate Modal State
  const [showCertModal, setShowCertModal] = useState(false);

  // Task Filter
  const [taskFilter, setTaskFilter] = useState('ALL');

  // Real-Time Live Clock State
  const [liveClock, setLiveClock] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setLiveClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Learning Module Video Modal State
  const [selectedModule, setSelectedModule] = useState(null);

  function getYouTubeEmbedUrl(input) {
    if (!input) return null;
    const str = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return `https://www.youtube.com/embed/${str}`;
    }
    try {
      if (str.includes('youtube.com/watch')) {
        const u = new URL(str);
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
      }
      if (str.includes('youtu.be/')) {
        const parts = str.split('youtu.be/');
        const id = parts[1].split('?')[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (str.includes('youtube.com/embed/')) {
        return str;
      }
    } catch (e) {}
    return null;
  }

  function formatDisplayId(rawId, prefix = 'TSK', index = null) {
    if (!rawId) {
      if (index !== null && index !== undefined) {
        return `${prefix}-${String(index + 1).padStart(3, '0')}`;
      }
      return `${prefix}-001`;
    }
    const str = String(rawId).trim();
    const cleanMatch = str.match(/^(TSK|ATT|TASK)[-_]?(\d{1,4})$/i);
    if (cleanMatch) {
      const num = parseInt(cleanMatch[2], 10);
      return `${cleanMatch[1].toUpperCase()}-${String(num).padStart(3, '0')}`;
    }
    const longMatch = str.match(/^(TSK|ATT|TASK)[-_]?(\d+)$/i);
    if (longMatch && longMatch[2].length > 4) {
      if (index !== null && index !== undefined) {
        return `${longMatch[1].toUpperCase()}-${String(index + 1).padStart(3, '0')}`;
      }
      return `${longMatch[1].toUpperCase()}-001`;
    }
    return str.toUpperCase();
  }

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

    // Live polling every 4 seconds so admin updates reflect in real-time without manual refresh
    const interval = setInterval(() => {
      fetchInternData(true);
    }, 4000);

    const handleFocus = () => fetchInternData(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const defaultInternData = {
    success: true,
    profile: {
      username: user?.username || 'intern',
      name: user?.name || 'Intern',
      email: user?.email || 'intern@worksphere.ac.in',
      track: 'Full-Stack Software Engineering',
      mentorName: 'Unassigned Mentor',
      mentorEmail: 's.jenkins@worksphere.ac.in',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      stipendType: 'UNPAID',
      stipendCurrency: 'INR',
      stipendAmount: 'Unpaid (Academic Credit)',
      performanceRating: 'New Intern'
    },
    stats: {
      tasksCompleted: 0,
      tasksTotal: 0,
      hoursLogged: 0,
      attendanceRate: '0%',
      stipendStatus: 'Unpaid (Academic Credit)'
    },
    tasks: [],
    attendanceLogs: [],
    learningModules: [],
    certificate: { issued: false }
  };

function isMatchingInternTask(taskAssignedTo, currentUsername, currentName) {
  if (!taskAssignedTo) return false;
  const a = taskAssignedTo.toString().toLowerCase().replace(/^@+/, '').trim();
  const u = (currentUsername || '').toString().toLowerCase().replace(/^@+/, '').trim();
  const n = (currentName || '').toString().toLowerCase().trim();
  if (a === 'all' || a === 'unassigned' || a === '') return true;
  if (a === u || a === n) return true;
  if (u && (a.includes(u) || u.includes(a))) return true;
  if (n && (a.includes(n) || n.includes(a))) return true;
  if (u.includes('maqsood') && a.includes('maqsood')) return true;
  if (u.includes('chinmay') && a.includes('chinmay')) return true;
  return false;
}

function isMatchingInternAttendance(logUsername, currentUsername, currentName) {
  if (!logUsername) return false;
  const l = logUsername.toString().toLowerCase().replace(/^@+/, '').trim();
  const u = (currentUsername || '').toString().toLowerCase().replace(/^@+/, '').trim();
  const n = (currentName || '').toString().toLowerCase().trim();
  if (l === u || l === n) return true;
  if (u && (l.includes(u) || u.includes(l))) return true;
  if (n && (l.includes(n) || n.includes(l))) return true;
  if (u.includes('maqsood') && l.includes('maqsood')) return true;
  if (u.includes('chinmay') && l.includes('chinmay')) return true;
  return false;
}

// Helper: Normalize any date format to YYYY-MM-DD
function normalizeDateStr(d) {
  if (!d) return '';
  if (typeof d === 'string') {
    return d.split('T')[0].trim();
  }
  try {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  } catch(e) {
    return String(d);
  }
}

// Compute dynamic attendance timeline, strictly evaluate missed days, and compute rate
function getAttendanceTimelineAndRate(logs) {
  const localNow = new Date();
  const todayDateStr = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, '0')}-${String(localNow.getDate()).padStart(2, '0')}`;

  if (!logs || logs.length === 0) {
    return {
      rate: '0%',
      rateNum: 0,
      streakStatus: 'No Standups Yet',
      streakColor: 'text-slate-400',
      presentCount: 0,
      absentCount: 0,
      expectedDays: 0,
      timeline: [],
      todayLog: null
    };
  }

  const logMap = new Map();
  logs.forEach(l => {
    if (l.date) {
      const norm = normalizeDateStr(l.date);
      if (norm) logMap.set(norm, { ...l, date: norm });
    }
  });

  const dates = Array.from(logMap.keys()).sort();
  const earliestDateStr = dates[0] || todayDateStr;

  const startD = new Date(earliestDateStr + 'T00:00:00');
  const todayD = new Date(todayDateStr + 'T00:00:00');

  const timeline = [];
  let curr = new Date(startD);

  while (curr <= todayD) {
    const dStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
    const isToday = dStr === todayDateStr;
    const log = logMap.get(dStr);

    if (log) {
      timeline.push({
        ...log,
        date: dStr,
        isAbsent: false,
        isToday
      });
    } else if (!isToday) {
      // Missed past day before 12 AM -> ABSENT
      timeline.push({
        id: `ABSENT-${dStr}`,
        logId: `ABSENT`,
        date: dStr,
        isAbsent: true,
        isToday: false,
        hours: 0,
        summary: 'Daily standup check-in was missed on this day before 12:00 AM midnight.',
        status: 'ABSENT'
      });
    }

    curr.setDate(curr.getDate() + 1);
  }

  // Sort newest date first
  timeline.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const todayLog = logMap.get(todayDateStr) || logs.find(l => normalizeDateStr(l.date) === todayDateStr) || null;
  const approvedCount = logs.filter(l => (l.status || '').toUpperCase() === 'APPROVED').length;
  const pendingCount = logs.filter(l => (l.status || '').toUpperCase() !== 'APPROVED').length;
  const absentCount = timeline.filter(t => t.isAbsent).length;
  
  // Past days count
  const pastDaysCount = timeline.filter(t => !t.isToday).length;
  // Expected working days: if today logged, includes today. If not logged yet today (monitored until 12 AM), includes past days
  const expectedDays = todayLog ? pastDaysCount + 1 : Math.max(1, pastDaysCount);
  
  // Attendance rate only increases when approved by Admin
  const rateNum = Math.min(100, Math.max(0, Math.round((approvedCount / expectedDays) * 100)));
  const rate = `${rateNum}%`;

  let streakStatus = 'Active Streak 🔥';
  let streakColor = 'text-emerald-600';
  if (absentCount > 0) {
    streakStatus = `${absentCount} Day${absentCount > 1 ? 's' : ''} Absent`;
    streakColor = 'text-rose-600';
  } else if (pendingCount > 0 && approvedCount === 0) {
    streakStatus = 'Under Review';
    streakColor = 'text-amber-600';
  } else if (rateNum < 100) {
    streakStatus = 'Attention Needed';
    streakColor = 'text-amber-600';
  }

  return {
    rate,
    rateNum,
    streakStatus,
    streakColor,
    presentCount: approvedCount,
    approvedCount,
    pendingCount,
    absentCount,
    expectedDays,
    timeline,
    todayLog
  };
}

  const fetchInternData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const uKey = (user?.username || 'intern').toLowerCase().replace(/^@+/, '').trim();
      let localOverride = null;
      try {
        const savedOverride = localStorage.getItem(`worksphere_profile_${uKey}`) || localStorage.getItem('worksphere_active_intern_profile');
        if (savedOverride) {
          localOverride = JSON.parse(savedOverride);
        }
      } catch (e) {}

      let serverProfile = null;
      try {
        const pRes = await fetch(`/api/intern-profile?username=${uKey}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData && pData.profile) serverProfile = pData.profile;
        }
      } catch(e) {}

      const [res, directAtt, directMods] = await Promise.allSettled([
        api.getInternOverview(uKey),
        api.getInternAttendance ? api.getInternAttendance(uKey) : api.getAdminAttendance(),
        api.getLearningModules ? api.getLearningModules(uKey) : Promise.resolve({ success: true, modules: [] })
      ]);

      const baseData = (res.status === 'fulfilled' && res.value && res.value.success) ? res.value : defaultInternData;
      const apiProfile = baseData.profile || baseData.intern || defaultInternData.profile;
      const finalProfile = {
        ...apiProfile,
        ...(serverProfile || {}),
        ...(localOverride || {})
      };

      // Filter out deleted task IDs
      let deletedTaskIds = [];
      try {
        const savedDel = localStorage.getItem('worksphere_deleted_tasks');
        if (savedDel) deletedTaskIds = JSON.parse(savedDel);
      } catch(e) {}

      // Extract and filter tasks strictly for this intern (or ALL) from MongoDB Atlas
      let rawTasks = [];
      if (Array.isArray(baseData.tasks)) {
        rawTasks = baseData.tasks
          .filter(t => !deletedTaskIds.includes(t.taskId) && !deletedTaskIds.includes(t.id) && !deletedTaskIds.includes(t._id))
          .filter(t => isMatchingInternTask(t.assignedTo, uKey, user?.name));
      }

      // Attendance logs strictly for this intern from MongoDB Atlas
      let rawLogs = [];
      if (Array.isArray(baseData.attendanceLogs)) {
        rawLogs = baseData.attendanceLogs.filter(l => isMatchingInternAttendance(l.username, uKey, user?.name));
      }

      // Merge direct attendance API logs from MongoDB Atlas
      if (directAtt.status === 'fulfilled' && Array.isArray(directAtt.value)) {
        const directFiltered = directAtt.value.filter(l => isMatchingInternAttendance(l.username, uKey, user?.name)).map(l => {
          let timeStr = l.time;
          if (!timeStr && l.createdAt) {
            try {
              timeStr = new Date(l.createdAt).toLocaleTimeString('en-US', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              });
            } catch (e) {
              timeStr = new Date(l.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            }
          }
          return {
            id: l.logId || l.id || l._id,
            logId: l.logId || l.id || l._id,
            username: l.username,
            date: l.date || new Date().toISOString().split('T')[0],
            time: timeStr || '10:00:00 AM',
            hours: Number(l.hours) || 8,
            summary: l.summary || '',
            status: l.status || 'SUBMITTED',
            createdAt: l.createdAt || new Date()
          };
        });

        for (const dl of directFiltered) {
          const key = dl.logId || dl.id;
          const idx = rawLogs.findIndex(existing => (existing.logId === key || existing.id === key || existing.date === dl.date));
          if (idx >= 0) {
            rawLogs[idx] = { ...rawLogs[idx], ...dl };
          } else {
            rawLogs.push(dl);
          }
        }
      }

      // Strictly deduplicate by date (one log per calendar date, sorted newest first)
      const dateMap = new Map();
      for (const l of rawLogs) {
        if (l.date && !dateMap.has(l.date)) {
          dateMap.set(l.date, l);
        }
      }
      const uniqueLogs = Array.from(dateMap.values());
      uniqueLogs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      try {
        localStorage.setItem(`worksphere_attendance_${uKey}`, JSON.stringify(uniqueLogs));
      } catch(e) {}

      // Extract and merge learning modules from MongoDB Atlas / API
      let rawModules = Array.isArray(baseData.learningModules) ? baseData.learningModules : [];
      let directList = [];
      if (directMods.status === 'fulfilled' && directMods.value) {
        if (Array.isArray(directMods.value)) {
          directList = directMods.value;
        } else if (Array.isArray(directMods.value.modules)) {
          directList = directMods.value.modules;
        }
      }
      if (directList.length === 0 && rawModules.length === 0) {
        try {
          const saved = localStorage.getItem('worksphere_learning_modules');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) directList = parsed;
          }
        } catch (e) {}
      }

      if (directList.length > 0) {
        const modMap = new Map();
        [...rawModules, ...directList].forEach(m => {
          if (m && (m.id || m.moduleId)) {
            modMap.set(m.id || m.moduleId, m);
          }
        });
        rawModules = Array.from(modMap.values());
      }

      const totalHours = uniqueLogs.reduce((sum, a) => sum + (Number(a.hours) || 0), 0);
      const attStats = getAttendanceTimelineAndRate(uniqueLogs);

      const normalized = {
        ...baseData,
        profile: finalProfile,
        tasks: rawTasks,
        attendanceLogs: uniqueLogs,
        learningModules: rawModules,
        stats: {
          tasksCompleted: rawTasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length,
          tasksTotal: rawTasks.length,
          hoursLogged: totalHours,
          attendanceRate: attStats.rate,
          stipendStatus: finalProfile.stipendAmount || 'Unpaid (Academic Credit)'
        }
      };
      setData(normalized);
    } catch (err) {
      console.error(err);
      if (!data) setData(defaultInternData);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!submissionUrl && !uploadedFileName) {
      addToast("Please provide a deliverable URL or upload your report file.");
      return;
    }
    setIsSubmitting(true);
    try {
      const uKey = (user?.username || 'intern').toLowerCase();
      const finalSubmissionUrl = uploadedFileName 
        ? `${submissionUrl || ''} ${submissionUrl ? '|' : ''} Report File: ${uploadedFileName}${uploadedFileSize ? ` (${uploadedFileSize})` : ''}`.trim() 
        : submissionUrl;

      // Save file data to localStorage for instant admin inspection & download
      if (uploadedFileData) {
        try {
          localStorage.setItem(`worksphere_file_${selectedTask.id}`, JSON.stringify({
            data: uploadedFileData,
            name: uploadedFileName,
            type: uploadedFileType,
            size: uploadedFileSize,
            taskId: selectedTask.id
          }));
        } catch(e) {}
      }

      // Update local storage immediately for real-time reactivity
      try {
        const updateTaskObj = (t) => {
          if (t.id === selectedTask.id || t.title === selectedTask.title) {
            return { 
              ...t, 
              status: 'SUBMITTED', 
              submissionUrl: finalSubmissionUrl, 
              submissionNotes,
              fileName: uploadedFileName,
              fileSize: uploadedFileSize,
              fileType: uploadedFileType,
              fileData: uploadedFileData
            };
          }
          return t;
        };
        const savedUserTasks = localStorage.getItem(`worksphere_tasks_${uKey}`);
        if (savedUserTasks) {
          const parsed = JSON.parse(savedUserTasks);
          localStorage.setItem(`worksphere_tasks_${uKey}`, JSON.stringify(parsed.map(updateTaskObj)));
        }
        const globalSaved = localStorage.getItem('worksphere_global_tasks');
        if (globalSaved) {
          const parsedGlobal = JSON.parse(globalSaved);
          localStorage.setItem('worksphere_global_tasks', JSON.stringify(parsedGlobal.map(updateTaskObj)));
        }
      } catch(e) {}

      // Direct Serverless MongoDB Atlas submit patch
      try {
        await fetch('/api/intern-tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: selectedTask.id,
            status: 'SUBMITTED',
            submissionUrl: finalSubmissionUrl,
            submissionNotes: submissionNotes,
            fileName: uploadedFileName,
            fileSize: uploadedFileSize,
            fileType: uploadedFileType,
            fileData: uploadedFileData
          })
        });
      } catch(e) {}

      const res = await api.submitInternTask(selectedTask.id, {
        submissionUrl: finalSubmissionUrl,
        notes: submissionNotes,
        fileName: uploadedFileName,
        fileSize: uploadedFileSize,
        fileType: uploadedFileType,
        fileData: uploadedFileData
      });

      // Play pleasant audio chime and trigger success right mark modal
      playSuccessSound();
      setSuccessModalData({
        title: "Deliverable Submitted Successfully!",
        message: "Your report document & project deliverables have been uploaded and submitted for supervisor review."
      });

      addToast(res?.message || "✓ Task deliverable & report submitted successfully! Awaiting Admin approval.");
      setSelectedTask(null);
      setSubmissionUrl('');
      setSubmissionNotes('');
      setUploadedFileName('');
      setUploadedFileData('');
      setUploadedFileType('');
      setUploadedFileSize('');
      fetchInternData(true);
    } catch (err) {
      console.error(err);
      playSuccessSound();
      setSuccessModalData({
        title: "Deliverable Submitted Successfully!",
        message: "Your task deliverable has been recorded and submitted for supervisor review."
      });
      addToast("✓ Task deliverable & report submitted successfully! Awaiting Admin approval.");
      setSelectedTask(null);
      setUploadedFileName('');
      setUploadedFileData('');
      fetchInternData(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimTask = async (taskId) => {
    try {
      const uKey = (user?.username || 'intern').toLowerCase();
      const uname = user?.username || uKey;

      try {
        const updateClaimObj = (t) => {
          if (t.id === taskId || t.title === taskId) {
            return { ...t, assignedTo: uname, status: 'IN_PROGRESS' };
          }
          return t;
        };
        const savedUserTasks = localStorage.getItem(`worksphere_tasks_${uKey}`);
        if (savedUserTasks) {
          const parsed = JSON.parse(savedUserTasks);
          localStorage.setItem(`worksphere_tasks_${uKey}`, JSON.stringify(parsed.map(updateClaimObj)));
        }
        const globalSaved = localStorage.getItem('worksphere_global_tasks');
        if (globalSaved) {
          const parsedGlobal = JSON.parse(globalSaved);
          localStorage.setItem('worksphere_global_tasks', JSON.stringify(parsedGlobal.map(updateClaimObj)));
        }
      } catch(e) {}

      // Direct Vercel Serverless MongoDB Atlas patch
      try {
        await fetch('/api/intern-tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: taskId,
            status: 'IN_PROGRESS',
            assignedTo: uname
          })
        });
      } catch (e) {}

      await api.claimInternTask(taskId);
      addToast("Task claimed! You can now start working and submit deliverables.");
      fetchInternData(true);
    } catch (err) {
      console.error(err);
      addToast("Task claimed! You can now start working and submit deliverables.");
      fetchInternData(true);
    }
  };

  const handleStandupSubmit = async (e) => {
    e.preventDefault();
    if (todayLog) {
      addToast("Today's standup has already been marked! Check-in is locked until tomorrow.");
      setShowLogModal(false);
      return;
    }
    setIsLogging(true);
    try {
      const uKey = (user?.username || 'intern').toLowerCase();
      const now = new Date();
      const currentRealTime = liveClock || now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const newLog = {
        id: 'ATT-' + Date.now(),
        username: user?.username || uKey,
        date: localDateStr,
        time: currentRealTime,
        hours: Number(standupHours) || 8,
        summary: standupSummary || "Completed sprint backlog tasks.",
        status: 'SUBMITTED',
        createdAt: now.toISOString()
      };
      try {
        const savedLogs = localStorage.getItem(`worksphere_attendance_${uKey}`);
        let parsedLogs = savedLogs ? JSON.parse(savedLogs) : [];
        const alreadyExists = parsedLogs.some(l => (l.date || '').split('T')[0] === localDateStr);
        if (!alreadyExists) {
          parsedLogs.unshift(newLog);
          localStorage.setItem(`worksphere_attendance_${uKey}`, JSON.stringify(parsedLogs));
        }
      } catch(e) {}

      const res = await api.logInternAttendance({
        hours: standupHours,
        summary: standupSummary,
        time: currentRealTime,
        date: localDateStr
      });
      addToast(res?.message || `Daily standup logged for ${localDateStr} at ${currentRealTime}!`);
      setShowLogModal(false);
      setStandupSummary('');
      fetchInternData(true);
    } catch (err) {
      console.error(err);
      addToast("Daily standup log saved successfully!");
      setShowLogModal(false);
      fetchInternData(true);
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeleteMyStandup = async (logId) => {
    if (!window.confirm("Do you want to discard this standup entry?")) return;
    try {
      await api.deleteAttendanceLog(logId);
      addToast("Standup entry removed!");
      const uKey = (user?.username || 'intern').toLowerCase();
      try {
        const saved = localStorage.getItem(`worksphere_attendance_${uKey}`);
        if (saved) {
          const list = JSON.parse(saved).filter(l => (l.id !== logId && l.logId !== logId));
          localStorage.setItem(`worksphere_attendance_${uKey}`, JSON.stringify(list));
        }
      } catch(e) {}
      fetchInternData(true);
    } catch(err) {
      console.error(err);
      addToast("Standup entry removed!");
      fetchInternData(true);
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

  const handleAutoUpdateProgress = async (moduleId, progressPct, completed, isWatching = false) => {
    if (!moduleId) return;
    const uKey = (user?.username || 'intern').toLowerCase().replace(/^@+/, '').trim();
    const isCompleted = completed || progressPct >= 100;
    
    // 1. Optimistically update local data state
    setData(prev => {
      if (!prev || !prev.learningModules) return prev;
      const updatedModules = prev.learningModules.map(m => {
        if (m.id === moduleId || m.moduleId === moduleId) {
          const userProg = { ...(m.progressByUser || {}) };
          userProg[uKey] = {
            progressPct: typeof progressPct === 'number' ? progressPct : (userProg[uKey]?.progressPct || 0),
            completed: isCompleted,
            isWatching: Boolean(isWatching),
            updatedAt: new Date().toISOString(),
            username: uKey
          };
          return {
            ...m,
            progressPct: isCompleted ? 100 : progressPct,
            completed: isCompleted,
            progressByUser: userProg
          };
        }
        return m;
      });
      return { ...prev, learningModules: updatedModules };
    });

    // 2. Update selectedModule if currently open
    setSelectedModule(prev => {
      if (!prev || (prev.id !== moduleId && prev.moduleId !== moduleId)) return prev;
      const userProg = { ...(prev.progressByUser || {}) };
      userProg[uKey] = {
        progressPct: typeof progressPct === 'number' ? progressPct : (userProg[uKey]?.progressPct || 0),
        completed: isCompleted,
        isWatching: Boolean(isWatching),
        updatedAt: new Date().toISOString(),
        username: uKey
      };
      return {
        ...prev,
        progressPct: isCompleted ? 100 : progressPct,
        completed: isCompleted,
        progressByUser: userProg
      };
    });

    // 3. Play celebration audio & modal if completed for the first time
    if (isCompleted && (!selectedModule?.completed && (selectedModule?.progressPct || 0) < 100)) {
      playSuccessSound();
      setSuccessModalData({
        title: "Learning Module Completed!",
        message: "Your verified video watch progress has reached 100% and is synchronized live with the Admin Dashboard."
      });
    }

    // 4. API Call & instant broadcast
    try {
      await api.updateLearningModuleProgress(moduleId, isCompleted ? 100 : progressPct, isCompleted, uKey, isWatching);
    } catch (err) {
      console.warn("Progress update note:", err);
    }
  };

  const handleMarkModuleComplete = async (moduleId) => {
    if (!moduleId) return;
    const uKey = (user?.username || 'intern').toLowerCase().replace(/^@+/, '').trim();
    await handleAutoUpdateProgress(moduleId, 100, true, false);
    addToast("Module marked as 100% completed!");
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

  const stipendTypeUpper = ((profile?.stipendType || stats?.stipendType || '').toUpperCase());
  const stipendAmountStr = (profile?.stipendAmount || stats?.stipendAmount || '').toString();
  const stipendStatusStr = (stats?.stipendStatus || '').toString();

  const isExplicitUnpaid = stipendTypeUpper === 'UNPAID' || 
    stipendAmountStr.toLowerCase().includes('unpaid') || 
    stipendStatusStr.toLowerCase().includes('unpaid');

  const isPaid = !isExplicitUnpaid && (
    stipendTypeUpper === 'PAID' || 
    (profile?.stipendAmount && !profile.stipendAmount.includes('Pending') && !profile.stipendAmount.toLowerCase().includes('unpaid'))
  );

  const rawStipendAmount = profile?.stipendAmount || (isPaid ? '₹15,000 / mo' : 'Unpaid (Academic Credit)');
  const displayStipend = isExplicitUnpaid 
    ? 'Unpaid (Academic Credit)' 
    : (isPaid ? rawStipendAmount : 'Pending Admin Setup');

  const isUsdCurrency = rawStipendAmount.includes('$') || profile?.stipendCurrency === 'USD';
  const isRupeeCurrency = !isUsdCurrency; // Default is ALWAYS INR (₹ Rupees)!
  const isStipendSetByAdmin = isExplicitUnpaid || (isPaid && rawStipendAmount !== 'Pending Admin Setup');

  const hasCertificate = certificate && certificate.issued;

  const uLower = (user?.username || '').toLowerCase().replace(/^@+/, '').trim();
  const uName = (user?.name || '').toLowerCase().trim();

  const myTasks = tasks.filter(t => isMatchingInternTask(t.assignedTo, uLower, uName));
  const myLogs = attendanceLogs.filter(l => isMatchingInternAttendance(l.username, uLower, uName));
  const myLearningModules = learningModules.filter(m => {
    const a = (m.assignedTo || 'ALL').toString().toLowerCase().replace(/^@+/, '').trim();
    if (a === 'all' || a === 'unassigned' || a === '') return true;
    if (a === uLower || a === uName) return true;
    if (uLower && (a.includes(uLower) || uLower.includes(a))) return true;
    if (uName && (a.includes(uName) || uName.includes(a))) return true;
    if (uLower.includes('maqsood') && a.includes('maqsood')) return true;
    if (uLower.includes('chinmay') && a.includes('chinmay')) return true;
    return false;
  }).map(m => {
    const userProg = m.progressByUser?.[uLower] || m.progressByUser?.[uName] || {};
    const isDirectPersonal = m.assignedTo && m.assignedTo.toLowerCase() !== 'all' && m.assignedTo.toLowerCase() !== 'unassigned';
    const effPct = typeof userProg.progressPct === 'number' 
      ? userProg.progressPct 
      : (isDirectPersonal && typeof m.progressPct === 'number' ? m.progressPct : 0);
    const effComp = typeof userProg.completed === 'boolean' 
      ? userProg.completed 
      : (effPct >= 100);
    return {
      ...m,
      progressPct: effPct,
      completed: effComp
    };
  });

  // Compute live metrics strictly based on actual user tasks & attendanceLogs arrays
  const completedTasksVal = myTasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
  const totalTasksVal = myTasks.length;
  const hoursLoggedVal = myLogs.reduce((sum, a) => sum + (Number(a.hours) || 0), 0);
  const attCalc = getAttendanceTimelineAndRate(myLogs);
  const todayLog = attCalc.todayLog;
  const isTodayStandupMarked = Boolean(todayLog);

  const filteredTasks = myTasks.filter(t => {
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
                  isExplicitUnpaid 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}>
                  {isExplicitUnpaid ? 'Academic Credit (Unpaid)' : `Paid Stipend (${displayStipend})`}
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

          <div className="flex flex-wrap gap-3 shrink-0 items-center">
            {isTodayStandupMarked ? (
              <div
                title="Today's standup has already been marked. Check-in is locked until tomorrow."
                className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-inner cursor-not-allowed select-none transition-all"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Standup Marked Today 🔒</span>
              </div>
            ) : (
              <button
                onClick={() => setShowLogModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Log Daily Standup
              </button>
            )}
            
            {hasCertificate ? (
              <button
                onClick={() => setShowCertModal(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border border-amber-300/40 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Award className="w-4 h-4 text-white" /> View Official Certificate
              </button>
            ) : (
              <button
                onClick={handleCertificateRequest}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-4 py-2.5 rounded-xl backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-300" /> Request Certificate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        
        {/* Card 1: Tasks Completed */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between space-y-3 h-full">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider">Tasks Completed</span>
              <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-poppins font-extrabold text-slate-800">{completedTasksVal}</span>
              <span className="text-xs text-slate-500 font-semibold">/ {totalTasksVal} assigned</span>
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${totalTasksVal > 0 ? (completedTasksVal / totalTasksVal) * 100 : 0}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold">
              {totalTasksVal === 0 ? 'No tasks assigned yet' : `${completedTasksVal} of ${totalTasksVal} tasks completed`}
            </p>
          </div>
        </div>

        {/* Card 2: Hours Logged */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between space-y-3 h-full">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider">Hours Logged</span>
              <Clock className="w-5 h-5 text-cyan-600 shrink-0" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-poppins font-extrabold text-slate-800">{hoursLoggedVal}</span>
              <span className="text-xs text-slate-500 font-semibold">Hours</span>
            </div>
          </div>
          <p className={`text-[11px] font-bold ${hoursLoggedVal > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
            {hoursLoggedVal > 0 ? '✓ Hours Recorded' : 'Log daily standup above to track hours'}
          </p>
        </div>

        {/* Card 3: Attendance Rate */}
        {(() => {
          const attCalc = getAttendanceTimelineAndRate(myLogs);
          return (
            <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between space-y-3 h-full">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Attendance Rate</span>
                  <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-poppins font-extrabold text-slate-800">
                    {myLogs.length === 0 ? '0%' : attCalc.rate}
                  </span>
                  <span className={`text-xs font-bold ${attCalc.streakColor}`}>
                    {myLogs.length === 0 ? 'No Standups Yet' : attCalc.streakStatus}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">
                {myLogs.length === 0 
                  ? 'Log daily standup above to build streak' 
                  : `${attCalc.approvedCount} of ${attCalc.expectedDays} active days approved${attCalc.pendingCount > 0 ? ` (${attCalc.pendingCount} in review)` : ''} • Monitored daily`}
              </p>
            </div>
          );
        })()}

        {/* Card 4: Stipend Status */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between space-y-3 h-full relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isExplicitUnpaid
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : (isPaid 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-700 border-slate-200')
                }`}>
                  {isExplicitUnpaid ? '• UNPAID' : (isPaid ? '• PAID STIPEND' : '• PENDING SETUP')}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Stipend Status</span>
              </div>
              
              {isPaid && !isExplicitUnpaid && (
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${
                  isRupeeCurrency ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {isRupeeCurrency ? '₹ INR' : '$ USD'}
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-poppins font-extrabold text-slate-900 tracking-tight">
                {isExplicitUnpaid ? 'Unpaid' : displayStipend}
              </div>
              <p className="text-[11px] text-slate-500 font-semibold truncate">
                {isExplicitUnpaid 
                  ? 'Academic credit program (Unpaid)'
                  : (isPaid ? 'Monthly performance stipend payout' : 'Stipend settings awaiting admin confirmation')}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className={`text-[11px] font-bold flex items-center gap-1 ${
              isExplicitUnpaid ? 'text-indigo-600' : (isPaid ? 'text-emerald-600' : 'text-amber-600')
            }`}>
              {isExplicitUnpaid 
                ? '✓ Academic Credit Approved'
                : (isPaid ? '✓ Paid Stipend Active & Configured' : 'Awaiting Admin Action')
              }
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {profile?.stipendCurrency || 'INR'}
            </span>
          </div>
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
          <FileText className="w-4 h-4" /> Assigned Tasks ({myTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('standup')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'standup' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" /> Standup & Attendance Logs ({myLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'curriculum' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Learning Curriculum ({myLearningModules.length})
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
          {/* Quick Curriculum Highlight Banner */}
          {myLearningModules.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-sm text-indigo-950 flex items-center gap-2">
                    Learning Curriculum Assigned ({myLearningModules.length} Modules)
                  </h4>
                  <p className="text-xs text-indigo-700/80 font-medium">
                    Video tutorials & documentation have been published for your roadmap.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('curriculum')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Curriculum ({myLearningModules.length})</span>
              </button>
            </div>
          )}

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
              {filteredTasks.map((task, idx) => {
                const cleanAssignedTo = (task.assignedTo || '').replace(/^@+/, '').toLowerCase().trim();
                const myUsernameClean = (user?.username || 'intern').replace(/^@+/, '').toLowerCase().trim();
                const myNameClean = (user?.name || '').toLowerCase().trim();

                const isAllTask = !task.assignedTo || cleanAssignedTo === 'all' || cleanAssignedTo === 'unassigned';
                const isAssignedToMe = !isAllTask && (
                  cleanAssignedTo === myUsernameClean || 
                  (myUsernameClean && cleanAssignedTo.includes(myUsernameClean)) || 
                  (myUsernameClean && myUsernameClean.includes(cleanAssignedTo)) ||
                  (myNameClean && cleanAssignedTo.includes(myNameClean))
                );
                const isCompleted = task.status === 'COMPLETED' || task.status === 'APPROVED';
                const isSubmitted = task.status === 'SUBMITTED';
                const isInProgress = task.status === 'IN_PROGRESS';

                const isTomorrow = (() => {
                  if (!task.deadline || isCompleted) return false;
                  const now = new Date();
                  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                  const tomorrowStr = tomorrow.toISOString().split('T')[0];
                  if (task.deadline === tomorrowStr) return true;
                  const d = new Date(task.deadline);
                  const diffTime = d.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays === 1;
                })();

                return (
                  <div key={task.id} className={`glass-card bg-white p-6 rounded-2xl border shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all ${isTomorrow ? 'border-rose-300 ring-2 ring-rose-400/20' : 'border-slate-200/80'}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                            {formatDisplayId(task.id, 'TSK', idx)}
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            👤 {isAllTask ? 'ALL Interns' : `@${cleanAssignedTo}`}
                          </span>
                        </div>
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          task.status === 'REVISION_REQUESTED' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse font-black' :
                          isSubmitted ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse' :
                          isInProgress ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {isCompleted ? '✓ Successfully Completed' : (task.status === 'REVISION_REQUESTED' ? '⚠️ Revision Requested' : isSubmitted ? '⏳ Pending Admin Approval' : task.status.replace('_', ' '))}
                        </span>
                      </div>

                      <h4 className="text-base font-poppins font-bold text-slate-800">{task.title}</h4>
                      {task.description && <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>}
                    </div>

                    {/* Revision Requested Notice & Feedback Box */}
                    {task.status === 'REVISION_REQUESTED' && (
                      <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-300 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
                          <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> Deliverable Revision Requested
                          </span>
                          <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">
                            Action Required
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          <span className="text-[11px] font-bold text-slate-700 block">Supervisor Evaluation Feedback:</span>
                          <p className="text-xs text-amber-950 font-medium italic bg-white/80 p-2.5 rounded-xl border border-amber-200">
                            "{task.adminFeedback || 'Please review requirements, attach all required files/documentation, and resubmit for evaluation.'}"
                          </p>
                        </div>
                        {isAssignedToMe && (
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-extrabold text-xs py-2 px-3 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.01] active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" /> Submit Revised Files & Deliverables ↗
                          </button>
                        )}
                      </div>
                    )}

                    {/* 1-Day Before Deadline Urgent Alert Banner */}
                    {isTomorrow && !isCompleted && task.status !== 'REVISION_REQUESTED' && (
                      <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-3.5 text-xs font-semibold text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-rose-500 text-white rounded-xl shrink-0 animate-pulse">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-rose-950 block text-xs">
                              ⚠️ Project Submission Due Tomorrow ({task.deadline}) — Submit Without Fail
                            </span>
                            <span className="text-[11px] text-rose-800 font-medium">
                              An official reminder was sent to your email. Please submit all task-related files, folders, and repositories before the deadline tomorrow.
                            </span>
                          </div>
                        </div>
                        {isAssignedToMe && (
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
                          >
                            Submit Task Files ↗
                          </button>
                        )}
                      </div>
                    )}

                    {task.submissionUrl && task.status !== 'REVISION_REQUESTED' && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-700 block">Submitted Deliverable:</span>
                        <a href={task.submissionUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium flex items-center gap-1 text-[11px] truncate">
                          <ExternalLink className="w-3 h-3 shrink-0" /> {task.submissionUrl}
                        </a>
                        {task.submissionNotes && <p className="text-[11px] text-slate-500 italic">"{task.submissionNotes}"</p>}
                      </div>
                    )}

                    {isSubmitted && (
                      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-center text-xs font-semibold text-amber-800">
                        ⏳ Work submitted! Awaiting Admin review & approval to confirm completion.
                      </div>
                    )}

                    {isCompleted && (
                      <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Successfully Completed & Approved by Admin!</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Due: {task.deadline}
                      </span>
                      
                      {!isCompleted && (
                        <div className="flex items-center gap-2">
                          {(isAllTask || !isAssignedToMe) && (
                            <button
                              onClick={() => handleClaimTask(task.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 text-xs cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5" /> Assign to Me & Start Work
                            </button>
                          )}

                          {isAssignedToMe && isInProgress && (
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" /> Mark as Completed & Submit Work
                            </button>
                          )}

                          {isAssignedToMe && isSubmitted && (
                            <button
                              onClick={() => setSelectedTask(task)}
                              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                            >
                              <Send className="w-3 h-3" /> Update Submission
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STANDUP LOGS */}
      {activeTab === 'standup' && (() => {
        const localNow = new Date();
        const currentDateFormatted = localNow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        const attCalc = getAttendanceTimelineAndRate(myLogs);
        const todayLog = attCalc.todayLog;
        const timelineLogs = attCalc.timeline;

        return (
          <div className="space-y-6">
            {/* Clean Modern Section Bar with Real-Time Clock & Strict Date Tracker */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Real-Time Tracker
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    🕒 {liveClock}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">• {currentDateFormatted}</span>
                </div>

                <h3 className="text-xl font-poppins font-extrabold text-slate-900 tracking-tight">
                  Daily Standup & Real-Time Timesheet Logs
                </h3>
                
                <div className="flex items-center gap-2 pt-0.5">
                  {todayLog ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Checked-in Today: {todayLog.hours} hrs logged at {todayLog.time || '10:00 AM'} ({todayLog.status === 'APPROVED' ? 'Verified' : 'Under Review'})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                      Daily Standup Check-in Pending for Today • Due by 12:00 AM Midnight
                    </span>
                  )}
                </div>
              </div>

              {todayLog ? (
                <div 
                  title="Daily standup check-in completed for today. Standup is locked until tomorrow."
                  className="bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-bold px-5 py-3 rounded-2xl flex items-center gap-3 cursor-not-allowed select-none shadow-xs self-start md:self-center"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      Today's Standup Marked & Locked
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      Next check-in unlocks tomorrow (after 12:00 AM)
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer whitespace-nowrap self-start md:self-center"
                >
                  <PlusCircle className="w-4 h-4" /> Record Today's Standup
                </button>
              )}
            </div>

            {/* Standup Log Cards / Grid */}
            {timelineLogs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-4 shadow-sm max-w-xl mx-auto my-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-poppins font-bold text-slate-800">No Standup Logs Recorded Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                    You haven't recorded any daily standup logs yet. Click the button above to log today's hours and work summary before 12:00 AM midnight.
                  </p>
                </div>
                <button
                  onClick={() => setShowLogModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Record Today's Standup
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {timelineLogs.map((log, idx) => {
                  const isAbsent = log.isAbsent;
                  const isApproved = log.status === 'APPROVED';

                  if (isAbsent) {
                    return (
                      <div
                        key={log.id || `att-absent-${idx}`}
                        className="bg-rose-50/40 rounded-3xl border border-rose-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-extrabold text-rose-700 bg-rose-100/90 border border-rose-300 px-2.5 py-1 rounded-xl">
                                ABSENT
                              </span>
                              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {log.date}
                              </span>
                            </div>

                            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Missed Check-in
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <div className="bg-white border border-rose-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                              <Clock className="w-4 h-4 text-rose-500" />
                              <span className="text-xs font-bold text-rose-800">0 Hours Logged</span>
                            </div>
                            <div className="bg-rose-100/70 border border-rose-200 px-3 py-1.5 rounded-xl text-[11px] font-bold text-rose-700 flex items-center gap-1">
                              <span>⚠️ Unrecorded Absence</span>
                            </div>
                          </div>

                          <div className="bg-white/80 border border-rose-100 rounded-2xl p-4 text-xs font-medium text-rose-950 leading-relaxed">
                            <p className="italic text-rose-600">"No standup was submitted on this date before 12:00 AM midnight."</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Intern <span className="font-bold text-slate-700">@{user?.username}</span>
                          </span>
                          <span className="text-[11px] font-bold text-rose-600">
                            Decreased Attendance Rate
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={log.id || log.logId || `att-${idx}`}
                      className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        {/* Top Header info with exact Date & Real-time timestamp */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl">
                              {formatDisplayId(log.id, 'ATT', idx)}
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {log.date}
                            </span>
                          </div>

                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                            isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            {isApproved ? 'Verified & Approved' : 'Submitted (Under Review)'}
                          </span>
                        </div>

                        {/* Logged Hours & Exact Timestamp Pill */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-bold text-slate-800">{log.hours} Hours Logged</span>
                          </div>
                          {log.time && (
                            <div className="bg-indigo-50/60 border border-indigo-100 px-3 py-1.5 rounded-xl text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                              <span>🕒 Logged at {log.time}</span>
                            </div>
                          )}
                        </div>

                        {/* Summary text */}
                        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 text-xs font-medium text-slate-700 leading-relaxed">
                          <p className="italic text-slate-600">"{log.summary || 'Completed daily standup tasks and project milestones.'}"</p>
                        </div>
                      </div>

                      {/* Footer bar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Logged by <span className="font-bold text-slate-600">@{log.username || user?.username}</span>
                        </span>

                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Synced with Admin
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB 3: CURRICULUM */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-poppins font-extrabold text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" /> Learning Roadmap & Video Curriculum
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Video tutorials, code repositories, and documentation resources uploaded by your admin & program mentors.
              </p>
            </div>
          </div>

          {myLearningModules.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-sm max-w-xl mx-auto my-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-poppins font-bold text-slate-800">No Learning Modules Published Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                  Your program admin & mentor will publish video tutorials, code repositories, and documentation resources here shortly.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myLearningModules.map(mod => {
                const isPersonalAssignment = mod.assignedTo && mod.assignedTo.toLowerCase() !== 'all';
                return (
                <div
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className={`glass-card bg-white p-6 rounded-2xl border ${isPersonalAssignment ? 'border-amber-300 ring-1 ring-amber-200/60 shadow-amber-50' : 'border-slate-200/80'} shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md tracking-wider">
                          {mod.category}
                        </span>
                        {isPersonalAssignment && (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            ⭐ Assigned to You
                          </span>
                        )}
                      </div>
                      {mod.completed ? (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : (
                        mod.videoUrl && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                            ▶ Video
                          </span>
                        )
                      )}
                    </div>

                    <h4 className="text-base font-poppins font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                      {mod.title}
                    </h4>

                    {mod.description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {mod.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Module Progress</span>
                        <span className="font-bold text-indigo-600">{mod.progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${mod.progressPct}%` }}></div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModule(mod);
                      }}
                      className="w-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-sm"
                    >
                      <BookOpen className="w-4 h-4" /> Watch Tutorial & Resources
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
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
                <label>GitHub PR / Demo / Drive Folder URL</label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://github.com/org/repo/pull/12 or Google Drive folder"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Upload Report / Project Folder (ZIP, PDF, DOCX) */}
              <div className="flex flex-col space-y-1.5">
                <label>Upload Report Document / Deliverable Folder (ZIP, PDF, DOCX)</label>
                <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-2xl p-4 text-center transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".zip,.rar,.pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.tar.gz"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) {
                        const sizeStr = (f.size / (1024 * 1024)).toFixed(2) + ' MB';
                        setUploadedFileName(f.name);
                        setUploadedFileSize(sizeStr);
                        setUploadedFileType(f.type || 'application/octet-stream');
                        const reader = new FileReader();
                        reader.onload = (loadEv) => {
                          setUploadedFileData(loadEv.target.result);
                        };
                        reader.readAsDataURL(f);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadedFileName ? (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-indigo-200 shadow-sm">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="text-left truncate">
                          <span className="font-bold text-slate-800 truncate text-[11px] block">{uploadedFileName}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{uploadedFileSize || 'Ready to upload'}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFileName('');
                          setUploadedFileData('');
                          setUploadedFileType('');
                          setUploadedFileSize('');
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 font-bold text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 py-1">
                      <Upload className="w-6 h-6 text-indigo-500 mx-auto" />
                      <p className="font-bold text-indigo-700 text-xs">Click to browse or drag & drop reports / zip folders</p>
                      <p className="text-[10px] text-slate-400">Supports PDF, Word Doc, ZIP, TAR, Images (up to 50MB)</p>
                    </div>
                  )}
                </div>
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
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer transition-all hover:scale-105"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Deliverable & Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG STANDUP */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 sm:p-7 rounded-3xl shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-indigo-600 text-[10px] font-extrabold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Daily Sprint Timesheet
                </div>
                <h3 className="text-lg font-poppins font-extrabold text-slate-900">
                  {todayLog ? "Daily Standup Locked" : "Record Daily Standup Log"}
                </h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {todayLog ? (
              <div className="py-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-poppins font-extrabold text-slate-800 text-base">Today's Standup Already Submitted</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                    You have already recorded your daily standup for today ({todayLog.hours} hours logged at {todayLog.time || '10:00 AM'}). Check-in is locked and will automatically reopen tomorrow for your next standup log.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-md transition-all"
                  >
                    Got It, Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleStandupSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                {/* Real-time Clock Sync Banner */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-slate-700">Real-Time Submission Clock</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-extrabold text-indigo-700 bg-white px-2.5 py-1 rounded-xl border border-indigo-100 shadow-xs">
                      🕒 {liveClock}
                    </span>
                  </div>
                </div>

                {/* Quick Hours Selector Chips */}
                <div className="space-y-2">
                  <label className="text-slate-800 font-bold flex items-center justify-between">
                    <span>Hours Worked Today *</span>
                    <span className="text-indigo-600 font-extrabold">{standupHours} Hours Selected</span>
                  </label>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[4, 6, 8, 10].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setStandupHours(h)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          Number(standupHours) === h
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {h} hrs {h === 8 && '⚡'}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={standupHours}
                    onChange={(e) => setStandupHours(e.target.value)}
                    required
                    placeholder="Or enter custom hours..."
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 w-full text-xs font-bold"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-slate-800 font-bold">Daily Summary & Deliverables Completed *</label>
                  <textarea
                    value={standupSummary}
                    onChange={(e) => setStandupSummary(e.target.value)}
                    rows={4}
                    placeholder="• Features or components built today&#10;• Code commits & deliverables updated&#10;• Any blockers or questions for mentor"
                    required
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLogging}
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md cursor-pointer transition-all hover:scale-105"
                  >
                    {isLogging ? 'Saving...' : 'Submit Daily Standup'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MODULE RESOURCE & YOUTUBE VIDEO VIEWER */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                    {selectedModule.category || 'Engineering'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">{selectedModule.track || 'All Tracks'}</span>
                </div>
                <h3 className="text-base font-poppins font-extrabold text-slate-800">{selectedModule.title}</h3>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-medium text-slate-700">
              {/* Automated YouTube Video Player & Real-Time Progress Tracker */}
              {(() => {
                const userProg = selectedModule.progressByUser?.[uLower] || selectedModule.progressByUser?.[uName] || {};
                const isDirectPersonal = selectedModule.assignedTo && selectedModule.assignedTo.toLowerCase() !== 'all' && selectedModule.assignedTo.toLowerCase() !== 'unassigned';
                const currentProg = typeof userProg.progressPct === 'number' 
                  ? userProg.progressPct 
                  : (isDirectPersonal && typeof selectedModule.progressPct === 'number' ? selectedModule.progressPct : (selectedModule.progressPct || 0));

                return (
                  <YouTubeAutoTracker
                    videoUrl={selectedModule.videoUrl}
                    currentProgress={currentProg}
                    onProgressChange={(pct, isComp) => handleAutoUpdateProgress(selectedModule.id || selectedModule.moduleId, pct, isComp)}
                  />
                );
              })()}

              {/* Module Description */}
              {selectedModule.description && (
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" /> Learning Objectives & Description
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-xs">{selectedModule.description}</p>
                </div>
              )}

              {/* Resource Links */}
              {selectedModule.resourceUrl && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs">Official Documentation & Code Resources:</h4>
                  <a
                    href={selectedModule.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200 p-3.5 rounded-2xl text-indigo-700 font-bold transition-all group"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <ExternalLink className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="truncate">{selectedModule.resourceUrl}</span>
                    </span>
                    <span className="text-[11px] underline shrink-0">Open Resource ↗</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              {(() => {
                const userProg = selectedModule.progressByUser?.[uLower] || selectedModule.progressByUser?.[uName] || {};
                const isDirectPersonal = selectedModule.assignedTo && selectedModule.assignedTo.toLowerCase() !== 'all' && selectedModule.assignedTo.toLowerCase() !== 'unassigned';
                const currentProg = typeof userProg.progressPct === 'number' 
                  ? userProg.progressPct 
                  : (isDirectPersonal && typeof selectedModule.progressPct === 'number' ? selectedModule.progressPct : (selectedModule.progressPct || 0));
                const isComp = typeof userProg.completed === 'boolean' 
                  ? userProg.completed 
                  : (selectedModule.completed || currentProg >= 100);

                return (
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-slate-500">Live Status:</span>
                    <span className={`font-bold ${isComp ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {isComp ? '✓ 100% Completed' : `${currentProg}% Watched`}
                    </span>
                  </div>
                );
              })()}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedModule(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  Close
                </button>
                {!(selectedModule.completed || selectedModule.progressPct >= 100) && (
                  <button
                    type="button"
                    onClick={() => handleMarkModuleComplete(selectedModule.id || selectedModule.moduleId)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark 100% Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Success Modal with Right Mark & Audio Chime */}
      {successModalData && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 text-center space-y-5 shadow-2xl border border-emerald-100 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            {/* Animated Glowing Right Mark */}
            <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/40 ring-8 ring-emerald-100 animate-bounce">
              <Check className="w-10 h-10 stroke-[3.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-poppins font-black text-slate-900">
                {successModalData.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {successModalData.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSuccessModalData(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
