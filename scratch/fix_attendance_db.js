import { connectToDatabase } from '../api/db.js';

async function run() {
  const { db } = await connectToDatabase();
  const col = db.collection('intern_attendance');
  
  // Sort newest first (same as API endpoint sort: { createdAt: -1 } or date -1)
  const logs = await col.find({}).sort({ date: -1, createdAt: -1 }).toArray();
  console.log('Found', logs.length, 'logs to standardize with unique Entry IDs...');

  for (let i = 0; i < logs.length; i++) {
    const doc = logs[i];
    const uniqueId = `ATT-${String(i + 1).padStart(3, '0')}`;
    await col.updateOne(
      { _id: doc._id },
      { $set: { id: uniqueId, logId: uniqueId } }
    );
    console.log(`Updated [${i + 1}/${logs.length}] _id: ${doc._id} -> id: ${uniqueId} (${doc.username}, ${doc.date})`);
  }

  console.log('Successfully updated all attendance records with unique Entry IDs!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
