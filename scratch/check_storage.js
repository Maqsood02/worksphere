import { connectToDatabase } from '../api/db.js';

async function checkStats() {
  const { client, db } = await connectToDatabase();
  try {
    const stats = await db.stats();
    console.log('DB Stats:', {
      dataSizeMB: (stats.dataSize / 1024 / 1024).toFixed(2),
      storageSizeMB: (stats.storageSize / 1024 / 1024).toFixed(2),
      indexSizeMB: (stats.indexSize / 1024 / 1024).toFixed(2),
      totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2)
    });
    const collections = await db.listCollections().toArray();
    for (const c of collections) {
      try {
        const collStats = await db.command({ collStats: c.name });
        console.log(`Collection ${c.name}: count=${collStats.count}, sizeMB=${(collStats.size/1024/1024).toFixed(2)}, storageMB=${(collStats.storageSize/1024/1024).toFixed(2)}`);
      } catch(e) {
        console.log(`Collection ${c.name}: err ${e.message}`);
      }
    }
  } catch (err) {
    console.error('Error getting stats:', err);
  } finally {
    await client.close();
  }
}

checkStats();
