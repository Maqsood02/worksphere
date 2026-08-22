import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function deleteTsk002() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    
    // Delete task TSK-002 (title: 'n')
    const res = await db.collection('intern_tasks').deleteMany({
      $or: [
        { taskId: 'TSK-002' },
        { id: 'TSK-002' },
        { title: 'n' }
      ]
    });

    console.log(`Deleted ${res.deletedCount} task(s) from MongoDB Atlas.`);
    
    const remaining = await db.collection('intern_tasks').find({}).toArray();
    console.log("Remaining tasks in MongoDB Atlas:", remaining.map(t => ({ taskId: t.taskId || t.id, title: t.title, assignedTo: t.assignedTo, status: t.status })));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

deleteTsk002();
