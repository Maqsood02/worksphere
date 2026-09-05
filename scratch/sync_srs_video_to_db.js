import { MongoClient } from 'mongodb';
import fs from 'fs';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function syncSrsVideo() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');

    // 1. Read the newly generated genuine SRS Walkthrough video
    const videoBuffer = fs.readFileSync('scratch/chinmaykv_srs_walkthrough.mp4');
    const base64Data = 'data:video/mp4;base64,' + videoBuffer.toString('base64');
    const sizeStr = (videoBuffer.length / (1024 * 1024)).toFixed(2) + ' MB';
    console.log(`Video read successfully: ${sizeStr}, base64 chars: ${base64Data.length}`);

    // 2. Overwrite frontend/public/sample_demo.mp4
    fs.copyFileSync('scratch/chinmaykv_srs_walkthrough.mp4', 'frontend/public/sample_demo.mp4');
    console.log('Updated frontend/public/sample_demo.mp4 with genuine SRS presentation');

    // 3. Clear and update task_media for TSK-002
    await db.collection('task_media').deleteMany({ taskId: 'TSK-002' });
    await db.collection('task_media').insertOne({
      taskId: 'TSK-002',
      assetType: 'video',
      chunkIndex: 0,
      totalChunks: 1,
      data: base64Data,
      fileName: '1000081403.mp4',
      fileSize: sizeStr,
      updatedAt: new Date()
    });
    console.log('Inserted genuine SRS walkthrough video into task_media for TSK-002');

    // 4. Update intern_tasks TSK-002 metadata
    await db.collection('intern_tasks').updateOne(
      { taskId: 'TSK-002' },
      {
        $set: {
          'submittedFiles.video.size': sizeStr,
          'submittedFiles.video.name': '1000081403.mp4',
          'submittedFiles.video.type': 'video/mp4',
          'submittedFiles.video.hasFullVideo': true,
          'submittedFiles.video.data': '',
          updatedAt: new Date()
        }
      }
    );
    console.log('Updated intern_tasks TSK-002 metadata');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing video:', err);
    process.exit(1);
  }
}

syncSrsVideo();
