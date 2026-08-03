'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ApplicantRankingPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const jobId = params.id;

  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedResumes, setExpandedResumes] = useState(new Set());

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'recruiter') {
        router.push('/login');
        return;
      }

      const fetchApplicants = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/jobs/${jobId}/applicants`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setApplicants(res.data);
        } catch (err) {
          console.error('Error fetching applicants:', err);
          if (err.response?.status === 403) {
            setUnauthorized(true);
          } else {
            setErrorMessage(err.response?.data?.message || 'Failed to load applicants.');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchApplicants();
    }
  }, [authLoading, user, token, jobId, router]);

  const toggleResume = (applicantId) => {
    setExpandedResumes(prev => {
      const next = new Set(prev);
      if (next.has(applicantId)) {
        next.delete(applicantId);
      } else {
        next.add(applicantId);
      }
      return next;
    });
  };

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

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-2 text-slate-600 text-sm">Loading applicant rankings...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Access Forbidden</h2>
          <p className="text-sm text-red-700 mb-6 max-w-md mx-auto">
            You are not authorized to view applicants for this job listing because you do not own it.
          </p>
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            Return to My Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ranked Applicants</h1>
          <p className="text-sm text-slate-600">Candidates sorted by AI semantic match score (highest first).</p>
        </div>
        <Link
          href="/recruiter/jobs"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to My Jobs
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {errorMessage}
        </div>
      )}

      {applicants.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center my-6 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Applicants Yet</h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            No candidates have applied to this job listing yet.
          </p>
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            Back to My Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app, index) => {
            const candidate = app.candidateId;
            const isExpanded = expandedResumes.has(app._id);

            return (
              <div key={app._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-slate-900">{candidate?.name || 'Candidate'}</h3>
                        {getMatchScoreBadge(app.matchScore || 0)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        📧 {candidate?.email || 'N/A'} • Applied: {formatDate(app.appliedDate)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => toggleResume(app._id)}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>{isExpanded ? 'Hide Resume' : 'View Full Resume'}</span>
                      <svg className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Candidate Resume Text</h4>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {candidate?.resumeText || 'No resume text available.'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
