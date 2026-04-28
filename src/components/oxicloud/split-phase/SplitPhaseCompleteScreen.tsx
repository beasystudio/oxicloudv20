import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PhaseProject } from '@/types/splitPhase';
import { useLanguage } from '@/i18n/LanguageContext';
import { Download, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitPhaseCompleteScreenProps {
  phase1: PhaseProject;
  phase2: PhaseProject;
  projectName: string;
  onDownloadPhase1: () => void;
  onDownloadPhase2: () => void;
  onBackToProjects: () => void;
}

function CompletePhaseCard({
  phase, isPrimary, onDownload, t,
}: {
  phase: PhaseProject; isPrimary: boolean; onDownload: () => void; t: (k: string) => string;
}) {
  return (
    <div className={cn('border rounded-xl bg-card overflow-hidden', isPrimary ? 'border-foreground/40' : 'border-border')}>
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {phase.phaseName}
          </p>
          <div className="flex items-center gap-1.5">
            {isPrimary && <Check className="h-3 w-3 text-foreground" />}
            <p className={cn('text-sm font-medium', isPrimary ? 'text-foreground' : 'text-muted-foreground')}>
              {isPrimary ? t('sandbox.compliant') : t('splitPhase.futurePhase')}
            </p>
          </div>
        </div>
        <p className="text-xl font-semibold tabular-nums text-foreground leading-none">
          {(phase.ratio * 100).toFixed(0)}%
        </p>
      </div>
      <div className="px-4 py-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">{t('splitPhase.footprint')}</span>
          <span className="text-foreground tabular-nums font-medium">
            {phase.footprintArea.toLocaleString()} m²
          </span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">{t('splitPhase.constructionDurationLabel')}</span>
          <span className="text-foreground tabular-nums font-medium">
            {phase.constructionDuration} {t('sandbox.days')}
          </span>
        </div>
      </div>
      <div className="px-3 pb-3 pt-1">
        <Button
          onClick={onDownload}
          variant={isPrimary ? 'default' : 'outline'}
          className="w-full h-8 rounded-full text-xs gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          {isPrimary ? t('splitPhase.exportPhase1Report') : t('splitPhase.exportPhase2Report')}
        </Button>
      </div>
    </div>
  );
}

export function SplitPhaseCompleteScreen({
  phase1, phase2, projectName, onDownloadPhase1, onDownloadPhase2, onBackToProjects,
}: SplitPhaseCompleteScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background px-4 md:px-10 py-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-3xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            <Check className="h-3 w-3 text-foreground" />
            <span>Done</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground leading-tight">
            {t('splitPhase.simulationComplete')}
          </h1>
          <p className="text-[13px] text-muted-foreground leading-relaxed max-w-prose">
            {t('splitPhase.twoPhases').replace('{name}', projectName)}
          </p>
        </div>

        {/* Phase cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompletePhaseCard phase={phase1} isPrimary onDownload={onDownloadPhase1} t={t} />
          <CompletePhaseCard phase={phase2} isPrimary={false} onDownload={onDownloadPhase2} t={t} />
        </div>

        {/* Project file updated */}
        <section className="border border-border rounded-xl bg-card">
          <div className="px-4 py-2.5 border-b border-border">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t('splitPhase.projectFileUpdated')}
            </h3>
          </div>
          <p className="px-4 py-3 text-[12px] text-muted-foreground leading-relaxed">
            {t('splitPhase.projectFileUpdatedDesc')}
          </p>
        </section>

        {/* Report labels */}
        <section className="border border-border rounded-xl bg-card">
          <div className="px-4 py-2.5 border-b border-border">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t('splitPhase.reportLabels')}
            </h3>
          </div>
          <div className="px-4 py-3 space-y-2">
            <p className="text-[12px] text-muted-foreground leading-relaxed">{t('splitPhase.reportLabelsDesc')}</p>
            <ul className="space-y-1.5">
              {[
                t('splitPhase.reportOnlyForPhase'),
                t('splitPhase.reportNotFullPlan'),
                t('splitPhase.complianceIndependent'),
              ].map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                  <span className="text-[10px] tabular-nums text-muted-foreground/60 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-border">
          <Button
            onClick={onBackToProjects}
            variant="outline"
            className="h-9 rounded-full text-xs px-4"
          >
            {t('splitPhase.backToProjects')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
