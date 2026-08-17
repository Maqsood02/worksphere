/* API Client Services: React 19 Client with Live Backend & Cloud Demo Fallback */

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalhost ? 'http://localhost:8088' : 'https://worksphere-k6h8.onrender.com');

// Auto-purge stale demo mock cache on first load
if (typeof window !== 'undefined') {
  const currentCacheVer = localStorage.getItem('worksphere_clean_cache_v9');
  if (currentCacheVer !== 'v9') {
    localStorage.removeItem('worksphere_tasks_intern');
    localStorage.removeItem('worksphere_tasks_maqsood');
    localStorage.removeItem('worksphere_tasks_chinmaykv');
    localStorage.removeItem('worksphere_global_tasks');
    localStorage.removeItem('worksphere_attendance_intern');
    localStorage.removeItem('worksphere_attendance_maqsood');
    localStorage.removeItem('worksphere_attendance_chinmaykv');
    localStorage.removeItem('worksphere_intern_profiles');
    localStorage.removeItem('worksphere_active_intern_profile');
    localStorage.removeItem('worksphere_profile_maqsood');
    localStorage.removeItem('worksphere_profile_chinmaykv');
    localStorage.setItem('worksphere_clean_cache_v9', 'v9');
  }
}

// Persistent Users List for Standalone Cloud Demo Mode
function getStoredUsersList() {
  const defaultList = [
    { id: 'u1', username: 'worksphere', name: 'Maqsood M D', email: 'worksphere.ac.in@gmail.com', phone: '8792404950', role: 'ROLE_ADMIN', rawPassword: 'Workshere@123', emailVerified: true, phoneVerified: true },
    { id: 'u2', username: 'maqsood', name: 'Maqsood MD', email: 'maqsoodmd.ac.in@gmail.com', phone: '8792404950', role: 'ROLE_INTERN', rawPassword: '123456', emailVerified: true, phoneVerified: true },
    { id: 'u3', username: 'Chinmaykv', name: 'Chinmay K V', email: 'chinmaykv555@gmail.com', phone: '7760674555', role: 'ROLE_INTERN', rawPassword: '123456', emailVerified: true, phoneVerified: true },
    { id: 'u4', username: 'Maqsood', name: 'Maqsood MD', email: 'maqsoodmdhrl@gmail.com', phone: '8792404950', role: 'ROLE_CLIENT', rawPassword: '123456', emailVerified: true, phoneVerified: true }
  ];

  const saved = localStorage.getItem('worksphere_users_list');
  if (saved) {
    try {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed = parsed.map(u => {
          const uname = (u.username || '').toLowerCase();
          if (uname === 'maqsood' && (u.role === 'ROLE_INTERN' || u.role === 'INTERN')) {
            return { ...u, name: 'Maqsood MD', email: 'maqsoodmd.ac.in@gmail.com', phone: '8792404950' };
          }
          if (uname === 'chinmaykv' || uname === 'chinmay') {
            return { ...u, name: 'Chinmay K V', email: 'chinmaykv555@gmail.com', phone: '7760674555' };
          }
          if (uname === 'worksphere' || uname === 'admin') {
            return { ...u, name: 'Maqsood M D', email: 'worksphere.ac.in@gmail.com', phone: '8792404950' };
          }
          if (uname === 'maqsood' && (u.role === 'ROLE_CLIENT' || u.role === 'CLIENT')) {
            return { ...u, name: 'Maqsood MD', email: 'maqsoodmdhrl@gmail.com', phone: '8792404950' };
          }
          return u;
        });
        localStorage.setItem('worksphere_users_list', JSON.stringify(parsed));
        return parsed;
      }
    } catch (e) {}
  }

  localStorage.setItem('worksphere_users_list', JSON.stringify(defaultList));
  return defaultList;
}

function saveUsersList(users) {
  localStorage.setItem('worksphere_users_list', JSON.stringify(users));
}

function getStoredLearningModules() {
  const saved = localStorage.getItem('worksphere_learning_modules');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch(e) {}
  }
  return [];
}

function saveStoredLearningModules(modules) {
  localStorage.setItem('worksphere_learning_modules', JSON.stringify(modules));
}

function getStoredInternProfiles() {
  const defaultProfiles = {
    'maqsood': {
      username: 'maqsood',
      name: 'Maqsood MD',
      email: 'maqsoodmd.ac.in@gmail.com',
      phone: '8792404950',
      track: 'Full-Stack Software Engineering',
      mentorName: 'Unassigned Mentor',
      mentorEmail: 's.jenkins@worksphere.ac.in',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      stipendType: 'UNPAID',
      stipendCurrency: 'INR',
      stipendAmount: 'Unpaid (Academic Credit)',
      performanceRating: 'Active Intern',
      certificateStatus: 'NOT_ISSUED'
    },
    'chinmaykv': {
      username: 'chinmaykv',
      name: 'Chinmay K V',
      email: 'chinmaykv555@gmail.com',
      phone: '7760674555',
      track: 'AI & Automation Engineering',
      mentorName: 'Unassigned Mentor',
      mentorEmail: 's.jenkins@worksphere.ac.in',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      stipendType: 'UNPAID',
      stipendCurrency: 'INR',
      stipendAmount: 'Unpaid (Academic Credit)',
      performanceRating: 'Active Intern',
      certificateStatus: 'NOT_ISSUED'
    }
  };

  const saved = localStorage.getItem('worksphere_intern_profiles');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) return parsed;
    } catch (e) {}
  }

  localStorage.setItem('worksphere_intern_profiles', JSON.stringify(defaultProfiles));
  return defaultProfiles;
}

