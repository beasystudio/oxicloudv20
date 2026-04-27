import { useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSandbox } from '../SandboxWorkspace';
import { CompliancePanel } from '../CompliancePanel';
import { SEEDS, DEFAULT_MACHINES, MachineRow, calcPointSourceConstruction } from '../sandboxConstants';
import { useLanguage } from '@/i18n/LanguageContext';

interface Tab1Props {
  onConfirm: () => void;
  onBack: () => void;
}

function NumberField({ label, value, onChange, min = 0, max, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; unit?: string;
}) {
  const isNeg = value < 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{label}</label>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      <Input
        type="number"
        value={value}
        onChange={e => onChange(Math.max(min, Number(e.target.value)))}
        min={min}
        max={max}
        className={cn("h-8 text-sm tabular-nums rounded-md", isNeg && "border-destructive")}
      />
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
    <div className="h-[calc(100vh-49px)] overflow-hidden">
      <div className="h-full max-w-[1400px] mx-auto px-8 py-5 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT: AI Scenarios ── */}
        <aside className="lg:col-span-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
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
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {t('sandboxTabs.applyOptimizedValues')}
          </p>
          <div className="flex flex-col gap-2 flex-1 min-h-0">
            {SCENARIOS.map((sc) => {
              const active = activeScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleApplyScenario(sc)}
                  className={cn(
                    "text-left p-3 border rounded-md transition-all",
                    active
                      ? "border-foreground bg-foreground/[0.03]"
                      : "border-border hover:border-foreground/40 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm text-foreground leading-tight">{sc.title}</h4>
                    <span className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
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
          <p className="text-[10px] text-muted-foreground/80 italic mt-3 leading-relaxed">
            {t('sandboxTabs.combineHint')}
          </p>
        </aside>

        {/* ── CENTER: Inputs (combined) ── */}
        <section className="lg:col-span-6 flex flex-col min-h-0 lg:border-x lg:border-border lg:px-8">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 space-y-6">
            {/* GUIDED block */}
            <div>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">
                {t('sandboxTabs.guidedOptimization')}
              </h3>
              <div className="space-y-4">
                {/* Prefab slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">{t('sandboxTabs.prefabLevel')}</label>
                    <span className="text-sm tabular-nums text-foreground">{state.prefabSlider}%</span>
                  </div>
                  <div className="relative [&_[role=slider]]:!border-foreground/40 [&_.bg-primary]:!bg-foreground/30 [&_.bg-secondary]:!bg-muted">
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

            {/* EXPERT block — machines */}
            <div className="border-t border-border pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {t('sandboxTabs.expertMode')} · {t('sandboxTabs.equipmentInventory')}
                </h3>
                {machinesDirty && (
                  <button
                    onClick={handleRestoreMachines}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4 hover:no-underline"
                  >
                    {t('sandboxTabs.restoreMachines')}
                  </button>
                )}
              </div>

              <div>
                <div className="grid grid-cols-[1fr_70px_70px_50px] gap-2 py-1.5 border-b border-border">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('sandboxTabs.machine')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('sandboxTabs.quantity')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('sandboxTabs.hours')}</span>
                  <span />
                </div>
                {state.machines.map(m => (
                  <div key={m.id} className="grid grid-cols-[1fr_70px_70px_50px] gap-2 py-1.5 items-center border-b border-border">
                    <span className="text-sm text-foreground truncate">{m.machine}</span>
                    <Input
                      type="number" value={m.aantal} min={0} max={20}
                      onChange={e => updateMachine(m.id, 'aantal', e.target.value)}
                      className="h-8 text-sm tabular-nums rounded-md"
                    />
                    <Input
                      type="number" value={m.uren} min={0} max={2000}
                      onChange={e => updateMachine(m.id, 'uren', e.target.value)}
                      className="h-8 text-sm tabular-nums rounded-md"
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

              <div className="space-y-1.5 mt-4">
                <label className="text-xs text-muted-foreground">{t('sandboxTabs.deviationReason')}</label>
                <Textarea
                  value={state.expertReason}
                  onChange={e => update({ expertReason: e.target.value })}
                  placeholder={t('sandboxTabs.deviationPlaceholder')}
                  className="min-h-[56px] text-sm rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground">
              {t('sandboxTabs.back')}
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
        <aside className="lg:col-span-3 flex flex-col min-h-0 overflow-y-auto">
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
