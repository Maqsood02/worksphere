import handler from '../api/index.js';

async function testBroadcastEmail() {
  console.log('Testing Broadcast Learning Module Email (Maqsood + Chinmay)...');
  const req = {
    method: 'POST',
    url: '/api/send-learning-module-email',
    body: {
      assignedTo: 'ALL',
      moduleTitle: 'Deep Learning & CNN Image Classification',
      category: 'AI & Automation',
      track: 'Full-Stack Software Engineering',
      description: 'Explore dataset preprocessing, model architecture, training, and web inference.',
      videoUrl: 'https://youtu.be/3iwqwbcy7Sw?si=2coe-LZVF2Kjh7Hd',
      resourceUrl: 'https://react.dev'
    }
  };

  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) {
      console.log('Response Status:', this.statusCode);
      console.log('Response Data:', JSON.stringify(data, null, 2));
      return this;
    },
    end() {}
  };

  await handler(req, res);
}

testBroadcastEmail().catch(console.error);
