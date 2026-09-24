import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('freelancedb');
  const t = await db.collection('intern_tasks').findOne({ taskId: 'TSK-003' });
  const copy = { ...t };
  const fileDataLen = copy.fileData ? copy.fileData.length : 0;
  delete copy.fileData;
  console.log("TSK-003 status:", t.status);
  console.log("TSK-003 assignedTo:", t.assignedTo);
  console.log("TSK-003 submissionUrl:", t.submissionUrl);
  console.log("TSK-003 submissionNotes:", t.submissionNotes);
  console.log("TSK-003 fileName:", t.fileName);
  console.log("TSK-003 fileSize:", t.fileSize);
  console.log("TSK-003 fileType:", t.fileType);
  console.log("TSK-003 submittedFiles:", JSON.stringify(t.submittedFiles, null, 2));
  console.log("TSK-003 updatedAt:", t.updatedAt);
  console.log("TSK-003 fileData length:", fileDataLen);

  const media = await db.collection('task_media').find({ taskId: 'TSK-003' }).project({ chunkIndex: 1, totalChunks: 1, assetType: 1, fileName: 1, fileSize: 1 }).sort({ chunkIndex: 1 }).toArray();
  console.log("\nMedia chunks count:", media.length);
  if (media.length > 0) {
    console.log("First chunk:", media[0]);
    console.log("Last chunk:", media[media.length - 1]);
  }
  process.exit(0);
}

run();
