import { useState } from 'react';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { SandboxEmissionType } from '@/types/sandbox';
import { NoxProcessingScreen } from './nox-results/NoxProcessingScreen';
import { NoxPassResultScreen } from './nox-results/NoxPassResultScreen';
import { NoxDetailedReportScreen } from './nox-results/NoxDetailedReportScreen';
import { NoxCommissionScreen } from './nox-results/NoxCommissionScreen';
import { NoxExceedanceScreen } from './nox-results/NoxExceedanceScreen';
import { NoxComplianceAchievedScreen } from './nox-results/NoxComplianceAchievedScreen';
import { SettlementPlatformStep } from './quote-flow/SettlementPlatformStep';
import { SandboxRouter, SandboxWorkspace } from './sandbox';
import { SplitPhaseFlow } from './split-phase';
import { PassendeBeoordelingFlow } from './passende-beoordeling';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

type ComplianceMethod = 'sandbox' | 'split_phase' | 'passende_beoordeling';

type ResultFlowStep = 
  | 'processing'
  | 'pass_result'
  | 'detailed_report'
  | 'commission'
  | 'settlement'
  | 'exceedance'
  | 'sandbox'
  | 'split_phase'
  | 'passende_beoordeling'
  | 'compliance_achieved';

interface NoxResultFlowProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onBackToProjects: () => void;
  onRecalculate: () => void;
}

// Helper to determine which sandbox types are exceeding
function getExceedingSandboxTypes(results: CalculationResults): SandboxEmissionType[] {
  const types: SandboxEmissionType[] = [];
  
  if (results.percent_stationary > 1) {
    types.push('bouwfase_puntbronnen');
  }
  if (results.percent_light_construction > 1) {
    types.push('bouwfase_lijnbronnen_lv');
  }
  if (results.percent_heavy_construction > 1) {
    types.push('bouwfase_lijnbronnen_hv');
  }
  if (results.percent_light_operation > 1) {
    types.push('exploitatie_lijnbronnen');
  }
  if (results.percent_heavy_operation > 1) {
    types.push('exploitatie_lijnbronnen');
  }
  
  // Remove duplicates
  return [...new Set(types)];
}

// Map recommendation ID to sandbox type
function mapRecommendationToSandbox(recId: string): SandboxEmissionType | null {
  switch (recId) {
    case 'adjust_construction':
    case 'optimize_equipment':
      return 'bouwfase_puntbronnen';
    case 'adjust_traffic':
      return 'bouwfase_lijnbronnen_lv';
    case 'adjust_heating':
      return 'exploitatie_puntbronnen';
    case 'reduce_traffic':
      return 'exploitatie_lijnbronnen';
    default:
      return null;
  }
}

