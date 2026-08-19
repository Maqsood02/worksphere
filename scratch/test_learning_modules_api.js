import handler from '../api/learning-modules.js';

async function testLearningModulesApi() {
  console.log('Testing Learning Modules API (GET & POST)...');
  
  // Test GET
  const reqGet = {
    method: 'GET',
    query: { username: 'maqsood' }
  };

  const resGet = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) {
      console.log('GET Response Status:', this.statusCode);
      console.log('GET Response Modules Count:', data?.modules?.length);
      return this;
    },
    end() {}
  };

  await handler(reqGet, resGet);
}

testLearningModulesApi().catch(console.error);