function saveStoredInternProfiles(profiles) {
  localStorage.setItem('worksphere_intern_profiles', JSON.stringify(profiles));
}

// Mock Fallback Handler for Standalone Cloud Deployments (e.g. Vercel preview without live backend)
function getMockFallbackResponse(url, options = {}) {
  let body = {};
  try {
    if (options.body) body = JSON.parse(options.body);
  } catch (e) {}

  const method = (options.method || 'GET').toUpperCase();

  // 1. Auth - Login
  if (url.includes('/api/auth/login')) {
    const uname = (body.username || '').trim();
    let role = 'ROLE_CLIENT';
    let name = uname || 'Demo User';
    let email = `${uname || 'demo'}@worksphere.ac.in`;
    let phone = '8792404950';
    
    if (uname.toLowerCase() === 'worksphere' || uname.toLowerCase() === 'admin' || uname.toLowerCase() === 'workshpere') {
      role = 'ROLE_ADMIN';
      name = 'Maqsood M D';
      email = 'worksphere.ac.in@gmail.com';
      phone = '8792404950';
    } else if (uname.toLowerCase() === 'maqsood') {
      role = 'ROLE_INTERN';
      name = 'Maqsood MD';
      email = 'maqsoodmd.ac.in@gmail.com';
      phone = '8792404950';
    } else if (uname.toLowerCase() === 'chinmaykv' || uname.toLowerCase() === 'chinmay') {
      role = 'ROLE_INTERN';
      name = 'Chinmay K V';
      email = 'chinmaykv555@gmail.com';
      phone = '7760674555';
    }
    
    const user = {
      id: uname.toLowerCase() || 'usr_demo',
      username: uname || 'worksphere',
      name: name,
      email: email,
      phone: phone,
      role: role,
      designation: role === 'ROLE_INTERN' ? 'Full-Stack Engineering Intern' : (role === 'ROLE_ADMIN' ? 'Platform Administrator' : 'Valued Client')
    };
    
    localStorage.setItem('worksphere_user', JSON.stringify(user));
    return { success: true, user, message: 'Logged in successfully (Demo Mode)' };
  }
  if (url.includes('/api/auth/me')) {
    const saved = localStorage.getItem('worksphere_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        return { authenticated: true, user };
      } catch (e) {}
    }
    return { authenticated: false, message: 'Not logged in' };
  }

  // 3. Auth - Logout
  if (url.includes('/api/auth/logout')) {
    localStorage.removeItem('worksphere_user');
    return { success: true, message: 'Logged out' };
  }

function isPasswordSecure(password) {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSpecial;
}

