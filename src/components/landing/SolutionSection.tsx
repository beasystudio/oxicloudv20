import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Clock, Receipt, Heart } from 'lucide-react';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const pillars = [
  {
    icon: Clock,
    title: 'Your time back',
    description: 'AI-driven automation that gives architects not only their time back, but also ownership within the ecosystem.',
  },
  {
    icon: Shield,
    title: 'Full accountability',
    description: 'We take full accountability for the reports. You get compliance-ready NOx reports, ready to submit to the Omgevingsloket with one click.',
  },
  {
    icon: Receipt,
    title: 'Fair compensation',
    description: 'We ensure that every hour you spend looking up project data and communicating it is fairly compensated.',
  },
];

export const SolutionSection = () => {
  return (
    <section className="bg-background">
      {/* Main intro */}
      <div className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.p {...fadeIn()} className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-6">
            The solution
          </motion.p>
          <motion.h2 {...fadeIn(0.05)} className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-[1.12] mb-8 text-balance">
            We started OxiCloud to change that
          </motion.h2>
          <motion.p {...fadeIn(0.1)} className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
            For many project owners, the architecture firm is their only guiding advisor and main responsible partner. But right now, too much of their day is spent on unpaid administrative tasks rather than on controlling the project as it should be.
          </motion.p>
          <motion.p {...fadeIn(0.15)} className="text-muted-foreground text-base leading-relaxed mb-6">
            There is a need for a platform to keep architects, engineers, and firms actively engaged in the building permit cycle. They should decide how NOx reports are prepared and submitted — especially in a context where legislation is evolving, time is scarce, precision matters, and fast compliance is the priority.
          </motion.p>
          <motion.p {...fadeIn(0.2)} className="text-foreground font-medium text-lg">
            Free architects, engineers, surveyors — whoever has to deal with unrewarded effort and hidden workload. We see your pain.
          </motion.p>
        </div>
      </div>

      {/* Three pillars */}
      <div className="py-16 md:py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <motion.div
                key={i}
                {...fadeIn(i * 0.08)}
                className="bg-background rounded-2xl p-8 border border-border/30"
              >
                <pillar.icon className="w-8 h-8 text-foreground mb-5" />
                <h3 className="text-lg font-semibold text-foreground mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Personal note */}
      <div className="py-20 md:py-28 px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div {...fadeIn()} className="mb-6">
            <Heart className="w-8 h-8 text-primary mx-auto" />
          </motion.div>
          <motion.h3 {...fadeIn(0.05)} className="text-2xl md:text-3xl font-semibold text-foreground mb-6 text-balance">
            We know, because we were that architect.
          </motion.h3>
          <motion.p {...fadeIn(0.1)} className="text-muted-foreground text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            The unpaid hours, the unanswered follow-ups, the work that vanished into someone else's dossier. OxiCloud was built by someone who lived it — and refused to accept it as normal.
          </motion.p>
          <motion.p {...fadeIn(0.15)} className="text-foreground font-medium text-lg max-w-2xl mx-auto text-balance">
            With OxiCloud, architects and engineers can focus again on what truly matters: leading projects, making decisions, and delivering quality design — while staying fully in control of compliance.
          </motion.p>
        </div>
      </div>

      {/* Footnote */}
      <div className="px-6 pb-16">
        <div className="container mx-auto max-w-3xl">
          <motion.p {...fadeIn()} className="text-xs text-muted-foreground/50 leading-relaxed">
            * OxiCloud is developed and operated by A-Spine, the legal entity behind the platform. Clients are billed through A-Spine, while OxiCloud serves as the specialized NOx solution within its ecosystem.
          </motion.p>
        </div>
      </div>
    </section>
  );
};
