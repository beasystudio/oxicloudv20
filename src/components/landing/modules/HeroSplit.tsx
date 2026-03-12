import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { AdvancedCTAButton, CTAButton } from '../AdvancedCTAButton';
import { cn } from '@/lib/utils';

interface HeroSplitProps {
  overline?: string;
  headline: React.ReactNode;
  subheadline?: string;
  primaryCTA?: {
    text: string;
    to?: string;
    href?: string;
  };
  secondaryCTA?: {
    text: string;
    to?: string;
  };
  card?: {
    variant: 'black' | 'green';
    overline?: string;
    headline: string;
    metrics?: Array<{
      value: string;
      label: string;
    }>;
  };
  trustLine?: string;
  className?: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const HeroSplit = ({
  overline,
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  card,
  trustLine,
  className
}: HeroSplitProps) => {
  const ref = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const cardY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      setMousePosition({
        x: (clientX / innerWidth - 0.5) * 20,
        y: (clientY / innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={ref}
      className={cn(
        'relative min-h-screen flex items-center bg-background overflow-hidden',
        className
      )}
    >
      {/* Subtle cursor-following glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"
        animate={{
          x: mousePosition.x * 2,
          y: mousePosition.y * 2,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
        style={{ left: '20%', top: '30%' }}
      />

      <div className="container mx-auto px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text (7 cols) */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 space-y-8"
          >
            {overline && (
              <motion.div variants={item}>
                <span className="overline-badge-dark">
                  {overline}
                </span>
              </motion.div>
            )}

            <motion.h1 variants={item} className="heading-xl text-foreground">
              {headline}
            </motion.h1>

            {subheadline && (
              <motion.p variants={item} className="body-lg text-muted-foreground max-w-xl">
                {subheadline}
              </motion.p>
            )}

            {(primaryCTA || secondaryCTA) && (
              <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 pt-4">
                {primaryCTA && (
                  <AdvancedCTAButton
                    to={primaryCTA.to}
                    href={primaryCTA.href}
                    variant="black"
                    size="lg"
                  >
                    {primaryCTA.text}
                  </AdvancedCTAButton>
                )}
                {secondaryCTA && (
                  <CTAButton
                    to={secondaryCTA.to}
                    variant="outline"
                    size="lg"
                  >
                    {secondaryCTA.text}
                  </CTAButton>
                )}
              </motion.div>
            )}

            {trustLine && (
              <motion.p variants={item} className="text-sm text-muted-foreground pt-4">
                {trustLine}
              </motion.p>
            )}
          </motion.div>

          {/* Right Column - Card (5 cols) */}
          {card && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ y: cardY }}
              className="lg:col-span-5"
            >
              <motion.div 
                className={cn(
                  'p-8 lg:p-10 rounded-lg',
                  card.variant === 'black' ? 'editorial-card-black' : 'editorial-card-green'
                )}
                animate={{
                  x: mousePosition.x * 0.5,
                  y: mousePosition.y * 0.5,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 30 }}
              >
                <div className="space-y-6">
                  {card.overline && (
                    <p className={cn(
                      'overline',
                      card.variant === 'black' ? 'text-primary' : 'text-primary-foreground/70'
                    )}>
                      {card.overline}
                    </p>
                  )}
                  <h3 className="heading-sm">
                    {card.headline}
                  </h3>
                  {card.metrics && (
                    <div className="space-y-5 pt-4">
                      {card.metrics.map((metric, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <span className={cn(
                            'text-4xl lg:text-5xl font-semibold',
                            card.variant === 'black' ? 'text-primary' : 'text-primary-foreground'
                          )}>
                            {metric.value}
                          </span>
                          <p className={cn(
                            'text-sm pt-2',
                            card.variant === 'black' ? 'text-secondary-foreground/70' : 'text-primary-foreground/80'
                          )}>
                            {metric.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer"
        onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-muted-foreground text-xs tracking-[0.15em] uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-muted-foreground/40 to-transparent"
        />
      </motion.div>
    </section>
  );
};
