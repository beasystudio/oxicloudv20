import { useEffect, useRef } from 'react';

interface FluidBackgroundProps {
  className?: string;
  intensity?: number;
}

export const FluidBackground = ({ className = '', intensity = 1 }: FluidBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener('resize', resize);

    // Check for dark mode
    const isDark = () => document.documentElement.classList.contains('dark');

    // Fluid orbs with neon green accent
    const orbs: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      isAccent: boolean;
    }> = [];

    // Create orbs - mostly neutral, one accent
    for (let i = 0; i < 5; i++) {
      orbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 150 + Math.random() * 250,
        isAccent: i === 0 // Only first orb is accent color
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const dark = isDark();
      
      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

      // Clear with theme-appropriate color
      ctx.fillStyle = dark ? 'rgba(18, 18, 17, 0.04)' : 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, 0, width, height);

      // Draw orbs
      orbs.forEach((orb) => {
        // Mouse influence
        const dx = mouseRef.current.x - orb.x;
        const dy = mouseRef.current.y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 350) {
          const force = (350 - dist) / 350 * 0.015 * intensity;
          orb.vx += dx * force * 0.001;
          orb.vy += dy * force * 0.001;
        }

        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce off edges
        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        // Friction
        orb.vx *= 0.998;
        orb.vy *= 0.998;

        // Draw gradient orb
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        );

        if (orb.isAccent) {
          // Neon green accent orb - subtle
          gradient.addColorStop(0, dark ? 'rgba(77, 252, 14, 0.08)' : 'rgba(77, 252, 14, 0.06)');
          gradient.addColorStop(0.5, dark ? 'rgba(77, 252, 14, 0.03)' : 'rgba(77, 252, 14, 0.02)');
          gradient.addColorStop(1, 'transparent');
        } else {
          // Neutral orbs
          if (dark) {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
            gradient.addColorStop(1, 'transparent');
          } else {
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.02)');
            gradient.addColorStop(1, 'transparent');
          }
        }

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Mouse glow - subtle neon green
      const mouseGradient = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 150
      );
      mouseGradient.addColorStop(0, dark ? 'rgba(77, 252, 14, 0.12)' : 'rgba(77, 252, 14, 0.08)');
      mouseGradient.addColorStop(0.5, dark ? 'rgba(77, 252, 14, 0.04)' : 'rgba(77, 252, 14, 0.02)');
      mouseGradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 150, 0, Math.PI * 2);
      ctx.fillStyle = mouseGradient;
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};