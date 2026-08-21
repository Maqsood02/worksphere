import handler from '../api/index.js';

async function testLearningModulesCRUD() {
  console.log('--- TEST 1: POST /api/learning-modules ---');
  let postData = null;
  const reqPost = {
    method: 'POST',
    url: '/api/learning-modules',
    body: {
      title: 'cnn',
      category: 'Frontend',
      track: 'ALL Tracks',
      assignedTo: 'maqsood',
      targetInternEmail: 'maqsoodmd.ac.in@gmail.com',
      targetInternName: 'Maqsood MD',
      description: 'Convolutional Neural Networks video tutorial and implementation.',
      videoUrl: 'https://youtu.be/3iwqwbcy7Sw?si=2coe-LZVF2Kjh7Hd',
      resourceUrl: '',
      sendEmail: true
    }
  };
  const resPost = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { postData = data; return this; },
    end() {}
  };
  await handler(reqPost, resPost);
  console.log('POST Result:', JSON.stringify(postData, null, 2));

  console.log('\n--- TEST 2: GET /api/learning-modules ---');
  let getData = null;
  const reqGet = {
    method: 'GET',
    url: '/api/learning-modules'
  };
  const resGet = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { getData = data; return this; },
    end() {}
  };
  await handler(reqGet, resGet);
  console.log('GET Modules count:', getData?.modules?.length);
  console.log('GET Modules:', JSON.stringify(getData?.modules, null, 2));

  console.log('\n--- TEST 3: GET /api/intern-overview?username=maqsood ---');
  let overviewData = null;
  const reqOverview = {
    method: 'GET',
    url: '/api/intern-overview?username=maqsood',
    query: { username: 'maqsood' },
    headers: { 'x-username': 'maqsood' }
  };
  const resOverview = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { overviewData = data; return this; },
    end() {}
  };
  await handler(reqOverview, resOverview);
  console.log('Overview learningModules count:', overviewData?.learningModules?.length);
  console.log('Overview learningModules:', JSON.stringify(overviewData?.learningModules, null, 2));
}

testLearningModulesCRUD().catch(console.error);
