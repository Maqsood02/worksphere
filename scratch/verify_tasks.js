import { connectToDatabase } from '../api/db.js';

async function verify() {
  const { client, db } = await connectToDatabase();
  try {
    const t2 = await db.collection('intern_tasks').findOne({ taskId: 'TSK-002' });
    const t3 = await db.collection('intern_tasks').findOne({ taskId: 'TSK-003' });

    console.log('=== TSK-002 ===');
    console.log('Title:', t2?.title);
    console.log('Status:', t2?.status);
    console.log('Video Name:', t2?.submittedFiles?.video?.name);
    console.log('Video URL:', t2?.videoUrl);

    console.log('\n=== TSK-003 ===');
    console.log('Title:', t3?.title);
    console.log('Status:', t3?.status);
    console.log('Video Name:', t3?.submittedFiles?.video?.name || '(None)');
    console.log('Video URL:', t3?.videoUrl || '(None)');
    console.log('Folder Name:', t3?.submittedFiles?.folder?.name);
    console.log('Folder URL:', t3?.submittedFiles?.folder?.url);
  } finally {
    await client.close();
  }
}

verify().catch(console.error);
