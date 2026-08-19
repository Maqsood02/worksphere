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

      const normalizedLogs = allLogs.map((l, idx) => {
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
          ...l,
          id: l.logId || l.id || `ATT-${String(idx + 1).padStart(3, '0')}`,
          logId: l.logId || l.id || `ATT-${String(idx + 1).padStart(3, '0')}`,
          time: timeStr || '10:00:00 AM'
        };
      });

      if (!username || username === 'all' || username === 'admin') {
        return res.status(200).json({ success: true, logs: normalizedLogs });
      }
      const uKey = username.toLowerCase().replace(/^@+/, '').trim();
      const userLogs = normalizedLogs.filter(l => {
        const logU = (l.username || '').toLowerCase().replace(/^@+/, '').trim();
        return logU === uKey || logU.includes(uKey) || uKey.includes(logU) ||
          (uKey.includes('chinmay') && logU.includes('chinmay')) ||
          (uKey.includes('maqsood') && logU.includes('maqsood'));
      });
      return res.status(200).json({ success: true, logs: userLogs });
    }

    // 2. CREATE NEW ATTENDANCE LOG (POST)
    if (req.method === 'POST') {
      const body = req.body || {};
      const { username = 'intern', hours = 8, summary = '', date, time } = body;

      const now = new Date();
      // Use client's exact live time if provided, or format in IST
      let timeStr = (time && String(time).trim()) || '';
      if (!timeStr) {
        try {
          timeStr = now.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
        } catch (e) {
          timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        }
      }

      let dateStr = (date && String(date).trim()) || '';
      if (!dateStr) {
        try {
          const istFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
          dateStr = istFormatter.format(now);
        } catch (e) {
          dateStr = now.toISOString().split('T')[0];
        }
      }

      const cleanU = username.replace(/^@+/, '').toLowerCase().trim();
      const userCount = await attendanceCol.countDocuments({
        $or: [
          { username: cleanU },
          { username: `@${cleanU}` }
        ]
      });
      const logId = `ATT-${String(userCount + 1).padStart(3, '0')}`;
      const newLogDoc = {
        logId,
        id: logId,
        username: cleanU,
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
