import { connectToDatabase } from '../api/db.js';
import fs from 'fs';

async function testReconstruction() {
  const { client, db } = await connectToDatabase();
  try {
    const chunks = await db.collection('task_media')
      .find({ taskId: 'TSK-005', assetType: 'folder' })
      .sort({ chunkIndex: 1 })
      .toArray();

    console.log(`Found ${chunks.length} chunks for TSK-005`);
    const buffers = [];
    for (const c of chunks) {
      const b64 = c.data.replace(/^data:[^;]+;base64,/, '');
      buffers.push(Buffer.from(b64, 'base64'));
    }
    const combined = Buffer.concat(buffers);
    console.log('Reconstructed file size:', combined.length, 'bytes');

    // Compare with disk file
    const diskFile = fs.readFileSync('C:\\Users\\Maqsood M D\\Downloads\\Diabetic-retinopathy IIIT Dharwad.zip');
    console.log('Original disk file size:', diskFile.length, 'bytes');
    if (combined.length === diskFile.length) {
      console.log('PERFECT MATCH! Sizes are identical!');
      const match = combined.equals(diskFile);
      console.log('Exact byte match?', match);
    } else {
      console.log('Difference:', diskFile.length - combined.length);
    }
  } finally {
    await client.close();
  }
}

testReconstruction().catch(console.error);
