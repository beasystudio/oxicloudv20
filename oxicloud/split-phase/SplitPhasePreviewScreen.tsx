import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PhaseProject, SplitPhaseCalculation } from '@/types/splitPhase';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

interface SplitPhasePreviewScreenProps { calculation: SplitPhaseCalculation; phase1: PhaseProject; phase2: PhaseProject; onContinue: () => void; onBack: () => void; }

export function SplitPhasePreviewScreen({ calculation, phase1, phase2, onContinue, onBack }: SplitPhasePreviewScreenProps) {
  const { t } = useLanguage();
  const renderPhaseCard = (phase: PhaseProject, isPrimary: boolean) => (
    <div className={cn("rounded-xl border p-6 space-y-5", isPrimary ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border")}>
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{phase.phaseName}</p><p className={cn("text-xl font-semibold mt-1", isPrimary ? "text-primary" : "text-foreground")}>{phase.complianceStatus === 'compliant' ? t('sandbox.compliant') : t('splitPhase.futurePhase')}</p></div>
        <div className="text-right"><p className="text-xs text-muted-foreground">{t('splitPhase.ratio')}</p><p className="text-2xl font-semibold tabular-nums">{(phase.ratio * 100).toFixed(0)}%</p></div>
      </div>
      <div className="border-t border-border/50 pt-4 space-y-3">
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.footprint')}</span><span className="font-medium tabular-nums">{phase.footprintArea.toLocaleString()} m²</span></div>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.demolitionVolume')}</span><span className="font-medium tabular-nums">{phase.demolitionVolume.toLocaleString()} m³</span></div>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.equipmentHours')}</span><span className="font-medium tabular-nums">{phase.equipmentHours.toLocaleString()} u</span></div>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.constructionDurationLabel')}</span><span className="font-medium tabular-nums">{phase.constructionDuration} {t('sandbox.days')}</span></div>
      </div>
      <div className="border-t border-border/50 pt-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.trafficMovementsSection')}</p>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.lightVehiclesLabel')}</span><span className="font-medium tabular-nums">{phase.trafficMovementsLight.toLocaleString()}</span></div>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.heavyVehiclesLabel')}</span><span className="font-medium tabular-nums">{phase.trafficMovementsHeavy.toLocaleString()}</span></div>
      </div>
      <div className="border-t border-border/50 pt-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.operationalTrafficSection')}</p>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.lightVehiclesLabel')}</span><span className="font-medium tabular-nums">{phase.operationalTrafficLight.toLocaleString()}</span></div>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{t('splitPhase.heavyVehiclesLabel')}</span><span className="font-medium tabular-nums">{phase.operationalTrafficHeavy.toLocaleString()}</span></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div><span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">{t('splitPhase.stepXofY').replace('{x}', '3').replace('{y}', '4')}</span><h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">{t('splitPhase.phaseProjectPreview')}</h1><p className="text-base text-muted-foreground">{t('splitPhase.previewDesc')}</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderPhaseCard(phase1, true)}{renderPhaseCard(phase2, false)}</div>
          <div className="bg-muted/30 rounded-xl border border-border p-5"><p className="text-sm text-muted-foreground"><strong className="text-foreground font-medium">{t('splitPhase.previewNote')}</strong> {t('splitPhase.previewNoteDesc')}</p></div>
          <div className="flex items-center gap-3 pt-4"><Button onClick={onContinue} className="flex-1 h-12 rounded-xl text-base font-medium">{t('splitPhase.continueToConfirmation')}</Button><Button variant="outline" onClick={onBack} className="rounded-xl h-12">{t('sandbox.back')}</Button></div>
        </motion.div>
      </div>
    </div>
  );
}
