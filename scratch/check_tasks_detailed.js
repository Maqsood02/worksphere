import { connectToDatabase } from '../api/db.js';

async function checkAllTasks() {
  const { client, db } = await connectToDatabase();
  try {
    const tasks = await db.collection('intern_tasks').find({}).toArray();
    for (const t of tasks) {
      console.log('=== Task:', t.id || t.taskId, '===');
      console.log('Title:', t.title);
      console.log('Status:', t.status);
      console.log('AssignedTo:', t.assignedTo);
      console.log('SubmittedAt:', t.submittedAt);
      console.log('UpdatedAt:', t.updatedAt);
      console.log('SubmissionUrl:', t.submissionUrl);
      console.log('VideoUrl:', t.videoUrl);
      console.log('FileName:', t.fileName);
      console.log('FileSize:', t.fileSize);
      console.log('SubmittedFiles keys:', t.submittedFiles ? Object.keys(t.submittedFiles) : null);
      if (t.submittedFiles?.video) {
        console.log('  Video:', { name: t.submittedFiles.video.name, size: t.submittedFiles.video.size, url: t.submittedFiles.video.url, hasFullVideo: t.submittedFiles.video.hasFullVideo });
      }
      if (t.submittedFiles?.pdf) {
        console.log('  PDF:', { name: t.submittedFiles.pdf.name, size: t.submittedFiles.pdf.size });
      }
      if (t.submittedFiles?.folder) {
        console.log('  Folder:', { name: t.submittedFiles.folder.name, size: t.submittedFiles.folder.size, url: t.submittedFiles.folder.url });
      }
    }
  } finally {
    await client.close();
  }
}

checkAllTasks();
