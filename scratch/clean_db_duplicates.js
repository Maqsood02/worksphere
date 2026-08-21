import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function cleanDuplicates() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas for deduplication...");
    const db = client.db('freelancedb');

    // 1. CLEAN USERS
    const usersCol = db.collection('users');
    const allUsers = await usersCol.find({}).toArray();
    console.log(`Found ${allUsers.length} total users in DB before cleanup.`);

    // Canonical accounts we want to preserve and standardize
    const canonicalUsers = [
      {
        username: 'worksphere',
        name: 'WorkSphere Administrator',
        email: 'worksphere.ac.in@gmail.com',
        phone: '8792404950',
        role: 'ROLE_ADMIN',
        rawPassword: 'Worksphere@123',
        password: 'Worksphere@123',
        emailVerified: true,
        phoneVerified: true
      },
      {
        username: 'maqsood',
        name: 'Maqsood MD',
        email: 'maqsoodmd.ac.in@gmail.com',
        phone: '8792404950',
        role: 'ROLE_INTERN',
        rawPassword: '123456',
        password: '123456',
        emailVerified: true,
        phoneVerified: true
      },
      {
        username: 'chinmaykv',
        name: 'Chinmay K V',
        email: 'chinmaykv555@gmail.com',
        phone: '7760674555',
        role: 'ROLE_INTERN',
        rawPassword: '123456',
        password: '123456',
        emailVerified: true,
        phoneVerified: true
      },
      {
        username: 'client',
        name: 'Maqsood MD',
        email: 'maqsoodmdhrl@gmail.com',
        phone: '8792404950',
        role: 'ROLE_CLIENT',
        rawPassword: '123456',
        password: '123456',
        emailVerified: true,
        phoneVerified: true
      }
    ];

    // Wipe malformed / duplicate users and re-insert clean canonical list
    await usersCol.deleteMany({});
    for (const u of canonicalUsers) {
      await usersCol.insertOne({
        ...u,
        id: `u_${u.username}`,
        createdAt: new Date()
      });
    }
    console.log("Canonical users set successfully. Total count: 4");

    // 2. CLEAN LEARNING MODULES
    const modCol = db.collection('learning_modules');
    const allMods = await modCol.find({}).toArray();
    console.log(`Found ${allMods.length} total learning modules in DB before cleanup.`);

    const seenModuleKeys = new Set();
    const duplicateIds = [];

    for (const m of allMods) {
      const key = `${(m.title || '').trim().toLowerCase()}:::${(m.assignedTo || 'ALL').trim().toLowerCase()}`;
      if (seenModuleKeys.has(key)) {
        duplicateIds.push(m._id);
      } else {
        seenModuleKeys.add(key);
      }
    }

    if (duplicateIds.length > 0) {
      await modCol.deleteMany({ _id: { $in: duplicateIds } });
      console.log(`Deleted ${duplicateIds.length} duplicate learning modules.`);
    }

    // Verify final state
    const finalUsers = await usersCol.find({}).toArray();
    console.log("FINAL USERS IN DB:", finalUsers.map(u => ({ username: u.username, email: u.email, role: u.role })));

    const finalMods = await modCol.find({}).toArray();
    console.log("FINAL LEARNING MODULES IN DB:", finalMods.map(m => ({ id: m.id, title: m.title, assignedTo: m.assignedTo, videoUrl: m.videoUrl })));

  } catch (err) {
    console.error("Deduplication error:", err);
  } finally {
    await client.close();
  }
}

cleanDuplicates();
