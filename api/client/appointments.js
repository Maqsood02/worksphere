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
    const { username = 'client' } = req.query || {};
    const uKey = (req.headers['x-username'] || username).toLowerCase().trim();

    const { db } = await connectToDatabase();
    const col = db.collection('appointments');

    const list = await col.find({
      $or: [
        { clientId: { $regex: new RegExp(`^${uKey}$`, 'i') } },
        { clientName: { $regex: new RegExp(`^${uKey}$`, 'i') } }
      ]
    }).sort({ createdAt: -1 }).toArray();

    return res.status(200).json(list);
  } catch (err) {
    console.error('[CLIENT APPOINTMENTS ERROR]:', err);
    return res.status(200).json([]);
  }
}
