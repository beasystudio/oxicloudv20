import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OxiCloudSecondaryNav, OxiCloudTab } from './OxiCloudSecondaryNav';
import { NoxProjectDashboard } from './NoxProjectDashboard';
import { PreEstimationForm } from './PreEstimationForm';
import { PriceReviewScreen } from './PriceReviewScreen';
import { DetailedCalculationForm } from './DetailedCalculationForm';
import { OxiCloudResultScreen } from './OxiCloudResultScreen';
import { NoxReportHeldScreen } from './nox-results/NoxReportHeldScreen';
import { NoxProcessingScreen } from './nox-results/NoxProcessingScreen';
import { InvoicePaymentView } from './InvoicePaymentView';
import { OxiCloudSettings } from './OxiCloudSettings';
import { SimulationButtons } from './SimulationButtons';
import { useMockAuth } from '@/contexts/MockAuthContext';
import {
  getNoxProjects,
  getNoxProjectStats,
  initializeNoxProject,
  saveNoxPreEstimation,
  generateNoxPrice,
  setNoxAwaitingPayment,
  processNoxPayment,
  saveNoxDetailedCalculation,
  updateNoxSubStatus,
  updateNoxData,
  NoxProject,
  NoxProjectData,
} from '@/lib/noxProjectStore';
import { PreEstimationData, DetailedCalculationData, OxiCloudProject } from '@/types/oxicloud';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, FileText, Download, Mail } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

type FlowStep = 'dashboard' | 'pre-estimation' | 'quote-sent' | 'price-review' | 'payment' | 'detailed-calculation' | 'results' | 'report-processing' | 'report-held';

// Adapter to convert NoxProject + NoxProjectData to OxiCloudProject format for existing components
function toOxiCloudProject(project: NoxProject): OxiCloudProject | null {
  if (!project.noxData) return null;
  
  return {
    id: project.id,
    userId: '',
    name: project.name,
    status: project.noxData.status,
    preEstimation: project.noxData.preEstimation,
    priceData: project.noxData.priceData,
    paymentData: project.noxData.paymentData,
    detailedCalculation: project.noxData.detailedCalculation,
    calculationResults: project.noxData.calculationResults,
    reportJobQueued: project.noxData.reportJobQueued,
    createdAt: project.noxData.noxCreatedAt,
    updatedAt: project.noxData.noxUpdatedAt,
  };
}

