import React, { useEffect, useRef } from 'react';

export const BackgroundParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = 55;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.45 - 0.15, // gently floating upward
      alpha: Math.random() * 0.7 + 0.2,
      baseAlpha: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      color: Math.random() > 0.4 ? 'rgba(168, 85, 247,' : Math.random() > 0.5 ? 'rgba(99, 102, 241,' : 'rgba(56, 189, 248,',
    }));

    let t = 0;
    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Render cosmic gradient overlay
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around borders
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Twinkle pulse
        const dynamicAlpha = p.baseAlpha + Math.sin(t * p.pulseSpeed * 20 + p.x) * 0.25;
        const safeAlpha = Math.max(0.1, Math.min(0.9, dynamicAlpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${safeAlpha})`;
        ctx.shadowBlur = p.size * 5;
        ctx.shadowColor = `${p.color} 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep cosmic ambient background glowing orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-purple-600/12 rounded-full blur-[110px] animate-pulse-slow delay-1000" />
      <div className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse-slow delay-2000" />
      
      {/* Subtle star particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};
