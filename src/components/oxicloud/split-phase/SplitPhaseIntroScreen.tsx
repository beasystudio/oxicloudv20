import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

interface SplitPhaseIntroScreenProps { projectEmission: number; threshold: number; onContinue: () => void; onBack: () => void; }

export function SplitPhaseIntroScreen({ projectEmission, threshold, onContinue, onBack }: SplitPhaseIntroScreenProps) {
  const { t } = useLanguage();
  const excessPercent = ((projectEmission / threshold) * 100 - 100).toFixed(0);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">{t('splitPhase.optimizationAvailable')}</span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">{t('splitPhase.simulationTitle')}</h1>
            <p className="text-base text-muted-foreground leading-relaxed">{t('splitPhase.introDesc').replace('{percent}', excessPercent)}</p>
          </div>
          <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-medium text-foreground">{t('splitPhase.howItWorks')}</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[t('splitPhase.step1'), t('splitPhase.step2'), t('splitPhase.step3'), t('splitPhase.step4')].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 rounded-xl border border-primary/30 p-5"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.phase1')}</p><p className="text-xl font-semibold text-primary mt-2">{t('splitPhase.phase1Compliant')}</p><p className="text-sm text-muted-foreground mt-1">{t('splitPhase.phase1PermitReady')}</p></div>
            <div className="bg-muted/30 rounded-xl border border-border p-5"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.phase2')}</p><p className="text-xl font-semibold text-foreground mt-2">{t('splitPhase.phase2Future')}</p><p className="text-sm text-muted-foreground mt-1">{t('splitPhase.phase2SeparateAssessment')}</p></div>
          </div>
          <div className="bg-secondary/10 rounded-xl border border-secondary/20 p-5"><p className="text-sm text-muted-foreground"><strong className="text-foreground font-medium">{t('splitPhase.importantNote')}</strong> {t('splitPhase.importantDesc')}</p></div>
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={onContinue} className="flex-1 h-12 rounded-xl text-base font-medium">{t('splitPhase.generateSimulation')}</Button>
            <Button variant="outline" onClick={onBack} className="rounded-xl h-12">{t('sandbox.back')}</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