export function OxiCloudContent() {
  const { toast: toastHook } = useToast();
  const { t } = useLanguage();
  const { currentUser, selectedCompanyId } = useMockAuth();
  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  
  const [activeTab, setActiveTab] = useState<OxiCloudTab>(isAdmin ? 'engine' : 'dashboard');
  const [flowStep, setFlowStep] = useState<FlowStep>('dashboard');
  const [projects, setProjects] = useState<NoxProject[]>([]);
  const [currentProject, setCurrentProject] = useState<NoxProject | null>(null);
  const companyFilter = isAdmin ? undefined : selectedCompanyId || undefined;

  useEffect(() => {
    refreshProjects();
  }, [companyFilter]);

  useEffect(() => {
    if (isAdmin) {
      setActiveTab('engine');
    } else {
      setActiveTab('dashboard');
    }
  }, [isAdmin]);

  const refreshProjects = () => {
    setProjects(getNoxProjects(companyFilter));
  };

  const refreshCurrentProject = () => {
    if (!currentProject) return;
    refreshProjects();
    const refreshed = getNoxProjects().find(p => p.id === currentProject.id);
    if (refreshed) setCurrentProject(refreshed);
  };

  const stats = getNoxProjectStats(companyFilter);

  const handleSelectProject = (project: NoxProject) => {
    if (!project.noxData) {
      initializeNoxProject(project.id);
      refreshProjects();
      const updated = getNoxProjects().find(p => p.id === project.id);
      if (updated) {
        setCurrentProject(updated);
        setFlowStep('pre-estimation');
      }
      return;
    }

    setCurrentProject(project);
    
    switch (project.noxData.status) {
      case 'input_incomplete':
      case 'input_completed':
        setFlowStep('pre-estimation');
        break;
      case 'price_generated':
        // For admins, show price review; for clients, show quote-sent confirmation
        setFlowStep(isAdmin ? 'price-review' : 'quote-sent');
        break;
      case 'awaiting_payment':
        // Awaiting signature - show quote-sent state
        setFlowStep('quote-sent');
        break;
      case 'paid':
        // Client signed - NOx engine unlocked
        setFlowStep('detailed-calculation');
        break;
      case 'report_in_progress':
        // Report ready but held - awaiting payment
        setFlowStep('report-held');
        break;
      case 'report_delivered':
        setFlowStep('results');
        break;
      default:
        setFlowStep('dashboard');
    }
  };

  const handlePreEstimationSubmit = (data: PreEstimationData) => {
    if (!currentProject) return;
    
    saveNoxPreEstimation(currentProject.id, data);
    const updatedNoxData = generateNoxPrice(currentProject.id, currentProject.companyId);
    
    if (updatedNoxData) {
      // Auto-send quote: transition directly to awaiting_payment (awaiting signature)
      setNoxAwaitingPayment(currentProject.id);
      refreshProjects();
      const updated = getNoxProjects().find(p => p.id === currentProject.id);
      if (updated) {
        setCurrentProject(updated);
        
        if (isAdmin) {
          setFlowStep('price-review');
          toastHook({
            title: t('reportHeld.priceGenerated'),
            description: t('reportHeld.priceReady'),
          });
        } else {
          // Auto-send quote to client
          setFlowStep('quote-sent');
          toast.success(t('reportHeld.quoteSentAuto'));
        }
      }
    }
  };

  // Simulate client signed
  const handleSimulateClientSigned = () => {
    if (!currentProject) return;
    processNoxPayment(currentProject.id); // Reuse payment function to set status to 'paid'
    refreshProjects();
    const refreshed = getNoxProjects().find(p => p.id === currentProject.id);
    if (refreshed) {
      setCurrentProject(refreshed);
      setFlowStep('detailed-calculation');
      toast.success(t('reportHeld.clientSigned'));
    }
  };

  // Simulate payment received - unblur report
  const handleSimulatePaymentReceived = () => {
    if (!currentProject) return;
    updateNoxData(currentProject.id, { status: 'report_delivered' });
    refreshProjects();
    const refreshed = getNoxProjects().find(p => p.id === currentProject.id);
    if (refreshed) {
      setCurrentProject(refreshed);
      setFlowStep('results');
      toast.success(t('reportHeld.paymentReceived'));
    }
  };

  const handleProceedToPayment = () => {
    if (!currentProject) return;
    setNoxAwaitingPayment(currentProject.id);
    refreshProjects();
    const refreshed = getNoxProjects().find(p => p.id === currentProject.id);
    if (refreshed) {
      setCurrentProject(refreshed);
      setFlowStep('payment');
    }
  };

  const handleDetailedCalculationSubmit = (data: DetailedCalculationData) => {
    if (!currentProject) return;
    
    const updated = saveNoxDetailedCalculation(currentProject.id, data);
    if (updated) {
      refreshProjects();
      const refreshed = getNoxProjects().find(p => p.id === currentProject.id);
      if (refreshed) {
        setCurrentProject(refreshed);
        // Report is generated but held until payment
        // If compliant, keep in report_in_progress (held state)
        // The saveNoxDetailedCalculation already sets status
        // We override to report_in_progress (held) since payment hasn't been received
        if (!refreshed.noxData?.paymentData) {
          updateNoxData(currentProject.id, { status: 'report_in_progress' });
          refreshProjects();
          const re = getNoxProjects().find(p => p.id === currentProject.id);
          if (re) setCurrentProject(re);
          setFlowStep('report-processing');
        } else {
          setFlowStep('results');
        }
        toast.success(t('reportHeld.calcComplete'));
      }
    }
  };

  const handleBackToDashboard = () => {
    setFlowStep('dashboard');
    setCurrentProject(null);
    refreshProjects();
  };

  const renderContent = () => {
    if (flowStep !== 'dashboard' && currentProject) {
      const oxiProject = toOxiCloudProject(currentProject);
      
      if (!oxiProject) return null;

      switch (flowStep) {
        case 'pre-estimation':
          return (
            <PreEstimationForm
              initialData={currentProject.noxData?.preEstimation}
              initialAddress={currentProject.location || undefined}
              onSubmit={handlePreEstimationSubmit}
              onBack={handleBackToDashboard}
              onAutoSave={(data) => {
                if (currentProject) {
                  saveNoxPreEstimation(currentProject.id, data);
                  refreshProjects();
                }
              }}
            />
          );

        case 'quote-sent':
          // Show confirmation: quote sent to client, awaiting signature
          return (
            <QuoteSentConfirmation
              project={currentProject}
              onBackToDashboard={handleBackToDashboard}
              onSimulateSigned={handleSimulateClientSigned}
            />
          );

        case 'price-review':
          return (
            <PriceReviewScreen
              project={oxiProject}
              onProceedToPayment={handleProceedToPayment}
              onBackToEdit={() => setFlowStep('pre-estimation')}
            />
          );

        case 'detailed-calculation':
          return (
            <DetailedCalculationForm
              project={oxiProject}
              onSubmit={handleDetailedCalculationSubmit}
              onBack={handleBackToDashboard}
              onAutoSave={(data) => {
                if (currentProject) {
                  updateNoxData(currentProject.id, { detailedCalculation: data });
                  refreshProjects();
                }
              }}
            />
          );

        case 'report-processing':
          return (
            <NoxProcessingScreen
              onComplete={() => setFlowStep('report-held')}
            />
          );

        case 'report-held':
          return (
            <NoxReportHeldScreen
              projectName={currentProject.name}
              onBackToDashboard={handleBackToDashboard}
            />
          );

        case 'results':
          return (
            <OxiCloudResultScreen
              project={oxiProject}
              onBack={() => setFlowStep('detailed-calculation')}
              onRecalculate={() => setFlowStep('pre-estimation')}
              onBackToDashboard={handleBackToDashboard}
            />
          );
      }
    }

    // Tab-based navigation
    switch (activeTab) {
      case 'engine':
        return <NoxCalculationEnginePlaceholder />;
      case 'forms':
      case 'pdf-template':
      case 'users':
        return null;
      case 'dashboard':
        return (
          <NoxProjectDashboard
            projects={projects}
            onSelectProject={handleSelectProject}
            stats={stats}
          />
        );
      case 'invoice-payment':
        const oxiProjects = projects
          .filter(p => p.noxData)
          .map(p => toOxiCloudProject(p))
          .filter((p): p is OxiCloudProject => p !== null);
        return <InvoicePaymentView projects={oxiProjects} />;
      case 'settings':
        return <OxiCloudSettings />;
      default:
        return null;
    }
  };

  const handleTabChange = (tab: OxiCloudTab) => {
    setActiveTab(tab);
    setFlowStep('dashboard');
    setCurrentProject(null);
  };

  return (
    <div className="space-y-6">
      <OxiCloudSecondaryNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
      <div>
        {renderContent()}
      </div>
    </div>
  );
}

