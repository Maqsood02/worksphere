/* API Client Services: React 19 Client */

// Helper to make fetch calls with proper JSON and Session credentials config
async function request(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Required to send and receive JSESSIONID cookies across origins (port 5173 to 8080)
    credentials: 'include', 
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401 && !url.includes('/api/auth/login')) {
      // Unauthorized for authenticated routes, redirect or return unauthorized payload
      return { success: false, unauthorized: true, message: "Session expired. Please log in." };
    }
    if (response.status === 403) {
      try {
        const errData = await response.json();
        return { success: false, forbidden: true, message: errData.message || "Access forbidden (403). Authorization required." };
      } catch (e) {
        return { success: false, forbidden: true, message: "Access forbidden (403). Authorization required." };
      }
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error on ${url}:`, error);
    return { success: false, message: "Connection lost. Ensure Spring Boot backend is active." };
  }
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

  // Intern Dashboard Data & Actions
  getInternOverview: () => request('/api/intern/overview'),
  submitInternTask: (taskId, payload) => 
    request(`/api/intern/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  logInternAttendance: (payload) => 
    request('/api/intern/attendance/log', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  requestInternCertificate: () => 
    request('/api/intern/certificate/request', {
      method: 'POST'
    }),

  // Admin Intern Management
  getAdminInterns: () => request('/api/admin/interns'),
  updateAdminIntern: (username, payload) => 
    request(`/api/admin/interns/${username}/update`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  assignInternTask: (username, payload) => 
    request(`/api/admin/interns/${username}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
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
  updateAdminInternTaskStatus: (taskId, status) => 
    request(`/api/admin/interns/tasks/${taskId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    }),
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
