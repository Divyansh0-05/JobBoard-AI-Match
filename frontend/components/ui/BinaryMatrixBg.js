'use client';

import { useEffect, useRef } from 'react';

export default function BinaryMatrixBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Characters for binary & vector embedding math symbols
    const chars = '01011001010101100110cos(θ)vector004geminiAI0101';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1).map(() => Math.floor(Math.random() * -50));

    const draw = () => {
      // Semi-transparent fade background for trailing effect
      ctx.fillStyle = 'rgba(2, 132, 199, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(186, 230, 253, 0.4)'; // Cyan-200 glow text
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (y > 0) {
          ctx.fillText(text, x, y);
        }

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0"
    />
  );
}
