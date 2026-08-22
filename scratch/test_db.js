import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function purgeMockData() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 6000 });
  try {
    await client.connect();
    const db = client.db('freelancedb');
    console.log("Connected to MongoDB Atlas!");

    // 1. Delete ALL mock invoices (Revenue -> 0)
    const delInv = await db.collection('invoices').deleteMany({});
    console.log(`Deleted ${delInv.deletedCount} invoices.`);

    // 2. Delete ALL mock projects (Projects -> 0)
    const delProj = await db.collection('projects').deleteMany({});
    console.log(`Deleted ${delProj.deletedCount} projects.`);

    // 3. Delete ALL mock appointments (Appointments -> 0)
    const delApp = await db.collection('appointments').deleteMany({});
    console.log(`Deleted ${delApp.deletedCount} appointments.`);

    // 4. Delete ALL mock messages
    const delMsg = await db.collection('messages').deleteMany({});
    const delChat = await db.collection('chat_messages').deleteMany({});
    console.log(`Deleted ${delMsg.deletedCount + delChat.deletedCount} messages.`);

    // 5. Clean users: Keep ONLY worksphere (admin), maqsood (intern), Chinmaykv (intern)
    // Delete duplicate client Maqsood or dummy client
    const delUsers = await db.collection('users').deleteMany({
      $or: [
        { username: { $regex: /^client$/i } },
        { role: 'ROLE_CLIENT' }
      ]
    });
    console.log(`Deleted ${delUsers.deletedCount} dummy client users.`);

    // Ensure maqsood is explicitly ROLE_INTERN
    await db.collection('users').updateMany(
      { username: { $regex: /^maqsood$/i } },
      { $set: { role: 'ROLE_INTERN', name: 'Maqsood MD', email: 'maqsoodmd.ac.in@gmail.com', phone: '8792404950' } }
    );

    // Ensure Chinmaykv is explicitly ROLE_INTERN
    await db.collection('users').updateMany(
      { username: { $regex: /^chinmaykv$/i } },
      { $set: { role: 'ROLE_INTERN', name: 'Chinmay K V', email: 'chinmaykv555@gmail.com', phone: '7760674555' } }
    );

    // Ensure worksphere is explicitly ROLE_ADMIN
    await db.collection('users').updateMany(
      { username: { $regex: /^worksphere$/i } },
      { $set: { role: 'ROLE_ADMIN', name: 'Maqsood M D', email: 'worksphere.ac.in@gmail.com', phone: '8792404950' } }
    );

    const remainingUsers = await db.collection('users').find({}).toArray();
    console.log("Remaining Clean Users in MongoDB:", remainingUsers.map(u => ({ username: u.username, role: u.role, name: u.name })));

    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

purgeMockData();
