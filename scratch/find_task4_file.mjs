import { MongoClient } from 'mongodb';
import { google } from 'googleapis';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function checkFile() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('freelancedb');
  const setting = await db.collection('app_settings').findOne({ key: 'gdrive_credentials' });

  const auth = new google.auth.JWT({
    email: setting.client_email,
    key: setting.private_key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  // Let's search for files matching "Task 4" or the fileId
  const searchRes = await drive.files.list({
    q: "name contains 'Task 4' or name contains 'Task4'",
    fields: 'files(id, name, mimeType, size, webViewLink, createdTime)'
  });
  console.log('Task 4 files on Google Drive:');
  console.log(searchRes.data.files);

  await client.close();
}

checkFile().catch(console.error);
