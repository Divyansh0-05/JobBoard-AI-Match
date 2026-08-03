const User = require('../models/User');
const { getEmbedding } = require('../lib/matchScore');

// Get current logged-in user profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
};

// Update candidate resume and precompute embedding
const updateResume = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (resumeText === undefined) {
      return res.status(400).json({ message: 'resumeText is required.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.resumeText = resumeText;
    
    // Compute and cache resume embedding
    const embedding = await getEmbedding(resumeText);
    user.resumeEmbedding = embedding;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ message: 'Failed to update resume', error: error.message });
  }
};

module.exports = {
  getMe,
  updateResume
};
