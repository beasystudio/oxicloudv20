import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

import { useSplitPhase } from './useSplitPhase';
import { MOCK_ORIGINAL_DATA } from './splitPhaseEngine';
import { SPEntryScreen } from './SPEntryScreen';
import { SPStap1Screen } from './SPStap1Screen';
import { SPStap2Screen } from './SPStap2Screen';
import { SPStap3Screen } from './SPStap3Screen';
import { SPStap4Screen } from './SPStap4Screen';
import { SPCompletion1Screen } from './SPCompletion1Screen';
import { SPCompletion2Screen } from './SPCompletion2Screen';
import { SPBinderCard } from './SPBinderCard';

interface SplitPhaseFlowProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onComplete: () => void;
  onBack: () => void;
}

export function SplitPhaseFlow({ project, results, onComplete, onBack }: SplitPhaseFlowProps) {
  const { t } = useLanguage();
  const sp = useSplitPhase();
  const { session } = sp;

  const handleExport = (phase: string) => {
    sp.exportReport(phase);
    toast.info(`${phase} report preparing...`);
  };

  return (
    <div className="relative">
      {/* NL | EN toggle */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageToggle />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={session.currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {session.currentStep === 'entry' && (
            <SPEntryScreen
              excessPercent={sp.excessPercent}
              onContinue={sp.runCalculation}
              onBack={onBack}
            />
          )}

          {session.currentStep === 'stap1' && session.calcResult && (
            <SPStap1Screen
              calcResult={session.calcResult}
              onContinue={sp.goToStap2}
              onBack={() => sp.goBack('stap1')}
            />
          )}

          {session.currentStep === 'stap2' && session.calcResult && (
            <SPStap2Screen
              calcResult={session.calcResult}
              totalFootprintM2={MOCK_ORIGINAL_DATA.totalFootprintM2}
              onConfirm={sp.confirmFootprint}
              onBack={() => sp.goBack('stap2')}
            />
          )}

          {session.currentStep === 'stap3' && session.phase1Data && session.phase2Data && (
            <SPStap3Screen
              phase1={session.phase1Data}
              phase2={session.phase2Data}
              onContinue={sp.goToStap4}
              onBack={() => sp.goBack('stap3')}
            />
          )}

          {session.currentStep === 'stap4' && session.phase1Data && session.phase2Data && (
            <SPStap4Screen
              phase1={session.phase1Data}
              phase2={session.phase2Data}
              checkboxes={session.checkboxes}
              onToggleCheckbox={sp.toggleCheckbox}
              onConfirm={sp.generateReports}
              onBack={() => sp.goBack('stap4')}
            />
          )}

          {session.currentStep === 'completion1' && session.phase1Data && session.phase2Data && (
            <SPCompletion1Screen
              phase1={session.phase1Data}
              phase2={session.phase2Data}
              projectName={project.name}
              onExportPhase1={() => handleExport('Phase 1')}
              onExportPhase2={() => handleExport('Phase 2')}
              onContinue={sp.goToCompletion2}
              onBackToProjects={onComplete}
            />
          )}

          {session.currentStep === 'completion2' && (
            <SPCompletion2Screen
              onContinue={onComplete}
              onBackToProjects={onComplete}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
