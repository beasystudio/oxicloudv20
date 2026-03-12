/**
 * Two-step sliding overlay for Project Type selection.
 * Step 1: Show main categories (with tooltips).
 * Step 2: Slide in subtypes panel for the selected category.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft, Check } from 'lucide-react';
import { PROJECT_TYPE_CATEGORIES, ProjectTypeCategory } from '@/types/oxicloud';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

interface ProjectTypePickerProps {
  value: string;
  onSelect: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Strip numeric prefix like "1.1 ", "2.3 " from labels
function stripNumberPrefix(label: string): string {
  return label.replace(/^\d+\.\d+\s*/, '');
}

// Map category/subtype values to translation keys
const CATEGORY_LABEL_KEYS: Record<string, string> = {
  sloop: 'forms.projectTypes.sloop',
  residentieel: 'forms.projectTypes.residentieel',
  utiliteitsbouw: 'forms.projectTypes.utiliteitsbouw',
  industrieel_agrarisch: 'forms.projectTypes.industrieelAgrarisch',
  specifieke_projecttypes: 'forms.projectTypes.specifiekeProjecttypes',
};

const CATEGORY_TOOLTIP_KEYS: Record<string, string> = {
  sloop: 'forms.projectTypes.sloopTooltip',
  residentieel: 'forms.projectTypes.residentieelTooltip',
  utiliteitsbouw: 'forms.projectTypes.utiliteitsbouwTooltip',
  industrieel_agrarisch: 'forms.projectTypes.industrieelAgrarischTooltip',
  specifieke_projecttypes: 'forms.projectTypes.specifiekeProjecttypesTooltip',
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

export function ProjectTypePicker({ value, onSelect, open, onOpenChange }: ProjectTypePickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectTypeCategory | null>(null);
  const { t } = useLanguage();

  const mainCategories = PROJECT_TYPE_CATEGORIES.filter((cat) => cat.value !== 'sloop');

  const getCategoryLabel = (cat: ProjectTypeCategory) => {
    return CATEGORY_LABEL_KEYS[cat.value] ? t(CATEGORY_LABEL_KEYS[cat.value]) : cat.label;
  };

  const getCategoryTooltip = (cat: ProjectTypeCategory) => {
    return CATEGORY_TOOLTIP_KEYS[cat.value] ? t(CATEGORY_TOOLTIP_KEYS[cat.value]) : cat.tooltip;
  };

  const getSubtypeLabel = (sub: { value: string; label: string }) => {
    return SUBTYPE_LABEL_KEYS[sub.value] ? t(SUBTYPE_LABEL_KEYS[sub.value]) : stripNumberPrefix(sub.label);
  };

  const handleCategoryClick = (cat: ProjectTypeCategory) => {
    if (cat.subtypes.length === 0) {
      onSelect(cat.value);
      onOpenChange(false);
      setSelectedCategory(null);
    } else {
      setSelectedCategory(cat);
    }
  };

  const handleSubtypeClick = (subtypeValue: string) => {
    onSelect(subtypeValue);
    onOpenChange(false);
    setSelectedCategory(null);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setSelectedCategory(null), 200);
  };

  const activeCategory = mainCategories.find((cat) =>
    cat.subtypes.some((sub) => sub.value === value)
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto flex rounded-xl border border-border bg-popover shadow-2xl overflow-hidden max-w-[680px] w-full mx-4"
          style={{ minHeight: 340 }}>

          <motion.div
            className="flex flex-col w-full shrink-0"
            animate={{ width: selectedCategory ? '50%' : '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}>
            <div className="px-5 pt-4 pb-3 border-b border-border/50">
              <h3 className="text-sm font-semibold text-foreground">{t('forms.projectTypePicker.chooseType')}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t('forms.projectTypePicker.selectCategory')}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {mainCategories.map((cat) => {
                const isActive = activeCategory?.value === cat.value || selectedCategory?.value === cat.value;
                const tooltip = getCategoryTooltip(cat);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left transition-colors group",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                    )}>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">{getCategoryLabel(cat)}</span>
                      {tooltip && <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{tooltip}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {tooltip && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <span />
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-[220px]">
                              <p className="text-xs">{tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {cat.subtypes.length > 0 && (
                        <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isActive && "text-primary")} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {selectedCategory && (
              <motion.div
                key={selectedCategory.value}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '50%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="flex flex-col border-l border-border/50 overflow-hidden shrink-0">
                <div className="px-5 pt-4 pb-3 border-b border-border/50 flex items-center gap-2">
                  <button type="button" onClick={handleBack} className="h-6 w-6 rounded-md hover:bg-muted/50 flex items-center justify-center transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{getCategoryLabel(selectedCategory)}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('forms.projectTypePicker.chooseSubtype')}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {selectedCategory.subtypes.map((sub) => {
                    const isSelected = value === sub.value;
                    return (
                      <button
                        key={sub.value}
                        type="button"
                        onClick={() => handleSubtypeClick(sub.value)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                          isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"
                        )}>
                        <span className="text-sm font-medium flex-1">{getSubtypeLabel(sub)}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
