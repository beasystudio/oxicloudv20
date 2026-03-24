import { motion } from 'framer-motion';
import { Zap, FileCheck, Rocket, RefreshCw, FolderOpen, Bell, LayoutDashboard, Archive } from 'lucide-react';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 24 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-60px' as const },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const features = [
  {
    number: '01',
    icon: Zap,
    title: 'Architect-first UX interface',
    hook: 'This work should not exist in the first place.',
    description: 'Enter your project data in less than three minutes with our streamlined flows. OxiCloud takes the nitrogen assessment off your plate entirely.',
  },
  {
    number: '02',
    icon: FileCheck,
    title: 'Submission-ready reports',
    hook: 'Even when you do the work, it is not accepted.',
    description: 'OxiCloud structures every report exactly the way Omgevingsloket expects. Clear, complete, and ready once and for all.',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'End-to-end report generation',
    hook: 'From project data to submitted report, in one sitting.',
    description: 'Enter your project details, review the output, and upload. What used to take weeks now fits into a single afternoon.',
  },
  {
    number: '04',
    icon: RefreshCw,
    title: 'Always up-to-date compliance',
    hook: 'The legislation changed again. You found out too late.',
    description: 'OxiCloud automatically applies the latest legislation and methodologies. Every report reflects the law as it stands today.',
  },
  {
    number: '05',
    icon: FolderOpen,
    title: 'Project Binder module',
    hook: 'Nobody knows where anything is. You are the one who gets asked.',
    description: 'All dossiers, documents, and stakeholders in one place. Structured, searchable, and visible to your entire team.',
  },
  {
    number: '06',
    icon: Bell,
    title: 'Automated stakeholder updates',
    hook: 'Three people needed an update. You sent three separate emails.',
    description: 'Notify everyone connected to a dossier in one action. No copy-pasting. No missed communication.',
  },
  {
    number: '07',
    icon: LayoutDashboard,
    title: 'Portfolio Dashboard',
    hook: 'You are managing twenty projects in your head.',
    description: 'See all projects at a glance. Status, progress, and what needs attention. Nothing slips through the cracks.',
  },
  {
    number: '08',
    icon: Archive,
    title: 'Searchable Project Archive',
    hook: 'They came back six months later. You had to find everything again.',
    description: 'Every report your firm has ever generated — stored and instantly retrievable. The answer is always there.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div {...fadeIn()} className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-4">Features</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4 text-balance">
            The AI-driven tool that gives architects back their time.
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Every task is recorded. Every effort accounted for.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.05)}
              className="group bg-muted/30 hover:bg-muted/60 rounded-2xl p-8 transition-colors duration-300 border border-border/20 hover:border-border/40"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-background border border-border/40 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
                  <feature.icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-muted-foreground/50">{feature.number}</span>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                </div>
              </div>
              <p className="text-foreground/80 text-sm font-medium mb-2 italic">
                {feature.hook}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
