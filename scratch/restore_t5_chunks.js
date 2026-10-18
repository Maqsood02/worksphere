import fs from 'fs';
import { connectToDatabase } from '../api/db.js';

const zipPath = 'C:\\Users\\Maqsood M D\\Downloads\\Diabetic-retinopathy IIIT Dharwad.zip';
const BINARY_CHUNK_SIZE = 1.25 * 1024 * 1024; // 1.25 MB chunk size matching deliverableStorage.js

async function restoreMissingChunks() {
  const buf = fs.readFileSync(zipPath);
  console.log('Total file size:', buf.length);
  const totalChunks = Math.ceil(buf.length / BINARY_CHUNK_SIZE);
  console.log('Total calculated chunks:', totalChunks);

  const { client, db } = await connectToDatabase();
  try {
    for (let c = 0; c < 2; c++) {
      const start = c * BINARY_CHUNK_SIZE;
      const end = Math.min(start + BINARY_CHUNK_SIZE, buf.length);
      const slice = buf.subarray(start, end);
      const dataUrl = 'data:application/zip;base64,' + slice.toString('base64');

      await db.collection('task_media').updateOne(
        { taskId: 'TSK-005', assetType: 'folder', chunkIndex: c },
        {
          $set: {
            taskId: 'TSK-005',
            assetType: 'folder',
            chunkIndex: c,
            totalChunks: 43,
            data: dataUrl,
            fileName: 'Diabetic-retinopathy IIIT Dharwad.zip',
            fileSize: '52.85 MB',
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
      console.log(`Restored chunk ${c}/43`);
    }

    const allChunks = await db.collection('task_media').find({ taskId: 'TSK-005' }, { projection: { data: 0 } }).sort({ chunkIndex: 1 }).toArray();
    console.log('All chunk count for TSK-005 now:', allChunks.length);
  } finally {
    await client.close();
  }
}

restoreMissingChunks().catch(console.error);
