'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function MyApplicationsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'candidate') {
        router.push('/login');
        return;
      }

      const fetchApplications = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/applications/mine`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setApplications(res.data);
        } catch (err) {
          console.error('Error fetching applications:', err);
          setErrorMessage(err.response?.data?.message || 'Failed to load your applications.');
        } finally {
          setLoading(false);
        }
      };

      fetchApplications();
    }
  }, [authLoading, user, token, router]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMatchScoreBadge = (score) => {
    let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    if (score >= 70) {
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    } else if (score >= 40) {
      colorClasses = 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${colorClasses}`}>
        {score}% Match
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-2 text-slate-600 text-sm">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
        <p className="text-sm text-slate-600">Track all job applications and your snapshot AI match scores.</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {errorMessage}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center my-6 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Applications Found</h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            You haven&apos;t applied to any jobs yet — browse jobs to get started.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            Browse Matched Jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Job Title & Company</th>
                  <th className="py-3.5 px-4">Location / Type</th>
                  <th className="py-3.5 px-4 text-center">AI Match Score</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{app.jobId?.title || 'Unknown Job'}</div>
                      <div className="text-xs text-slate-500">{app.jobId?.recruiterId?.name || 'Recruiter'}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-slate-700">{app.jobId?.location || 'Remote'}</div>
                      <div className="text-xs text-slate-500">{app.jobId?.jobType || 'Full-time'}</div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {getMatchScoreBadge(app.matchScore || 0)}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {formatDate(app.appliedDate)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                        {app.status || 'applied'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
