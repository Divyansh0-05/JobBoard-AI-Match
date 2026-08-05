'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);

    setIsSubmitting(false);

    if (result.success) {
      if (result.user.role === 'recruiter') {
        router.push('/recruiter/jobs');
      } else {
        router.push('/jobs');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative bg-[#FAFAFC]">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-200/40 rounded-full blur-[100px] pointer-events-none"></div>

      <GlassCard className="max-w-md w-full p-8 relative z-10 border-slate-200/80 bg-white/90 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 mx-auto mb-3 shadow-md shadow-sky-500/20">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Log in to manage your resume or job postings</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 text-sm placeholder-slate-400 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 text-slate-900 text-sm placeholder-slate-400 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
          >
            {isSubmitting ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-sky-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
