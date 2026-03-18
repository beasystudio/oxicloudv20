import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { SplitPhaseResult } from './splitPhaseEngine';
import { cn } from '@/lib/utils';

interface Props {
  calcResult: SplitPhaseResult;
  onContinue: () => void;
  onBack: () => void;
}

export function SPStap1Screen({ calcResult, onContinue, onBack }: Props) {
  const { t } = useLanguage();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const phase1Pct = (calcResult.R_phase1 * 100).toFixed(1);
  const phase2Pct = ((1 - calcResult.R_phase1) * 100).toFixed(1);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">
              {t('splitPhase.stap1Progress')}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">
              {t('splitPhase.stap1Title')}
            </h1>
            <p className="text-base text-muted-foreground">{t('splitPhase.stap1Desc')}</p>
          </div>

          {/* Progress bar */}
          <div className="bg-muted/30 rounded-xl border border-border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="h-3 rounded-full overflow-hidden bg-muted flex">
                  <motion.div
                    className="bg-primary h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${calcResult.R_phase1 * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="bg-secondary h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(1 - calcResult.R_phase1) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                <p className="text-sm text-muted-foreground">{t('splitPhase.phase1')}</p>
                <p className="text-3xl font-semibold text-primary tabular-nums mt-1">{phase1Pct}%</p>
                <p className="text-xs text-muted-foreground mt-1">{t('splitPhase.ofProjectScope')}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">{t('splitPhase.phase2')}</p>
                <p className="text-3xl font-semibold text-foreground tabular-nums mt-1">{phase2Pct}%</p>
                <p className="text-xs text-muted-foreground mt-1">{t('splitPhase.ofProjectScope')}</p>
              </div>
            </div>
          </div>

          {/* Calculation details */}
          <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('splitPhase.stap1ProjectEmission')}</p>
                <p className="text-xl font-semibold tabular-nums">18.2 kg NOₓ</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('splitPhase.stap1Threshold')}</p>
                <p className="text-xl font-semibold tabular-nums">12.5 kg NOₓ</p>
              </div>
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              <Row label={t('splitPhase.stap1ComplianceRatio')} value={`${(calcResult.R_compliance * 100).toFixed(1)}%`} />
              <Row label={t('splitPhase.stap1MinRatio')} value={`${(calcResult.R_min * 100).toFixed(1)}%`} />
              <Row label={t('splitPhase.stap1SafetyMargin')} value="97%" />
              <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                <span className="text-foreground font-medium">{t('splitPhase.stap1FinalRatio')}</span>
                <span className="font-semibold text-primary tabular-nums">{phase1Pct}%</span>
              </div>
            </div>
          </div>

          {/* Collapsible per-type ratios */}
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-between rounded-xl border border-border px-4 py-3 bg-muted/20">
              <span>{t('splitPhase.stap1CollapsibleLabel')}</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', detailsOpen && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 rounded-xl border border-border bg-muted/20 p-4 space-y-2">
              {calcResult.perTypeRatios.map((r) => {
                const isBinding = r.id === calcResult.bindingEmissionType;
                return (
                  <div
                    key={r.id}
                    className={cn(
                      'flex items-center justify-between text-sm py-2 px-3 rounded-lg',
                      isBinding && 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{t(`splitPhase.emissionTypes.${r.id}`)}</span>
                      {isBinding && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">
                          {t('splitPhase.stap1BindingLabel')}
                        </span>
                      )}
                    </div>
                    <span className="font-medium tabular-nums">{(r.R_compliance * 100).toFixed(1)}%</span>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={onContinue} className="flex-1 h-12 rounded-xl text-base font-medium">
              {t('splitPhase.stap1CtaPrimary')}
            </Button>
            <Button variant="outline" onClick={onBack} className="rounded-xl h-12">
              {t('splitPhase.stap1CtaBack')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
