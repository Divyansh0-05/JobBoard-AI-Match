'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code2, Cpu, Globe, Zap, Layers, Terminal, Command, Compass, Shield } from 'lucide-react';

const appIcons = [
  // Top Left
  {
    name: 'OpenAI',
    bgColor: 'bg-white',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-200',
    icon: (
      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9 6.0651 6.0651 0 0 0-4.981-2.01 6.0094 6.0094 0 0 0-5.704 4.09 6.0711 6.0711 0 0 0-4.004 2.87 6.01 6.01 0 0 0 .741 6.94 5.984 5.984 0 0 0 .515 4.91 6.046 6.046 0 0 0 6.51 2.9 6.065 6.065 0 0 0 4.981 2.01 6.009 6.009 0 0 0 5.704-4.09 6.071 6.071 0 0 0 4.004-2.87 6.007 6.007 0 0 0-.741-6.94ZM13.68 20.37a4.475 4.475 0 0 1-2.885-1.04l.142-.082 4.782-2.76a.79.79 0 0 0 .394-.683v-6.74l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.517 4.517 0 0 1-4.49 4.502ZM4.43 16.71a4.468 4.468 0 0 1-.524-3.012l.141.085 4.784 2.76a.794.794 0 0 0 .79 0l5.834-3.37v2.333a.078.078 0 0 1-.034.062l-4.832 2.79a4.51 4.51 0 0 1-6.159-1.648ZM3.535 8.17a4.473 4.473 0 0 1 2.365-1.974v5.688a.784.784 0 0 0 .394.681l5.834 3.37-2.02 1.168a.076.076 0 0 1-.072.006l-4.834-2.79a4.515 4.515 0 0 1-1.667-6.149Zm14.28 2.502-5.835-3.37 2.02-1.166a.077.077 0 0 1 .072-.006l4.834 2.79a4.51 4.51 0 0 1 1.666 6.148 4.473 4.473 0 0 1-2.363 1.974v-5.69a.786.786 0 0 0-.394-.68Zm2.078-3.08-4.784-2.76a.795.795 0 0 0-.79 0l-5.834 3.37v-2.333a.078.078 0 0 1 .035-.063l4.83-2.79a4.51 4.51 0 0 1 6.685 4.566Zm-12.753.808-2.02-1.166a.077.077 0 0 1-.038-.053v-5.58a4.51 4.51 0 0 1 7.378-3.461l-.142.082-4.783 2.76a.79.79 0 0 0-.394.683v6.735Z" />
      </svg>
    ),
    position: 'top-6 left-12 md:left-24'
  },
  // Top Center-Left
  {
    name: 'Anthropic',
    bgColor: 'bg-[#0F172A]',
    textColor: 'text-white',
    borderColor: 'border-slate-800',
    icon: (
      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 3.125h-3.528l-8.416 17.75h3.528l1.79-3.83h7.245l1.79 3.83h3.528L17.472 3.125zm-5.466 11.2l2.366-5.06 2.366 5.06h-4.732z" />
      </svg>
    ),
    position: 'top-2 left-1/3'
  },
  // Top Center-Right
  {
    name: 'Gemini',
    bgColor: 'bg-gradient-to-tr from-sky-500 to-indigo-600',
    textColor: 'text-white',
    borderColor: 'border-transparent',
    icon: <Sparkles className="w-7 h-7" />,
    position: 'top-2 right-1/3'
  },
  // Top Right
  {
    name: 'Twitch',
    bgColor: 'bg-[#9146FF]',
    textColor: 'text-white',
    borderColor: 'border-transparent',
    icon: (
      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143h-1.715V4.714zm4.715 0H18v5.143h-1.714V4.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0H6zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714v9.429z" />
      </svg>
    ),
    position: 'top-8 right-12 md:right-24'
  },

  // Mid Left
  {
    name: 'Mailchimp',
    bgColor: 'bg-[#FFE01B]',
    textColor: 'text-slate-900',
    borderColor: 'border-transparent',
    icon: <Zap className="w-7 h-7 text-slate-900" />,
    position: 'top-1/3 left-4 md:left-12'
  },
  // Mid Right
  {
    name: 'Reddit / Orange',
    bgColor: 'bg-[#FF4500]',
    textColor: 'text-white',
    borderColor: 'border-transparent',
    icon: <Compass className="w-7 h-7 text-white" />,
    position: 'top-1/3 right-4 md:right-12'
  },

  // Bottom Left
  {
    name: 'Supabase',
    bgColor: 'bg-[#3ECF8E]',
    textColor: 'text-slate-900',
    borderColor: 'border-transparent',
    icon: <Terminal className="w-7 h-7 text-slate-900" />,
    position: 'bottom-4 left-8 md:left-20'
  },
  // Bottom Center-Left
  {
    name: 'Dropbox',
    bgColor: 'bg-[#0061FF]',
    textColor: 'text-white',
    borderColor: 'border-transparent',
    icon: (
      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
        <path d="M6 1.807L0 5.629l6 3.822 6-3.822-6-3.822zm12 0l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.273l6 3.822 6-3.822-6-3.822-6 3.822zm18-3.822l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.545l6 3.822 6-3.822-6-3.822-6 3.822z" />
      </svg>
    ),
    position: 'bottom-2 left-1/3'
  },
  // Bottom Center-Right
  {
    name: 'Airbnb',
    bgColor: 'bg-[#FF5A5F]',
    textColor: 'text-white',
    borderColor: 'border-transparent',
    icon: <Globe className="w-7 h-7 text-white" />,
    position: 'bottom-2 right-1/3'
  },
  // Bottom Right
  {
    name: 'Nike',
    bgColor: 'bg-white',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-200',
    icon: <Command className="w-7 h-7 text-slate-900" />,
    position: 'bottom-4 right-8 md:right-20'
  }
];

export default function OrbitalAppIcons() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[380px] sm:h-[420px] flex items-center justify-center my-12 overflow-hidden select-none">
      
      {/* Center Heading */}
      <div className="text-center z-20 px-4 max-w-md">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          A growing library of AI & Tech Integrations
        </h3>
        <p className="text-xs text-slate-500 mt-2">
          Connect plain text resumes with model embeddings across major platforms.
        </p>
      </div>

      {/* Orbital App Tiles */}
      {appIcons.map((app, idx) => {
        const offsetX = mousePos.x * 25 * (idx % 2 === 0 ? 1 : -1);
        const offsetY = mousePos.y * 25 * (idx % 3 === 0 ? 1 : -1);

        return (
          <motion.div
            key={idx}
            animate={{ x: offsetX, y: offsetY }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            className={`absolute ${app.position} w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${app.bgColor} ${app.textColor} border ${app.borderColor} shadow-xl shadow-slate-300/40 flex items-center justify-center p-3 cursor-pointer hover:scale-110 transition-transform z-10`}
            title={app.name}
          >
            {app.icon}
          </motion.div>
        );
      })}
    </div>
  );
}
