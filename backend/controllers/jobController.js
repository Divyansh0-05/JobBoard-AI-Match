const Job = require('../models/Job');

// Create a new job (Recruiter only)
const createJob = async (req, res) => {
  try {
    const { title, description, location, jobType, salaryRange } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const job = await Job.create({
      recruiterId: req.user.userId,
      title,
      description,
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

// Get jobs posted by the logged-in recruiter (Recruiter only)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.userId }).sort({ createdAt: -1 });

    const jobsWithApplicantCount = jobs.map((job) => ({
      ...job.toObject(),
      applicantCount: 0
    }));

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

module.exports = {
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getOpenJobs
};
