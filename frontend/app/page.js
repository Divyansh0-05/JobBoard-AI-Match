'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
        AI-Powered Resume-to-Job Matching
      </h1>
      <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
        Match candidates and recruiters with semantic vector embeddings. See your instant match score before applying.
      </p>

      {user ? (
        <div className="flex flex-wrap justify-center gap-4">
          {user.role === 'candidate' ? (
            <>
              <Link href="/jobs" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                Browse Matched Jobs
              </Link>
              <Link href="/resume" className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium rounded-lg shadow-sm transition-colors">
                Update My Resume
              </Link>
            </>
          ) : (
            <>
              <Link href="/recruiter/jobs/new" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                Post New Job
              </Link>
              <Link href="/recruiter/jobs" className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium rounded-lg shadow-sm transition-colors">
                Manage My Jobs
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors">
            Get Started
          </Link>
          <Link href="/login" className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium rounded-lg shadow-sm transition-colors">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
