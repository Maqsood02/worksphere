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
    const { username = 'intern' } = req.query || {};
    const uKey = username.toLowerCase().trim();

    const { db } = await connectToDatabase();
    const tasksCol = db.collection('intern_tasks');
    const attendanceCol = db.collection('intern_attendance');

    const cleanUKey = uKey.replace(/^@+/, '').trim();

    // Query MongoDB Atlas for matching tasks
    const allDbTasks = await tasksCol.find({}).sort({ createdAt: -1 }).toArray();
    
    const myTasks = allDbTasks.filter(t => {
      const assigned = (t.assignedTo || '').toLowerCase().replace(/^@+/, '').trim();
      return assigned === cleanUKey || assigned === 'all' || assigned.includes(cleanUKey) || cleanUKey.includes(assigned) ||
        (cleanUKey.includes('chinmay') && assigned.includes('chinmay')) ||
        (cleanUKey.includes('maqsood') && assigned.includes('maqsood'));
    }).map(t => ({
      id: t.taskId || t.id || t._id.toString(),
      taskId: t.taskId || t.id || t._id.toString(),
      assignedTo: t.assignedTo,
      title: t.title,
      description: t.description,
      deadline: t.deadline,
      priority: t.priority,
      status: t.status,
      submissionUrl: t.submissionUrl || '',
      submissionNotes: t.submissionNotes || ''
    }));

    // Query Attendance
    const allLogs = await attendanceCol.find({}).sort({ createdAt: -1 }).toArray();

    const myLogs = allLogs.filter(l => {
      const logU = (l.username || '').toLowerCase().replace(/^@+/, '').trim();
      return logU === cleanUKey || logU.includes(cleanUKey) || cleanUKey.includes(logU) ||
        (cleanUKey.includes('chinmay') && logU.includes('chinmay')) ||
        (cleanUKey.includes('maqsood') && logU.includes('maqsood'));
    }).map((l, idx) => {
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
      const seqId = l.logId || l.id || `ATT-${String(idx + 1).padStart(3, '0')}`;
      return {
        id: seqId,
        logId: seqId,
        username: l.username,
        date: l.date || new Date().toISOString().split('T')[0],
        time: timeStr || '10:00:00 AM',
        hours: Number(l.hours) || 8,
        summary: l.summary || '',
        status: l.status || 'SUBMITTED',
        createdAt: l.createdAt || new Date()
      };
    });

    const completedCount = myTasks.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
    const totalHours = myLogs.reduce((sum, l) => sum + (Number(l.hours) || 0), 0);

    const profile = {
      username: uKey,
      name: uKey.includes('chinmay') ? 'Chinmay K V' : (uKey.includes('maqsood') ? 'Maqsood MD' : 'Intern User'),
      email: uKey.includes('chinmay') ? 'chinmaykv555@gmail.com' : (uKey.includes('maqsood') ? 'maqsoodmd.ac.in@gmail.com' : `${uKey}@worksphere.ac.in`),
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

    return res.status(200).json({
      success: true,
      profile,
      stats: {
        tasksCompleted: completedCount,
        tasksTotal: myTasks.length,
        hoursLogged: totalHours,
        attendanceRate: myLogs.length === 0 ? '0%' : '100%',
        stipendStatus: 'Unpaid (Academic Credit)'
      },
      tasks: myTasks,
      attendanceLogs: myLogs,
      learningModules: [],
      certificate: { issued: false }
    });
  } catch (error) {
    console.error('[SERVERLESS OVERVIEW ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed fetching intern overview'
    });
  }
}
