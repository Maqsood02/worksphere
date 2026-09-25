import { getGoogleDriveAuth } from '../api/gdrive.js';
import { connectToDatabase } from '../api/db.js';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadWalkthroughVideo() {
  const videoPath = path.resolve(__dirname, 'chinmaykv_auth_walkthrough.mp4');
  if (!fs.existsSync(videoPath)) {
    console.error('Video file not found at:', videoPath);
    process.exit(1);
  }

  const stat = fs.statSync(videoPath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2) + ' MB';
  console.log(`Found video walkthrough (${sizeMb}): ${videoPath}`);

  console.log('Authenticating with Google Drive...');
  const auth = await getGoogleDriveAuth();
  const drive = google.drive({ version: 'v3', auth });
  const folderId = '1AklCKVKv7nWzACfeJrswJDR3jBj1EGpq'; // "WorkSphere Deliverables"

  const fileMetadata = {
    name: 'Task 3 - Login & Registration Authentication Demo Walkthrough.mp4',
    parents: [folderId],
    description: 'Authentic Screen Recording Video Walkthrough for Task 3 by Intern Chinmay K V'
  };

  const media = {
    mimeType: 'video/mp4',
    body: fs.createReadStream(videoPath)
  };

  console.log('Uploading video directly to Google Drive folder...');
  const res = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, mimeType, size, webViewLink, webContentLink',
    supportsAllDrives: true
  });

  const file = res.data;
  console.log('Uploaded successfully! File ID:', file.id);

  console.log('Granting public read permission for instant preview...');
  await drive.permissions.create({
    fileId: file.id,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    },
    supportsAllDrives: true
  });

  const driveVideoUrl = `https://drive.google.com/file/d/${file.id}/preview`;
  const driveViewUrl = `https://drive.google.com/file/d/${file.id}/view?usp=drivesdk`;

  console.log('Updating MongoDB Atlas TSK-003...');
  const { client, db } = await connectToDatabase();
  try {
    const updateResult = await db.collection('intern_tasks').updateOne(
      { $or: [{ taskId: 'TSK-003' }, { id: 'TSK-003' }] },
      {
        $set: {
          videoUrl: driveViewUrl,
          'submittedFiles.video': {
            name: file.name,
            size: sizeMb,
            type: 'video/mp4',
            url: driveViewUrl,
            fileId: file.id,
            hasFullVideo: true
          },
          updatedAt: new Date()
        }
      }
    );
    console.log(`MongoDB Atlas updated for TSK-003 (matched: ${updateResult.matchedCount}, modified: ${updateResult.modifiedCount})!`);
  } finally {
    await client.close();
  }

  console.log('SUCCESS! Google Drive video link is live:');
  console.log('URL:', driveViewUrl);
}

uploadWalkthroughVideo().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
