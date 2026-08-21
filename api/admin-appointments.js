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
    const col = db.collection('appointments');

    if (req.method === 'GET') {
      const list = await col.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const doc = {
        ...body,
        id: body.id || `apt_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await col.insertOne(doc);
      return res.status(200).json({ success: true, message: 'Appointment booked successfully in MongoDB', appointment: doc });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error) {
    console.error('[ADMIN APPOINTMENTS API ERROR]:', error);
    return res.status(200).json([]);
  }
}
