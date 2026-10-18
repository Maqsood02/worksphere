import { connectToDatabase } from '../api/db.js';

async function checkTaskMedia() {
  const { client, db } = await connectToDatabase();
  try {
    const taskMedia = db.collection('task_media');
    const docs = await taskMedia.find({}, { projection: { data: 0, content: 0, base64: 0, buffer: 0, fileData: 0 } }).toArray();
    console.log('task_media count:', docs.length);
    console.log('Sample task_media docs (without heavy fields):', docs.slice(0, 10));

    // Check fields of a sample doc
    const sample = await taskMedia.findOne();
    if (sample) {
      const keys = Object.keys(sample);
      console.log('Sample keys:', keys);
      for (const k of keys) {
        const val = sample[k];
        const len = typeof val === 'string' ? val.length : (Buffer.isBuffer(val) ? val.length : (typeof val === 'object' ? JSON.stringify(val).length : typeof val));
        console.log(`Key ${k}: type=${typeof val}, length/size=${len}`);
      }
    }
  } finally {
    await client.close();
  }
}

checkTaskMedia();
