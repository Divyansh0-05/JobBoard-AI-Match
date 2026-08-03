const express = require('express');
const router = express.Router();

const { updateResume } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

// Candidate route: PUT /api/users/resume
router.put('/resume', authMiddleware, requireRole('candidate'), updateResume);

module.exports = router;
