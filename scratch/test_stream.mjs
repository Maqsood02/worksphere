import { MongoClient } from 'mongodb';
import { google } from 'googleapis';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
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

  // Let's test with Task 3 video (fileId: 1No7TYfGhuXtBaWWjbiq662eFWqE4RBuZ) or Task 2
  const fileId = '1No7TYfGhuXtBaWWjbiq662eFWqE4RBuZ';
  console.log('Testing streaming for fileId:', fileId);

  // Request range: bytes=0-1024
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream', headers: { Range: 'bytes=0-1023' } }
  );

  console.log('Response status:', res.status);
  console.log('Response headers:', res.headers);

  let chunkCount = 0;
  let totalBytes = 0;
  for await (const chunk of res.data) {
    chunkCount++;
    totalBytes += chunk.length;
  }
  console.log(`Stream test SUCCESS! Received ${chunkCount} chunks, total ${totalBytes} bytes!`);

  await client.close();
}

main().catch(console.error);
