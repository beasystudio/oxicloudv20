import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DetailedCalculationData, ExploitationSystemData, OxiCloudProject } from '@/types/oxicloud';
import { ArrowLeft, ArrowRight, Check, Info, CheckCircle2, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { OxiCloudStatusBadge } from './OxiCloudStatusBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

// Auto-save storage keys
const DETAILED_CALC_DRAFT_KEY = 'nox_detailed_calc_draft_';
const DETAILED_CALC_STEP_KEY = 'nox_detailed_calc_step_';
const DETAILED_CALC_EXPLOIT_STEP_KEY = 'nox_detailed_calc_exploit_step_';

interface DetailedCalculationFormProps {
  project: OxiCloudProject;
  onSubmit: (data: DetailedCalculationData) => void;
  onBack: () => void;
  onAutoSave?: (data: DetailedCalculationData) => void;
}

// Helper to determine if project type is residential
const isResidentialProject = (projectType?: string): boolean => {
  if (!projectType) return true; // Default to residential
  const residentialTypes = ['woningbouw_klein', 'woningbouw_middelgroot_groot'];
  return residentialTypes.includes(projectType);
};

// Helper to determine if project type is industrial
const isIndustrialProject = (projectType?: string): boolean => {
  if (!projectType) return false;
  const industrialTypes = ['industrie', 'logistiek_magazijn', 'kantoor', 'retail_commercieel'];
  return industrialTypes.includes(projectType);
};
const PREFAB_PERCENTAGES_KEYS = [
  { value: 0, labelKey: 'detailedCalc.prefab0' },
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
  { value: 30, label: '30%' },
  { value: 40, label: '40%' },
  { value: 50, label: '50%' },
  { value: 60, label: '60%' },
  { value: 70, label: '70%' },
  { value: 80, labelKey: 'detailedCalc.prefab80' },
];
const RESIDENTIAL_SYSTEM_TYPES_KEYS = [
  { value: 'fireplace', labelKey: 'detailedCalc.fireplace' },
  { value: 'wood_stove', labelKey: 'detailedCalc.woodStove' },
  { value: 'gas_boiler', labelKey: 'detailedCalc.gasBoiler' },
  { value: 'oil_boiler', labelKey: 'detailedCalc.oilBoiler' },
];
const RESIDENTIAL_FUEL_TYPES_KEYS = [
  { value: 'wood', labelKey: 'detailedCalc.wood' },
  { value: 'natural_gas', labelKey: 'detailedCalc.naturalGas' },
];
const INDUSTRIAL_FUEL_TYPES_KEYS = [
  { value: 'natural_gas', labelKey: 'detailedCalc.naturalGas' },
  { value: 'heating_oil', labelKey: 'detailedCalc.heatingOil' },
  { value: 'biomass', labelKey: 'detailedCalc.biomass' },
];
const RESIDENTIAL_SYSTEM_TYPES = [{
  value: 'fireplace',
  label: 'Open haard'
}, {
  value: 'wood_stove',
  label: 'Houtkachel'
}, {
  value: 'gas_boiler',
  label: 'Gasketel'
}, {
  value: 'oil_boiler',
  label: 'Olieketel'
}];
const RESIDENTIAL_FUEL_TYPES = [{
  value: 'wood',
  label: 'Hout'
}, {
  value: 'natural_gas',
  label: 'Aardgas'
}];
const INDUSTRIAL_FUEL_TYPES = [{
  value: 'natural_gas',
  label: 'Aardgas'
}, {
  value: 'heating_oil',
  label: 'Stookolie'
}, {
  value: 'biomass',
  label: 'Biomassa'
}];

// Base steps - titles will use t() at render time
const BASE_STEP_KEYS = [
  { id: 1, titleKey: 'detailedCalc.stepBuilding' },
  { id: 2, titleKey: 'detailedCalc.stepPaving' },
  { id: 3, titleKey: 'detailedCalc.stepGroundwork' },
  { id: 4, titleKey: 'detailedCalc.stepDetails' },
  { id: 5, titleKey: 'detailedCalc.stepExploitation' },
];
export function DetailedCalculationForm({
  project,
  onSubmit,
  onBack,
  onAutoSave
}: DetailedCalculationFormProps) {
  const { t } = useLanguage();
  const projectType = project.preEstimation?.projectType;
  const isResidential = isResidentialProject(projectType);
  
  // Load saved draft data from localStorage
  const getSavedDraft = (): DetailedCalculationData | null => {
    try {
      const stored = localStorage.getItem(DETAILED_CALC_DRAFT_KEY + project.id);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  };

  const getSavedStep = (): number => {
    try {
      const stored = localStorage.getItem(DETAILED_CALC_STEP_KEY + project.id);
      return stored ? parseInt(stored, 10) : 1;
    } catch { return 1; }
  };

  const getSavedExploitationStep = (): 'q1' | 'q2' | 'q3' | 'excluded' => {
    try {
      const stored = localStorage.getItem(DETAILED_CALC_EXPLOIT_STEP_KEY + project.id);
      if (stored && ['q1', 'q2', 'q3', 'excluded'].includes(stored)) return stored as any;
    } catch {}
    return 'q1';
  };

  const savedDraft = getSavedDraft();
  const defaultData: DetailedCalculationData = {
    shellWindtightMonths: 0,
    buildingPerimeter: 0,
    removedAsphaltArea: 0,
    asphaltArea: 0,
    concreteArea: 0,
    naturalStoneArea: 0,
    looseMaterialsArea: 0,
    permeableGreenArea: 0,
    excavationDepth: 0,
    groundworkVolume: 0,
    terrainRaisingSurfaceArea: 0,
    terrainRaisingVolume: 0,
    prefabricatedPercentage: 0,
    parkingSpaces: 0,
    electricityAccess: 'yes',
    exploitationSystem: {
      hasCombustionSystem: null,
      excludeFromCalculation: false
    }
  };

  // Use saved draft, then project's existing data, then defaults
  const initialFormData = savedDraft || project.detailedCalculation || defaultData;

  const [currentStep, setCurrentStep] = useState(getSavedStep);
  const [formData, setFormData] = useState<DetailedCalculationData>(initialFormData);
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);

  // Exploitation phase question flow state
  const [exploitationStep, setExploitationStep] = useState<'q1' | 'q2' | 'q3' | 'excluded'>(getSavedExploitationStep);
  
  // Auto-save: debounce save formData, currentStep, and exploitationStep
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const performAutoSave = useCallback(() => {
    try {
      localStorage.setItem(DETAILED_CALC_DRAFT_KEY + project.id, JSON.stringify(formData));
      localStorage.setItem(DETAILED_CALC_STEP_KEY + project.id, String(currentStep));
      localStorage.setItem(DETAILED_CALC_EXPLOIT_STEP_KEY + project.id, exploitationStep);
    } catch {}
    
    // Call parent auto-save callback if provided
    onAutoSave?.(formData);
    
    // Show indicator briefly
    setAutoSaveIndicator(true);
    setTimeout(() => setAutoSaveIndicator(false), 1500);
  }, [formData, currentStep, exploitationStep, project.id, onAutoSave]);

  // Debounced auto-save on every data/step change
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(performAutoSave, 1000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [performAutoSave]);

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      try {
        localStorage.setItem(DETAILED_CALC_DRAFT_KEY + project.id, JSON.stringify(formData));
        localStorage.setItem(DETAILED_CALC_STEP_KEY + project.id, String(currentStep));
        localStorage.setItem(DETAILED_CALC_EXPLOIT_STEP_KEY + project.id, exploitationStep);
      } catch {}
    };
  }, [formData, currentStep, exploitationStep, project.id]);

  const totalPavedArea = useMemo(() => {
    return formData.asphaltArea + formData.concreteArea + formData.naturalStoneArea + formData.looseMaterialsArea + formData.permeableGreenArea;
  }, [formData.asphaltArea, formData.concreteArea, formData.naturalStoneArea, formData.looseMaterialsArea, formData.permeableGreenArea]);
  const calculatedGroundworkVolume = useMemo(() => {
    const floorArea = project.preEstimation?.groundFloorArea || 0;
    return formData.excavationDepth * floorArea;
  }, [formData.excavationDepth, project.preEstimation?.groundFloorArea]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear draft on final submit
    try {
      localStorage.removeItem(DETAILED_CALC_DRAFT_KEY + project.id);
      localStorage.removeItem(DETAILED_CALC_STEP_KEY + project.id);
      localStorage.removeItem(DETAILED_CALC_EXPLOIT_STEP_KEY + project.id);
    } catch {}
    onSubmit({
      ...formData,
      groundworkVolume: calculatedGroundworkVolume
    });
  };
  const updateField = <K extends keyof DetailedCalculationData,>(field: K, value: DetailedCalculationData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const updateExploitationField = <K extends keyof ExploitationSystemData,>(field: K, value: ExploitationSystemData[K]) => {
    setFormData(prev => ({
      ...prev,
      exploitationSystem: {
        ...prev.exploitationSystem,
        [field]: value
      }
    }) as DetailedCalculationData);
  };
  // Validate current step - all fields must be filled
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.shellWindtightMonths > 0 && formData.buildingPerimeter > 0;
      case 2:
        return true; // Paving is optional (geen nieuwe verharding scenario)
      case 3:
        return true; // Excavation pit is optional (geen bouwput scenario)
      case 4:
        return formData.prefabricatedPercentage >= 0 && formData.parkingSpaces >= 0 && !!formData.electricityAccess;
      case 5:
        return isExploitationComplete();
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const renderFieldWithTooltip = (id: string, label: string, tooltip: string, helperText?: string, children?: React.ReactNode) => <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      {children}
    </div>;

  // Exclusion card component
  const ExclusionCard = ({
    reason
  }: {
    reason: string;
  }) => <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center space-y-3">
      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="font-medium text-emerald-800 dark:text-emerald-200">{t('detailedCalc.noxNegligible')}</h3>
      <p className="text-sm text-emerald-600 dark:text-emerald-400">{reason}</p>
      <p className="text-xs text-muted-foreground mt-2">
        {t('detailedCalc.excludedFromCalc')}
      </p>
    </div>;

  // Decision card component for clickable options
  const DecisionCard = ({
    selected,
    onClick,
    title,
    description,
    variant = 'default'
  }: {
    selected: boolean;
    onClick: () => void;
    title: string;
    description?: string;
    variant?: 'default' | 'success' | 'warning';
  }) => <button type="button" onClick={onClick} className={cn("w-full p-4 rounded-xl border-2 text-left transition-all duration-200", selected ? variant === 'success' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : variant === 'warning' ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30" : "border-primary bg-primary/5" : "border-border/50 hover:border-border hover:bg-muted/30")}>
      <div className="flex items-start gap-3">
        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5", selected ? variant === 'success' ? "border-emerald-500 bg-emerald-500" : variant === 'warning' ? "border-amber-500 bg-amber-500" : "border-primary bg-primary" : "border-muted-foreground/40")}>
          {selected && <Check className="h-3 w-3 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
    </button>;

  // ===== STEP 1: Building =====
  const renderStep1 = () => <div className="space-y-5">
      <div className="text-center pb-2">
        <p className="text-sm text-muted-foreground py-[5px]">{t('detailedCalc.buildingBasicData')}</p>
      </div>
      
      {renderFieldWithTooltip('shellWindtightMonths', t('detailedCalc.shellWindtight'), t('detailedCalc.shellWindtightTooltip'), undefined, <Input id="shellWindtightMonths" type="number" min="0" step="0.5" value={formData.shellWindtightMonths || ''} onChange={e => updateField('shellWindtightMonths', parseFloat(e.target.value) || 0)} placeholder={t('detailedCalc.egMonths')} className="h-11" />)}

      {renderFieldWithTooltip('buildingPerimeter', t('detailedCalc.buildingPerimeter'), t('detailedCalc.buildingPerimeterTooltip'), undefined, <Input id="buildingPerimeter" type="number" min="0" value={formData.buildingPerimeter || ''} onChange={e => updateField('buildingPerimeter', parseFloat(e.target.value) || 0)} placeholder={t('detailedCalc.egPerimeter')} className="h-11" />)}

      {renderFieldWithTooltip('removedAsphaltArea', t('detailedCalc.removedAsphalt'), t('detailedCalc.removedAsphaltTooltip'), undefined, <Input id="removedAsphaltArea" type="number" min="0" value={formData.removedAsphaltArea || ''} onChange={e => updateField('removedAsphaltArea', parseFloat(e.target.value) || 0)} placeholder="0" className="h-11" />)}
    </div>;

  // ===== STEP 2: Paving =====
  const [hasNewPaving, setHasNewPaving] = useState(totalPavedArea > 0);
  const renderStep2 = () => <div className="space-y-5">
      <div className="text-center pb-2">
        <p className="text-sm text-muted-foreground">{t('detailedCalc.newPavedSurfaces')}</p>
      </div>

      <div className="rounded-lg border border-border/60 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={hasNewPaving}
            onCheckedChange={(checked) => {
              setHasNewPaving(checked === true);
              if (!checked) {
                updateField('asphaltArea', 0);
                updateField('concreteArea', 0);
                updateField('naturalStoneArea', 0);
                updateField('looseMaterialsArea', 0);
                updateField('permeableGreenArea', 0);
              }
            }} />
          <div>
             <span className="text-sm font-medium">{t('detailedCalc.newPavingPlanned')}</span>
             <p className="text-xs text-muted-foreground">{t('detailedCalc.uncheckIfNoPaving')}</p>
          </div>
        </label>
      </div>


      {hasNewPaving && <>


      <TooltipProvider delayDuration={200}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="asphaltArea" className="text-xs inline-flex items-center gap-1 cursor-help">{t('detailedCalc.asphalt')} <Info className="h-3 w-3 text-muted-foreground" /></Label>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]"><p className="text-xs">{t('detailedCalc.asphaltTooltip')}</p></TooltipContent>
            </Tooltip>
            <Input id="asphaltArea" type="number" min="0" value={formData.asphaltArea || ''} onChange={e => updateField('asphaltArea', parseFloat(e.target.value) || 0)} placeholder="0" className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="concreteArea" className="text-xs inline-flex items-center gap-1 cursor-help">{t('detailedCalc.concrete')} <Info className="h-3 w-3 text-muted-foreground" /></Label>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]"><p className="text-xs">{t('detailedCalc.concreteTooltip')}</p></TooltipContent>
            </Tooltip>
            <Input id="concreteArea" type="number" min="0" value={formData.concreteArea || ''} onChange={e => updateField('concreteArea', parseFloat(e.target.value) || 0)} placeholder="0" className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="naturalStoneArea" className="text-xs inline-flex items-center gap-1 cursor-help">{t('detailedCalc.pavers')} <Info className="h-3 w-3 text-muted-foreground" /></Label>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]"><p className="text-xs">{t('detailedCalc.paversTooltip')}</p></TooltipContent>
            </Tooltip>
            <Input id="naturalStoneArea" type="number" min="0" value={formData.naturalStoneArea || ''} onChange={e => updateField('naturalStoneArea', parseFloat(e.target.value) || 0)} placeholder="0" className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="looseMaterialsArea" className="text-xs inline-flex items-center gap-1 cursor-help">{t('detailedCalc.looseMaterials')} <Info className="h-3 w-3 text-muted-foreground" /></Label>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]"><p className="text-xs">{t('detailedCalc.looseMaterialsTooltip')}</p></TooltipContent>
            </Tooltip>
            <Input id="looseMaterialsArea" type="number" min="0" value={formData.looseMaterialsArea || ''} onChange={e => updateField('looseMaterialsArea', parseFloat(e.target.value) || 0)} placeholder="0" className="h-10" />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="permeableGreenArea" className="text-xs inline-flex items-center gap-1 cursor-help">{t('detailedCalc.permeableGreen')} <Info className="h-3 w-3 text-muted-foreground" /></Label>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]"><p className="text-xs">{t('detailedCalc.permeableGreenTooltip')}</p></TooltipContent>
            </Tooltip>
            <Input id="permeableGreenArea" type="number" min="0" value={formData.permeableGreenArea || ''} onChange={e => updateField('permeableGreenArea', parseFloat(e.target.value) || 0)} placeholder="0" className="h-10" />
          </div>
        </div>
      </TooltipProvider>

      <p className="text-xs text-muted-foreground italic text-center">
        {t('detailedCalc.onlyNewPaving')}
      </p>
      </>}
    </div>;

  // ===== STEP 3: Groundwork =====
  const [hasExcavationPit, setHasExcavationPit] = useState((formData.excavationDepth || 0) > 0);
  const [hasTerrainRaising, setHasTerrainRaising] = useState((formData.terrainRaisingSurfaceArea || 0) > 0 || (formData.terrainRaisingVolume || 0) > 0);
  const renderStep3 = () => <div className="space-y-5">
      <div className="text-center pb-2">
        <p className="text-sm text-muted-foreground">{t('detailedCalc.groundworkExcavation')}</p>
      </div>

      <div className="rounded-lg border border-border/60 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={hasExcavationPit}
            onCheckedChange={(checked) => {
              setHasExcavationPit(checked === true);
              if (!checked) {
                updateField('excavationDepth', 0);
              }
            }} />
          <div>
            <span className="text-sm font-medium">{t('detailedCalc.excavationPitPlanned')}</span>
            <p className="text-xs text-muted-foreground">{t('detailedCalc.uncheckIfNoExcavation')}</p>
          </div>
        </label>
      </div>


      {hasExcavationPit && <>
        {renderFieldWithTooltip('excavationDepth', t('detailedCalc.excavationDepth'), t('detailedCalc.excavationDepthTooltip'), undefined, <Input id="excavationDepth" type="number" min="0" step="0.1" value={formData.excavationDepth || ''} onChange={e => updateField('excavationDepth', parseFloat(e.target.value) || 0)} placeholder={t('detailedCalc.egDepth')} className="h-11" />)}

      </>}

      {/* Terrain Raising - collapsible toggle matching excavation pattern */}
      <div className="rounded-lg border border-border/60 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={hasTerrainRaising}
            onCheckedChange={(checked) => {
              setHasTerrainRaising(checked === true);
              if (!checked) {
                updateField('terrainRaisingSurfaceArea', 0);
                updateField('terrainRaisingVolume', 0);
              }
            }} />
          <div>
            <span className="text-sm font-medium">{t('detailedCalc.terrainRaisingToggle')}</span>
            <p className="text-xs text-muted-foreground">{t('detailedCalc.terrainRaisingToggleDesc')}</p>
          </div>
        </label>
      </div>


      {hasTerrainRaising && <div className="space-y-4 pl-4 border-l-2 border-primary/20">
        <div className="space-y-2">
          <Label htmlFor="terrainRaisingSurfaceArea" className="text-sm">{t('detailedCalc.terrainRaisingSurfaceArea')}</Label>
          <Input id="terrainRaisingSurfaceArea" type="number" min="0" value={formData.terrainRaisingSurfaceArea || ''} onChange={e => updateField('terrainRaisingSurfaceArea', parseFloat(e.target.value) || 0)} placeholder={t('detailedCalc.terrainRaisingSurfaceAreaPlaceholder')} className="h-11" />
          <p className="text-xs text-muted-foreground">{t('detailedCalc.terrainRaisingSurfaceAreaHelper')}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="terrainRaisingVolume" className="text-sm">{t('detailedCalc.terrainRaisingVolume')}</Label>
          <Input id="terrainRaisingVolume" type="number" min="0" value={formData.terrainRaisingVolume || ''} onChange={e => updateField('terrainRaisingVolume', parseFloat(e.target.value) || 0)} placeholder={t('detailedCalc.terrainRaisingVolumePlaceholder')} className="h-11" />
          <p className="text-xs text-muted-foreground">{t('detailedCalc.terrainRaisingVolumeHelper')}</p>
        </div>
      </div>}
    </div>;

  // ===== STEP 4: Details =====
  const renderStep4 = () => <div className="space-y-5">
      <div className="text-center pb-2">
        <p className="text-sm text-muted-foreground">{t('detailedCalc.buildingMethodFacilities')}</p>
      </div>

      {renderFieldWithTooltip('prefabricatedPercentage', t('detailedCalc.prefabPercentage'), t('detailedCalc.prefabTooltip'), t('detailedCalc.prefabHelper'), <Select value={formData.prefabricatedPercentage.toString()} onValueChange={value => updateField('prefabricatedPercentage', parseInt(value))}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder={t('detailedCalc.selectPercentage')} />
          </SelectTrigger>
          <SelectContent>
            {PREFAB_PERCENTAGES_KEYS.map(option => <SelectItem key={option.value} value={option.value.toString()}>
                {option.labelKey ? t(option.labelKey) : option.label}
              </SelectItem>)}
          </SelectContent>
        </Select>)}

      {renderFieldWithTooltip('parkingSpaces', t('detailedCalc.parkingSpaces'), t('detailedCalc.parkingTooltip'), t('detailedCalc.parkingHelper'), <Input id="parkingSpaces" type="number" min="0" value={formData.parkingSpaces || ''} onChange={e => updateField('parkingSpaces', parseInt(e.target.value) || 0)} placeholder="0" className="h-11" />)}

      {renderFieldWithTooltip('electricityAccess', t('detailedCalc.electricityAccess'), t('detailedCalc.electricityTooltip'), undefined, <Select value={formData.electricityAccess} onValueChange={(value: 'yes' | 'no') => updateField('electricityAccess', value)}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">{t('detailedCalc.yes')}</SelectItem>
            <SelectItem value="no">{t('detailedCalc.no')}</SelectItem>
          </SelectContent>
        </Select>)}
    </div>;

  // ===== STEP 5: Exploitation Phase - RESIDENTIAL SCENARIO =====
  const renderResidentialExploitation = () => {
    const system = formData.exploitationSystem;

    if (exploitationStep === 'q1') {
      return <div className="space-y-5">
          <div className="text-center pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 mb-3">
              <span>{t('detailedCalc.scenarioResidential')}</span>
            </div>
            <h3 className="font-semibold text-base">{t('detailedCalc.q1IdentifySystem')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('detailedCalc.q1ResidentialDesc')}</p>
          </div>
          <div className="space-y-3">
            <DecisionCard selected={system?.hasCombustionSystem === true} onClick={() => {
            updateExploitationField('hasCombustionSystem', true);
            updateExploitationField('excludeFromCalculation', false);
          }} title={t('detailedCalc.yesCombustion')} description={t('detailedCalc.yesCombustionDesc')} />
            <DecisionCard selected={system?.hasCombustionSystem === false} onClick={() => {
            updateExploitationField('hasCombustionSystem', false);
            updateExploitationField('excludeFromCalculation', true);
            updateExploitationField('exclusionReason', t('detailedCalc.noCombustionReason'));
            setExploitationStep('excluded');
          }} title={t('detailedCalc.noCombustion')} variant="success" />
          </div>
          {system?.hasCombustionSystem === true && <div className="space-y-3 pt-3 border-t">
              <Label className="text-sm">{t('detailedCalc.whatType')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {RESIDENTIAL_SYSTEM_TYPES_KEYS.map(type => <DecisionCard key={type.value} selected={system?.residentialSystemType === type.value} onClick={() => updateExploitationField('residentialSystemType', type.value as any)} title={t(type.labelKey)} />)}
              </div>
            </div>}
          {system?.hasCombustionSystem === true && system?.residentialSystemType && <Button type="button" onClick={() => setExploitationStep('q2')} className="w-full mt-4">
              {t('detailedCalc.nextQuestion')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>}
        </div>;
    }

    if (exploitationStep === 'q2') {
      return <div className="space-y-5">
          <div className="text-center pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 mb-3">
              <span>{t('detailedCalc.scenarioResidential')}</span>
            </div>
            <h3 className="font-semibold text-base">{t('detailedCalc.q2CheckStatus')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('detailedCalc.q2ResidentialDesc')}</p>
          </div>
          <div className="space-y-3">
            <DecisionCard selected={system?.isDecorativeOnly === false} onClick={() => {
            updateExploitationField('isDecorativeOnly', false);
            updateExploitationField('excludeFromCalculation', false);
          }} title={t('detailedCalc.yesMore100h')} description={t('detailedCalc.yesMore100hDesc')} />
            <DecisionCard selected={system?.isDecorativeOnly === true} onClick={() => {
            updateExploitationField('isDecorativeOnly', true);
            updateExploitationField('excludeFromCalculation', true);
            updateExploitationField('exclusionReason', t('detailedCalc.decorativeReason'));
            setExploitationStep('excluded');
          }} title={t('detailedCalc.noLess100h')} variant="success" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setExploitationStep('q1')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('detailedCalc.previous')}
            </Button>
            {system?.isDecorativeOnly === false && <Button type="button" onClick={() => setExploitationStep('q3')} className="flex-1">
                {t('detailedCalc.nextQuestion')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>}
          </div>
        </div>;
    }

    if (exploitationStep === 'q3') {
      return <div className="space-y-5">
          <div className="text-center pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 mb-3">
              <span>{t('detailedCalc.scenarioResidential')}</span>
            </div>
            <h3 className="font-semibold text-base">{t('detailedCalc.q3DetailedParams')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('detailedCalc.q3Desc')}</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">{t('detailedCalc.fuelType')}</Label>
              <Select value={system?.fuelType || ''} onValueChange={value => updateExploitationField('fuelType', value as any)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t('detailedCalc.selectFuelType')} />
                </SelectTrigger>
                <SelectContent>
                  {RESIDENTIAL_FUEL_TYPES_KEYS.map(fuel => <SelectItem key={fuel.value} value={fuel.value}>{t(fuel.labelKey)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatingHours" className="text-sm">{t('detailedCalc.annualOperatingHours')}</Label>
              <Input id="operatingHours" type="number" min="0" value={system?.operatingHoursAnnual || ''} onChange={e => updateExploitationField('operatingHoursAnnual', parseInt(e.target.value) || 0)} placeholder={t('detailedCalc.egHoursResidential')} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemPower" className="text-sm">{t('detailedCalc.systemPower')}</Label>
              <Input id="systemPower" type="number" min="0" step="0.1" value={system?.systemPowerKw || ''} onChange={e => updateExploitationField('systemPowerKw', parseFloat(e.target.value) || 0)} placeholder={t('detailedCalc.egPowerResidential')} className="h-11" />
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => setExploitationStep('q2')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('detailedCalc.previous')}
          </Button>
        </div>;
    }

    if (exploitationStep === 'excluded') {
      return <div className="space-y-5">
        <div className="text-center pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-3">
            <span>{t('detailedCalc.exploitationExcluded')}</span>
          </div>
          <h3 className="font-semibold text-base">{t('detailedCalc.exploitationExcludedTitle')}</h3>
        </div>
        <p className="text-xs text-muted-foreground text-center">{t('detailedCalc.clickCalculateToFinish')}</p>
      </div>;
    }
    return null;
  };

  // ===== STEP 5: Exploitation Phase - INDUSTRIAL SCENARIO =====
  const renderIndustrialExploitation = () => {
    const system = formData.exploitationSystem;

    if (exploitationStep === 'q1') {
      return <div className="space-y-5">
          <div className="text-center pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-medium text-orange-700 dark:text-orange-300 mb-3">
              <span>{t('detailedCalc.scenarioIndustrial')}</span>
            </div>
            <h3 className="font-semibold text-base">{t('detailedCalc.q1IdentifySystem')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('detailedCalc.q1IndustrialDesc')}</p>
          </div>
          <div className="space-y-3">
            <DecisionCard selected={system?.industrialSystemCategory === 'combustion'} onClick={() => {
            updateExploitationField('industrialSystemCategory', 'combustion');
            updateExploitationField('excludeFromCalculation', false);
          }} title={t('detailedCalc.hasCombustionSystem')} description={t('detailedCalc.hasCombustionSystemDesc')} />
            <DecisionCard selected={system?.industrialSystemCategory === 'electric_renewable'} onClick={() => {
            updateExploitationField('industrialSystemCategory', 'electric_renewable');
            updateExploitationField('excludeFromCalculation', true);
            updateExploitationField('exclusionReason', t('detailedCalc.electricRenewableReason'));
            setExploitationStep('excluded');
          }} title={t('detailedCalc.hasElectricRenewable')} variant="success" />
            <DecisionCard selected={system?.industrialSystemCategory === 'both'} onClick={() => {
            updateExploitationField('industrialSystemCategory', 'both');
            updateExploitationField('excludeFromCalculation', false);
          }} title={t('detailedCalc.hasBoth')} description={t('detailedCalc.hasBothDesc')} />
          </div>
          {(system?.industrialSystemCategory === 'combustion' || system?.industrialSystemCategory === 'both') && <Button type="button" onClick={() => setExploitationStep('q2')} className="w-full mt-4">
              {t('detailedCalc.nextQuestion')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>}
        </div>;
    }

    if (exploitationStep === 'q2') {
      return <div className="space-y-5">
          <div className="text-center pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-medium text-orange-700 dark:text-orange-300 mb-3">
              <span>{t('detailedCalc.scenarioIndustrial')}</span>
            </div>
            <h3 className="font-semibold text-base">{t('detailedCalc.q2CheckStatus')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('detailedCalc.q2IndustrialDesc')}</p>
          </div>
          <div className="space-y-3">
            <DecisionCard selected={system?.isRegularOperation === true} onClick={() => {
            updateExploitationField('isRegularOperation', true);
            updateExploitationField('isBackupEmergency', false);
            updateExploitationField('excludeFromCalculation', false);
          }} title={t('detailedCalc.regularOperation')} description={t('detailedCalc.regularOperationDesc')} />
            <DecisionCard selected={system?.isBackupEmergency === true} onClick={() => {
            updateExploitationField('isBackupEmergency', true);
            updateExploitationField('isRegularOperation', false);
            updateExploitationField('excludeFromCalculation', true);
            updateExploitationField('exclusionReason', t('detailedCalc.backupEmergencyReason'));
            setExploitationStep('excluded');
          }} title={t('detailedCalc.backupEmergency')} variant="success" />
          </div>
          {system?.isBackupEmergency !== true && <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p className="text-xs text-muted-foreground font-medium mb-2">{t('detailedCalc.backupExamples')}</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>{t('detailedCalc.backupEx1')}</li>
                <li>{t('detailedCalc.backupEx2')}</li>
                <li>{t('detailedCalc.backupEx3')}</li>
                <li>{t('detailedCalc.backupEx4')}</li>
                <li>{t('detailedCalc.backupEx5')}</li>
              </ul>
            </div>}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setExploitationStep('q1')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('detailedCalc.previous')}
            </Button>
            {system?.isRegularOperation === true && <Button type="button" onClick={() => setExploitationStep('q3')} className="flex-1">
                {t('detailedCalc.nextQuestion')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>}
          </div>
        </div>;
    }

    if (exploitationStep === 'q3') {
      return <div className="space-y-5">
          <div className="text-center pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-medium text-orange-700 dark:text-orange-300 mb-3">
              <span>{t('detailedCalc.scenarioIndustrial')}</span>
            </div>
            <h3 className="font-semibold text-base">{t('detailedCalc.q3DetailedParams')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('detailedCalc.q3Desc')}</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">{t('detailedCalc.fuelType')}</Label>
              <Select value={system?.fuelType || ''} onValueChange={value => updateExploitationField('fuelType', value as any)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t('detailedCalc.selectFuelType')} />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIAL_FUEL_TYPES_KEYS.map(fuel => <SelectItem key={fuel.value} value={fuel.value}>{t(fuel.labelKey)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatingHours" className="text-sm">{t('detailedCalc.annualOperatingHours')}</Label>
              <Input id="operatingHours" type="number" min="0" value={system?.operatingHoursAnnual || ''} onChange={e => updateExploitationField('operatingHoursAnnual', parseInt(e.target.value) || 0)} placeholder={t('detailedCalc.egHoursIndustrial')} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemPower" className="text-sm">{t('detailedCalc.systemPower')}</Label>
              <Input id="systemPower" type="number" min="0" step="0.1" value={system?.systemPowerKw || ''} onChange={e => updateExploitationField('systemPowerKw', parseFloat(e.target.value) || 0)} placeholder={t('detailedCalc.egPowerIndustrial')} className="h-11" />
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => setExploitationStep('q2')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('detailedCalc.previous')}
          </Button>
        </div>;
    }

    if (exploitationStep === 'excluded') {
      return <div className="space-y-5">
        <div className="text-center pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-3">
            <span>{t('detailedCalc.exploitationExcluded')}</span>
          </div>
          <h3 className="font-semibold text-base">{t('detailedCalc.exploitationExcludedTitle')}</h3>
          
        </div>
        <p className="text-xs text-muted-foreground text-center">{t('detailedCalc.clickCalculateToFinish')}</p>
      </div>;
    }
    return null;
  };

  // ===== STEP 5: Exploitation Phase Router =====
  const renderStep5 = () => {
    return <div className="space-y-4">
        {isResidential ? renderResidentialExploitation() : renderIndustrialExploitation()}
      </div>;
  };

  // Check if exploitation step is complete
  const isExploitationComplete = () => {
    const system = formData.exploitationSystem;
    if (system?.excludeFromCalculation) return true;
    if (exploitationStep === 'q3' && system?.fuelType && system?.operatingHoursAnnual && system?.systemPowerKw) return true;
    return false;
  };
  return <TooltipProvider>
      <Card className="max-w-lg mx-auto border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('detailedCalc.title')}</CardTitle>
              <CardDescription className="text-xs flex items-center gap-2">
                {project.name}
                {autoSaveIndicator && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground animate-in fade-in">
                    <Save className="h-3 w-3" /> Auto-saved
                  </span>
                )}
              </CardDescription>
            </div>
            <OxiCloudStatusBadge status={project.status} />
          </div>

          {/* Step indicator */}
          <div className="flex items-center mt-4 pt-4 py-[31px]">
            {BASE_STEP_KEYS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            return <React.Fragment key={step.id}>
                  <button type="button" onClick={() => setCurrentStep(step.id)} className={cn("flex flex-col items-center gap-1.5 transition-all flex-shrink-0", isActive && "scale-105")}>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors text-xs font-bold", isActive ? "bg-foreground text-background" : isComplete ? "bg-muted-foreground/25 text-background" : "bg-transparent text-muted-foreground")}>
                      {step.id}
                    </div>
                    <span className={cn("text-[10px] font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                      {t(step.titleKey)}
                    </span>
                  </button>
                  {idx < BASE_STEP_KEYS.length - 1 && <div className={cn("h-px flex-1 mx-1 -mt-5", isComplete ? "bg-muted-foreground/30" : "bg-border")} />}
                </React.Fragment>;
          })}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="min-h-[320px]">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6">
              <Button type="button" variant="ghost" onClick={currentStep === 1 ? onBack : prevStep} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 1 ? t('detailedCalc.back') : t('detailedCalc.previous')}
              </Button>

              {currentStep < 5 ? <Button type="button" onClick={nextStep} disabled={!isStepValid(currentStep)} className="gap-2">
                  {t('detailedCalc.next')}
                  <ArrowRight className="h-4 w-4" />
                </Button> : <Button type="submit" className="gap-2" disabled={!isExploitationComplete()}>
                  {t('detailedCalc.calculate')}
                </Button>}
            </div>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>;
}