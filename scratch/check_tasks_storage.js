import { connectToDatabase } from '../api/db.js';

async function checkTasks() {
  const { client, db } = await connectToDatabase();
  try {
    const tasksColl = db.collection('intern_tasks');
    const tasks = await tasksColl.find({}).toArray();
    for (const t of tasks) {
      console.log('Task:', {
        id: t.id || t.taskId || t._id,
        taskId: t.taskId,
        title: t.title,
        status: t.status,
        submittedAt: t.submittedAt,
        deliverableFiles: t.deliverableFiles ? t.deliverableFiles.length : 0,
        submission: t.submission,
        deliverables: t.deliverables ? Object.keys(t.deliverables) : null,
        reportDocument: t.reportDocument ? (typeof t.reportDocument === 'string' ? t.reportDocument.substring(0, 100) : t.reportDocument) : null,
        screenRecording: t.screenRecording ? (typeof t.screenRecording === 'string' ? t.screenRecording.substring(0, 100) : t.screenRecording) : null
      });

      // Check field sizes in this doc
      const keys = Object.keys(t);
      for (const k of keys) {
        const val = t[k];
        const len = typeof val === 'string' ? val.length : (typeof val === 'object' ? JSON.stringify(val).length : 0);
        if (len > 10000) {
          console.log(`  Heavy field in task ${t.taskId || t.id}: field '${k}' size=${(len/1024/1024).toFixed(2)} MB`);
        }
      }
    }
  } finally {
    await client.close();
  }
}

checkTasks();
