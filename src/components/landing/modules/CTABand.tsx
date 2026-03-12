import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { AdvancedCTAButton } from '../AdvancedCTAButton';
import { cn } from '@/lib/utils';

interface CTABandProps {
  message: string;
  buttonText: string;
  buttonTo?: string;
  buttonHref?: string;
  className?: string;
}

export const CTABand = ({ 
  message, 
  buttonText,
  buttonTo,
  buttonHref,
  className 
}: CTABandProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className={cn('cta-band', className)}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="heading-sm text-primary-foreground text-center md:text-left"
          >
            {message}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <AdvancedCTAButton 
              to={buttonTo}
              href={buttonHref}
              variant="black"
              size="lg"
            >
              {buttonText}
            </AdvancedCTAButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
