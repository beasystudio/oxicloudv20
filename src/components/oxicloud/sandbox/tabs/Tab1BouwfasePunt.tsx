import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSandbox } from '../SandboxWorkspace';
import { CompliancePanel } from '../CompliancePanel';
import { SEEDS, RECOMMENDED, DEFAULT_MACHINES, MachineRow, calcPointSourceConstruction } from '../sandboxConstants';
import { useLanguage } from '@/i18n/LanguageContext';

interface Tab1Props {
  onConfirm: () => void;
  onBack: () => void;
}

function NumberField({ label, value, onChange, min = 0, max, unit, recommended, note }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; unit?: string; recommended?: number; note?: string;
}) {
  const { t } = useLanguage();
  const isNeg = value < 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm text-foreground">{label}</label>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      <Input
        type="number"
        value={value}
        onChange={e => onChange(Math.max(min, Number(e.target.value)))}
        min={min}
        max={max}
        className={cn("h-10 text-sm tabular-nums rounded-md", isNeg && "border-destructive")}
      />
      {isNeg && <p className="text-xs text-destructive">{t('sandboxTabs.valueCannotBeNegative')}</p>}
      {recommended !== undefined && (
        <p className="text-xs text-muted-foreground">
          {t('sandboxTabs.recommended')} {recommended.toLocaleString()} {unit}
        </p>
      )}
      {note && (
        <p className="text-xs text-muted-foreground">{note}</p>
      )}
    </div>
  );
}

