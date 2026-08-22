import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function inspectTasks() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    const tasks = await db.collection('intern_tasks').find({}).toArray();
    console.log("Found tasks:", tasks.length);
    tasks.forEach(t => {
      console.log({
        _id: t._id,
        taskId: t.taskId || t.id,
        title: t.title,
        status: t.status,
        assignedTo: t.assignedTo,
        submissionUrl: t.submissionUrl,
        hasFileData: Boolean(t.fileData),
        fileDataLen: t.fileData ? t.fileData.length : 0,
        fileName: t.fileName,
        fileType: t.fileType,
        fileSize: t.fileSize
      });
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspectTasks();
