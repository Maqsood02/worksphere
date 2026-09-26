import { connectToDatabase } from '../api/db.js';

async function fixTsk003Db() {
  const { client, db } = await connectToDatabase();
  try {
    const driveZipId = '1IneaozkuxEFdunn3Nok_-K4TWaLIr0YK';
    const driveZipUrl = `https://drive.google.com/file/d/${driveZipId}/view?usp=drivesdk`;

    // 1. Delete all media for TSK-003 from task_media (no fake or wrong task 2 chunks)
    const delMedia = await db.collection('task_media').deleteMany({
      $or: [
        { taskId: 'TSK-003' },
        { taskId: new RegExp('^TSK-003$', 'i') }
      ]
    });
    console.log('Deleted task_media entries for TSK-003:', delMedia.deletedCount);

    // 2. Clean TSK-003 in intern_tasks:
    // Remove Task 2 Video.mp4 completely. Keep the genuine diabetic-retinopathy-systemNew folder.zip
    const updateResult = await db.collection('intern_tasks').updateOne(
      { $or: [{ taskId: 'TSK-003' }, { id: 'TSK-003' }] },
      {
        $set: {
          videoUrl: '',
          'submittedFiles.video': null,
          hasVideoChunks: false,
          videoChunksCount: 0,
          videoFileName: '',
          videoFileSize: '',
          videoUploadComplete: false,
          fileName: 'diabetic-retinopathy-systemNew folder.zip',
          fileSize: '52.37 MB',
          fileType: 'application/zip',
          fileData: '',
          submissionUrl: driveZipUrl,
          'submittedFiles.folder': {
            name: 'diabetic-retinopathy-systemNew folder.zip',
            size: '52.37 MB',
            type: 'application/zip',
            url: driveZipUrl,
            fileId: driveZipId
          },
          updatedAt: new Date()
        },
        $unset: {
          task2Video: '',
          tempVideo: ''
        }
      }
    );
    console.log('Updated TSK-003 in intern_tasks:', updateResult.modifiedCount);

    // 3. Confirm TSK-002 retains Task 2 Video.mp4
    const task2 = await db.collection('intern_tasks').findOne({
      $or: [{ taskId: 'TSK-002' }, { id: 'TSK-002' }]
    });
    console.log('TSK-002 status: videoUrl =', task2?.videoUrl, '| name =', task2?.submittedFiles?.video?.name);

    // 4. Print updated TSK-003
    const task3 = await db.collection('intern_tasks').findOne({
      $or: [{ taskId: 'TSK-003' }, { id: 'TSK-003' }]
    });
    console.log('TSK-003 status: videoUrl =', task3?.videoUrl, '| submittedFiles.video =', task3?.submittedFiles?.video, '| folder =', task3?.submittedFiles?.folder?.name);

  } finally {
    await client.close();
  }
}

fixTsk003Db().catch(console.error);
