'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import { Sparkles, ArrowLeft, ChevronDown, Award, Mail, Calendar, AlertTriangle, Users } from 'lucide-react';

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

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent"></div>
        <p className="mt-3 text-slate-500 text-sm">Loading applicant rankings...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <GlassCard className="p-8 border-rose-200 bg-rose-50 max-w-md mx-auto">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Forbidden</h2>
          <p className="text-xs text-rose-700 mb-6">
            You are not authorized to view applicants for this job listing because you do not own it.
          </p>
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Return to My Jobs
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">Ranked Applicants</h1>
          <p className="text-sm text-slate-500 mt-1">Candidates sorted by AI semantic match score (highest first).</p>
        </div>
        <Link
          href="/recruiter/jobs"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Jobs</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {errorMessage}
        </div>
      )}

      {applicants.length === 0 ? (
        <GlassCard className="p-12 text-center my-6 border-slate-200 bg-white max-w-xl mx-auto">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-200">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Applicants Yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            No candidates have applied to this job listing yet.
          </p>
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Back to My Jobs
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {applicants.map((app, index) => {
            const candidate = app.candidateId;
            const isExpanded = expandedResumes.has(app._id);

            return (
              <GlassCard key={app._id} className="p-6 border-slate-200/80 bg-white shadow-sm hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{candidate?.name || 'Candidate'}</h3>
                        {getMatchScoreBadge(app.matchScore || 0)}
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span className="flex items-center"><Mail className="w-3.5 h-3.5 text-slate-400 mr-1" />{candidate?.email || 'N/A'}</span>
                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 text-slate-400 mr-1" />Applied: {formatDate(app.appliedDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => toggleResume(app._id)}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors border border-slate-200 flex items-center justify-center space-x-1.5"
                    >
                      <span>{isExpanded ? 'Hide Resume' : 'View Full Resume'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Candidate Resume Text</h4>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                      {candidate?.resumeText || 'No resume text available.'}
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
