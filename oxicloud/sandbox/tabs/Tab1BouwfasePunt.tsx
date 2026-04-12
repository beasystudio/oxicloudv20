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

interface Tab1Props {
  onConfirm: () => void;
  onBack: () => void;
}

// AI Scenario cards data
const SCENARIOS = [
  {
    id: 'high',
    title: 'Maximale prefabricatie',
    badge: 'Hoog',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    summary: 'Verhoog prefabricatieniveau naar 72% en reduceer grondwerkvolume met 30%. Grootste emissiereductie, vereist aanpassing bouwplanning.',
    projected: 26.1,
    values: { prefabSlider: 72, grondwerkvolume: 1800 },
  },
  {
    id: 'mid',
    title: 'Geoptimaliseerde sloopfasering',
    badge: 'Gemiddeld',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    summary: 'Verlaag sloopoppervlakte naar 1.200 m² via gefaseerde aanpak. Combineer met 55% prefab voor conformiteit.',
    projected: 29.8,
    values: { prefabSlider: 55, sloopoppervlakte: 1200 },
  },
  {
    id: 'low',
    title: 'Minimale machineuren',
    badge: 'Laag',
    badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    summary: 'Reduceer operationele uren van de hydraulische graafmachine met 20%. Beperkte impact maar eenvoudig door te voeren.',
    projected: 31.4,
    values: { machines: DEFAULT_MACHINES.map(m => m.id === '1' ? { ...m, uren: 384 } : { ...m }) },
  },
];

