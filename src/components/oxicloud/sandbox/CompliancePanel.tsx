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

  const start = beforeValue ?? currentEmission;
  const saved = Math.max(0, start - currentEmission);
  const savedPct = start > 0 ? Math.round((saved / start) * 100) : 0;
  const delta = currentEmission - threshold; // positive = over target

  // Visual scale: 0 → start (or current if higher)
  const max = Math.max(start, currentEmission, threshold) * 1.05;
  const targetPct = Math.min(100, (threshold / max) * 100);
  const currentPct = Math.min(100, (currentEmission / max) * 100);
  const startPct = Math.min(100, (start / max) * 100);

  return (
    <div className="space-y-5">
      {/* Eyebrow + status pill */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <span className={cn(
          "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border",
          isCompliant
            ? "border-muted-foreground/30 text-foreground/80 bg-muted/20"
            : "border-muted-foreground/30 text-muted-foreground"
        )}>
          {isCompliant ? t('sandboxTabs.compliantStatus') : t('sandboxTabs.notCompliantStatus')}
        </span>
      </div>

      {/* HERO - current value, big */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          {t('sandboxTabs.nowAt')}
        </p>
        <motion.div
          key={currentEmission.toFixed(1)}
          initial={{ opacity: 0.4, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-baseline gap-2"
        >
          <span className="text-5xl font-light tracking-tight tabular-nums text-foreground/85 leading-none">
            {currentEmission.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </motion.div>
      </div>

      {/* DELTA card - the answer to "am I compliant?" */}
      <div className={cn(
        "rounded-md border p-3",
        isCompliant ? "border-border/70 bg-muted/15" : "border-border/70 bg-muted/20"
      )}>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
          {isCompliant ? t('sandboxTabs.underTargetBy') : t('sandboxTabs.stillNeedToCut')}
        </p>
        <p className="text-2xl font-light tabular-nums text-foreground/85">
          {isCompliant ? '−' : ''}{Math.abs(delta).toFixed(1)}
          <span className="text-sm text-muted-foreground ml-1.5">{unit}</span>
        </p>
      </div>

      {/* GAUGE - clean horizontal scale */}
      <div className="space-y-2 pt-1">
        <div className="relative h-10">
          {/* full track */}
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-[2px] bg-muted rounded-full" />
          {/* compliance zone (0 → target) - slightly darker fill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-muted-foreground/20 rounded-full"
            style={{ width: `${targetPct}%` }}
          />
          {/* progress trail showing how far we've moved from start */}
          {currentPct < startPct && (
            <div
              className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-muted-foreground/30"
              style={{ left: `${currentPct}%`, width: `${startPct - currentPct}%` }}
            />
          )}
          {/* TARGET notch */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-3 bg-muted-foreground/60"
            style={{ left: `${targetPct}%` }}
          />
          {/* START marker (faded dot) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
            style={{ left: `${startPct}%` }}
          />
          {/* CURRENT marker - focal point */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-muted-foreground/70 ring-4 ring-background"
            animate={{ left: `${currentPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          {/* Target label below */}
          <div
            className="absolute bottom-0 -translate-x-1/2 text-[9px] uppercase tracking-wider text-muted-foreground whitespace-nowrap"
            style={{ left: `${targetPct}%` }}
          >
            {t('sandboxTabs.mustReach')} · {threshold.toFixed(1)}
          </div>
        </div>
        <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>0</span>
          <span>{unit}</span>
        </div>
      </div>

      {/* SAVED so far - narrative ROI */}
      {beforeValue !== undefined && saved > 0 && (
        <div className="border-t border-border pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">{t('sandboxTabs.youSavedSoFar')}</span>
            <span className="text-sm tabular-nums text-foreground">
              −{saved.toFixed(1)} {unit}
              <span className="text-muted-foreground ml-1.5">({savedPct}%)</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t('sandboxTabs.startingPoint')}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground line-through">
              {beforeValue.toFixed(1)} {unit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
