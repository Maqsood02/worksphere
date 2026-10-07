import fetch from 'node-fetch';

async function checkHeaders() {
  const fileId = '1No7TYfGhuXtBaWWjbiq662eFWqE4RBuZ';
  const url = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
  const res = await fetch(url, {
    headers: { Range: 'bytes=0-1000' }
  });
  console.log('Status:', res.status);
  console.log('All headers:');
  for (const [k, v] of res.headers.entries()) {
    console.log(`  ${k}: ${v}`);
  }
}

checkHeaders();
