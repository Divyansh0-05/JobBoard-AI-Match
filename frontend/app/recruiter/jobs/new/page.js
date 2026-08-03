'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PostNewJobPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [salaryRange, setSalaryRange] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'recruiter') {
        router.push('/login');
      }
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await axios.post(
        `${API_URL}/api/jobs`,
        { title, description, location, jobType, salaryRange },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push('/recruiter/jobs');
    } catch (err) {
      console.error('Error posting job:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to post job listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Post a New Job</h1>
          <p className="text-sm text-slate-600">Create a job opening to start receiving AI-matched applicant rankings.</p>
        </div>
        <Link
          href="/recruiter/jobs"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to My Jobs
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack Developer (React & Node)"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, NY, or San Francisco"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Salary Range</label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. $100k - $130k"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">Job Description *</label>
            <textarea
              rows={8}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe role responsibilities, required technical skills, qualifications, and company background..."
              className="w-full p-3.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              Note: This description will automatically be converted into vector embeddings for candidate match calculations.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publishing & Computing Embedding...</span>
                </>
              ) : (
                <span>Publish Job Opening</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
