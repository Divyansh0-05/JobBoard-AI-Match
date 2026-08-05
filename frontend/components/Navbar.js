'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, LogOut, User, Briefcase, FileText } from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4 sm:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        
        {/* Brand Logo - Dark Glass Pill */}
        <Link href="/" className="flex items-center space-x-2.5 group bg-[#0F172A]/90 backdrop-blur-xl border border-slate-700/80 px-4 py-2 rounded-full shadow-xl shadow-slate-950/20">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0F172A] rounded-full flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>
          <span className="text-lg font-bold text-white tracking-tight font-serif">
            JobBoard <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-white">AI-Match</span>
          </span>
        </Link>

        {/* Floating Center & Right Dark Glass Navigation Capsule */}
        {!loading && (
          <div className="flex items-center space-x-3 bg-[#0F172A]/90 backdrop-blur-xl border border-slate-700/80 p-1.5 rounded-full shadow-xl shadow-slate-950/20">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-1 px-3">
                  {user.role === 'candidate' && (
                    <>
                      <Link href="/jobs" className="text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-full hover:bg-white/10 transition-all flex items-center space-x-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                        <span>Browse Jobs</span>
                      </Link>
                      <Link href="/resume" className="text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-full hover:bg-white/10 transition-all flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>My Resume</span>
                      </Link>
                      <Link href="/applications" className="text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-full hover:bg-white/10 transition-all flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                        <span>Applications</span>
                      </Link>
                    </>
                  )}

                  {user.role === 'recruiter' && (
                    <>
                      <Link href="/recruiter/jobs/new" className="text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-full hover:bg-white/10 transition-all flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span>Post Job</span>
                      </Link>
                      <Link href="/recruiter/jobs" className="text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-full hover:bg-white/10 transition-all flex items-center space-x-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        <span>My Jobs</span>
                      </Link>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-2 pl-2">
                  <span className="text-[10px] text-sky-300 font-bold uppercase tracking-wider px-2.5 py-0.5 bg-sky-950/80 border border-sky-400/40 rounded-full">
                    {user.role}
                  </span>
                  <span className="text-xs font-semibold text-white px-1 hidden sm:inline">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-slate-200 hover:text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-white/10 transition-all">
                  Login
                </Link>
                <Link href="/register" className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold px-4.5 py-1.5 rounded-full shadow-md hover:scale-105 transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
