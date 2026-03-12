import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { AdvancedCTAButton } from './AdvancedCTAButton';

export const RevealSection = () => {
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
            The OxiCloud Difference
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="heading-lg text-secondary-foreground mb-12"
          >
            What if compliance work was actually{' '}
            <span className="text-primary">part of your revenue?</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="body-lg text-secondary-foreground/70 mb-16 max-w-2xl mx-auto text-left space-y-6"
          >
            <p>OxiCloud is the neutral infrastructure layer that:</p>
            <ol className="space-y-3">
              <li className="flex gap-4">
                <span className="text-primary font-bold">1.</span>
                Automates environmental calculations (NOₓ, sustainability metrics)
              </li>
              <li className="flex gap-4">
                <span className="text-primary font-bold">2.</span>
                Generates defensible compliance reports
              </li>
              <li className="flex gap-4">
                <span className="text-primary font-bold">3.</span>
                Accelerates regulatory approval
              </li>
            </ol>
          </motion.div>

          {/* Key numbers grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid sm:grid-cols-3 gap-6 mb-12"
          >
            {[
              { number: '01', text: 'Design teams get compensated' },
              { number: '02', text: 'Authorities get clarity' },
              { number: '03', text: 'Projects move faster' }
            ].map((item, i) => (
              <div key={i} className="text-center space-y-2 py-6 border-t border-secondary-foreground/10">
                <span className="text-primary text-3xl font-semibold">{item.number}</span>
                <p className="text-secondary-foreground/80 text-sm">{item.text}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <AdvancedCTAButton
              to="/for-architects"
              variant="green"
              size="lg"
            >
              Discover Partnership Benefits
            </AdvancedCTAButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
