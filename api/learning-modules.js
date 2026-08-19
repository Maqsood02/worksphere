import { connectToDatabase } from './db.js';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
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

  try {
    const { db } = await connectToDatabase();
    const modulesCol = db.collection('learning_modules');

    // 1. GET ALL / FILTERED MODULES
    if (req.method === 'GET') {
      const { username, track } = req.query || {};
      const allModules = await modulesCol.find({}).sort({ createdAt: -1 }).toArray();

      if (!username || username === 'all' || username === 'admin') {
        return res.status(200).json({ success: true, modules: allModules });
      }

      const uKey = username.toLowerCase().replace(/^@+/, '').trim();
      const filtered = allModules.filter(m => {
        const a = (m.assignedTo || 'ALL').toLowerCase().replace(/^@+/, '').trim();
        const matchesUser = a === 'all' || a === uKey || a.includes(uKey) || uKey.includes(a) ||
          (uKey.includes('chinmay') && a.includes('chinmay')) ||
          (uKey.includes('maqsood') && a.includes('maqsood'));
        
        const matchesTrack = !m.track || m.track === 'ALL' || m.track === 'ALL Tracks' || (track && m.track.toLowerCase() === track.toLowerCase());
        return matchesUser || matchesTrack;
      });

      return res.status(200).json({ success: true, modules: filtered });
    }

    // 2. CREATE NEW LEARNING MODULE (POST) + DISPATCH EMAIL
    if (req.method === 'POST') {
      const body = req.body || {};
      const {
        title,
        category = 'Engineering',
        track = 'ALL Tracks',
        assignedTo = 'ALL',
        targetInternEmail = '',
        targetInternName = '',
        description = '',
        videoUrl = '',
        resourceUrl = '',
        sendEmail = true
      } = body;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Module title is required' });
      }

      const totalCount = await modulesCol.countDocuments();
      const modId = `MOD-${String(totalCount + 1).padStart(3, '0')}`;
      const newModuleDoc = {
        id: modId,
        moduleId: modId,
        title: title.trim(),
        category,
        track,
        assignedTo: assignedTo || 'ALL',
        targetInternEmail,
        targetInternName,
        description: description.trim(),
        videoUrl: videoUrl.trim(),
        resourceUrl: resourceUrl.trim(),
        progressPct: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await modulesCol.insertOne(newModuleDoc);

      // Optionally dispatch email directly
      if (sendEmail) {
        try {
          const targetUser = (assignedTo || 'ALL').toLowerCase().replace(/^@+/, '').trim();
          const recipients = [];
          if (targetInternEmail && targetInternEmail.includes('@')) {
            recipients.push(targetInternEmail);
          } else if (targetUser === 'all') {
            recipients.push('maqsoodmd.ac.in@gmail.com');
            recipients.push('chinmaykv555@gmail.com');
          } else if (targetUser.includes('chinmay')) {
            recipients.push('chinmaykv555@gmail.com');
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

          const isDirect = targetUser !== 'all';
          const targetLabel = isDirect ? `@${assignedTo}` : 'All Interns';
          const recName = targetInternName || (targetUser.includes('chinmay') ? 'Chinmay K V' : (targetUser.includes('maqsood') ? 'Maqsood MD' : 'Intern'));

          const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; margin: 0; padding: 40px 15px; color: #f8fafc; }
                .container { max-width: 580px; margin: 0 auto; background: #131c2e; border-radius: 24px; border: 1px solid #283654; padding: 36px 28px; }
                .logo-title { font-size: 28px; font-weight: 800; color: #38bdf8; text-align: center; }
                .badge { background: #1e3a8a; color: #93c5fd; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; }
                .card { background: #090e1a; border: 1px solid #3b82f6; border-radius: 16px; padding: 20px; margin: 20px 0; }
                .title { font-size: 18px; font-weight: bold; color: #38bdf8; margin: 8px 0; }
                .btn { display: inline-block; background: #6366f1; color: #ffffff !important; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo-title">WorkSphere</div>
                <p style="text-align: center; color: #06b6d4; font-size: 10px; font-weight: bold; letter-spacing: 2px;">NEW LEARNING MODULE PUBLISHED</p>
                <p>Hello <strong>${recName}</strong>,</p>
                <p style="color: #94a3b8; font-size: 14px;">A new learning module has been published to your curriculum on the WorkSphere Intern Portal:</p>
                <div class="card">
                  <span class="badge">${category}</span> <span class="badge" style="background: #312e81; color: #c7d2fe;">${track}</span>
                  <div class="title">🎓 ${title}</div>
                  ${description ? `<p style="color: #cbd5e1; font-size: 13px;">${description}</p>` : ''}
                  ${videoUrl ? `<p style="font-size: 13px;">▶️ Video: <a href="${videoUrl.startsWith('http') ? videoUrl : `https://www.youtube.com/watch?v=${videoUrl}`}" style="color: #f43f5e; font-weight: bold;">Watch Tutorial</a></p>` : ''}
                  ${resourceUrl ? `<p style="font-size: 13px;">📚 Docs: <a href="${resourceUrl}" style="color: #38bdf8; font-weight: bold;">Open Documentation</a></p>` : ''}
                  <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Target: <strong>${targetLabel}</strong></p>
                </div>
                <div style="text-align: center; margin-top: 24px;">
                  <a href="https://worksphere-two.vercel.app/intern/dashboard" class="btn">Open Intern Portal &rarr;</a>
                </div>
              </div>
            </body>
            </html>
          `;

          const unique = [...new Set(recipients)];
          for (const r of unique) {
            await transporter.sendMail({
              from: '"WorkSphere Learning Curriculum" <worksphere.ac.in@gmail.com>',
              to: r,
              subject: `🎓 [WorkSphere] Learning Module Assigned: ${title}`,
              html
            });
          }
        } catch (e) {
          console.error('[EMAIL TRIGGER ERROR]:', e);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Learning module created and assigned to ${assignedTo || 'ALL'}!`,
        module: newModuleDoc
      });
    }

    // 3. UPDATE PROGRESS OR STATUS (PATCH)
    if (req.method === 'PATCH') {
      const { id, progressPct, completed } = req.body || {};
      if (!id) {
        return res.status(400).json({ success: false, message: 'Module ID is required' });
      }

      const updateFields = { updatedAt: new Date() };
      if (typeof progressPct === 'number') updateFields.progressPct = progressPct;
      if (typeof completed === 'boolean') updateFields.completed = completed;

      await modulesCol.updateOne({ $or: [{ id: id }, { moduleId: id }] }, { $set: updateFields });
      return res.status(200).json({ success: true, message: `Module ${id} updated successfully!` });
    }

    // 4. DELETE MODULE (DELETE)
    if (req.method === 'DELETE') {
      const { id } = req.query || {};
      if (!id) {
        return res.status(400).json({ success: false, message: 'Module ID is required' });
      }
      await modulesCol.deleteOne({ $or: [{ id: id }, { moduleId: id }] });
      return res.status(200).json({ success: true, message: `Module ${id} deleted successfully!` });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error) {
    console.error('[SERVERLESS MODULE ERROR]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal error' });
  }
}
