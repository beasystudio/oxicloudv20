import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const oldWay = [
  "Architects do compliance work unpaid",
  "Months waiting for permit validation",
  "Endless revision cycles and re-submissions",
  "Authorities drowning in inconsistent data",
  "Projects delayed, budgets blown",
  "Environmental impact happens BEFORE approval"
];

const newWay = [
  "Design teams compensated per project",
  "Automated validation in days, not months",
  "Standardized reports, fewer rejections",
  "Authorities review with confidence",
  "Projects move to construction faster",
  "Less pre-approval waste and emissions"
];

export const ComparisonSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-md text-foreground mb-4">
            What changes with OxiCloud
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-0 relative">
          {/* Divider with Arrow */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-14 h-14 bg-primary rounded-full flex items-center justify-center"
            >
              <span className="text-primary-foreground text-xl font-bold">→</span>
            </motion.div>
          </div>

          {/* Old Way */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-muted rounded-l-lg lg:rounded-r-none rounded-lg p-8 lg:p-10"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                <span className="text-muted-foreground font-bold">✕</span>
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground">The Old Way</h3>
            </div>

            <ul className="space-y-4">
              {oldWay.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -15 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-muted-foreground/50 mt-0.5">✕</span>
                  <span className="text-muted-foreground">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* New Way */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="editorial-card-black lg:rounded-l-none rounded-lg p-8 lg:p-10"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">✓</span>
              </div>
              <h3 className="text-lg font-semibold text-secondary-foreground">The OxiCloud Way</h3>
            </div>

            <ul className="space-y-4">
              {newWay.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 15 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-secondary-foreground/90">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Mobile Arrow */}
        <div className="lg:hidden flex justify-center -mt-4 -mb-4 relative z-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center rotate-90"
          >
            <span className="text-primary-foreground text-lg font-bold">→</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};