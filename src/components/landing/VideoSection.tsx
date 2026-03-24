import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export const VideoSection = () => {
  return (
    <section id="video-section" className="py-24 md:py-32 px-6 bg-muted/30">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-4"
        >
          A quick tour
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-4xl font-semibold text-foreground mb-12 text-balance"
        >
          See how OxiCloud works
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-video w-full rounded-2xl bg-secondary overflow-hidden group cursor-pointer"
        >
          {/* Placeholder for video */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300">
              <Play className="w-8 h-8 text-primary ml-1" />
            </div>
            <p className="text-secondary-foreground/60 text-sm">
              2D animation walkthrough — coming soon
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent" />
        </motion.div>
      </div>
    </section>
  );
};
