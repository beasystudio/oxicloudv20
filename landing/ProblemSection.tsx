import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Clock, FileText, ArrowDownRight, AlertTriangle } from 'lucide-react';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const unpaidTasks = [
  'Extracting surface areas, volumes, and functions from drawings',
  'Reformatting project data to match agency templates',
  'Sending updated plans in different formats (PDF, DWG, Excel summaries)',
  'Writing technical descriptions of the project for third parties',
  'Collecting missing data requested by environmental consultants',
  'Re-checking inconsistencies between drawings and reports',
  'Answering follow-up questions from agencies and municipalities',
  'Explaining the same project multiple times to different stakeholders',
  'Updating documents after small design changes',
  'Coordinating back-and-forth between the client, the consultant, and the authority',
];

export const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="problem" className="bg-background" ref={ref}>
      {/* Core Narrative */}
      <div className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.p {...fadeIn()} className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-6">
            The problem
          </motion.p>
          <motion.h2 {...fadeIn(0.05)} className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-[1.12] mb-8 text-balance">
            Every building permit in Flanders within 20 km of a Natura 2000 area now requires a full nitrogen impact assessment.
          </motion.h2>
          <motion.p {...fadeIn(0.1)} className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
            The Nitrogen Decree, PAS regulations, and VITO guidelines are essentially legislation written by scientists — for scientists.
          </motion.p>
          <motion.p {...fadeIn(0.15)} className="text-muted-foreground text-base leading-relaxed mb-6">
            Clients and developers assume architects handle everything from A to Z. This includes all indirect tasks related to the project dossier, particularly the building permit process. They take it for granted.
          </motion.p>
          <motion.p {...fadeIn(0.2)} className="text-muted-foreground text-base leading-relaxed">
            Architects operate in a grey zone between creative design responsibilities and administrative support for building permit applications. They are expected to provide continuous follow-up and support — but this work is unpaid.
          </motion.p>
        </div>
      </div>

      {/* The Unpaid Tasks */}
      <div className="py-20 md:py-28 px-6 bg-secondary">
        <div className="container mx-auto max-w-4xl">
          <motion.h3 {...fadeIn()} className="text-2xl md:text-3xl font-semibold text-secondary-foreground mb-3">
            The unpaid tasks
          </motion.h3>
          <motion.p {...fadeIn(0.05)} className="text-secondary-foreground/60 mb-12 text-lg">
            Week after week, you are:
          </motion.p>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {unpaidTasks.map((task, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-3 py-3 border-b border-secondary-foreground/10"
              >
                <ArrowDownRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-secondary-foreground/80 text-sm leading-relaxed">{task}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Make the time visible */}
      <div className="py-20 md:py-28 px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.p {...fadeIn()} className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-8">
            Make the time visible
          </motion.p>
          <motion.p {...fadeIn(0.05)} className="text-muted-foreground text-lg mb-12">
            This is not occasional.
          </motion.p>

          <div className="grid sm:grid-cols-2 gap-8 mb-16">
            <motion.div {...fadeIn(0.1)} className="bg-muted/50 rounded-2xl p-8 text-center">
              <Clock className="w-8 h-8 text-foreground mx-auto mb-4" />
              <p className="text-4xl md:text-5xl font-semibold text-foreground mb-2">~10h</p>
              <p className="text-muted-foreground text-sm">per week per project</p>
            </motion.div>
            <motion.div {...fadeIn(0.15)} className="bg-muted/50 rounded-2xl p-8 text-center">
              <FileText className="w-8 h-8 text-foreground mx-auto mb-4" />
              <p className="text-4xl md:text-5xl font-semibold text-foreground mb-2">Months</p>
              <p className="text-muted-foreground text-sm">during the permit phase</p>
            </motion.div>
          </div>

          <motion.div {...fadeIn(0.2)} className="space-y-2 text-muted-foreground text-base">
            <p>None of it is clearly defined.</p>
            <p>None of it is explicitly billed.</p>
          </motion.div>
        </div>
      </div>

      {/* Where the problem really is */}
      <div className="py-16 md:py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <motion.h3 {...fadeIn()} className="text-2xl md:text-3xl font-semibold text-foreground mb-8 text-balance">
            Where the problem really is
          </motion.h3>
          <motion.div {...fadeIn(0.05)} className="space-y-3 text-muted-foreground text-base leading-relaxed mb-12">
            <p>This work sits in a gap:</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {['Not design', 'Not an official consultancy', 'Not part of a defined deliverable'].map((item, i) => (
              <motion.div
                key={i}
                {...fadeIn(0.1 + i * 0.05)}
                className="bg-background rounded-2xl p-6 text-center border border-border/30"
              >
                <p className="text-foreground font-medium">{item}</p>
              </motion.div>
            ))}
          </div>
          <motion.p {...fadeIn(0.25)} className="text-foreground font-semibold text-lg text-center">
            But you are still expected to do it — completely.
          </motion.p>
        </div>
      </div>

      {/* Expectation Mismatch */}
      <div className="py-16 md:py-24 px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeIn()} className="bg-muted/50 rounded-2xl p-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-4">The client assumes</p>
              <p className="text-xl font-semibold text-foreground leading-snug">
                "The architect handles the permit."
              </p>
            </motion.div>
            <motion.div {...fadeIn(0.1)} className="bg-secondary rounded-2xl p-8">
              <p className="text-xs uppercase tracking-widest text-secondary-foreground/60 mb-4">In reality, that means</p>
              <p className="text-xl font-semibold text-secondary-foreground leading-snug">
                You act as the data provider, coordinator, and responder for every external party involved.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Escalation */}
      <div className="py-16 md:py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <motion.h3 {...fadeIn()} className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
            How it gets worse
          </motion.h3>
          <motion.p {...fadeIn(0.05)} className="text-muted-foreground text-base mb-8">
            Every additional question from a municipality or agency creates more work:
          </motion.p>
          <div className="flex flex-wrap gap-3 mb-12">
            {['More data extraction', 'More document updates', 'More explanations', 'More coordination'].map((item, i) => (
              <motion.span
                key={i}
                {...fadeIn(0.1 + i * 0.05)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border/40 text-sm text-foreground"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                {item}
              </motion.span>
            ))}
          </div>
          <motion.p {...fadeIn(0.3)} className="text-muted-foreground text-base italic">
            The process does not stabilize. It expands.
          </motion.p>
        </div>
      </div>

      {/* Closing Punch */}
      <div className="py-20 md:py-28 px-6 bg-secondary">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.h3
            {...fadeIn()}
            className="text-3xl md:text-4xl lg:text-5xl font-semibold text-secondary-foreground leading-[1.1] text-balance"
          >
            You are losing time to unpaid administrative production work.
          </motion.h3>
        </div>
      </div>
    </section>
  );
};
