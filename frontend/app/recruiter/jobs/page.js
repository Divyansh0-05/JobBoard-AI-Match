'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import { Sparkles, Briefcase, Plus, Users, MapPin, DollarSign } from 'lucide-react';

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
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent"></div>
        <p className="mt-3 text-slate-500 text-sm">Loading your job listings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">My Posted Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your job openings and view candidate applicant rankings.</p>
        </div>

        <Link
          href="/recruiter/jobs/new"
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Post New Job</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {errorMessage}
        </div>
      )}

      {jobs.length === 0 ? (
        <GlassCard className="p-12 text-center my-6 border-slate-200 bg-white max-w-xl mx-auto">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-200">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Jobs Posted Yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            You haven&apos;t posted any job openings. Create your first job posting to start receiving AI-matched applicants.
          </p>
          <Link
            href="/recruiter/jobs/new"
            className="inline-flex items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            + Post New Job
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isToggling = togglingId === job._id;
            const isOpen = job.status === 'open';

            return (
              <GlassCard key={job._id} className="p-6 border-slate-200/80 hover:border-sky-300 transition-colors bg-white shadow-sm hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">{job.title}</h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 mt-2">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-medium">{job.jobType || 'Full-time'}</span>
                      {job.location && <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-medium">📍 {job.location}</span>}
                      {job.salaryRange && <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-medium">💰 {job.salaryRange}</span>}
                      <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 font-semibold rounded-full flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-sky-600 mr-1" />
                        <span>{job.applicantCount || 0} Applicants</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2 md:pt-0">
                    <button
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      disabled={isToggling}
                      className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-colors ${isOpen ? 'border-slate-200 hover:bg-slate-100 text-slate-700' : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}
                    >
                      {isToggling ? 'Updating...' : isOpen ? 'Close Job' : 'Reopen Job'}
                    </button>

                    <Link
                      href={`/recruiter/jobs/${job._id}/applicants`}
                      className="px-5 py-2.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md hover:scale-105"
                    >
                      View Applicants ({job.applicantCount || 0})
                    </Link>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
