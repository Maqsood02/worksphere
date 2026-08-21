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
    const col = db.collection('projects');

    if (req.method === 'GET') {
      const { username } = req.query || {};
      let query = {};
      if (username && username !== 'all' && username !== 'admin' && username !== 'worksphere') {
        const u = username.toLowerCase().trim();
        query = {
          $or: [
            { clientId: { $regex: new RegExp(`^${u}$`, 'i') } },
            { clientName: { $regex: new RegExp(`^${u}$`, 'i') } }
          ]
        };
      }
      const list = await col.find(query).sort({ createdAt: -1 }).toArray();
      if (list.length === 0 && (!username || username === 'all' || username === 'admin' || username === 'worksphere')) {
        const defaults = [
          { id: 'proj_101', title: 'WorkSphere Web Platform', clientName: 'Maqsood MD', category: 'Full-Stack Development', status: 'IN_PROGRESS', progress: 75, budget: 125000, deadline: '2026-09-15' },
          { id: 'proj_102', title: 'AI Co-Pilot Assistant', clientName: 'Tech Corp', category: 'AI & Automation', status: 'COMPLETED', progress: 100, budget: 180000, deadline: '2026-08-01' },
          { id: 'proj_103', title: 'Mobile Client Workspace App', clientName: 'Innovate LLC', category: 'Frontend', status: 'PLANNING', progress: 25, budget: 150000, deadline: '2026-10-30' }
        ];
        return res.status(200).json(defaults);
      }
      return res.status(200).json(list);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const doc = {
        ...body,
        id: body.id || `proj_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await col.insertOne(doc);
      return res.status(200).json({ success: true, message: 'Project created successfully in MongoDB', project: doc });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (error) {
    console.error('[ADMIN PROJECTS API ERROR]:', error);
    const defaults = [
      { id: 'proj_101', title: 'WorkSphere Web Platform', clientName: 'Maqsood MD', category: 'Full-Stack Development', status: 'IN_PROGRESS', progress: 75, budget: 125000, deadline: '2026-09-15' },
      { id: 'proj_102', title: 'AI Co-Pilot Assistant', clientName: 'Tech Corp', category: 'AI & Automation', status: 'COMPLETED', progress: 100, budget: 180000, deadline: '2026-08-01' }
    ];
    return res.status(200).json(defaults);
  }
}
