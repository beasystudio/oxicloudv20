import { useState, useMemo, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertTriangle, Check, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  SourceId, TAB_LABELS, SOURCE_LABELS, THRESHOLDS, SEEDS, DEFAULT_MACHINES,
  calcPointSourceConstruction, calcLineSourceConstruction, calcOperationPointEmission,
  calcLineSourceOperation, calcRemainingReduction, calcProgress, MachineRow,
} from './sandboxConstants';
import { Tab1BouwfasePunt } from './tabs/Tab1BouwfasePunt';
import { Tab2BouwfaseLijnLV } from './tabs/Tab2BouwfaseLijnLV';
import { Tab3BouwfaseLijnHV } from './tabs/Tab3BouwfaseLijnHV';
import { Tab4ExploitatiePunt } from './tabs/Tab4ExploitatiePunt';
import { Tab5ExploitatieLijnLV } from './tabs/Tab5ExploitatieLijnLV';
import { Tab6ExploitatieLijnHV } from './tabs/Tab6ExploitatieLijnHV';

// ── Shared sandbox state context ──
export interface SandboxState {
  // Tab 1
  prefabSlider: number; // 0-80 (percentage for display)
  sloopoppervlakte: number;
  nieuwe_verharding: number;
  diepte_bouwput: number;
  grondwerkvolume: number;
  terrein_ophoging: number;
  machines: MachineRow[];
  expertReason: string;
  tab1Mode: 'guided' | 'expert';
  // Tab 2/3 shared
  prefab_percentage: number; // 0-1 decimal
  lv_trips_rate: number;
  hv_trips_rate: number;
  // Tab 4 — op_ps screening gate (Spec §8.4)
  op_ps_combustion_present: boolean; // Q1
  operating_hours: number;           // Q2 derives: > 100h/yr
  // Tab 5/6 shared
  parking_spaces: number;
  modal_split_lv: number;
  lv_trips_rate_op: number;
  hv_trips_rate_op: number;
}

interface SandboxContextType {
  state: SandboxState;
  update: (partial: Partial<SandboxState>) => void;
  emissions: Record<SourceId, number>;
  thresholds: Record<SourceId, number>;
  overshoots: Record<SourceId, number>;
  remaining: Record<SourceId, number>;
  progress: Record<SourceId, number>;
  isCompliant: Record<SourceId, boolean>;
  projectCompliant: boolean;
  projectProgress: number;
  // SOM (Spec §3.1) — combined LV+HV pct of limit per pair
  cpLsSomPct: number;
  opLsSomPct: number;
  cpLsSomCompliant: boolean;
  opLsSomCompliant: boolean;
  // op_ps screening gate (Spec §8.4)
  opPsExcluded: boolean;
}

export const SandboxContext = createContext<SandboxContextType>(null!);
export const useSandbox = () => useContext(SandboxContext);

const INITIAL_STATE: SandboxState = {
  prefabSlider: 40,
  sloopoppervlakte: SEEDS.sloopoppervlakte,
  nieuwe_verharding: SEEDS.nieuwe_verharding,
  diepte_bouwput: SEEDS.diepte_bouwput,
  grondwerkvolume: SEEDS.grondwerkvolume,
  terrein_ophoging: SEEDS.terrein_ophoging,
  machines: DEFAULT_MACHINES.map(m => ({ ...m })),
  expertReason: '',
  tab1Mode: 'guided',
  prefab_percentage: SEEDS.prefab_percentage,
  lv_trips_rate: SEEDS.lv_trips_rate,
  hv_trips_rate: SEEDS.hv_trips_rate,
  op_ps_combustion_present: true,
  operating_hours: SEEDS.operating_hours,
  parking_spaces: SEEDS.parking_spaces,
  modal_split_lv: SEEDS.modal_split_lv,
  lv_trips_rate_op: SEEDS.lv_trips_rate_op,
  hv_trips_rate_op: SEEDS.hv_trips_rate_op,
};

// Which tabs to show - set to all 6 for mockup
const visibleSources: SourceId[] = [
  'bouwfase_punt',
  'bouwfase_lijn_lv',
  'bouwfase_lijn_hv',
  'exploitatie_punt',
  'exploitatie_lijn_lv',
  'exploitatie_lijn_hv',
];

interface SandboxWorkspaceProps {
  onComplete: () => void;
  onBack: () => void;
}