function NumberField({ label, value, onChange, min = 0, max, unit, recommended, note }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; unit?: string; recommended?: number; note?: string;
}) {
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
      {isNeg && <p className="text-[10px] text-destructive">Waarde kan niet negatief zijn</p>}
      {recommended !== undefined && (
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
          Aanbevolen: {recommended.toLocaleString()} {unit}
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
  const { state, update, emissions, thresholds, remaining, progress, isCompliant } = useSandbox();
  const src = 'bouwfase_punt' as const;
  const [pendingScenario, setPendingScenario] = useState<typeof SCENARIOS[0] | null>(null);

  const seedEmission = useMemo(() => calcPointSourceConstruction(DEFAULT_MACHINES), []);

  const handleApplyScenario = (scenario: typeof SCENARIOS[0]) => {
    setPendingScenario(scenario);
  };

  const confirmScenario = () => {
    if (!pendingScenario) return;
    update({ ...pendingScenario.values, tab1Mode: 'guided' } as any);
    setPendingScenario(null);
    toast.success('Scenariowaarden geladen');
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
      toast.info('Expert-aanpassingen worden niet overgenomen.', { duration: 4000 });
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
    toast.success('Aanbevolen waarden toegepast');
  };

  const addMachineRow = () => {
    const newId = String(Date.now());
    update({
      machines: [
        ...state.machines,
        { id: newId, machine: 'Nieuwe machine', aantal: 1, uren: 100, emissionFactor: 0.03 },
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
          AI Scenario's
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

      {/* Scenario confirmation toast */}
      {pendingScenario && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between"
        >
          <p className="text-sm text-foreground">Scenariowaarden laden in Sandbox? - <strong>{pendingScenario.title}</strong></p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPendingScenario(null)}>Annuleren</Button>
            <Button size="sm" onClick={confirmScenario}>Bevestigen</Button>
          </div>
        </motion.div>
      )}

      {/* Split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left panel - inputs */}
        <div className="lg:col-span-3 space-y-5">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 w-fit">
            <button
              onClick={() => handleModeSwitch('guided')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                state.tab1Mode === 'guided' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Begeleide optimalisatie
            </button>
            <button
              onClick={() => handleModeSwitch('expert')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                state.tab1Mode === 'expert' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Expert-modus
            </button>
          </div>

          {state.tab1Mode === 'guided' ? (
            <div className="space-y-5">
              {/* OxiCloud recommendation banner */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">OxiCloud Aanbeveling</p>
                    <p className="text-[11px] text-muted-foreground">Pas geoptimaliseerde waarden toe om conformiteit te bereiken</p>
                  </div>
                </div>
                <Button size="sm" variant="default" onClick={handleApplyRecommendations} className="text-xs h-8">
                  Suggesties toepassen
                </Button>
              </div>

              {/* Prefab slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Prefabricatieniveau</label>
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
                  {/* Recommended marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 rounded-full pointer-events-none"
                    style={{ left: `${(RECOMMENDED.prefab_percentage / 80) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Aanbevolen: {RECOMMENDED.prefab_percentage}%</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                  Opgelet: dit percentage wordt ook gebruikt in de berekeningen voor Lijnbron LV en HV.
                </p>
              </div>

              {/* Parameter fields */}
              <div className="grid grid-cols-2 gap-4">
                <NumberField
                  label="Sloopoppervlakte" value={state.sloopoppervlakte}
                  onChange={v => update({ sloopoppervlakte: v })}
                  max={10000} unit="m²" recommended={RECOMMENDED.sloopoppervlakte}
                />
                <NumberField
                  label="Nieuwe verharding" value={state.nieuwe_verharding}
                  onChange={v => update({ nieuwe_verharding: v })}
                  max={5000} unit="m²" recommended={RECOMMENDED.nieuwe_verharding}
                />
                <NumberField
                  label="Diepte bouwput" value={state.diepte_bouwput}
                  onChange={v => update({ diepte_bouwput: v })}
                  max={20} unit="m"
                />
                <NumberField
                  label="Grondwerkvolume" value={state.grondwerkvolume}
                  onChange={v => update({ grondwerkvolume: v })}
                  max={10000} unit="m³" recommended={RECOMMENDED.grondwerkvolume}
                />
                <NumberField
                  label="Terrein ophoging" value={state.terrein_ophoging}
                  onChange={v => update({ terrein_ophoging: v })}
                  max={5000} unit="m³"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Expert info banners */}
              <div className="rounded-xl border border-border bg-muted/30 p-3 flex items-center gap-3">
                <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">Input emissies: {seedEmission.toFixed(1)} kg NOₓ - Zelfde als begeleide modus</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">U overschrijft OxiCloud-standaarden. U bent verantwoordelijk voor de ingevoerde gegevens.</p>
              </div>

              {/* Machine table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-muted/30 px-4 py-2.5 border-b border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Materieelinventaris</h4>
                </div>
                <div className="divide-y divide-border">
                  <div className="grid grid-cols-[1fr_80px_80px_40px] gap-3 px-4 py-2 bg-muted/20">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Machine</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Aantal</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Uren</span>
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
                    <Plus className="h-3 w-3" /> Rij toevoegen
                  </button>
                </div>
              </div>

              {/* Reason textarea */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Reden voor afwijking van OxiCloud-standaard</label>
                <Textarea
                  value={state.expertReason}
                  onChange={e => update({ expertReason: e.target.value })}
                  placeholder="Beschrijf waarom u afwijkt van de standaard berekening..."
                  className="min-h-[80px] text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Minimaal 20 tekens vereist - {state.expertReason.length} tekens ingevoerd
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1.5">
                <RotateCcw className="h-3 w-3" /> Reset naar basis
              </Button>
              <Button variant="ghost" size="sm" onClick={onBack} className="text-xs gap-1.5">
                <ArrowLeft className="h-3 w-3" /> Terug
              </Button>
            </div>
            <Button
              size="sm"
              onClick={onConfirm}
              disabled={state.tab1Mode === 'expert' && state.expertReason.length < 20}
              className="text-xs"
            >
              {state.tab1Mode === 'expert' ? 'Toepassen op project' : 'Wijzigingen bevestigen'}
            </Button>
          </div>
        </div>

        {/* Right panel - projection */}
        <div className="lg:col-span-2">
          <CompliancePanel
            label="Emissieprojectie"
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
