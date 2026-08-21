import handler from '../api/index.js';

async function testEmail() {
  console.log('Testing Learning Module Email via unified handler...');
  const req = {
    method: 'POST',
    url: '/api/send-learning-module-email',
    body: {
      assignedTo: 'maqsood',
      username: 'maqsood',
      internName: 'Maqsood MD',
      toEmail: 'maqsoodmd.ac.in@gmail.com',
      moduleTitle: 'Convolutional Neural Networks (CNN) Deep Dive',
      category: 'Frontend',
      track: 'Full-Stack Software Engineering',
      description: 'Explore neural network architectures, image feature extraction, and real-time inference.',
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

testEmail().catch(console.error);
