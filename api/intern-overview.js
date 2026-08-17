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

    // Query MongoDB Atlas for matching tasks
    const allDbTasks = await tasksCol.find({}).sort({ createdAt: -1 }).toArray();
    
    const myTasks = allDbTasks.filter(t => {
      const assigned = (t.assignedTo || '').toLowerCase().trim();
      return assigned === uKey || assigned === 'all' || assigned.includes(uKey) || uKey.includes(assigned);
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

    const myLogs = allLogs.filter(l => (l.username || '').toLowerCase().trim() === uKey).map(l => {
      let timeStr = l.time;
      if (!timeStr && l.createdAt) {
        try {
          timeStr = new Date(l.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) {}
      }
      return {
        id: l.logId || l.id || l._id.toString(),
        logId: l.logId || l.id || l._id.toString(),
        username: l.username,
        date: l.date || new Date().toISOString().split('T')[0],
        time: timeStr || '10:00 AM',
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
