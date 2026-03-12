import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { AdvancedCTAButton, CTAButton } from './AdvancedCTAButton';

export const FinalCTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="poster-black section-padding relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 relative z-10" ref={ref}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="overline-badge-dark mb-8"
          >
            Join the Movement
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="heading-lg text-secondary-foreground mb-6"
          >
            Ready to get paid for the work you're already doing?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="body-lg text-secondary-foreground/60 mb-12 max-w-2xl mx-auto"
          >
            Join the architectural firms building the future of environmental compliance — 
            and finally earning fair compensation for it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <AdvancedCTAButton
              to="/register"
              variant="green"
              size="lg"
            >
              Start Partnership
            </AdvancedCTAButton>
            
            <CTAButton
              to="/contact"
              variant="ghost"
              size="lg"
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              Explore the Platform
            </CTAButton>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-secondary-foreground/30 text-sm mt-12"
          >
            No credit card required. No hidden fees.
            <br />
            Just transparent infrastructure built to work.
          </motion.p>
        </div>
      </div>
    </section>
  );
};
