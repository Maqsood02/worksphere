import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Allow CORS for Vercel Serverless API
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { toEmail, internName, username, taskTitle, description, deadline, priority } = req.body || {};

    const uLower = (username || '').toLowerCase();
    const recipients = [];
    
    if (toEmail && toEmail.includes('@')) {
      recipients.push(toEmail);
    } else if (uLower === 'all') {
      recipients.push('maqsoodmd.ac.in@gmail.com');
      recipients.push('chinmaykv555@gmail.com');
    } else if (uLower.includes('chinmay')) {
      recipients.push('chinmaykv555@gmail.com');
    } else {
      recipients.push('maqsoodmd.ac.in@gmail.com');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'worksphere.ac.in@gmail.com',
        pass: 'mbtfgehiiejzwtzk'
      }
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 15px; color: #f8fafc; }
              .container { max-width: 580px; margin: 0 auto; background: linear-gradient(145deg, #1e293b, #0f172a); border-radius: 24px; border: 1px solid #334155; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
              .logo-box { text-align: center; margin-bottom: 28px; }
              .logo-title { font-size: 28px; font-weight: 800; background: linear-gradient(to right, #06b6d4, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
              .tagline { font-size: 10px; font-weight: 700; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
              .greeting { font-size: 18px; font-weight: 700; color: #f1f5f9; margin-bottom: 12px; }
              .text { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
              .task-card { background: rgba(30, 41, 59, 0.8); border: 1px solid #3b82f6; border-radius: 18px; padding: 24px; margin: 24px 0; }
              .task-title { font-size: 18px; font-weight: 800; color: #38bdf8; margin-bottom: 8px; }
              .task-badge { display: inline-block; background: #6366f1; color: #ffffff; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 14px; }
              .task-desc { font-size: 13px; color: #cbd5e1; line-height: 1.6; background: #0f172a; padding: 14px; border-radius: 10px; border-left: 3px solid #3b82f6; margin-bottom: 16px; }
              .info-table { width: 100%; font-size: 12px; color: #94a3b8; }
              .info-table td { padding: 6px 0; }
              .info-table td.val { color: #f8fafc; font-weight: 700; text-align: right; }
              .btn-box { text-align: center; margin: 32px 0 20px 0; }
              .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #3b82f6); color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 14px; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5); }
              .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #334155; font-size: 11px; color: #64748b; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo-box">
                  <div class="logo-title">WorkSphere</div>
                  <div class="tagline">SPRINT TASK ASSIGNMENT NOTIFICATION</div>
              </div>
              <div class="greeting">Hello ${internName || username || 'Intern'},</div>
              <div class="text">Your program administrator & mentor has assigned a new deliverable to your intern backlog portal. Please review the task details below:</div>

              <div class="task-card">
                  <div class="task-badge">PRIORITY: ${priority || 'HIGH'}</div>
                  <div class="task-title">📋 ${taskTitle || 'New Deliverable Task'}</div>
                  <div class="task-desc">${description || 'No additional notes provided.'}</div>

                  <table class="info-table">
                      <tr>
                          <td>Assigned Intern:</td>
                          <td class="val">@${username || 'intern'}</td>
                      </tr>
                      <tr>
                          <td>Submission Deadline:</td>
                          <td class="val" style="color: #fbbf24;">${deadline || '2026-08-31'}</td>
                      </tr>
                      <tr>
                          <td>Portal Status:</td>
                          <td class="val" style="color: #38bdf8;">IN PROGRESS</td>
                      </tr>
                  </table>
              </div>

              <div class="btn-box">
                  <a href="https://worksphere-two.vercel.app/login" class="btn">Open Intern Portal & Submit Deliverable ↗</a>
              </div>

              <div class="footer">
                  &copy; 2026 WorkSphere Platform. All rights reserved. <br/>
                  This is an automated notification sent from worksphere.ac.in@gmail.com
              </div>
          </div>
      </body>
      </html>
    `;

    for (const recipient of recipients) {
      await transporter.sendMail({
        from: '"WorkSphere Sprint Backlog" <worksphere.ac.in@gmail.com>',
        to: recipient,
        subject: `📋 [WorkSphere Task] New Deliverable Assigned: ${taskTitle || 'Deliverable'}`,
        html
      });
      console.log('[EMAIL SUCCESS] Dispatched to:', recipient);
    }

    return res.status(200).json({
      success: true,
      message: `Task notification email dispatched successfully to ${recipients.join(', ')}!`
    });
  } catch (error) {
    console.error('[EMAIL ERROR] Failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch email'
    });
  }
}
