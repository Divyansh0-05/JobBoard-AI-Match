const express = require('express');
const router = express.Router();

const { getMe, updateResume } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

// Get logged-in user profile
router.get('/me', authMiddleware, getMe);

// Candidate route: PUT /api/users/resume
router.put('/resume', authMiddleware, requireRole('candidate'), updateResume);

module.exports = router;
