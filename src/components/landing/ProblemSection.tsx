import { motion, Variants } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="problem" className="section-padding poster-grey">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center" ref={ref}>
          {/* Left Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            <motion.p variants={fadeUp} className="overline-badge mb-6">
              The Old System
            </motion.p>
            
            <motion.h2 variants={fadeUp} className="heading-lg text-foreground mb-8">
              You do the work.
              <br />
              <span className="text-muted-foreground">You don't get paid for it.</span>
              <br />
              Everyone waits longer.
            </motion.h2>
            
            <motion.div variants={fadeUp} className="space-y-6 text-lg text-muted-foreground">
              <p>Every sustainable building project requires:</p>
              <ul className="space-y-3">
                {[
                  'NOₓ calculations',
                  'Environmental impact reports',
                  'Regulatory compliance documentation',
                  'Endless back-and-forth revisions'
                ].map((text) => (
                  <motion.li 
                    key={text}
                    variants={fadeUp}
                    className="flex items-center gap-4"
                  >
                    <span className="w-2 h-2 bg-foreground rounded-full flex-shrink-0" />
                    <span>{text}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.p variants={fadeUp} className="pt-4">
                Architects handle this work as "included services."
                <br />
                <span className="font-semibold text-foreground">
                  No separate fee. No recognition. Just more paperwork.
                </span>
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Right - Stats Cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            className="space-y-4"
          >
            {/* Main stat - black card */}
            <motion.div
              variants={fadeUp}
              className="editorial-card-black p-8"
            >
              <div className="flex items-baseline gap-4">
                <span className="text-5xl lg:text-6xl font-semibold text-primary">15-25%</span>
                <p className="text-secondary-foreground/80">
                  of project time spent on regulatory compliance
                </p>
              </div>
            </motion.div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                variants={fadeUp}
                className="glass-card-strong p-6 glass-hover"
              >
                <span className="text-3xl lg:text-4xl font-semibold text-foreground">3-6</span>
                <p className="text-sm text-muted-foreground mt-2">months average permit delay</p>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="glass-card-strong p-6 glass-hover"
              >
                <span className="text-3xl lg:text-4xl font-semibold text-foreground">€0</span>
                <p className="text-sm text-muted-foreground mt-2">compensation for compliance work</p>
              </motion.div>
            </div>

            {/* Highlight */}
            <motion.div
              variants={fadeUp}
              className="editorial-card-green p-6"
            >
              <p className="text-primary-foreground font-semibold">
                That's unpaid labor. Every. Single. Project.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
