import http from 'http';
import handler from '../api/send-learning-module-email.js';

async function testEmail() {
  console.log('Testing Learning Module Email Serverless Handler...');
  const req = {
    method: 'POST',
    body: {
      assignedTo: 'maqsood',
      username: 'maqsood',
      internName: 'Maqsood MD',
      toEmail: 'maqsoodmd.ac.in@gmail.com',
      moduleTitle: 'Advanced Cloud Architecture with Spring Boot & Docker',
      category: 'Backend',
      track: 'Full-Stack Software Engineering',
      description: 'Master containerization, Spring Boot microservice configurations, and automated CI/CD pipeline deployments.',
      videoUrl: 'https://www.youtube.com/watch?v=BVWdF0nL7_M',
      resourceUrl: 'https://spring.io/projects/spring-boot'
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
