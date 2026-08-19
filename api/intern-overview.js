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

    // Filter and strictly deduplicate by date
    const dateMap = new Map();
    for (const l of allLogs) {
      const logU = (l.username || '').toLowerCase().replace(/^@+/, '').trim();
      const isMatch = logU === cleanUKey || logU.includes(cleanUKey) || cleanUKey.includes(logU) ||
        (cleanUKey.includes('chinmay') && logU.includes('chinmay')) ||
        (cleanUKey.includes('maqsood') && logU.includes('maqsood'));
      if (isMatch && l.date && !dateMap.has(l.date)) {
        dateMap.set(l.date, l);
      }
    }

    const myLogs = Array.from(dateMap.values()).map((l) => {
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
      const finalId = l.logId || l.id || 'ATT-001';
      return {
        id: finalId,
        logId: finalId,
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

    // Compute dynamic attendance rate based on expected days between earliest log and today
    const now = new Date();
    let todayStr = now.toISOString().split('T')[0];
    try {
      todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    } catch (e) {}

    let attendanceRate = '0%';
    if (myLogs.length > 0) {
      const dates = myLogs.map(l => l.date).filter(Boolean).sort();
      const earliestDateStr = dates[0] || todayStr;
      
      const startD = new Date(earliestDateStr + 'T00:00:00');
      const todayD = new Date(todayStr + 'T00:00:00');
      const totalElapsedDays = Math.max(1, Math.round((todayD - startD) / (1000 * 60 * 60 * 24)) + 1);
      
      const hasToday = myLogs.some(l => l.date === todayStr);
      // If today is logged, expected is totalElapsedDays. If not logged yet (monitored until 12 AM), expected is past days
      const expectedDays = hasToday ? totalElapsedDays : Math.max(1, totalElapsedDays - 1);
      const rateNum = Math.min(100, Math.max(0, Math.round((myLogs.length / expectedDays) * 100)));
      attendanceRate = `${rateNum}%`;
    }

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
        attendanceRate,
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
