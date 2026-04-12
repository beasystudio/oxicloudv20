import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    number: '01',
    title: 'Jump into the demo',
    description: 'Sign up. Get inside. Explore the product and ask anything. If it clicks, launch your company workspace instantly.',
  },
  {
    number: '02',
    title: 'Activate your team',
    description: 'Set up your workspace, add your organization, and invite your team. Done in under 3 minutes. You\'re live.',
  },
  {
    number: '03',
    title: 'Start producing',
    description: 'Generate a quote, align with your project owner, and deliver your first reports in OxiCloud - powered by our NOx engine.',
  },
];

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6 bg-background">
      <div className="container mx-auto max-w-6xl" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Left column - intro */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <span className="inline-block text-xs font-medium tracking-widest uppercase text-muted-foreground border border-border rounded-full px-3 py-1 w-fit mb-6">
              How it works
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-foreground leading-[1.15] mb-5 text-balance">
              Up and running in minutes.{' '}
              <span className="text-muted-foreground">No friction.</span>
            </h2>
          </motion.div>

          {/* Right column - vertical timeline */}
          <div className="relative">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-5 top-0 bottom-0 w-px bg-border origin-top"
            />

            <div className="flex flex-col gap-10">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
                  className="relative flex items-start gap-6 group"
                >
                  <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors duration-300">
                    <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                      {step.number}
                    </span>
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-lg font-semibold text-foreground mb-1.5">{step.title}</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
