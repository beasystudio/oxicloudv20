import { useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSandbox } from '../SandboxWorkspace';
import { CompliancePanel } from '../CompliancePanel';
import { SEEDS, DEFAULT_MACHINES, MachineRow, calcPointSourceConstruction } from '../sandboxConstants';
import { useLanguage } from '@/i18n/LanguageContext';

interface Tab1Props {
  onConfirm: () => void;
  onBack: () => void;
}

function ExpertMachineBlock({
  title,
  hint,
  restoreLabel,
  machinesDirty,
  onRestore,
  children,
}: {
  title: string;
  hint: string;
  restoreLabel: string;
  machinesDirty: boolean;
  onRestore: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pt-3">
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              className={cn(
                "group w-full flex items-center justify-between gap-3 rounded-full px-4 py-2.5",
                "bg-muted/40 hover:bg-muted/70 transition-colors",
                open && "bg-muted/70"
              )}
            >
              <span className="flex items-center gap-2 text-[12px] font-medium text-foreground">
                <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{title}</span>
                {machinesDirty && (
                  <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                )}
              </span>
              <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="hidden sm:inline">{open ? 'Hide' : 'Tweak'}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
                    open && "rotate-180"
                  )}
                />
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[260px] text-xs">
            {hint}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          {open && machinesDirty && (
            <div className="flex justify-end mb-2">
              <button
                onClick={onRestore}
                className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4 hover:no-underline"
              >
                {restoreLabel}
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, min = 0, max, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; unit?: string;
}) {
  const isNeg = value < 0;
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={e => onChange(Math.max(min, Number(e.target.value)))}
          min={min}
          max={max}
          className={cn(
            "h-8 text-sm tabular-nums rounded-md bg-background border-border/70",
            unit && "pr-9",
            isNeg && "border-destructive"
          )}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/70 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function Tab1BouwfasePunt({ onConfirm, onBack }: Tab1Props) {
  const { t } = useLanguage();
  const { state, update, emissions, thresholds, remaining, progress, isCompliant } = useSandbox();
  const src = 'bouwfase_punt' as const;
  const lastRemovedRef = useRef<{ machine: MachineRow; index: number } | null>(null);

  const SCENARIOS = useMemo(() => [
    {
      id: 'high',
      title: t('sandboxTabs.maxPrefab'),
      summary: t('sandboxTabs.maxPrefabSummary'),
      projected: 26.1,
      values: { prefabSlider: 72, grondwerkvolume: 1800 } as any,
    },
    {
      id: 'mid',
      title: t('sandboxTabs.optimizedPhasing'),
      summary: t('sandboxTabs.optimizedPhasingSummary'),
      projected: 29.8,
      values: { prefabSlider: 55, sloopoppervlakte: 1200 } as any,
    },
    {
      id: 'low',
      title: t('sandboxTabs.minMachineHours'),
      summary: t('sandboxTabs.minMachineHoursSummary'),
      projected: 31.4,
      values: {
        machines: state.machines.map(m =>
          m.id === '1' ? { ...m, uren: Math.round(m.uren * 0.8) } : { ...m }
        ),
      } as any,
    },
  ], [t, state.machines]);

  const seedEmission = useMemo(() => calcPointSourceConstruction(DEFAULT_MACHINES), []);

  // Detect active scenario (only the param-based ones)
  const activeScenarioId = useMemo(() => {
    if (state.prefabSlider === 72 && state.grondwerkvolume === 1800) return 'high';
    if (state.prefabSlider === 55 && state.sloopoppervlakte === 1200) return 'mid';
    return null;
  }, [state.prefabSlider, state.grondwerkvolume, state.sloopoppervlakte]);

  const handleApplyScenario = (scenario: typeof SCENARIOS[0]) => {
    update({ ...scenario.values });
    toast.success(scenario.title, { duration: 1800 });
  };

  const handleReset = () => {
    update({
      prefabSlider: 40,
      sloopoppervlakte: SEEDS.sloopoppervlakte,
      nieuwe_verharding: SEEDS.nieuwe_verharding,
      diepte_bouwput: SEEDS.diepte_bouwput,
      grondwerkvolume: SEEDS.grondwerkvolume,
      terrein_ophoging: SEEDS.terrein_ophoging,
      machines: DEFAULT_MACHINES.map(m => ({ ...m })),
      expertReason: '',
    });
  };

  const handleRestoreMachines = () => {
    update({ machines: DEFAULT_MACHINES.map(m => ({ ...m })) });
    toast.success(t('sandboxTabs.machinesRestored'), { duration: 1800 });
  };

  const removeMachineRow = (id: string) => {
    const idx = state.machines.findIndex(m => m.id === id);
    if (idx < 0) return;
    const removed = state.machines[idx];
    lastRemovedRef.current = { machine: { ...removed }, index: idx };
    update({ machines: state.machines.filter(m => m.id !== id) });
    toast(t('sandboxTabs.machineRemoved'), {
      duration: 4000,
      action: {
        label: t('sandboxTabs.undo'),
        onClick: () => {
          const r = lastRemovedRef.current;
          if (!r) return;
          const next = [...state.machines.filter(m => m.id !== id)];
          next.splice(r.index, 0, r.machine);
          update({ machines: next });
          lastRemovedRef.current = null;
        },
      },
    });
  };

  const updateMachine = (id: string, field: keyof MachineRow, value: any) => {
    update({
      machines: state.machines.map(m =>
        m.id === id ? { ...m, [field]: field === 'machine' ? value : Math.max(0, Number(value)) } : m
      ),
    });
  };

  const machinesDirty = state.machines.length !== DEFAULT_MACHINES.length
    || state.machines.some((m, i) => {
      const d = DEFAULT_MACHINES[i];
      return !d || d.id !== m.id || d.aantal !== m.aantal || d.uren !== m.uren;
    });

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <div className="h-full min-h-0 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT: AI Scenarios ── */}
        <aside className="lg:col-span-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t('sandboxTabs.aiScenarios')}
            </h3>
            <button
              onClick={handleReset}
              className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4 hover:no-underline"
            >
              {t('sandboxTabs.resetToBase')}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
            {t('sandboxTabs.applyOptimizedValues')}
          </p>
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            {SCENARIOS.map((sc) => {
              const active = activeScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleApplyScenario(sc)}
                  className={cn(
                    "text-left px-3.5 py-3 border rounded-lg transition-all",
                    active
                      ? "border-foreground/30 bg-muted/40"
                      : "border-border hover:border-foreground/30 hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-[13px] font-medium text-foreground leading-snug">{sc.title}</h4>
                    <span className="text-[11px] tabular-nums text-muted-foreground whitespace-nowrap mt-0.5">
                      {sc.projected}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                    {sc.summary}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground/70 italic mt-4 leading-relaxed">
            {t('sandboxTabs.combineHint')}
          </p>
        </aside>

        {/* ── CENTER: Inputs (combined) ── */}
        <section className="lg:col-span-5 flex flex-col min-h-0 lg:border-x lg:border-border lg:px-8">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 pb-3 space-y-5">
            {/* GUIDED block */}
            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">
                {t('sandboxTabs.guidedOptimization')}
              </h3>
              <div className="space-y-4">
                {/* Prefab slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-muted-foreground">{t('sandboxTabs.prefabLevel')}</label>
                    <span className="text-sm tabular-nums text-foreground">{state.prefabSlider}%</span>
                  </div>
                  <div className="relative [&_[role=slider]]:!border-muted-foreground/35 [&_.bg-primary]:!bg-muted-foreground/25 [&_.bg-secondary]:!bg-muted/80">
                    <Slider
                      value={[state.prefabSlider]}
                      onValueChange={([v]) => update({ prefabSlider: v })}
                      min={0}
                      max={80}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Number fields */}
                <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                  <NumberField label={t('sandboxTabs.demolitionSurface')} value={state.sloopoppervlakte}
                    onChange={v => update({ sloopoppervlakte: v })} max={10000} unit="m²" />
                  <NumberField label={t('sandboxTabs.newPaving')} value={state.nieuwe_verharding}
                    onChange={v => update({ nieuwe_verharding: v })} max={5000} unit="m²" />
                  <NumberField label={t('sandboxTabs.excavationDepth')} value={state.diepte_bouwput}
                    onChange={v => update({ diepte_bouwput: v })} max={20} unit="m" />
                  <NumberField label={t('sandboxTabs.earthworkVolume')} value={state.grondwerkvolume}
                    onChange={v => update({ grondwerkvolume: v })} max={10000} unit="m³" />
                  <NumberField label={t('sandboxTabs.terrainElevation')} value={state.terrein_ophoging}
                    onChange={v => update({ terrein_ophoging: v })} max={5000} unit="m³" />
                </div>
              </div>
            </div>

            {/* EXPERT block - machines (collapsible) */}
            <ExpertMachineBlock
              machinesDirty={machinesDirty}
              onRestore={handleRestoreMachines}
              title={`${t('sandboxTabs.expertMode')} · ${t('sandboxTabs.equipmentInventory')}`}
              hint={t('sandboxTabs.deviationPlaceholder')}
              restoreLabel={t('sandboxTabs.restoreMachines')}
            >
              <div className="rounded-lg border border-border/70 bg-background overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_80px_60px] gap-3 px-3 py-2 border-b border-border bg-muted/20">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('sandboxTabs.machine')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-center">{t('sandboxTabs.quantity')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground text-center">{t('sandboxTabs.hours')}</span>
                  <span />
                </div>
                {state.machines.map((m, i) => (
                  <div
                    key={m.id}
                    className={cn(
                      "grid grid-cols-[1fr_80px_80px_60px] gap-3 px-3 py-1.5 items-center",
                      i !== state.machines.length - 1 && "border-b border-border/60"
                    )}
                  >
                    <span className="text-[12px] text-foreground/90 truncate">{m.machine}</span>
                    <Input
                      type="number" value={m.aantal} min={0} max={20}
                      onChange={e => updateMachine(m.id, 'aantal', e.target.value)}
                      className="h-6 text-[12px] tabular-nums rounded-md px-2 text-center bg-muted/30 border-transparent hover:border-border focus-visible:border-border"
                    />
                    <Input
                      type="number" value={m.uren} min={0} max={2000}
                      onChange={e => updateMachine(m.id, 'uren', e.target.value)}
                      className="h-6 text-[12px] tabular-nums rounded-md px-2 text-center bg-muted/30 border-transparent hover:border-border focus-visible:border-border"
                    />
                    <button
                      onClick={() => removeMachineRow(m.id)}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors text-right"
                    >
                      {t('compliancePanel.remove')}
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 mt-3">
                <label className="text-[11px] text-muted-foreground">{t('sandboxTabs.deviationReason')}</label>
                <Textarea
                  value={state.expertReason}
                  onChange={e => update({ expertReason: e.target.value })}
                  placeholder={t('sandboxTabs.deviationPlaceholder')}
                  className="min-h-[56px] text-sm rounded-md bg-background border-border/70 leading-relaxed"
                />
              </div>
            </ExpertMachineBlock>
          </div>

          {/* Footer actions */}
          <div className="shrink-0 flex items-center justify-between pt-3 border-t border-border bg-background">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
            >
              {t('sandbox.back')}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={machinesDirty && state.expertReason.length < 20}
              className="h-9 rounded-full text-sm px-5"
            >
              {t('sandboxTabs.confirmChanges')}
            </Button>
          </div>
        </section>

        {/* ── RIGHT: Compliance ── */}
        <aside className="lg:col-span-4 flex flex-col min-h-0 overflow-y-auto">
          <CompliancePanel
            label={t('sandboxTabs.emissionProjectionLabel')}
            threshold={thresholds[src]}
            currentEmission={emissions[src]}
            remaining={remaining[src]}
            progress={progress[src]}
            isCompliant={isCompliant[src]}
            beforeValue={seedEmission}
          />
        </aside>
      </div>
    </div>
  );
}
