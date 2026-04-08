import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PhaseProject } from '@/types/splitPhase';
import { useLanguage } from '@/i18n/LanguageContext';

interface SplitPhaseConfirmationScreenProps { phase1: PhaseProject; phase2: PhaseProject; onConfirm: () => void; onBack: () => void; }

export function SplitPhaseConfirmationScreen({ phase1, phase2, onConfirm, onBack }: SplitPhaseConfirmationScreenProps) {
  const { t } = useLanguage();
  const [confirmations, setConfirmations] = useState({ independentPhases: false, separatePermits: false, validStructure: false });
  const allConfirmed = Object.values(confirmations).every(Boolean);
  const handleCheckChange = (key: keyof typeof confirmations) => setConfirmations(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div><span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">{t('splitPhase.stepXofY').replace('{x}', '4').replace('{y}', '4')}</span><h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">{t('splitPhase.architectConfirmation')}</h1><p className="text-base text-muted-foreground">{t('splitPhase.confirmDesc')}</p></div>
          <div className="bg-muted/30 rounded-xl border border-border p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">{t('splitPhase.phaseSplitSummary')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.phase1')}</p><p className="text-xl font-semibold text-primary mt-1">{phase1.footprintArea.toLocaleString()} m²</p><p className="text-sm text-primary/70 mt-1">{t('splitPhase.compliantReadyForPermit')}</p></div>
              <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/30"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.phase2')}</p><p className="text-xl font-semibold text-foreground mt-1">{phase2.footprintArea.toLocaleString()} m²</p><p className="text-sm text-muted-foreground mt-1">{t('splitPhase.futurePhase')}</p></div>
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-5">
            <h2 className="text-lg font-medium text-foreground">{t('splitPhase.legalConfirmations')}</h2>
            <p className="text-sm text-muted-foreground">{t('splitPhase.youConfirmThat')}</p>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer"><Checkbox checked={confirmations.independentPhases} onCheckedChange={() => handleCheckChange('independentPhases')} className="mt-0.5" /><span className="text-sm text-foreground leading-relaxed">{t('splitPhase.confirmIndependent')}</span></label>
              <label className="flex items-start gap-3 cursor-pointer"><Checkbox checked={confirmations.separatePermits} onCheckedChange={() => handleCheckChange('separatePermits')} className="mt-0.5" /><span className="text-sm text-foreground leading-relaxed">{t('splitPhase.confirmPermits')}</span></label>
              <label className="flex items-start gap-3 cursor-pointer"><Checkbox checked={confirmations.validStructure} onCheckedChange={() => handleCheckChange('validStructure')} className="mt-0.5" /><span className="text-sm text-foreground leading-relaxed">{t('splitPhase.confirmValid')}</span></label>
            </div>
          </div>
          <div className="bg-secondary/10 rounded-xl border border-secondary/20 p-5"><p className="text-sm text-muted-foreground"><strong className="text-foreground font-medium">{t('splitPhase.reportLabel')}</strong> {t('splitPhase.reportLabelDesc')}</p></div>
          <div className="flex items-center gap-3 pt-4"><Button onClick={onConfirm} disabled={!allConfirmed} className="flex-1 h-12 rounded-xl text-base font-medium">{t('splitPhase.generatePhaseReports')}</Button><Button variant="outline" onClick={onBack} className="rounded-xl h-12">{t('sandbox.back')}</Button></div>
          {!allConfirmed && <p className="text-xs text-muted-foreground text-center">{t('splitPhase.confirmAllToGenerate')}</p>}
        </motion.div>
      </div>
    </div>
  );
}
