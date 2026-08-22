import { connectToDatabase } from '../api/db.js';

async function updateDb() {
  try {
    const { db } = await connectToDatabase();
    const usersCol = db.collection('users');
    const profilesCol = db.collection('intern_profiles');

    await profilesCol.updateOne(
      { username: 'chinmaykv' },
      {
        $set: {
          username: 'chinmaykv',
          name: 'Chinmay K V',
          email: 'chinmaykv555@gmail.com',
          phone: '7760674555',
          track: 'Full-Stack Software Engineering',
          stipendType: 'UNPAID',
          stipendAmount: 'Unpaid (Academic Credit)',
          mentorName: 'Unassigned Mentor',
          mentorEmail: 's.jenkins@worksphere.ac.in',
          startDate: '2026-06-01',
          endDate: '2026-08-31',
          performanceRating: 'Active Intern',
          certificateStatus: 'NOT_ISSUED',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    await profilesCol.updateOne(
      { username: 'maqsood' },
      {
        $set: {
          username: 'maqsood',
          name: 'Maqsood MD',
          email: 'maqsoodmd.ac.in@gmail.com',
          phone: '8792404950',
          track: 'Full-Stack Software Engineering',
          stipendType: 'UNPAID',
          stipendAmount: 'Unpaid (Academic Credit)',
          mentorName: 'Unassigned Mentor',
          mentorEmail: 's.jenkins@worksphere.ac.in',
          startDate: '2026-06-01',
          endDate: '2026-08-31',
          performanceRating: 'Active Intern',
          certificateStatus: 'NOT_ISSUED',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    const modulesCol = db.collection('learning_modules');
    await modulesCol.updateMany(
      { assignedTo: { $regex: /^all$/i } },
      { $set: { progressPct: 0, completed: false } }
    );

    const mods = await modulesCol.find({}).toArray();
    console.log('MongoDB Learning Modules:');
    mods.forEach(m => {
      console.log(`- [${m.id}] "${m.title}" (assignedTo: ${m.assignedTo}): rootProgress=${m.progressPct}%, progressByUser=${JSON.stringify(m.progressByUser)}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  }
}

updateDb();
