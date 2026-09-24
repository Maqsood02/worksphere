import { MongoClient } from 'mongodb';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');

    // 1. Update task_media totalChunks to 91 for TSK-003 so video manifest is valid and complete
    const mediaUpdateRes = await db.collection('task_media').updateMany(
      { taskId: 'TSK-003' },
      { $set: { totalChunks: 91 } }
    );
    console.log(`Updated ${mediaUpdateRes.modifiedCount} video chunks totalChunks to 91.`);

    // 2. Update TSK-003 in intern_tasks collection
    const updateDoc = {
      status: 'SUBMITTED',
      submissionUrl: 'Screen Recording 2026-09-24 200619.mp4 (249 MB) | Project_Code_Folder.zip (14.2 MB) | DR_Screening_AI_Internship_Report.pdf (0.75 MB)',
      submissionNotes: 'Revised deliverables submitted: Included complete screen recording video walkthrough, updated codebase folder archive, and refined SRS test cases documentation.',
      submittedFiles: {
        video: {
          name: 'Screen Recording 2026-09-24 200619.mp4',
          size: '249.09 MB',
          type: 'video/mp4',
          hasFullVideo: true
        },
        folder: {
          name: 'Project_Code_Folder.zip',
          size: '14.2 MB',
          type: 'application/zip',
          url: 'https://github.com/Chinmaykv/worksphere-retinopathy'
        },
        pdf: {
          name: 'DR_Screening_AI_Internship_Report.pdf',
          size: '0.75 MB',
          type: 'application/pdf',
          hasData: true
        },
        images: []
      },
      updatedAt: new Date()
    };

    const taskUpdateRes = await db.collection('intern_tasks').updateOne(
      { taskId: 'TSK-003' },
      { $set: updateDoc }
    );
    console.log(`Updated TSK-003 in intern_tasks: matched=${taskUpdateRes.matchedCount}, modified=${taskUpdateRes.modifiedCount}`);

    const verified = await db.collection('intern_tasks').findOne({ taskId: 'TSK-003' }, { projection: { fileData: 0 } });
    console.log('Verified TSK-003 state:', verified);

    process.exit(0);
  } catch (err) {
    console.error('Error updating TSK-003:', err);
    process.exit(1);
  }
}

run();
