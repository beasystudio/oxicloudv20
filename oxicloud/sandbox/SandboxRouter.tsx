import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SandboxEmissionType } from '@/types/sandbox';
import { CalculationResults } from '@/types/oxicloud';
import { BouwfasePuntbronnenSandbox } from './BouwfasePuntbronnenSandbox';
import { BouwfaseLijnbronnenSandbox } from './BouwfaseLijnbronnenSandbox';
import { ExploitatiePuntbronnenSandbox } from './ExploitatiePuntbronnenSandbox';
import { ExploitatieLijnbronnenSandbox } from './ExploitatieLijnbronnenSandbox';
import { useLanguage } from '@/i18n/LanguageContext';

interface SandboxRouterProps {
  initialType: SandboxEmissionType;
  exceedingTypes: SandboxEmissionType[];
  onComplete: () => void;
  onBack: () => void;
  results?: CalculationResults;
}

export function SandboxRouter({ initialType, exceedingTypes, onComplete, onBack, results }: SandboxRouterProps) {
  const { t } = useLanguage();
  const [currentType, setCurrentType] = useState<SandboxEmissionType>(initialType);
  const [completedTypes, setCompletedTypes] = useState<Set<SandboxEmissionType>>(new Set());
  const [showSelector, setShowSelector] = useState(exceedingTypes.length > 1);

  const SANDBOX_LABELS: Record<SandboxEmissionType, { label: string; phase: string; description: string }> = {
    bouwfase_puntbronnen: { label: t('sandbox.pointSources'), phase: t('sandbox.constructionPhase'), description: t('sandbox.stationaryEquipmentEmissions') },
    bouwfase_lijnbronnen_lv: { label: t('sandbox.lineSourcesLV'), phase: t('sandbox.constructionPhase'), description: t('sandbox.lightVehicleMovements') },
    bouwfase_lijnbronnen_hv: { label: t('sandbox.lineSourcesHV'), phase: t('sandbox.constructionPhase'), description: t('sandbox.heavyVehicleMovements') },
    exploitatie_puntbronnen: { label: t('sandbox.pointSources'), phase: t('sandbox.operationalPhase'), description: t('sandbox.heatingSystemEmissions') },
    exploitatie_lijnbronnen: { label: t('sandbox.lineSources'), phase: t('sandbox.operationalPhase'), description: t('sandbox.operationalTraffic') },
  };

  const handleSandboxComplete = () => {
    setCompletedTypes(prev => new Set([...prev, currentType]));
    const newCompleted = new Set([...completedTypes, currentType]);
    if (exceedingTypes.every(type => newCompleted.has(type))) { onComplete(); } else { setShowSelector(true); }
  };

  const handleSelectSandbox = (type: SandboxEmissionType) => { setCurrentType(type); setShowSelector(false); };

  if (showSelector) {
    const remainingTypes = exceedingTypes.filter(type => !completedTypes.has(type));
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">{t('sandbox.title')}</h1>
            <p className="text-lg text-muted-foreground">{t('sandbox.selectSandbox')}</p>
            {completedTypes.size > 0 && (
              <p className="text-sm text-primary mt-2">
                {t('sandbox.completedCount').replace('{completed}', String(completedTypes.size)).replace('{total}', String(exceedingTypes.length))}
              </p>
            )}
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {remainingTypes.map((type, index) => {
              const config = SANDBOX_LABELS[type];
              return (
                <motion.button key={type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} onClick={() => handleSelectSandbox(type)} className="bg-background rounded-2xl border border-border/50 p-6 text-left hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 rounded-lg bg-secondary text-xs font-bold uppercase tracking-wide">{config.phase}</span>
                    <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{config.label}</h3>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </motion.button>
              );
            })}
          </div>
          {completedTypes.size > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">{t('sandbox.completed')}</h3>
              <div className="flex flex-wrap gap-3">
                {Array.from(completedTypes).map(type => {
                  const config = SANDBOX_LABELS[type];
                  return <span key={type} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium">{config.phase} - {config.label}</span>;
                })}
              </div>
            </div>
          )}
          <div className="mt-12">
            <Button variant="ghost" onClick={onBack} className="rounded-xl">{t('sandbox.backToOverview')}</Button>
          </div>
        </div>
      </div>
    );
  }

  const sandboxProps = { onComplete: handleSandboxComplete, onBack: exceedingTypes.length > 1 ? () => setShowSelector(true) : onBack, results };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={currentType} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        {currentType === 'bouwfase_puntbronnen' && <BouwfasePuntbronnenSandbox {...sandboxProps} />}
        {(currentType === 'bouwfase_lijnbronnen_lv' || currentType === 'bouwfase_lijnbronnen_hv') && <BouwfaseLijnbronnenSandbox {...sandboxProps} />}
        {currentType === 'exploitatie_puntbronnen' && <ExploitatiePuntbronnenSandbox {...sandboxProps} />}
        {currentType === 'exploitatie_lijnbronnen' && <ExploitatieLijnbronnenSandbox {...sandboxProps} />}
      </motion.div>
    </AnimatePresence>
  );
}
