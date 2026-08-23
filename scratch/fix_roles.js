import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function fixRoles() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    const usersCol = db.collection('users');
    const profilesCol = db.collection('intern_profiles');

    // 1. Remove duplicate Maqsood records
    await usersCol.deleteMany({
      $or: [
        { username: { $regex: /^maqsood$/i } },
        { email: { $in: ['maqsoodmdhrl@gmail.com', 'maqsoodmd.ac.in@gmail.com'] } }
      ]
    });

    // 2. Insert single clean Maqsood intern account
    await usersCol.insertOne({
      id: 'u2',
      username: 'maqsood',
      name: 'Maqsood MD',
      email: 'maqsoodmdhrl@gmail.com',
      phone: '8792404950',
      role: 'ROLE_INTERN',
      designation: 'Full-Stack Engineering Intern',
      rawPassword: '123456',
      password: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1Wq7yvN6Z8jG4Nq7pI1pA7.k9J2KGy',
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 3. Ensure Chinmaykv is ROLE_INTERN
    await usersCol.updateOne(
      { username: { $regex: /^chinmaykv$/i } },
      {
        $set: {
          username: 'chinmaykv',
          name: 'Chinmay K V',
          email: 'chinmaykv555@gmail.com',
          phone: '7760674555',
          role: 'ROLE_INTERN',
          designation: 'Full-Stack Engineering Intern',
          rawPassword: '123456',
          emailVerified: true,
          phoneVerified: true,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    // 4. Ensure Worksphere is ROLE_ADMIN
    await usersCol.updateOne(
      { username: { $regex: /^worksphere$/i } },
      {
        $set: {
          username: 'worksphere',
          name: 'Maqsood M D',
          email: 'worksphere.ac.in@gmail.com',
          phone: '8792404950',
          role: 'ROLE_ADMIN',
          designation: 'Platform Administrator',
          rawPassword: 'Worksphere@123',
          emailVerified: true,
          phoneVerified: true,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    // 5. Ensure intern profiles exist for both interns
    await profilesCol.updateOne(
      { username: 'maqsood' },
      {
        $set: {
          username: 'maqsood',
          name: 'Maqsood MD',
          email: 'maqsoodmdhrl@gmail.com',
          phone: '8792404950',
          track: 'Full-Stack Software Engineering',
          stipendType: 'UNPAID',
          stipendAmount: 'Unpaid (Academic Credit)',
          mentorName: 'Unassigned Mentor',
          mentorEmail: 's.jenkins@worksphere.ac.in',
          startDate: '2026-06-01',
          endDate: '2026-08-31',
          performanceRating: 'Active Intern',
          certificateStatus: 'NOT_ISSUED',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    await profilesCol.updateOne(
      { username: 'chinmaykv' },
      {
        $set: {
          username: 'chinmaykv',
          name: 'Chinmay K V',
          email: 'chinmaykv555@gmail.com',
          phone: '7760674555',
          track: 'Full-Stack Software Engineering',
          stipendType: 'UNPAID',
          stipendAmount: 'Unpaid (Academic Credit)',
          mentorName: 'Unassigned Mentor',
          mentorEmail: 's.jenkins@worksphere.ac.in',
          startDate: '2026-06-01',
          endDate: '2026-08-31',
          performanceRating: 'Active Intern',
          certificateStatus: 'NOT_ISSUED',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    const finalUsers = await usersCol.find({}).toArray();
    console.log("Updated MongoDB Users List:");
    console.log(finalUsers.map(u => ({
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role
    })));

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fixRoles();
