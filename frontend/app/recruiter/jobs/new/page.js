'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import { Sparkles, ArrowLeft, Briefcase } from 'lucide-react';

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
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">Post a New Job</h1>
          <p className="text-xs text-slate-500 mt-1">Create a job opening to start receiving AI-matched applicant rankings.</p>
        </div>
        <Link
          href="/recruiter/jobs"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Jobs</span>
        </Link>
      </div>

      <GlassCard className="p-6 sm:p-8 border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Job Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack Developer (React & Node)"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 text-sm placeholder-slate-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 text-sm transition-colors"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, NY, or San Francisco"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 text-sm placeholder-slate-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Salary Range</label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g. $100k - $130k"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 text-sm placeholder-slate-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Job Description *</label>
            <textarea
              rows={8}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe role responsibilities, required technical skills, qualifications, and company background..."
              className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 text-sm placeholder-slate-400 transition-colors leading-relaxed"
            />
            <p className="mt-1.5 text-[11px] text-slate-500 flex items-center">
              <Sparkles className="w-3 h-3 text-sky-600 mr-1" />
              This description will automatically be converted into vector embeddings for candidate match calculations.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md hover:scale-105 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publishing & Computing Embedding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Publish Job Opening</span>
                </>
              )}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
