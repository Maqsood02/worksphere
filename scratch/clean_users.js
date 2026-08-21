import { connectToDatabase } from '../api/db.js';

async function cleanUsers() {
  try {
    const { db } = await connectToDatabase();
    const usersCol = db.collection('users');

    // Remove all duplicate/fragmented user entries
    await usersCol.deleteMany({});

    // Clean, structured unique users list
    const cleanUsersList = [
      {
        id: 'u_admin_1',
        username: 'worksphere',
        name: 'Maqsood M D',
        email: 'worksphere.ac.in@gmail.com',
        phone: '8792404950',
        role: 'ROLE_ADMIN',
        rawPassword: 'Worksphere@123',
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date()
      },
      {
        id: 'u_intern_1',
        username: 'maqsood',
        name: 'Maqsood MD',
        email: 'maqsoodmd.ac.in@gmail.com',
        phone: '8792404950',
        role: 'ROLE_INTERN',
        rawPassword: '123456',
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date()
      },
      {
        id: 'u_intern_2',
        username: 'chinmaykv',
        name: 'Chinmay K V',
        email: 'chinmaykv555@gmail.com',
        phone: '7760674555',
        role: 'ROLE_INTERN',
        rawPassword: '123456',
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date()
      },
      {
        id: 'u_client_1',
        username: 'client',
        name: 'Maqsood MD',
        email: 'maqsoodmdhrl@gmail.com',
        phone: '8792404950',
        role: 'ROLE_CLIENT',
        rawPassword: '123456',
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date()
      }
    ];

    await usersCol.insertMany(cleanUsersList);

    console.log('MongoDB Atlas Users collection successfully cleaned & reseeded:');
    const allUsers = await usersCol.find({}).toArray();
    allUsers.forEach(u => {
      console.log(`- Username: ${u.username} | Role: ${u.role} | Email: ${u.email} | Password: ${u.rawPassword}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error cleaning users in MongoDB:', err);
    process.exit(1);
  }
}

cleanUsers();
