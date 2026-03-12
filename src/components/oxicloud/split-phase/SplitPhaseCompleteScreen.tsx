import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PhaseProject } from '@/types/splitPhase';
import { useLanguage } from '@/i18n/LanguageContext';

interface SplitPhaseCompleteScreenProps { phase1: PhaseProject; phase2: PhaseProject; projectName: string; onDownloadPhase1: () => void; onDownloadPhase2: () => void; onBackToProjects: () => void; }

export function SplitPhaseCompleteScreen({ phase1, phase2, projectName, onDownloadPhase1, onDownloadPhase2, onBackToProjects }: SplitPhaseCompleteScreenProps) {
  const { t } = useLanguage();
  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-3xl">✓</span></motion.div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">{t('splitPhase.simulationComplete')}</h1>
            <p className="text-base text-muted-foreground">{t('splitPhase.twoPhases').replace('{name}', projectName)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/10 rounded-xl border border-primary/30 p-6 space-y-4">
              <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.phase1')}</p><p className="text-xl font-semibold text-primary mt-1">{t('sandbox.compliant')}</p></div>
              <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">{t('splitPhase.footprint')}</span><span className="font-medium">{phase1.footprintArea.toLocaleString()} m²</span></div><div className="flex justify-between"><span className="text-muted-foreground">{t('splitPhase.ratio')}</span><span className="font-medium">{(phase1.ratio * 100).toFixed(0)}%</span></div></div>
              <Button onClick={onDownloadPhase1} className="w-full rounded-lg h-10">{t('splitPhase.exportPhase1Report')}</Button>
            </div>
            <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-4">
              <div><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.phase2')}</p><p className="text-xl font-semibold text-foreground mt-1">{t('splitPhase.futurePhase')}</p></div>
              <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">{t('splitPhase.footprint')}</span><span className="font-medium">{phase2.footprintArea.toLocaleString()} m²</span></div><div className="flex justify-between"><span className="text-muted-foreground">{t('splitPhase.ratio')}</span><span className="font-medium">{(phase2.ratio * 100).toFixed(0)}%</span></div></div>
              <Button onClick={onDownloadPhase2} variant="outline" className="w-full rounded-lg h-10">{t('splitPhase.exportPhase2Report')}</Button>
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl border border-border p-5"><h3 className="font-medium text-foreground mb-2">{t('splitPhase.projectFileUpdated')}</h3><p className="text-sm text-muted-foreground">{t('splitPhase.projectFileUpdatedDesc')}</p></div>
          <div className="bg-secondary/10 rounded-xl border border-secondary/20 p-5">
            <h3 className="font-medium text-foreground mb-2">{t('splitPhase.reportLabels')}</h3>
            <p className="text-sm text-muted-foreground">{t('splitPhase.reportLabelsDesc')}</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside"><li>{t('splitPhase.reportOnlyForPhase')}</li><li>{t('splitPhase.reportNotFullPlan')}</li><li>{t('splitPhase.complianceIndependent')}</li></ul>
          </div>
          <div className="pt-4"><Button onClick={onBackToProjects} variant="outline" className="w-full h-12 rounded-xl">{t('splitPhase.backToProjects')}</Button></div>
        </motion.div>
      </div>
    </div>
  );
}
