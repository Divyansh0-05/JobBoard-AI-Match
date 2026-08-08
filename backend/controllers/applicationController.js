const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { cosineSimilarity, mapSimilarityToScore } = require('../lib/matchScore');

// Apply to a job (Candidate only)
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required.' });
    }

    const candidate = await User.findById(req.user.userId);
    if (!candidate || !candidate.resumeEmbedding || candidate.resumeEmbedding.length === 0) {
      return res.status(400).json({ message: 'Please save your resume before applying to jobs.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job listing not found.' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Cannot apply to a closed job listing.' });
    }

    // Calculate match score snapshot from precomputed embeddings
    let matchScore = 0;
    if (job.descriptionEmbedding && job.descriptionEmbedding.length > 0) {
      const similarity = cosineSimilarity(candidate.resumeEmbedding, job.descriptionEmbedding);
      matchScore = mapSimilarityToScore(similarity);
    }

    const application = await Application.create({
      jobId,
      candidateId: candidate._id,
      matchScore
    });

    res.status(201).json(application);
  } catch (error) {
    // Handle MongoDB duplicate key error (duplicate application)
    if (error.code === 11000 || (error.message && error.message.includes('E11000'))) {
      return res.status(409).json({ message: 'You have already applied to this job.' });
    }
    console.error('Error applying to job:', error);
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
};

// Get candidate applications (Candidate only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user.userId })
      .populate({
        path: 'jobId',
        select: 'title companyName isExternal externalUrl location status jobType salaryRange recruiterId',
        populate: {
          path: 'recruiterId',
          select: 'name email'
        }
      })
      .sort({ appliedDate: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

// Get ranked applicants for a job (Recruiter only, owner check)
const getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job listing not found.' });
    }

    if (!job.recruiterId || job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access forbidden: You do not own this job listing.' });
    }

    const applicants = await Application.find({ jobId })
      .populate('candidateId', 'name email resumeText')
      .sort({ matchScore: -1 });

    res.json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ message: 'Failed to fetch applicants', error: error.message });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForJob
};
