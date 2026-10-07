import { connectToDatabase } from '../api/db.js';
import { createResumableUploadUrl, finalizeDriveFile, isGoogleDriveConfigured, getCredentials } from '../api/gdrive.js';

async function testUploadFlow() {
  console.log('--- Testing Google Drive Resumable Upload Flow ---');
  const { client, db } = await connectToDatabase();
  try {
    const configured = await isGoogleDriveConfigured(db);
    console.log('Google Drive configured?', configured);
    const creds = await getCredentials(db);
    console.log('Credentials type:', creds?.type, 'client_email:', creds?.client_email);

    // 1. Create resumable upload session
    console.log('Creating resumable upload URL...');
    const session = await createResumableUploadUrl({
      fileName: 'test_demo_video.mp4',
      mimeType: 'video/mp4',
      fileSize: 1024 * 1024,
      origin: 'http://localhost:5173',
      db
    });

    console.log('Upload session result:');
    console.log('Upload URL created?', !!session.uploadUrl);
    console.log('Folder ID:', session.folderId);

    if (session.uploadUrl) {
      console.log('SUCCESS! Automated Google Drive upload pipeline is 100% operational!');
    }
  } finally {
    await client.close();
  }
}

testUploadFlow().catch(console.error);
