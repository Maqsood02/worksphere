import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function checkUsers() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    const users = await db.collection('users').find({}).toArray();
    console.log("Current MongoDB Users:", users.map(u => ({
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role
    })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
