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
    const tasksCol = db.collection('intern_tasks');

    // 1. GET ALL / USER TASKS
    if (req.method === 'GET') {
      const { username } = req.query || {};
      const allTasks = await tasksCol.find({}).sort({ createdAt: -1 }).toArray();
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

    // 2. CREATE NEW TASK (POST) + DISPATCH NOTIFICATION EMAIL
    if (req.method === 'POST') {
      const body = req.body || {};
      const { assignedTo = 'ALL', title, description = '', deadline = '2026-08-31', priority = 'HIGH' } = body;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Task title is required' });
      }

      const taskId = 'TSK-' + Date.now();
      const newTaskDoc = {
        taskId,
        assignedTo,
        title: title.trim(),
        description: description.trim(),
        deadline,
        priority,
        status: 'IN_PROGRESS',
        submissionUrl: '',
        submissionNotes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await tasksCol.insertOne(newTaskDoc);

      // Trigger Email Notification
      try {
        const uLower = assignedTo.toLowerCase().trim();
        const recipients = [];
        if (uLower === 'all') {
          recipients.push('maqsoodmd.ac.in@gmail.com');
          recipients.push('chinmaykv555@gmail.com');
        } else if (uLower.includes('chinmay')) {
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

        const html = `
          <div style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 550px; margin: auto;">
            <h2 style="color: #38bdf8; margin-top: 0;">WorkSphere Sprint Deliverable</h2>
            <p>A new deliverable task has been assigned to your sprint backlog:</p>
            <div style="background: #1e293b; padding: 18px; border-radius: 12px; border: 1px solid #3b82f6; margin: 16px 0;">
              <h3 style="color: #60a5fa; margin: 0 0 8px 0;">📋 ${title}</h3>
              <p style="color: #cbd5e1; font-size: 14px;">${description || 'No additional details provided.'}</p>
              <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;"><strong>Deadline:</strong> ${deadline} &bull; <strong>Priority:</strong> ${priority}</p>
            </div>
            <a href="https://worksphere-two.vercel.app/intern/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Open Intern Portal &rarr;</a>
          </div>
        `;

        for (const recipient of recipients) {
          await transporter.sendMail({
            from: '"WorkSphere Sprint Backlog" <worksphere.ac.in@gmail.com>',
            to: recipient,
            subject: `📋 [WorkSphere Task] New Deliverable Assigned: ${title}`,
            html
          });
        }
      } catch (err) {
        console.error('[EMAIL ERROR]:', err);
      }

      return res.status(200).json({
        success: true,
        message: `Task assigned to @${assignedTo} successfully!`,
        task: newTaskDoc
      });
    }

    // 3. UPDATE STATUS OR SUBMISSION (PATCH)
    if (req.method === 'PATCH') {
      const { taskId, status, submissionUrl, submissionNotes } = req.body || {};
      if (!taskId) {
        return res.status(400).json({ success: false, message: 'TaskId is required' });
      }

      const updateFields = { updatedAt: new Date() };
      if (status) updateFields.status = status;
      if (submissionUrl !== undefined) updateFields.submissionUrl = submissionUrl;
      if (submissionNotes !== undefined) updateFields.submissionNotes = submissionNotes;

      await tasksCol.updateOne({ taskId }, { $set: updateFields });
      return res.status(200).json({ success: true, message: `Task ${taskId} updated successfully!` });
    }

    // 4. DELETE TASK (DELETE)
    if (req.method === 'DELETE') {
      const { id } = req.query || {};
      if (!id) {
        return res.status(400).json({ success: false, message: 'TaskId is required' });
      }
      await tasksCol.deleteOne({ $or: [{ taskId: id }, { id: id }] });
      return res.status(200).json({ success: true, message: `Task ${id} deleted successfully!` });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error) {
    console.error('[SERVERLESS TASK ERROR]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal error' });
  }
}
