import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/i18n/LanguageContext';
import { PhaseData } from './splitPhaseEngine';

interface Props {
  phase1: PhaseData;
  phase2: PhaseData;
  checkboxes: [boolean, boolean, boolean];
  onToggleCheckbox: (index: 0 | 1 | 2) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function SPStap4Screen({ phase1, phase2, checkboxes, onToggleCheckbox, onConfirm, onBack }: Props) {
  const { t } = useLanguage();
  const allChecked = checkboxes.every(Boolean);

  const cbTexts = [
    t('splitPhase.stap4Cb1'),
    t('splitPhase.stap4Cb2'),
    t('splitPhase.stap4Cb3'),
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">
              {t('splitPhase.stap4Progress')}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">
              {t('splitPhase.stap4Title')}
            </h1>
            <p className="text-base text-muted-foreground">{t('splitPhase.stap4Desc')}</p>
          </div>

          {/* Summary cards */}
          <div className="bg-muted/30 rounded-xl border border-border p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">{t('splitPhase.stap4SummaryTitle')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.phase1')}</p>
                <p className="text-xl font-semibold text-primary mt-1">{phase1.footprintM2.toLocaleString()} m²</p>
                <p className="text-sm text-primary/70 mt-1">{t('splitPhase.stap4CompliantReady')}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('splitPhase.phase2')}</p>
                <p className="text-xl font-semibold text-foreground mt-1">{phase2.footprintM2.toLocaleString()} m²</p>
                <p className="text-sm text-muted-foreground mt-1">{t('splitPhase.futurePhase')}</p>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-5">
            <h2 className="text-lg font-medium text-foreground">{t('splitPhase.stap4LegalTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('splitPhase.stap4YouConfirm')}</p>
            <div className="space-y-4">
              {cbTexts.map((text, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={checkboxes[i]}
                    onCheckedChange={() => onToggleCheckbox(i as 0 | 1 | 2)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-foreground leading-relaxed">{text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Report notice */}
          <div className="bg-muted/30 rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground font-medium">{t('splitPhase.stap4ReportLabel')}</strong>{' '}
              {t('splitPhase.stap4ReportNotice')}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={onConfirm}
              disabled={!allChecked}
              className="flex-1 h-12 rounded-xl text-base font-medium"
            >
              {t('splitPhase.stap4CtaPrimary')}
            </Button>
            <Button variant="outline" onClick={onBack} className="rounded-xl h-12">
              {t('splitPhase.stap4CtaBack')}
            </Button>
          </div>
          {!allChecked && (
            <p className="text-xs text-muted-foreground text-center">{t('splitPhase.stap4CtaHelper')}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
