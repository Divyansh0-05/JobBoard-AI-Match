'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import Cookies from 'js-cookie';
import { Sparkles, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ResumePage() {
  const { user, token, loading: authLoading, setUser } = useAuth();
  const router = useRouter();

  const [resumeText, setResumeText] = useState('');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'candidate') {
        router.push('/login');
        return;
      }

      const fetchUserData = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setResumeText(res.data.resumeText || '');
        } catch (err) {
          console.error('Failed to fetch user resume:', err);
          setErrorMessage('Failed to load existing resume. Please refresh.');
        } finally {
          setFetching(false);
        }
      };

      fetchUserData();
    }
  }, [authLoading, user, token, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setSaving(true);

    try {
      const res = await axios.put(
        `${API_URL}/api/users/resume`,
        { resumeText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = res.data;
      setUser(updatedUser);
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });

      setSuccessMessage('Resume saved and AI match embedding precomputed successfully!');
    } catch (err) {
      console.error('Failed to save resume:', err);
      const msg = err.response?.data?.message || 'Failed to save resume. Please try again.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || fetching) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent"></div>
        <p className="mt-3 text-slate-500 text-sm">Loading resume data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <GlassCard className="p-6 sm:p-8 border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">My Plain Text Resume</h1>
        </div>
        
        <p className="text-xs text-slate-500 mb-6">
          Paste your resume as plain text. This will be used to calculate your match score against job listings.
        </p>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Resume Content (Plain Text)
            </label>
            <textarea
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your plain text resume here (skills, education, work experience, technologies, etc.)..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-mono text-xs text-slate-800 placeholder-slate-400 transition-colors leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Word count: {resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0} words
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md hover:scale-105 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving & Computing Embedding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Save Resume</span>
                </>
              )}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
