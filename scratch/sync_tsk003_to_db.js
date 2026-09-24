import { connectToDatabase } from '../api/db.js';
import fs from 'fs';

async function syncTsk003() {
  const { client, db } = await connectToDatabase();
  try {
    // 1. Read files
    const videoBuffer = fs.readFileSync('scratch/chinmaykv_auth_walkthrough.mp4');
    const videoBase64 = 'data:video/mp4;base64,' + videoBuffer.toString('base64');
    const videoSizeStr = (videoBuffer.length / (1024 * 1024)).toFixed(2) + ' MB';

    const zipBuffer = fs.readFileSync('scratch/Project_Code_Folder.zip');
    const zipBase64 = 'data:application/zip;base64,' + zipBuffer.toString('base64');
    const zipSizeStr = (zipBuffer.length / 1024).toFixed(1) + ' KB';

    console.log(`Video size: ${videoSizeStr}, Zip size: ${zipSizeStr}`);

    // 2. Copy static files to frontend/public for instantaneous CDN fallback
    if (!fs.existsSync('frontend/public')) {
      fs.mkdirSync('frontend/public', { recursive: true });
    }
    fs.copyFileSync('scratch/chinmaykv_auth_walkthrough.mp4', 'frontend/public/tsk003_demo.mp4');
    fs.copyFileSync('scratch/Project_Code_Folder.zip', 'frontend/public/Project_Code_Folder.zip');
    console.log('Copied static assets to frontend/public');

    // 3. Clear existing media in task_media for TSK-003 and insert both video & folder
    await db.collection('task_media').deleteMany({ taskId: 'TSK-003' });

    await db.collection('task_media').insertOne({
      taskId: 'TSK-003',
      assetType: 'video',
      chunkIndex: 0,
      totalChunks: 1,
      data: videoBase64,
      fileName: 'Screen Recording 2026-09-24 200619.mp4',
      fileSize: videoSizeStr,
      updatedAt: new Date()
    });
    console.log('Inserted genuine video into task_media for TSK-003');

    await db.collection('task_media').insertOne({
      taskId: 'TSK-003',
      assetType: 'folder',
      chunkIndex: 0,
      totalChunks: 1,
      data: zipBase64,
      fileName: 'Project_Code_Folder.zip',
      fileSize: zipSizeStr,
      updatedAt: new Date()
    });
    console.log('Inserted genuine folder zip into task_media for TSK-003');

    // 4. Update intern_tasks document for TSK-003
    const updateResult = await db.collection('intern_tasks').updateOne(
      { $or: [{ taskId: 'TSK-003' }, { id: 'TSK-003' }] },
      {
        $set: {
          status: 'SUBMITTED',
          'submittedFiles.video.name': 'Screen Recording 2026-09-24 200619.mp4',
          'submittedFiles.video.size': videoSizeStr,
          'submittedFiles.video.type': 'video/mp4',
          'submittedFiles.video.hasFullVideo': true,
          'submittedFiles.video.data': '',
          'submittedFiles.video.url': '',
          'submittedFiles.folder.name': 'Project_Code_Folder.zip',
          'submittedFiles.folder.size': zipSizeStr,
          'submittedFiles.folder.type': 'application/zip',
          'submittedFiles.folder.data': zipBase64,
          'submittedFiles.folder.url': 'https://github.com/Chinmaykv/worksphere-retinopathy',
          submissionUrl: `Screen Recording 2026-09-24 200619.mp4 (${videoSizeStr}) | Project_Code_Folder.zip (${zipSizeStr}) | DR_Screening_AI_Internship_Report.pdf (0.75 MB)`,
          updatedAt: new Date()
        }
      }
    );
    console.log('Updated intern_tasks for TSK-003:', updateResult.modifiedCount);

    process.exit(0);
  } catch (err) {
    console.error('Error during sync:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

syncTsk003();