// ── Quote Sent Confirmation Screen ──
function QuoteSentConfirmation({
  project,
  onBackToDashboard,
  onSimulateSigned,
}: {
  project: NoxProject;
  onBackToDashboard: () => void;
  onSimulateSigned: () => void;
}) {
  const { t } = useLanguage();
  // Try to get the client email from the project contacts or company
  const clientEmail = (project as any).clientEmail || 'client@company.com';

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      {/* Status hero */}
      <div className="text-center mb-6">
        <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          {t('reportHeld.awaitingSignature')}
        </div>
        <h1 className="text-2xl font-medium mb-2">
          {t('reportHeld.quoteSentToClient')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('reportHeld.sentTo')} <span className="font-medium text-foreground">{clientEmail}</span>
        </p>
      </div>

      {/* What happens next */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-sm font-medium">{t('reportHeld.whatHappensNext')}</p>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">1</span>
              <span>{t('reportHeld.nextStep1')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">2</span>
              <span>{t('reportHeld.nextStep2')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">3</span>
              <span>{t('reportHeld.nextStep3')}</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* PDF download */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('reportHeld.quoteCopyPdf')}</p>
                <p className="text-xs text-muted-foreground">{t('reportHeld.readOnlyRef')}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info(t('reportHeld.pdfDownloading'))}>
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulation */}
      <SimulationButtons
        showSignButton={true}
        onSimulateSigned={onSimulateSigned}
      />

      {/* Back */}
      <Button variant="outline" onClick={onBackToDashboard} className="w-full gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t('reportHeld.backToDashboard')}
      </Button>
    </div>
  );
}

// Placeholder components for admin tabs
function NoxCalculationEnginePlaceholder() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <h2 className="text-lg font-semibold mb-2">Calculation Engine</h2>
      <p className="text-sm text-muted-foreground text-balance">Algorithm versions, formula manager, and VITO tables manager will be built here.</p>
    </div>
  );
}
