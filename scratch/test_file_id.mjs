import fetch from 'node-fetch';

async function testFileId() {
  const fileId = '1FY_mPCMhPk_8oLYWlKpwztru_f2_k01R';
  const urls = [
    `https://drive.google.com/file/d/${fileId}/view`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${fileId}`
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { Range: 'bytes=0-1000' } });
      console.log(`URL: ${u}`);
      console.log(`Status: ${res.status}, Type: ${res.headers.get('content-type')}, Range: ${res.headers.get('content-range')}`);
    } catch (e) {
      console.log(e.message);
    }
  }
}

testFileId();
