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

// Root & Health check routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'JobBoard AI-Match Backend API is running on Vercel' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running on Vercel' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// Lazy MongoDB connection for serverless cold-starts
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      isConnected = true;
      console.log('MongoDB connected successfully on Vercel');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

module.exports = app;
