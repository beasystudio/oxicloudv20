import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, RotateCcw, ArrowLeft, ChevronRight, Plus, Trash2, AlertTriangle, Info, Lightbulb } from 'lucide-react';
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
        <label className="text-xs font-medium text-foreground">{label}</label>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      <Input
        type="number"
        value={value}
        onChange={e => onChange(Math.max(min, Number(e.target.value)))}
        min={min}
        max={max}
        className={cn("h-9 text-sm tabular-nums", isNeg && "border-destructive")}
      />
      {isNeg && <p className="text-[10px] text-destructive">{t('sandboxTabs.valueCannotBeNegative')}</p>}
      {recommended !== undefined && (
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
          {t('sandboxTabs.recommended')} {recommended.toLocaleString()} {unit}
        </p>
      )}
      {note && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          {note}
        </p>
      )}
    </div>
  );
}

export function Tab1BouwfasePunt({ onConfirm, onBack }: Tab1Props) {
  const { t } = useLanguage();
  const { state, update, emissions, thresholds, remaining, progress, isCompliant } = useSandbox();
  const src = 'bouwfase_punt' as const;
  const [pendingScenario, setPendingScenario] = useState<{ id: string; title: string; badge: string; badgeColor: string; summary: string; projected: number; values: any } | null>(null);

  const SCENARIOS = useMemo(() => [
    {
      id: 'high',
      title: t('sandboxTabs.maxPrefab'),
      badge: t('sandboxTabs.maxPrefabBadge'),
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      summary: t('sandboxTabs.maxPrefabSummary'),
      projected: 26.1,
      values: { prefabSlider: 72, grondwerkvolume: 1800 },
    },
    {
      id: 'mid',
      title: t('sandboxTabs.optimizedPhasing'),
      badge: t('sandboxTabs.optimizedPhasingBadge'),
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      summary: t('sandboxTabs.optimizedPhasingSummary'),
      projected: 29.8,
      values: { prefabSlider: 55, sloopoppervlakte: 1200 },
    },
    {
      id: 'low',
      title: t('sandboxTabs.minMachineHours'),
      badge: t('sandboxTabs.minMachineHoursBadge'),
      badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
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
    <div className="p-5 space-y-5">
      {/* AI Scenario Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {t('sandboxTabs.aiScenarios')}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              onClick={() => handleApplyScenario(sc)}
              className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase", sc.badgeColor)}>{sc.badge}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">{sc.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{sc.summary}</p>
              <p className="text-xs font-bold tabular-nums text-foreground">{sc.projected} kg NOₓ</p>
            </button>
          ))}
        </div>
      </div>

      {pendingScenario && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between"
        >
          <p className="text-sm text-foreground">{t('sandboxTabs.loadScenarioValues')} <strong>{pendingScenario.title}</strong></p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPendingScenario(null)}>{t('sandboxTabs.cancel')}</Button>
            <Button size="sm" onClick={confirmScenario}>{t('sandboxTabs.confirm')}</Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 w-fit">
            <button
              onClick={() => handleModeSwitch('guided')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                state.tab1Mode === 'guided' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t('sandboxTabs.guidedOptimization')}
            </button>
            <button
              onClick={() => handleModeSwitch('expert')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                state.tab1Mode === 'expert' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t('sandboxTabs.expertMode')}
            </button>
          </div>

          {state.tab1Mode === 'guided' ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t('sandboxTabs.oxicloudRecommendation')}</p>
                    <p className="text-[11px] text-muted-foreground">{t('sandboxTabs.applyOptimizedValues')}</p>
                  </div>
                </div>
                <Button size="sm" variant="default" onClick={handleApplyRecommendations} className="text-xs h-8">
                  {t('sandboxTabs.applySuggestions')}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">{t('sandboxTabs.prefabLevel')}</label>
                  <span className="text-xs font-bold tabular-nums text-foreground">{state.prefabSlider}%</span>
                </div>
                <div className="relative">
                  <Slider
                    value={[state.prefabSlider]}
                    onValueChange={([v]) => update({ prefabSlider: v })}
                    min={0}
                    max={80}
                    step={1}
                    className="w-full"
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 rounded-full pointer-events-none"
                    style={{ left: `${(RECOMMENDED.prefab_percentage / 80) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t('sandboxTabs.prefabRecommended').replace('{value}', String(RECOMMENDED.prefab_percentage))}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                  {t('sandboxTabs.prefabWarning')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-center gap-3">
                <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">{t('sandboxTabs.inputEmissionsLabel').replace('{value}', seedEmission.toFixed(1))}</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">{t('sandboxTabs.expertDisclaimer')}</p>
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2.5 border-b border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('sandboxTabs.equipmentInventory')}</h4>
                </div>
                <div className="divide-y divide-border">
                  <div className="grid grid-cols-[1fr_80px_80px_40px] gap-3 px-4 py-2 bg-muted/20">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('sandboxTabs.machine')}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('sandboxTabs.quantity')}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('sandboxTabs.hours')}</span>
                    <span />
                  </div>
                  {state.machines.map(m => (
                    <div key={m.id} className="grid grid-cols-[1fr_80px_80px_40px] gap-3 px-4 py-2 items-center">
                      <span className="text-sm text-foreground">{m.machine}</span>
                      <Input
                        type="number" value={m.aantal} min={0} max={20}
                        onChange={e => updateMachine(m.id, 'aantal', e.target.value)}
                        className="h-8 text-xs tabular-nums"
                      />
                      <Input
                        type="number" value={m.uren} min={0} max={2000}
                        onChange={e => updateMachine(m.id, 'uren', e.target.value)}
                        className="h-8 text-xs tabular-nums"
                      />
                      <button onClick={() => removeMachineRow(m.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <button onClick={addMachineRow} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                    <Plus className="h-3 w-3" /> {t('sandboxTabs.addRow')}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">{t('sandboxTabs.deviationReason')}</label>
                <Textarea
                  value={state.expertReason}
                  onChange={e => update({ expertReason: e.target.value })}
                  placeholder={t('sandboxTabs.deviationPlaceholder')}
                  className="min-h-[80px] text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  {t('sandboxTabs.minCharsRequired').replace('{count}', String(state.expertReason.length))}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1.5">
                <RotateCcw className="h-3 w-3" /> {t('sandboxTabs.resetToBase')}
              </Button>
              <Button variant="ghost" size="sm" onClick={onBack} className="text-xs gap-1.5">
                <ArrowLeft className="h-3 w-3" /> {t('sandboxTabs.back')}
              </Button>
            </div>
            <Button
              size="sm"
              onClick={onConfirm}
              disabled={state.tab1Mode === 'expert' && state.expertReason.length < 20}
              className="text-xs"
            >
              {state.tab1Mode === 'expert' ? t('sandboxTabs.applyToProject') : t('sandboxTabs.confirmChanges')}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
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