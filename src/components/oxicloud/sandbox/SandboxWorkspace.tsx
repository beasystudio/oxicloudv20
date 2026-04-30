import { useState, useMemo, useCallback, createContext, useContext } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
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
import { Tab4ExploitatiePunt } from './tabs/Tab4ExploitatiePunt';
import { Tab5ExploitatieLijnLV } from './tabs/Tab5ExploitatieLijnLV';

// ── Shared sandbox state context ──
export interface SandboxState {
  // Tab 1
  prefabSlider: number;
  sloopoppervlakte: number;
  nieuwe_verharding: number;
  diepte_bouwput: number;
  grondwerkvolume: number;
  terrein_ophoging: number;
  machines: MachineRow[];
  expertReason: string;
  tab1Mode: 'guided' | 'expert';
  // Tab 2/3 shared (construction line)
  floor_area: number;
  construction_months: number;
  prefab_percentage: number;
  lv_trips_rate: number;
  hv_trips_rate: number;
  lv_trips_override: number | null;
  hv_trips_override: number | null;
  // Tab 4 (operational point — heating)
  s4_gate1: boolean;
  s4_gate2: boolean;
  s4_fuel: 'Wood' | 'Gas';
  s4_power_kw: number;
  operating_hours: number;
  // Tab 5/6 shared (operational line)
  parking_spaces: number;
  modal_split_lv: number;
  lv_trips_rate_op: number;
  hv_trips_rate_op: number;
  lv_trips_op_override: number | null;
  hv_trips_op_override: number | null;
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
  seedEmissions: Record<SourceId, number>;
  projectCompliant: boolean;
  projectProgress: number;
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
  floor_area: SEEDS.floor_area,
  construction_months: SEEDS.construction_months,
  prefab_percentage: SEEDS.prefab_percentage,
  lv_trips_rate: SEEDS.lv_trips_rate,
  hv_trips_rate: SEEDS.hv_trips_rate,
  lv_trips_override: null,
  hv_trips_override: null,
  s4_gate1: SEEDS.s4_gate1,
  s4_gate2: SEEDS.s4_gate2,
  s4_fuel: SEEDS.s4_fuel,
  s4_power_kw: SEEDS.vermogen,
  operating_hours: SEEDS.operating_hours,
  parking_spaces: SEEDS.parking_spaces,
  modal_split_lv: SEEDS.modal_split_lv,
  lv_trips_rate_op: SEEDS.lv_trips_rate_op,
  hv_trips_rate_op: SEEDS.hv_trips_rate_op,
  lv_trips_op_override: null,
  hv_trips_op_override: null,
};

// All six emission sources are tracked for calculation.
// Tabs 2/3 (construction line LV+HV) and 5/6 (operational line LV+HV) are
// rendered as joint panels, so the navigation only shows 4 tab buttons.
const visibleSources: SourceId[] = [
  'bouwfase_punt',
  'bouwfase_lijn_lv',
  'bouwfase_lijn_hv',
  'exploitatie_punt',
  'exploitatie_lijn_lv',
  'exploitatie_lijn_hv',
];

type TabKey = 'bouwfase_punt' | 'bouwfase_lijn' | 'exploitatie_punt' | 'exploitatie_lijn';
const TAB_KEYS: TabKey[] = ['bouwfase_punt', 'bouwfase_lijn', 'exploitatie_punt', 'exploitatie_lijn'];
const TAB_NAV_LABEL_KEYS: Record<TabKey, string> = {
  bouwfase_punt: 'sandboxTabs.tabConstructionPoint',
  bouwfase_lijn: 'sandboxTabs.tabConstructionLine',
  exploitatie_punt: 'sandboxTabs.tabOperationalPoint',
  exploitatie_lijn: 'sandboxTabs.tabOperationalLine',
};

interface SandboxWorkspaceProps {
  onComplete: () => void;
  onBack: () => void;
}

