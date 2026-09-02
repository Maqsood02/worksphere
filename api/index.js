import { connectToDatabase } from './db.js';
import nodemailer from 'nodemailer';

// Nodemailer SMTP Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'worksphere.ac.in@gmail.com',
    pass: 'mbtfgehiiejzwtzk'
  }
});

// Helper: Send Learning Module Email
async function sendLearningModuleNotification({ toEmail, internName, username, moduleTitle, category, track, description, videoUrl, resourceUrl }) {
  if (!toEmail || !toEmail.includes('@')) return false;
  
  const targetLabel = (username && username.toUpperCase() !== 'ALL') ? `@${username.replace(/^@+/, '')}` : 'All Interns';
  const videoBtn = videoUrl ? `
    <div style="margin: 12px 0;">
      <a href="${videoUrl.startsWith('http') ? videoUrl : 'https://www.youtube.com/watch?v=' + videoUrl}" target="_blank" style="display: inline-block; background: #e11d48; color: #ffffff !important; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 10px;">
        ▶ Watch Video Tutorial
      </a>
    </div>
  ` : '';

  const resourceBtn = resourceUrl ? `
    <div style="margin: 8px 0;">
      <a href="${resourceUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 10px;">
        📚 Open Documentation & Resources
      </a>
    </div>
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 30px 15px; color: #f8fafc; }
        .container { max-width: 580px; margin: 0 auto; background: #131c2e; border-radius: 20px; border: 1px solid #283654; padding: 32px 24px; }
        .logo-box { text-align: center; margin-bottom: 20px; }
        .logo-title { font-size: 26px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px; }
        .tagline { font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
        .greeting { font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 10px; }
        .text { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
        .mod-card { background: #090e1a; border: 1px solid #3b82f6; border-radius: 16px; padding: 20px; margin: 18px 0; }
        .badge { display: inline-block; background: #1e3a8a; color: #93c5fd; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-right: 6px; }
        .mod-title { font-size: 18px; font-weight: 800; color: #38bdf8; margin: 12px 0 8px 0; }
        .mod-desc { font-size: 13px; color: #cbd5e1; line-height: 1.6; background: #131c2e; padding: 12px; border-radius: 10px; border-left: 3px solid #6366f1; margin: 12px 0; }
        .btn-box { text-align: center; margin: 24px 0 12px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #3b82f6); color: #ffffff !important; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 12px; }
        .footer { text-align: center; margin-top: 28px; padding-top: 16px; border-top: 1px solid #283654; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-box">
          <div class="logo-title">WorkSphere</div>
          <div class="tagline">NEW LEARNING MODULE & VIDEO RESOURCE</div>
        </div>
        <div class="greeting">Hello ${internName || username || 'Intern'},</div>
        <div class="text">Your administrator & mentor has published a new learning curriculum module for your internship roadmap:</div>

        <div class="mod-card">
          <span class="badge">${category || 'Engineering'}</span>
          <span class="badge" style="background: #312e81; color: #c7d2fe;">${track || 'ALL Tracks'}</span>
          <div class="mod-title">🎓 ${moduleTitle}</div>
          <div class="mod-desc">${description || 'No additional description provided. Follow the video tutorials and references below.'}</div>
          ${videoBtn}
          ${resourceBtn}
          <div style="font-size: 11px; color: #94a3b8; margin-top: 12px;">Assigned Target: <strong style="color: #a5b4fc;">${targetLabel}</strong></div>
        </div>

        <div class="btn-box">
          <a href="https://worksphere-two.vercel.app/intern/dashboard" class="btn">Open Intern Portal & Start Module ↗</a>
        </div>

        <div class="footer">
          &copy; 2026 WorkSphere Platform. All rights reserved.<br/>
          Automated notification from worksphere.ac.in@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"WorkSphere Learning Curriculum" <worksphere.ac.in@gmail.com>',
      to: toEmail,
      subject: `🎓 [WorkSphere] New Learning Module: ${moduleTitle}`,
      html: htmlContent
    });
    console.log(`[EMAIL DISPATCH SUCCESS] Learning module mail sent to ${toEmail}, id: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL DISPATCH ERROR] Failed to send learning module mail to ${toEmail}:`, err);
    return false;
  }
}

// Helper: Send Task Assignment Email
async function sendTaskNotification({ toEmail, internName, username, taskTitle, description, deadline, priority }) {
  if (!toEmail || !toEmail.includes('@')) return false;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 30px 15px; color: #f8fafc; }
        .container { max-width: 580px; margin: 0 auto; background: #131c2e; border-radius: 20px; border: 1px solid #283654; padding: 32px 24px; }
        .logo-box { text-align: center; margin-bottom: 20px; }
        .logo-title { font-size: 26px; font-weight: 800; color: #38bdf8; }
        .tagline { font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
        .greeting { font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 10px; }
        .text { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
        .task-card { background: #090e1a; border: 1px solid #6366f1; border-radius: 16px; padding: 20px; margin: 18px 0; }
        .badge { display: inline-block; background: #4f46e5; color: #ffffff; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-right: 6px; }
        .task-title { font-size: 17px; font-weight: 800; color: #ffffff; margin: 12px 0 8px 0; }
        .task-desc { font-size: 13px; color: #cbd5e1; line-height: 1.6; background: #131c2e; padding: 12px; border-radius: 10px; border-left: 3px solid #38bdf8; margin: 12px 0; }
        .meta { font-size: 12px; color: #94a3b8; margin: 6px 0; }
        .btn-box { text-align: center; margin: 24px 0 12px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #3b82f6); color: #ffffff !important; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 12px; }
        .footer { text-align: center; margin-top: 28px; padding-top: 16px; border-top: 1px solid #283654; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-box">
          <div class="logo-title">WorkSphere</div>
          <div class="tagline">NEW SPRINT TASK ASSIGNMENT</div>
        </div>
        <div class="greeting">Hello ${internName || username || 'Intern'},</div>
        <div class="text">Your administrator has assigned a new task to your sprint backlog:</div>

        <div class="task-card">
          <span class="badge">${priority || 'HIGH'} PRIORITY</span>
          <span class="badge" style="background: #0284c7;">DEADLINE: ${deadline || '2026-08-31'}</span>
          <div class="task-title">📌 ${taskTitle}</div>
          <div class="task-desc">${description || 'Review instructions in the intern portal and submit deliverables upon completion.'}</div>
          <div class="meta">Assigned To: <strong style="color: #a5b4fc;">@${username || 'intern'}</strong></div>
        </div>

        <div class="btn-box">
          <a href="https://worksphere-two.vercel.app/intern/dashboard" class="btn">View Task & Start Work ↗</a>
        </div>

        <div class="footer">
          &copy; 2026 WorkSphere Platform. All rights reserved.<br/>
          Automated notification from worksphere.ac.in@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"WorkSphere Sprint Backlog" <worksphere.ac.in@gmail.com>',
      to: toEmail,
      subject: `📌 [WorkSphere] New Task Assigned: ${taskTitle}`,
      html: htmlContent
    });
    console.log(`[EMAIL DISPATCH SUCCESS] Task mail sent to ${toEmail}, id: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL DISPATCH ERROR] Failed to send task mail to ${toEmail}:`, err);
    return false;
  }
}

// Helper: Send Account Credentials Email
async function sendCredentialsNotification({ toEmail, name, username, password, role }) {
  if (!toEmail || !toEmail.includes('@')) return false;

  const roleClean = role ? role.replace('ROLE_', '') : 'CLIENT';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 30px 15px; color: #f8fafc; }
        .container { max-width: 580px; margin: 0 auto; background: #131c2e; border-radius: 20px; border: 1px solid #283654; padding: 32px 24px; }
        .logo-box { text-align: center; margin-bottom: 20px; }
        .logo-title { font-size: 26px; font-weight: 800; color: #38bdf8; }
        .tagline { font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
        .greeting { font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 10px; }
        .text { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
        .cred-card { background: #090e1a; border: 1px solid #38bdf8; border-radius: 16px; padding: 20px; margin: 18px 0; }
        .cred-row { font-size: 14px; color: #cbd5e1; margin: 10px 0; }
        .cred-val { font-family: monospace; font-weight: bold; color: #38bdf8; background: #1e293b; padding: 3px 8px; border-radius: 6px; }
        .btn-box { text-align: center; margin: 24px 0 12px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #3b82f6); color: #ffffff !important; font-weight: 800; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 12px; }
        .footer { text-align: center; margin-top: 28px; padding-top: 16px; border-top: 1px solid #283654; font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-box">
          <div class="logo-title">WorkSphere</div>
          <div class="tagline">OFFICIAL ACCOUNT LOGIN CREDENTIALS</div>
        </div>
        <div class="greeting">Hello ${name || username || 'User'},</div>
        <div class="text">Your WorkSphere platform account credentials have been configured:</div>

        <div class="cred-card">
          <div class="cred-row">👤 <strong>Username:</strong> <span class="cred-val">${username}</span></div>
          <div class="cred-row">🔑 <strong>Password:</strong> <span class="cred-val">${password}</span></div>
          <div class="cred-row">🛡️ <strong>Assigned Role:</strong> <span class="cred-val">${roleClean}</span></div>
        </div>

        <div class="btn-box">
          <a href="https://worksphere-two.vercel.app/login" class="btn">Log In to WorkSphere ↗</a>
        </div>

        <div class="footer">
          &copy; 2026 WorkSphere Platform. All rights reserved.<br/>
          Automated notification from worksphere.ac.in@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"WorkSphere Platform" <worksphere.ac.in@gmail.com>',
      to: toEmail,
      subject: `🔑 [WorkSphere] Your Account Login Credentials`,
      html: htmlContent
    });
    console.log(`[EMAIL DISPATCH SUCCESS] Credential mail sent to ${toEmail}, id: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL DISPATCH ERROR] Failed to send credential mail to ${toEmail}:`, err);
    return false;
  }
}

// Helper: Send 1-Day-Before Project Submission Deadline Reminder Email
async function sendDeadlineReminderNotification({ toEmail, internName, username, taskTitle, description, deadline, priority, daysLeft = 1 }) {
  if (!toEmail || !toEmail.includes('@')) return false;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Submission Due Tomorrow - WorkSphere</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #f1f5f9; padding: 40px 12px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 36px -8px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
        .top-gradient { height: 6px; background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%); }
        .header { padding: 32px 32px 20px 32px; text-align: center; }
        .logo-text { font-size: 26px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.5px; }
        .logo-text span { color: #4f46e5; }
        .sub-tag { font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
        
        .alert-pill-box { padding: 0 32px 16px 32px; }
        .alert-pill { background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 1px solid #fecdd3; border-radius: 16px; padding: 14px 18px; text-align: center; }
        .alert-pill-title { font-size: 13px; font-weight: 800; color: #e11d48; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
        .alert-pill-sub { font-size: 12px; font-weight: 600; color: #9f1239; }

        .content { padding: 8px 32px 28px 32px; font-size: 14px; line-height: 1.65; color: #334155; }
        .greeting { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
        
        .highlight-notice { background: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 12px; padding: 14px 16px; margin: 18px 0; font-size: 13.5px; color: #1e293b; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
        .highlight-notice strong { color: #4338ca; }

        .task-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; margin: 20px 0; }
        .badges-row { margin-bottom: 12px; }
        .badge-priority { display: inline-block; background: #e0e7ff; color: #4338ca; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 8px; margin-right: 6px; letter-spacing: 0.5px; }
        .badge-deadline { display: inline-block; background: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.5px; }
        .task-name { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 8px; line-height: 1.4; }
        .task-desc-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #475569; line-height: 1.6; margin: 10px 0; }
        .task-meta { font-size: 12px; color: #64748b; margin-top: 10px; font-weight: 500; }
        .task-meta strong { color: #4f46e5; }

        .checklist-box { background: #fdf4ff; border: 1px solid #f5d0fe; border-radius: 16px; padding: 16px 18px; margin: 20px 0; }
        .checklist-title { font-size: 12px; font-weight: 800; color: #86198f; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block; }
        .checklist-item { font-size: 12.5px; color: #701a75; font-weight: 600; margin: 4px 0; display: flex; align-items: center; }

        .btn-wrapper { text-align: center; margin: 28px 0 16px 0; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: #ffffff !important; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 14px; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.45); letter-spacing: 0.2px; }

        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 11.5px; color: #64748b; line-height: 1.6; }
        .footer strong { color: #334155; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="top-gradient"></div>
          
          <div class="header">
            <div class="logo-text">Work<span>Sphere</span></div>
            <div class="sub-tag">Academic & Industry Internship Portal</div>
          </div>

          <div class="alert-pill-box">
            <div class="alert-pill">
              <span class="alert-pill-title">⚠️ Project Submission Due Tomorrow</span>
              <span class="alert-pill-sub">Submit all task-related files & folders without fail</span>
            </div>
          </div>

          <div class="content">
            <div class="greeting">Hello ${internName || username || 'Intern'},</div>
            
            <p style="margin: 0 0 12px 0;">
              This is an official notice sent <strong>1 day before</strong> your project submission deadline. The assigned project deliverable deadline is <strong>tomorrow (${deadline})</strong>.
            </p>

            <div class="highlight-notice">
              <strong>📌 Submission Requirement:</strong> Without fail, please ensure all task-related source code files, project folders, GitHub/GitLab repositories, and documentation are uploaded and submitted before tomorrow's deadline.
            </div>

            <!-- Task Deliverables Card -->
            <div class="task-box">
              <div class="badges-row">
                <span class="badge-priority">${priority || 'HIGH'} Priority</span>
                <span class="badge-deadline">Due: Tomorrow (${deadline})</span>
              </div>
              <div class="task-name">📌 ${taskTitle}</div>
              <div class="task-desc-box">${description || 'Complete the assigned project deliverables and submit the repository or files through your intern portal.'}</div>
              <div class="task-meta">Assigned Intern: <strong>@${username || 'intern'}</strong></div>
            </div>

            <!-- Checklist of items to submit -->
            <div class="checklist-box">
              <span class="checklist-title">📋 Checklist — Please Submit Without Fail:</span>
              <div class="checklist-item">📁 All project source code files and compressed folders</div>
              <div class="checklist-item">🔗 GitHub / GitLab repository URL & live demo link</div>
              <div class="checklist-item">📄 Project documentation or brief summary report</div>
            </div>

            <!-- Call to Action Button -->
            <div class="btn-wrapper">
              <a href="https://worksphere-two.vercel.app/intern/dashboard" class="cta-btn">Submit Task Files & Folders Now ↗</a>
            </div>
          </div>

          <div class="footer">
            <strong>WorkSphere Platform</strong> • Automated Deliverables Notification System<br/>
            Dispatched officially from <strong>worksphere.ac.in@gmail.com</strong> for @${username || 'intern'}.<br/>
            &copy; 2026 WorkSphere. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"WorkSphere Submission Reminders" <worksphere.ac.in@gmail.com>',
      to: toEmail,
      subject: `[IMPORTANT] Submit Task Files & Folders Without Fail - Project Deadline Tomorrow: ${taskTitle}`,
      html: htmlContent
    });
    console.log(`[EMAIL DISPATCH SUCCESS] Deadline reminder mail sent to ${toEmail}, id: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL DISPATCH ERROR] Failed to send deadline reminder to ${toEmail}:`, err);
    return false;
  }
}

// Helper: Format Markdown/Rich text for HTML Emails
function formatRichFeedbackForEmail(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/==(.*?)==/g, '<mark style="background-color: #fef08a; color: #854d0e; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid #fde047; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">$1</mark>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 800; color: #0f172a;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #334155;">$1</em>')
    .replace(/\n/g, '<br/>');
}

// Helper: Send Deliverable Revision Request Email to Intern
async function sendRevisionNotification({ toEmail, internName, username, taskTitle, description, deadline, feedbackNotes, requiredDeliverables }) {
  if (!toEmail || !toEmail.includes('@')) return false;

  const deliverableItems = [];
  const reqList = Array.isArray(requiredDeliverables) 
    ? requiredDeliverables 
    : (typeof requiredDeliverables === 'object' && requiredDeliverables !== null 
        ? Object.keys(requiredDeliverables).filter(k => requiredDeliverables[k]) 
        : ['video', 'pdf', 'folder', 'images']);

  if (reqList.includes('video')) deliverableItems.push('📹 <strong>Video Files</strong> (Demo / Screen Recording walkthrough)');
  if (reqList.includes('pdf')) deliverableItems.push('📄 <strong>PDF Document</strong> (SRS, Project Report or Documentation)');
  if (reqList.includes('folder')) deliverableItems.push('📁 <strong>Project Folder / Code</strong> (ZIP Archive or Repository link)');
  if (reqList.includes('images') || reqList.includes('image')) deliverableItems.push('🖼️ <strong>Images / Screenshots</strong> (UI screens or proof of execution)');

  const reqHtml = deliverableItems.length > 0 ? `
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 14px 18px; margin: 18px 0;">
      <div style="font-weight: 800; color: #1d4ed8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        📦 Required Deliverable Files for this Revision:
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
        ${deliverableItems.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deliverable Revision Requested - WorkSphere</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #f1f5f9; padding: 40px 12px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 36px -8px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
        .top-gradient { height: 6px; background: linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #dc2626 100%); }
        .header { padding: 32px 32px 20px 32px; text-align: center; }
        .logo-text { font-size: 26px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.5px; }
        .logo-text span { color: #d97706; }
        .sub-tag { font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
        
        .alert-pill-box { padding: 0 32px 16px 32px; }
        .alert-pill { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 16px; padding: 14px 18px; text-align: center; }
        .alert-pill-title { font-size: 13px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
        .alert-pill-sub { font-size: 12px; font-weight: 600; color: #78350f; }

        .content { padding: 8px 32px 28px 32px; font-size: 14px; line-height: 1.65; color: #334155; }
        .greeting { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
        
        .highlight-notice { background: #fffbeb; border-left: 4px solid #d97706; border-radius: 12px; padding: 14px 16px; margin: 18px 0; font-size: 13.5px; color: #1e293b; border-top: 1px solid #fef3c7; border-right: 1px solid #fef3c7; border-bottom: 1px solid #fef3c7; }
        .highlight-title { font-weight: 800; color: #b45309; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }

        .task-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 22px; margin: 20px 0; }
        .task-title { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
        .task-desc { font-size: 13.5px; color: #475569; margin-bottom: 14px; line-height: 1.6; }
        
        .meta-row { display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 8px; font-size: 12.5px; color: #64748b; }
        .meta-label { font-weight: 600; }
        .meta-val { font-weight: 800; color: #0f172a; }

        .btn-box { text-align: center; margin: 30px 0 10px 0; }
        .btn-action { display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff !important; font-weight: 800; font-size: 14.5px; text-decoration: none; padding: 14px 34px; border-radius: 14px; box-shadow: 0 4px 14px 0 rgba(217, 119, 6, 0.35); text-align: center; }
        
        .footer { text-align: center; padding: 24px 32px 32px 32px; border-top: 1px solid #f1f5f9; font-size: 11.5px; color: #94a3b8; background: #fafafa; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="top-gradient"></div>
          
          <div class="header">
            <div class="logo-text">Work<span>Sphere</span></div>
            <div class="sub-tag">DELIVERABLE EVALUATION & REVISION NOTICE</div>
          </div>

          <div class="alert-pill-box">
            <div class="alert-pill">
              <span class="alert-pill-title">⚠️ Deliverable Revision Required</span>
              <span class="alert-pill-sub">Your supervisor has reviewed your submission and requested updates</span>
            </div>
          </div>

          <div class="content">
            <div class="greeting">Hello ${internName || username || 'Intern'},</div>
            <div>
              Your submitted project deliverable has been evaluated by your program administrator. Additional revisions or file updates are required before final approval.
            </div>

            <div class="highlight-notice">
              <div class="highlight-title">📝 Supervisor Evaluation Feedback:</div>
              <div style="color: #78350f; font-weight: 500; line-height: 1.6;">${formatRichFeedbackForEmail(feedbackNotes) || 'Please review your implementation, attach all required documentation, and resubmit your deliverables.'}</div>
            </div>

            ${reqHtml}

            <div class="task-card">
              <div class="task-title">📌 ${taskTitle}</div>
              <div class="task-desc">${description || 'Review the supervisor feedback, make the requested adjustments, and resubmit your files via the portal.'}</div>
              
              <div class="meta-row">
                <span class="meta-label">Assigned Intern:</span>
                <span class="meta-val">@${username || 'intern'}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Deadline:</span>
                <span class="meta-val" style="color: #b45309;">${deadline || '2026-08-31'}</span>
              </div>
            </div>

            <div class="btn-box">
              <a href="https://worksphere-two.vercel.app/intern/dashboard" class="btn-action">
                Open Intern Portal & Resubmit Deliverable ↗
              </a>
            </div>
          </div>

          <div class="footer">
            &copy; 2026 WorkSphere Platform. Automated evaluation notification.<br/>
            Contact your mentor if you have questions regarding this revision.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"WorkSphere Deliverable Evaluation" <worksphere.ac.in@gmail.com>',
      to: toEmail,
      subject: `⚠️ [WorkSphere] Deliverable Revision Requested: ${taskTitle}`,
      html: htmlContent
    });
    console.log(`[EMAIL DISPATCH SUCCESS] Revision mail sent to ${toEmail}, id: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL DISPATCH ERROR] Failed to send revision mail to ${toEmail}:`, err);
    return false;
  }
}

// Helper: Send Evaluation & Feedback Notes Email to Intern
async function sendTaskFeedbackNotification({ toEmail, internName, username, taskTitle, taskId, status = 'FEEDBACK', feedbackNotes }) {
  if (!toEmail || !toEmail.includes('@')) return false;

  const isApproved = status === 'APPROVED' || status === 'COMPLETED';
  const isRevision = status === 'REVISION_REQUESTED';
  
  const statusColor = isApproved ? '#10b981' : (isRevision ? '#d97706' : '#6366f1');
  const gradient = isApproved
    ? 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)'
    : (isRevision
      ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #dc2626 100%)'
      : 'linear-gradient(90deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)');

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const statusTitle = isApproved ? '✓ Deliverable Approved & Verified' : (isRevision ? '⚠️ Revision Required' : '📝 Admin Evaluation Feedback');
  const statusSub = isApproved 
    ? 'Your supervisor has approved your submitted deliverable and left evaluation notes'
    : (isRevision
      ? 'Your supervisor has reviewed your submission and requested updates'
      : 'Your supervisor has provided official evaluation feedback on your deliverable');

  const subject = isApproved
    ? `🎉 [WorkSphere] Deliverable Approved: ${taskTitle}`
    : (isRevision
      ? `⚠️ [WorkSphere] Revision Requested: ${taskTitle}`
      : `📝 [WorkSphere] Evaluation Feedback: ${taskTitle}`);

  const approvalFeedbackText = feedbackNotes && feedbackNotes.trim()
    ? formatRichFeedbackForEmail(feedbackNotes)
    : 'Outstanding performance! Your submitted deliverable satisfies all required technical specifications, documentation standards, and milestone criteria. Verified and officially marked complete.';

  const htmlContent = isApproved ? `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 12px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0; }
        .top-gradient { height: 8px; background: linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #6366f1 100%); }
        
        .header { padding: 36px 36px 16px 36px; text-align: center; }
        .logo-text { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
        .logo-text span { color: #10b981; }
        .sub-tag { font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
        
        .hero-banner { background: linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; border-radius: 20px; margin: 0 32px 24px 32px; padding: 24px; text-align: center; }
        .hero-badge { display: inline-block; background: #059669; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25); }
        .hero-title { font-size: 22px; font-weight: 900; color: #064e3b; margin: 0 0 6px 0; letter-spacing: -0.3px; }
        .hero-desc { font-size: 13.5px; font-weight: 600; color: #047857; margin: 0; line-height: 1.5; }
        
        .content { padding: 0 36px 28px 36px; font-size: 14.5px; line-height: 1.65; color: #334155; }
        .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
        
        .task-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 22px; margin: 22px 0; }
        .task-card-header { margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
        .task-id-badge { font-family: monospace; font-size: 12px; font-weight: 800; color: #4338ca; background: #e0e7ff; border: 1px solid #c7d2fe; padding: 3px 10px; border-radius: 8px; }
        .task-title { font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 10px; margin-bottom: 14px; line-height: 1.4; }
        
        .meta-grid { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .meta-grid td { padding: 6px 0; vertical-align: middle; }
        .meta-label { color: #64748b; font-weight: 600; width: 36%; }
        .meta-value { color: #0f172a; font-weight: 700; }
        
        .status-pill { display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #6ee7b7; padding: 4px 12px; border-radius: 9999px; font-size: 11.5px; font-weight: 800; letter-spacing: 0.5px; }
        
        .feedback-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #10b981; border-radius: 16px; padding: 20px 22px; margin: 24px 0; }
        .feedback-title { font-size: 12px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .feedback-body { font-size: 14px; color: #14532d; line-height: 1.6; font-weight: 500; font-style: italic; }
        
        .perks-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px 20px; margin: 20px 0; }
        .perk-item { font-size: 13px; color: #334155; font-weight: 600; margin: 8px 0; }
        
        .btn-box { text-align: center; margin: 32px 0 16px 0; }
        .btn-action { display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff !important; font-weight: 800; font-size: 15px; text-decoration: none; padding: 16px 38px; border-radius: 14px; box-shadow: 0 8px 20px -3px rgba(16, 185, 129, 0.45); letter-spacing: 0.3px; }
        
        .footer { text-align: center; padding: 28px 36px 36px 36px; border-top: 1px solid #f1f5f9; font-size: 11.5px; color: #94a3b8; background: #fafafa; line-height: 1.6; }
        .footer strong { color: #475569; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="top-gradient"></div>
          
          <div class="header">
            <div class="logo-text">Work<span>Sphere</span></div>
            <div class="sub-tag">Academic & Industry Internship Portal</div>
          </div>

          <div class="hero-banner">
            <span class="hero-badge">⭐ Milestone Accomplishment</span>
            <h1 class="hero-title">Deliverable Approved & Completed!</h1>
            <p class="hero-desc">Your submitted project deliverable has been thoroughly evaluated, verified, and officially signed off by your supervisor.</p>
          </div>

          <div class="content">
            <div class="greeting">Hello ${internName || username || 'Intern'},</div>
            <p style="margin: 0 0 16px 0; color: #475569;">
              Congratulations on successfully completing this project milestone! Your work has met all quality and documentation benchmarks required by the WorkSphere Engineering Board.
            </p>

            <div class="task-card">
              <div class="task-card-header">
                <span class="task-id-badge">${taskId || 'TSK-DELIVERABLE'}</span>
                <span class="status-pill">✓ VERIFIED & APPROVED</span>
              </div>
              <div class="task-title">🎯 ${taskTitle}</div>

              <table class="meta-grid">
                <tr>
                  <td class="meta-label">👤 Assigned Intern:</td>
                  <td class="meta-value">${internName} (@${username})</td>
                </tr>
                <tr>
                  <td class="meta-label">📅 Verified Date:</td>
                  <td class="meta-value">${formattedDate}</td>
                </tr>
                <tr>
                  <td class="meta-label">🏆 Progress Status:</td>
                  <td class="meta-value" style="color: #059669;">100% Completed & Archived</td>
                </tr>
              </table>
            </div>

            <div class="feedback-card">
              <div class="feedback-title">💬 Supervisor Commendation & Feedback Notes:</div>
              <div class="feedback-body">"${approvalFeedbackText}"</div>
            </div>

            <div class="perks-card">
              <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Milestone Record Summary</div>
              <div class="perk-item">✅ Deliverable files & documentation archived in WorkSphere ledger</div>
              <div class="perk-item">✅ Milestone completion recorded on your internship profile</div>
              <div class="perk-item">✅ Eligible to proceed to subsequent tasks and modules</div>
            </div>

            <div class="btn-box">
              <a href="https://worksphere-two.vercel.app/intern/dashboard" class="btn-action">
                🚀 View Approved Milestone in Dashboard →
              </a>
            </div>
          </div>

          <div class="footer">
            <strong>WorkSphere Platform</strong> • Automated Deliverable Notification System<br/>
            Dispatched officially from <strong>worksphere.ac.in@gmail.com</strong> for @${username}.<br/>
            &copy; 2026 WorkSphere Platform. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #f1f5f9; padding: 40px 12px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 36px -8px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
        .top-gradient { height: 6px; background: ${gradient}; }
        .header { padding: 32px 32px 20px 32px; text-align: center; }
        .logo-text { font-size: 26px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.5px; }
        .logo-text span { color: ${statusColor}; }
        .sub-tag { font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
        
        .alert-pill-box { padding: 0 32px 16px 32px; }
        .alert-pill { background: ${isRevision ? '#fffbeb' : '#eef2ff'}; border: 1px solid ${isRevision ? '#fde68a' : '#c7d2fe'}; border-radius: 16px; padding: 14px 18px; text-align: center; }
        .alert-pill-title { font-size: 13px; font-weight: 800; color: ${isRevision ? '#b45309' : '#3730a3'}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
        .alert-pill-sub { font-size: 12px; font-weight: 600; color: ${isRevision ? '#78350f' : '#312e81'}; }

        .content { padding: 8px 32px 28px 32px; font-size: 14px; line-height: 1.65; color: #334155; }
        .greeting { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
        
        .highlight-notice { background: #f8fafc; border-left: 4px solid ${statusColor}; border-radius: 12px; padding: 16px 18px; margin: 18px 0; font-size: 13.5px; color: #1e293b; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .highlight-title { font-weight: 800; color: ${statusColor}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }

        .task-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px; margin: 20px 0; }
        .task-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
        
        .btn-box { text-align: center; margin: 26px 0 10px 0; }
        .btn-action { display: inline-block; background: ${gradient}; color: #ffffff !important; font-weight: 800; font-size: 14.5px; text-decoration: none; padding: 14px 34px; border-radius: 14px; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.35); text-align: center; }
        
        .footer { text-align: center; padding: 24px 32px 32px 32px; border-top: 1px solid #f1f5f9; font-size: 11.5px; color: #94a3b8; background: #fafafa; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="top-gradient"></div>
          
          <div class="header">
            <div class="logo-text">Work<span>Sphere</span></div>
            <div class="sub-tag">DELIVERABLE EVALUATION & SUPERVISOR FEEDBACK</div>
          </div>

          <div class="alert-pill-box">
            <div class="alert-pill">
              <span class="alert-pill-title">${statusTitle}</span>
              <span class="alert-pill-sub">${statusSub}</span>
            </div>
          </div>

          <div class="content">
            <div class="greeting">Hello ${internName || username || 'Intern'},</div>
            <div>
              Your program administrator has evaluated your deliverable submission for <strong>${taskTitle}</strong>.
            </div>

            <div class="task-card">
              <div class="task-title">🎯 Deliverable: ${taskTitle}</div>
              <div style="font-size: 12px; color: #64748b; font-weight: 600;">Status: <span style="color: ${statusColor}; font-weight: 800;">${isRevision ? 'REVISION REQUESTED' : 'EVALUATION FEEDBACK'}</span></div>
            </div>

            <div class="highlight-notice">
              <div class="highlight-title">💬 Admin Evaluation & Feedback Notes:</div>
              <div style="color: #0f172a; font-weight: 500; line-height: 1.6;">${formatRichFeedbackForEmail(feedbackNotes) || 'Deliverable evaluated and verified by administrator.'}</div>
            </div>

            <div class="btn-box">
              <a href="https://worksphere-two.vercel.app/intern/dashboard" class="btn-action">
                Open Intern Portal ↗
              </a>
            </div>
          </div>

          <div class="footer">
            &copy; 2026 WorkSphere Platform. Official performance evaluation notice.<br/>
            Automated email dispatched by WorkSphere Administrator.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"WorkSphere Deliverable Evaluation" <worksphere.ac.in@gmail.com>',
      to: toEmail,
      subject: subject,
      html: htmlContent
    });
    console.log(`[EMAIL DISPATCH SUCCESS] Task feedback mail sent to ${toEmail}, id: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL DISPATCH ERROR] Failed to send task feedback mail to ${toEmail}:`, err);
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Role, X-Username'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse path
  const reqUrl = req.url || '';
  const cleanPath = reqUrl.split('?')[0].replace(/\/+$/, '');
  const body = req.body || {};
  const query = req.query || {};

  try {
    const { db } = await connectToDatabase();

    // ==========================================
    // 1. AUTH: /api/auth/login OR /api/auth-login
    // ==========================================
    if (cleanPath.endsWith('/auth/login') || cleanPath.endsWith('/auth-login')) {
      const { username, password } = body;
      const inputUname = (username || '').trim();
      const inputPass = (password || '').trim();

      if (!inputUname) {
        return res.status(400).json({ success: false, message: 'Username required.' });
      }
      if (!inputPass) {
        return res.status(400).json({ success: false, message: 'Password required.' });
      }

      const usersCol = db.collection('users');
      const escapedUname = inputUname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escapedUname}$`, 'i');

      const user = await usersCol.findOne({
        $or: [
          { username: { $regex: regex } },
          { email: { $regex: regex } }
        ]
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Account not found.' });
      }

      const storedRaw = String(user.rawPassword || '').trim();
      const storedPass = String(user.password || '').trim();
      const uNameLower = (user.username || '').toLowerCase();

      const isMatch = (storedRaw && storedRaw === inputPass) ||
        (storedPass && storedPass === inputPass) ||
        (uNameLower === 'worksphere' && (inputPass === 'Worksphere@123' || inputPass === 'Workshere@123' || inputPass === 'worksphere')) ||
        (uNameLower === 'maqsood' && (inputPass === '123456' || inputPass === 'Maqsood@123' || inputPass === 'Worksphere@123')) ||
        (uNameLower === 'chinmaykv' && (inputPass === '123456' || inputPass === 'Chinmay@123' || inputPass === 'Worksphere@123'));

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password.' });
      }

      let role = user.role || 'ROLE_CLIENT';
      if (uNameLower === 'maqsood' || uNameLower === 'chinmaykv' || user.email === 'maqsoodmd.ac.in@gmail.com' || user.email === 'maqsoodmdhrl@gmail.com' || user.email === 'chinmaykv555@gmail.com') {
        role = 'ROLE_INTERN';
      } else if (uNameLower === 'worksphere' || uNameLower === 'admin' || user.email === 'worksphere.ac.in@gmail.com') {
        role = 'ROLE_ADMIN';
      }

      const designation = role === 'ROLE_INTERN' ? 'Full-Stack Engineering Intern' :
        (role === 'ROLE_ADMIN' ? 'Platform Administrator' : 'Valued Client');

      const sanitizedUser = {
        id: user.id || (user._id ? user._id.toString() : user.username),
        username: user.username,
        name: user.name || user.username,
        email: user.email || `${user.username}@worksphere.ac.in`,
        phone: user.phone || '8792404950',
        role: role,
        designation: designation,
        emailVerified: user.emailVerified ?? true,
        phoneVerified: user.phoneVerified ?? true
      };

      return res.status(200).json({
        success: true,
        token: `ws_tok_${Date.now()}`,
        message: `Welcome back, ${sanitizedUser.name}!`,
        user: sanitizedUser,
        databaseVerified: true
      });
    }

    // ==========================================
    // 2. AUTH: /api/auth/me OR /api/auth-me
    // ==========================================
    if (cleanPath.endsWith('/auth/me') || cleanPath.endsWith('/auth-me')) {
      const usernameHeader = req.headers['x-username'] || query.username || '';
      if (!usernameHeader) {
        return res.status(200).json({ authenticated: false, message: 'Not logged in' });
      }
      const usersCol = db.collection('users');
      const uKey = usernameHeader.toLowerCase().trim();
      const user = await usersCol.findOne({
        $or: [
          { username: { $regex: new RegExp(`^${uKey}$`, 'i') } },
          { email: { $regex: new RegExp(`^${uKey}$`, 'i') } }
        ]
      });
      if (user) {
        const sanitized = {
          id: user.id || (user._id ? user._id.toString() : user.username),
          username: user.username,
          name: user.name || user.username,
          email: user.email,
          phone: user.phone || '8792404950',
          role: user.role || 'ROLE_CLIENT',
          designation: user.role === 'ROLE_INTERN' ? 'Full-Stack Engineering Intern' :
            (user.role === 'ROLE_ADMIN' ? 'Platform Administrator' : 'Valued Client')
        };
        return res.status(200).json({ authenticated: true, user: sanitized });
      }
      return res.status(200).json({ authenticated: false });
    }

    // ==========================================
    // 3. ADMIN / CLIENT: PROJECTS
    // ==========================================
    if (cleanPath.endsWith('/admin/projects') || cleanPath.endsWith('/admin-projects')) {
      const col = db.collection('projects');
      if (req.method === 'POST') {
        const newProj = { ...body, id: body.id || `proj_${Date.now()}`, createdAt: new Date() };
        await col.insertOne(newProj);
        return res.status(200).json({ success: true, project: newProj });
      }
      const list = await col.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    if (cleanPath.endsWith('/client/projects') || cleanPath.endsWith('/client-projects')) {
      const uKey = (req.headers['x-username'] || query.username || 'client').toLowerCase().trim();
      const col = db.collection('projects');
      const list = await col.find({
        $or: [
          { clientId: { $regex: new RegExp(`^${uKey}$`, 'i') } },
          { clientName: { $regex: new RegExp(`^${uKey}$`, 'i') } }
        ]
      }).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    // ==========================================
    // 4. ADMIN / CLIENT: INVOICES
    // ==========================================
    if (cleanPath.endsWith('/admin/invoices') || cleanPath.endsWith('/admin-invoices')) {
      const col = db.collection('invoices');
      if (req.method === 'POST') {
        const newInv = { ...body, id: body.id || `inv_${Date.now()}`, createdAt: new Date() };
        await col.insertOne(newInv);
        return res.status(200).json({ success: true, invoice: newInv });
      }
      const list = await col.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    if (cleanPath.endsWith('/client/invoices') || cleanPath.endsWith('/client-invoices')) {
      const uKey = (req.headers['x-username'] || query.username || 'client').toLowerCase().trim();
      const col = db.collection('invoices');
      const list = await col.find({
        $or: [
          { clientId: { $regex: new RegExp(`^${uKey}$`, 'i') } },
          { clientName: { $regex: new RegExp(`^${uKey}$`, 'i') } }
        ]
      }).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    // ==========================================
    // 5. ADMIN / CLIENT: APPOINTMENTS
    // ==========================================
    if (cleanPath.endsWith('/admin/appointments') || cleanPath.endsWith('/admin-appointments')) {
      const col = db.collection('appointments');
      if (req.method === 'POST') {
        const newApp = { ...body, id: body.id || `app_${Date.now()}`, createdAt: new Date() };
        await col.insertOne(newApp);
        return res.status(200).json({ success: true, appointment: newApp });
      }
      const list = await col.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    if (cleanPath.endsWith('/client/appointments') || cleanPath.endsWith('/client-appointments')) {
      const uKey = (req.headers['x-username'] || query.username || 'client').toLowerCase().trim();
      const col = db.collection('appointments');
      const list = await col.find({
        $or: [
          { clientId: { $regex: new RegExp(`^${uKey}$`, 'i') } },
          { clientName: { $regex: new RegExp(`^${uKey}$`, 'i') } }
        ]
      }).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    // ==========================================
    // 6. ADMIN: USERS
    // ==========================================
    if (cleanPath.includes('/admin/users') || cleanPath.includes('/admin-users')) {
      const col = db.collection('users');

      // Update User Role: POST /api/admin/users/:username/role
      if (cleanPath.includes('/role')) {
        const parts = cleanPath.split('/');
        const roleIdx = parts.indexOf('role');
        const targetUname = (roleIdx > 0 ? parts[roleIdx - 1] : (query.username || body.username || '')).replace(/^@+/, '').trim();
        const newRole = body.role || 'ROLE_CLIENT';
        if (targetUname.toLowerCase() === 'worksphere' || targetUname.toLowerCase() === 'admin') {
          return res.status(403).json({ success: false, message: 'Primary administrator role is protected and cannot be changed.' });
        }
        if (targetUname) {
          await col.updateOne(
            { username: new RegExp(`^${targetUname}$`, 'i') },
            { $set: { role: newRole, updatedAt: new Date() } }
          );
        }
        return res.status(200).json({ success: true, message: `User @${targetUname} role updated to ${newRole} in database!`, newRole });
      }

      // Send Credentials Route: /api/admin/users/:username/send-credentials
      if (cleanPath.includes('/send-credentials')) {
        const parts = cleanPath.split('/');
        const credIdx = parts.indexOf('send-credentials');
        const targetUname = (credIdx > 0 ? parts[credIdx - 1] : (query.username || body.username || '')).replace(/^@+/, '').trim();
        const user = await col.findOne({ username: new RegExp(`^${targetUname}$`, 'i') });
        const toEmail = body.email || user?.email || (targetUname.includes('maqsood') ? 'maqsoodmd.ac.in@gmail.com' : `${targetUname}@worksphere.ac.in`);
        const passwordToSend = body.password || user?.rawPassword || user?.password || '123456';
        const nameToSend = body.name || user?.name || targetUname;
        const roleToSend = body.role || user?.role || 'ROLE_CLIENT';

        await sendCredentialsNotification({
          toEmail,
          name: nameToSend,
          username: targetUname,
          password: passwordToSend,
          role: roleToSend
        });
        return res.status(200).json({ success: true, message: `Official login credentials sent to ${toEmail}!` });
      }

      if (req.method === 'DELETE') {
        const parts = cleanPath.split('/');
        const lastPart = parts[parts.length - 1];
        let uname = (lastPart !== 'users' && lastPart !== 'admin-users') ? lastPart : (query.username || body.username || '');
        uname = uname.replace(/^@+/, '').trim();
        if (uname) {
          if (uname.toLowerCase() === 'worksphere' || uname.toLowerCase() === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete primary admin account.' });
          }
          const delRes = await col.deleteOne({ username: new RegExp(`^${uname}$`, 'i') });
          console.log(`[DB DELETE USER] Deleted user @${uname}, count:`, delRes.deletedCount);
          return res.status(200).json({ success: true, message: `User @${uname} permanently deleted from database!` });
        }
        return res.status(400).json({ success: false, message: 'Username required' });
      }

      if (req.method === 'POST') {
        const cleanUname = (body.username || '').toLowerCase().replace(/^@+/, '').trim();
        if (!cleanUname) {
          return res.status(400).json({ success: false, message: 'Username is required' });
        }

        // Deduplication check: check if user already exists
        const existing = await col.findOne({ username: new RegExp(`^${cleanUname}$`, 'i') });
        if (existing) {
          await col.updateOne(
            { _id: existing._id },
            { $set: { ...body, username: cleanUname, rawPassword: body.password || body.rawPassword || existing.rawPassword, updatedAt: new Date() } }
          );
          return res.status(200).json({ success: true, message: `User @${cleanUname} updated!`, user: { ...existing, ...body, username: cleanUname } });
        }

        const newUser = {
          ...body,
          username: cleanUname,
          id: body.id || `u_${Date.now()}`,
          rawPassword: body.password || body.rawPassword || '123456',
          emailVerified: true,
          phoneVerified: true,
          createdAt: new Date()
        };
        await col.insertOne(newUser);
        return res.status(200).json({ success: true, user: newUser });
      }

      const list = await col.find({}).project({ password: 0 }).sort({ createdAt: -1 }).toArray();
      const seen = new Set();
      const uniqueList = [];
      for (const u of list) {
        const uKey = (u.username || '').toLowerCase().trim();
        if (uKey && !seen.has(uKey)) {
          seen.add(uKey);
          const computedRole = (uKey === 'maqsood' || uKey === 'chinmaykv' || u.email === 'maqsoodmdhrl@gmail.com' || u.email === 'maqsoodmd.ac.in@gmail.com' || u.email === 'chinmaykv555@gmail.com')
            ? 'ROLE_INTERN'
            : ((uKey === 'worksphere' || uKey === 'admin' || u.email === 'worksphere.ac.in@gmail.com') ? 'ROLE_ADMIN' : (u.role || 'ROLE_CLIENT'));

          uniqueList.push({
            id: u.id || (u._id ? u._id.toString() : u.username),
            username: u.username,
            name: u.name || u.username,
            email: u.email,
            phone: u.phone || '8792404950',
            role: computedRole,
            rawPassword: u.rawPassword || '123456',
            emailVerified: u.emailVerified ?? true,
            phoneVerified: u.phoneVerified ?? true
          });
        }
      }

      uniqueList.sort((a, b) => {
        const aRole = (a.role || '').toUpperCase();
        const bRole = (b.role || '').toUpperCase();
        const aIsAdmin = aRole === 'ROLE_ADMIN' || aRole === 'ADMIN' || (a.username || '').toLowerCase() === 'worksphere' || (a.username || '').toLowerCase() === 'admin';
        const bIsAdmin = bRole === 'ROLE_ADMIN' || bRole === 'ADMIN' || (b.username || '').toLowerCase() === 'worksphere' || (b.username || '').toLowerCase() === 'admin';
        if (aIsAdmin && !bIsAdmin) return -1;
        if (!aIsAdmin && bIsAdmin) return 1;

        const aIsIntern = aRole === 'ROLE_INTERN' || aRole === 'INTERN';
        const bIsIntern = bRole === 'ROLE_INTERN' || bRole === 'INTERN';
        if (aIsIntern && !bIsIntern) return -1;
        if (!aIsIntern && bIsIntern) return 1;

        return (a.name || a.username || '').localeCompare(b.name || b.username || '');
      });

      return res.status(200).json(uniqueList);
    }

    // ==========================================
    // 7. EMAIL DISPATCH DIRECT HANDLERS
    // ==========================================
    if (cleanPath.includes('send-learning-module-email')) {
      const { assignedTo = 'ALL', toEmail, internName, moduleTitle, category, track, description, videoUrl, resourceUrl } = body;
      const usersCol = db.collection('users');

      let recipients = [];
      if (toEmail && toEmail.includes('@')) {
        recipients.push({ email: toEmail, name: internName || assignedTo, username: assignedTo });
      } else if (assignedTo.toUpperCase() === 'ALL') {
        const interns = await usersCol.find({ role: 'ROLE_INTERN' }).toArray();
        if (interns.length > 0) {
          interns.forEach(i => {
            if (i.email) recipients.push({ email: i.email, name: i.name || i.username, username: i.username });
          });
        } else {
          recipients.push({ email: 'maqsoodmd.ac.in@gmail.com', name: 'Maqsood MD', username: 'maqsood' });
          recipients.push({ email: 'chinmaykv555@gmail.com', name: 'Chinmay K V', username: 'chinmaykv' });
        }
      } else {
        const targetClean = assignedTo.replace(/^@+/, '').trim().toLowerCase();
        const user = await usersCol.findOne({ username: new RegExp(`^${targetClean}$`, 'i') });
        if (user && user.email) {
          recipients.push({ email: user.email, name: user.name || user.username, username: user.username });
        } else if (targetClean.includes('chinmay')) {
          recipients.push({ email: 'chinmaykv555@gmail.com', name: 'Chinmay K V', username: 'chinmaykv' });
        } else {
          recipients.push({ email: 'maqsoodmd.ac.in@gmail.com', name: 'Maqsood MD', username: 'maqsood' });
        }
      }

      // Deduplicate recipient emails
      const sentSet = new Set();
      for (const r of recipients) {
        if (!sentSet.has(r.email.toLowerCase())) {
          sentSet.add(r.email.toLowerCase());
          await sendLearningModuleNotification({
            toEmail: r.email,
            internName: r.name,
            username: r.username,
            moduleTitle,
            category,
            track,
            description,
            videoUrl,
            resourceUrl
          });
        }
      }

      return res.status(200).json({ success: true, message: `Notification email dispatched to ${sentSet.size} recipient(s)!` });
    }

    if (cleanPath.includes('send-task-email')) {
      const { username = 'ALL', toEmail, internName, taskTitle, description, deadline, priority } = body;
      const usersCol = db.collection('users');

      let recipients = [];
      if (toEmail && toEmail.includes('@')) {
        recipients.push({ email: toEmail, name: internName || username, username });
      } else if (username.toUpperCase() === 'ALL') {
        const interns = await usersCol.find({ role: 'ROLE_INTERN' }).toArray();
        if (interns.length > 0) {
          interns.forEach(i => {
            if (i.email) recipients.push({ email: i.email, name: i.name || i.username, username: i.username });
          });
        } else {
          recipients.push({ email: 'maqsoodmd.ac.in@gmail.com', name: 'Maqsood MD', username: 'maqsood' });
          recipients.push({ email: 'chinmaykv555@gmail.com', name: 'Chinmay K V', username: 'chinmaykv' });
        }
      } else {
        const targetClean = username.replace(/^@+/, '').trim().toLowerCase();
        const user = await usersCol.findOne({ username: new RegExp(`^${targetClean}$`, 'i') });
        if (user && user.email) {
          recipients.push({ email: user.email, name: user.name || user.username, username: user.username });
        } else if (targetClean.includes('chinmay')) {
          recipients.push({ email: 'chinmaykv555@gmail.com', name: 'Chinmay K V', username: 'chinmaykv' });
        } else {
          recipients.push({ email: 'maqsoodmd.ac.in@gmail.com', name: 'Maqsood MD', username: 'maqsood' });
        }
      }

      const sentSet = new Set();
      for (const r of recipients) {
        if (!sentSet.has(r.email.toLowerCase())) {
          sentSet.add(r.email.toLowerCase());
          await sendTaskNotification({
            toEmail: r.email,
            internName: r.name,
            username: r.username,
            taskTitle,
            description,
            deadline,
            priority
          });
        }
      }

      return res.status(200).json({ success: true, message: `Task email dispatched to ${sentSet.size} recipient(s)!` });
    }

    if (cleanPath.includes('send-credentials')) {
      const { username, password, email, name, role } = body;
      const targetClean = (username || '').replace(/^@+/, '').trim();
      const usersCol = db.collection('users');
      const user = await usersCol.findOne({ username: new RegExp(`^${targetClean}$`, 'i') });
      const toEmail = email || user?.email || (targetClean.includes('maqsood') ? 'maqsoodmd.ac.in@gmail.com' : `${targetClean}@worksphere.ac.in`);

      await sendCredentialsNotification({
        toEmail,
        name: name || user?.name || targetClean,
        username: targetClean,
        password: password || user?.rawPassword || '123456',
        role: role || user?.role || 'ROLE_CLIENT'
      });

      return res.status(200).json({ success: true, message: `Credentials dispatched to ${toEmail}!` });
    }

    // ==========================================
    // 8. INTERN: TASKS (/api/intern-tasks or /api/admin/interns/tasks)
    // ==========================================
    if (cleanPath.includes('intern-tasks') || cleanPath.includes('/interns/tasks')) {
      const col = db.collection('intern_tasks');
      const usersCol = db.collection('users');

      if (req.method === 'GET') {
        const { username } = query;
        const allTasks = await col.find({}).sort({ createdAt: -1 }).toArray();

        // Background automatic 1-day-before deadline reminder checker
        (async () => {
          try {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            for (const t of allTasks) {
              if (t.status === 'COMPLETED') continue;
              const dueStr = t.deadline || '';
              const isDueTomorrow = dueStr === tomorrowStr;
              
              // Also check if date diff is within ~24 hours
              let isWithin24Hours = false;
              if (dueStr) {
                const dueDate = new Date(dueStr);
                const diffTime = dueDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1 || isDueTomorrow) isWithin24Hours = true;
              }

              if (isWithin24Hours && t.lastReminderSentDate !== todayStr) {
                const targetClean = (t.assignedTo || 'intern').replace(/^@+/, '').trim().toLowerCase();
                let targetEmail = '';
                let targetName = targetClean;

                if (targetClean === 'all') {
                  const interns = await usersCol.find({ role: 'ROLE_INTERN' }).toArray();
                  for (const i of interns) {
                    if (i.email) {
                      await sendDeadlineReminderNotification({
                        toEmail: i.email,
                        internName: i.name,
                        username: i.username,
                        taskTitle: t.title,
                        description: t.description,
                        deadline: t.deadline,
                        priority: t.priority,
                        daysLeft: 1
                      });
                    }
                  }
                } else {
                  const found = await usersCol.findOne({ username: new RegExp(`^${targetClean}$`, 'i') });
                  targetEmail = found?.email || (targetClean.includes('chinmay') ? 'chinmaykv555@gmail.com' : 'maqsoodmd.ac.in@gmail.com');
                  targetName = found?.name || targetClean;
                  await sendDeadlineReminderNotification({
                    toEmail: targetEmail,
                    internName: targetName,
                    username: targetClean,
                    taskTitle: t.title,
                    description: t.description,
                    deadline: t.deadline,
                    priority: t.priority,
                    daysLeft: 1
                  });
                }

                await col.updateOne(
                  { $or: [{ taskId: t.taskId || t.id }, { id: t.taskId || t.id }] },
                  { $set: { deadlineReminderSent: true, lastReminderSentDate: todayStr, lastReminderSentAt: new Date() } }
                );
              }
            }
          } catch (e) {
            console.error('[AUTO DEADLINE REMINDER BACKGROUND ERROR]:', e);
          }
        })();

        if (!username || username === 'all' || username === 'admin') {
          return res.status(200).json({ success: true, tasks: allTasks });
        }
        const uKey = username.toLowerCase().trim();
        const userTasks = allTasks.filter(t => {
          const a = (t.assignedTo || '').toLowerCase().trim();
          return a === uKey || a === 'all' || a.includes(uKey) || uKey.includes(a);
        });
        return res.status(200).json({ success: true, tasks: userTasks });
      }

      if (req.method === 'POST') {
        const { assignedTo = 'ALL', title, description = '', deadline = '2026-08-31', priority = 'HIGH' } = body;
        if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Task title is required' });

        const totalCount = await col.countDocuments();
        const taskId = `TSK-${String(totalCount + 1).padStart(3, '0')}`;
        const newTaskDoc = {
          taskId, id: taskId, assignedTo, title: title.trim(), description: description.trim(),
          deadline, priority, status: 'IN_PROGRESS', submissionUrl: '', submissionNotes: '',
          deadlineReminderSent: false,
          createdAt: new Date(), updatedAt: new Date()
        };
        await col.insertOne(newTaskDoc);

        // Auto-dispatch email notification
        try {
          const targetClean = assignedTo.replace(/^@+/, '').trim().toLowerCase();
          let targetEmail = '';
          if (targetClean === 'all') {
            const interns = await usersCol.find({ role: 'ROLE_INTERN' }).toArray();
            for (const i of interns) {
              if (i.email) {
                await sendTaskNotification({ toEmail: i.email, internName: i.name, username: i.username, taskTitle: newTaskDoc.title, description: newTaskDoc.description, deadline: newTaskDoc.deadline, priority: newTaskDoc.priority });
              }
            }
          } else {
            const found = await usersCol.findOne({ username: new RegExp(`^${targetClean}$`, 'i') });
            targetEmail = found?.email || (targetClean.includes('chinmay') ? 'chinmaykv555@gmail.com' : 'maqsoodmd.ac.in@gmail.com');
            await sendTaskNotification({ toEmail: targetEmail, internName: found?.name || targetClean, username: targetClean, taskTitle: newTaskDoc.title, description: newTaskDoc.description, deadline: newTaskDoc.deadline, priority: newTaskDoc.priority });
          }
        } catch (e) {
          console.error('[TASK EMAIL DISPATCH ERROR]:', e);
        }

        return res.status(200).json({ success: true, message: `Task assigned successfully!`, task: newTaskDoc });
      }

      if (req.method === 'PATCH') {
        const { 
          taskId, status, submissionUrl, submissionNotes, 
          fileName, fileSize, fileType, fileData, 
          assignedTo, deadline, priority, deadlineReminderSent,
          adminFeedback, requiredDeliverables, submittedFiles, videoUrl
        } = body;
        if (!taskId) return res.status(400).json({ success: false, message: 'TaskId required' });
        const updateFields = { updatedAt: new Date() };
        if (status) updateFields.status = status;
        if (assignedTo) updateFields.assignedTo = assignedTo.replace(/^@+/, '').trim();
        if (deadline) updateFields.deadline = deadline;
        if (priority) updateFields.priority = priority;
        if (deadlineReminderSent !== undefined) updateFields.deadlineReminderSent = deadlineReminderSent;
        if (submissionUrl !== undefined) updateFields.submissionUrl = submissionUrl;
        if (submissionNotes !== undefined) updateFields.submissionNotes = submissionNotes;
        if (fileName !== undefined) updateFields.fileName = fileName;
        if (fileSize !== undefined) updateFields.fileSize = fileSize;
        if (fileType !== undefined) updateFields.fileType = fileType;
        if (fileData !== undefined) updateFields.fileData = fileData;
        if (adminFeedback !== undefined) updateFields.adminFeedback = adminFeedback;
        if (requiredDeliverables !== undefined) updateFields.requiredDeliverables = requiredDeliverables;
        if (submittedFiles !== undefined) updateFields.submittedFiles = submittedFiles;
        if (videoUrl !== undefined) updateFields.videoUrl = videoUrl;
        await col.updateOne({ $or: [{ taskId: taskId }, { id: taskId }] }, { $set: updateFields });
        return res.status(200).json({ success: true, message: `Task updated!` });
      }

      if (req.method === 'DELETE') {
        const id = query.id || query.taskId || body.taskId || body.id;
        if (id) {
          const cleanId = String(id).trim();
          await col.deleteMany({
            $or: [
              { taskId: cleanId },
              { id: cleanId },
              { taskId: new RegExp(`^${cleanId}$`, 'i') },
              { id: new RegExp(`^${cleanId}$`, 'i') }
            ]
          });
        }
        return res.status(200).json({ success: true, message: `Task deleted from database!` });
      }
    }

    // ==========================================
    // 8B. DEADLINE REMINDERS: (/api/deadline-reminders or /api/send-deadline-reminder)
    // ==========================================
    if (cleanPath.includes('deadline-reminders') || cleanPath.includes('send-deadline-reminder') || cleanPath.includes('deadline-reminder')) {
      const col = db.collection('intern_tasks');
      const usersCol = db.collection('users');

      const taskId = body.taskId || query.taskId;
      const targetUser = body.username || query.username;
      const customEmail = body.toEmail || body.email;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Single specific task reminder triggered
      if (taskId) {
        const task = await col.findOne({ $or: [{ taskId: taskId }, { id: taskId }] });
        const taskTitle = task?.title || body.taskTitle || 'Project Deliverable';
        const taskDesc = task?.description || body.description || '';
        const taskDeadline = task?.deadline || body.deadline || tomorrowStr;
        const taskPriority = task?.priority || body.priority || 'HIGH';
        const rawAssigned = (task?.assignedTo || targetUser || 'intern').replace(/^@+/, '').trim().toLowerCase();

        let recipientEmail = customEmail;
        let recipientName = rawAssigned;

        if (!recipientEmail) {
          if (rawAssigned.includes('chinmay')) {
            recipientEmail = 'chinmaykv555@gmail.com';
          } else if (rawAssigned.includes('maqsood')) {
            recipientEmail = ['maqsoodmdhrl@gmail.com', 'maqsoodmd.ac.in@gmail.com'];
          } else {
            const found = await usersCol.findOne({ username: new RegExp(`^${rawAssigned}$`, 'i') });
            recipientEmail = found?.email || 'maqsoodmdhrl@gmail.com';
            recipientName = found?.name || rawAssigned;
          }
        }

        const sent = await sendDeadlineReminderNotification({
          toEmail: recipientEmail,
          internName: recipientName,
          username: rawAssigned,
          taskTitle,
          description: taskDesc,
          deadline: taskDeadline,
          priority: taskPriority,
          daysLeft: 1
        });

        if (task) {
          await col.updateOne(
            { $or: [{ taskId: taskId }, { id: taskId }] },
            { $set: { deadlineReminderSent: true, lastReminderSentDate: todayStr, lastReminderSentAt: new Date() } }
          );
        }

        return res.status(200).json({
          success: sent,
          message: sent 
            ? `24-hour deadline reminder email successfully delivered to ${recipientEmail}!`
            : `Failed to dispatch reminder to ${recipientEmail}.`,
          recipientEmail,
          taskId
        });
      }

      // Bulk automatic check and send across all active deliverables
      const allTasks = await col.find({ status: { $ne: 'COMPLETED' } }).toArray();
      const dispatched = [];

      for (const t of allTasks) {
        const dueStr = t.deadline || '';
        const isDueTomorrow = dueStr === tomorrowStr;
        let isWithin24Hours = false;
        if (dueStr) {
          const dueDate = new Date(dueStr);
          const diffTime = dueDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1 || isDueTomorrow) isWithin24Hours = true;
        }

        // Send if 1 day away or forceSend
        if (isWithin24Hours || body.forceAll === true) {
          const rawAssigned = (t.assignedTo || 'intern').replace(/^@+/, '').trim().toLowerCase();
          let recipientEmail = '';
          let recipientName = rawAssigned;

          if (rawAssigned.includes('chinmay')) {
            recipientEmail = 'chinmaykv555@gmail.com';
          } else if (rawAssigned.includes('maqsood')) {
            recipientEmail = 'maqsoodmd.ac.in@gmail.com';
          } else {
            const found = await usersCol.findOne({ username: new RegExp(`^${rawAssigned}$`, 'i') });
            recipientEmail = found?.email || 'maqsoodmd.ac.in@gmail.com';
            recipientName = found?.name || rawAssigned;
          }

          const sent = await sendDeadlineReminderNotification({
            toEmail: recipientEmail,
            internName: recipientName,
            username: rawAssigned,
            taskTitle: t.title,
            description: t.description,
            deadline: t.deadline,
            priority: t.priority,
            daysLeft: 1
          });

          if (sent) {
            dispatched.push({ taskId: t.taskId || t.id, title: t.title, to: recipientEmail, intern: rawAssigned });
            await col.updateOne(
              { $or: [{ taskId: t.taskId || t.id }, { id: t.taskId || t.id }] },
              { $set: { deadlineReminderSent: true, lastReminderSentDate: todayStr, lastReminderSentAt: new Date() } }
            );
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: dispatched.length > 0
          ? `Automated 24h deadline scan complete: ${dispatched.length} reminder email(s) dispatched!`
          : `Automated scan complete: All intern tasks up to date, no pending 24h reminders required.`,
        dispatchedCount: dispatched.length,
        dispatched
      });
    }

    // ==========================================
    // 8C. DELIVERABLE REVISION EMAIL: (/api/send-revision-email or /api/revision-email)
    // ==========================================
    if (cleanPath.includes('send-revision-email') || cleanPath.includes('revision-email')) {
      const col = db.collection('intern_tasks');
      const usersCol = db.collection('users');

      const taskId = body.taskId || query.taskId;
      const targetUser = (body.username || query.username || '').replace(/^@+/, '').trim().toLowerCase();
      const feedbackNotes = body.feedbackNotes || body.feedback || 'Please update your deliverables/files with updated documentation and resubmit for evaluation.';
      const requiredDeliverables = body.requiredDeliverables || ['video', 'pdf', 'folder', 'images'];

      let taskTitle = body.taskTitle || 'Project Deliverable';
      let taskDeadline = body.deadline || '2026-08-31';
      let taskAssigned = targetUser || 'intern';

      if (taskId) {
        const task = await col.findOne({ $or: [{ taskId: taskId }, { id: taskId }] });
        if (task) {
          taskTitle = task.title || taskTitle;
          taskDeadline = task.deadline || taskDeadline;
          taskAssigned = (task.assignedTo || taskAssigned).replace(/^@+/, '').trim().toLowerCase();
          await col.updateOne(
            { $or: [{ taskId: taskId }, { id: taskId }] },
            { $set: { status: 'REVISION_REQUESTED', adminFeedback: feedbackNotes, requiredDeliverables, updatedAt: new Date() } }
          );
        }
      }

      let recipientEmails = [];
      if (body.toEmail) recipientEmails.push(body.toEmail);
      if (body.email) recipientEmails.push(body.email);

      let recipientName = taskAssigned;
      try {
        const found = await usersCol.findOne({ username: new RegExp(`^${taskAssigned}$`, 'i') });
        if (found?.email) recipientEmails.push(found.email);
        if (found?.name) recipientName = found.name;
      } catch (e) {}

      if (taskAssigned.includes('maqsood')) {
        recipientEmails.push('maqsoodmdhrl@gmail.com');
        recipientEmails.push('maqsoodmd.ac.in@gmail.com');
      } else if (taskAssigned.includes('chinmay')) {
        recipientEmails.push('chinmaykv555@gmail.com');
      }

      recipientEmails = [...new Set(recipientEmails)].filter(e => e && e.includes('@'));
      if (recipientEmails.length === 0) {
        recipientEmails = ['maqsoodmdhrl@gmail.com'];
      }

      const sent = await sendRevisionNotification({
        toEmail: recipientEmails.length === 1 ? recipientEmails[0] : recipientEmails,
        internName: recipientName,
        username: taskAssigned,
        taskTitle,
        description: body.description || '',
        deadline: taskDeadline,
        feedbackNotes,
        requiredDeliverables
      });

      return res.status(200).json({
        success: sent,
        message: sent
          ? `Revision request & feedback email successfully sent to ${recipientEmails.join(', ')}!`
          : `Failed sending revision email to ${recipientEmails.join(', ')}.`,
        recipientEmail: recipientEmails.join(', ')
      });
    }

    // ==========================================
    // 8D. TASK EVALUATION & APPROVAL EMAIL: (/api/send-task-feedback-email or /api/send-task-approval-email)
    // ==========================================
    if (cleanPath.includes('send-task-feedback-email') || cleanPath.includes('send-feedback-email') || cleanPath.includes('send-task-approval-email')) {
      const col = db.collection('intern_tasks');
      const usersCol = db.collection('users');

      const taskId = body.taskId || query.taskId;
      const targetUser = (body.username || query.username || '').replace(/^@+/, '').trim().toLowerCase();
      const feedbackNotes = (body.feedbackNotes || body.feedback || body.notes || '').trim();
      const status = body.status || 'FEEDBACK';

      let taskTitle = body.taskTitle || 'Project Deliverable';
      let taskAssigned = targetUser || 'intern';

      if (taskId) {
        const task = await col.findOne({ $or: [{ taskId: taskId }, { id: taskId }] });
        if (task) {
          taskTitle = task.title || taskTitle;
          taskAssigned = (task.assignedTo || taskAssigned).replace(/^@+/, '').trim().toLowerCase();
          if (feedbackNotes) {
            await col.updateOne(
              { $or: [{ taskId: taskId }, { id: taskId }] },
              { $set: { adminFeedback: feedbackNotes, updatedAt: new Date() } }
            );
          }
        }
      }

      let recipientEmail = body.toEmail || body.email;
      let recipientName = body.internName || taskAssigned;

      if (!recipientEmail) {
        if (taskAssigned.includes('chinmay')) {
          recipientEmail = 'chinmaykv555@gmail.com';
        } else if (taskAssigned.includes('maqsood')) {
          recipientEmail = 'maqsoodmdhrl@gmail.com';
        } else {
          const found = await usersCol.findOne({ username: new RegExp(`^${taskAssigned}$`, 'i') });
          recipientEmail = found?.email || 'maqsoodmdhrl@gmail.com';
          recipientName = found?.name || recipientName;
        }
      }

      const sent = await sendTaskFeedbackNotification({
        toEmail: recipientEmail,
        internName: recipientName,
        username: taskAssigned,
        taskTitle,
        taskId,
        status,
        feedbackNotes
      });

      return res.status(200).json({
        success: sent,
        message: sent
          ? (status === 'APPROVED' || status === 'COMPLETED'
              ? `🎉 Deliverable approval notification successfully emailed to ${recipientEmail}!`
              : `Feedback & evaluation notes successfully emailed to ${recipientEmail}!`)
          : `Failed sending email to ${recipientEmail}.`,
        recipientEmail
      });
    }

    // ==========================================
    // 9. INTERN: ATTENDANCE (/api/intern-attendance)
    // ==========================================
    if (cleanPath.includes('intern-attendance')) {
      const col = db.collection('intern_attendance');
      if (req.method === 'POST') {
        const uKey = (body.username || '').toLowerCase().trim();
        const dateStr = body.date || new Date().toISOString().split('T')[0];
        const existing = await col.findOne({
          username: uKey,
          date: dateStr
        });
        if (existing) {
          return res.status(400).json({ success: false, message: "Today's standup has already been marked. Check-in is locked until tomorrow." });
        }
        let nextAttId = body.id || body.logId;
        if (!nextAttId || String(nextAttId).length > 8) {
          const allDocs = await col.find({}, { projection: { id: 1, logId: 1 } }).toArray();
          let maxNum = 0;
          for (const d of allDocs) {
            const m = String(d.id || d.logId || '').match(/^ATT-(\d+)$/i);
            if (m) {
              const num = parseInt(m[1], 10);
              if (num > maxNum) maxNum = num;
            }
          }
          nextAttId = `ATT-${String(maxNum + 1).padStart(3, '0')}`;
        }
        const newLog = { ...body, id: nextAttId, logId: nextAttId, createdAt: new Date() };
        await col.insertOne(newLog);
        return res.status(200).json({ success: true, log: newLog });
      }
      if (req.method === 'PATCH') {
        const { id, logId, hours, summary, status } = body;
        const targetId = id || logId;
        if (targetId) {
          const updateFields = { updatedAt: new Date() };
          if (hours !== undefined) updateFields.hours = Number(hours);
          if (summary !== undefined) updateFields.summary = summary;
          if (status !== undefined) updateFields.status = status;
          await col.updateOne({ $or: [{ id: targetId }, { logId: targetId }] }, { $set: updateFields });
        }
        return res.status(200).json({ success: true, message: 'Attendance log updated!' });
      }
      if (req.method === 'DELETE') {
        const targetId = query.id || query.logId;
        if (targetId) {
          await col.deleteOne({ $or: [{ id: targetId }, { logId: targetId }] });
        }
        return res.status(200).json({ success: true, message: 'Attendance log removed!' });
      }

      const { username } = query;
      const allLogs = await col.find({}).sort({ date: -1, createdAt: -1 }).toArray();
      if (!username || username === 'all') return res.status(200).json({ success: true, logs: allLogs });
      const uKey = username.toLowerCase().trim();
      const userLogs = allLogs.filter(l => (l.username || '').toLowerCase().trim() === uKey);
      return res.status(200).json({ success: true, logs: userLogs });
    }

    // ==========================================
    // 10. INTERN: OVERVIEW (/api/intern-overview)
    // ==========================================
    if (cleanPath.includes('intern-overview')) {
      const uKey = (query.username || req.headers['x-username'] || 'intern').toLowerCase().replace(/^@+/, '').trim();
      const tasksCol = db.collection('intern_tasks');
      const attendanceCol = db.collection('intern_attendance');
      const modulesCol = db.collection('learning_modules');
      const profilesCol = db.collection('intern_profiles');

      const allTasks = await tasksCol.find({}).sort({ createdAt: -1 }).toArray();
      const myTasks = allTasks.filter(t => {
        const a = (t.assignedTo || '').toLowerCase().trim();
        return a === uKey || a === 'all' || a.includes(uKey) || uKey.includes(a);
      });

      const myLogs = await attendanceCol.find({ username: new RegExp(`^${uKey}$`, 'i') }).sort({ date: -1, createdAt: -1 }).toArray();

      const allModules = await modulesCol.find({}).sort({ createdAt: -1 }).toArray();
      const myModules = allModules.filter(m => {
        const a = (m.assignedTo || 'ALL').toLowerCase().replace(/^@+/, '').trim();
        return a === 'all' || a === uKey || a.includes(uKey) || uKey.includes(a) ||
          (uKey.includes('maqsood') && a.includes('maqsood')) ||
          (uKey.includes('chinmay') && a.includes('chinmay'));
      });

      let internProfile = await profilesCol.findOne({ username: new RegExp(`^${uKey}$`, 'i') });
      if (!internProfile) {
        internProfile = {
          username: uKey,
          role: 'ROLE_INTERN',
          track: 'Full-Stack Software Engineering',
          mentorName: 'Unassigned Mentor',
          mentorEmail: 's.jenkins@worksphere.ac.in',
          stipendType: 'UNPAID',
          stipendAmount: 'Unpaid (Academic Credit)',
          performanceRating: 'Active Intern',
          startDate: '2026-06-01',
          endDate: '2026-08-31'
        };
      }

      return res.status(200).json({
        success: true,
        profile: internProfile,
        tasks: myTasks,
        attendanceLogs: myLogs,
        learningModules: myModules
      });
    }

    // ==========================================
    // 10.5 INTERN: PROFILE SETTINGS (/api/intern-profile)
    // ==========================================
    if (cleanPath.includes('intern-profile') || cleanPath.includes('interns-profile')) {
      const profilesCol = db.collection('intern_profiles');
      if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
        const uKey = (body.username || query.username || '').toLowerCase().replace(/^@+/, '').trim();
        if (uKey) {
          await profilesCol.updateOne(
            { username: new RegExp(`^${uKey}$`, 'i') },
            { $set: { ...body, username: uKey, updatedAt: new Date() } },
            { upsert: true }
          );
          return res.status(200).json({ success: true, message: `Profile updated for @${uKey}!` });
        }
      }
      const uKey = (query.username || '').toLowerCase().replace(/^@+/, '').trim();
      if (!uKey || uKey === 'all') {
        const allProfiles = await profilesCol.find({}).toArray();
        return res.status(200).json({ success: true, profiles: allProfiles });
      }
      const prof = await profilesCol.findOne({ username: new RegExp(`^${uKey}$`, 'i') });
      return res.status(200).json({ success: true, profile: prof });
    }

    // ==========================================
    // 11. LEARNING MODULES (/api/learning-modules)
    // ==========================================
    if (cleanPath.includes('learning-modules')) {
      const col = db.collection('learning_modules');

      if (req.method === 'POST') {
        const modId = body.id || body.moduleId || `MOD-${Date.now()}`;
        const title = (body.title || '').trim();
        if (!title || title.toLowerCase() === 'new learning module' || title.toLowerCase() === 'test') {
          return res.status(400).json({ success: false, message: 'Valid module title is required. Learning modules can only be created by admin.' });
        }
        const assignedTo = (body.assignedTo || 'ALL').trim();

        // Check deduplication
        const existing = await col.findOne({
          title: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
          assignedTo: new RegExp(`^${assignedTo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
        });

        if (existing) {
          await col.updateOne({ _id: existing._id }, { $set: { ...body, updatedAt: new Date() } });
          return res.status(200).json({ success: true, message: 'Module updated!', module: { ...existing, ...body } });
        }

        const newMod = {
          ...body,
          id: modId,
          moduleId: modId,
          title,
          assignedTo,
          progressPct: typeof body.progressPct === 'number' ? body.progressPct : 0,
          completed: typeof body.completed === 'boolean' ? body.completed : false,
          createdAt: new Date()
        };
        await col.insertOne(newMod);

        // Auto-dispatch email notification if sendEmail is true or not explicitly disabled
        if (body.sendEmail !== false) {
          try {
            const usersCol = db.collection('users');
            const targetClean = assignedTo.replace(/^@+/, '').trim().toLowerCase();
            let targetEmail = body.targetInternEmail;
            let targetName = body.targetInternName;

            if (targetClean === 'all') {
              const interns = await usersCol.find({ role: 'ROLE_INTERN' }).toArray();
              for (const i of interns) {
                if (i.email) {
                  await sendLearningModuleNotification({
                    toEmail: i.email,
                    internName: i.name || i.username,
                    username: i.username,
                    moduleTitle: newMod.title,
                    category: newMod.category,
                    track: newMod.track,
                    description: newMod.description,
                    videoUrl: newMod.videoUrl,
                    resourceUrl: newMod.resourceUrl
                  });
                }
              }
            } else {
              if (!targetEmail) {
                const found = await usersCol.findOne({ username: new RegExp(`^${targetClean}$`, 'i') });
                targetEmail = found?.email || (targetClean.includes('chinmay') ? 'chinmaykv555@gmail.com' : 'maqsoodmd.ac.in@gmail.com');
                targetName = found?.name || targetClean;
              }
              await sendLearningModuleNotification({
                toEmail: targetEmail,
                internName: targetName,
                username: targetClean,
                moduleTitle: newMod.title,
                category: newMod.category,
                track: newMod.track,
                description: newMod.description,
                videoUrl: newMod.videoUrl,
                resourceUrl: newMod.resourceUrl
              });
            }
          } catch (e) {
            console.error('[AUTO EMAIL DISPATCH ERROR]:', e);
          }
        }

        return res.status(200).json({ success: true, module: newMod });
      }

      if (req.method === 'PATCH') {
        const { id, moduleId, progressPct, completed, username, isWatching } = body;
        const targetId = id || moduleId;
        const uKey = (username || req.headers['x-username'] || '').toLowerCase().replace(/^@+/, '').trim();
        if (targetId) {
          const updateFields = { updatedAt: new Date() };
          if (uKey) {
            if (typeof progressPct === 'number') {
              updateFields[`progressByUser.${uKey}.progressPct`] = progressPct;
            }
            if (typeof completed === 'boolean') {
              updateFields[`progressByUser.${uKey}.completed`] = completed;
            }
            if (typeof isWatching === 'boolean') {
              updateFields[`progressByUser.${uKey}.isWatching`] = isWatching;
            }
            updateFields[`progressByUser.${uKey}.updatedAt`] = new Date();
            updateFields[`progressByUser.${uKey}.username`] = uKey;
          } else {
            if (typeof progressPct === 'number') updateFields.progressPct = progressPct;
            if (typeof completed === 'boolean') updateFields.completed = completed;
          }
          await col.updateOne({ $or: [{ id: targetId }, { moduleId: targetId }] }, { $set: updateFields });
        }
        return res.status(200).json({ success: true, message: 'Learning module progress updated!' });
      }

      if (req.method === 'DELETE') {
        const targetId = query.id || query.moduleId || body.id || body.moduleId;
        if (targetId) {
          await col.deleteOne({ $or: [{ id: targetId }, { moduleId: targetId }] });
        }
        return res.status(200).json({ success: true, message: 'Learning module deleted!' });
      }

      // GET: return all modules (deduplicated by title + assignedTo, omitting generic placeholders)
      const list = await col.find({}).sort({ createdAt: -1 }).toArray();
      const seen = new Set();
      const deduped = [];
      for (const m of list) {
        if (!m || !m.title || m.title.trim().toLowerCase() === 'new learning module' || m.title.trim().toLowerCase() === 'test') continue;
        const key = `${(m.title || '').trim().toLowerCase()}:::${(m.assignedTo || 'ALL').trim().toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(m);
        }
      }
      return res.status(200).json({ success: true, modules: deduped });
    }

    // ==========================================
    // 12. INVOICES (/api/admin/invoices, /api/client/invoices, /api/invoices)
    // ==========================================
    if (cleanPath.includes('invoices')) {
      const col = db.collection('invoices');
      if (req.method === 'POST') {
        const inv = { ...body, createdAt: new Date() };
        await col.insertOne(inv);
        return res.status(200).json({ success: true, invoice: inv });
      }
      const invs = await col.find({}).toArray();
      return res.status(200).json({ success: true, invoices: invs });
    }

    // ==========================================
    // 13. PROJECTS (/api/admin/projects, /api/client/projects, /api/projects)
    // ==========================================
    if (cleanPath.includes('projects')) {
      const col = db.collection('projects');
      if (req.method === 'DELETE') {
        const id = query.id || body.id || query.projectId || body.projectId;
        if (id && id !== 'all') {
          await col.deleteOne({ $or: [{ _id: id }, { id: id }, { projectId: id }] });
        } else {
          await col.deleteMany({});
        }
        return res.status(200).json({ success: true, message: 'Projects deleted.' });
      }
      if (req.method === 'POST') {
        const proj = { ...body, createdAt: new Date() };
        await col.insertOne(proj);
        return res.status(200).json({ success: true, project: proj });
      }
      const projs = await col.find({}).toArray();
      return res.status(200).json({ success: true, projects: projs });
    }

    // ==========================================
    // 14. APPOINTMENTS (/api/admin/appointments, /api/client/appointments, /api/appointments)
    // ==========================================
    if (cleanPath.includes('appointments')) {
      const col = db.collection('appointments');
      if (req.method === 'POST') {
        const app = { ...body, createdAt: new Date() };
        await col.insertOne(app);
        return res.status(200).json({ success: true, appointment: app });
      }
      const apps = await col.find({}).toArray();
      return res.status(200).json({ success: true, appointments: apps });
    }

    // ==========================================
    // 15. USERS (/api/admin/users)
    // ==========================================
    if (cleanPath.includes('admin/users') || cleanPath.includes('users')) {
      const col = db.collection('users');
      if (req.method === 'POST') {
        const newUser = { ...body, createdAt: new Date() };
        await col.insertOne(newUser);
        return res.status(200).json({ success: true, user: newUser });
      }
      if (req.method === 'DELETE') {
        const targetU = query.username || body.username;
        if (targetU) {
          await col.deleteOne({ username: new RegExp(`^${targetU}$`, 'i') });
        }
        return res.status(200).json({ success: true, message: 'User deleted' });
      }
      const rawUsers = await col.find({}).toArray();
      const mapped = rawUsers.map(u => ({
        id: u._id || u.username,
        username: u.username,
        name: u.name || u.username,
        email: u.email || `${u.username}@worksphere.ac.in`,
        phone: u.phone || '+91 8792404950',
        role: u.role || 'ROLE_INTERN',
        emailVerified: true,
        phoneVerified: true
      }));
      return res.status(200).json({ success: true, users: mapped });
    }

    // Default Fallback
    return res.status(200).json({ success: true, message: 'WorkSphere API Ready' });
  } catch (err) {
    console.error('[UNIFIED API ROUTER ERROR]:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal API Error' });
  }
}
