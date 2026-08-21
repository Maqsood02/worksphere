import { connectToDatabase } from '../db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Role, X-Username'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const authHeader = req.headers['authorization'] || '';
    const usernameHeader = req.headers['x-username'] || req.query.username || '';

    if (!usernameHeader && !authHeader) {
      return res.status(200).json({ authenticated: false, message: 'Not logged in' });
    }

    const { db } = await connectToDatabase();
    const usersCol = db.collection('users');

    const uKey = usernameHeader.toLowerCase().trim();
    const user = await usersCol.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${uKey}$`, 'i') } },
        { email: { $regex: new RegExp(`^${uKey}$`, 'i') } }
      ]
    });

    if (user) {
      const sanitized = {
        id: user.id || (user._id ? user._id.toString() : user.username),
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone || '8792404950',
        role: user.role || 'ROLE_CLIENT',
        designation: user.role === 'ROLE_INTERN' ? 'Full-Stack Engineering Intern' :
          (user.role === 'ROLE_ADMIN' ? 'Platform Administrator' : 'Valued Client')
      };
      return res.status(200).json({ authenticated: true, user: sanitized });
    }

    return res.status(200).json({ authenticated: false });
  } catch (err) {
    return res.status(200).json({ authenticated: false });
  }
}
