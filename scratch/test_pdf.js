import fs from 'fs';

function generateRealPdf({ title, internName, username, taskId, notes, deadline }) {
  const sanitize = (str) => (str || '').replace(/[\r\n]+/g, ' ').replace(/[()]/g, '');
  const tTitle = sanitize(title || 'CPMS Company Recruitment Drive Report');
  const tIntern = sanitize(internName || username || 'Maqsood MD');
  const tTaskId = sanitize(taskId || 'TSK-002');
  const tNotes = sanitize(notes || 'Completed comprehensive recruitment drive analysis and test evaluation report.');
  const tDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Build stream content in PDF PostScript syntax
  const streamContent = 
`q
0.12 0.23 0.54 rg
36 720 540 60 re f
1 1 1 rg
BT
/F1 18 Tf
50 750 Td
(WORKSPHERE TECHNOLOGIES - INTERNSHIP REPORT) Tj
ET
BT
/F2 10 Tf
50 732 Td
(Official Project Deliverable & Engineering Verification Document) Tj
ET

0 0 0 rg
BT
/F1 14 Tf
50 680 Td
(${tTitle}) Tj
ET

0.4 0.4 0.4 rg
BT
/F2 10 Tf
50 660 Td
(Task ID: ${tTaskId}   |   Intern: @${username || 'maqsood'}   |   Date: ${tDate}) Tj
ET

0.85 0.85 0.85 rg
50 645 512 1 re f

0 0 0 rg
BT
/F1 11 Tf
50 620 Td
(1. EXECUTIVE SUMMARY & DELIVERABLE OBJECTIVE) Tj
ET

0.2 0.2 0.2 rg
BT
/F2 10 Tf
50 600 Td
(This report presents the complete campus placement recruitment metrics and test drive analysis.) Tj
ET

0 0 0 rg
BT
/F1 11 Tf
50 560 Td
(2. INTERN EXECUTION & SUBMISSION NOTES) Tj
ET

0.2 0.2 0.2 rg
BT
/F2 10 Tf
50 540 Td
(${tNotes.substring(0, 120)}) Tj
ET

0 0 0 rg
BT
/F1 11 Tf
50 500 Td
(3. VERIFICATION & APPROVAL STATUS) Tj
ET

0.05 0.6 0.2 rg
BT
/F1 10 Tf
50 480 Td
(STATUS: VERIFIED OFFICIAL SUBMISSION - READY FOR SUPERVISOR EVALUATION) Tj
ET

0.85 0.85 0.85 rg
50 450 512 1 re f

0.5 0.5 0.5 rg
BT
/F2 9 Tf
50 430 Td
(WorkSphere Platform Certification Authority - Cryptographically Logged Asset) Tj
ET
Q`;

  const streamLen = Buffer.byteLength(streamContent, 'utf-8');

  let pdf = `%PDF-1.4\n`;
  const offsets = [];

  const addObj = (str) => {
    offsets.push(Buffer.byteLength(pdf, 'utf-8'));
    pdf += str + '\n';
  };

  // Obj 1: Catalog
  addObj(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);

  // Obj 2: Pages
  addObj(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`);

  // Obj 3: Page
  addObj(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj`);

  // Obj 4: Contents
  addObj(`4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj`);

  // Obj 5: Font F1 (Helvetica-Bold)
  addObj(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);

  // Obj 6: Font F2 (Helvetica)
  addObj(`6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

  const xrefOffset = Buffer.byteLength(pdf, 'utf-8');
  pdf += `xref\n0 7\n0000000000 65535 f \n`;
  for (let i = 0; i < 6; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ` 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf-8');
}

const buffer = generateRealPdf({
  title: 'CPMS Company Recruitment Drive Report',
  internName: 'Maqsood MD',
  username: 'maqsood',
  taskId: 'TSK-002',
  notes: 'Completed sprint deliverable implementation and testing report submitted.'
});

fs.writeFileSync('scratch/test_report.pdf', buffer);
console.log('PDF written successfully! Size:', buffer.length);
