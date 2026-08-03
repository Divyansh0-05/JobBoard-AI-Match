'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RecruiterJobsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'recruiter') {
        router.push('/login');
        return;
      }

      const fetchMyJobs = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/jobs/mine`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setJobs(res.data);
        } catch (err) {
          console.error('Error fetching recruiter jobs:', err);
          setErrorMessage(err.response?.data?.message || 'Failed to load your posted jobs.');
        } finally {
          setLoading(false);
        }
      };

      fetchMyJobs();
    }
  }, [authLoading, user, token, router]);

  const handleToggleStatus = async (jobId, currentStatus) => {
    setTogglingId(jobId);
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';

    try {
      const res = await axios.patch(
        `${API_URL}/api/jobs/${jobId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJobs(prevJobs =>
        prevJobs.map(job => (job._id === jobId ? { ...job, status: res.data.status } : job))
      );
    } catch (err) {
      console.error('Error toggling job status:', err);
      alert(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setTogglingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-2 text-slate-600 text-sm">Loading your job listings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Posted Jobs</h1>
          <p className="text-sm text-slate-600">Manage your job openings and view candidate applicant rankings.</p>
        </div>

        <Link
          href="/recruiter/jobs/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
        >
          + Post New Job
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {errorMessage}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center my-6 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m46 0H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Jobs Posted Yet</h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            You haven&apos;t posted any job openings. Create your first job posting to start receiving AI-matched applicants.
          </p>
          <Link
            href="/recruiter/jobs/new"
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            + Post New Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isToggling = togglingId === job._id;
            const isOpen = job.status === 'open';

            return (
              <div key={job._id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${isOpen ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-2">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">{job.jobType || 'Full-time'}</span>
                      {job.location && <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">📍 {job.location}</span>}
                      {job.salaryRange && <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">💰 {job.salaryRange}</span>}
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded-full">
                        👥 {job.applicantCount || 0} Applicants
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2 md:pt-0">
                    <button
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      disabled={isToggling}
                      className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors ${isOpen ? 'border-slate-300 hover:bg-slate-50 text-slate-700' : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'}`}
                    >
                      {isToggling ? 'Updating...' : isOpen ? 'Close Job' : 'Reopen Job'}
                    </button>

                    <Link
                      href={`/recruiter/jobs/${job._id}/applicants`}
                      className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                      View Applicants ({job.applicantCount || 0})
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
