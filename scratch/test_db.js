import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function test() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    const db = client.db('freelancedb');
    const tasksCol = db.collection('intern_tasks');
    const tasks = await tasksCol.find({}).toArray();
    console.log("Found tasks in MongoDB Atlas:", tasks);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.close();
  }
}

test();
