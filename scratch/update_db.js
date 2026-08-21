import { connectToDatabase } from '../api/db.js';

async function updateDb() {
  try {
    const { db } = await connectToDatabase();
    const usersCol = db.collection('users');
    
    const result = await usersCol.updateMany(
      { username: { $in: ['worksphere', 'workshpere', 'admin'] } },
      { $set: { 
          rawPassword: 'Worksphere@123',
          password: '$2a$10$8u14oPms8wU0320s0v9nTePqN35lqZ.qRkI5M3G9T3zU76I1qXzC6' // BCrypt placeholder or will be encoded
        } 
      }
    );

    console.log('MongoDB update count:', result.modifiedCount);
    const users = await usersCol.find({}).toArray();
    console.log('All Users in MongoDB:');
    users.forEach(u => {
      console.log(`- @${u.username} (${u.role}): rawPassword=${u.rawPassword}, email=${u.email}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  }
}

updateDb();
