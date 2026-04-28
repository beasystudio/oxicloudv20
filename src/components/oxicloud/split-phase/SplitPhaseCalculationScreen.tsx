import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SplitPhaseCalculation, EmissionSourceCode } from '@/types/splitPhase';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { ArrowRight, AlertTriangle } from 'lucide-react';

interface SplitPhaseCalculationScreenProps {
  calculation: SplitPhaseCalculation;
  onContinue: () => void;
  onBack: () => void;
}

const SOURCE_LABEL: Record<EmissionSourceCode, string> = {
  cp_ps:    'Construction · Point source',
  cp_ls_lv: 'Construction · Light traffic',
  cp_ls_hv: 'Construction · Heavy traffic',
  op_ps:    'Operation · Point source',
  op_ls_lv: 'Operation · Light traffic',
  op_ls_hv: 'Operation · Heavy traffic',
};

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
      <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground leading-tight">
        {title}
      </h1>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-prose">{description}</p>
    </div>
  );
}

export function SplitPhaseCalculationScreen({ calculation, onContinue, onBack }: SplitPhaseCalculationScreenProps) {
  const { t } = useLanguage();
  const phase1Pct = calculation.finalRatio * 100;
  const phase2Pct = (1 - calculation.finalRatio) * 100;
  const safetyMarginPct = (calculation.safetyMarginApplied ?? 0.97) * 100;
  const minRatioFloorActive = calculation.finalRatio <= calculation.minimumRatio + 1e-6;

  // Feasibility check (Spec §2.5)
  const feasible = calculation.finalRatio >= calculation.minimumRatio - 1e-6;

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background px-4 md:px-10 py-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-3xl mx-auto space-y-8"
      >
        <StepHeader
          step={1}
          total={4}
          eyebrow="Ratio review"
          title={t('splitPhase.optimalSplitCalculated')}
          description={t('splitPhase.calcDesc')}
        />

        {/* Feasibility banner */}
        {!feasible && (
          <div className="border border-border rounded-xl px-4 py-3 flex items-start gap-3 bg-card">
            <AlertTriangle className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-[12px] font-medium text-foreground">Split-phase not feasible</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The binding source exceeds the 1.43× ceiling. Path 3 (Appropriate Assessment) is required.
              </p>
            </div>
          </div>
        )}

        {/* Phase split visualisation */}
        <section className="border border-border rounded-xl bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              R_phase1 · final ratio
            </p>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              MIN over all sources × {safetyMarginPct.toFixed(0)}%
            </span>
          </div>

          {/* Bar */}
          <div className="space-y-1.5">
            <div className="relative h-2 rounded-full bg-muted overflow-hidden flex">
              <motion.div
                className="h-full bg-foreground"
                initial={{ width: 0 }}
                animate={{ width: `${phase1Pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              <motion.div
                className="h-full bg-muted-foreground/30"
                initial={{ width: 0 }}
                animate={{ width: `${phase2Pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t('splitPhase.phase1')}
              </p>
              <p className="text-2xl font-semibold text-foreground tabular-nums leading-none">
                {phase1Pct.toFixed(0)}%
              </p>
              <p className="text-[11px] text-muted-foreground">{t('splitPhase.ofProjectScope')}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t('splitPhase.phase2')}
              </p>
              <p className="text-2xl font-semibold text-muted-foreground tabular-nums leading-none">
                {phase2Pct.toFixed(0)}%
              </p>
              <p className="text-[11px] text-muted-foreground">{t('splitPhase.ofProjectScope')}</p>
            </div>
          </div>
        </section>

        {/* Per-source breakdown */}
        <section className="border border-border rounded-xl bg-card">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Per-source compliance ratios
            </h2>
            <span className="text-[10px] tabular-nums text-muted-foreground">6 sources</span>
          </div>
          <ul className="divide-y divide-border">
            {(Object.entries(calculation.perSourceRatios) as [EmissionSourceCode, number | null][]).map(([code, ratio]) => {
              const isBinding = code === calculation.bindingEmissionType;
              const excluded = ratio === null;
              const pct = excluded ? 0 : (ratio as number) * 100;
              return (
                <li
                  key={code}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-[12px]',
                    isBinding && !excluded && 'bg-foreground/[0.04]',
                  )}
                >
                  <span className="font-mono text-[10px] text-muted-foreground/80 w-16 shrink-0">{code}</span>
                  <span className={cn('flex-1 truncate', excluded ? 'text-muted-foreground' : 'text-foreground')}>
                    {SOURCE_LABEL[code]}
                  </span>
                  {/* mini bar */}
                  <div className="hidden sm:block w-24 h-1 rounded-full bg-muted overflow-hidden shrink-0">
                    {!excluded && (
                      <div
                        className={cn('h-full rounded-full', isBinding ? 'bg-foreground' : 'bg-muted-foreground/40')}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums w-14 text-right shrink-0">
                    {excluded ? '—' : `${pct.toFixed(1)}%`}
                  </span>
                  {isBinding && !excluded && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-foreground bg-foreground/10 rounded px-1.5 py-0.5 shrink-0">
                      Binding
                    </span>
                  )}
                  {excluded && (
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
                      excl.
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Calculation details */}
        <section className="border border-border rounded-xl bg-card">
          <div className="px-4 py-2.5 border-b border-border">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t('splitPhase.calculationDetails')}
            </h2>
          </div>
          <dl className="divide-y divide-border">
            <Row label={t('splitPhase.projectEmission')} value={`${calculation.projectEmission.toFixed(1)} kg NOₓ`} />
            <Row label={t('splitPhase.legalThreshold')} value={`${calculation.threshold.toFixed(1)} kg NOₓ`} />
            <Row label={t('splitPhase.complianceRatio')} value={`${(calculation.complianceRatio * 100).toFixed(1)}%`} />
            <Row
              label={`${t('splitPhase.minUtilizationRatio')} · 70% floor`}
              value={`${(calculation.minimumRatio * 100).toFixed(1)}%${minRatioFloorActive ? ' · active' : ''}`}
              emphasis={minRatioFloorActive}
            />
            <Row label={t('splitPhase.safetyMargin')} value={`${safetyMarginPct.toFixed(0)}%`} />
            <Row label="R_candidate (compliance × margin)" value={`${(calculation.candidateRatio * 100).toFixed(1)}%`} />
            <Row label={t('splitPhase.finalPhase1Ratio')} value={`${phase1Pct.toFixed(1)}%`} strong />
          </dl>
        </section>

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
          <Button
            onClick={onContinue}
            disabled={!feasible}
            className="h-9 rounded-full text-xs px-4 gap-1.5"
          >
            {t('splitPhase.definePhase1Footprint')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, strong, emphasis }: { label: string; value: string; strong?: boolean; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <dt className="text-[12px] text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'text-[12px] tabular-nums',
          strong ? 'font-semibold text-foreground' : 'font-medium text-foreground',
          emphasis && 'text-foreground',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
