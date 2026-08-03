const express = require('express');
const router = express.Router();

const {
  applyToJob,
  getMyApplications
} = require('../controllers/applicationController');

const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

// Candidate routes
router.post('/', authMiddleware, requireRole('candidate'), applyToJob);
router.get('/mine', authMiddleware, requireRole('candidate'), getMyApplications);

module.exports = router;
