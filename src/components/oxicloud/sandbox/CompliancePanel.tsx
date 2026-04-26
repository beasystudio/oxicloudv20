import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

interface CompliancePanelProps {
  label: string;
  threshold: number;
  currentEmission: number;
  remaining: number;
  progress: number;
  isCompliant: boolean;
  unit?: string;
  beforeValue?: number;
}

export function CompliancePanel({
  label,
  threshold,
  currentEmission,
  remaining,
  progress,
  isCompliant,
  unit = 'kg NOₓ',
  beforeValue,
}: CompliancePanelProps) {
  const { t } = useLanguage();

  // Visual gauge: position of current vs target on a 0..max scale
  const max = Math.max(currentEmission, beforeValue ?? 0, threshold) * 1.05;
  const currentPct = Math.min(100, (currentEmission / max) * 100);
  const targetPct = Math.min(100, (threshold / max) * 100);
  const startPct = beforeValue !== undefined ? Math.min(100, (beforeValue / max) * 100) : null;

  return (
    <div className="space-y-10">
      {/* Eyebrow */}
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      </div>

      {/* HERO — current emission, dominant */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">{t('compliancePanel.recommendedEmission')}</p>
        <motion.div
          key={currentEmission}
          initial={{ opacity: 0.5, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-baseline gap-2"
        >
          <span className="text-6xl font-light tracking-tight tabular-nums text-foreground leading-none">
            {currentEmission.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </motion.div>

        {/* Delta line — most important for the user */}
        <div className="pt-1">
          {isCompliant ? (
            <p className="text-sm text-foreground">
              {t('compliancePanel.conform')} · {(threshold - currentEmission).toFixed(1)} {unit}{' '}
              <span className="text-muted-foreground">{t('compliancePanel.underTarget')}</span>
            </p>
          ) : (
            <p className="text-sm text-foreground">
              <span className="tabular-nums">−{remaining.toFixed(1)} {unit}</span>{' '}
              <span className="text-muted-foreground">{t('compliancePanel.stillToReduce')}</span>
            </p>
          )}
        </div>
      </div>

      {/* GAUGE — measurement scale: shaded compliance zone, current = single marker */}
      <div className="space-y-3 pt-2">
        <div className="relative h-6">
          {/* baseline */}
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-px bg-border" />
          {/* compliance zone (0 → target) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-muted rounded-full"
            style={{ width: `${targetPct}%` }}
          />
          {/* target tick */}
          <div
            className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${targetPct}%` }}
          >
            <div className="w-px h-full bg-foreground/60" />
          </div>
          {/* start marker */}
          {startPct !== null && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-muted-foreground/40"
              style={{ left: `${startPct}%` }}
            />
          )}
          {/* current marker — the focal point */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            animate={{ left: `${currentPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-foreground ring-4 ring-background" />
          </motion.div>
        </div>
        <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>0</span>
          <span>{t('compliancePanel.target')} {threshold.toFixed(1)}</span>
        </div>
      </div>

      {/* JOURNEY — start → now → target */}
      {beforeValue !== undefined && (
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t('compliancePanel.starting')}</p>
            <p className="text-lg font-light tabular-nums text-muted-foreground line-through">
              {beforeValue.toFixed(1)}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t('compliancePanel.current')}</p>
            <p className="text-lg font-light tabular-nums text-foreground">
              {currentEmission.toFixed(1)}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t('compliancePanel.target')}</p>
            <p className="text-lg font-light tabular-nums text-foreground">
              {threshold.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Progress — minimal */}
      <div className="space-y-2 border-t border-border pt-6">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t('compliancePanel.complianceProgress')}</span>
          <span className="tabular-nums text-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-px bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-foreground"
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
