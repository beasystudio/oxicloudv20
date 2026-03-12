import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface MetricTile {
  value: string;
  label: string;
  variant?: 'default' | 'accent';
}

interface MetricsTilesProps {
  metrics: MetricTile[];
  layout?: 'row' | 'grid';
  background?: 'black' | 'white' | 'transparent';
  className?: string;
}

export const MetricsTiles = ({ 
  metrics, 
  layout = 'row',
  background = 'black',
  className 
}: MetricsTilesProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerStyles = {
    black: 'poster-black',
    white: 'poster-white',
    transparent: ''
  };

  return (
    <div 
      ref={ref}
      className={cn(
        'py-12 md:py-16',
        containerStyles[background],
        className
      )}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className={cn(
          'flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16',
          layout === 'grid' && 'grid grid-cols-2 md:grid-cols-4'
        )}>
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="text-center"
            >
              <span className={cn(
                'block text-4xl md:text-5xl lg:text-6xl font-semibold',
                metric.variant === 'accent' 
                  ? 'text-primary' 
                  : background === 'black' 
                    ? 'text-secondary-foreground' 
                    : 'text-foreground'
              )}>
                {metric.value}
              </span>
              <p className={cn(
                'text-sm mt-2 max-w-[150px] mx-auto',
                background === 'black' 
                  ? 'text-secondary-foreground/60' 
                  : 'text-muted-foreground'
              )}>
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
