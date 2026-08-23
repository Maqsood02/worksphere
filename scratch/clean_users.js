import { connectToDatabase } from '../api/db.js';

async function run() {
  const { client, db } = await connectToDatabase();
  const usersCol = db.collection('users');

  // Remove duplicate entries
  await usersCol.deleteMany({
    username: { $in: ['Chinmaykv', 'Maqsood', 'client', 'workshpere'] }
  });

  // Ensure canonical user data
  await usersCol.updateOne(
    { username: 'maqsood' },
    { $set: { name: 'Maqsood MD', role: 'ROLE_INTERN', email: 'maqsoodmdhrl@gmail.com', phone: '8792404950' } },
    { upsert: true }
  );

  await usersCol.updateOne(
    { username: 'chinmaykv' },
    { $set: { name: 'Chinmay K V', role: 'ROLE_INTERN', email: 'chinmaykv555@gmail.com', phone: '7760674555' } },
    { upsert: true }
  );

  await usersCol.updateOne(
    { username: 'worksphere' },
    { $set: { name: 'Maqsood M D', role: 'ROLE_ADMIN', email: 'worksphere.ac.in@gmail.com', phone: '8792404950' } },
    { upsert: true }
  );

  const remaining = await usersCol.find({}).toArray();
  console.log('Final Cleaned Users in DB:', remaining.map(u => ({ username: u.username, role: u.role, email: u.email })));
  await client.close();
}

run();