export function Tab1BouwfasePunt({ onConfirm, onBack }: Tab1Props) {
  const { t } = useLanguage();
  const { state, update, emissions, thresholds, remaining, progress, isCompliant } = useSandbox();
  const src = 'bouwfase_punt' as const;
  const [pendingScenario, setPendingScenario] = useState<{ id: string; title: string; summary: string; projected: number; values: any } | null>(null);

  const SCENARIOS = useMemo(() => [
    {
      id: 'high',
      title: t('sandboxTabs.maxPrefab'),
      summary: t('sandboxTabs.maxPrefabSummary'),
      projected: 26.1,
      values: { prefabSlider: 72, grondwerkvolume: 1800 },
    },
    {
      id: 'mid',
      title: t('sandboxTabs.optimizedPhasing'),
      summary: t('sandboxTabs.optimizedPhasingSummary'),
      projected: 29.8,
      values: { prefabSlider: 55, sloopoppervlakte: 1200 },
    },
    {
      id: 'low',
      title: t('sandboxTabs.minMachineHours'),
      summary: t('sandboxTabs.minMachineHoursSummary'),
      projected: 31.4,
      values: { machines: DEFAULT_MACHINES.map(m => m.id === '1' ? { ...m, uren: 384 } : { ...m }) },
    },
  ], [t]);

  const seedEmission = useMemo(() => calcPointSourceConstruction(DEFAULT_MACHINES), []);

  const handleApplyScenario = (scenario: typeof SCENARIOS[0]) => {
    setPendingScenario(scenario);
  };

  const confirmScenario = () => {
    if (!pendingScenario) return;
    update({ ...pendingScenario.values, tab1Mode: 'guided' } as any);
    setPendingScenario(null);
    toast.success(t('sandboxTabs.scenarioValuesLoaded'));
  };

  const handleModeSwitch = (mode: 'guided' | 'expert') => {
    if (mode === 'guided' && state.tab1Mode === 'expert') {
      update({
        tab1Mode: 'guided',
        prefabSlider: 40,
        sloopoppervlakte: SEEDS.sloopoppervlakte,
        nieuwe_verharding: SEEDS.nieuwe_verharding,
        grondwerkvolume: SEEDS.grondwerkvolume,
        terrein_ophoging: SEEDS.terrein_ophoging,
        diepte_bouwput: SEEDS.diepte_bouwput,
      });
      toast.info(t('sandboxTabs.expertNotCarried'), { duration: 4000 });
    } else {
      update({ tab1Mode: mode });
    }
  };

  const handleReset = () => {
    if (state.tab1Mode === 'guided') {
      update({
        prefabSlider: 40,
        sloopoppervlakte: SEEDS.sloopoppervlakte,
        nieuwe_verharding: SEEDS.nieuwe_verharding,
        diepte_bouwput: SEEDS.diepte_bouwput,
        grondwerkvolume: SEEDS.grondwerkvolume,
        terrein_ophoging: SEEDS.terrein_ophoging,
      });
    } else {
      update({ machines: DEFAULT_MACHINES.map(m => ({ ...m })), expertReason: '' });
    }
  };

  const handleApplyRecommendations = () => {
    update({
      prefabSlider: RECOMMENDED.prefab_percentage,
      sloopoppervlakte: RECOMMENDED.sloopoppervlakte,
      nieuwe_verharding: RECOMMENDED.nieuwe_verharding,
      grondwerkvolume: RECOMMENDED.grondwerkvolume,
    });
    toast.success(t('sandboxTabs.recommendedValuesApplied'));
  };

  const addMachineRow = () => {
    const newId = String(Date.now());
    update({
      machines: [
        ...state.machines,
        { id: newId, machine: 'New machine', aantal: 1, uren: 100, emissionFactor: 0.03 },
      ],
    });
  };

  const removeMachineRow = (id: string) => {
    update({ machines: state.machines.filter(m => m.id !== id) });
  };

  const updateMachine = (id: string, field: keyof MachineRow, value: any) => {
    update({
      machines: state.machines.map(m =>
        m.id === id ? { ...m, [field]: field === 'machine' ? value : Math.max(0, Number(value)) } : m
      ),
    });
  };

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto space-y-10">
      {/* AI Scenarios — single unified suggestion section */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('sandboxTabs.aiScenarios')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{t('sandboxTabs.applyOptimizedValues')}</p>
          </div>
          <button
            onClick={handleApplyRecommendations}
            className="text-xs text-foreground underline underline-offset-4 hover:no-underline"
          >
            {t('sandboxTabs.applySuggestions')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleApplyScenario(sc)}
              className="text-left p-5 border-b border-border md:border-b-0 md:border-r last:md:border-r-0 hover:bg-muted/40 transition-colors"
            >
              <h4 className="text-sm text-foreground mb-1.5">{sc.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{sc.summary}</p>
              <p className="text-sm tabular-nums text-foreground">{sc.projected} kg NOₓ</p>
            </button>
          ))}
        </div>
      </section>

      {pendingScenario && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-y border-border py-3 px-4 flex items-center justify-between"
        >
          <p className="text-sm text-foreground">
            {t('sandboxTabs.loadScenarioValues')} <span className="font-medium">{pendingScenario.title}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPendingScenario(null)} className="h-8 rounded-full text-xs">
              {t('sandboxTabs.cancel')}
            </Button>
            <Button size="sm" onClick={confirmScenario} className="h-8 rounded-full text-xs">
              {t('sandboxTabs.confirm')}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* ── Left: inputs ── */}
        <div className="lg:col-span-3 space-y-8">
          {/* Mode switch — flat underline tabs */}
          <div className="flex items-center gap-6 border-b border-border">
            <button
              onClick={() => handleModeSwitch('guided')}
              className={cn(
                "pb-2 -mb-px border-b-2 text-sm transition-colors",
                state.tab1Mode === 'guided'
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t('sandboxTabs.guidedOptimization')}
            </button>
            <button
              onClick={() => handleModeSwitch('expert')}
              className={cn(
                "pb-2 -mb-px border-b-2 text-sm transition-colors",
                state.tab1Mode === 'expert'
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t('sandboxTabs.expertMode')}
            </button>
          </div>

          {state.tab1Mode === 'guided' ? (
            <div className="space-y-8">
              {/* Prefab slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">{t('sandboxTabs.prefabLevel')}</label>
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
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-muted-foreground pointer-events-none"
                    style={{ left: `${(RECOMMENDED.prefab_percentage / 80) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('sandboxTabs.prefabRecommended').replace('{value}', String(RECOMMENDED.prefab_percentage))}
                </p>
                <p className="text-xs text-muted-foreground">{t('sandboxTabs.prefabWarning')}</p>
              </div>

              {/* Number fields */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <NumberField
                  label={t('sandboxTabs.demolitionSurface')} value={state.sloopoppervlakte}
                  onChange={v => update({ sloopoppervlakte: v })}
                  max={10000} unit="m²" recommended={RECOMMENDED.sloopoppervlakte}
                />
                <NumberField
                  label={t('sandboxTabs.newPaving')} value={state.nieuwe_verharding}
                  onChange={v => update({ nieuwe_verharding: v })}
                  max={5000} unit="m²" recommended={RECOMMENDED.nieuwe_verharding}
                />
                <NumberField
                  label={t('sandboxTabs.excavationDepth')} value={state.diepte_bouwput}
                  onChange={v => update({ diepte_bouwput: v })}
                  max={20} unit="m"
                />
                <NumberField
                  label={t('sandboxTabs.earthworkVolume')} value={state.grondwerkvolume}
                  onChange={v => update({ grondwerkvolume: v })}
                  max={10000} unit="m³" recommended={RECOMMENDED.grondwerkvolume}
                />
                <NumberField
                  label={t('sandboxTabs.terrainElevation')} value={state.terrein_ophoging}
                  onChange={v => update({ terrein_ophoging: v })}
                  max={5000} unit="m³"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-xs text-muted-foreground">
                {t('sandboxTabs.inputEmissionsLabel').replace('{value}', seedEmission.toFixed(1))}
              </p>
              <p className="text-xs text-muted-foreground border-l-2 border-foreground/40 pl-3">
                {t('sandboxTabs.expertDisclaimer')}
              </p>

              {/* Equipment table — flat */}
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  {t('sandboxTabs.equipmentInventory')}
                </h4>
                <div className="border-t border-border">
                  <div className="grid grid-cols-[1fr_90px_90px_40px] gap-3 py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground">{t('sandboxTabs.machine')}</span>
                    <span className="text-xs text-muted-foreground">{t('sandboxTabs.quantity')}</span>
                    <span className="text-xs text-muted-foreground">{t('sandboxTabs.hours')}</span>
                    <span />
                  </div>
                  {state.machines.map(m => (
                    <div key={m.id} className="grid grid-cols-[1fr_90px_90px_40px] gap-3 py-2.5 items-center border-b border-border">
                      <span className="text-sm text-foreground">{m.machine}</span>
                      <Input
                        type="number" value={m.aantal} min={0} max={20}
                        onChange={e => updateMachine(m.id, 'aantal', e.target.value)}
                        className="h-9 text-sm tabular-nums rounded-md"
                      />
                      <Input
                        type="number" value={m.uren} min={0} max={2000}
                        onChange={e => updateMachine(m.id, 'uren', e.target.value)}
                        className="h-9 text-sm tabular-nums rounded-md"
                      />
                      <button
                        onClick={() => removeMachineRow(m.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors text-right"
                        aria-label={t('compliancePanel.remove')}
                      >
                        {t('compliancePanel.remove')}
                      </button>
                    </div>
                  ))}
                  <div className="py-2">
                    <button onClick={addMachineRow} className="text-xs text-foreground hover:underline">
                      + {t('sandboxTabs.addRow')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">{t('sandboxTabs.deviationReason')}</label>
                <Textarea
                  value={state.expertReason}
                  onChange={e => update({ expertReason: e.target.value })}
                  placeholder={t('sandboxTabs.deviationPlaceholder')}
                  className="min-h-[88px] text-sm rounded-md"
                />
                <p className="text-xs text-muted-foreground">
                  {t('sandboxTabs.minCharsRequired').replace('{count}', String(state.expertReason.length))}
                </p>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 rounded-full text-xs text-muted-foreground hover:text-foreground">
                {t('sandboxTabs.resetToBase')}
              </Button>
              <Button variant="ghost" size="sm" onClick={onBack} className="h-9 rounded-full text-xs text-muted-foreground hover:text-foreground">
                {t('sandboxTabs.back')}
              </Button>
            </div>
            <Button
              onClick={onConfirm}
              disabled={state.tab1Mode === 'expert' && state.expertReason.length < 20}
              className="h-10 rounded-full text-sm px-6"
            >
              {state.tab1Mode === 'expert' ? t('sandboxTabs.applyToProject') : t('sandboxTabs.confirmChanges')}
            </Button>
          </div>
        </div>

        {/* ── Right: compliance summary ── */}
        <div className="lg:col-span-2 lg:border-l lg:border-border lg:pl-12">
          <CompliancePanel
            label={t('sandboxTabs.emissionProjectionLabel')}
            threshold={thresholds[src]}
            currentEmission={emissions[src]}
            remaining={remaining[src]}
            progress={progress[src]}
            isCompliant={isCompliant[src]}
            beforeValue={seedEmission}
          />
        </div>
      </div>
    </div>
  );
}
