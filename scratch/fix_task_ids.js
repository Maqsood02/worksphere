import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function fixTaskIds() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    const tasksCol = db.collection('intern_tasks');

    // 1. Update Task 1
    const res1 = await tasksCol.updateOne(
      { _id: new ObjectId('6a834687be25c8c97595b4a8') },
      { $set: { taskId: 'TSK-001', id: 'TSK-001', updatedAt: new Date() } }
    );
    console.log("Updated Task 1 (TSK-001):", res1.modifiedCount);

    // 2. Ensure Task 2 has both taskId and id 'TSK-002'
    const res2 = await tasksCol.updateOne(
      { _id: new ObjectId('6a8e66fcc405e88cdf1a3fb7') },
      { $set: { taskId: 'TSK-002', id: 'TSK-002', updatedAt: new Date() } }
    );
    console.log("Updated Task 2 (TSK-002):", res2.modifiedCount);

    // 3. Update Task 3 from TSK-004 to TSK-003
    const res3 = await tasksCol.updateOne(
      { _id: new ObjectId('6ab16b37566450db803f4b3c') },
      { $set: { taskId: 'TSK-003', id: 'TSK-003', updatedAt: new Date() } }
    );
    console.log("Updated Task 3 (TSK-003):", res3.modifiedCount);

    // 4. Verify all tasks in DB
    const all = await tasksCol.find({}, { projection: { taskId: 1, id: 1, title: 1, status: 1, assignedTo: 1 } }).toArray();
    console.log("Current Tasks in DB:", all);

    process.exit(0);
  } catch (err) {
    console.error("Error fixing task IDs:", err);
    process.exit(1);
  }
}

fixTaskIds();
