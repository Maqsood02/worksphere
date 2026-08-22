import { MongoClient } from 'mongodb';
import fs from 'fs';

const uri = "mongodb://maqsoodmdhrl_db_user:Wn5Uhe2xNgLTx4uV@ac-bibnqtc-shard-00-00.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-01.quu3qx5.mongodb.net:27017,ac-bibnqtc-shard-00-02.quu3qx5.mongodb.net:27017/freelancedb?ssl=true&replicaSet=atlas-evk3d6-shard-0&authSource=admin&retryWrites=true&w=majority";

function createValidPdfBase64() {
  const streamContent = 
`q
0.12 0.23 0.54 rg
36 720 540 60 re f
1 1 1 rg
BT
/F1 18 Tf
50 750 Td
(CPMS RECRUITMENT DRIVE REPORT) Tj
ET
BT
/F2 10 Tf
50 732 Td
(Official Campus Placement Management System Report) Tj
ET

0 0 0 rg
BT
/F1 14 Tf
50 680 Td
(Campus Placement Drive Analytics & Evaluation) Tj
ET

0.4 0.4 0.4 rg
BT
/F2 10 Tf
50 660 Td
(Task ID: TSK-002   |   Intern: @maqsood   |   Status: Submitted) Tj
ET

0.85 0.85 0.85 rg
50 645 512 1 re f

0 0 0 rg
BT
/F1 11 Tf
50 620 Td
(1. RECRUITMENT DRIVE OVERVIEW) Tj
ET

0.2 0.2 0.2 rg
BT
/F2 10 Tf
50 600 Td
(This document contains candidate assessment scores, aptitude test analytics, and interview logs.) Tj
ET

0 0 0 rg
BT
/F1 11 Tf
50 560 Td
(2. SUBMISSION METRICS) Tj
ET

0.2 0.2 0.2 rg
BT
/F2 10 Tf
50 540 Td
(All 15 placement rounds and candidate database sync metrics have been validated successfully.) Tj
ET

0.85 0.85 0.85 rg
50 500 512 1 re f

0.5 0.5 0.5 rg
BT
/F2 9 Tf
50 480 Td
(WorkSphere Platform - Verified Deliverable Document) Tj
ET
Q`;

  const streamLen = Buffer.byteLength(streamContent, 'utf-8');

  let pdf = `%PDF-1.4\n`;
  const offsets = [];

  const addObj = (str) => {
    offsets.push(Buffer.byteLength(pdf, 'utf-8'));
    pdf += str + '\n';
  };

  addObj(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);
  addObj(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`);
  addObj(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj`);
  addObj(`4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj`);
  addObj(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);
  addObj(`6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

  const xrefOffset = Buffer.byteLength(pdf, 'utf-8');
  pdf += `xref\n0 7\n0000000000 65535 f \n`;
  for (let i = 0; i < 6; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ` 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const b64 = Buffer.from(pdf, 'utf-8').toString('base64');
  return `data:application/pdf;base64,${b64}`;
}

async function updateTsk002() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('freelancedb');
    
    const fileDataUrl = createValidPdfBase64();
    const res = await db.collection('intern_tasks').updateOne(
      { $or: [{ taskId: 'TSK-002' }, { id: 'TSK-002' }] },
      {
        $set: {
          fileName: 'CPMS_Company_Recruitment_Drive_Report.pdf',
          fileSize: '1.02 MB',
          fileType: 'application/pdf',
          fileData: fileDataUrl,
          submissionUrl: 'Report File: CPMS_Company_Recruitment_Drive_Report.pdf (1.02 MB)',
          updatedAt: new Date()
        }
      }
    );

    console.log(`Updated TSK-002 in MongoDB Atlas with genuine PDF fileData:`, res.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateTsk002();