function isValidEmailFormat(email) {
  if (!email) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim());
}

  // 4. Auth - Register
  if (url.includes('/api/auth/register')) {
    const inputEmail = (body.email || '').trim().toLowerCase();
    const inputUsername = (body.username || '').trim().toLowerCase();
    const inputPhoneDigits = (body.phone || '').replace(/[^0-9]/g, '');
    const users = getStoredUsersList();

    if (!isValidEmailFormat(body.email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    const duplicateEmail = users.find(u => (u.email || '').trim().toLowerCase() === inputEmail);
    if (duplicateEmail) {
      return { success: false, message: `Email '${body.email}' is already registered.` };
    }
    const duplicateUsername = users.find(u => (u.username || '').trim().toLowerCase() === inputUsername);
    if (duplicateUsername) {
      return { success: false, message: `Username '@${body.username}' is already taken.` };
    }
    if (inputPhoneDigits.length > 0) {
      const duplicatePhone = users.find(u => (u.phone || '').replace(/[^0-9]/g, '') === inputPhoneDigits);
      if (duplicatePhone) {
        return { success: false, message: `Phone number '${body.phone}' is already registered.` };
      }
    }
    if (!isPasswordSecure(body.password)) {
      return { success: false, message: 'Password must be 8+ chars with uppercase, lowercase, number & special char (!@#$).' };
    }

    const user = {
      id: body.username || 'usr_' + Date.now(),
      username: body.username || 'newuser',
      name: body.name || 'New User',
      email: body.email,
      phone: body.phone || '+91 9876543210',
      role: body.role || 'ROLE_CLIENT',
      rawPassword: body.password || 'Workshere@123'
    };
    localStorage.setItem('worksphere_user', JSON.stringify(user));
    users.push(user);
    saveUsersList(users);

    return { success: true, user, message: 'Account registered successfully!' };
  }

  // 5. Auth - OTP & Password Reset
  if (url.includes('/api/auth/verify-otp') || url.includes('/api/auth/resend-otp') || url.includes('/api/auth/forgot-password') || url.includes('/api/auth/reset-password')) {
    return { success: true, message: 'Verification successful (Demo Mode)' };
  }

  // 6. Admin User Management Operations
  // 6a. Delete User
  if (method === 'DELETE' && url.includes('/api/admin/users/')) {
    const parts = url.split('/');
    const targetUsername = parts[parts.length - 1];
    let users = getStoredUsersList();
    users = users.filter(u => u.username.toLowerCase() !== targetUsername.toLowerCase());
    saveUsersList(users);
    return { success: true, message: `User @${targetUsername} deleted successfully!` };
  }

  // 6b. Update User Role
  if (url.includes('/api/admin/users/') && url.includes('/role')) {
    const parts = url.split('/');
    const targetUsername = parts[parts.length - 2];
    const users = getStoredUsersList();
    const userObj = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (userObj) {
      userObj.role = body.role || 'ROLE_CLIENT';
      saveUsersList(users);
    }
    return { success: true, message: `User @${targetUsername} role updated to ${body.role || 'ROLE_CLIENT'} successfully!` };
  }

  // 6c. Send Credentials Email
  if (url.includes('/send-credentials')) {
    const parts = url.split('/');
    const targetUsername = parts[parts.length - 2] || 'user';
    const users = getStoredUsersList();
    const target = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
    let emailToUse = target?.email || `${targetUsername}@worksphere.ac.in`;
    try {
      if (options && options.body) {
        const bodyObj = JSON.parse(options.body);
        if (bodyObj && bodyObj.email) emailToUse = bodyObj.email;
      }
    } catch (e) {}
    return { success: true, message: `HTML Credentials email dispatched successfully to ${emailToUse}!` };
  }

  // 6d. Delete Task Handler
  if (url.includes('/api/admin/interns/tasks/') && (method === 'DELETE' || url.includes('/delete'))) {
    const parts = url.split('/');
    let taskId = parts[parts.length - 1];
    if (taskId === 'delete') taskId = parts[parts.length - 2];
    
    try {
      const globalSaved = localStorage.getItem('worksphere_global_tasks');
      if (globalSaved) {
        let globalList = JSON.parse(globalSaved);
        globalList = globalList.filter(t => t.id !== taskId);
        localStorage.setItem('worksphere_global_tasks', JSON.stringify(globalList));
      }
      ['intern', 'maqsood', 'chinmaykv'].forEach(k => {
        const saved = localStorage.getItem(`worksphere_tasks_${k}`);
        if (saved) {
          let list = JSON.parse(saved);
          list = list.filter(t => t.id !== taskId);
          localStorage.setItem(`worksphere_tasks_${k}`, JSON.stringify(list));
        }
      });
    } catch(e) {}

    return { success: true, message: `Assigned task ${taskId} deleted successfully!` };
  }

  // 6d. Create User (POST /api/admin/users)
  if (method === 'POST' && url.endsWith('/api/admin/users')) {
    const inputEmail = (body.email || '').trim().toLowerCase();
    const inputUsername = (body.username || '').trim().toLowerCase();
    const inputPhoneDigits = (body.phone || '').replace(/[^0-9]/g, '');
    const users = getStoredUsersList();

    if (!isValidEmailFormat(body.email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    const duplicateEmail = users.find(u => (u.email || '').trim().toLowerCase() === inputEmail);
    if (duplicateEmail) {
      return { success: false, message: `Email '${body.email}' is already registered.` };
    }
    const duplicateUsername = users.find(u => (u.username || '').trim().toLowerCase() === inputUsername);
    if (duplicateUsername) {
      return { success: false, message: `Username '@${body.username}' is already taken.` };
    }
    if (inputPhoneDigits.length > 0) {
      const duplicatePhone = users.find(u => (u.phone || '').replace(/[^0-9]/g, '') === inputPhoneDigits);
      if (duplicatePhone) {
        return { success: false, message: `Phone number '${body.phone}' is already registered.` };
      }
    }
    if (!isPasswordSecure(body.password)) {
      return { success: false, message: 'Password must be 8+ chars with uppercase, lowercase, number & special char (!@#$).' };
    }

    const newUser = {
      id: 'u_' + Date.now(),
      username: body.username,
      name: body.name,
      email: body.email,
      phone: body.phone || '+91 9876543210',
      role: body.role || 'ROLE_CLIENT',
      rawPassword: body.password || 'Workshere@123',
      emailVerified: true,
      phoneVerified: true
    };
    users.push(newUser);
    saveUsersList(users);
    return { success: true, message: `User @${body.username} created & credentials email sent successfully!`, user: newUser };
  }

  // 6e. Get All Users (GET /api/admin/users)
  if (url.includes('/api/admin/users')) {
    const users = getStoredUsersList();
    return { success: true, users: users, totalCount: users.length };
  }

  // 7. Projects (Client & Admin)
  if (url.includes('/projects')) {
    const sampleProjects = [
      { id: 'proj_101', title: 'WorkSphere Web Platform', clientName: 'Enterprise Client', category: 'Full-Stack Development', status: 'IN_PROGRESS', progress: 75, budget: 1500, deadline: '2026-09-15' },
      { id: 'proj_102', title: 'AI Co-Pilot Assistant', clientName: 'Tech Corp', category: 'AI & Automation', status: 'COMPLETED', progress: 100, budget: 2200, deadline: '2026-08-01' },
      { id: 'proj_103', title: 'Mobile Client Workspace App', clientName: 'Innovate LLC', category: 'Frontend', status: 'PLANNING', progress: 25, budget: 1800, deadline: '2026-10-30' }
    ];
    return { success: true, projects: sampleProjects };
  }

  // 8. Invoices
  if (url.includes('/invoices')) {
    const sampleInvoices = [
      { id: 'INV-2026-001', projectTitle: 'WorkSphere Web Platform', amount: 1500, status: 'PAID', dueDate: '2026-08-15', paymentMethod: 'CARD' },
      { id: 'INV-2026-002', projectTitle: 'AI Co-Pilot Assistant', amount: 2200, status: 'PENDING', dueDate: '2026-08-25', paymentMethod: null }
    ];
    return { success: true, invoices: sampleInvoices };
  }

  // 9. Appointments
  if (url.includes('/appointments')) {
    const sampleAppointments = [
      { id: 'app_1', clientName: 'Alex Johnson', serviceType: 'Architecture Review', date: '2026-08-12', time: '10:00 AM', status: 'CONFIRMED' }
    ];
    return { success: true, appointments: sampleAppointments };
  }

  // 10. Intern Overview & Management
  if (url.includes('/api/admin/interns/') && url.includes('/update')) {
    const parts = url.split('/');
    const targetUsername = (parts[parts.length - 2] || 'intern').toLowerCase();
    const profiles = getStoredInternProfiles();

    const current = profiles[targetUsername] || {};
    const newStipendType = body.stipendType || current.stipendType || 'UNPAID';
    const newStipendAmount = newStipendType === 'UNPAID' ? 'Unpaid (Academic Credit)' : (body.stipendAmount || current.stipendAmount || '₹15,000 / mo');

    profiles[targetUsername] = {
      ...current,
      ...body,
      stipendType: newStipendType,
      stipendAmount: newStipendAmount
    };

    saveStoredInternProfiles(profiles);
    return {
      success: true,
      message: `Intern profile & stipend settings updated for @${targetUsername}!`,
      profile: profiles[targetUsername]
    };
  }

  if (url.includes('/api/admin/interns')) {
    const profiles = getStoredInternProfiles();
    const users = getStoredUsersList();
    
    const uniqueMap = {};
    Object.keys(profiles).forEach(k => {
      const lower = k.toLowerCase();
      if (lower !== 'intern') {
        let userOverride = null;
        try {
          const ov = localStorage.getItem(`worksphere_profile_${lower}`);
          if (ov) userOverride = JSON.parse(ov);
        } catch(e) {}

        const merged = { ...profiles[k], username: lower, ...(userOverride || {}) };
        if (merged.stipendType === 'UNPAID' || (merged.stipendAmount || '').toLowerCase().includes('unpaid')) {
          merged.stipendType = 'UNPAID';
          merged.stipendAmount = 'Unpaid (Academic Credit)';
        }
        uniqueMap[lower] = merged;
      }
    });

    users.forEach(u => {
      const r = (u.role || '').toUpperCase();
      const uname = (u.username || '').toLowerCase();
      if ((r.includes('INTERN')) && uname !== 'intern') {
        let userOverride = null;
        try {
          const ov = localStorage.getItem(`worksphere_profile_${uname}`);
          if (ov) userOverride = JSON.parse(ov);
        } catch(e) {}

        const existing = uniqueMap[uname] || {};
        const merged = {
          username: uname,
          name: u.name || u.username,
          email: u.email || `${uname}@worksphere.ac.in`,
          phone: u.phone || '',
          track: 'Full-Stack Software Engineering',
          mentorName: 'Unassigned Mentor',
          stipendType: 'UNPAID',
          stipendCurrency: 'INR',
          stipendAmount: 'Unpaid (Academic Credit)',
          performanceRating: 'New Intern',
          certificateStatus: 'NOT_ISSUED',
          ...existing,
          ...(userOverride || {})
        };
        if (merged.stipendType === 'UNPAID' || (merged.stipendAmount || '').toLowerCase().includes('unpaid')) {
          merged.stipendType = 'UNPAID';
          merged.stipendAmount = 'Unpaid (Academic Credit)';
        }
        uniqueMap[uname] = merged;
      }
    });

    saveStoredInternProfiles(uniqueMap);

    let allTasks = [];
    try {
      const gSaved = localStorage.getItem('worksphere_global_tasks');
      if (gSaved) allTasks = JSON.parse(gSaved);
    } catch(e) {}

    const result = Object.values(uniqueMap).map(p => {
      const uKey = (p.username || '').toLowerCase();
      const pTasks = allTasks.filter(t => (t.assignedTo || '').toLowerCase().includes(uKey) || uKey.includes((t.assignedTo || '').toLowerCase()));
      return {
        ...p,
        tasksTotal: pTasks.length,
        tasksCompleted: pTasks.filter(t => t.status === 'COMPLETED').length
      };
    });
    return { success: true, interns: result, allTasks: allTasks };
  }

  if (url.includes('/api/intern/overview')) {
    let currentUser = null;
    try {
      const savedUser = localStorage.getItem('worksphere_user');
      if (savedUser) currentUser = JSON.parse(savedUser);
    } catch (e) {}
    const uname = (currentUser?.username || 'intern').toLowerCase();

    const profiles = getStoredInternProfiles();
    
    if (!profiles[uname]) {
      profiles[uname] = {
        username: currentUser?.username || uname,
        name: currentUser?.name || uname,
        email: currentUser?.email || `${uname}@worksphere.ac.in`,
        track: 'Full-Stack Software Engineering',
        mentorName: 'Unassigned Mentor',
        mentorEmail: 's.jenkins@worksphere.ac.in',
        startDate: '2026-06-01',
        endDate: '2026-08-31',
        stipendType: 'UNPAID',
        stipendCurrency: 'INR',
        stipendAmount: 'Unpaid (Academic Credit)',
        performanceRating: 'New Intern',
        certificateStatus: 'NOT_ISSUED'
      };
      saveStoredInternProfiles(profiles);
    }

    const profile = profiles[uname];

    // User-specific tasks & logs (fetches from both user-specific and global task stores)
    let userTasks = [];
    try {
      const savedTasks = localStorage.getItem(`worksphere_tasks_${uname}`);
      if (savedTasks) userTasks = JSON.parse(savedTasks);

      const globalSaved = localStorage.getItem('worksphere_global_tasks');
      if (globalSaved) {
        const globalList = JSON.parse(globalSaved);
        const matched = globalList.filter(t => {
          if (!t.assignedTo) return true;
          const assignedLower = t.assignedTo.toLowerCase();
          return assignedLower === uname || 
                 assignedLower.includes(uname) || 
                 uname.includes(assignedLower) || 
                 assignedLower === 'all' ||
                 uname === 'intern';
        });
        const existingIds = new Set(userTasks.map(t => t.id));
        for (const gTask of matched) {
          if (!existingIds.has(gTask.id)) {
            userTasks.push(gTask);
          }
        }
      }
    } catch(e) {}

    let userLogs = [];
    try {
      const savedLogs = localStorage.getItem(`worksphere_attendance_${uname}`);
      if (savedLogs) userLogs = JSON.parse(savedLogs);
    } catch(e) {}

    return {
      success: true,
      profile: profile,
      stats: {
        tasksCompleted: userTasks.filter(t => t.status === 'COMPLETED' || t.status === 'SUBMITTED').length,
        tasksTotal: userTasks.length,
        hoursLogged: userLogs.reduce((sum, a) => sum + (Number(a.hours) || 0), 0),
        attendanceRate: userLogs.length === 0 ? '0%' : '100%',
        stipendStatus: profile.stipendAmount || 'Unpaid (Academic Credit)'
      },
      tasks: userTasks,
      attendanceLogs: userLogs,
      learningModules: [],
      certificate: { issued: profile.certificateStatus === 'ISSUED' }
    };
  }

  if (url.includes('/intern') || url.includes('/interns')) {
    return {
      success: true,
      message: 'Intern operation completed successfully'
    };
  }

  // 11. Chat History & Messages
  if (url.includes('/chat/history')) {
    return {
      success: true,
      messages: [
        { id: 'm1', senderId: 'worksphere', receiverId: 'client', content: 'Welcome to WorkSphere Support!', timestamp: new Date().toISOString() }
      ]
    };
  }

  if (url.includes('/chat/unread')) {
    return { success: true, unreadCount: 0 };
  }

  if (url.includes('/chat/send')) {
    return { success: true, message: 'Message sent' };
  }

  // Default Fallback
  return { success: true, message: 'Success (Demo Mode)' };
}

// Helper to make fetch calls with proper JSON and Session credentials config
async function request(url, options = {}) {
  // Silently return mock fallback for local admin demo endpoints to eliminate 401 console noise in browser DevTools
  if (url.includes('/api/admin/projects') || url.includes('/api/admin/invoices') || url.includes('/api/admin/appointments')) {
    let savedUser = null;
    try {
      const u = localStorage.getItem('worksphere_user');
      if (u) savedUser = JSON.parse(u);
    } catch(e) {}
    if (savedUser && !localStorage.getItem('worksphere_session_token')) {
      return getMockFallbackResponse(url, options);
    }
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', 
  };

  const candidateUrls = url.startsWith('http') ? [url] : [
    `${API_BASE_URL}${url}`,
    `http://localhost:8088${url}`,
    `https://worksphere-k6h8.onrender.com${url}`
  ];

  // Remove duplicate URLs
  const uniqueUrls = [...new Set(candidateUrls)];

  for (const targetUrl of uniqueUrls) {
    try {
      const response = await fetch(targetUrl, config);
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && !contentType.includes('text/html')) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      // Try next backend URL
    }
  }

  return getMockFallbackResponse(url, options);
}

export const api = {
  // Authentication
  login: (username, password) => 
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
    
  register: (payload) => 
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  verifyOtp: (username, otp) =>
    request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ username, otp })
    }),

  resendOtp: (username) =>
    request('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ username })
    }),

  forgotPassword: (identifier) =>
    request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    }),

  resetPassword: (payload) =>
    request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    
  logout: () => 
    request('/api/auth/logout', { method: 'POST' }),
    
  me: () => 
    request('/api/auth/me'),

  // Client Dashboard Data
  getClientProjects: () => request('/api/client/projects'),
  getClientInvoices: () => request('/api/client/invoices'),
  getClientAppointments: () => request('/api/client/appointments'),

  // Admin Dashboard Data
  getAdminProjects: () => request('/api/admin/projects'),
  getAdminInvoices: () => request('/api/admin/invoices'),
  getAdminAppointments: () => request('/api/admin/appointments'),

  getInternOverview: async (customUsername) => {
    let currentUser = null;
    try {
      const savedUser = localStorage.getItem('worksphere_user');
      if (savedUser) currentUser = JSON.parse(savedUser);
    } catch (e) {}
    const defaultUKey = (customUsername || currentUser?.username || 'intern').toLowerCase();

    // 1. First fetch directly from Vercel Serverless MongoDB Atlas endpoint
    let res = null;
    try {
      const serverlessRes = await fetch(`/api/intern-overview?username=${defaultUKey}`);
      if (serverlessRes.ok) {
        const sData = await serverlessRes.json();
        if (sData && sData.success) {
          res = sData;
        }
      }
    } catch (e) {}

    // 2. Fallback to Java backend candidate endpoints
    if (!res || !res.success) {
      res = await request(`/api/intern/overview?username=${defaultUKey}`);
    }
    if (!res || typeof res !== 'object') res = {};

    const cleanDefaultProfile = {
      username: currentUser?.username || defaultUKey,
      name: currentUser?.name || defaultUKey,
      email: currentUser?.email || `${defaultUKey}@worksphere.ac.in`,
      track: 'Full-Stack Software Engineering',
      mentorName: 'Unassigned Mentor',
      mentorEmail: 's.jenkins@worksphere.ac.in',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      stipendType: 'UNPAID',
      stipendCurrency: 'INR',
      stipendAmount: 'Unpaid (Academic Credit)',
      performanceRating: 'Active Intern',
      certificateStatus: 'NOT_ISSUED'
    };

    let p = cleanDefaultProfile;
    const uKey = defaultUKey;

    try {
      const storedProfiles = getStoredInternProfiles();
      if (storedProfiles[uKey]) {
        p = { ...cleanDefaultProfile, ...storedProfiles[uKey] };
      } else if (res.profile && res.profile.username && res.profile.username.toLowerCase() === uKey) {
        p = { ...cleanDefaultProfile, ...res.profile };
      }
    } catch (e) {
      p = cleanDefaultProfile;
    }
    res.profile = p;

    // Filter tasks strictly for this intern (or ALL)
    function isMatchingInternTask(taskAssignedTo, currentUsername) {
      if (!taskAssignedTo) return false;
      const a = taskAssignedTo.toString().toLowerCase().trim();
      const u = (currentUsername || '').toString().toLowerCase().trim();
      if (a === 'all' || a === 'unassigned' || a === '') return true;
      if (a === u) return true;
      if (u && (a.includes(u) || u.includes(a))) return true;
      if (u.includes('maqsood') && a.includes('maqsood')) return true;
      if (u.includes('chinmay') && a.includes('chinmay')) return true;
      return false;
    }

    let realTasks = [];
    if (Array.isArray(res.tasks)) {
      realTasks = res.tasks.filter(t => isMatchingInternTask(t.assignedTo, uKey));
    }

    try {
      const savedTasks = localStorage.getItem(`worksphere_tasks_${uKey}`);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        for (const t of parsed) {
          const idx = realTasks.findIndex(existing => existing.id === t.id);
          if (idx >= 0) {
            realTasks[idx] = { ...realTasks[idx], ...t };
          } else {
            realTasks.unshift(t);
          }
        }
      }

      const globalSaved = localStorage.getItem('worksphere_global_tasks');
      if (globalSaved) {
        const globalList = JSON.parse(globalSaved);
        const matched = globalList.filter(t => isMatchingInternTask(t.assignedTo, uKey));
        for (const gTask of matched) {
          const idx = realTasks.findIndex(existing => existing.id === gTask.id);
          if (idx >= 0) {
            realTasks[idx] = { ...realTasks[idx], ...gTask };
          } else {
            realTasks.unshift(gTask);
          }
        }
      }

      // Filter out deleted tasks
      const savedDel = localStorage.getItem('worksphere_deleted_tasks');
      if (savedDel) {
        const deletedIds = JSON.parse(savedDel);
        realTasks = realTasks.filter(t => !deletedIds.includes(t.id));
      }
    } catch(e) {}

    res.tasks = realTasks;

    // Strictly user's own attendance logs
    let realLogs = [];
    if (Array.isArray(res.attendanceLogs)) {
      realLogs = res.attendanceLogs.filter(l => (l.username || '').toLowerCase().trim() === uKey);
    }
    try {
      const savedLogs = localStorage.getItem(`worksphere_attendance_${uKey}`);
      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs);
        for (const l of parsedLogs) {
          if (!realLogs.some(existing => existing.id === l.id)) {
            realLogs.unshift(l);
          }
        }
      }
    } catch(e) {}

    res.attendanceLogs = realLogs;

    // Clean stats dynamically computed from the user's actual tasks and logs
    res.stats = {
      tasksCompleted: realTasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length,
      tasksTotal: realTasks.length,
      hoursLogged: realLogs.reduce((sum, a) => sum + (Number(a.hours) || 0), 0),
      attendanceRate: realLogs.length === 0 ? '0%' : '100%',
      stipendStatus: res.profile.stipendAmount || 'Unpaid (Academic Credit)'
    };
    res.learningModules = getStoredLearningModules();
    res.success = true;
    return res;
  },
  getLearningModules: async () => {
    return { success: true, modules: getStoredLearningModules() };
  },
  createLearningModule: async (payload) => {
    try {
      const modules = getStoredLearningModules();
      const newMod = {
        id: 'MOD-' + Date.now(),
        title: payload.title || 'New Learning Module',
        category: payload.category || 'Engineering',
        track: payload.track || 'ALL',
        description: payload.description || '',
        videoUrl: payload.videoUrl || '',
        resourceUrl: payload.resourceUrl || '',
        progressPct: 0,
        completed: false
      };
      modules.unshift(newMod);
      saveStoredLearningModules(modules);
    } catch (e) {}
    return request('/api/admin/learning-modules', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  deleteLearningModule: async (id) => {
    try {
      let modules = getStoredLearningModules();
      modules = modules.filter(m => m.id !== id);
      saveStoredLearningModules(modules);
    } catch (e) {}
    return request(`/api/admin/learning-modules/${id}`, {
      method: 'DELETE'
    });
  },
  updateLearningModuleProgress: async (id, progressPct, completed) => {
    try {
      let modules = getStoredLearningModules();
      modules = modules.map(m => {
        if (m.id === id) {
          return {
            ...m,
            progressPct: typeof progressPct === 'number' ? progressPct : m.progressPct,
            completed: typeof completed === 'boolean' ? completed : m.completed
          };
        }
        return m;
      });
      saveStoredLearningModules(modules);
    } catch (e) {}
    return request(`/api/intern/learning-modules/${id}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progressPct, completed })
    });
  },
  claimInternTask: async (taskId) => {
    try {
      let currentUser = null;
      try {
        const savedUser = localStorage.getItem('worksphere_user');
        if (savedUser) currentUser = JSON.parse(savedUser);
      } catch (e) {}
      const uKey = (currentUser?.username || 'intern').toLowerCase();
      
      const updateList = (list) => {
        return list.map(t => {
          if (t.id === taskId || t.title === taskId) {
            return {
              ...t,
              assignedTo: currentUser?.username || uKey,
              status: 'IN_PROGRESS'
            };
          }
          return t;
        });
      };

      const userSaved = localStorage.getItem(`worksphere_tasks_${uKey}`);
      if (userSaved) {
        localStorage.setItem(`worksphere_tasks_${uKey}`, JSON.stringify(updateList(JSON.parse(userSaved))));
      }

      const globalSaved = localStorage.getItem('worksphere_global_tasks');
      if (globalSaved) {
        localStorage.setItem('worksphere_global_tasks', JSON.stringify(updateList(JSON.parse(globalSaved))));
      }
    } catch(e) {}
    return request(`/api/intern/tasks/${taskId}/claim`, {
      method: 'POST'
    });
  },
  submitInternTask: async (taskId, payload) => {
    try {
      let currentUser = null;
      try {
        const savedUser = localStorage.getItem('worksphere_user');
        if (savedUser) currentUser = JSON.parse(savedUser);
      } catch (e) {}
      const uKey = (currentUser?.username || 'intern').toLowerCase();
      
      const updateList = (list) => {
        return list.map(t => {
          if (t.id === taskId || t.title === taskId) {
            return {
              ...t,
              status: 'SUBMITTED',
              submissionUrl: payload.submissionUrl || payload.url || '',
              submissionNotes: payload.notes || payload.submissionNotes || ''
            };
          }
          return t;
        });
      };

      const userSaved = localStorage.getItem(`worksphere_tasks_${uKey}`);
      if (userSaved) {
        localStorage.setItem(`worksphere_tasks_${uKey}`, JSON.stringify(updateList(JSON.parse(userSaved))));
      }

      const globalSaved = localStorage.getItem('worksphere_global_tasks');
      if (globalSaved) {
        localStorage.setItem('worksphere_global_tasks', JSON.stringify(updateList(JSON.parse(globalSaved))));
      }
    } catch(e) {}
    return request(`/api/intern/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  logInternAttendance: async (payload) => {
    try {
      let currentUser = null;
      try {
        const savedUser = localStorage.getItem('worksphere_user');
        if (savedUser) currentUser = JSON.parse(savedUser);
      } catch (e) {}
      const uKey = (currentUser?.username || 'intern').toLowerCase();
      const saved = localStorage.getItem(`worksphere_attendance_${uKey}`);
      let list = saved ? JSON.parse(saved) : [];
      const newLog = {
        id: 'ATT-' + Date.now(),
        username: currentUser?.username || uKey,
        date: new Date().toISOString().split('T')[0],
        hours: Number(payload.hours) || 8,
        summary: payload.summary || 'Daily standup recorded',
        status: 'APPROVED'
      };
      list.push(newLog);
      localStorage.setItem(`worksphere_attendance_${uKey}`, JSON.stringify(list));
    } catch(e) {}
    return request('/api/intern/attendance/log', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  requestInternCertificate: () => 
    request('/api/intern/certificate/request', {
      method: 'POST'
    }),

  // Admin Intern Management
  getAdminInterns: () => request('/api/admin/interns'),
  updateAdminIntern: async (username, payload) => {
    try {
      const uKey = (username || 'intern').toLowerCase();
      const storedProfiles = getStoredInternProfiles();

      const newStipendType = payload.stipendType || 'UNPAID';
      const newStipendAmount = newStipendType === 'UNPAID' ? 'Unpaid (Academic Credit)' : (payload.stipendAmount || '₹15,000 / mo');

      const updatedPayload = {
        ...payload,
        username: uKey,
        stipendType: newStipendType,
        stipendAmount: newStipendAmount
      };

      storedProfiles[uKey] = { ...(storedProfiles[uKey] || {}), ...updatedPayload };
      saveStoredInternProfiles(storedProfiles);
      localStorage.setItem(`worksphere_profile_${uKey}`, JSON.stringify(updatedPayload));
    } catch (e) {}
    return request(`/api/admin/interns/${username}/update`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  assignInternTask: async (username, payload) => {
    const uKey = (username || 'intern').toLowerCase();
    const newTask = {
      id: 'TSK-' + Date.now(),
      assignedTo: username,
      title: payload.title || 'New Task',
      description: payload.description || '',
      deadline: payload.deadline || '2026-08-31',
      priority: payload.priority || 'HIGH',
      status: 'IN_PROGRESS',
      submissionUrl: '',
      submissionNotes: ''
    };

    // 1. Direct Vercel Serverless MongoDB Atlas persist
    try {
      await fetch('/api/intern-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: username,
          title: payload.title,
          description: payload.description,
          deadline: payload.deadline,
          priority: payload.priority
        })
      });
    } catch (e) {}

    try {
      const saved = localStorage.getItem(`worksphere_tasks_${uKey}`);
      let list = saved ? JSON.parse(saved) : [];
      list.push(newTask);
      localStorage.setItem(`worksphere_tasks_${uKey}`, JSON.stringify(list));
      localStorage.setItem('worksphere_tasks_intern', JSON.stringify(list));
      localStorage.setItem('worksphere_tasks_maqsood', JSON.stringify(list));
      localStorage.setItem('worksphere_tasks_chinmaykv', JSON.stringify(list));

      const globalSaved = localStorage.getItem('worksphere_global_tasks');
      let globalList = globalSaved ? JSON.parse(globalSaved) : [];
      globalList.push(newTask);
      localStorage.setItem('worksphere_global_tasks', JSON.stringify(globalList));
    } catch(e) {}

    // Dispatch email via Serverless Function / direct failover
    try {
      fetch('/api/send-task-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          taskTitle: payload.title,
          description: payload.description,
          deadline: payload.deadline,
          priority: payload.priority
        })
      }).catch(() => {});
    } catch (e) {}

    return request(`/api/admin/interns/${username}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  generateInternCertificate: (username, payload) => 
    request(`/api/admin/interns/${username}/certificate/generate`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    }),
  revokeInternCertificate: (username) => 
    request(`/api/admin/interns/${username}/certificate/revoke`, {
      method: 'POST'
    }),
  sendInternCredentials: (username, payload) => 
    request(`/api/admin/interns/${username}/send-credentials`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    }),
  sendUserCredentials: (username, payload) => 
    request(`/api/admin/users/${username}/send-credentials`, {
      method: 'POST',
      body: JSON.stringify(payload || {})
    }),
  updateAdminInternTaskStatus: async (taskId, status) => {
    try {
      const globalSaved = localStorage.getItem('worksphere_global_tasks');
      if (globalSaved) {
        let globalList = JSON.parse(globalSaved);
        globalList = globalList.map(t => t.id === taskId || t.title === taskId ? { ...t, status } : t);
        localStorage.setItem('worksphere_global_tasks', JSON.stringify(globalList));
      }
    } catch(e) {}
    return request(`/api/admin/interns/tasks/${taskId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  },
  deleteInternTask: async (taskId) => {
    try {
      const globalSaved = localStorage.getItem('worksphere_global_tasks');
      if (globalSaved) {
        let globalList = JSON.parse(globalSaved);
        globalList = globalList.filter(t => t.id !== taskId);
        localStorage.setItem('worksphere_global_tasks', JSON.stringify(globalList));
      }
      ['intern', 'maqsood', 'chinmaykv'].forEach(k => {
        const saved = localStorage.getItem(`worksphere_tasks_${k}`);
        if (saved) {
          let list = JSON.parse(saved);
          list = list.filter(t => t.id !== taskId);
          localStorage.setItem(`worksphere_tasks_${k}`, JSON.stringify(list));
        }
      });
    } catch(e) {}

    try {
      const res = await request(`/api/admin/interns/tasks/${taskId}`, { method: 'DELETE' });
      if (res && res.success) return res;
    } catch(e) {}

    return request(`/api/admin/interns/tasks/${taskId}/delete`, { method: 'POST' });
  },
  // Admin User Directory & Role Management
  getAdminUsers: () => request('/api/admin/users'),
  createAdminUser: (payload) => 
    request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateAdminUserRole: (username, role) => 
    request(`/api/admin/users/${username}/role`, {
      method: 'POST',
      body: JSON.stringify({ role })
    }),
  deleteAdminUser: (username) => 
    request(`/api/admin/users/${username}`, {
      method: 'DELETE'
    }),

  // Actions
  submitContactInquiry: (payload) =>
    request('/api/public/contact', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  submitProjectRequest: (payload) => 
    request('/api/public/project-request', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    
  updateProjectStatus: (projectId, status) => 
    request(`/api/admin/projects/${projectId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),
    
  payInvoice: (invoiceId, paymentMethod) => 
    request(`/api/invoices/${invoiceId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod })
    }),
    
  bookAppointment: (payload) => 
    request('/api/appointments/book', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    
  cancelAppointment: (appId) => 
    request(`/api/appointments/admin/${appId}/cancel`, {
      method: 'POST'
    }),

  // Chat Logging
  getChatHistory: (withUser) => request(`/api/chat/history?withUser=${withUser}`),
  
  sendMessage: (receiverId, content) => 
    request('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content })
    }),
    
  getUnreadCount: () => request('/api/chat/unread')
};
