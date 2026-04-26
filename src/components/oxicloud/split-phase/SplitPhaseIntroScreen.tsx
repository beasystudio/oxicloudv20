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
            <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3 block">{t('splitPhase.optimizationAvailable')}</span>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-3">{t('splitPhase.simulationTitle')}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('splitPhase.introDesc').replace('{percent}', excessPercent)}</p>
          </div>
          <div className="border border-border rounded-2xl p-6 space-y-4 bg-background">
            <h2 className="text-base font-medium text-foreground">{t('splitPhase.howItWorks')}</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[t('splitPhase.step1'), t('splitPhase.step2'), t('splitPhase.step3'), t('splitPhase.step4')].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-xs tabular-nums text-muted-foreground w-4 mt-0.5">{i + 1}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-border rounded-2xl p-5"><p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em]">{t('splitPhase.phase1')}</p><p className="text-base font-medium text-foreground mt-2">{t('splitPhase.phase1Compliant')}</p><p className="text-sm text-muted-foreground mt-1">{t('splitPhase.phase1PermitReady')}</p></div>
            <div className="border border-border rounded-2xl p-5"><p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.15em]">{t('splitPhase.phase2')}</p><p className="text-base font-medium text-foreground mt-2">{t('splitPhase.phase2Future')}</p><p className="text-sm text-muted-foreground mt-1">{t('splitPhase.phase2SeparateAssessment')}</p></div>
          </div>
          <div className="border border-border rounded-2xl p-5"><p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">{t('splitPhase.importantNote')}</span> {t('splitPhase.importantDesc')}</p></div>
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={onContinue} className="flex-1 h-11 rounded-full text-sm font-medium">{t('splitPhase.generateSimulation')}</Button>
            <Button variant="outline" onClick={onBack} className="rounded-full h-11">{t('sandbox.back')}</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
