import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const trustItems = [
  { title: 'Regulatory Accepted', description: 'OxiCloud reports meet Brussels regional standards for environmental compliance documentation' },
  { title: 'Data Security', description: 'ISO 27001 compliant. Your project data is protected and never shared.' },
  { title: 'Neutral Infrastructure', description: 'We don\'t favor architects or authorities. We serve the process.' },
  { title: 'Sustainability First', description: 'Every report includes carbon impact — because compliance should advance climate goals.' },
  { title: 'Partnership Integrity', description: 'Settlement terms defined by contract, not fine print.' },
  { title: 'Modern Stack', description: 'Built on proven technology: Automated calculations, API-ready, integration-friendly.' }
];

export const TrustSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding poster-grey">
      <div className="container mx-auto px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-md text-foreground mb-4">
            Built on neutrality. Powered by transparency.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="glass-card-strong p-6 glass-hover hover-lift"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
