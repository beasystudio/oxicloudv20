import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { calculateConstructionTraffic } from '@/types/sandbox';
import { CalculationResults } from '@/types/oxicloud';
import { useLanguage } from '@/i18n/LanguageContext';

interface BouwfaseLijnbronnenSandboxProps { onComplete: () => void; onBack: () => void; results?: CalculationResults; }

export function BouwfaseLijnbronnenSandbox({ onComplete, onBack, results }: BouwfaseLijnbronnenSandboxProps) {
  const { t } = useLanguage();
  const gfa = 5000; const constructionDuration = 120; const prefabLevel = 30;
  const [baseLV, setBaseLV] = useState(50); const [baseHV, setBaseHV] = useState(8);
  const defaultLV = 50; const defaultHV = 8;
  const allowedLVMovements = 25000; const allowedHVMovements = 4000; const allowedTotal = allowedLVMovements + allowedHVMovements;
  const traffic = useMemo(() => calculateConstructionTraffic(gfa, constructionDuration, prefabLevel, baseLV, baseHV), [baseLV, baseHV]);
  const totalProjectMovements = traffic.totalLV + traffic.totalHV;
  const lvRemaining = Math.max(0, traffic.totalLV - allowedLVMovements);
  const hvRemaining = Math.max(0, traffic.totalHV - allowedHVMovements);
  const totalRemaining = Math.max(0, totalProjectMovements - allowedTotal);
  const isCompliant = totalProjectMovements <= allowedTotal;
  const progressPercent = Math.min(100, (allowedTotal / totalProjectMovements) * 100);
  const handleReset = () => { setBaseLV(defaultLV); setBaseHV(defaultHV); };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('sandbox.adjustTrafficParams')}</h1>
          <p className="text-base text-muted-foreground mt-1">{t('sandbox.constructionTrafficDesc')}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">{t('sandbox.basedOnStandard')}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-5">
            <div className="mb-2"><h2 className="font-semibold text-foreground">{t('sandbox.trafficGenerationRates')}</h2><p className="text-sm text-muted-foreground">{t('sandbox.ratesExpressed')}</p></div>
            <div className="bg-muted/30 rounded-xl border border-border p-5">
              <h3 className="font-medium text-foreground mb-4">{t('sandbox.lightVehicles')}</h3>
              <div className="space-y-4">
                <div><Label className="text-sm text-muted-foreground">{t('sandbox.baseBenchmarkLV')}</Label><div className="flex items-center gap-3 mt-2"><Input type="number" value={baseLV} onChange={(e) => setBaseLV(Number(e.target.value))} min={0} className="w-24 text-lg font-semibold" /><span className="text-sm text-muted-foreground">{t('sandbox.tripsPerUnit')}</span></div></div>
                <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('sandbox.gfa')}:</span><span className="font-medium">{gfa.toLocaleString()} m²</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('sandbox.constructionDuration')}:</span><span className="font-medium">{constructionDuration} {t('sandbox.days')}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t('sandbox.prefabLevelLabel')}:</span><span className="font-medium">{prefabLevel}%</span></div>
                </div>
                <div className="border-t border-border/30 pt-4 space-y-2">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('sandbox.calculatedLVTripsPerDay')}:</span><span className="font-semibold tabular-nums">{traffic.lvTripsPerDay.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('sandbox.totalLVMovements')}:</span><motion.span key={traffic.totalLV} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-bold text-lg tabular-nums">{traffic.totalLV.toLocaleString()}</motion.span></div>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl border border-border p-5">
              <h3 className="font-medium text-foreground mb-4">{t('sandbox.heavyVehicles')}</h3>
              <div className="space-y-4">
                <div><Label className="text-sm text-muted-foreground">{t('sandbox.baseBenchmarkHV')}</Label><div className="flex items-center gap-3 mt-2"><Input type="number" value={baseHV} onChange={(e) => setBaseHV(Number(e.target.value))} min={0} className="w-24 text-lg font-semibold" /><span className="text-sm text-muted-foreground">{t('sandbox.tripsPerUnit')}</span></div></div>
                <div className="border-t border-border/30 pt-4 space-y-2">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('sandbox.calculatedHVTripsPerDay')}:</span><span className="font-semibold tabular-nums">{traffic.hvTripsPerDay.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('sandbox.totalHVMovements')}:</span><motion.span key={traffic.totalHV} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-bold text-lg tabular-nums">{traffic.totalHV.toLocaleString()}</motion.span></div>
                </div>
              </div>
            </div>
            <div className="bg-secondary/20 rounded-xl p-5 space-y-3">
              <h4 className="font-medium text-foreground text-sm">{t('sandbox.calculationIncludes')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1"><li>• {t('sandbox.constructionTrafficDuring')}</li><li>• {t('sandbox.lineSourceMobilityOnly')}</li></ul>
              <h4 className="font-medium text-foreground text-sm mt-4">{t('sandbox.calculationExcludes')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1"><li>• {t('sandbox.constructionEquipmentPoint')}</li><li>• {t('sandbox.operationalPhaseTraffic')}</li></ul>
            </div>
            <div className="flex items-center gap-4 pt-2 pb-6">
              <Button variant="outline" onClick={handleReset} className="rounded-lg">{t('sandbox.resetToDefaultBenchmarks')}</Button>
              <Button variant="ghost" onClick={onBack} className="rounded-lg">{t('sandbox.back')}</Button>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-muted/30 rounded-xl border border-border p-6">
              <div className="space-y-5">
                <div><h3 className="text-lg font-semibold text-foreground">{t('sandbox.trafficMovementCompliance')}</h3><p className="text-sm text-muted-foreground mt-1">{t('sandbox.constructionPhaseMobility')}</p></div>
                <div className="bg-background rounded-lg p-4 border border-border space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('sandbox.allowedTrafficMovements')}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('sandbox.lvLimit')}</span><span className="font-semibold tabular-nums">{allowedLVMovements.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('sandbox.hvLimit')}</span><span className="font-semibold tabular-nums">{allowedHVMovements.toLocaleString()}</span></div>
                    <div className="flex justify-between border-t border-border/30 pt-2"><span className="text-sm font-medium">{t('sandbox.totalAllowed')}</span><span className="font-bold tabular-nums">{allowedTotal.toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('sandbox.yourProjectMovements')}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('sandbox.lvConstruction')}</span><motion.span key={traffic.totalLV} initial={{ scale: 1.1, color: 'hsl(var(--primary))' }} animate={{ scale: 1, color: 'hsl(var(--foreground))' }} className="font-semibold tabular-nums">{traffic.totalLV.toLocaleString()}</motion.span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('sandbox.hvConstruction')}</span><motion.span key={traffic.totalHV} initial={{ scale: 1.1, color: 'hsl(var(--primary))' }} animate={{ scale: 1, color: 'hsl(var(--foreground))' }} className="font-semibold tabular-nums">{traffic.totalHV.toLocaleString()}</motion.span></div>
                    <div className="flex justify-between border-t border-border/30 pt-2"><span className="text-sm font-medium">{t('sandbox.totalProject')}</span><motion.span key={totalProjectMovements} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-bold text-lg tabular-nums">{totalProjectMovements.toLocaleString()}</motion.span></div>
                  </div>
                </div>
                {!isCompliant && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('sandbox.movementsToReduce')}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('sandbox.lvRemaining')}</span><span className="font-semibold text-destructive tabular-nums">{lvRemaining.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('sandbox.hvRemaining')}</span><span className="font-semibold text-destructive tabular-nums">{hvRemaining.toLocaleString()}</span></div>
                      <div className="flex justify-between border-t border-destructive/30 pt-2"><span className="text-sm font-medium">{t('sandbox.totalRemaining')}</span><span className="font-bold text-destructive tabular-nums">{totalRemaining.toLocaleString()}</span></div>
                    </div>
                  </div>
                )}
                <div className={cn("rounded-lg p-4 text-center border", isCompliant ? "bg-primary/10 border-primary/30" : "bg-destructive/5 border-destructive/20")}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('sandbox.status')}</p>
                  <motion.p key={isCompliant ? 'c' : 'n'} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={cn("text-2xl font-bold", isCompliant ? "text-primary" : "text-destructive")}>{isCompliant ? t('sandbox.compliant') : t('sandbox.notCompliant')}</motion.p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('sandbox.trafficReductionProgress')}</p>
                  <Progress value={progressPercent} className={cn("h-2", isCompliant ? "bg-primary/20" : "bg-destructive/20")} />
                  <p className="text-xs text-muted-foreground">{t('sandbox.adjustRatesToReduce')}</p>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <Button onClick={onComplete} disabled={!isCompliant} className={cn("w-full h-12 rounded-xl text-base font-medium transition-all", isCompliant ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>{t('sandbox.applyChanges')}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
