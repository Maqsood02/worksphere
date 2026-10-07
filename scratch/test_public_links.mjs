import fetch from 'node-fetch';

async function testPublicUrls() {
  const fileId = '1No7TYfGhuXtBaWWjbiq662eFWqE4RBuZ';
  const urls = [
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
    `https://lh3.googleusercontent.com/d/${fileId}`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Range: 'bytes=0-100' },
        redirect: 'manual'
      });
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status}, Location: ${res.headers.get('location')}, Content-Type: ${res.headers.get('content-type')}`);
    } catch (e) {
      console.log(`URL ${url} error:`, e.message);
    }
  }
}

testPublicUrls();
