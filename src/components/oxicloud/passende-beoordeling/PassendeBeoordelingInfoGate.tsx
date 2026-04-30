import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

interface PassendeBeoordelingInfoGateProps {
  onProceed: () => void;
  onBack: () => void;
}

export function PassendeBeoordelingInfoGate({
  onProceed,
  onBack,
}: PassendeBeoordelingInfoGateProps) {
  const { t } = useLanguage();

  const facts = [
    { label: t('pbGate.whatLabel'), value: t('pbGate.whatValue') },
    { label: t('pbGate.whoLabel'), value: t('pbGate.whoValue') },
    { label: t('pbGate.turnaroundLabel'), value: t('pbGate.turnaroundValue') },
    { label: t('pbGate.pricingLabel'), value: t('pbGate.pricingValue') },
  ];

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background px-4 md:px-10 py-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-3xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            {t('pbGate.eyebrow')}
          </span>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground leading-tight">
            {t('pbGate.title')}
          </h1>
          <p className="text-[13px] text-muted-foreground leading-relaxed max-w-prose">
            {t('pbGate.subtitle')}
          </p>
        </div>

        {/* Facts card with sectioned header */}
        <section className="border border-border rounded-xl bg-card">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t('pbGate.eyebrow')}
            </h2>
            <span className="text-[10px] tabular-nums text-muted-foreground">{facts.length} items</span>
          </div>
          <ul className="divide-y divide-border">
            {facts.map((fact) => (
              <li
                key={fact.label}
                className="grid grid-cols-1 sm:grid-cols-[170px_1fr] gap-1 sm:gap-5 px-4 py-3"
              >
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground sm:pt-0.5">
                  {fact.label}
                </p>
                <p className="text-[13px] text-foreground leading-relaxed">{fact.value}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Note */}
        <div className="border-l-2 border-foreground/40 pl-4">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {t('pbGate.note')}
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
          >
            {t('sandbox.back')}
          </Button>
          <Button
            onClick={onProceed}
            className="h-9 rounded-full text-sm px-5"
          >
            {t('pbGate.proceed')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
