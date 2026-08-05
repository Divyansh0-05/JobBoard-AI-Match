'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Code2, Database, Cpu, Layers, Terminal, Globe, Shield } from 'lucide-react';

const techBadges = [
  { name: 'React', icon: Code2, color: 'text-cyan-400', border: 'border-cyan-500/30', top: '15%', left: '10%', speed: 0.04 },
  { name: 'Node.js', icon: Database, color: 'text-emerald-400', border: 'border-emerald-500/30', top: '25%', left: '82%', speed: -0.05 },
  { name: 'Next.js', icon: Terminal, color: 'text-white', border: 'border-white/30', top: '65%', left: '8%', speed: 0.03 },
  { name: 'MongoDB', icon: Layers, color: 'text-green-400', border: 'border-green-500/30', top: '75%', left: '88%', speed: -0.04 },
  { name: 'Gemini AI', icon: Sparkles, color: 'text-purple-400', border: 'border-purple-500/30', top: '12%', left: '70%', speed: 0.06 },
  { name: 'TypeScript', icon: Cpu, color: 'text-blue-400', border: 'border-blue-500/30', top: '80%', left: '48%', speed: -0.03 },
  { name: 'Tailwind', icon: Globe, color: 'text-sky-400', border: 'border-sky-500/30', top: '45%', left: '92%', speed: 0.05 },
  { name: 'Express.js', icon: Shield, color: 'text-amber-400', border: 'border-amber-500/30', top: '48%', left: '5%', speed: -0.06 }
];

export default function InteractiveFloatingLogos() {
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
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {techBadges.map((badge, idx) => {
        const IconComponent = badge.icon;
        const offsetX = mousePos.x * 45 * (idx % 2 === 0 ? 1 : -1) * (1 + idx * 0.1);
        const offsetY = mousePos.y * 45 * (idx % 3 === 0 ? 1 : -1) * (1 + idx * 0.1);

        return (
          <motion.div
            key={idx}
            style={{
              top: badge.top,
              left: badge.left,
            }}
            animate={{
              x: offsetX,
              y: offsetY,
            }}
            transition={{
              type: 'spring',
              stiffness: 75,
              damping: 15,
              mass: 0.5,
            }}
            className={`absolute hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0A0A0F]/60 backdrop-blur-xl border ${badge.border} shadow-xl shadow-black/40 text-xs font-semibold select-none group cursor-pointer pointer-events-auto hover:scale-110 transition-transform`}
          >
            <IconComponent className={`w-3.5 h-3.5 ${badge.color}`} />
            <span className="text-slate-200">{badge.name}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
