'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CandidateJobsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [resumeRequired, setResumeRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [applyingId, setApplyingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');

  // Fetch candidate applications to know which jobs are already applied
  const fetchMyApplications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/applications/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const appliedSet = new Set(res.data.map(app => app.jobId?._id || app.jobId));
      setAppliedJobIds(appliedSet);
    } catch (err) {
      console.error('Failed to fetch existing applications:', err);
    }
  }, [token]);

  // Fetch matched jobs with query filters
  const fetchMatchedJobs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setResumeRequired(false);
    setErrorMessage('');

    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (jobType) params.jobType = jobType;
      if (location.trim()) params.location = location.trim();

      const res = await axios.get(`${API_URL}/api/jobs/matched`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setJobs(res.data);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('resume')) {
        setResumeRequired(true);
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to load matched jobs.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, search, jobType, location]);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'candidate') {
        router.push('/login');
        return;
      }
      fetchMyApplications();
      fetchMatchedJobs();
    }
  }, [authLoading, user, router, fetchMyApplications, fetchMatchedJobs]);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    try {
      await axios.post(
        `${API_URL}/api/applications`,
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppliedJobIds(prev => new Set(prev).add(jobId));
    } catch (err) {
      // 409 indicates duplicate application -> mark as applied as well
      if (err.response?.status === 409) {
        setAppliedJobIds(prev => new Set(prev).add(jobId));
      } else {
        alert(err.response?.data?.message || 'Failed to submit application.');
      }
    } finally {
      setApplyingId(null);
    }
  };

  const getMatchScoreBadge = (score) => {
    let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    if (score >= 70) {
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    } else if (score >= 40) {
      colorClasses = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${colorClasses}`}>
        {score}% Match
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Explore Matched Jobs</h1>
          <p className="text-sm text-slate-600">Jobs ranked by AI match percentage based on your saved resume.</p>
        </div>
      </div>

      {resumeRequired ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center my-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-amber-900 mb-2">Resume Required</h3>
          <p className="text-sm text-amber-700 max-w-md mx-auto mb-4">
            You haven&apos;t saved a resume yet. Save your plain text resume first so we can calculate AI match scores against open job listings.
          </p>
          <Link
            href="/resume"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            Go to My Resume
          </Link>
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Search Title</label>
              <input
                type="text"
                placeholder="Search job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
              <input
                type="text"
                placeholder="Filter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Job List */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-2 text-slate-600 text-sm">Matching open jobs with your resume...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-500">
              No open jobs match your current search filters.
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const isApplied = appliedJobIds.has(job._id);
                const isApplying = applyingId === job._id;

                return (
                  <div key={job._id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                          {getMatchScoreBadge(job.matchScore || 0)}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-1">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">{job.jobType || 'Full-time'}</span>
                          {job.location && <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">📍 {job.location}</span>}
                          {job.salaryRange && <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">💰 {job.salaryRange}</span>}
                        </div>
                      </div>

                      <div>
                        {isApplied ? (
                          <button
                            disabled
                            className="w-full sm:w-auto px-5 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg cursor-not-allowed flex items-center justify-center space-x-1"
                          >
                            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Applied</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApply(job._id)}
                            disabled={isApplying}
                            className="w-full sm:w-auto px-6 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
                          >
                            {isApplying ? 'Applying...' : 'Apply Now'}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line mt-2">
                      {job.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
