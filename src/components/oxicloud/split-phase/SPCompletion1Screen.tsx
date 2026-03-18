import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { PhaseData } from './splitPhaseEngine';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  phase1: PhaseData;
  phase2: PhaseData;
  projectName: string;
  onExportPhase1: () => void;
  onExportPhase2: () => void;
  onContinue: () => void;
  onBackToProjects: () => void;
}

export function SPCompletion1Screen({
  phase1, phase2, projectName, onExportPhase1, onExportPhase2, onContinue, onBackToProjects,
}: Props) {
  const { t } = useLanguage();
  const disclaimers = t('splitPhase.completion1Disclaimers') as unknown as string[];

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">
              {t('splitPhase.completion1Title')}
            </h1>
            <p className="text-base text-muted-foreground">
              {(t('splitPhase.completion1Subtitle') as string).replace('{projectName}', projectName)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-xl border border-primary/30 p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.phase1')}</p>
                <p className="text-xl font-semibold text-primary mt-1">{t('splitPhase.completion1Phase1Status')}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('splitPhase.stap3Footprint')}</span>
                  <span className="font-medium">{phase1.footprintM2.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('splitPhase.ratio')}</span>
                  <span className="font-medium">{(phase1.ratio * 100).toFixed(0)}%</span>
                </div>
              </div>
              <Button onClick={onExportPhase1} className="w-full rounded-lg h-10">
                {t('splitPhase.completion1ExportPhase1')}
              </Button>
            </div>

            <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.phase2')}</p>
                <p className="text-xl font-semibold text-foreground mt-1">{t('splitPhase.completion1Phase2Status')}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('splitPhase.stap3Footprint')}</span>
                  <span className="font-medium">{phase2.footprintM2.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('splitPhase.ratio')}</span>
                  <span className="font-medium">{(phase2.ratio * 100).toFixed(0)}%</span>
                </div>
              </div>
              <Button onClick={onExportPhase2} variant="outline" className="w-full rounded-lg h-10">
                {t('splitPhase.completion1ExportPhase2')}
              </Button>
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">{t('splitPhase.completion1DossierNotice')}</p>
          </div>

          <div className="bg-muted/20 rounded-xl border border-border p-5">
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {(Array.isArray(disclaimers) ? disclaimers : []).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 pt-4">
            <Button onClick={onContinue} className="w-full h-12 rounded-xl text-base font-medium">
              {t('splitPhase.completion2CtaPrimary')}
            </Button>
            <Button onClick={onBackToProjects} variant="outline" className="w-full h-12 rounded-xl">
              {t('splitPhase.completion1CtaBack')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
