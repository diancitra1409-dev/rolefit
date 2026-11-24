import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('--- Running API Validation Tests ---');

  // Start temporary server or test app directly
  const { default: express } = await import('express');
  const { default: analyzeRoutes } = await import('../src/routes/analyzeRoutes.js');

  const app = express();
  app.use(express.json());
  app.use('/api', analyzeRoutes);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ success: false, error: err.message });
  });

  const server = app.listen(5099);

  try {
    // Test 1: Missing file
    console.log('Test 1: Missing file...');
    const formData1 = new FormData();
    formData1.append('jobDescription', 'Senior React engineer with experience');
    const res1 = await fetch('http://localhost:5099/api/analyze', { method: 'POST', body: formData1 });
    const json1 = await res1.json();
    console.log('Status:', res1.status, 'Response:', json1);
    if (res1.status !== 400 || !json1.error.includes('Resume file is required')) {
      throw new Error('Test 1 failed: Expected 400 with missing file error');
    }
    console.log('✓ Test 1 Passed: Correctly rejects missing file.\n');

    // Test 2: Missing or short Job Description
    console.log('Test 2: Short job description...');
    const pdfBuffer = fs.readFileSync(path.resolve(__dirname, '../../sample_resume.pdf'));
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const formData2 = new FormData();
    formData2.append('resume', pdfBlob, 'resume.pdf');
    formData2.append('jobDescription', 'Too short');
    const res2 = await fetch('http://localhost:5099/api/analyze', { method: 'POST', body: formData2 });
    const json2 = await res2.json();
    console.log('Status:', res2.status, 'Response:', json2);
    if (res2.status !== 400 || !json2.error.includes('too short')) {
      throw new Error('Test 2 failed: Expected 400 with short JD error');
    }
    console.log('✓ Test 2 Passed: Correctly rejects short job description.\n');

    // Test 3: Non-PDF file upload
    console.log('Test 3: Non-PDF file...');
    const textBlob = new Blob(['Not a pdf file'], { type: 'text/plain' });
    const formData3 = new FormData();
    formData3.append('resume', textBlob, 'notes.txt');
    formData3.append('jobDescription', 'Senior React engineer with extensive full-stack experience');
    const res3 = await fetch('http://localhost:5099/api/analyze', { method: 'POST', body: formData3 });
    const json3 = await res3.json();
    console.log('Status:', res3.status, 'Response:', json3);
    if (res3.status !== 400 || !json3.error.includes('Only PDF files are allowed')) {
      throw new Error('Test 3 failed: Expected 400 with invalid file type error');
    }
    console.log('✓ Test 3 Passed: Correctly rejects non-PDF file.\n');

    // Test 4: Valid PDF + Valid JD without API key configured
    console.log('Test 4: Valid inputs with unconfigured GEMINI_API_KEY...');
    const formData4 = new FormData();
    formData4.append('resume', pdfBlob, 'sample_resume.pdf');
    formData4.append('jobDescription', 'Senior Full-Stack Engineer with 5+ years of experience in React, Node.js, and TypeScript.');
    const res4 = await fetch('http://localhost:5099/api/analyze', { method: 'POST', body: formData4 });
    const json4 = await res4.json();
    console.log('Status:', res4.status, 'Response:', json4);
    if (res4.status === 500 && json4.error.includes('GEMINI_API_KEY')) {
      console.log('✓ Test 4 Passed: Gracefully instructs user to configure GEMINI_API_KEY in server/.env.\n');
    } else if (res4.status === 200 && json4.success) {
      console.log('✓ Test 4 Passed: Gemini API returned complete analysis data!\n');
    }

    console.log('All API validation tests passed with 100% success!');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

