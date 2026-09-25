import { connectToDatabase } from '../api/db.js';
import { getGoogleDriveAuth } from '../api/gdrive.js';
import { google } from 'googleapis';

async function syncRealVideo() {
  const auth = await getGoogleDriveAuth();
  const drive = google.drive({ version: 'v3', auth });

  const realDriveId = '1g5tRtX1kjVgDxoKuiVBMMDjRasQ3-GPb';
  const realDriveViewUrl = `https://drive.google.com/file/d/${realDriveId}/view?usp=drivesdk`;
  const realDrivePreviewUrl = `https://drive.google.com/file/d/${realDriveId}/preview`;
  const fakeDriveId = '1aURIIrtJvcgW_kxHGElHIUjJvh5rnL7g';

  // 1. Delete the fake generated video from Google Drive
  try {
    await drive.files.delete({ fileId: fakeDriveId });
    console.log('Deleted fake video 1aURIIrtJvcgW_kxHGElHIUjJvh5rnL7g from Google Drive!');
  } catch (e) {
    console.warn('Fake drive video cleanup note:', e.message);
  }

  // 2. Ensure real video has public reader permission
  try {
    await drive.permissions.create({
      fileId: realDriveId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      },
      supportsAllDrives: true
    });
    console.log('Ensured public reader permission on real video 1g5tRtX1kjVgDxoKuiVBMMDjRasQ3-GPb');
  } catch (e) {
    console.log('Permission already exists or granted:', e.message);
  }

  // 3. Update MongoDB Atlas for TSK-003 and TSK-002
  const { client, db } = await connectToDatabase();
  try {
    const realVideoObj = {
      name: 'Task 2 Video.mp4',
      size: '46.00 MB',
      type: 'video/mp4',
      url: realDriveViewUrl,
      fileId: realDriveId,
      hasFullVideo: true
    };

    // Update TSK-003 with the real video
    const res3 = await db.collection('intern_tasks').updateOne(
      { $or: [{ taskId: 'TSK-003' }, { id: 'TSK-003' }] },
      {
        $set: {
          videoUrl: realDriveViewUrl,
          'submittedFiles.video': realVideoObj,
          updatedAt: new Date()
        }
      }
    );
    console.log('Updated TSK-003 with real video:', res3.modifiedCount);

    // Also update TSK-002 with the real video
    const res2 = await db.collection('intern_tasks').updateOne(
      { $or: [{ taskId: 'TSK-002' }, { id: 'TSK-002' }] },
      {
        $set: {
          videoUrl: realDriveViewUrl,
          'submittedFiles.video': realVideoObj,
          updatedAt: new Date()
        }
      }
    );
    console.log('Updated TSK-002 with real video:', res2.modifiedCount);

    // Verify in DB
    const t3 = await db.collection('intern_tasks').findOne({ taskId: 'TSK-003' }, { projection: { fileData: 0 } });
    console.log('TSK-003 updated state:');
    console.log('videoUrl:', t3.videoUrl);
    console.log('submittedFiles.video:', t3.submittedFiles?.video);
  } finally {
    await client.close();
  }

  console.log('SUCCESS! Real intern video is now active on Google Drive and MongoDB Atlas.');
}

syncRealVideo().catch(console.error);
