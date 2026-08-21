import { connectToDatabase } from '../api/db.js';

async function check() {
  const { db } = await connectToDatabase();
  const tasks = await db.collection('intern_tasks').find({}).toArray();
  console.log('MongoDB Intern Tasks Count:', tasks.length);
  tasks.forEach((t, i) => {
    console.log(`${i + 1}. [${t.taskId || t.id || t._id}] (${t.assignedTo}) Title: "${t.title}"`);
  });
  process.exit(0);
}

check();
