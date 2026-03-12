import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export const HiddenCostSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="overline-badge mb-6">The Invisible Tax</p>
            <h2 className="heading-md text-foreground mb-8">
              Compliance paperwork:
              <br />
              <span className="text-muted-foreground">The 20% of work you do for free</span>
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                Industry estimates suggest architects spend 15-25% of project time on 
                regulatory compliance, environmental reports, and permit documentation.
              </p>
              <p className="font-semibold text-foreground">
                That's unpaid labor. Every. Single. Project.
              </p>
              <div className="space-y-3 pt-4">
                {['Automate the calculations', 'Standardize the reports', 'Compensate the professional work'].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-xs font-bold">✓</span>
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-muted-foreground italic pt-4">
                This isn't just about speed. It's about respect.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="pt-8"
            >
              <Button
                variant="outline"
                className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-background px-8 py-6 font-semibold btn-spring"
              >
                Calculate Your Opportunity
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Chart Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="editorial-card-black rounded-lg p-8 md:p-10">
              <h4 className="text-sm font-medium text-secondary-foreground/50 mb-8">Comparison</h4>
              
              {/* Traditional Model */}
              <div className="mb-10">
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-secondary-foreground/70">Traditional Model</span>
                  <span className="text-sm font-bold text-secondary-foreground">€0 compensation</span>
                </div>
                <div className="h-3 bg-secondary-foreground/10 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-secondary-foreground/30 rounded-full" />
                </div>
              </div>

              {/* OxiCloud Model */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-secondary-foreground/70">OxiCloud Model</span>
                  <span className="text-sm font-bold text-primary">Fair settlement per project</span>
                </div>
                <div className="h-3 bg-secondary-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '75%' } : {}}
                    transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-secondary-foreground/10">
                <div>
                  <span className="text-3xl font-semibold text-primary">80%</span>
                  <p className="text-sm text-secondary-foreground/50 mt-1">Time saved</p>
                </div>
                <div>
                  <span className="text-3xl font-semibold text-secondary-foreground">+€</span>
                  <p className="text-sm text-secondary-foreground/50 mt-1">Per project</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};