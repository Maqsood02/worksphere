import { connectToDatabase } from '../api/db.js';

async function fixTsk005() {
  const { client, db } = await connectToDatabase();
  try {
    const res = await db.collection('intern_tasks').updateOne(
      { $or: [{ taskId: 'TSK-005' }, { id: 'TSK-005' }] },
      {
        $set: {
          'submittedFiles.video': {
            name: 'Task 5 Video.mp4',
            size: '199.34 MB',
            type: 'video/mp4',
            data: '',
            url: '',
            hasFullVideo: true
          },
          'submittedFiles.folder': {
            name: 'Diabetic-retinopathy IIIT Dharwad.zip',
            size: '52.85 MB',
            type: 'application/zip',
            data: '',
            url: '',
            hasFullFolder: true
          },
          folderFileName: 'Diabetic-retinopathy IIIT Dharwad.zip',
          folderFileSize: '52.85 MB',
          videoFileName: 'Task 5 Video.mp4',
          videoFileSize: '199.34 MB',
          updatedAt: new Date()
        }
      }
    );
    console.log('TSK-005 updated in MongoDB:', res.modifiedCount);

    const updated = await db.collection('intern_tasks').findOne({ $or: [{ taskId: 'TSK-005' }, { id: 'TSK-005' }] });
    console.log('Updated TSK-005:', {
      taskId: updated.taskId,
      title: updated.title,
      fileName: updated.fileName,
      fileSize: updated.fileSize,
      submittedFiles: updated.submittedFiles
    });
  } finally {
    await client.close();
  }
}

fixTsk005().catch(console.error);
