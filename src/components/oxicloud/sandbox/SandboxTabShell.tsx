import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';

export interface ScenarioCard {
  id: string;
  title: string;
  summary: string;
  projected: number; // projected emission value to display
  apply: () => void;
}

interface Props {
  /** Left rail (optional). When omitted, the layout uses a 2-column grid. */
  scenarios?: ScenarioCard[];
  activeScenarioId?: string | null;
  onResetAll?: () => void;
  /** Center column */
  inputs: ReactNode;
  /** Right column (CompliancePanel) */
  compliance: ReactNode;
  /** Footer */
  onBack: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLabel?: string;
}

export function SandboxTabShell({
  scenarios,
  activeScenarioId,
  onResetAll,
  inputs,
  compliance,
  onBack,
  onConfirm,
  confirmDisabled,
  confirmLabel,
}: Props) {
  const { t } = useLanguage();
  const hasScenarios = !!scenarios && scenarios.length > 0;

  return (
    <div className="h-full min-h-0 overflow-hidden bg-background">
      <div
        className={cn(
          'h-full min-h-0 py-4 grid grid-cols-1 gap-8',
          hasScenarios ? 'lg:grid-cols-12' : 'lg:grid-cols-12',
        )}
      >
        {/* LEFT - scenarios (only when provided) */}
        {hasScenarios && (
          <aside className="lg:col-span-3 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
                {t('sandboxTabs.aiScenarios')}
              </h3>
              {onResetAll && (
                <button
                  onClick={onResetAll}
                  className="text-[10px] text-muted-foreground/70 hover:text-foreground underline underline-offset-4 hover:no-underline"
                >
                  {t('sandboxTabs.resetToBase')}
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/80 mb-3 leading-relaxed">
              {t('sandboxTabs.scenariosFor')}
            </p>
            <div className="flex flex-col gap-2 flex-1 min-h-0">
              {scenarios!.map((sc) => {
                const active = activeScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      sc.apply();
                      toast.success(sc.title, { duration: 1800 });
                    }}
                    className={cn(
                      'text-left px-3 py-2.5 border rounded-md transition-colors',
                      active
                        ? 'border-muted-foreground/40 bg-muted/40'
                        : 'border-border/70 hover:border-border hover:bg-muted/20',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-[13px] text-foreground/90 leading-tight">{sc.title}</h4>
                      {sc.projected > 0 && (
                        <span className="text-[11px] tabular-nums text-muted-foreground whitespace-nowrap">
                          {sc.projected}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed line-clamp-3">
                      {sc.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* CENTER - inputs (minimal, neutral) */}
        <section
          className={cn(
            'flex flex-col min-h-0',
            hasScenarios
              ? 'lg:col-span-6 lg:border-x lg:border-border lg:px-8'
              : 'lg:col-span-8 lg:border-r lg:border-border/60 lg:pr-10',
          )}
        >
          {/* Subtle, low-contrast input surface so it doesn't dominate */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 pb-3 space-y-5 text-foreground/90">
            {inputs}
          </div>
          {/* Footer - always anchored at the bottom of the viewport */}
          <div className="shrink-0 flex items-center justify-between gap-4 pt-3 border-t border-border bg-background">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground">
              {t('sandbox.back')}
            </Button>
            <div className="flex items-center justify-end gap-4">
              {!hasScenarios && onResetAll && (
                <button
                  onClick={onResetAll}
                  className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4 hover:no-underline"
                >
                  {t('sandboxTabs.resetToBase')}
                </button>
              )}
              {onConfirm && (
                <Button onClick={onConfirm} disabled={confirmDisabled} className="h-9 rounded-full text-sm px-5">
                  {confirmLabel ?? t('sandboxTabs.confirmChanges')}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT - compliance */}
        <aside className={cn('flex flex-col min-h-0 overflow-y-auto', hasScenarios ? 'lg:col-span-3' : 'lg:col-span-4')}>
          {compliance}
        </aside>
      </div>
    </div>
  );
}
export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">
        {title}
      </h3>
      {hint && <p className="text-[11px] text-muted-foreground mb-5 leading-relaxed whitespace-nowrap">{hint}</p>}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export function NumField({
  label, value, onChange, min = 0, max, step = 1, unit, hint,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string; hint?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{label}</label>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
        className="h-8 w-full text-sm tabular-nums bg-transparent border-0 border-b border-border px-0 rounded-none focus:outline-none focus:border-foreground/60 transition-colors"
      />
      {hint && <p className="text-[10px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

export function YesNoToggle({
  label, value, onChange,
}: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="inline-flex rounded-full border border-border p-0.5">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'px-3 h-7 text-xs rounded-full transition-colors',
              value === opt ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt ? t('sandboxTabs.yes') : t('sandboxTabs.no')}
          </button>
        ))}
      </div>
    </div>
  );
}
