import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, X, TrendingDown, ArrowRight } from 'lucide-react';

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
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{label}</h3>

      {/* Threshold */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Toegestane limiet</p>
        <p className="text-2xl font-bold tabular-nums text-foreground">
          {threshold.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
        </p>
      </div>

      {/* Current emission */}
      <div className={cn(
        "rounded-xl border p-4 transition-colors",
        isCompliant ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"
      )}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Aanbevolen emissie</p>
        <motion.p
          key={currentEmission}
          initial={{ scale: 1.03 }}
          animate={{ scale: 1 }}
          className={cn("text-2xl font-bold tabular-nums", isCompliant ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}
        >
          {currentEmission.toFixed(1)} <span className="text-sm font-normal">{unit}</span>
        </motion.p>
        {!isCompliant && (
          <p className="text-xs text-destructive/80 mt-1">
            Overschrijdt met {remaining.toFixed(1)} {unit}
          </p>
        )}
      </div>

      {/* Remaining reduction */}
      <div className={cn(
        "rounded-xl border p-4",
        isCompliant ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"
      )}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Resterende reductie</p>
        <p className={cn("text-xl font-bold tabular-nums", isCompliant ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
          {remaining.toFixed(1)} <span className="text-sm font-normal">{unit}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Conformiteitsvoortgang</p>
          <span className="text-xs font-bold tabular-nums text-muted-foreground">{Math.round(progress)}% reductie bereikt</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full transition-colors",
              progress >= 100 ? "bg-emerald-500" : progress > 50 ? "bg-amber-500" : "bg-destructive"
            )}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Status badge */}
      <motion.div
        key={isCompliant ? 'ok' : 'nok'}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "rounded-xl border p-4 text-center",
          isCompliant ? "border-emerald-500/30 bg-emerald-500/10" : "border-destructive/20 bg-destructive/5"
        )}
      >
        <div className="flex items-center justify-center gap-2">
          {isCompliant ? <Check className="h-5 w-5 text-emerald-500" /> : <X className="h-5 w-5 text-destructive" />}
          <span className={cn("text-lg font-bold", isCompliant ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
            {isCompliant ? 'Conform' : 'Niet Conform'}
          </span>
        </div>
      </motion.div>

      {/* Before → After summary */}
      {beforeValue !== undefined && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Samenvatting</p>
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-muted-foreground line-through tabular-nums">{beforeValue.toFixed(1)}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className={cn("text-base font-bold tabular-nums", currentEmission < beforeValue ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>
              {currentEmission.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
        </div>
      )}
    </div>
  );
}
