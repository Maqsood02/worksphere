import { getGoogleDriveAuth } from '../api/gdrive.js';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

async function uploadRealDeliverable() {
  const filePath = 'C:/Users/Maqsood M D/Downloads/diabetic-retinopathy-systemNew folder.zip';
  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    process.exit(1);
  }

  const stat = fs.statSync(filePath);
  const fileSizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`Uploading real deliverable: ${filePath} (${fileSizeMb} MB)...`);

  const auth = await getGoogleDriveAuth();
  const drive = google.drive({ version: 'v3', auth });

  const folderId = '1AklCKVKv7nWzACfeJrswJDR3jBj1EGpq'; // "WorkSphere Deliverables"

  // 1. First, untrash any needed files or clean trash
  try {
    // Check if diabetic-retinopathy zip already exists in folder
    const existing = await drive.files.list({
      q: `'${folderId}' in parents and name contains 'diabetic-retinopathy' and trashed = false`,
      fields: 'files(id, name, webViewLink, size)'
    });
    console.log('Existing in folder:', existing.data.files);
  } catch (e) {
    console.warn('Check existing notice:', e.message);
  }

  // 2. Upload the real 52.37 MB zip using resumable upload
  const fileMetadata = {
    name: 'diabetic-retinopathy-systemNew folder.zip',
    parents: [folderId],
    description: 'Submitted Codebase Deliverable for Task 3 by Intern Chinmay K V'
  };

  const media = {
    mimeType: 'application/zip',
    body: fs.createReadStream(filePath)
  };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, mimeType, size, webViewLink, webContentLink',
    supportsAllDrives: true
  });

  const file = res.data;
  console.log('Successfully uploaded to Google Drive:', file);

  // 3. Make it readable by anyone with link
  await drive.permissions.create({
    fileId: file.id,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    },
    supportsAllDrives: true
  });
  console.log('Public link permissions created for file:', file.id);

  // 4. Clean up test files from folder
  const testFiles = await drive.files.list({
    q: `'${folderId}' in parents and (name = 'test_cors.txt' or name = 'test_upload.zip')`,
    fields: 'files(id, name)'
  });
  for (const f of testFiles.data.files || []) {
    await drive.files.delete({ fileId: f.id });
    console.log('Cleaned up temporary test file:', f.name);
  }

  console.log('Done! Google Drive File ID:', file.id);
  console.log('Web View Link:', file.webViewLink);
}

uploadRealDeliverable().catch(console.error);
