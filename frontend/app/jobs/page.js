'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import { Sparkles, Search, Briefcase, MapPin, DollarSign, CheckCircle2, AlertTriangle, Filter, RefreshCw, ExternalLink, Clock, Building } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CandidateJobsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [syncingApify, setSyncingApify] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState('');
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

  const handleSyncApify = async () => {
    setSyncingApify(true);
    setSyncStatusMessage('');
    try {
      const res = await axios.post(
        `${API_URL}/api/jobs/sync-apify`,
        { searchKeywords: search || 'Software Developer', location: location || 'Remote' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSyncStatusMessage(res.data.message || 'Apify sync complete!');
      await fetchMatchedJobs();
    } catch (err) {
      console.error('Apify sync error:', err);
      alert(err.response?.data?.message || 'Failed to sync live jobs from Apify.');
    } finally {
      setSyncingApify(false);
    }
  };

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
      if (err.response?.status === 409) {
        setAppliedJobIds(prev => new Set(prev).add(jobId));
      } else {
        alert(err.response?.data?.message || 'Failed to submit application.');
      }
    } finally {
      setApplyingId(null);
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Recently';
    const hours = Math.round((Date.now() - new Date(dateString).getTime()) / (1000 * 3600));
    if (hours <= 1) return 'Posted 1 hour ago';
    if (hours < 24) return `Posted ${hours} hours ago`;
    return `Posted ${Math.round(hours / 24)} days ago`;
  };

  const getMatchScoreBadge = (score) => {
    let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    if (score >= 70) {
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
    } else if (score >= 40) {
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-300 font-semibold';
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${colorClasses} shadow-sm`}>
        <Sparkles className="w-3.5 h-3.5 mr-1 text-sky-600" />
        {score}% Match
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="max-w-5xl mx-auto pt-32 pb-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-28 pb-12 px-4 sm:px-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">Explore Matched Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time jobs ranked by AI match percentage based on your saved resume.</p>
        </div>

        {/* Sync Live Jobs Button */}
        {!resumeRequired && (
          <button
            onClick={handleSyncApify}
            disabled={syncingApify}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${syncingApify ? 'animate-spin' : ''}`} />
            <span>{syncingApify ? 'Scraping Apify (Last 12h)...' : 'Sync Live Jobs (Last 12 Hrs)'}</span>
          </button>
        )}
      </div>

      {syncStatusMessage && (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-medium rounded-xl flex items-center justify-between">
          <span>{syncStatusMessage}</span>
          <button onClick={() => setSyncStatusMessage('')} className="text-sky-600 hover:text-sky-900 font-bold ml-2">✕</button>
        </div>
      )}

      {resumeRequired ? (
        <GlassCard className="border-amber-200 bg-amber-50/60 p-8 text-center my-8 max-w-2xl mx-auto shadow-sm">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-amber-900 mb-2">Resume Required</h3>
          <p className="text-sm text-amber-700 max-w-md mx-auto mb-6">
            You haven&apos;t saved a resume yet. Save your plain text resume first so we can calculate AI match scores against open job listings.
          </p>
          <Link
            href="/resume"
            className="inline-flex items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            Go to My Resume
          </Link>
        </GlassCard>
      ) : (
        <>
          {/* Filters Bar */}
          <GlassCard className="p-5 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-slate-200/80 bg-white shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center space-x-1">
                <Search className="w-3.5 h-3.5 text-sky-600" />
                <span>Search Title</span>
              </label>
              <input
                type="text"
                placeholder="Search job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Job Type</span>
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 transition-colors"
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>Location</span>
              </label>
              <input
                type="text"
                placeholder="Filter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 placeholder-slate-400 transition-colors"
              />
            </div>
          </GlassCard>

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Job List */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent"></div>
              <p className="mt-3 text-slate-500 text-sm">Matching open jobs with your resume...</p>
            </div>
          ) : jobs.length === 0 ? (
            <GlassCard className="p-12 text-center text-slate-500 border-slate-200 bg-white">
              No open jobs match your current search filters.
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const isApplied = appliedJobIds.has(job._id);
                const isApplying = applyingId === job._id;

                return (
                  <GlassCard key={job._id} className="p-6 border-slate-200/80 hover:border-sky-300 transition-colors bg-white shadow-sm hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{job.title}</h2>
                          {job.isExternal && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                              Apify Live Scraped
                            </span>
                          )}
                          {getMatchScoreBadge(job.matchScore || 0)}
                        </div>

                        <div className="flex flex-wrap gap-2.5 text-xs text-slate-600 mt-2 items-center">
                          {job.companyName && (
                            <span className="font-semibold text-slate-800 flex items-center">
                              <Building className="w-3.5 h-3.5 text-slate-400 mr-1" />
                              {job.companyName}
                            </span>
                          )}
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-medium">{job.jobType || 'Full-time'}</span>
                          {job.location && <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-medium">📍 {job.location}</span>}
                          {job.salaryRange && <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-medium">💰 {job.salaryRange}</span>}
                          <span className="text-slate-400 text-xs flex items-center">
                            <Clock className="w-3 h-3 text-slate-400 mr-1" />
                            {formatRelativeTime(job.postedAt || job.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {job.externalUrl && (
                          <a
                            href={job.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all flex items-center space-x-1"
                          >
                            <span>Apply on Company Site</span>
                            <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                          </a>
                        )}

                        {isApplied ? (
                          <button
                            disabled
                            className="px-5 py-2.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl cursor-not-allowed flex items-center justify-center space-x-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Saved</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApply(job._id)}
                            disabled={isApplying}
                            className="px-5 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md hover:scale-105 transition-all disabled:opacity-50"
                          >
                            {isApplying ? 'Applying...' : '1-Click Apply'}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line mt-3 leading-relaxed">
                      {job.description}
                    </p>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
