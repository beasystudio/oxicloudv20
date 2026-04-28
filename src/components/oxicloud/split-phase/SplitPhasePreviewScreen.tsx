import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PhaseProject, SplitPhaseCalculation } from '@/types/splitPhase';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, Check } from 'lucide-react';

interface SplitPhasePreviewScreenProps {
  calculation: SplitPhaseCalculation;
  phase1: PhaseProject;
  phase2: PhaseProject;
  onContinue: () => void;
  onBack: () => void;
}

function StepHeader({ step, total, eyebrow, title, description }: {
  step: number; total: number; eyebrow: string; title: string; description: string;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
        <span className="tabular-nums text-foreground/80">
          {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <span className="h-px w-6 bg-border" />
        <span>{eyebrow}</span>
      </div>
      <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground leading-tight">{title}</h1>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-prose">{description}</p>
    </div>
  );
}

function FieldRow({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-[12px] font-medium tabular-nums text-foreground">
        {value}
        {unit && <span className="text-muted-foreground font-normal ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

function PhaseCard({
  phase,
  isPrimary,
  t,
}: {
  phase: PhaseProject;
  isPrimary: boolean;
  t: (k: string) => string;
}) {
  return (
    <div
      className={cn(
        'border rounded-xl bg-card overflow-hidden',
        isPrimary ? 'border-foreground/40' : 'border-border',
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
            {phase.phaseName}
          </p>
          <div className="flex items-center gap-1.5">
            {isPrimary && <Check className="h-3 w-3 text-foreground" />}
            <p className={cn('text-sm font-medium', isPrimary ? 'text-foreground' : 'text-muted-foreground')}>
              {phase.complianceStatus === 'compliant' ? t('sandbox.compliant') : t('splitPhase.futurePhase')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('splitPhase.ratio')}</p>
          <p className="text-xl font-semibold tabular-nums text-foreground leading-none mt-0.5">
            {(phase.ratio * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Sections */}
      <Section title="Geometry" t={t}>
        <FieldRow label={t('splitPhase.footprint')} value={phase.footprintArea.toLocaleString()} unit="m²" />
        <FieldRow label={t('splitPhase.demolitionVolume')} value={phase.demolitionVolume.toLocaleString()} unit="m³" />
        <FieldRow label={t('splitPhase.constructionDurationLabel')} value={phase.constructionDuration} unit={` ${t('sandbox.days')}`} />
      </Section>

      <Section title={t('splitPhase.trafficMovementsSection')} t={t}>
        <FieldRow label={t('splitPhase.equipmentHours')} value={phase.equipmentHours.toLocaleString()} unit="h" />
        <FieldRow label={t('splitPhase.lightVehiclesLabel')} value={phase.trafficMovementsLight.toLocaleString()} />
        <FieldRow label={t('splitPhase.heavyVehiclesLabel')} value={phase.trafficMovementsHeavy.toLocaleString()} />
      </Section>

      <Section title={t('splitPhase.operationalTrafficSection')} t={t} last>
        <FieldRow label={t('splitPhase.lightVehiclesLabel')} value={phase.operationalTrafficLight.toLocaleString()} />
        <FieldRow label={t('splitPhase.heavyVehiclesLabel')} value={phase.operationalTrafficHeavy.toLocaleString()} />
      </Section>
    </div>
  );
}

function Section({ title, children, last, t }: { title: string; children: React.ReactNode; last?: boolean; t: (k: string) => string }) {
  return (
    <div className={cn(!last && 'border-b border-border')}>
      <div className="px-4 pt-2.5 pb-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">{title}</p>
      </div>
      <div className="px-1 pb-2">{children}</div>
    </div>
  );
}

export function SplitPhasePreviewScreen({ calculation, phase1, phase2, onContinue, onBack }: SplitPhasePreviewScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-180px)] bg-background px-4 md:px-10 py-10 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-4xl mx-auto space-y-8"
      >
        <StepHeader
          step={3}
          total={4}
          eyebrow="Phase preview"
          title={t('splitPhase.phaseProjectPreview')}
          description={t('splitPhase.previewDesc')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhaseCard phase={phase1} isPrimary t={t} />
          <PhaseCard phase={phase2} isPrimary={false} t={t} />
        </div>

        <div className="border-l-2 border-foreground/40 pl-4">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">{t('splitPhase.previewNote')}</span>{' '}
            {t('splitPhase.previewNoteDesc')}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
          >
            {t('sandbox.back')}
          </Button>
          <Button onClick={onContinue} className="h-9 rounded-full text-xs px-4 gap-1.5">
            {t('splitPhase.continueToConfirmation')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
