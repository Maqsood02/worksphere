import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    const cols = await db.listCollections().toArray();
    for (const c of cols) {
      const docs = await db.collection(c.name).find({ $or: [{ taskId: /TSK/i }, { id: /TSK/i }] }).toArray();
      if (docs.length > 0) {
        console.log('Collection:', c.name, docs.map(d => ({ _id: d._id, taskId: d.taskId, id: d.id, title: d.title })));
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
