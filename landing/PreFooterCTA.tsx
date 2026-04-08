import { motion } from 'framer-motion';
import { AdvancedCTAButton, CTAButton } from './AdvancedCTAButton';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 40 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

interface PreFooterCTAProps {
  headline: React.ReactNode;
  subtitle: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel: string;
  secondaryTo: string;
  disclaimer?: string;
}

export const PreFooterCTA = ({
  headline,
  subtitle,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
  disclaimer,
}: PreFooterCTAProps) => {
  return (
    <section className="py-24 md:py-32 px-6 bg-background">
      <div className="container mx-auto max-w-3xl text-center">
        <motion.h2 {...fadeIn(0)} className="heading-lg text-foreground mb-8 text-balance">
          {headline}
        </motion.h2>
        <motion.p {...fadeIn(0.1)} className="text-muted-foreground text-base mb-12 max-w-2xl mx-auto text-balance">
          {subtitle}
        </motion.p>
        <motion.div {...fadeIn(0.2)} className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <AdvancedCTAButton to={primaryTo} variant="green" size="lg">{primaryLabel}</AdvancedCTAButton>
          <CTAButton to={secondaryTo} variant="ghost" size="lg">{secondaryLabel}</CTAButton>
        </motion.div>
        {disclaimer && (
          <motion.p {...fadeIn(0.3)} className="text-xs text-muted-foreground/50">
            {disclaimer}
          </motion.p>
        )}
      </div>
    </section>
  );
};
