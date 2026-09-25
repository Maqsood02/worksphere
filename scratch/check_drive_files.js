import { getGoogleDriveAuth } from '../api/gdrive.js';
import { google } from 'googleapis';

async function check() {
  const auth = await getGoogleDriveAuth();
  const drive = google.drive({ version: 'v3', auth });
  
  const folder = await drive.files.get({ fileId: '1AklCKVKv7nWzACfeJrswJDR3jBj1EGpq', fields: 'id, name, mimeType' });
  console.log('Folder info:', folder.data);
  
  const res = await drive.files.list({
    q: "'1AklCKVKv7nWzACfeJrswJDR3jBj1EGpq' in parents and trashed = false",
    fields: 'files(id, name, mimeType, size, createdTime, webViewLink)'
  });
  console.log('Files in folder:', JSON.stringify(res.data.files, null, 2));

  // Also check recent files uploaded by this account anywhere
  const recent = await drive.files.list({
    pageSize: 10,
    fields: 'files(id, name, mimeType, size, createdTime, parents, webViewLink)'
  });
  console.log('Recent 10 files in Drive:', JSON.stringify(recent.data.files, null, 2));
}

check().catch(console.error);
