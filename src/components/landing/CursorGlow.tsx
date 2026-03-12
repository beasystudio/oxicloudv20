import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface CursorGlowProps {
  className?: string;
}

export const CursorGlow = ({ className = '' }: CursorGlowProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0, time: Date.now() });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring-based following with velocity-aware damping
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  
  // Secondary layer with different timing for depth
  const x2 = useSpring(mouseX, { damping: 40, stiffness: 100, mass: 0.8 });
  const y2 = useSpring(mouseY, { damping: 40, stiffness: 100, mass: 0.8 });
  
  // Tertiary layer - slowest
  const x3 = useSpring(mouseX, { damping: 60, stiffness: 60, mass: 1.2 });
  const y3 = useSpring(mouseY, { damping: 60, stiffness: 60, mass: 1.2 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - lastPosRef.current.time;
      
      if (dt > 0) {
        velocityRef.current = {
          x: (e.clientX - lastPosRef.current.x) / dt,
          y: (e.clientY - lastPosRef.current.y) / dt
        };
      }
      
      lastPosRef.current = { x: e.clientX, y: e.clientY, time: now };
      
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  const isDark = false;

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: 1 }}>
      {/* Tertiary glow - largest, slowest */}
      <motion.div
        className="absolute rounded-full"
        style={{
          x: x3,
          y: y3,
          width: 400,
          height: 400,
          marginLeft: -200,
          marginTop: -200,
          background: isDark 
            ? 'radial-gradient(circle, rgba(77, 252, 14, 0.03) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(77, 252, 14, 0.02) 0%, transparent 70%)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
      />
      
      {/* Secondary glow - medium */}
      <motion.div
        className="absolute rounded-full"
        style={{
          x: x2,
          y: y2,
          width: 200,
          height: 200,
          marginLeft: -100,
          marginTop: -100,
          background: isDark 
            ? 'radial-gradient(circle, rgba(77, 252, 14, 0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(77, 252, 14, 0.04) 0%, transparent 70%)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
        }}
      />
      
      {/* Primary glow - smallest, fastest */}
      <motion.div
        className="absolute rounded-full"
        style={{
          x,
          y,
          width: 80,
          height: 80,
          marginLeft: -40,
          marginTop: -40,
          background: isDark 
            ? 'radial-gradient(circle, rgba(77, 252, 14, 0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(77, 252, 14, 0.08) 0%, transparent 70%)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
        }}
      />
    </div>
  );
};
