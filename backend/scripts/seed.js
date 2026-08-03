const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { getEmbedding, cosineSimilarity, mapSimilarityToScore } = require('../lib/matchScore');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobboard_aimatch';

async function seed() {
  console.log('--- STARTING DATABASE SEEDING ---');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing Users, Jobs, and Applications.');

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // 1. Create Recruiter
    const recruiter = await User.create({
      name: 'Sarah Tech Recruiter',
      email: 'recruiter@example.com',
      passwordHash,
      role: 'recruiter'
    });
    console.log(`Created Recruiter: ${recruiter.email}`);

    // 2. Create Candidates with Embeddings
    const candidatesData = [
      {
        name: 'Alex Frontend',
        email: 'alex.frontend@example.com',
        role: 'candidate',
        resumeText: `
          Frontend Developer with 4 years of experience building modern web applications.
          Expert in React.js, Next.js, JavaScript (ES6+), TypeScript, HTML5, CSS3, Tailwind CSS, and Redux Toolkit.
          Strong focus on building responsive, user-friendly UI interfaces, web accessibility, and page speed performance optimization.
        `
      },
      {
        name: 'Brian Backend',
        email: 'brian.backend@example.com',
        role: 'candidate',
        resumeText: `
          Backend Software Engineer specializing in scalable server-side architectures.
          Proficient in Node.js, Express.js, MongoDB, Mongoose, PostgreSQL, RESTful API design, JWT authentication, and Docker.
          Experienced in database indexing, query performance tuning, microservices, and server-side security best practices.
        `
      },
      {
        name: 'Claire FullStack',
        email: 'claire.fullstack@example.com',
        role: 'candidate',
        resumeText: `
          Full Stack Software Developer proficient across the entire MERN stack (MongoDB, Express, React, Node.js).
          Hands-on experience developing end-to-end web applications with Next.js, Tailwind CSS, REST APIs, GraphQL, and MongoDB Atlas.
          Skilled in Git version control, CI/CD, cloud deployments on Vercel and Render, and agile team collaboration.
        `
      }
    ];

    const candidates = [];
    for (const cData of candidatesData) {
      console.log(`Generating embedding for candidate: ${cData.name}...`);
      const embedding = await getEmbedding(cData.resumeText);
      const candDoc = await User.create({
        ...cData,
        passwordHash,
        resumeEmbedding: embedding
      });
      candidates.push(candDoc);
    }
    console.log(`Created ${candidates.length} candidates with embeddings.`);

    // 3. Create Jobs with Embeddings
    const jobsData = [
      {
        title: 'Frontend Engineer (React / Next.js)',
        jobType: 'Full-time',
        location: 'Remote',
        salaryRange: '$95k - $120k',
        description: `
          We are seeking a talented Frontend Engineer to build high-performance web user interfaces.
          Requirements:
          - Strong proficiency in React.js, Next.js, JavaScript, and Tailwind CSS.
          - Experience with state management, responsive web design, and REST APIs.
          - Knowledge of web performance optimization and clean code principles.
        `
      },
      {
        title: 'Backend Developer (Node.js & MongoDB)',
        jobType: 'Full-time',
        location: 'New York, NY',
        salaryRange: '$110k - $135k',
        description: `
          Looking for a dedicated Backend Engineer to design and maintain robust REST APIs.
          Requirements:
          - Extensive experience with Node.js, Express framework, and MongoDB.
          - Deep understanding of database modeling, authentication, security, and scalability.
          - Ability to write clean, maintainable unit and integration tests.
        `
      },
      {
        title: 'Senior Full Stack Developer (MERN)',
        jobType: 'Full-time',
        location: 'San Francisco, CA',
        salaryRange: '$130k - $160k',
        description: `
          Join our fast-growing engineering team as a Senior Full Stack Engineer.
          Requirements:
          - Proficient across the full MERN stack: MongoDB, Express.js, React.js, Node.js.
          - Proven experience delivering scalable web applications from design to production deployment.
          - Strong background in API design, Next.js App Router, and database optimization.
        `
      },
      {
        title: 'Retail Sales Associate',
        jobType: 'Full-time',
        location: 'Chicago, IL',
        salaryRange: '$35k - $45k',
        description: `
          Join our retail store staff as a Sales Associate!
          Responsibilities:
          - Greet customers, answer product inquiries, and assist with store purchases.
          - Operate cash register point of sale systems and manage cash transactions.
          - Restock store shelves, organize merchandise displays, and assist with inventory stock counts.
        `
      },
      {
        title: 'DevOps & Cloud Engineer',
        jobType: 'Internship',
        location: 'Remote',
        salaryRange: '$60k - $75k',
        description: `
          We are seeking a DevOps & Cloud Engineer intern to support server automation and infrastructure.
          Requirements:
          - Familiarity with Linux administration, Docker containers, and CI/CD pipelines.
          - Exposure to cloud platforms (AWS / Render) and infrastructure monitoring tools.
          - Basic scripting skills in Bash or Python.
        `
      }
    ];

    const jobs = [];
    for (const jData of jobsData) {
      console.log(`Generating embedding for job: ${jData.title}...`);
      const embedding = await getEmbedding(jData.description);
      const jobDoc = await Job.create({
        recruiterId: recruiter._id,
        ...jData,
        descriptionEmbedding: embedding,
        status: 'open'
      });
      jobs.push(jobDoc);
    }
    console.log(`Created ${jobs.length} jobs with embeddings.`);

    // 4. Create Sample Applications with Snapshot Match Scores
    const sampleApps = [
      { candidate: candidates[0], job: jobs[0] }, // Alex Frontend -> Frontend Job
      { candidate: candidates[1], job: jobs[1] }, // Brian Backend -> Backend Job
      { candidate: candidates[2], job: jobs[2] }  // Claire Fullstack -> Senior MERN Job
    ];

    for (const appPair of sampleApps) {
      const similarity = cosineSimilarity(
        appPair.candidate.resumeEmbedding,
        appPair.job.descriptionEmbedding
      );
      const matchScore = mapSimilarityToScore(similarity);

      await Application.create({
        jobId: appPair.job._id,
        candidateId: appPair.candidate._id,
        matchScore
      });

      console.log(`Created sample application: ${appPair.candidate.name} -> ${appPair.job.title} (${matchScore}% match)`);
    }

    console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
    console.log('\nSample Credentials:');
    console.log('Recruiter: recruiter@example.com / Password123!');
    console.log('Candidate 1: alex.frontend@example.com / Password123!');
    console.log('Candidate 2: brian.backend@example.com / Password123!');
    console.log('Candidate 3: claire.fullstack@example.com / Password123!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
