import { connectToDatabase } from '../api/db.js';

async function cleanTaskFileData() {
  const { client, db } = await connectToDatabase();
  try {
    const tasks = await db.collection('intern_tasks').find({}).toArray();
    for (const t of tasks) {
      const updates = {};
      const unsets = {};

      if (t.fileData && t.fileData.length > 50000) {
        unsets['fileData'] = '';
      }
      if (t.submittedFiles?.folder?.data && t.submittedFiles.folder.data.length > 50000) {
        updates['submittedFiles.folder.data'] = '';
      }
      if (t.submittedFiles?.video?.data && t.submittedFiles.video.data.length > 50000) {
        updates['submittedFiles.video.data'] = '';
      }
      if (t.submittedFiles?.pdf?.data && t.submittedFiles.pdf.data.length > 500000) {
        // Keep small PDF data if below 500KB, otherwise clear raw base64 from mongo
        updates['submittedFiles.pdf.data'] = '';
      }

      const mongoUpdate = {};
      if (Object.keys(updates).length > 0) mongoUpdate['$set'] = updates;
      if (Object.keys(unsets).length > 0) mongoUpdate['$unset'] = unsets;

      if (Object.keys(mongoUpdate).length > 0) {
        await db.collection('intern_tasks').updateOne({ _id: t._id }, mongoUpdate);
        console.log(`Cleaned heavy fields from task ${t.taskId || t.id}`);
      }
    }
  } finally {
    await client.close();
  }
}

cleanTaskFileData();
