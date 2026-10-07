import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function fixTask4() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('freelancedb');

  const fileId = '1FY_mPCMhPk_8oLYWlKpwztru_f2_k01R';
  const driveUrl = `https://drive.google.com/file/d/${fileId}/view`;
  const streamUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;

  const res = await db.collection('intern_tasks').updateOne(
    { $or: [{ taskId: 'TSK-004' }, { title: /Task 4/i }] },
    {
      $set: {
        videoUrl: driveUrl,
        submissionUrl: driveUrl,
        'submittedFiles.video.url': driveUrl,
        'submittedFiles.video.fileId': fileId,
        'submittedFiles.video.streamUrl': streamUrl,
        'submittedFiles.video.name': 'Task 4 Video.mp4',
        'submittedFiles.video.size': '209.74 MB',
        'submittedFiles.video.type': 'video/mp4',
        'submittedFiles.video.hasFullVideo': true,
        updatedAt: new Date()
      }
    }
  );

  console.log('Updated TSK-004 in MongoDB Atlas:', res.modifiedCount);
  await client.close();
}

fixTask4().catch(console.error);
