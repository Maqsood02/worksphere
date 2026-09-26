import { connectToDatabase } from '../api/db.js';

async function getTask3() {
  const { client, db } = await connectToDatabase();
  try {
    const t3 = await db.collection('intern_tasks').findOne({ $or: [{ taskId: 'TSK-003' }, { id: 'TSK-003' }] });
    console.log('TSK-003 full doc:');
    console.log(JSON.stringify(t3, null, 2));
  } finally {
    await client.close();
  }
}

getTask3().catch(console.error);
