'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import { Sparkles, FileText, Calendar, Building, CheckCircle2 } from 'lucide-react';

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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMatchScoreBadge = (score) => {
    let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
    if (score >= 70) {
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
    } else if (score >= 40) {
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-300 font-semibold';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${colorClasses}`}>
        <Sparkles className="w-3 h-3 mr-1 text-sky-600" />
        {score}% Match
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent"></div>
        <p className="mt-3 text-slate-500 text-sm">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1">Track all job applications and your snapshot AI match scores.</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {errorMessage}
        </div>
      )}

      {applications.length === 0 ? (
        <GlassCard className="p-12 text-center my-6 border-slate-200 bg-white max-w-xl mx-auto">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-200">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Applications Found</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            You haven&apos;t applied to any jobs yet — browse jobs to get started.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            Browse Matched Jobs
          </Link>
        </GlassCard>
      ) : (
        <GlassCard className="p-0 overflow-hidden border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4 px-5">Job Title & Company</th>
                  <th className="py-4 px-5">Location / Type</th>
                  <th className="py-4 px-5 text-center">AI Match Score</th>
                  <th className="py-4 px-5">Applied Date</th>
                  <th className="py-4 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-base">{app.jobId?.title || 'Unknown Job'}</div>
                      <div className="text-xs text-slate-500 flex items-center mt-0.5">
                        <Building className="w-3 h-3 mr-1 text-slate-400" />
                        <span>{app.jobId?.recruiterId?.name || 'Recruiter'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="text-slate-700">{app.jobId?.location || 'Remote'}</div>
                      <div className="text-xs text-slate-400">{app.jobId?.jobType || 'Full-time'}</div>
                    </td>

                    <td className="py-4 px-5 text-center">
                      {getMatchScoreBadge(app.matchScore || 0)}
                    </td>

                    <td className="py-4 px-5 text-slate-500 text-xs">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(app.appliedDate)}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 capitalize">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-sky-600" />
                        {app.status || 'applied'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
