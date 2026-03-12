import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface PosterStatementProps {
  statement: string;
  variant?: 'black' | 'green';
  className?: string;
}

export const PosterStatement = ({ 
  statement, 
  variant = 'black',
  className 
}: PosterStatementProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className={cn(
        'section-padding-sm relative overflow-hidden',
        variant === 'black' ? 'poster-black' : 'poster-green',
        className
      )}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="heading-lg text-center max-w-5xl mx-auto"
        >
          {statement}
        </motion.p>
      </div>
    </section>
  );
};
