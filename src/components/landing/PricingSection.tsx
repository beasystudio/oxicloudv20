import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const architectFeatures = [
  'Unlimited projects',
  'No subscription fees',
  'No seat costs, unlimited team members',
  'Multi-organization support',
  'Nitrogen reports ready for the Omgevingsloket',
  'Free lifetime access to our Partner Program',
];

const govFeatures = [
  'Unlimited project reviews',
  'One clear pricing plan, no complexity',
  'No seat costs, unlimited users per organization',
  'Instant review insights powered by AI',
  'Faster decision-making, less manual work',
];

export const PricingSection = () => {
  return (
    <section className="py-24 md:py-32 px-6 bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div {...fadeIn()} className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-4">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-balance">
            Simple, transparent pricing
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Architects Plan */}
          <motion.div
            {...fadeIn(0.05)}
            className="relative bg-secondary rounded-2xl p-8 md:p-10 flex flex-col"
          >
            <p className="text-xs uppercase tracking-widest text-secondary-foreground/60 mb-2">
              For Architects, Engineers & Surveyors
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl md:text-5xl font-semibold text-primary">Free</span>
            </div>
            <p className="text-secondary-foreground/60 text-sm mb-1">Paid per report by end clients</p>
            <p className="text-secondary-foreground/50 text-xs mb-8">
              Full access to OxiCloud with no subscriptions, no seat costs, no barriers. You only work; we handle the rest.
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {architectFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-secondary-foreground/80 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:shadow-[0_4px_20px_-4px_hsl(85_100%_62%/0.5)] transition-shadow"
            >
              Join the Free Partner Program
            </Link>
          </motion.div>

          {/* Government Plan */}
          <motion.div
            {...fadeIn(0.1)}
            className="bg-muted/50 rounded-2xl p-8 md:p-10 flex flex-col border border-border/30"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-2">
              For Government & Municipalities
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl md:text-5xl font-semibold text-foreground">€55</span>
              <span className="text-muted-foreground text-sm">/ month</span>
            </div>
            <p className="text-muted-foreground/70 text-xs mb-8">
              or €550 / year (save 17%). Full platform access for your entire organization.
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {govFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/government-register"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-full border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Request access
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
