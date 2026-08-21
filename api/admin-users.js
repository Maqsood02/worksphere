import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const usersCol = db.collection('users');

    if (req.method === 'GET') {
      const allUsers = await usersCol.find({}).sort({ createdAt: -1 }).toArray();
      const sanitized = allUsers.map(u => ({
        id: u.id || (u._id ? u._id.toString() : u.username),
        username: u.username,
        name: u.name || u.username,
        email: u.email,
        phone: u.phone || '8792404950',
        role: u.role || 'ROLE_CLIENT',
        rawPassword: u.rawPassword || 'Worksphere@123',
        emailVerified: u.emailVerified ?? true,
        phoneVerified: u.phoneVerified ?? true
      }));
      return res.status(200).json({ success: true, users: sanitized, totalCount: sanitized.length });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const { username, name, email, phone, role, password } = body;
      if (!username || !email) {
        return res.status(400).json({ success: false, message: 'Username and Email are required.' });
      }
      const newUserDoc = {
        username: username.trim(),
        name: name || username,
        email: email.trim(),
        phone: phone || '8792404950',
        role: role || 'ROLE_CLIENT',
        rawPassword: password || 'Worksphere@123',
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date()
      };
      await usersCol.updateOne(
        { username: username.trim() },
        { $set: newUserDoc },
        { upsert: true }
      );
      return res.status(200).json({ success: true, message: `User @${username} saved to MongoDB successfully!`, user: newUserDoc });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error) {
    console.error('[ADMIN USERS API ERROR]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
