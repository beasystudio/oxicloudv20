import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PhaseProject } from '@/types/splitPhase';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitPhaseConfirmationScreenProps {
  phase1: PhaseProject;
  phase2: PhaseProject;
  onConfirm: () => void;
  onBack: () => void;
}

function StepHeader({ step, total, eyebrow, title, description }: {
  step: number; total: number; eyebrow: string; title: string; description: string;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
        <span className="tabular-nums text-foreground/80">
          {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <span className="h-px w-6 bg-border" />
        <span>{eyebrow}</span>
      </div>
      <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground leading-tight">{title}</h1>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-prose">{description}</p>
    </div>
  );
}

export function SplitPhaseConfirmationScreen({ phase1, phase2, onConfirm, onBack }: SplitPhaseConfirmationScreenProps) {
  const { t } = useLanguage();
  const [confirmations, setConfirmations] = useState({
    independentPhases: false,
    separatePermits: false,
    validStructure: false,
  });
  const allConfirmed = Object.values(confirmations).every(Boolean);
  const handleCheckChange = (key: keyof typeof confirmations) =>
    setConfirmations((prev) => ({ ...prev, [key]: !prev[key] }));

  const declarations: { key: keyof typeof confirmations; text: string }[] = [
    { key: 'independentPhases', text: t('splitPhase.confirmIndependent') },
    { key: 'separatePermits', text: t('splitPhase.confirmPermits') },
    { key: 'validStructure', text: t('splitPhase.confirmValid') },
  ];

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background px-4 md:px-10 py-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-3xl mx-auto space-y-8"
      >
        <StepHeader
          step={4}
          total={4}
          eyebrow="Architect confirmation"
          title={t('splitPhase.architectConfirmation')}
          description={t('splitPhase.confirmDesc')}
        />

        {/* Summary */}
        <section className="border border-border rounded-xl bg-card">
          <div className="px-4 py-2.5 border-b border-border">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t('splitPhase.phaseSplitSummary')}
            </h2>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="px-4 py-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t('splitPhase.phase1')}
              </p>
              <p className="text-lg font-semibold tabular-nums text-foreground leading-none">
                {phase1.footprintArea.toLocaleString()} m²
              </p>
              <p className="text-[11px] text-foreground/80">{t('splitPhase.compliantReadyForPermit')}</p>
            </div>
            <div className="px-4 py-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t('splitPhase.phase2')}
              </p>
              <p className="text-lg font-semibold tabular-nums text-muted-foreground leading-none">
                {phase2.footprintArea.toLocaleString()} m²
              </p>
              <p className="text-[11px] text-muted-foreground">{t('splitPhase.futurePhase')}</p>
            </div>
          </div>
        </section>

        {/* Legal declarations */}
        <section className="border border-border rounded-xl bg-card">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t('splitPhase.legalConfirmations')}
            </h2>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {Object.values(confirmations).filter(Boolean).length} / 3
            </span>
          </div>
          <ul className="divide-y divide-border">
            {declarations.map((d, i) => {
              const checked = confirmations[d.key];
              return (
                <li key={d.key}>
                  <label
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                      checked ? 'bg-foreground/[0.03]' : 'hover:bg-muted/30',
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => handleCheckChange(d.key)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Declaration {String(i + 1).padStart(2, '0')}
                      </p>
                      <p className="text-[12px] text-foreground leading-relaxed">{d.text}</p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Report label note */}
        <div className="border-l-2 border-foreground/40 pl-4">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">{t('splitPhase.reportLabel')}</span>{' '}
            {t('splitPhase.reportLabelDesc')}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
          >
            {t('sandbox.back')}
          </Button>
          <div className="flex items-center gap-3">
            {!allConfirmed && (
              <span className="text-[11px] text-muted-foreground">
                {t('splitPhase.confirmAllToGenerate')}
              </span>
            )}
            <Button
              onClick={onConfirm}
              disabled={!allConfirmed}
              className="h-9 rounded-full text-xs px-4 gap-1.5"
            >
              {t('splitPhase.generatePhaseReports')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
