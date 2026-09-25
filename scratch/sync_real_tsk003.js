import { connectToDatabase } from '../api/db.js';

async function updateDbForTsk003() {
  const { client, db } = await connectToDatabase();
  try {
    const driveZipId = '1IneaozkuxEFdunn3Nok_-K4TWaLIr0YK';
    const driveZipUrl = `https://drive.google.com/file/d/${driveZipId}/view?usp=drivesdk`;

    // 1. Delete all fake media for TSK-003 from task_media
    const delMedia = await db.collection('task_media').deleteMany({ taskId: 'TSK-003' });
    console.log('Deleted fake media entries from task_media:', delMedia.deletedCount);

    // 2. Update intern_tasks for TSK-003 with the genuine deliverable
    const updateResult = await db.collection('intern_tasks').updateOne(
      { $or: [{ taskId: 'TSK-003' }, { id: 'TSK-003' }] },
      {
        $set: {
          status: 'SUBMITTED',
          fileName: 'diabetic-retinopathy-systemNew folder.zip',
          fileSize: '52.37 MB',
          fileType: 'application/zip',
          fileData: '',
          submissionUrl: driveZipUrl,
          videoUrl: '',
          'submittedFiles.folder': {
            name: 'diabetic-retinopathy-systemNew folder.zip',
            size: '52.37 MB',
            type: 'application/zip',
            url: driveZipUrl,
            fileId: driveZipId
          },
          'submittedFiles.video': null,
          updatedAt: new Date()
        }
      }
    );
    console.log('Updated TSK-003 in intern_tasks:', updateResult.modifiedCount);

  } finally {
    await client.close();
  }
}

updateDbForTsk003().catch(console.error);
