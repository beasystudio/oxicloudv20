import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SandboxProjectionPanel } from './SandboxProjectionPanel';
import { SandboxMode, EquipmentItem } from '@/types/sandbox';
import { CalculationResults } from '@/types/oxicloud';
import { useLanguage } from '@/i18n/LanguageContext';

const DEFAULT_EQUIPMENT: EquipmentItem[] = [
  { id: '1', machineType: 'Hydraulische graafmachine', quantity: 2, operatingHours: 480, emissionFactor: 1.02 },
  { id: '2', machineType: 'Wiellader', quantity: 1, operatingHours: 320, emissionFactor: 0.81 },
  { id: '3', machineType: 'Torenkraan', quantity: 1, operatingHours: 800, emissionFactor: 0.54 },
  { id: '4', machineType: 'Betonpomp', quantity: 1, operatingHours: 120, emissionFactor: 1.22 },
];

const calculateEquipmentEmissions = (equip: EquipmentItem[]) => equip.reduce((sum, eq) => sum + eq.quantity * eq.operatingHours * eq.emissionFactor / 100, 0);

interface BouwfasePuntbronnenSandboxProps { onComplete: () => void; onBack: () => void; results?: CalculationResults; }

export function BouwfasePuntbronnenSandbox({ onComplete, onBack, results }: BouwfasePuntbronnenSandboxProps) {
  const { t } = useLanguage();
  const BASELINE_EMISSIONS = results?.project_nox_stationary ?? 18.2;
  const TARGET_EMISSIONS = results?.max_nox_stationary ?? 12.5;
  const BASELINE_PREFAB = 30;
  const BASELINE_DEMOLITION = 450;
  const BASELINE_PAVING = 800;

  const getRecommendedPrefab = (input: number) => Math.min(80, input + 20);
  const getRecommendedDemolition = (input: number) => Math.max(0, input - 250);
  const getRecommendedPaving = (input: number) => Math.max(0, input - 20);

  const [mode, setMode] = useState<SandboxMode>('guided');
  const [prefabPercentage, setPrefabPercentage] = useState(BASELINE_PREFAB);
  const [demolitionSurface, setDemolitionSurface] = useState(BASELINE_DEMOLITION);
  const [newPavingArea, setNewPavingArea] = useState(BASELINE_PAVING);
  const [equipment, setEquipment] = useState<EquipmentItem[]>(DEFAULT_EQUIPMENT);

  const currentEmissions = useMemo(() => {
    if (mode === 'guided') {
      const prefabReduction = (prefabPercentage - BASELINE_PREFAB) / 10 * 1.0;
      const demolitionReduction = (BASELINE_DEMOLITION - demolitionSurface) / BASELINE_DEMOLITION * 3.0;
      const pavingReduction = (BASELINE_PAVING - newPavingArea) / BASELINE_PAVING * 2.5;
      return Math.max(0, BASELINE_EMISSIONS - prefabReduction - demolitionReduction - pavingReduction);
    }
    return calculateEquipmentEmissions(equipment);
  }, [mode, prefabPercentage, demolitionSurface, newPavingArea, equipment, BASELINE_EMISSIONS]);

  const isCompliant = currentEmissions <= TARGET_EMISSIONS;
  const remainingReduction = Math.max(0, currentEmissions - TARGET_EMISSIONS);

  const updateEquipment = (id: string, field: 'quantity' | 'operatingHours', value: number) => {
    setEquipment((prev) => prev.map((eq) => eq.id === id ? { ...eq, [field]: value } : eq));
  };

  const handleReset = () => {
    if (mode === 'guided') { setPrefabPercentage(BASELINE_PREFAB); setDemolitionSurface(BASELINE_DEMOLITION); setNewPavingArea(BASELINE_PAVING); }
    else { setEquipment(DEFAULT_EQUIPMENT); }
  };

  const handleApplyRecommended = () => {
    setPrefabPercentage(getRecommendedPrefab(prefabPercentage));
    setDemolitionSurface(getRecommendedDemolition(demolitionSurface));
    setNewPavingArea(getRecommendedPaving(newPavingArea));
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('sandbox.adjustConstructionSetup')}</h1>
          <p className="text-base text-muted-foreground mt-1">{t('sandbox.adjustConstructionSetupDesc')}</p>
          <div className="flex items-center gap-2 mt-6">
            <button onClick={() => setMode('guided')} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150", mode === 'guided' ? "bg-secondary text-secondary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground")}>{t('sandbox.guidedOptimization')}</button>
            <button onClick={() => setMode('expert')} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150", mode === 'expert' ? "bg-secondary text-secondary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground")}>{t('sandbox.expertMode')}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-5">
            <AnimatePresence mode="wait">
              {mode === 'guided' ? (
                <motion.div key="guided" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="space-y-5">
                  <div className="bg-primary/10 rounded-xl p-5 border border-primary/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{t('sandbox.oxicloudRecommendation')}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{t('sandbox.applyRecommendedDesc')}</p>
                      </div>
                      <Button onClick={handleApplyRecommended} size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium">{t('sandbox.applySuggestions')}</Button>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div><h3 className="font-medium text-foreground">{t('sandbox.prefabLevel')}</h3><p className="text-sm text-muted-foreground mt-0.5">{t('sandbox.prefabDesc')}</p></div>
                      <div className="text-right text-xs text-muted-foreground"><p>{t('sandbox.input')}: {BASELINE_PREFAB}%</p><p className="text-primary font-medium">{t('sandbox.recommended')}: {getRecommendedPrefab(prefabPercentage)}%</p></div>
                    </div>
                    <Slider value={[prefabPercentage]} onValueChange={([val]) => setPrefabPercentage(val)} min={0} max={80} step={1} className="w-full" />
                    <div className="flex items-center justify-between mt-4"><span className="text-xs text-muted-foreground">0%</span><span className="text-2xl font-semibold tabular-nums">{prefabPercentage}%</span><span className="text-xs text-muted-foreground">80%</span></div>
                  </div>

                  <div className="bg-muted/30 rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div><h3 className="font-medium text-foreground">{t('sandbox.demolitionSurface')}</h3><p className="text-sm text-muted-foreground mt-0.5">{t('sandbox.demolitionSurfaceDesc')}</p></div>
                      <div className="text-right text-xs text-muted-foreground"><p>{t('sandbox.input')}: {BASELINE_DEMOLITION} m²</p><p className="text-primary font-medium">{t('sandbox.recommended')}: {getRecommendedDemolition(demolitionSurface)} m²</p></div>
                    </div>
                    <div className="flex items-center gap-3"><Input type="number" value={demolitionSurface} onChange={(e) => setDemolitionSurface(Number(e.target.value))} className="text-lg font-medium h-11" /><span className="text-muted-foreground text-sm">m²</span></div>
                  </div>

                  <div className="bg-muted/30 rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div><h3 className="font-medium text-foreground">{t('sandbox.newPaving')}</h3><p className="text-sm text-muted-foreground mt-0.5">{t('sandbox.newPavingDesc')}</p></div>
                      <div className="text-right text-xs text-muted-foreground"><p>{t('sandbox.input')}: {BASELINE_PAVING} m²</p><p className="text-primary font-medium">{t('sandbox.recommended')}: {getRecommendedPaving(newPavingArea)} m²</p></div>
                    </div>
                    <div className="flex items-center gap-3"><Input type="number" value={newPavingArea} onChange={(e) => setNewPavingArea(Number(e.target.value))} className="text-lg font-medium h-11" /><span className="text-muted-foreground text-sm">m²</span></div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="expert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="space-y-5">
                  <div className="bg-muted/50 rounded-xl p-4 border border-border"><p className="text-sm text-muted-foreground">{t('sandbox.expertDisclaimer')}</p></div>
                  <div className="bg-primary/10 rounded-xl p-4 border border-primary/30"><p className="text-sm text-foreground"><span className="font-medium">{t('sandbox.inputEmissions')}:</span> {BASELINE_EMISSIONS} kg NOₓ - {t('sandbox.sameAsGuided')}</p></div>
                  <div className="bg-muted/30 rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border"><h3 className="font-medium text-foreground">{t('sandbox.equipmentInventory')}</h3><p className="text-sm text-muted-foreground mt-0.5">{t('sandbox.equipmentInventoryDesc')}</p></div>
                    <div className="divide-y divide-border">
                      {equipment.map((eq) => (
                        <div key={eq.id} className="p-4 flex items-center gap-4">
                          <div className="flex-1 min-w-0"><p className="font-medium text-foreground truncate">{eq.machineType}</p><p className="text-xs text-muted-foreground">{t('sandbox.factor')}: {eq.emissionFactor} kg NOₓ/100u</p></div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-20"><Label className="text-xs text-muted-foreground">{t('sandbox.quantity')}</Label><Input type="number" value={eq.quantity} onChange={(e) => updateEquipment(eq.id, 'quantity', Number(e.target.value))} min={0} className="h-9" /></div>
                            <div className="w-24"><Label className="text-xs text-muted-foreground">{t('sandbox.hours')}</Label><Input type="number" value={eq.operatingHours} onChange={(e) => updateEquipment(eq.id, 'operatingHours', Number(e.target.value))} min={0} className="h-9" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-3 pt-2 pb-6">
              <Button variant="outline" onClick={handleReset} className="rounded-lg h-10">{t('sandbox.resetToBaseline')}</Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <SandboxProjectionPanel title={t('sandbox.emissionProjection')} subtitle={t('sandbox.constructionPhase') + ' ' + t('sandbox.pointSources').toLowerCase()} targetValue={TARGET_EMISSIONS} currentValue={Math.round(currentEmissions * 10) / 10} unit="kg NOₓ" remainingReduction={Math.round(remainingReduction * 10) / 10} isCompliant={isCompliant} beforeValue={BASELINE_EMISSIONS} afterValue={Math.round(currentEmissions * 10) / 10} showBeforeAfter={true} inputValue={BASELINE_EMISSIONS} />
            <div className="mt-6 mb-8">
              <Button onClick={onComplete} disabled={!isCompliant} className={cn("w-full h-12 rounded-xl text-base font-medium transition-all", isCompliant ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed")}>
                {mode === 'guided' ? t('sandbox.confirmChanges') : t('sandbox.applyToProject')}
              </Button>
              {!isCompliant && <p className="text-xs text-muted-foreground text-center mt-2">{t('sandbox.adjustParamsForCompliance')}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