export function NoxResultFlow({
  project,
  results,
  onBackToProjects,
  onRecalculate,
}: NoxResultFlowProps) {
  const { t } = useLanguage();
  const isCompliant = results.compliance_status === 'compliant';
  
  // Persist & restore step: if non-compliant project returns, skip processing
  const getStoredStep = (): ResultFlowStep => {
    try {
      const stored = sessionStorage.getItem(`nox_result_step_${project.id}`);
      if (stored && ['exceedance', 'pass_result', 'detailed_report', 'commission', 'settlement', 'sandbox', 'split_phase', 'passende_beoordeling', 'compliance_achieved'].includes(stored)) {
        return stored as ResultFlowStep;
      }
    } catch {}
    return 'processing';
  };

  const [currentStep, setCurrentStep] = useState<ResultFlowStep>(getStoredStep);
  const [complianceMethod, setComplianceMethod] = useState<ComplianceMethod>('sandbox');

  // Persist step changes
  const changeStep = (step: ResultFlowStep) => {
    setCurrentStep(step);
    try {
      sessionStorage.setItem(`nox_result_step_${project.id}`, step);
    } catch {}
  };

  const handleProcessingComplete = () => {
    changeStep(isCompliant ? 'pass_result' : 'exceedance');
  };
  const [sandboxType, setSandboxType] = useState<SandboxEmissionType>('bouwfase_puntbronnen');
  const [exceedingTypes, setExceedingTypes] = useState<SandboxEmissionType[]>(() => 
    getExceedingSandboxTypes(results)
  );

  // Pass flow handlers
  const handleConfirmReports = () => {
    changeStep('detailed_report');
  };

  const handleConfirmGenerate = () => {
    toast.success(t('noxResultFlow.reportGenerated'));
    changeStep('commission');
  };

  const handleCancelReport = () => {
    changeStep('pass_result');
  };

  const handleClaimCommission = () => {
    changeStep('settlement');
  };

  const handleSettlementComplete = () => {
    toast.success(t('noxResultFlow.compensationClaimed'), {
      description: t('noxResultFlow.compensationDesc'),
    });
    onBackToProjects();
  };

  const handleSettlementBack = () => {
    changeStep('commission');
  };

  const handleDownloadReport = () => {
    toast.info(t('noxResultFlow.preparingDownload'), {
      description: t('noxResultFlow.pdfReady'),
    });
  };

  const handleExportOptions = () => {
    toast.info(t('noxResultFlow.exportOptions'), {
      description: t('noxResultFlow.exportDesc'),
    });
  };

  // Exceedance flow handlers
  const handleAdjustParameter = (category: string) => {
    const mappedType = mapRecommendationToSandbox(category);
    if (mappedType) {
      setSandboxType(mappedType);
      // Set exceeding types based on recommendation
      const types = getExceedingSandboxTypes(results);
      setExceedingTypes(types.length > 0 ? types : [mappedType]);
      changeStep('sandbox');
    } else {
      toast.info(`Adjusting ${category}`, {
        description: 'Redirecting to the calculation form...',
      });
      onRecalculate();
    }
  };

  const handleSplitPhases = () => {
    changeStep('split_phase');
  };

  const handleRequestPassendeBeoordeling = () => {
    changeStep('passende_beoordeling');
  };

  const handlePassendeBeoordelingComplete = () => {
    setComplianceMethod('passende_beoordeling');
    changeStep('compliance_achieved');
  };

  const handleSplitPhaseComplete = () => {
    setComplianceMethod('split_phase');
    changeStep('compliance_achieved');
  };

  const handleSandboxComplete = () => {
    setComplianceMethod('sandbox');
    changeStep('compliance_achieved');
  };

  const handleSandboxBack = () => {
    changeStep('exceedance');
  };

  // Render current step
  switch (currentStep) {
    case 'processing':
      return <NoxProcessingScreen onComplete={handleProcessingComplete} />;

    case 'pass_result':
      return (
        <NoxPassResultScreen
          project={project}
          results={results}
          onConfirmReports={handleConfirmReports}
          onBack={onBackToProjects}
        />
      );

    case 'detailed_report':
      return (
        <NoxDetailedReportScreen
          project={project}
          onConfirmGenerate={handleConfirmGenerate}
          onCancel={handleCancelReport}
        />
      );

    case 'commission':
      return (
        <NoxCommissionScreen
          project={project}
          results={results}
          onClaimCommission={handleClaimCommission}
          onDownloadReport={handleDownloadReport}
          onExportOptions={handleExportOptions}
          onBack={onBackToProjects}
        />
      );

    case 'settlement':
      return (
        <SettlementPlatformStep
          projectName={project.name}
          projectReference={`NOX-${project.id.slice(0, 8).toUpperCase()}`}
          partnerCompanyName="GDesign Architecten"
          partnerVatNumber="BE0123.456.789"
          settlementAmount={125.00}
          hasFinancialAccess={true}
          onComplete={handleSettlementComplete}
          onBack={handleSettlementBack}
        />
      );

    case 'exceedance':
      return (
        <NoxExceedanceScreen
          project={project}
          results={results}
          onAdjustParameter={handleAdjustParameter}
          onSplitPhases={handleSplitPhases}
          onRequestPassendeBeoordeling={handleRequestPassendeBeoordeling}
          onBackToProjects={onBackToProjects}
        />
      );

    case 'sandbox':
      return (
        <SandboxWorkspace
          onComplete={handleSandboxComplete}
          onBack={handleSandboxBack}
        />
      );

    case 'split_phase':
      return (
        <SplitPhaseFlow
          project={project}
          results={results}
          onComplete={handleSplitPhaseComplete}
          onBack={() => changeStep('exceedance')}
        />
      );

    case 'passende_beoordeling':
      return (
        <PassendeBeoordelingFlow
          project={project}
          results={results}
          onComplete={handlePassendeBeoordelingComplete}
          onBack={() => changeStep('exceedance')}
        />
      );

    case 'compliance_achieved':
      return (
        <NoxComplianceAchievedScreen
          project={project}
          method={complianceMethod}
          onContinueToReport={() => changeStep('detailed_report')}
          onBackToProjects={onBackToProjects}
        />
      );

    default:
      return null;
  }
}
