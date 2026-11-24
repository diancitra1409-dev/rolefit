import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../../sample_resume.pdf');
const doc = new PDFDocument({ margin: 50 });

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Header
doc.fontSize(22).font('Helvetica-Bold').text('Alex Chen', { align: 'left' });
doc.fontSize(11).font('Helvetica').text('alex.chen@example.com | (555) 019-2834 | San Francisco, CA | github.com/alexchen', { align: 'left' });
doc.moveDown(1);

// Professional Summary
doc.fontSize(14).font('Helvetica-Bold').text('Professional Summary');
doc.rect(50, doc.y + 2, 512, 1).fill('#cbd5e1');
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica').text(
  'Results-driven Full-Stack Software Engineer with 5+ years of experience designing, developing, and deploying resilient web applications. Proven track record building high-performance frontend interfaces in React and robust RESTful backend microservices in Node.js and Express. Dedicated to writing clean, maintainable code and optimizing user experiences.'
);
doc.moveDown(1);

// Technical Skills
doc.fontSize(14).font('Helvetica-Bold').text('Technical Skills');
doc.rect(50, doc.y + 2, 512, 1).fill('#cbd5e1');
doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica-Bold').text('Languages & Frameworks: ', { continued: true })
   .font('Helvetica').text('JavaScript (ES6+), TypeScript, React, Node.js, Express, HTML5, CSS3, Tailwind CSS');
doc.fontSize(10).font('Helvetica-Bold').text('Databases & Tools: ', { continued: true })
   .font('Helvetica').text('PostgreSQL, MongoDB, Redis, Git, Docker, Webpack, Vite, Jest');
doc.fontSize(10).font('Helvetica-Bold').text('Architectures & Practices: ', { continued: true })
   .font('Helvetica').text('RESTful APIs, Microservices, Agile/Scrum, CI/CD, Responsive Design');
doc.moveDown(1);

// Work Experience
doc.fontSize(14).font('Helvetica-Bold').text('Work Experience');
doc.rect(50, doc.y + 2, 512, 1).fill('#cbd5e1');
doc.moveDown(0.5);

// Job 1
doc.fontSize(11).font('Helvetica-Bold').text('Senior Full-Stack Engineer | CloudNova Solutions');
doc.fontSize(9).font('Helvetica-Oblique').text('2021 – Present | San Francisco, CA');
doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica').list([
  'Architected and led the development of core SaaS platform features using React, TypeScript, and Tailwind CSS, improving page load speeds by 38%.',
  'Engineered scalable Node.js/Express backend APIs serving over 500,000 monthly active users with 99.9% uptime.',
  'Integrated PostgreSQL database schemas and Redis caching, reducing API response latency by 45%.',
  'Mentored 4 junior engineers on code review best practices, modern JavaScript patterns, and test-driven development.'
]);
doc.moveDown(0.8);

// Job 2
doc.fontSize(11).font('Helvetica-Bold').text('Software Engineer | Apex Digital Labs');
doc.fontSize(9).font('Helvetica-Oblique').text('2019 – 2021 | Austin, TX');
doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica').list([
  'Developed reusable React component libraries and design system primitives.',
  'Implemented secure authentication and session management using JWT and OAuth2.',
  'Configured Docker containers and automated CI/CD deployment pipelines on cloud infrastructure.'
]);
doc.moveDown(1);

// Education
doc.fontSize(14).font('Helvetica-Bold').text('Education');
doc.rect(50, doc.y + 2, 512, 1).fill('#cbd5e1');
doc.moveDown(0.5);
doc.fontSize(11).font('Helvetica-Bold').text('Bachelor of Science in Computer Science');
doc.fontSize(10).font('Helvetica').text('University of California, Berkeley | Graduated 2019');

doc.end();

stream.on('finish', () => {
  console.log(`Sample resume PDF successfully generated at: ${outputPath}`);
});

