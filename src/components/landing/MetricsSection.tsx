import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Metric {
  value: string;
  label: string;
}

const metrics: Metric[] = [
  { value: '85%', label: 'Faster permit approvals' },
  { value: '€15K', label: 'Average annual recovery' },
  { value: '40%', label: 'Partner settlement rate' }
];

export const MetricsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 md:py-32 px-6 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="text-center"
            >
              <p className="text-5xl lg:text-7xl font-semibold text-foreground">
                {metric.value}
              </p>
              <p className="text-sm mt-4 text-muted-foreground max-w-[180px] mx-auto">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
