import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  { number: '01', title: 'Project Upload', badge: 'Day 1', description: 'Architects submit project data and location details through OxiCloud' },
  { number: '02', title: 'Automated Analysis', badge: 'Day 1–2', description: 'AI calculates NOₓ, sustainability metrics and compliance data against municipal standards' },
  { number: '03', title: 'Approved Report', badge: 'Day 3–5', description: 'Receive municipality-ready, standardized and defensible documentation' },
  { number: '04', title: 'Partner Settlement', badge: 'Ongoing', description: 'Earn 40% partner payment on every validated project' }
];

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6 bg-background">
      <div className="container mx-auto max-w-6xl" ref={ref}>
        {/* Split layout: left intro + right timeline */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Left column — intro */}
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
              From submission to settlement,{' '}
              <span className="text-muted-foreground">without the complexity.</span>
            </h2>
            <p className="text-muted-foreground max-w-md text-balance">
              Our four-step process takes you from uploading project data to earning partner settlement, with automated compliance at every stage.
            </p>
          </motion.div>

          {/* Right column — vertical timeline */}
          <div className="relative">
            {/* Vertical line */}
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
                  {/* Number circle on the timeline */}
                  <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors duration-300">
                    <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pt-1.5">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                      <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5 border border-border">
                        {step.badge}
                      </span>
                    </div>
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
