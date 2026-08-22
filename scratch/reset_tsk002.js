import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function resetTasks() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    
    // Reset TSK-002 so intern can upload their real document/folder fresh
    await db.collection('intern_tasks').updateOne(
      { $or: [{ taskId: 'TSK-002' }, { id: 'TSK-002' }] },
      {
        $set: {
          status: 'IN_PROGRESS',
          submissionUrl: '',
          submissionNotes: '',
          fileName: '',
          fileSize: '',
          fileType: '',
          fileData: '',
          updatedAt: new Date()
        }
      }
    );

    console.log("Reset TSK-002 to IN_PROGRESS so intern can upload their genuine document/folder.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetTasks();
