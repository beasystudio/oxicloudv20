import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight } from 'lucide-react';

interface SplitPhaseIntroScreenProps {
  projectEmission: number;
  threshold: number;
  onContinue: () => void;
  onBack: () => void;
}

export function SplitPhaseIntroScreen({
  projectEmission,
  threshold,
  onContinue,
  onBack,
}: SplitPhaseIntroScreenProps) {
  const { t } = useLanguage();
  const excessPercent = ((projectEmission / threshold) * 100 - 100).toFixed(0);

  const steps = [
    t('splitPhase.step1'),
    t('splitPhase.step2'),
    t('splitPhase.step3'),
    t('splitPhase.step4'),
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
            {t('splitPhase.optimizationAvailable')}
          </span>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground leading-tight">
            {t('splitPhase.simulationTitle')}
          </h1>
          <p className="text-[13px] text-muted-foreground leading-relaxed max-w-prose">
            {t('splitPhase.introDesc').replace('{percent}', excessPercent)}
          </p>
        </div>

        {/* Overage chip */}
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {t('splitPhase.projectEmission')}
          </span>
          <span className="text-[11px] font-semibold text-foreground tabular-nums">
            {projectEmission.toFixed(1)} / {threshold.toFixed(1)} kg NOₓ
          </span>
          <span className="text-[10px] font-semibold text-foreground bg-foreground/10 rounded px-1.5 py-0.5 tabular-nums">
            +{excessPercent}%
          </span>
        </div>

        {/* How it works */}
        <section className="border border-border rounded-xl bg-card">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t('splitPhase.howItWorks')}
            </h2>
            <span className="text-[10px] tabular-nums text-muted-foreground">4 steps</span>
          </div>
          <ol className="divide-y divide-border">
            {steps.map((text, i) => (
              <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                <span className="text-[10px] tabular-nums text-muted-foreground/70 font-medium w-5 mt-[3px] shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[13px] text-foreground leading-relaxed">{text}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Phase outcome cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border rounded-xl px-4 py-3.5 bg-card space-y-1.5">
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
              {t('splitPhase.phase1')}
            </p>
            <p className="text-sm font-medium text-foreground">{t('splitPhase.phase1Compliant')}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t('splitPhase.phase1PermitReady')}
            </p>
          </div>
          <div className="border border-border rounded-xl px-4 py-3.5 bg-card space-y-1.5">
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
              {t('splitPhase.phase2')}
            </p>
            <p className="text-sm font-medium text-foreground">{t('splitPhase.phase2Future')}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t('splitPhase.phase2SeparateAssessment')}
            </p>
          </div>
        </div>

        {/* Important note */}
        <div className="border-l-2 border-foreground/40 pl-4">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">{t('splitPhase.importantNote')}</span>{' '}
            {t('splitPhase.importantDesc')}
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
            onClick={onContinue}
            className="h-9 rounded-full text-xs px-4 gap-1.5"
          >
            {t('splitPhase.generateSimulation')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
