import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function cleanDatabase() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 6000 });
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    const db = client.db('freelancedb');

    // 1. Delete all dummy invoices (reset revenue to 0)
    const delInvs = await db.collection('invoices').deleteMany({});
    console.log(`Deleted ${delInvs.deletedCount} dummy invoices.`);

    // 2. Delete all dummy appointments (reset appointments to 0)
    const delApps = await db.collection('appointments').deleteMany({});
    console.log(`Deleted ${delApps.deletedCount} dummy appointments.`);

    // 3. Clean users collection to have exactly:
    // admin (@worksphere), intern1 (@maqsood), intern2 (@chinmaykv), client (@client)
    await db.collection('users').deleteMany({
      $or: [
        { username: { $regex: /^workshpere$/i } },
        { username: 'Maqsood', role: 'ROLE_CLIENT' }
      ]
    });

    // Ensure Chinmaykv is normalized
    await db.collection('users').deleteMany({ username: { $regex: /^chinmaykv$/i } });
    await db.collection('users').insertOne({
      username: 'Chinmaykv',
      name: 'Chinmay K V',
      email: 'chinmaykv555@gmail.com',
      phone: '7760674555',
      role: 'ROLE_INTERN',
      rawPassword: 'Worksphere@123',
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date()
    });

    // Ensure Maqsood intern is normalized
    await db.collection('users').deleteMany({ username: { $regex: /^maqsood$/i } });
    await db.collection('users').insertOne({
      username: 'maqsood',
      name: 'Maqsood MD',
      email: 'maqsoodmd.ac.in@gmail.com',
      phone: '8792404950',
      role: 'ROLE_INTERN',
      rawPassword: 'Worksphere@123',
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date()
    });

    // Ensure Worksphere admin is normalized
    await db.collection('users').deleteMany({ username: { $regex: /^worksphere$/i } });
    await db.collection('users').insertOne({
      username: 'worksphere',
      name: 'Maqsood M D',
      email: 'worksphere.ac.in@gmail.com',
      phone: '8792404950',
      role: 'ROLE_ADMIN',
      rawPassword: 'Worksphere@123',
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date()
    });

    // Ensure Client is normalized
    await db.collection('users').deleteMany({ username: { $regex: /^client$/i } });
    await db.collection('users').insertOne({
      username: 'client',
      name: 'Maqsood MD',
      email: 'maqsoodmdhrl@gmail.com',
      phone: '8792404950',
      role: 'ROLE_CLIENT',
      rawPassword: 'Worksphere@123',
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date()
    });

    const finalUsers = await db.collection('users').find({}).toArray();
    console.log("FINAL USERS:", JSON.stringify(finalUsers.map(u => ({ username: u.username, role: u.role, name: u.name }))));

    const finalInvs = await db.collection('invoices').countDocuments();
    const finalApps = await db.collection('appointments').countDocuments();
    console.log(`FINAL INVOICES COUNT: ${finalInvs}, FINAL APPOINTMENTS COUNT: ${finalApps}`);

    process.exit(0);
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
}

cleanDatabase();
