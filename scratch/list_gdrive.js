import { getGoogleDriveAuth } from '../api/gdrive.js';
import { google } from 'googleapis';

async function listDriveFiles() {
  const auth = await getGoogleDriveAuth();
  const drive = google.drive({ version: 'v3', auth });

  console.log('--- Listing Google Drive Files ---');
  let pageToken = null;
  do {
    const res = await drive.files.list({
      pageSize: 50,
      fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, trashed)',
      pageToken: pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    for (const f of res.data.files || []) {
      const sizeMb = f.size ? (f.size / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A';
      console.log(`[${f.trashed ? 'TRASHED' : 'ACTIVE'}] ${f.name} | ID: ${f.id} | Type: ${f.mimeType} | Size: ${sizeMb} | Modified: ${f.modifiedTime}`);
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);
}

listDriveFiles().catch(console.error);
