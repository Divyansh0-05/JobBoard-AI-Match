'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// SVG Logos for major AI Companies
const aiCompanies = [
  {
    name: 'OpenAI',
    role: 'GPT-4o & Embeddings',
    color: 'from-[#10a37f]/20 to-[#10a37f]/5',
    borderColor: 'border-[#10a37f]/40',
    textColor: 'text-[#10a37f]',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9 6.0651 6.0651 0 0 0-4.981-2.01 6.0094 6.0094 0 0 0-5.704 4.09 6.0711 6.0711 0 0 0-4.004 2.87 6.01 6.01 0 0 0 .741 6.94 5.984 5.984 0 0 0 .515 4.91 6.046 6.046 0 0 0 6.51 2.9 6.065 6.065 0 0 0 4.981 2.01 6.009 6.009 0 0 0 5.704-4.09 6.071 6.071 0 0 0 4.004-2.87 6.007 6.007 0 0 0-.741-6.94ZM13.68 20.37a4.475 4.475 0 0 1-2.885-1.04l.142-.082 4.782-2.76a.79.79 0 0 0 .394-.683v-6.74l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.517 4.517 0 0 1-4.49 4.502ZM4.43 16.71a4.468 4.468 0 0 1-.524-3.012l.141.085 4.784 2.76a.794.794 0 0 0 .79 0l5.834-3.37v2.333a.078.078 0 0 1-.034.062l-4.832 2.79a4.51 4.51 0 0 1-6.159-1.648ZM3.535 8.17a4.473 4.473 0 0 1 2.365-1.974v5.688a.784.784 0 0 0 .394.681l5.834 3.37-2.02 1.168a.076.076 0 0 1-.072.006l-4.834-2.79a4.515 4.515 0 0 1-1.667-6.149Zm14.28 2.502-5.835-3.37 2.02-1.166a.077.077 0 0 1 .072-.006l4.834 2.79a4.51 4.51 0 0 1 1.666 6.148 4.473 4.473 0 0 1-2.363 1.974v-5.69a.786.786 0 0 0-.394-.68Zm2.078-3.08-4.784-2.76a.795.795 0 0 0-.79 0l-5.834 3.37v-2.333a.078.078 0 0 1 .035-.063l4.83-2.79a4.51 4.51 0 0 1 6.685 4.566Zm-12.753.808-2.02-1.166a.077.077 0 0 1-.038-.053v-5.58a4.51 4.51 0 0 1 7.378-3.461l-.142.082-4.783 2.76a.79.79 0 0 0-.394.683v6.735Z" />
      </svg>
    )
  },
  {
    name: 'Anthropic',
    role: 'Claude 3.5 Sonnet',
    color: 'from-[#d97757]/20 to-[#d97757]/5',
    borderColor: 'border-[#d97757]/40',
    textColor: 'text-[#d97757]',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 3.125h-3.528l-8.416 17.75h3.528l1.79-3.83h7.245l1.79 3.83h3.528L17.472 3.125zm-5.466 11.2l2.366-5.06 2.366 5.06h-4.732z" />
      </svg>
    )
  },
  {
    name: 'Google Gemini',
    role: 'text-embedding-004',
    color: 'from-[#4285f4]/20 to-[#a142f4]/10',
    borderColor: 'border-[#4285f4]/40',
    textColor: 'text-[#4285f4]',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
    )
  },
  {
    name: 'Meta AI',
    role: 'Llama 3.3 70B',
    color: 'from-[#0668e1]/20 to-[#0668e1]/5',
    borderColor: 'border-[#0668e1]/40',
    textColor: 'text-[#0668e1]',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14.5h-2v-5h2v5zm0-7h-2V7h2v2.5z" />
      </svg>
    )
  },
  {
    name: 'Mistral AI',
    role: 'Mistral Large 2',
    color: 'from-[#ff7000]/20 to-[#ff7000]/5',
    borderColor: 'border-[#ff7000]/40',
    textColor: 'text-[#ff7000]',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M3 3h4v4H3V3zm14 0h4v4h-4V3zm-7 7h4v4h-4v-4zm-7 7h4v4H3v-4zm14 0h4v4h-4v-4z" />
      </svg>
    )
  },
  {
    name: 'Perplexity',
    role: 'Sonar Reasoning',
    color: 'from-[#00b4d8]/20 to-[#00b4d8]/5',
    borderColor: 'border-[#00b4d8]/40',
    textColor: 'text-[#00b4d8]',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L19.2 8 12 11.2 4.8 8 12 4.8zM4 9.6l7 3.5v6.1l-7-3.5V9.6zm16 6.1l-7 3.5v-6.1l7-3.5v6.1z" />
      </svg>
    )
  }
];

export default function StructuredAILogos() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      setMouseOffset({ x: x * 15, y: y * 15 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      animate={{ x: mouseOffset.x, y: mouseOffset.y }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-[#0A0A0F]/60 backdrop-blur-xl border border-white/15 shadow-2xl"
    >
      {aiCompanies.map((comp, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.05, y: -2 }}
          className={`flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r ${comp.color} border ${comp.borderColor} transition-all cursor-default group`}
        >
          <div className={`${comp.textColor} transition-transform group-hover:scale-110`}>
            {comp.svg}
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">{comp.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">{comp.role}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
