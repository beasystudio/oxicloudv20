import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

interface SandboxProjectionPanelProps {
  title: string;
  subtitle?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  remainingReduction: number;
  isCompliant: boolean;
  beforeValue?: number;
  afterValue?: number;
  showBeforeAfter?: boolean;
  inputValue?: number;
}

export function SandboxProjectionPanel({
  title, subtitle, targetValue, currentValue, unit, remainingReduction,
  isCompliant, beforeValue, afterValue, showBeforeAfter = false, inputValue,
}: SandboxProjectionPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-muted/30 rounded-xl border border-border p-6 h-full">
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('sandbox.allowedLimit')}</p>
          <p className="text-2xl font-semibold tabular-nums mt-1">{targetValue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{unit}</span></p>
        </div>

        {inputValue !== undefined && (
          <div className="bg-background rounded-lg p-4 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('sandbox.yourProjectEmissions')}</p>
            <p className="text-2xl font-semibold tabular-nums mt-1 text-destructive">{inputValue.toLocaleString()} <span className="text-sm font-normal">{unit}</span></p>
          </div>
        )}

        {inputValue !== undefined && (
          <div className={cn("rounded-lg p-4 border", inputValue - targetValue <= 0 ? "bg-primary/10 border-primary/30" : "bg-destructive/5 border-destructive/20")}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('sandbox.remainingReduction')}</p>
            <p className={cn("text-2xl font-semibold tabular-nums mt-1", inputValue - targetValue <= 0 ? "text-primary" : "text-destructive")}>
              {Math.max(0, Math.round((inputValue - targetValue) * 10) / 10).toLocaleString()} <span className="text-sm font-normal">{unit}</span>
            </p>
          </div>
        )}

        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('sandbox.recommended')}</p>
          <motion.p key={currentValue} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className={cn("text-2xl font-semibold tabular-nums mt-1", isCompliant ? "text-primary" : "text-foreground")}>
            {currentValue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
          </motion.p>
        </div>

        <div className={cn("rounded-lg p-4 border transition-colors", isCompliant ? "bg-primary/10 border-primary/30" : "bg-destructive/5 border-destructive/20")}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {isCompliant ? t('sandbox.status') : t('sandbox.remainingReductionLabel')}
          </p>
          {isCompliant ? (
            <motion.p initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="text-xl font-semibold text-primary mt-1">{t('sandbox.conformant')}</motion.p>
          ) : (
            <p className="text-xl font-semibold text-destructive tabular-nums mt-1">{remainingReduction.toLocaleString()} <span className="text-sm font-normal">{unit}</span></p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('sandbox.complianceProgressLabel')}</p>
          <div className="relative h-2 rounded-full overflow-hidden bg-muted">
            <motion.div className={cn("absolute inset-y-0 left-0 rounded-full", isCompliant ? "bg-primary" : "bg-destructive")} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (targetValue / Math.max(currentValue, 0.01)) * 100)}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
          </div>
          <p className="text-xs text-muted-foreground">
            {isCompliant ? t('sandbox.withinLimits') : t('sandbox.adjustParamsToReduce').replace('{unit}', unit.toLowerCase())}
          </p>
        </div>

        {showBeforeAfter && beforeValue !== undefined && afterValue !== undefined && (
          <div className="bg-background rounded-lg p-4 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('sandbox.summary')}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('sandbox.input')}</p>
                <p className="text-lg font-medium text-muted-foreground line-through tabular-nums">{beforeValue.toLocaleString()}</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t('sandbox.recommended')}</p>
                <p className={cn("text-lg font-medium tabular-nums", afterValue < beforeValue ? "text-primary" : "text-foreground")}>{afterValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
