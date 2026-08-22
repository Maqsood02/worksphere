import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function cleanUsers() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    
    // Delete the dummy client user
    await db.collection('users').deleteMany({
      $or: [
        { username: 'client' },
        { email: 'maqsoodmdhrl@gmail.com' }
      ]
    });

    // Ensure maqsood is ROLE_INTERN
    await db.collection('users').updateOne(
      { username: new RegExp('^maqsood$', 'i') },
      {
        $set: {
          username: 'maqsood',
          name: 'Maqsood MD',
          email: 'maqsoodmd.ac.in@gmail.com',
          phone: '8792404950',
          role: 'ROLE_INTERN',
          emailVerified: true,
          phoneVerified: true
        }
      },
      { upsert: true }
    );

    // Ensure Chinmaykv is ROLE_INTERN
    await db.collection('users').updateOne(
      { username: new RegExp('^chinmaykv$', 'i') },
      {
        $set: {
          username: 'Chinmaykv',
          name: 'Chinmay K V',
          email: 'chinmaykv555@gmail.com',
          phone: '7760674555',
          role: 'ROLE_INTERN',
          emailVerified: true,
          phoneVerified: true
        }
      },
      { upsert: true }
    );

    // Ensure worksphere is ROLE_ADMIN
    await db.collection('users').updateOne(
      { username: new RegExp('^worksphere$', 'i') },
      {
        $set: {
          username: 'worksphere',
          name: 'Maqsood M D',
          email: 'worksphere.ac.in@gmail.com',
          phone: '8792404950',
          role: 'ROLE_ADMIN',
          emailVerified: true,
          phoneVerified: true
        }
      },
      { upsert: true }
    );

    const users = await db.collection('users').find({}).toArray();
    console.log("Verified Clean MongoDB Users (Total:", users.length, "):");
    console.log(users.map(u => ({
      username: `@${u.username}`,
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

cleanUsers();
