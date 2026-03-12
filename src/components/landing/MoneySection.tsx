import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { AdvancedCTAButton } from './AdvancedCTAButton';

export const MoneySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="cta-band relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 relative z-10" ref={ref}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="overline text-primary-foreground/70 mb-8"
          >
            Transparent Economics
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="heading-lg text-primary-foreground mb-10"
          >
            Here's how architects get paid
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-left bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-8 md:p-10 border border-primary-foreground/20 mb-10"
          >
            <p className="text-lg text-primary-foreground/80 mb-8">
              We're not hiding the model. We're changing it.
            </p>
            
            <div className="space-y-8">
              <div>
                <p className="text-primary-foreground/50 text-sm mb-2">Traditional compliance:</p>
                <p className="text-primary-foreground text-lg font-semibold">Included in services, zero compensation.</p>
              </div>
              
              <div className="border-t border-primary-foreground/20 pt-8">
                <p className="text-primary-foreground/50 text-sm mb-4">OxiCloud Partnership Model:</p>
                <div className="space-y-4">
                  {[
                    'Your client pays for environmental validation',
                    'A-Spine processes and settles per project',
                    'Authorities receive neutral, standardized data'
                  ].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xl font-semibold text-primary-foreground">{i + 1}.</span>
                      <span className="text-primary-foreground/90">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="border-t border-primary-foreground/20 pt-8">
                <p className="text-primary-foreground/80 font-medium mb-4">Everyone wins:</p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {[
                    'Clients get compliance infrastructure',
                    'Architects earn fair compensation',
                    'Authorities process faster',
                    'Projects move forward'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-primary-foreground/80">
                      <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-primary-foreground/60 text-sm mb-8"
          >
            This is B2B partnership, not commission sales.
            <br />
            This is professional settlement, not referral fees.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <AdvancedCTAButton
              to="/for-architects"
              variant="black"
              size="lg"
            >
              See Detailed Partnership Terms
            </AdvancedCTAButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
