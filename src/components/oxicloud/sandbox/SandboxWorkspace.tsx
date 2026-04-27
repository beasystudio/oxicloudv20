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
  // Tab 4
  operating_hours: number;
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

    // Tab 1: Bouwfase Punt — combines BOTH expert (machine table) and guided (parameter multipliers).
    // Expert edits change the machine baseline; guided sliders apply reduction multipliers on top.
    const machineEmission = calcPointSourceConstruction(s.machines);
    const prefabEffect = 1 - ((s.prefabSlider - 40) / 100) * 0.6; // higher prefab = less emission
    const sloopEffect = s.sloopoppervlakte / SEEDS.sloopoppervlakte;
    const verhardingEffect = s.nieuwe_verharding / SEEDS.nieuwe_verharding;
    const grondEffect = s.grondwerkvolume / SEEDS.grondwerkvolume;
    const guidedMultiplier = prefabEffect * (0.3 + 0.7 * sloopEffect) * (0.2 + 0.8 * verhardingEffect) * (0.3 + 0.7 * grondEffect);
    const tab1Emission = machineEmission * guidedMultiplier;

    const tab2Emission = calcLineSourceConstruction(s.lv_trips_rate, 0.0021, s.prefab_percentage);
    const tab3Emission = calcLineSourceConstruction(s.hv_trips_rate, 0.014, s.prefab_percentage);
    const tab4Emission = calcOperationPointEmission(60, s.operating_hours);
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

    return { emissions, thresholds, overshoots, remaining, progress, isCompliant, projectCompliant, projectProgress };
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
        {/* ── Minimal tab navigation: only failed sources ── */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SourceId)} className="flex-1 flex flex-col">
          <div className="sticky top-0 z-40 border-b border-border bg-background">
            <TabsList className="h-auto p-0 bg-transparent rounded-none px-5 gap-0">
              {visibleSources.filter(src => !computed.isCompliant[src]).map(src => (
                <TabsTrigger
                  key={src}
                  value={src}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-xs font-medium text-muted-foreground data-[state=active]:text-foreground"
                >
                  {SOURCE_LABELS[src]}
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
