import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OxiCloudSecondaryNav, OxiCloudTab } from './OxiCloudSecondaryNav';
import { NoxProjectDashboard } from './NoxProjectDashboard';
import { PreEstimationForm } from './PreEstimationForm';
import { PriceReviewScreen } from './PriceReviewScreen';
import { QuoteFlow } from './quote-flow/QuoteFlow';
import { NoxPaymentDemoFlow } from './NoxPaymentDemoFlow';
import { DetailedCalculationForm } from './DetailedCalculationForm';
import { OxiCloudResultScreen } from './OxiCloudResultScreen';
import { InvoicePaymentView } from './InvoicePaymentView';
import { OxiCloudSettings } from './OxiCloudSettings';
import { NoxAdminHome } from './NoxAdminHome';
import { NoxFormsConfig } from './admin/NoxFormsConfig';
import { NoxPdfTemplateBuilder } from './admin/NoxPdfTemplateBuilder';
// CommissionManagement moved to License Manager
import { StaffManagement } from './admin/StaffManagement';
import { ProjectQuotePanel } from './ProjectQuotePanel';
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
import { getLocalProjectById } from '@/lib/mockLocalProjects';
import { Contact } from '@/types/contact';

type FlowStep = 'dashboard' | 'pre-estimation' | 'quote-flow' | 'awaiting-payment' | 'price-review' | 'quote-payment' | 'payment' | 'detailed-calculation' | 'results';

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
  const { toast } = useToast();
  const { currentUser, selectedCompanyId } = useMockAuth();
  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  
  // Default to engine for admins, dashboard for clients
  const [activeTab, setActiveTab] = useState<OxiCloudTab>(isAdmin ? 'engine' : 'dashboard');
  const [flowStep, setFlowStep] = useState<FlowStep>('dashboard');
  const [projects, setProjects] = useState<NoxProject[]>([]);
  const [currentProject, setCurrentProject] = useState<NoxProject | null>(null);
  const [selectedEndClient, setSelectedEndClient] = useState<Contact | null>(null);
  const [quoteReference, setQuoteReference] = useState<string>('');
  const companyFilter = isAdmin ? undefined : selectedCompanyId || undefined;

  useEffect(() => {
    refreshProjects();
  }, [companyFilter]);

  // Update default tab when role changes
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

  const stats = getNoxProjectStats(companyFilter);

  const handleSelectProject = (project: NoxProject) => {
    // Initialize NOx data if not exists
    if (!project.noxData) {
      initializeNoxProject(project.id);
      refreshProjects();
      // Refetch the project with new NOx data
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
        // For admins, show price review; for clients, show quote-flow
        setFlowStep(isAdmin ? 'price-review' : 'quote-flow');
        break;
      case 'awaiting_payment':
        // For admins, show payment flow; for clients, show awaiting-payment
        setFlowStep(isAdmin ? 'payment' : 'awaiting-payment');
        break;
      case 'paid':
        // For admins, go directly to detailed calculation; for clients, show paid state in quote-flow
        setFlowStep(isAdmin ? 'detailed-calculation' : 'awaiting-payment');
        break;
      case 'report_in_progress':
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
    // Pass companyId to calculate correct commission rate
    const updatedNoxData = generateNoxPrice(currentProject.id, currentProject.companyId);
    
    if (updatedNoxData) {
      refreshProjects();
      const updated = getNoxProjects().find(p => p.id === currentProject.id);
      if (updated) {
        setCurrentProject(updated);
        
        // Client users see quote-flow (hides total amount, shows commission only)
        // Admins see full price review
        if (isAdmin) {
          setFlowStep('price-review');
          toast({
            title: 'Price Generated',
            description: 'Your price estimate is ready for review.',
          });
        } else {
          setQuoteReference(`QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
          setFlowStep('quote-flow');
        }
      }
    }
  };

  const handleQuoteSent = (quoteRef: string) => {
    if (!currentProject) return;
    
    setQuoteReference(quoteRef);
    
    // Update status to awaiting payment
    const updated = setNoxAwaitingPayment(currentProject.id);
    if (updated) {
      refreshProjects();
      const refreshed = getNoxProjects().find(p => p.id === currentProject.id);
      if (refreshed) {
        setCurrentProject(refreshed);
      }
    }
  };

  const handleClientPaymentReceived = () => {
    if (!currentProject) return;
    
    const updated = processNoxPayment(currentProject.id);
    if (updated) {
      refreshProjects();
      const refreshed = getNoxProjects().find(p => p.id === currentProject.id);
      if (refreshed) {
        setCurrentProject(refreshed);
      }
    }
  };

  const handleProceedToPayment = () => {
    if (!currentProject) return;
    
    const updated = setNoxAwaitingPayment(currentProject.id);
    if (updated) {
      refreshProjects();
      const refreshed = getNoxProjects().find(p => p.id === currentProject.id);
      if (refreshed) {
        setCurrentProject(refreshed);
        setFlowStep('payment');
      }
    }
  };

  const handlePaymentComplete = (vatNumber?: string) => {
    if (!currentProject) return;
    
    const updated = processNoxPayment(currentProject.id, vatNumber);
    if (updated) {
      refreshProjects();
      const refreshed = getNoxProjects().find(p => p.id === currentProject.id);
      if (refreshed) {
        setCurrentProject(refreshed);
        setFlowStep('detailed-calculation');
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed. You can now access the detailed calculation form.',
        });
      }
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
        setFlowStep('results');
        toast({
          title: 'Calculation Complete',
          description: 'Your NOx assessment results are ready.',
        });
      }
    }
  };

  const handleBackToDashboard = () => {
    setFlowStep('dashboard');
    setCurrentProject(null);
    refreshProjects();
  };

  const renderContent = () => {
    // Workflow steps when a project is selected
    if (flowStep !== 'dashboard' && currentProject) {
      const oxiProject = toOxiCloudProject(currentProject);
      
      if (!oxiProject) {
        return null;
      }

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
        case 'quote-flow':
          // Client view: 4-step quote flow
          return (
            <QuoteFlow
              projectName={currentProject.name}
              partnerShareAmount={currentProject.noxData?.commissionAmount || 0}
              recipientInfo={{
                name: selectedEndClient?.name || 'End Client',
                vatNumber: selectedEndClient?.vatNumber,
                billingAddress: selectedEndClient ? `${selectedEndClient.street || ''} ${selectedEndClient.number || ''}, ${selectedEndClient.postalCode || ''} ${selectedEndClient.city || ''}`.trim() : undefined,
                email: selectedEndClient?.email || ''
              }}
              quoteReference={quoteReference}
              initialStep={currentProject.noxData?.subStatus === 'quote_drafted' ? 'authorization' : 'quote-preview'}
              onSubStatusUpdate={(subStatus) => {
                if (currentProject) {
                  updateNoxSubStatus(currentProject.id, subStatus as any);
                  refreshProjects();
                }
              }}
              isPaid={currentProject.noxData?.status === 'paid'}
              isPilotMode={currentUser?.email === 'demo@oxicloud.be'}
              onBack={() => setFlowStep('pre-estimation')}
              onQuoteSent={handleQuoteSent}
              onPaymentReceived={handleClientPaymentReceived}
              onNavigateToNox={() => setFlowStep('detailed-calculation')}
              onNavigateToSettlement={() => {
                toast({
                  title: 'Settlement Claim',
                  description: 'Navigate to Financial Dashboard to submit your invoice.',
                });
              }}
              onSettlementComplete={() => {
                toast({
                  title: 'Settlement Complete',
                  description: 'Your partner share invoice has been submitted.',
                });
              }}
              onBackToProject={handleBackToDashboard}
            />
          );
        case 'awaiting-payment':
          // Client view: awaiting payment or paid state
          return (
            <QuoteFlow
              projectName={currentProject.name}
              partnerShareAmount={currentProject.noxData?.commissionAmount || 0}
              recipientInfo={{
                name: selectedEndClient?.name || 'End Client',
                vatNumber: selectedEndClient?.vatNumber,
                billingAddress: selectedEndClient ? `${selectedEndClient.street || ''} ${selectedEndClient.number || ''}, ${selectedEndClient.postalCode || ''} ${selectedEndClient.city || ''}`.trim() : undefined,
                email: selectedEndClient?.email || ''
              }}
              quoteReference={quoteReference || `QT-${currentProject.id.slice(0, 4).toUpperCase()}`}
              initialStep="awaiting-payment"
              isPaid={currentProject.noxData?.status === 'paid'}
              isPilotMode={currentUser?.email === 'demo@oxicloud.be'}
              onBack={handleBackToDashboard}
              onQuoteSent={handleQuoteSent}
              onPaymentReceived={handleClientPaymentReceived}
              onNavigateToNox={() => setFlowStep('detailed-calculation')}
              onNavigateToSettlement={() => {
                toast({
                  title: 'Settlement Claim',
                  description: 'Navigate to Financial Dashboard to submit your invoice.',
                });
              }}
              onSettlementComplete={() => {
                toast({
                  title: 'Settlement Complete',
                  description: 'Your partner share invoice has been submitted.',
                });
              }}
              onBackToProject={handleBackToDashboard}
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
        case 'payment':
          return (
            <NoxPaymentDemoFlow
              project={oxiProject}
              onPaymentComplete={handlePaymentComplete}
              onBack={() => setFlowStep('price-review')}
            />
          );
        case 'detailed-calculation':
          return (
            <DetailedCalculationForm
              project={oxiProject}
              onSubmit={handleDetailedCalculationSubmit}
              onBack={handleBackToDashboard}
              onAutoSave={(data) => {
                // Persist draft data without running full calculation
                if (currentProject) {
                  updateNoxData(currentProject.id, { detailedCalculation: data });
                  refreshProjects();
                }
              }}
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
      // Admin tabs
      case 'engine':
        return <NoxCalculationEnginePlaceholder />;
      case 'forms':
        return <NoxFormsConfig />;
      case 'pdf-template':
        return <NoxPdfTemplateBuilder />;
      case 'users':
        return <StaffManagement />;
      
      // Client tabs
      case 'dashboard':
        return (
          <NoxProjectDashboard
            projects={projects}
            onSelectProject={handleSelectProject}
            stats={stats}
          />
        );
      case 'invoice-payment':
        // Convert NoxProjects to OxiCloudProjects for the invoice view
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

// Placeholder components for admin tabs
function NoxCalculationEnginePlaceholder() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <h2 className="text-lg font-semibold mb-2">Calculation Engine</h2>
      <p className="text-sm text-muted-foreground text-balance">Algorithm versions, formula manager, and VITO tables manager will be built here.</p>
    </div>
  );
}

