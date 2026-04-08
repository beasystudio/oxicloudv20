import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SplitPhaseCalculation } from '@/types/splitPhase';
import { useLanguage } from '@/i18n/LanguageContext';

interface SplitPhaseCalculationScreenProps { calculation: SplitPhaseCalculation; onContinue: () => void; onBack: () => void; }

export function SplitPhaseCalculationScreen({ calculation, onContinue, onBack }: SplitPhaseCalculationScreenProps) {
  const { t } = useLanguage();
  const phase1Percent = (calculation.finalRatio * 100).toFixed(0);
  const phase2Percent = ((1 - calculation.finalRatio) * 100).toFixed(0);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">{t('splitPhase.stepXofY').replace('{x}', '1').replace('{y}', '4')}</span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">{t('splitPhase.optimalSplitCalculated')}</h1>
            <p className="text-base text-muted-foreground">{t('splitPhase.calcDesc')}</p>
          </div>
          <div className="bg-muted/30 rounded-xl border border-border p-6">
            <div className="flex items-center gap-4 mb-6"><div className="flex-1"><div className="h-3 rounded-full overflow-hidden bg-muted flex"><motion.div className="bg-primary h-full" initial={{ width: 0 }} animate={{ width: `${calculation.finalRatio * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }} /><motion.div className="bg-secondary h-full" initial={{ width: 0 }} animate={{ width: `${(1 - calculation.finalRatio) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} /></div></div></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30"><p className="text-sm text-muted-foreground">{t('splitPhase.phase1')}</p><p className="text-3xl font-semibold text-primary tabular-nums mt-1">{phase1Percent}%</p><p className="text-xs text-muted-foreground mt-1">{t('splitPhase.ofProjectScope')}</p></div>
              <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/30"><p className="text-sm text-muted-foreground">{t('splitPhase.phase2')}</p><p className="text-3xl font-semibold text-foreground tabular-nums mt-1">{phase2Percent}%</p><p className="text-xs text-muted-foreground mt-1">{t('splitPhase.ofProjectScope')}</p></div>
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-5">
            <h2 className="text-lg font-medium text-foreground">{t('splitPhase.calculationDetails')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><p className="text-xs text-muted-foreground uppercase tracking-wide">{t('splitPhase.projectEmission')}</p><p className="text-xl font-semibold tabular-nums">{calculation.projectEmission.toFixed(1)} kg NOₓ</p></div>
              <div className="space-y-1"><p className="text-xs text-muted-foreground uppercase tracking-wide">{t('splitPhase.legalThreshold')}</p><p className="text-xl font-semibold tabular-nums">{calculation.threshold.toFixed(1)} kg NOₓ</p></div>
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.complianceRatio')}</span><span className="font-medium tabular-nums">{(calculation.complianceRatio * 100).toFixed(1)}%</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.minUtilizationRatio')}</span><span className="font-medium tabular-nums">{(calculation.minimumRatio * 100).toFixed(1)}%</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.safetyMargin')}</span><span className="font-medium tabular-nums">97%</span></div>
              <div className="flex items-center justify-between text-sm border-t border-border pt-3"><span className="text-foreground font-medium">{t('splitPhase.finalPhase1Ratio')}</span><span className="font-semibold text-primary tabular-nums">{(calculation.finalRatio * 100).toFixed(1)}%</span></div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={onContinue} className="flex-1 h-12 rounded-xl text-base font-medium">{t('splitPhase.definePhase1Footprint')}</Button>
            <Button variant="outline" onClick={onBack} className="rounded-xl h-12">{t('sandbox.back')}</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
