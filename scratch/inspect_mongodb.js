import { connectToDatabase } from '../api/db.js';

async function inspectDb() {
  const { client, db } = await connectToDatabase();
  try {
    const collections = await db.listCollections().toArray();
    console.log('Collections in freelancedb:', collections.map(c => c.name));

    for (const collName of collections.map(c => c.name)) {
      const coll = db.collection(collName);
      const count = await coll.countDocuments();
      console.log(`\n--- Collection: ${collName} (${count} docs) ---`);
      if (count > 0 && count < 20) {
        const docs = await coll.find({}).toArray();
        console.log(JSON.stringify(docs, null, 2).slice(0, 1500));
      } else if (count >= 20) {
        const sample = await coll.find({}).limit(3).toArray();
        console.log('Sample docs:', JSON.stringify(sample, null, 2).slice(0, 1000));
      }
    }
  } finally {
    await client.close();
  }
}

inspectDb().catch(console.error);
