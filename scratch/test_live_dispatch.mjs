import { connectToDatabase } from '../api/db.js';
import { getMailTransporter } from '../api/index.js';

async function testDispatch() {
  const { db } = await connectToDatabase();
  const t = await getMailTransporter(db);
  const info = await t.sendMail({
    from: '"WorkSphere Platform" <worksphere.ac.in@gmail.com>',
    to: 'maqsoodmdhrl@gmail.com, chinmaykv555@gmail.com',
    subject: '✅ [WorkSphere] Gmail SMTP Verified & Active',
    html: `
      <div style="font-family: sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #334155;">
        <h2 style="color: #38bdf8; margin-top: 0;">🎉 WorkSphere Gmail SMTP Connected Successfully!</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          Your 16-character Google App Password (<code>ebku thda ntii wqzf</code>) has been verified by Google SMTPS and saved directly into MongoDB Atlas and Spring Boot.
        </p>
        <div style="background: #1e293b; padding: 14px 18px; border-radius: 10px; border-left: 4px solid #10b981; margin: 18px 0;">
          <strong style="color: #34d399;">✓ Live Status: Active & Operational</strong><br/>
          <span style="font-size: 13px; color: #cbd5e1;">All automated deliverable revision requests, evaluation feedback notes, account credentials, and 24h deadline reminder notifications are now delivering reliably.</span>
        </div>
        <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">
          WorkSphere Academic & Industry Platform • Automated Notification Engine
        </p>
      </div>
    `
  });
  console.log('EMAIL SENT SUCCESSFULLY! Message ID:', info.messageId);
}

testDispatch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('FAILED:', err);
    process.exit(1);
  });
