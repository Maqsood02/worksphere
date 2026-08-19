import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Allow CORS
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
    const {
      toEmail,
      internName,
      username,
      assignedTo,
      moduleTitle,
      category = 'Engineering',
      track = 'ALL Tracks',
      description = '',
      videoUrl = '',
      resourceUrl = ''
    } = req.body || {};

    const targetUser = (assignedTo || username || 'ALL').toString().trim();
    const uLower = targetUser.toLowerCase().replace(/^@+/, '');
    const recipients = [];

    if (toEmail && toEmail.includes('@')) {
      recipients.push(toEmail);
    } else if (uLower === 'all') {
      recipients.push('maqsoodmd.ac.in@gmail.com');
      recipients.push('chinmaykv555@gmail.com');
    } else if (uLower.includes('chinmay')) {
      recipients.push('chinmaykv555@gmail.com');
    } else if (uLower.includes('maqsood')) {
      recipients.push('maqsoodmd.ac.in@gmail.com');
    } else {
      recipients.push('maqsoodmd.ac.in@gmail.com');
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'worksphere.ac.in@gmail.com',
        pass: 'mbtfgehiiejzwtzk'
      }
    });

    const isDirectAssignment = uLower !== 'all';
    const targetLabel = isDirectAssignment ? `@${targetUser}` : 'All Interns';
    const recipientDisplayName = internName || (uLower.includes('chinmay') ? 'Chinmay K V' : (uLower.includes('maqsood') ? 'Maqsood MD' : 'WorkSphere Intern'));

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>WorkSphere Learning Module Notification</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 40px 15px; color: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #131c2e, #0b0f19); border-radius: 28px; border: 1px solid #283654; padding: 40px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
              .logo-box { text-align: center; margin-bottom: 24px; }
              .logo-title { font-size: 30px; font-weight: 900; background: linear-gradient(to right, #06b6d4, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
              .tagline { font-size: 10px; font-weight: 800; color: #06b6d4; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
              .badge-banner { text-align: center; margin-bottom: 24px; }
              .target-badge { display: inline-block; background: rgba(99, 102, 241, 0.18); border: 1px solid #6366f1; color: #a5b4fc; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 6px 18px; border-radius: 9999px; letter-spacing: 1px; }
              .greeting { font-size: 19px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
              .text { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
              
              .module-card { background: #090e1a; border: 1px solid #3b82f6; border-radius: 20px; padding: 24px; margin: 24px 0; box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2); }
              .category-pill { display: inline-block; background: #1e3a8a; border: 1px solid #2563eb; color: #60a5fa; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; }
              .track-pill { display: inline-block; background: #312e81; border: 1px solid #4338ca; color: #c7d2fe; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; margin-left: 6px; }
              .module-title { font-size: 20px; font-weight: 800; color: #38bdf8; margin-bottom: 12px; line-height: 1.4; }
              .module-desc { font-size: 13px; color: #cbd5e1; line-height: 1.6; background: #131c2e; padding: 16px; border-radius: 12px; border-left: 4px solid #6366f1; margin-bottom: 18px; }
              
              .resource-section { background: rgba(30, 41, 59, 0.6); border: 1px solid #1e293b; border-radius: 14px; padding: 14px 18px; margin: 12px 0; }
              .resource-item { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #cbd5e1; margin: 6px 0; }
              .resource-link { color: #38bdf8; font-weight: 700; text-decoration: none; word-break: break-all; }
              
              .btn-box { text-align: center; margin: 32px 0 20px 0; }
              .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #06b6d4); color: #ffffff !important; font-weight: 800; font-size: 15px; text-decoration: none; padding: 16px 36px; border-radius: 14px; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5); }
              .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo-box">
                  <div class="logo-title">WorkSphere</div>
                  <div class="tagline">CONNECT • COLLABORATE • SUCCEED</div>
              </div>
              
              <div class="badge-banner">
                  <span class="target-badge">
                      ${isDirectAssignment ? `⭐ ASSIGNED TO ${targetLabel.toUpperCase()}` : '📢 NEW CURRICULUM MODULE PUBLISHED'}
                  </span>
              </div>

              <div class="greeting">Hello ${recipientDisplayName},</div>
              <div class="text">
                  Your program administrator & mentor has published a new <strong>Learning Module & Video Resource</strong> to your Intern Portal curriculum backlog. Review the module overview and resources below:
              </div>

              <div class="module-card">
                  <div>
                      <span class="category-pill">${category}</span>
                      <span class="track-pill">${track}</span>
                  </div>
                  
                  <div class="module-title">🎓 ${moduleTitle || 'New Learning Module'}</div>
                  
                  ${description ? `<div class="module-desc">${description}</div>` : ''}

                  <div class="resource-section">
                      ${videoUrl ? `
                      <div style="padding: 6px 0; font-size: 13px; color: #f8fafc;">
                          ▶️ <strong>Interactive Video:</strong> 
                          <a href="${videoUrl.startsWith('http') ? videoUrl : `https://www.youtube.com/watch?v=${videoUrl}`}" target="_blank" style="color: #f43f5e; font-weight: 700; text-decoration: underline; margin-left: 4px;">
                              Watch on YouTube &rarr;
                          </a>
                      </div>
                      ` : ''}

                      ${resourceUrl ? `
                      <div style="padding: 6px 0; font-size: 13px; color: #f8fafc;">
                          📚 <strong>Documentation / GitHub:</strong> 
                          <a href="${resourceUrl}" target="_blank" style="color: #38bdf8; font-weight: 700; text-decoration: underline; margin-left: 4px;">
                              Open Resource Docs &rarr;
                          </a>
                      </div>
                      ` : ''}

                      <div style="padding: 6px 0; font-size: 12px; color: #94a3b8;">
                          🎯 <strong>Assigned Target:</strong> <span style="color: #a5b4fc; font-weight: 700;">${targetLabel}</span>
                      </div>
                  </div>
              </div>

              <div class="btn-box">
                  <a href="https://worksphere-two.vercel.app/intern/dashboard" class="btn" target="_blank">
                      🚀 Open Intern Portal & Start Learning &rarr;
                  </a>
              </div>

              <div class="footer">
                  &copy; 2026 <strong>WorkSphere Platform</strong>. All rights reserved. <br/>
                  Official Automated Notification Sender: worksphere.ac.in@gmail.com
              </div>
          </div>
      </body>
      </html>
    `;

    const uniqueRecipients = [...new Set(recipients)];
    for (const recipient of uniqueRecipients) {
      await transporter.sendMail({
        from: '"WorkSphere Learning Curriculum" <worksphere.ac.in@gmail.com>',
        to: recipient,
        subject: `🎓 [WorkSphere] New Learning Module Assigned: ${moduleTitle || 'Curriculum Update'}`,
        html
      });
    }

    return res.status(200).json({
      success: true,
      message: `Learning module email dispatched to ${uniqueRecipients.join(', ')}`,
      recipients: uniqueRecipients
    });
  } catch (error) {
    console.error('[LEARNING MODULE EMAIL ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch learning module email'
    });
  }
}
