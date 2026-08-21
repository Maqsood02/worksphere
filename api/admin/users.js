import { connectToDatabase } from '../db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Role, X-Username'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const col = db.collection('users');

    if (req.method === 'GET') {
      const list = await col.find({}).project({ password: 0 }).sort({ createdAt: -1 }).toArray();
      const sanitized = list.map(u => ({
        id: u.id || (u._id ? u._id.toString() : u.username),
        username: u.username,
        name: u.name || u.username,
        email: u.email,
        phone: u.phone || '8792404950',
        role: u.role || 'ROLE_CLIENT',
        rawPassword: u.rawPassword || '123456',
        emailVerified: u.emailVerified ?? true,
        phoneVerified: u.phoneVerified ?? true
      }));
      return res.status(200).json(sanitized);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const newUser = {
        ...body,
        id: body.id || `u_${Date.now()}`,
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date()
      };
      await col.insertOne(newUser);
      return res.status(200).json({ success: true, user: newUser });
    }

    if (req.method === 'DELETE') {
      const { username } = req.query || {};
      if (username) {
        await col.deleteOne({ username: new RegExp(`^${username}$`, 'i') });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(200).json([]);
  } catch (err) {
    console.error('[ADMIN USERS ERROR]:', err);
    return res.status(200).json([]);
  }
}
