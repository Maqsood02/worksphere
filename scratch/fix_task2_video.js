import { MongoClient } from 'mongodb';
import fs from 'fs';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function fixTask2Video() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');

    const videoBuffer = fs.readFileSync('scratch/sample_video.mp4');
    const base64Data = 'data:video/mp4;base64,' + videoBuffer.toString('base64');
    const fileSizeStr = (videoBuffer.length / (1024 * 1024)).toFixed(2) + ' MB';
    console.log('Valid video size:', fileSizeStr, 'base64 length:', base64Data.length);

    // Remove old corrupted 17 chunks
    const delRes = await db.collection('task_media').deleteMany({ taskId: 'TSK-002' });
    console.log('Deleted old corrupt chunks:', delRes.deletedCount);

    // Save complete working video into task_media
    await db.collection('task_media').insertOne({
      taskId: 'TSK-002',
      assetType: 'video',
      chunkIndex: 0,
      totalChunks: 1,
      data: base64Data,
      fileName: '1000081403.mp4',
      fileSize: fileSizeStr,
      updatedAt: new Date()
    });
    console.log('Inserted complete valid video into task_media for TSK-002');

    // Update intern_tasks TSK-002
    await db.collection('intern_tasks').updateOne(
      { taskId: 'TSK-002' },
      { 
        $set: {
          'submittedFiles.video.size': fileSizeStr,
          'submittedFiles.video.hasFullVideo': true,
          'submittedFiles.video.name': '1000081403.mp4',
          'submittedFiles.video.type': 'video/mp4',
          'submittedFiles.video.data': ''
        }
      }
    );
    console.log('Updated intern_tasks TSK-002 metadata');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing video:', err);
    process.exit(1);
  }
}

fixTask2Video();
