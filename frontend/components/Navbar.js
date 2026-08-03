'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              JobBoard <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 ml-1">AI-Match</span>
            </Link>
          </div>

          {!loading && (
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  {user.role === 'candidate' && (
                    <>
                      <Link href="/jobs" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                        Browse Jobs
                      </Link>
                      <Link href="/resume" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                        My Resume
                      </Link>
                      <Link href="/applications" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                        My Applications
                      </Link>
                    </>
                  )}

                  {user.role === 'recruiter' && (
                    <>
                      <Link href="/recruiter/jobs/new" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                        Post Job
                      </Link>
                      <Link href="/recruiter/jobs" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                        My Jobs
                      </Link>
                    </>
                  )}

                  <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
                    <span className="text-xs text-slate-400 capitalize px-2 py-1 bg-slate-800 rounded">
                      {user.role}
                    </span>
                    <span className="text-sm font-medium text-slate-200">{user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
