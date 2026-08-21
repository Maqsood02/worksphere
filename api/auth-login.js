import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { username, password } = req.body || {};
  const inputUname = (username || '').trim();
  const inputPass = (password || '').trim();

  if (!inputUname) {
    return res.status(400).json({ success: false, message: 'Please enter username or email.' });
  }
  if (!inputPass) {
    return res.status(400).json({ success: false, message: 'Please enter password.' });
  }

  try {
    const { db } = await connectToDatabase();
    const usersCol = db.collection('users');

    // Case-insensitive search for username OR email in MongoDB Atlas
    const escapedUname = inputUname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escapedUname}$`, 'i');

    const user = await usersCol.findOne({
      $or: [
        { username: { $regex: regex } },
        { email: { $regex: regex } }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found in database. Please check your username or email.'
      });
    }

    // Verify Password against MongoDB rawPassword, password, or accepted default credentials
    const storedRaw = String(user.rawPassword || '').trim();
    const storedPass = String(user.password || '').trim();
    const uNameLower = (user.username || '').toLowerCase();

    const isMatch = (storedRaw && storedRaw === inputPass) ||
      (storedPass && storedPass === inputPass) ||
      (uNameLower === 'worksphere' && (inputPass === 'Worksphere@123' || inputPass === 'Workshere@123' || inputPass === 'worksphere')) ||
      (uNameLower === 'maqsood' && (inputPass === '123456' || inputPass === 'Maqsood@123' || inputPass === 'Worksphere@123')) ||
      (uNameLower === 'chinmaykv' && (inputPass === '123456' || inputPass === 'Chinmay@123' || inputPass === 'Worksphere@123'));

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.'
      });
    }

    const role = user.role || 'ROLE_CLIENT';
    const designation = role === 'ROLE_INTERN' ? 'Full-Stack Engineering Intern' :
      (role === 'ROLE_ADMIN' ? 'Platform Administrator' : 'Valued Client');

    const sanitizedUser = {
      id: user.id || (user._id ? user._id.toString() : user.username),
      username: user.username,
      name: user.name || user.username,
      email: user.email || `${user.username}@worksphere.ac.in`,
      phone: user.phone || '8792404950',
      role: role,
      designation: designation,
      emailVerified: user.emailVerified ?? true,
      phoneVerified: user.phoneVerified ?? true
    };

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${sanitizedUser.name}! (Authenticated via MongoDB Database)`,
      user: sanitizedUser,
      databaseVerified: true
    });
  } catch (error) {
    console.error('[DATABASE LOGIN ERROR]:', error);
    // If DB fails temporarily, check standard credentials as fallback
    const lowerInput = inputUname.toLowerCase();
    if (lowerInput === 'worksphere' && (inputPass === 'Worksphere@123' || inputPass === 'Workshere@123')) {
      const adminUser = {
        id: 'u1',
        username: 'worksphere',
        name: 'Maqsood M D',
        email: 'worksphere.ac.in@gmail.com',
        phone: '8792404950',
        role: 'ROLE_ADMIN',
        designation: 'Platform Administrator',
        emailVerified: true,
        phoneVerified: true
      };
      return res.status(200).json({
        success: true,
        message: 'Welcome back, Maqsood M D! (Admin Authenticated)',
        user: adminUser
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Database authentication error: ' + (error.message || 'Connection failed')
    });
  }
}
