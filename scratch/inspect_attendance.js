import { connectToDatabase } from '../api/db.js';

async function run() {
  const { db } = await connectToDatabase();
  const logs = await db.collection('intern_attendance').find({}).sort({ date: 1, createdAt: 1 }).toArray();
  console.log('Total attendance logs in MongoDB:', logs.length);
  logs.forEach((l, i) => {
    console.log(i + 1, 'id:', l.id, 'logId:', l.logId, 'user:', l.username, 'date:', l.date, 'hours:', l.hours);
  });
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
