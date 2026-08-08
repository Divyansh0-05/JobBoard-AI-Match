const express = require('express');
const router = express.Router();

const {
  createJob,
  syncApifyJobs,
  getMyJobs,
  updateJob,
  deleteJob,
  getOpenJobs,
  getMatchedJobs
} = require('../controllers/jobController');

const { getApplicantsForJob } = require('../controllers/applicationController');

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

// Public route: Get all open jobs
router.get('/', getOpenJobs);

// Candidate route: Get open jobs ranked by matchScore
router.get('/matched', authMiddleware, requireRole('candidate'), getMatchedJobs);

// Sync route: Trigger Apify job scraping for the last 12 hours
router.post('/sync-apify', authMiddleware, syncApifyJobs);

// Recruiter route: Get jobs posted by logged-in recruiter
router.get('/mine', authMiddleware, requireRole('recruiter'), getMyJobs);

// Recruiter route: Get ranked applicants for a specific job
router.get('/:jobId/applicants', authMiddleware, requireRole('recruiter'), getApplicantsForJob);

// Recruiter routes: CRUD operations on jobs
router.post('/', authMiddleware, requireRole('recruiter'), createJob);
router.patch('/:id', authMiddleware, requireRole('recruiter'), updateJob);
router.delete('/:id', authMiddleware, requireRole('recruiter'), deleteJob);

module.exports = router;
