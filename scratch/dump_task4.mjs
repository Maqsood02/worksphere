import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('freelancedb');
  const t = await db.collection('intern_tasks').findOne({
    $or: [{ taskId: 'TSK-004' }, { title: /Task 4/i }]
  });
  for (const [k, v] of Object.entries(t)) {
    if (k !== 'data' && k !== 'fileData') {
      console.log(`${k}:`, typeof v === 'object' ? JSON.stringify(v) : v);
    }
  }
  await client.close();
}

main().catch(console.error);
