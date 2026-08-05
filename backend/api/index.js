const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('../routes/authRoutes');
const jobRoutes = require('../routes/jobRoutes');
const userRoutes = require('../routes/userRoutes');
const applicationRoutes = require('../routes/applicationRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Lazy MongoDB connection for serverless cold-starts (MUST BE BEFORE ROUTES)
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false, // Disable Mongoose buffering so failures throw immediately with clear error
      serverSelectionTimeoutMS: 5000 // 5 second timeout for connection
    });
    isConnected = true;
    console.log('MongoDB connected successfully on Vercel');
  } catch (err) {
    console.error('MongoDB connection error on Vercel:', err);
    throw err;
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(500).json({
      message: 'Database connection failure. Please check MONGODB_URI environment variable in Vercel.',
      error: err.message
    });
  }
});

// Root & Health check routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'JobBoard AI-Match Backend API is running on Vercel' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running on Vercel', dbConnected: isConnected });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

module.exports = app;
