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
          <div>
            <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3 block">{t('splitPhase.simulationComplete')}</span>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-3">{t('splitPhase.simulationComplete')}</h1>
            <p className="text-sm text-muted-foreground">{t('splitPhase.twoPhases').replace('{name}', projectName)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-2xl p-6 space-y-4">
              <div><p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em]">{t('splitPhase.phase1')}</p><p className="text-base font-medium text-foreground mt-1">{t('sandbox.compliant')}</p></div>
              <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">{t('splitPhase.footprint')}</span><span className="text-foreground tabular-nums">{phase1.footprintArea.toLocaleString()} m²</span></div><div className="flex justify-between"><span className="text-muted-foreground">{t('splitPhase.ratio')}</span><span className="text-foreground tabular-nums">{(phase1.ratio * 100).toFixed(0)}%</span></div></div>
              <Button onClick={onDownloadPhase1} className="w-full rounded-full h-10 text-sm font-medium">{t('splitPhase.exportPhase1Report')}</Button>
            </div>
            <div className="border border-border rounded-2xl p-6 space-y-4">
              <div><p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em]">{t('splitPhase.phase2')}</p><p className="text-base font-medium text-foreground mt-1">{t('splitPhase.futurePhase')}</p></div>
              <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">{t('splitPhase.footprint')}</span><span className="text-foreground tabular-nums">{phase2.footprintArea.toLocaleString()} m²</span></div><div className="flex justify-between"><span className="text-muted-foreground">{t('splitPhase.ratio')}</span><span className="text-foreground tabular-nums">{(phase2.ratio * 100).toFixed(0)}%</span></div></div>
              <Button onClick={onDownloadPhase2} variant="outline" className="w-full rounded-full h-10 text-sm font-medium">{t('splitPhase.exportPhase2Report')}</Button>
            </div>
          </div>
          <div className="border border-border rounded-2xl p-5"><h3 className="text-sm font-medium text-foreground mb-2">{t('splitPhase.projectFileUpdated')}</h3><p className="text-sm text-muted-foreground">{t('splitPhase.projectFileUpdatedDesc')}</p></div>
          <div className="border border-border rounded-2xl p-5">
            <h3 className="text-sm font-medium text-foreground mb-2">{t('splitPhase.reportLabels')}</h3>
            <p className="text-sm text-muted-foreground">{t('splitPhase.reportLabelsDesc')}</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside"><li>{t('splitPhase.reportOnlyForPhase')}</li><li>{t('splitPhase.reportNotFullPlan')}</li><li>{t('splitPhase.complianceIndependent')}</li></ul>
          </div>
          <div className="pt-4"><Button onClick={onBackToProjects} variant="outline" className="w-full h-11 rounded-full text-sm">{t('splitPhase.backToProjects')}</Button></div>
        </motion.div>
      </div>
    </div>
  );
}
