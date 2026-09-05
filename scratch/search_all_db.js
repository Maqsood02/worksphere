import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function searchAll() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    const collections = await db.listCollections().toArray();
    console.log('Collections in freelancedb:', collections.map(c => c.name));

    for (const c of collections) {
      const name = c.name;
      const match = await db.collection(name).findOne({
        $or: [
          { fileName: /1000081403/i },
          { name: /1000081403/i },
          { 'submittedFiles.video.name': /1000081403/i }
        ]
      });
      if (match) {
        console.log('MATCH in collection ' + name + ':', {
          _id: match._id,
          taskId: match.taskId || match.id,
          fileName: match.fileName,
          fileSize: match.fileSize,
          hasFileData: Boolean(match.fileData),
          dataLen: match.data ? match.data.length : (match.fileData ? match.fileData.length : 0)
        });
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

searchAll();
