'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ResumePage() {
  const { user, token, loading: authLoading, setUser } = useAuth();
  const router = useRouter();

  const [resumeText, setResumeText] = useState('');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Protect route & fetch saved resume
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
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-2 text-slate-600 text-sm font-medium">Loading resume data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Plain Text Resume</h1>
        
        <p className="text-sm text-slate-600 mb-6">
          Paste your resume as plain text. This will be used to calculate your match score against job listings.
        </p>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Resume Content (Plain Text)
            </label>
            <textarea
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your plain text resume here (skills, education, work experience, technologies, etc.)..."
              className="w-full p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Word count: {resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0} words
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving & Computing Embedding...</span>
                </>
              ) : (
                <span>Save Resume</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
