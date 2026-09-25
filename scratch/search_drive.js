import { getGoogleDriveAuth } from '../api/gdrive.js';
import { google } from 'googleapis';

async function searchDrive() {
  const auth = await getGoogleDriveAuth();
  const drive = google.drive({ version: 'v3', auth });

  const about = await drive.about.get({ fields: 'user, storageQuota' });
  console.log('User info:', about.data.user);

  const res = await drive.files.list({
    pageSize: 30,
    fields: 'files(id, name, mimeType, parents, createdTime, trashed)'
  });
  console.log('Files found:', JSON.stringify(res.data.files, null, 2));
}

searchDrive().catch(console.error);
