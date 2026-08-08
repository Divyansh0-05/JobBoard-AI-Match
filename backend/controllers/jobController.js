const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const { getEmbedding, cosineSimilarity, mapSimilarityToScore } = require('../lib/matchScore');
const { fetchJobsLast12Hours } = require('../lib/apifyService');

// Create a new job (Recruiter only)
const createJob = async (req, res) => {
  try {
    const { title, description, location, jobType, salaryRange } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    // Compute embedding for job description
    const descriptionEmbedding = await getEmbedding(description);

    const job = await Job.create({
      recruiterId: req.user.userId,
      title,
      description,
      descriptionEmbedding,
      location: location || '',
      jobType,
      salaryRange: salaryRange || '',
      status: 'open'
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
};

// Sync live job postings from Apify (posted in last 12 hours)
const syncApifyJobs = async (req, res) => {
  try {
    const { searchKeywords, location } = req.body || {};
    const scrapedJobs = await fetchJobsLast12Hours({ searchKeywords, location });

    let newJobsCount = 0;

    for (const scrapedJob of scrapedJobs) {
      const existing = await Job.findOne({ externalId: scrapedJob.externalId });
      if (!existing) {
        // Precompute Gemini vector embedding for the external job description
        const descriptionEmbedding = await getEmbedding(scrapedJob.description);

        await Job.create({
          title: scrapedJob.title,
          companyName: scrapedJob.companyName,
          description: scrapedJob.description,
          descriptionEmbedding,
          location: scrapedJob.location,
          jobType: scrapedJob.jobType,
          salaryRange: scrapedJob.salaryRange,
          isExternal: true,
          externalId: scrapedJob.externalId,
          externalUrl: scrapedJob.externalUrl,
          postedAt: scrapedJob.postedAt || new Date(),
          status: 'open'
        });

        newJobsCount++;
      }
    }

    res.json({
      message: `Apify sync completed successfully. Ingested ${newJobsCount} new live jobs from the last 12 hours.`,
      newJobsCount,
      totalScraped: scrapedJobs.length
    });
  } catch (error) {
    console.error('Error syncing Apify jobs:', error);
    res.status(500).json({ message: 'Failed to sync live jobs from Apify', error: error.message });
  }
};

// Get jobs posted by the logged-in recruiter (Recruiter only) with real applicant counts
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.userId }).sort({ createdAt: -1 });

    const jobsWithApplicantCount = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ jobId: job._id });
        return {
          ...job.toObject(),
          applicantCount
        };
      })
    );

    res.json(jobsWithApplicantCount);
  } catch (error) {
    console.error('Error fetching my jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
};

// Update a job (Recruiter only, owner only)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access forbidden: You do not own this job listing' });
    }

    const allowedFields = ['title', 'description', 'location', 'jobType', 'salaryRange', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    // Recompute embedding if description was updated
    if (req.body.description !== undefined) {
      job.descriptionEmbedding = await getEmbedding(job.description);
    }

    await job.save();
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update job', error: error.message });
  }
};

// Delete a job (Recruiter only, owner only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access forbidden: You do not own this job listing' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
};

// Get all open jobs (Public endpoint with search & filters)
const getOpenJobs = async (req, res) => {
  try {
    const { search, jobType, location } = req.query;

    const query = { status: 'open' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching open jobs:', error);
    res.status(500).json({ message: 'Failed to fetch open jobs', error: error.message });
  }
};

// Get open jobs matched against candidate resume embedding (Candidate only)
const getMatchedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.resumeEmbedding || user.resumeEmbedding.length === 0) {
      return res.status(400).json({
        message: 'Please save your resume first before browsing matched jobs.'
      });
    }

    const { search, jobType, location } = req.query;
    const query = { status: 'open' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (jobType) {
      query.jobType = jobType;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(query);

    const jobsWithScores = jobs.map((job) => {
      let matchScore = 0;
      if (job.descriptionEmbedding && job.descriptionEmbedding.length > 0) {
        const similarity = cosineSimilarity(user.resumeEmbedding, job.descriptionEmbedding);
        matchScore = mapSimilarityToScore(similarity);
      }
      return {
        ...job.toObject(),
        matchScore
      };
    });

    // Sort by matchScore descending
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.json(jobsWithScores);
  } catch (error) {
    console.error('Error fetching matched jobs:', error);
    res.status(500).json({ message: 'Failed to fetch matched jobs', error: error.message });
  }
};

module.exports = {
  createJob,
  syncApifyJobs,
  getMyJobs,
  updateJob,
  deleteJob,
  getOpenJobs,
  getMatchedJobs
};
