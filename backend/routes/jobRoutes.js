const express = require('express');
const router = express.Router();

const {
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getOpenJobs
} = require('../controllers/jobController');

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

// Public route: Get all open jobs
router.get('/', getOpenJobs);

// Recruiter routes
router.post('/', authMiddleware, requireRole('recruiter'), createJob);
router.get('/mine', authMiddleware, requireRole('recruiter'), getMyJobs);
router.patch('/:id', authMiddleware, requireRole('recruiter'), updateJob);
router.delete('/:id', authMiddleware, requireRole('recruiter'), deleteJob);

module.exports = router;