export function SandboxWorkspace({ onComplete, onBack }: SandboxWorkspaceProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<SandboxState>({ ...INITIAL_STATE });
  const [activeTab, setActiveTab] = useState<TabKey>('bouwfase_punt');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = useCallback((partial: Partial<SandboxState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  // ── Compute all emissions ──
  const computed = useMemo(() => {
    const s = state;

    // Tab 1
    const machineEmission = calcPointSourceConstruction(s.machines);
    const prefabEffect = 1 - ((s.prefabSlider - 40) / 100) * 0.6;
    const sloopEffect = s.sloopoppervlakte / SEEDS.sloopoppervlakte;
    const verhardingEffect = s.nieuwe_verharding / SEEDS.nieuwe_verharding;
    const grondEffect = s.grondwerkvolume / SEEDS.grondwerkvolume;
    const guidedMultiplier = prefabEffect * (0.3 + 0.7 * sloopEffect) * (0.2 + 0.8 * verhardingEffect) * (0.3 + 0.7 * grondEffect);
    const tab1Emission = machineEmission * guidedMultiplier;

    // Tabs 2 & 3 — joint construction line. Scale by area, months, prefab.
    const areaFactor = s.floor_area / SEEDS.floor_area;
    const monthsFactor = s.construction_months / SEEDS.construction_months;
    const prefabConstFactor = (1 - s.prefab_percentage) / (1 - SEEDS.prefab_percentage);
    const constLineFactor = areaFactor * monthsFactor * prefabConstFactor;
    const baseTab2 = calcLineSourceConstruction(SEEDS.lv_trips_rate, 0.0021, SEEDS.prefab_percentage) * constLineFactor;
    const baseTab3 = calcLineSourceConstruction(SEEDS.hv_trips_rate, 0.014, SEEDS.prefab_percentage) * constLineFactor;
    const tab2Emission = s.lv_trips_override !== null ? s.lv_trips_override * 0.0021 : baseTab2;
    const tab3Emission = s.hv_trips_override !== null ? s.hv_trips_override * 0.014 : baseTab3;

    // Tab 4 — heating with gate logic
    let tab4Emission = 0;
    if (s.s4_gate1 && s.s4_gate2) {
      const fuelEF = s.s4_fuel === 'Wood' ? 0.00009 : 0.00007;
      tab4Emission = s.s4_power_kw * s.operating_hours * fuelEF;
    }

    // Tabs 5 & 6 — joint operational line
    let tab5Emission: number;
    if (s.parking_spaces === 0) {
      // area based path B (lighter)
      tab5Emission = (s.floor_area / 1000) * 3.5 * 0.0021 * 365 * 0.6;
    } else {
      tab5Emission = calcLineSourceOperation(s.lv_trips_rate_op, 0.0021, s.modal_split_lv, s.parking_spaces);
    }
    let tab6Emission = (s.floor_area / 1000) * s.hv_trips_rate_op * 0.014 * 365;
    if (s.lv_trips_op_override !== null) tab5Emission = s.lv_trips_op_override * 0.0021;
    if (s.hv_trips_op_override !== null) tab6Emission = s.hv_trips_op_override * 0.014;

    const emissions: Record<SourceId, number> = {
      bouwfase_punt: Math.round(tab1Emission * 10) / 10,
      bouwfase_lijn_lv: Math.round(tab2Emission * 10) / 10,
      bouwfase_lijn_hv: Math.round(tab3Emission * 10) / 10,
      exploitatie_punt: Math.round(tab4Emission * 100) / 100,
      exploitatie_lijn_lv: Math.round(tab5Emission * 10) / 10,
      exploitatie_lijn_hv: Math.round(tab6Emission * 10) / 10,
    };

    const thresholds = { ...THRESHOLDS };

    // Seeds (compute at default seed values)
    const seedTab1 = calcPointSourceConstruction(DEFAULT_MACHINES);
    const seedTab2 = calcLineSourceConstruction(SEEDS.lv_trips_rate, 0.0021, SEEDS.prefab_percentage);
    const seedTab3 = calcLineSourceConstruction(SEEDS.hv_trips_rate, 0.014, SEEDS.prefab_percentage);
    const seedTab4 = SEEDS.vermogen * SEEDS.operating_hours * 0.00009;
    const seedTab5 = calcLineSourceOperation(SEEDS.lv_trips_rate_op, 0.0021, SEEDS.modal_split_lv, SEEDS.parking_spaces);
    const seedTab6 = (SEEDS.floor_area / 1000) * SEEDS.hv_trips_rate_op * 0.014 * 365;

    const seedEmissions: Record<SourceId, number> = {
      bouwfase_punt: Math.round(seedTab1 * 10) / 10,
      bouwfase_lijn_lv: Math.round(seedTab2 * 10) / 10,
      bouwfase_lijn_hv: Math.round(seedTab3 * 10) / 10,
      exploitatie_punt: Math.round(seedTab4 * 100) / 100,
      exploitatie_lijn_lv: Math.round(seedTab5 * 10) / 10,
      exploitatie_lijn_hv: Math.round(seedTab6 * 10) / 10,
    };

    const overshoots: Record<SourceId, number> = {} as any;
    const remaining: Record<SourceId, number> = {} as any;
    const progress: Record<SourceId, number> = {} as any;
    const isCompliant: Record<SourceId, boolean> = {} as any;

    for (const src of visibleSources) {
      overshoots[src] = Math.max(0, seedEmissions[src] - thresholds[src]);
      remaining[src] = calcRemainingReduction(emissions[src], thresholds[src]);
      progress[src] = calcProgress(remaining[src], overshoots[src]);
      isCompliant[src] = remaining[src] === 0;
    }

    const totalRemaining = visibleSources.reduce((s, id) => s + remaining[id], 0);
    const totalOvershoot = visibleSources.reduce((s, id) => s + overshoots[id], 0);
    const projectProgress = calcProgress(totalRemaining, totalOvershoot);
    const projectCompliant = visibleSources.every(id => isCompliant[id]);

    return { emissions, thresholds, overshoots, remaining, progress, isCompliant, seedEmissions, projectCompliant, projectProgress };
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
      <div className="h-[calc(100dvh-6.5rem)] min-h-0 overflow-hidden bg-background flex flex-col">
        {/* ── Minimal tab navigation: only failed sources ── */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="h-full min-h-0 flex flex-col">
          <div className="shrink-0 bg-background px-5 py-3">
            <TabsList className="h-auto p-1 bg-muted/50 rounded-full gap-1 inline-flex">
              {TAB_KEYS.map(key => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="rounded-full border-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors"
                >
                  {t(TAB_NAV_LABEL_KEYS[key])}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="h-full min-h-0"
              >
                {activeTab === 'bouwfase_punt' && (
                  <TabsContent value="bouwfase_punt" className="mt-0 h-full">
                    <Tab1BouwfasePunt onConfirm={() => setConfirmOpen(true)} onBack={onBack} />
                  </TabsContent>
                )}
                {activeTab === 'bouwfase_lijn' && (
                  <TabsContent value="bouwfase_lijn" className="mt-0 h-full">
                    <Tab2BouwfaseLijnLV onBack={onBack} onConfirm={() => setConfirmOpen(true)} />
                  </TabsContent>
                )}
                {activeTab === 'exploitatie_punt' && (
                  <TabsContent value="exploitatie_punt" className="mt-0 h-full">
                    <Tab4ExploitatiePunt onBack={onBack} onConfirm={() => setConfirmOpen(true)} />
                  </TabsContent>
                )}
                {activeTab === 'exploitatie_lijn' && (
                  <TabsContent value="exploitatie_lijn" className="mt-0 h-full">
                    <Tab5ExploitatieLijnLV onBack={onBack} onConfirm={() => setConfirmOpen(true)} />
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
