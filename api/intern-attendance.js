import { connectToDatabase } from './db.js';

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
    const attendanceCol = db.collection('intern_attendance');

    // 1. GET ALL OR USER ATTENDANCE LOGS
    if (req.method === 'GET') {
      const { username } = req.query || {};
      const allLogs = await attendanceCol.find({}).sort({ date: -1, createdAt: -1 }).toArray();
      if (!username || username === 'all' || username === 'admin') {
        return res.status(200).json({ success: true, logs: allLogs });
      }
      const uKey = username.toLowerCase().trim();
      const userLogs = allLogs.filter(l => (l.username || '').toLowerCase().trim() === uKey);
      return res.status(200).json({ success: true, logs: userLogs });
    }

    // 2. CREATE NEW ATTENDANCE LOG (POST)
    if (req.method === 'POST') {
      const body = req.body || {};
      const { username = 'intern', hours = 8, summary = '', date } = body;

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const dateStr = date || now.toISOString().split('T')[0];

      const totalCount = await attendanceCol.countDocuments();
      const logId = `ATT-${String(totalCount + 1).padStart(3, '0')}`;
      const newLogDoc = {
        logId,
        id: logId,
        username: username.replace(/^@+/, '').toLowerCase().trim(),
        date: dateStr,
        time: timeStr,
        hours: Number(hours) || 8,
        summary: summary.trim(),
        status: 'SUBMITTED',
        createdAt: now,
        updatedAt: now
      };

      await attendanceCol.insertOne(newLogDoc);
      return res.status(200).json({
        success: true,
        message: `Daily standup recorded for ${dateStr} at ${timeStr}!`,
        log: newLogDoc
      });
    }

    // 3. EDIT LOG / UPDATE STATUS (PATCH)
    if (req.method === 'PATCH') {
      const { id, logId, hours, summary, status } = req.body || {};
      const targetId = id || logId;
      if (!targetId) {
        return res.status(400).json({ success: false, message: 'Log ID is required' });
      }

      const updateFields = { updatedAt: new Date() };
      if (hours !== undefined) updateFields.hours = Number(hours);
      if (summary !== undefined) updateFields.summary = summary;
      if (status !== undefined) updateFields.status = status;

      await attendanceCol.updateOne(
        { $or: [{ logId: targetId }, { id: targetId }] },
        { $set: updateFields }
      );
      return res.status(200).json({ success: true, message: `Attendance log ${targetId} updated!` });
    }

    // 4. DELETE SINGLE LOG OR RESET TO ZERO (DELETE)
    if (req.method === 'DELETE') {
      const { id, username, resetAll } = req.query || {};
      if (resetAll === 'true' || resetAll === true) {
        if (username && username !== 'all') {
          const uKey = username.replace(/^@+/, '').toLowerCase().trim();
          await attendanceCol.deleteMany({ username: uKey });
          return res.status(200).json({ success: true, message: `All attendance logs reset to zero for @${uKey}!` });
        } else {
          await attendanceCol.deleteMany({});
          return res.status(200).json({ success: true, message: 'All intern attendance logs reset to zero!' });
        }
      }

      if (id) {
        await attendanceCol.deleteOne({ $or: [{ logId: id }, { id: id }] });
        return res.status(200).json({ success: true, message: `Attendance log ${id} deleted successfully!` });
      }

      return res.status(400).json({ success: false, message: 'ID or reset parameter required' });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error) {
    console.error('[ATTENDANCE ERROR]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
}
