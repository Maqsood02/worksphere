import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function cleanProjects() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 6000 });
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    const db = client.db('freelancedb');

    // Delete the proposal / dummy project
    const delProj = await db.collection('projects').deleteMany({});
    console.log(`Deleted ${delProj.deletedCount} projects from MongoDB.`);

    // Delete any chat messages with Maqsood MD or dummy client chat logs
    const delChats = await db.collection('chat_messages').deleteMany({});
    console.log(`Deleted ${delChats.deletedCount} dummy chat messages from MongoDB.`);

    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

cleanProjects();
