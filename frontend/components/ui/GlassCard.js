'use client';

import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  animate = false,
  delay = 0,
  onClick,
  ...props
}) {
  const baseClasses = `glass-card p-6 rounded-2xl ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
        whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : undefined}
        className={baseClasses}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
}
