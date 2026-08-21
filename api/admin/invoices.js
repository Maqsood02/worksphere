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
    const col = db.collection('invoices');

    if (req.method === 'GET') {
      const list = await col.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const newInv = {
        ...body,
        id: body.id || `inv_${Date.now()}`,
        createdAt: new Date()
      };
      await col.insertOne(newInv);
      return res.status(200).json({ success: true, invoice: newInv });
    }

    return res.status(200).json([]);
  } catch (err) {
    console.error('[ADMIN INVOICES ERROR]:', err);
    return res.status(200).json([]);
  }
}
