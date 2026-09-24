import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('freelancedb');
  const mediaTasks = await db.collection('task_media').aggregate([
    { $group: { _id: { taskId: '$taskId', assetType: '$assetType' }, count: { $sum: 1 }, fileName: { $first: '$fileName' }, fileSize: { $first: '$fileSize' } } }
  ]).toArray();
  console.log('Media by task:', JSON.stringify(mediaTasks, null, 2));
  process.exit(0);
}

run();
