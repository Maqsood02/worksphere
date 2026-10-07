import { connectToDatabase } from '../api/db.js';
import { getGoogleDriveAuth } from '../api/gdrive.js';
import { google } from 'googleapis';

async function listFiles() {
  const { client, db } = await connectToDatabase();
  try {
    const auth = await getGoogleDriveAuth(db);
    const drive = google.drive({ version: 'v3', auth });

    const res = await drive.files.list({
      pageSize: 30,
      fields: 'files(id, name, mimeType, size, webViewLink, createdTime, videoMediaMetadata)',
      orderBy: 'createdTime desc'
    });

    console.log('Recent Google Drive files:');
    res.data.files.forEach(f => {
      console.log(`- [${f.id}] ${f.name} (${(Number(f.size || 0)/(1024*1024)).toFixed(2)} MB, created: ${f.createdTime})`);
      console.log(`  link: ${f.webViewLink}`);
    });
  } finally {
    await client.close();
  }
}

listFiles().catch(console.error);
