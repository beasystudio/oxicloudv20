/**
 * Voorlopige Schattingen - 6 Screen Workflow
 * 
 * Screen 1: Basisgegevens - Multi-project-type selection with accordion
 * Screen 2: Project Locatie - CTA to start location flow
 * Screen 3-5: Map selection (Locatie → Perceel → Gebouwen)
 * Screen 6: Bevestigen - Environmental parameters confirmation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  PreEstimationData,
  MapFootprintData,
  ProjectTypeEntry,
  SloopEntry,
  PROJECT_TYPE_CATEGORIES,
  CONSTRUCTION_TYPES } from
'@/types/oxicloud';
import { ArrowLeft, ArrowRight, Plus, Trash2, ChevronDown, Info, Save, Check } from 'lucide-react';
import { CadastralMapSelector, CadastralMapResult } from './CadastralMapSelector';
import { QuoteGeneratingScreen } from './quote-flow/QuoteGeneratingScreen';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProjectTypePicker } from './ProjectTypePicker';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import { HelpClip } from '@/components/help/HelpClip';

interface PreEstimationFormProps {
  initialData?: PreEstimationData;
  initialAddress?: string; // Werflocatie address to auto-zoom map
  onSubmit: (data: PreEstimationData) => void;
  onBack?: () => void;
  onAutoSave?: (data: PreEstimationData) => void;
}

type FormScreen = 'basisgegevens' | 'map-flow' | 'generating' | 'opdracht';

// Translation key maps for category and subtype labels
const CATEGORY_LABEL_KEYS: Record<string, string> = {
  sloop: 'forms.projectTypes.sloop',
  residentieel: 'forms.projectTypes.residentieel',
  utiliteitsbouw: 'forms.projectTypes.utiliteitsbouw',
  industrieel_agrarisch: 'forms.projectTypes.industrieelAgrarisch',
  specifieke_projecttypes: 'forms.projectTypes.specifiekeProjecttypes',
};

const SUBTYPE_LABEL_KEYS: Record<string, string> = {
  eengezinswoningen: 'forms.projectTypes.eengezinswoningen',
  meergezinswoningen: 'forms.projectTypes.meergezinswoningen',
  sociale_woningbouw: 'forms.projectTypes.socialeWoningbouw',
  collectieve_woonvormen: 'forms.projectTypes.collectieveWoonvormen',
  kantoren: 'forms.projectTypes.kantoren',
  onderwijsgebouwen: 'forms.projectTypes.onderwijsgebouwen',
  gezondheidszorg: 'forms.projectTypes.gezondheidszorg',
  handelsgebouwen: 'forms.projectTypes.handelsgebouwen',
  cultuur_vrijetijd: 'forms.projectTypes.cultuurVrijetijd',
  industriele_gebouwen: 'forms.projectTypes.industrieleGebouwen',
  opslaggebouwen: 'forms.projectTypes.opslaggebouwen',
  agrarische_gebouwen: 'forms.projectTypes.agrarischeGebouwen',
  complexe_projecten: 'forms.projectTypes.complexeProjecten',
  openbare_werken: 'forms.projectTypes.openbareWerken',
};

const CONSTRUCTION_TYPE_KEYS: Record<string, string> = {
  nieuwbouw: 'forms.constructionTypes.nieuwbouw',
  renovatie: 'forms.constructionTypes.renovatie',
  bijbouw: 'forms.constructionTypes.bijbouw',
};

// Inline trigger + overlay wrapper for ProjectTypePicker
function ProjectTypePickerTrigger({ value, onSelect }: {value: string;onSelect: (v: string) => void;}) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const getTranslatedTypeLabel = (val: string) => {
    if (SUBTYPE_LABEL_KEYS[val]) return t(SUBTYPE_LABEL_KEYS[val]);
    if (CATEGORY_LABEL_KEYS[val]) return t(CATEGORY_LABEL_KEYS[val]);
    return val;
  };
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "h-10 w-full justify-start font-normal bg-muted/30 border-border/60",
          !value && "text-muted-foreground"
        )}>

        {value ? getTranslatedTypeLabel(value) : t('preEstimation.selectType')}
      </Button>
      <AnimatePresence>
        {open &&
        <ProjectTypePicker
          value={value}
          onSelect={onSelect}
          open={open}
          onOpenChange={setOpen} />

        }
      </AnimatePresence>
    </>);

}

export function PreEstimationForm({ initialData, initialAddress, onSubmit, onBack, onAutoSave }: PreEstimationFormProps) {
  const { t } = useLanguage();
  const [projectTypeEntries, setProjectTypeEntries] = useState<ProjectTypeEntry[]>(
    initialData?.projectTypeEntries || []
  );
  const [hasSloop, setHasSloop] = useState(initialData?.hasSloop || false);
  const [sloopEntry, setSloopEntry] = useState<SloopEntry>(
    initialData?.sloopEntry || { demolitionArea: 0, demolitionVolume: 0, description: '' }
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Restore cadastralData from initialData.mapData if available
  const [cadastralData, setCadastralData] = useState<CadastralMapResult | null>(() => {
    if (initialData?.mapData) {
      const coords: [number, number] = [initialData.mapData.projectCoordinates?.lat || 0, initialData.mapData.projectCoordinates?.lon || 0];
      return {
        address: '',
        coordinates: coords,
        plotCoordinates: (initialData.mapData.plotCoordinates || []) as [number, number][],
        buildingFootprints: (initialData.mapData.footprintCoords || []) as [number, number][][],
        nearestSPA: {
          name: initialData.mapData.sitename || '',
          code: initialData.mapData.sitecode || '',
          distance: initialData.mapData.distance || 0,
          kdw: initialData.mapData.kdw || 0
        }
      };
    }
    return null;
  });
  const [currentScreen, setCurrentScreen] = useState<FormScreen>('basisgegevens');

  // Legacy compat fields
  const [whatDemolish, setWhatDemolish] = useState(initialData?.whatDemolish || '');

  const buildFormData = useCallback((): PreEstimationData => {
    // Take first entry for legacy fields
    const first = projectTypeEntries[0];
    const mapData = cadastralData?.nearestSPA ? {
      distance: cadastralData.nearestSPA.distance,
      sitename: cadastralData.nearestSPA.name,
      sitecode: cadastralData.nearestSPA.code,
      kdw: cadastralData.nearestSPA.kdw,
      footprintCoords: cadastralData.buildingFootprints.map((f) => f.map((c) => [c[0], c[1]])),
      plotCoordinates: cadastralData.plotCoordinates.map((c) => [c[0], c[1]]),
      projectCoordinates: { lat: cadastralData.coordinates[0], lon: cadastralData.coordinates[1] }
    } : initialData?.mapData; // Preserve existing mapData if cadastralData not changed
    return {
      projectType: first?.projectTypeValue || '',
      constructionType: first?.constructionType || '',
      groundFloorArea: first?.gfa || 0,
      numberOfFloors: 1,
      demolitionVolume: sloopEntry.demolitionVolume,
      whatDemolish,
      projectTypeEntries,
      sloopEntry: hasSloop ? sloopEntry : undefined,
      hasSloop,
      mapData
    };
  }, [projectTypeEntries, sloopEntry, hasSloop, whatDemolish, cadastralData, initialData?.mapData]);

  // ── Auto-save with debounce ──
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  // Refs to avoid stale closures
  const buildFormDataRef = useRef(buildFormData);
  buildFormDataRef.current = buildFormData;
  const onAutoSaveRef = useRef(onAutoSave);
  onAutoSaveRef.current = onAutoSave;

  useEffect(() => {
    if (!onAutoSave) return;

    const data = buildFormData();
    const serialized = JSON.stringify(data);

    // Skip if nothing changed
    if (serialized === lastSavedRef.current) return;

    // Debounce: save after 1.5s of inactivity
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(() => {
      onAutoSave(data);
      lastSavedRef.current = serialized;
      setSaveStatus('saved');
      // Reset indicator after 2s
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [projectTypeEntries, sloopEntry, hasSloop, whatDemolish, cadastralData, onAutoSave, buildFormData]);

  // Save immediately on unmount / navigation away (uses refs to avoid stale closures)
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (onAutoSaveRef.current) {
        onAutoSaveRef.current(buildFormDataRef.current());
      }
    };
  }, []);

  const handleSubmit = () => {
    const data = buildFormData();
    if (!cadastralData) return;
    onSubmit(data);
  };

  const addProjectTypeEntry = () => {
    const newEntry: ProjectTypeEntry = { projectTypeValue: '', constructionType: '', gfa: 0, height: 0 };
    setProjectTypeEntries((prev) => [...prev, newEntry]);
    setExpandedIndex(projectTypeEntries.length);
  };

  const removeProjectTypeEntry = (index: number) => {
    setProjectTypeEntries((prev) => prev.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const updateEntry = (index: number, field: keyof ProjectTypeEntry, value: string | number) => {
    setProjectTypeEntries((prev) => prev.map((entry, i) =>
    i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const handleMapComplete = (result: CadastralMapResult) => {
    setCadastralData(result);
    setCurrentScreen('opdracht');
  };

  const handleGeneratingComplete = useCallback(() => {
    const data = buildFormData();
    onSubmit(data);
  }, [buildFormData, onSubmit]);

  const handleOpdrachtSubmit = () => setCurrentScreen('generating');

  // Validation
  const hasValidEntries = projectTypeEntries.length > 0 && projectTypeEntries.every(
    (e) => e.projectTypeValue && e.constructionType && e.gfa > 0 && e.height > 0
  );
  const isSloopValid = !hasSloop || sloopEntry.demolitionVolume > 0 && sloopEntry.description.length > 0;
  const isBasicsComplete = hasValidEntries && isSloopValid;
  const isOpdrachtComplete = !!whatDemolish;

  // ========== Screen: Generating Animation ==========
  if (currentScreen === 'generating') {
    return <QuoteGeneratingScreen onComplete={handleGeneratingComplete} />;
  }

  // ========== Screen: Map Flow (Full Screen) ==========
  if (currentScreen === 'map-flow') {
    return (
      <div className="h-full flex flex-col bg-background">
        <CadastralMapSelector
          initialData={initialAddress ? { address: initialAddress } : undefined}
          onComplete={handleMapComplete}
          onBack={() => setCurrentScreen('basisgegevens')} />

      </div>);

  }

  // ========== Screen 1: Basisgegevens ==========
  if (currentScreen === 'basisgegevens') {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <header className="shrink-0 px-6 pt-6 pb-4 border-b border-border/30">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            {onBack &&
            <Button variant="ghost" size="icon" onClick={() => {
              if (onAutoSave) onAutoSave(buildFormData());
              onBack();
            }} className="h-9 w-9 rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            }
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold tracking-tight">{t('preEstimation.title')}</h1>
                {onAutoSave &&
                <AnimatePresence mode="wait">
                    <motion.span
                    key={saveStatus}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex items-center gap-1 text-xs text-muted-foreground">
                      {saveStatus === 'saving' && <><Save className="h-3 w-3 animate-pulse" /><span>{t('preEstimation.saving')}</span></>}
                      {saveStatus === 'saved' && <><Check className="h-3 w-3 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">{t('preEstimation.saved')}</span></>}
                      {saveStatus === 'idle' && <><Save className="h-3 w-3" /><span>{t('preEstimation.autoSaveOn')}</span></>}
                    </motion.span>
                  </AnimatePresence>
                }
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex gap-1">
                  <span className="h-1.5 w-6 rounded-full bg-primary" />
                  <span className="h-1.5 w-6 rounded-full bg-muted" />
                  <span className="h-1.5 w-6 rounded-full bg-muted" />
                </div>
                <p className="text-xs text-muted-foreground">{t('preEstimation.step1of3')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto w-full space-y-8">

            {/* ── Sloop Toggle ── */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={hasSloop}
                  onCheckedChange={(checked) => setHasSloop(checked === true)} />
                <div>
                   <span className="text-sm font-semibold">{t('preEstimation.sloop')}</span>
                   <p className="text-xs text-muted-foreground mt-0.5">{t('preEstimation.sloopDesc')}</p>
                </div>
              </label>

              <AnimatePresence>
                {hasSloop &&
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden">
                    <div className="mt-5 pt-5 border-t border-border/40 space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">{t('preEstimation.sloopVolume')} <span className="text-destructive">*</span></Label>
                        <Input
                        type="number" min="0"
                        className="h-11 bg-muted/20 border-border/50 rounded-lg"
                        value={sloopEntry.demolitionVolume || ''}
                        onChange={(e) => setSloopEntry((prev) => ({ ...prev, demolitionVolume: parseFloat(e.target.value) || 0 }))}
                        placeholder={t('preEstimation.sloopVolumePlaceholder')} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">{t('preEstimation.sloopDescription')} <span className="text-destructive">*</span></Label>
                        <Textarea
                        className="min-h-[80px] text-sm resize-none rounded-lg"
                        value={sloopEntry.description}
                        onChange={(e) => setSloopEntry((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder={t('preEstimation.sloopDescPlaceholder')} />
                      </div>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>

            {/* ── Project Types Section ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-sm font-semibold text-foreground">{t('preEstimation.projectTypes')}</h2>
                   <p className="text-xs text-muted-foreground mt-0.5">{t('preEstimation.projectTypesDesc')}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addProjectTypeEntry}
                  className="h-9 text-xs gap-1.5 rounded-lg border-dashed">
                  <Plus className="h-3.5 w-3.5" />
                  {t('preEstimation.addType')}
                </Button>
              </div>

              {projectTypeEntries.length === 0 &&
              <div className="rounded-xl border-2 border-dashed border-border/50 p-10 text-center bg-muted/10">
                  


                   <p className="text-sm font-medium text-muted-foreground">{t('preEstimation.noTypeAdded')}</p>
                   <p className="text-xs text-muted-foreground/70 mt-1">{t('preEstimation.clickToStart')}</p>
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={addProjectTypeEntry}
                  className="mt-4 text-xs gap-1.5 rounded-lg">
                    <Plus className="h-3.5 w-3.5" />
                    {t('preEstimation.addFirstType')}
                  </Button>
                </div>
              }

              {/* Accordion entries */}
              <div className="space-y-3">
                {projectTypeEntries.map((entry, index) => {
                  const isExpanded = expandedIndex === index;
                  const isComplete = !!entry.projectTypeValue && !!entry.constructionType && entry.gfa > 0 && entry.height > 0;
                  return (
                    <motion.div
                      key={index}
                      layout
                      className={cn(
                        "rounded-xl border bg-card shadow-sm overflow-hidden transition-colors",
                        isExpanded ? "border-primary/30 ring-1 ring-primary/10" : "border-border"
                      )}>
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : index)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 text-left min-w-0">
                          <div className={cn(
                            "flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold shrink-0",
                            isComplete ?
                            "bg-primary/10 text-primary" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-semibold block truncate">
                              {entry.projectTypeValue ?
                               (SUBTYPE_LABEL_KEYS[entry.projectTypeValue] ? t(SUBTYPE_LABEL_KEYS[entry.projectTypeValue]) : CATEGORY_LABEL_KEYS[entry.projectTypeValue] ? t(CATEGORY_LABEL_KEYS[entry.projectTypeValue]) : entry.projectTypeValue) :
                               t('preEstimation.newProjectType')}
                            </span>
                            {entry.constructionType &&
                            <span className="text-xs text-muted-foreground block mt-0.5">
                                {CONSTRUCTION_TYPE_KEYS[entry.constructionType] ? t(CONSTRUCTION_TYPE_KEYS[entry.constructionType]) : entry.constructionType}
                                {entry.gfa > 0 && ` · ${entry.gfa} m²`}
                                {entry.height > 0 && ` · ${entry.height} m`}
                              </span>
                            }
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {projectTypeEntries.length > 1 &&
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {e.stopPropagation();removeProjectTypeEntry(index);}}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          <ChevronDown className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )} />
                        </div>
                      </button>

                      {/* Accordion Content */}
                      <AnimatePresence>
                        {isExpanded &&
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                            <div className="px-5 pb-5 pt-1 border-t border-border/30 space-y-6">

                              {/* Projecttype - Main category pills */}
                              <div className="space-y-3">
                                <Label className="text-sm font-semibold">{t('preEstimation.projectType')} <span className="text-destructive">*</span></Label>
                                <div className="grid grid-cols-2 gap-2">
                                  {PROJECT_TYPE_CATEGORIES.filter((c) => c.value !== 'sloop').map((cat) => {
                                  const isSelected = cat.subtypes.length === 0 ?
                                  entry.projectTypeValue === cat.value :
                                  cat.subtypes.some((s) => s.value === entry.projectTypeValue);
                                  return (
                                    <button
                                      key={cat.value}
                                      type="button"
                                      onClick={() => {
                                        if (cat.subtypes.length === 0) {
                                          updateEntry(index, 'projectTypeValue', cat.value);
                                        } else {
                                          updateEntry(index, 'projectTypeValue', cat.subtypes[0].value);
                                        }
                                      }}
                                      className={cn(
                                        "px-4 py-2.5 rounded-lg text-xs font-medium transition-all border text-left",
                                        isSelected ?
                                        "bg-muted/50 text-foreground border-foreground/20 shadow-sm" :
                                        "bg-muted/20 text-foreground border-border/50 hover:bg-muted/40 hover:border-border"
                                      )}>
                                        {CATEGORY_LABEL_KEYS[cat.value] ? t(CATEGORY_LABEL_KEYS[cat.value]).replace(/\s*\(.*\)/, '') : cat.label.replace(/\s*\(.*\)/, '')}
                                      </button>);

                                })}
                                </div>
                              </div>

                              {/* Subtype pills - show subtypes of selected category */}
                              {(() => {
                              const selectedCat = PROJECT_TYPE_CATEGORIES.find((c) =>
                              c.subtypes.some((s) => s.value === entry.projectTypeValue)
                              );
                              if (!selectedCat || selectedCat.subtypes.length === 0) return null;
                              return (
                                <motion.div
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="space-y-2">
                                    <div className="flex items-center gap-1.5">
                                      <Label className="text-xs font-medium text-muted-foreground">{t('preEstimation.subtype')}</Label>
                                      <HelpClip clipId="multiple-subtypes" />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedCat.subtypes.map((sub) => {
                                      const isActive = entry.projectTypeValue === sub.value;
                                      return (
                                        <button
                                          key={sub.value}
                                          type="button"
                                          onClick={() => updateEntry(index, 'projectTypeValue', sub.value)}
                                          className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs transition-all border inline-flex items-center gap-1.5",
                                            isActive ?
                                            "bg-foreground text-background border-foreground shadow-sm" :
                                            "bg-card text-foreground border-border/50 hover:bg-muted/30"
                                          )}>
                                            {SUBTYPE_LABEL_KEYS[sub.value] ? t(SUBTYPE_LABEL_KEYS[sub.value]) : sub.label.replace(/^\d+\.\d+\s*/, '')}
                                            {isActive && <Check className="h-3.5 w-3.5" />}
                                          </button>);

                                    })}
                                    </div>
                                  </motion.div>);

                            })()}

                              {/* Constructietype dropdown */}
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold">{t('preEstimation.constructionType')} <span className="text-destructive">*</span></Label>
                                <Select
                                value={entry.constructionType}
                                onValueChange={(v) => updateEntry(index, 'constructionType', v)}>
                                  <SelectTrigger className="h-11 bg-muted/20 border-border/50 rounded-lg max-w-xs">
                                    <SelectValue placeholder={t('preEstimation.selectType')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CONSTRUCTION_TYPES.map((type) =>
                                  <SelectItem key={type.value} value={type.value}>{CONSTRUCTION_TYPE_KEYS[type.value] ? t(CONSTRUCTION_TYPE_KEYS[type.value]) : type.label}</SelectItem>
                                  )}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* GFA + Height - side by side */}
                              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/20">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5">
                                    <Label className="text-sm font-semibold">{t('preEstimation.grossFloorArea')} <span className="text-destructive">*</span></Label>
                                    <HelpClip clipId="building-surface-gross-net" />
                                  </div>
                                  <Input
                                  type="number" min="0"
                                  className="h-11 bg-muted/20 border-border/50 rounded-lg"
                                  value={entry.gfa || ''}
                                  onChange={(e) => updateEntry(index, 'gfa', parseFloat(e.target.value) || 0)}
                                   placeholder={t('preEstimation.gfaPlaceholder')} />
                                   <p className="text-[11px] text-muted-foreground/60">{t('preEstimation.grossFloorAreaDesc')}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold">{t('preEstimation.height')} <span className="text-destructive">*</span></Label>
                                  <Input
                                  type="number" min="0" step="0.1"
                                  className="h-11 bg-muted/20 border-border/50 rounded-lg"
                                  value={entry.height || ''}
                                  onChange={(e) => updateEntry(index, 'height', parseFloat(e.target.value) || 0)}
                                   placeholder={t('preEstimation.heightPlaceholder')} />
                                   <p className="text-[11px] text-muted-foreground/60">{t('preEstimation.heightDesc')}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        }
                      </AnimatePresence>
                    </motion.div>);
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <footer className="shrink-0 px-6 py-5 border-t border-border/30 bg-background">
          <div className="max-w-2xl mx-auto">
             <Button onClick={() => setCurrentScreen(cadastralData ? 'opdracht' : 'map-flow')} disabled={!isBasicsComplete} className="w-full h-12 rounded-xl text-base font-semibold" size="lg">
               {t('preEstimation.next')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </footer>
      </div>);

  }

  // ========== Screen 3: Opdracht ==========
  if (currentScreen === 'opdracht') {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <header className="shrink-0 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setCurrentScreen(cadastralData ? 'basisgegevens' : 'map-flow')} className="h-9 w-9 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-medium">{t('preEstimation.title')}</h1>
                {onAutoSave &&
                <AnimatePresence mode="wait">
                    <motion.span
                    key={saveStatus}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex items-center gap-1 text-xs text-muted-foreground">

                       {saveStatus === 'saving' &&
                    <>
                           <Save className="h-3 w-3 animate-pulse" />
                           <span>{t('preEstimation.saving')}</span>
                         </>
                    }
                       {saveStatus === 'saved' &&
                    <>
                           <Check className="h-3 w-3 text-emerald-500" />
                           <span className="text-emerald-600 dark:text-emerald-400">{t('preEstimation.saved')}</span>
                         </>
                    }
                       {saveStatus === 'idle' &&
                    <>
                           <Save className="h-3 w-3" />
                           <span>{t('preEstimation.autoSaveOn')}</span>
                         </>
                    }
                    </motion.span>
                  </AnimatePresence>
                }
              </div>
              <p className="text-xs text-muted-foreground">{t('preEstimation.step3of3')}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-[34px]">
          <div className="max-w-md mx-auto w-full space-y-5">
            {/* Saved location summary */}
            {cadastralData &&
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                 <div className="flex items-center justify-between">
                   <p className="text-sm font-medium">{t('preEstimation.siteLocation')}</p>
                   <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCurrentScreen('map-flow')}>
                     {t('preEstimation.changeLocation')}
                  </Button>
                </div>
                {cadastralData.nearestSPA &&
              <div className="text-xs text-muted-foreground space-y-0.5">
                     <p>SBZ: {cadastralData.nearestSPA.name} ({cadastralData.nearestSPA.code})</p>
                     <p>{t('preEstimation.distance')}: {cadastralData.nearestSPA.distance.toFixed(0)}m · KDW: {cadastralData.nearestSPA.kdw} mol/ha/j</p>
                  </div>
              }
              </div>
            }
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div>
               <p className="text-sm font-medium text-primary">{t('preEstimation.assignment')}</p>
                 <p className="text-xs text-muted-foreground mt-1">
                   {t('preEstimation.assignmentDesc')}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{t('preEstimation.existingChanges')}</Label>
                <Textarea
                  className="min-h-[100px] text-sm resize-none"
                  value={whatDemolish}
                  onChange={(e) => setWhatDemolish(e.target.value)}
                  placeholder={t('preEstimation.existingChangesPlaceholder')} />

              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <footer className="shrink-0 px-6 py-4 bg-background">
          <div className="max-w-md mx-auto">
             <Button onClick={handleOpdrachtSubmit} disabled={!isOpdrachtComplete} className="w-full h-12" size="lg">
               {t('preEstimation.confirm')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </footer>
      </div>);

  }

  return null;
}