export function SandboxWorkspace({ onComplete, onBack }: SandboxWorkspaceProps) {
  const [state, setState] = useState<SandboxState>({ ...INITIAL_STATE });
  const [activeTab, setActiveTab] = useState<SourceId>(visibleSources[0]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = useCallback((partial: Partial<SandboxState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  // ── Compute all emissions ──
  const computed = useMemo(() => {
    const s = state;

    // Tab 1: Bouwfase Punt - guided uses parameterized model, expert uses machine table
    const bouwfasePuntEmission = s.tab1Mode === 'expert'
      ? calcPointSourceConstruction(s.machines)
      : calcPointSourceConstruction(DEFAULT_MACHINES); // In guided mode we apply parameter adjustments below

    // For guided mode, we model the effect of parameters as multipliers on the baseline
    const baselinePointEmission = calcPointSourceConstruction(DEFAULT_MACHINES.map(m => ({ ...m })));
    const prefabEffect = 1 - ((s.prefabSlider - 40) / 100) * 0.6; // higher prefab = less emission
    const sloopEffect = s.sloopoppervlakte / SEEDS.sloopoppervlakte;
    const verhardingEffect = s.nieuwe_verharding / SEEDS.nieuwe_verharding;
    const grondEffect = s.grondwerkvolume / SEEDS.grondwerkvolume;
    const guidedPointEmission = baselinePointEmission * prefabEffect * (0.3 + 0.7 * sloopEffect) * (0.2 + 0.8 * verhardingEffect) * (0.3 + 0.7 * grondEffect);

    const tab1Emission = s.tab1Mode === 'expert' ? bouwfasePuntEmission : guidedPointEmission;

    const tab2Emission = calcLineSourceConstruction(s.lv_trips_rate, 0.0021, s.prefab_percentage);
    const tab3Emission = calcLineSourceConstruction(s.hv_trips_rate, 0.014, s.prefab_percentage);
    // op_ps screening gate (Spec §8.4):
    // Q1: combustion system present? Q2: operating > 100 h/yr?
    // If either is false → op_ps = 0, excluded from ratios/recommendations.
    const opPsExcluded = !s.op_ps_combustion_present || s.operating_hours <= 100;
    const tab4Emission = opPsExcluded ? 0 : calcOperationPointEmission(60, s.operating_hours);
    const tab5Emission = calcLineSourceOperation(s.lv_trips_rate_op, 0.0021, s.modal_split_lv, s.parking_spaces);
    const tab6Emission = calcLineSourceOperation(s.hv_trips_rate_op, 0.014, 1 - s.modal_split_lv, s.parking_spaces);

    const emissions: Record<SourceId, number> = {
      bouwfase_punt: Math.round(tab1Emission * 10) / 10,
      bouwfase_lijn_lv: Math.round(tab2Emission * 10) / 10,
      bouwfase_lijn_hv: Math.round(tab3Emission * 10) / 10,
      exploitatie_punt: Math.round(tab4Emission * 10) / 10,
      exploitatie_lijn_lv: Math.round(tab5Emission * 10) / 10,
      exploitatie_lijn_hv: Math.round(tab6Emission * 10) / 10,
    };

    const thresholds = { ...THRESHOLDS };

    // Calculate original overshoots (at seed values)
    const seedTab1 = calcPointSourceConstruction(DEFAULT_MACHINES);
    const seedTab2 = calcLineSourceConstruction(SEEDS.lv_trips_rate, 0.0021, SEEDS.prefab_percentage);
    const seedTab3 = calcLineSourceConstruction(SEEDS.hv_trips_rate, 0.014, SEEDS.prefab_percentage);
    const seedTab4 = calcOperationPointEmission(60, SEEDS.operating_hours);
    const seedTab5 = calcLineSourceOperation(SEEDS.lv_trips_rate_op, 0.0021, SEEDS.modal_split_lv, SEEDS.parking_spaces);
    const seedTab6 = calcLineSourceOperation(SEEDS.hv_trips_rate_op, 0.014, 1 - SEEDS.modal_split_lv, SEEDS.parking_spaces);

    const seedEmissions: Record<SourceId, number> = {
      bouwfase_punt: seedTab1,
      bouwfase_lijn_lv: seedTab2,
      bouwfase_lijn_hv: seedTab3,
      exploitatie_punt: seedTab4,
      exploitatie_lijn_lv: seedTab5,
      exploitatie_lijn_hv: seedTab6,
    };

    const overshoots: Record<SourceId, number> = {} as any;
    const remaining: Record<SourceId, number> = {} as any;
    const progress: Record<SourceId, number> = {} as any;
    const isCompliant: Record<SourceId, boolean> = {} as any;

    // Per-source overshoot/remaining still computed for display; compliance for line sources uses SOM (LV+HV ≤ 100%).
    for (const src of visibleSources) {
      overshoots[src] = Math.max(0, seedEmissions[src] - thresholds[src]);
      remaining[src] = calcRemainingReduction(emissions[src], thresholds[src]);
      progress[src] = calcProgress(remaining[src], overshoots[src]);
    }

    // SOM compliance for line source pairs (Spec §3.1)
    const cpLsLvPct = thresholds.bouwfase_lijn_lv > 0 ? (emissions.bouwfase_lijn_lv / thresholds.bouwfase_lijn_lv) * 100 : 0;
    const cpLsHvPct = thresholds.bouwfase_lijn_hv > 0 ? (emissions.bouwfase_lijn_hv / thresholds.bouwfase_lijn_hv) * 100 : 0;
    const opLsLvPct = thresholds.exploitatie_lijn_lv > 0 ? (emissions.exploitatie_lijn_lv / thresholds.exploitatie_lijn_lv) * 100 : 0;
    const opLsHvPct = thresholds.exploitatie_lijn_hv > 0 ? (emissions.exploitatie_lijn_hv / thresholds.exploitatie_lijn_hv) * 100 : 0;
    const cpLsSomPct = cpLsLvPct + cpLsHvPct;
    const opLsSomPct = opLsLvPct + opLsHvPct;
    const cpLsSomCompliant = cpLsSomPct <= 100;
    const opLsSomCompliant = opLsSomPct <= 100;

    isCompliant.bouwfase_punt = remaining.bouwfase_punt === 0;
    // Excluded op_ps does not contribute to ratios or compliance (Spec §13.1 + §8.4)
    isCompliant.exploitatie_punt = opPsExcluded ? true : remaining.exploitatie_punt === 0;
    // Both halves of a SOM pair share the same compliance verdict
    isCompliant.bouwfase_lijn_lv = cpLsSomCompliant;
    isCompliant.bouwfase_lijn_hv = cpLsSomCompliant;
    isCompliant.exploitatie_lijn_lv = opLsSomCompliant;
    isCompliant.exploitatie_lijn_hv = opLsSomCompliant;

    // Active sources for project totals — exclude op_ps when screening gate fails
    const activeSources = visibleSources.filter(id => !(id === 'exploitatie_punt' && opPsExcluded));
    const totalRemaining = activeSources.reduce((acc, id) => acc + remaining[id], 0);
    const totalOvershoot = activeSources.reduce((acc, id) => acc + overshoots[id], 0);
    const projectProgress = calcProgress(totalRemaining, totalOvershoot);
    const projectCompliant = activeSources.every(id => isCompliant[id]);

    return {
      emissions, thresholds, overshoots, remaining, progress, isCompliant,
      projectCompliant, projectProgress,
      cpLsSomPct, opLsSomPct, cpLsSomCompliant, opLsSomCompliant,
      opPsExcluded,
    };
  }, [state]);

  const ctx: SandboxContextType = {
    state,
    update,
    ...computed,
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    onComplete();
  };

  return (
    <SandboxContext.Provider value={ctx}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* ── Bar 1: App bar ── */}
        <div className="sticky top-0 z-50 bg-secondary text-secondary-foreground">
          <div className="flex items-center justify-between px-5 h-12">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold tracking-tight">OxiCloud Sandbox</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-medium">
                <AlertTriangle className="h-3 w-3" />
                Sandbox-modus - Wijzigingen worden niet opgeslagen in het dossier
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Project:</span>
              <span className="text-sm font-medium">Residentie Brugge Noord</span>
              <Button variant="ghost" size="sm" onClick={onBack} className="text-secondary-foreground/60 hover:text-secondary-foreground h-7 text-xs">
                <X className="h-3.5 w-3.5 mr-1" /> Sluiten
              </Button>
            </div>
          </div>
        </div>

        {/* ── Bar 2: Project compliance bar ── */}
        <div className="sticky top-12 z-40 border-b border-border bg-card">
          <div className="px-5 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Totale projectstatus</span>
              <motion.span
                key={computed.projectCompliant ? 'ok' : 'nok'}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                  computed.projectCompliant
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {computed.projectCompliant ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {computed.projectCompliant ? 'Project Conform' : 'Project Niet Conform'}
              </motion.span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {visibleSources.map(src => {
                const isExcluded = src === 'exploitatie_punt' && computed.opPsExcluded;
                return (
                  <button
                    key={src}
                    onClick={() => setActiveTab(src)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                      isExcluded
                        ? "bg-muted/50 border-border text-muted-foreground"
                        : computed.isCompliant[src]
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/5 border-destructive/20 text-destructive",
                      activeTab === src && "ring-1 ring-ring"
                    )}
                  >
                    {isExcluded ? <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" /> :
                      computed.isCompliant[src] ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                    {SOURCE_LABELS[src]}
                    {isExcluded && <span className="text-[9px] opacity-70">· buiten beschouwing</span>}
                  </button>
                );
              })}
            </div>
            {/* SOM badges (Spec §3.1) — line source pair compliance is the SOM, not individual ratios */}
            <div className="flex flex-wrap gap-1.5 mb-3 text-[10px]">
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold tabular-nums",
                computed.cpLsSomCompliant
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-destructive/5 border-destructive/20 text-destructive"
              )}>
                Bouwfase Lijn SOM (LV+HV): {computed.cpLsSomPct.toFixed(1)}% / 100%
              </span>
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold tabular-nums",
                computed.opLsSomCompliant
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-destructive/5 border-destructive/20 text-destructive"
              )}>
                Exploitatie Lijn SOM (LV+HV): {computed.opLsSomPct.toFixed(1)}% / 100%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", computed.projectCompliant ? "bg-emerald-500" : "bg-amber-500")}
                  animate={{ width: `${computed.projectProgress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-muted-foreground w-12 text-right">
                {Math.round(computed.projectProgress)}%
              </span>
            </div>
          </div>
        </div>

        {/* ── Tab navigation + content ── */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SourceId)} className="flex-1 flex flex-col">
          <div className="border-b border-border bg-card/50">
            <TabsList className="h-auto p-0 bg-transparent rounded-none px-5 gap-0">
              {visibleSources.map(src => (
                <TabsTrigger
                  key={src}
                  value={src}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-xs font-medium"
                >
                  {TAB_LABELS[src]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'bouwfase_punt' && (
                  <TabsContent value="bouwfase_punt" className="mt-0 h-full">
                    <Tab1BouwfasePunt onConfirm={() => setConfirmOpen(true)} onBack={onBack} />
                  </TabsContent>
                )}
                {activeTab === 'bouwfase_lijn_lv' && (
                  <TabsContent value="bouwfase_lijn_lv" className="mt-0 h-full">
                    <Tab2BouwfaseLijnLV onBack={onBack} />
                  </TabsContent>
                )}
                {activeTab === 'bouwfase_lijn_hv' && (
                  <TabsContent value="bouwfase_lijn_hv" className="mt-0 h-full">
                    <Tab3BouwfaseLijnHV onBack={onBack} />
                  </TabsContent>
                )}
                {activeTab === 'exploitatie_punt' && (
                  <TabsContent value="exploitatie_punt" className="mt-0 h-full">
                    <Tab4ExploitatiePunt onBack={onBack} />
                  </TabsContent>
                )}
                {activeTab === 'exploitatie_lijn_lv' && (
                  <TabsContent value="exploitatie_lijn_lv" className="mt-0 h-full">
                    <Tab5ExploitatieLijnLV onBack={onBack} />
                  </TabsContent>
                )}
                {activeTab === 'exploitatie_lijn_hv' && (
                  <TabsContent value="exploitatie_lijn_hv" className="mt-0 h-full">
                    <Tab6ExploitatieLijnHV onBack={onBack} />
                  </TabsContent>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>

        {/* ── Confirmation modal ── */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Wijzigingen bevestigen</DialogTitle>
              <DialogDescription>
                U staat op het punt wijzigingen door te voeren in het live dossier. Dit kan niet ongedaan worden gemaakt. Bevestigen?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Annuleren</Button>
              <Button onClick={handleConfirm}>Bevestigen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SandboxContext.Provider>
  );
}
