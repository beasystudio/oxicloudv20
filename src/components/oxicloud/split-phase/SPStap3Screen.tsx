import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { PhaseData } from './splitPhaseEngine';
import { cn } from '@/lib/utils';

interface Props {
  phase1: PhaseData;
  phase2: PhaseData;
  onContinue: () => void;
  onBack: () => void;
}

export function SPStap3Screen({ phase1, phase2, onContinue, onBack }: Props) {
  const { t } = useLanguage();

  const renderPhaseCard = (phase: PhaseData, isPrimary: boolean) => {
    const header = isPrimary ? t('splitPhase.stap3Phase1Header') : t('splitPhase.stap3Phase2Header');
    const statusLabel = isPrimary ? t('splitPhase.conform') : t('splitPhase.futurePhase');

    const fields = [
      { label: t('splitPhase.stap3Footprint'), value: `${phase.footprintM2.toLocaleString()} m²` },
      { label: t('splitPhase.stap3DemolitionVolume'), value: `${phase.demolitionVolume.toLocaleString()} m³` },
      { label: t('splitPhase.stap3EquipmentHours'), value: `${phase.equipmentHours.toLocaleString()} u` },
      { label: t('splitPhase.stap3ConstructionDuration'), value: `${phase.constructionDays} d` },
      { label: t('splitPhase.stap3LvConstruction'), value: phase.lvTripsConstruction.toLocaleString() },
      { label: t('splitPhase.stap3HvConstruction'), value: phase.hvTripsConstruction.toLocaleString() },
      { label: t('splitPhase.stap3LvOperational'), value: phase.lvTripsOperational.toLocaleString() },
      { label: t('splitPhase.stap3HvOperational'), value: phase.hvTripsOperational.toLocaleString() },
    ];

    return (
      <div className={cn(
        'rounded-xl border p-6 space-y-4',
        isPrimary ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border'
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{header}</p>
            <p className={cn('text-xl font-semibold mt-1', isPrimary ? 'text-primary' : 'text-foreground')}>
              {statusLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{t('splitPhase.ratio')}</p>
            <p className="text-2xl font-semibold tabular-nums">{(phase.ratio * 100).toFixed(0)}%</p>
          </div>
        </div>
        <div className="border-t border-border/50 pt-4 space-y-2.5">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="font-medium tabular-nums">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">
              {t('splitPhase.stap3Progress')}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">
              {t('splitPhase.stap3Title')}
            </h1>
            <p className="text-base text-muted-foreground">{t('splitPhase.stap3Desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderPhaseCard(phase1, true)}
            {renderPhaseCard(phase2, false)}
          </div>

          <div className="bg-muted/30 rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground font-medium">{t('splitPhase.importantNote')}</strong>{' '}
              {t('splitPhase.stap3Notice')}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={onContinue} className="flex-1 h-12 rounded-xl text-base font-medium">
              {t('splitPhase.stap3CtaPrimary')}
            </Button>
            <Button variant="outline" onClick={onBack} className="rounded-xl h-12">
              {t('splitPhase.stap3CtaBack')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
