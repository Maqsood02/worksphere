import { getGoogleDriveAuth } from '../api/gdrive.js';
import { google } from 'googleapis';

async function listAll() {
  const auth = await getGoogleDriveAuth();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.list({
    q: "mimeType contains 'video/'",
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, trashed, parents, webViewLink)',
    pageSize: 100
  });
  console.log('ALL VIDEOS IN GOOGLE DRIVE:');
  console.log(JSON.stringify(res.data.files, null, 2));

  const trashed = await drive.files.list({
    q: "trashed = true",
    fields: 'files(id, name, mimeType, size, createdTime, trashed)',
    pageSize: 50
  });
  console.log('TRASHED FILES IN GOOGLE DRIVE:');
  console.log(JSON.stringify(trashed.data.files, null, 2));

  // Search all files with "task" or "tsk" or "video" or "walkthrough"
  const searchFiles = await drive.files.list({
    q: "name contains 'Task' or name contains 'video' or name contains 'Video' or name contains 'TSK' or name contains 'walkthrough' or name contains 'Walkthrough'",
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, trashed, parents, webViewLink)',
    pageSize: 100
  });
  console.log('NAME MATCHED FILES:');
  console.log(JSON.stringify(searchFiles.data.files, null, 2));
}

listAll().catch(console.error);
