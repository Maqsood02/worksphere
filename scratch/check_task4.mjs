import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('freelancedb');
  const t = await db.collection('intern_tasks').findOne({
    $or: [{ taskId: 'TSK-004' }, { title: /Task 4/i }]
  });
  console.log("taskId:", t.taskId);
  console.log("title:", t.title);
  console.log("status:", t.status);
  console.log("videoUrl:", t.videoUrl);
  console.log("submissionUrl:", t.submissionUrl);
  console.log("submittedFiles.video:", t.submittedFiles?.video);
  await client.close();
}

main().catch(console.error);
