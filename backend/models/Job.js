const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isExternal; }
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    default: 'External Company'
  },
  description: {
    type: String,
    required: true
  },
  descriptionEmbedding: {
    type: [Number],
    default: []
  },
  location: {
    type: String,
    default: 'Remote'
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Internship'],
    default: 'Full-time'
  },
  salaryRange: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  isExternal: {
    type: Boolean,
    default: false
  },
  externalId: {
    type: String,
    default: null,
    sparse: true
  },
  externalUrl: {
    type: String,
    default: ''
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
