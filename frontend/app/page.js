'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import OrbitalAppIcons from '@/components/ui/OrbitalAppIcons';
import BinaryMatrixBg from '@/components/ui/BinaryMatrixBg';
import { Sparkles, ArrowRight, UserCheck, Briefcase, User, Cpu, ShieldCheck, Zap, Layers, Globe, Radio, Target, CheckCircle2, Loader2, Award, Laptop, FileText, Binary } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'recruiter') {
        router.push('/recruiter/jobs');
      } else {
        router.push('/jobs');
      }
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Placeholder generic fictional company logotypes for marquee
  const brandLogos = [
    { name: 'Nortex', icon: Cpu },
    { name: 'Bluepeak', icon: Target },
    { name: 'Vantage Labs', icon: Layers },
    { name: 'Corewave', icon: Zap },
    { name: 'Synthetix', icon: Radio },
    { name: 'AuraTech', icon: Globe },
    { name: 'Nexus AI', icon: Sparkles },
    { name: 'Prism Systems', icon: ShieldCheck }
  ];

  // Features list (NO Learn More buttons)
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Vector Matching',
      description: 'Cosine similarity algorithms analyze candidate resumes against job description embeddings to compute accurate, instant match percentages.',
      color: 'from-sky-500 to-indigo-600'
    },
    {
      icon: User,
      title: 'For Candidates',
      description: 'Save your plain text resume once, browse personalized job openings pre-ranked by match percentage, and apply with a single click.',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      icon: Briefcase,
      title: 'For Recruiters',
      description: 'Post job openings with precomputed vector embeddings, track applicant numbers, and review candidates pre-ranked by match score automatically.',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAFAFC] text-slate-900 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. FIRST VIEW HERO SECTION (With High-Tech AI Binary Matrix Canvas Overlay) */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-screen pt-32 pb-24 px-6 sm:px-12 lg:px-16 bg-gradient-to-b from-[#0B1329] via-[#0284C7] to-[#0F172A] flex items-center overflow-hidden">
        
        {/* Animated AI Binary Rain Canvas */}
        <BinaryMatrixBg />

        {/* High-Tech Perspective Matrix Grid Mesh Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-20 pointer-events-none z-0"></div>

        {/* Soft Radial Sky Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-cyan-400/25 via-sky-400/15 to-transparent rounded-full blur-[140px] pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* LEFT COLUMN: Hero Copy & CTA Buttons */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-cyan-200 text-xs font-semibold shadow-xl shadow-cyan-950/40"
            >
              <Binary className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Gemini Embeddings Match Engine v1.0</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] font-serif drop-shadow-md"
            >
              JobBoard AI-Match lets you find your ideal role with AI
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-sky-100/90 font-medium max-w-xl leading-relaxed drop-shadow-sm"
            >
              Start with plain text resumes, then let Gemini vector embeddings compute instant cosine similarity match scores for candidate applications.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href="/register?role=candidate"
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 py-3.5 rounded-full text-base shadow-2xl hover:scale-105 transition-all flex items-center space-x-2.5 group"
              >
                <UserCheck className="w-5 h-5 text-sky-600" />
                <span>I&apos;m a Candidate</span>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/register?role=recruiter"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold border border-white/35 px-8 py-3.5 rounded-full text-base transition-all flex items-center space-x-2.5 shadow-lg"
              >
                <Briefcase className="w-5 h-5 text-sky-200" />
                <span>I&apos;m a Recruiter</span>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Floating Glass Status Badges & Binary Code Workspace Scene */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Floating Glass Task Badges (cofounder style status chips) */}
            <div className="w-full max-w-md space-y-3.5 relative z-20">
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-slate-950/80 backdrop-blur-xl border border-cyan-500/40 p-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-xs text-white"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute"></div>
                <div className="flex-1 text-slate-300 font-mono">
                  Vector Matrix: <span className="font-bold text-cyan-300">01001000... (768d)</span>
                </div>
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="bg-slate-950/80 backdrop-blur-xl border border-emerald-500/40 p-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-xs text-white"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <div className="flex-1 text-slate-300 font-mono">
                  Cosine Cos(θ): <span className="font-bold text-emerald-300">86.4% Match Score</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </motion.div>

              {/* Binary & Embedding Card Illustration */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-6 bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300">text-embedding-004</span>
                </div>

                <div className="space-y-3 font-mono text-xs text-white">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Laptop className="w-4 h-4 text-sky-400" />
                      <span className="text-slate-200">Senior Full Stack Developer</span>
                    </div>
                    <span className="text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/80 rounded border border-emerald-500/40">86% Match</span>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="text-slate-200">React Frontend Engineer</span>
                    </div>
                    <span className="text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/80 rounded border border-emerald-500/40">79% Match</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 2. ORBITAL APP ICONS INTEGRATION SECTION (Inspired by user screenshot) */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FAFAFC] py-8">
        <OrbitalAppIcons />
      </section>


      {/* ========================================================================= */}
      {/* 3. TRUSTED BY LOGO MARQUEE SECTION */}
      {/* ========================================================================= */}
      <section className="relative w-full pt-12 pb-6 bg-white border-y border-slate-200/80">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-8">
          Built for candidates and recruiters everywhere
        </p>

        <div className="relative w-full overflow-hidden py-2">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <div className="animate-marquee flex items-center space-x-12">
            {[...brandLogos, ...brandLogos].map((brand, idx) => {
              const IconComponent = brand.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center space-x-2.5 opacity-60 hover:opacity-100 transition-opacity cursor-default px-4"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-sky-600" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide text-slate-800">
                    {brand.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. 3-COLUMN FEATURE CARDS SECTION (NO Learn More buttons) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
            Designed for seamless, intelligent hiring
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            Our platform leverages Gemini vector embeddings to eliminate guesswork in talent matching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
              >
                <GlassCard className="h-full flex flex-col justify-between p-8 border border-slate-200/80 hover:border-sky-500/40 transition-colors bg-white shadow-md shadow-slate-100">
                  <div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} p-0.5 shadow-md mb-6`}>
                      <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-sky-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{feat.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 5. FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-slate-200/80 bg-white pt-12 pb-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <span className="font-bold text-slate-900 tracking-tight font-serif">JobBoard <span className="text-gradient">AI-Match</span></span>
          </div>

          <p className="text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} JobBoard AI-Match. Built with Next.js, Express, MongoDB, & Gemini API.
          </p>

          <div className="flex items-center space-x-6 text-xs text-slate-600 font-medium">
            <Link href="/login" className="hover:text-slate-900 transition-colors">Login</Link>
            <Link href="/register" className="hover:text-slate-900 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
