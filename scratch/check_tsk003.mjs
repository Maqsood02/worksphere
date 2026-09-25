import { connectToDatabase } from '../api/db.js';

async function checkTask() {
  const { client, db } = await connectToDatabase();
  try {
    const task = await db.collection('intern_tasks').findOne({ taskId: 'TSK-003' });
    console.log('TSK-003 found:', JSON.stringify(task, null, 2));
  } finally {
    await client.close();
  }
}

checkTask().catch(console.error);
