/**
 * PilotNoxFlow - Full NOx assessment flow for Pilot mode
 * Mirrors OxiCloudContent's flow logic using identical production components
 * but backed by pilotSessionStore instead of noxProjectStore/localStorage.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  PilotProject,
  getPilotProjectById,
  getPilotContacts,
  updatePilotProject,
  savePilotPreEstimation,
  generatePilotNoxPrice,
  processPilotNoxPayment,
  savePilotDetailedCalculation,
  pilotProjectToOxiCloud,
} from '@/lib/pilotSessionStore';
import {
  PreEstimationData,
  DetailedCalculationData,
  OxiCloudProject,
} from '@/types/oxicloud';

// Production components - reused as-is
import { PreEstimationForm } from '@/components/oxicloud/PreEstimationForm';
import { QuoteFlow } from '@/components/oxicloud/quote-flow/QuoteFlow';
import { NoxPaymentDemoFlow } from '@/components/oxicloud/NoxPaymentDemoFlow';
import { DetailedCalculationForm } from '@/components/oxicloud/DetailedCalculationForm';
import { OxiCloudResultScreen } from '@/components/oxicloud/OxiCloudResultScreen';

type FlowStep =
  | 'pre-estimation'
  | 'quote-flow'
  | 'awaiting-payment'
  | 'payment'
  | 'detailed-calculation'
  | 'results';

interface PilotNoxFlowProps {
  projectId: string;
  onBack: () => void;
  onRefresh: () => void;
}

export function PilotNoxFlow({ projectId, onBack, onRefresh }: PilotNoxFlowProps) {
  const [project, setProject] = useState<PilotProject>(() => {
    const p = getPilotProjectById(projectId)!;
    // Initialize NOx if first time
    if (!p.noxStatus) {
      updatePilotProject(projectId, { noxStatus: 'input_incomplete', reportJobQueued: false });
      return { ...p, noxStatus: 'input_incomplete' as const, reportJobQueued: false };
    }
    return p;
  });

  const getInitialStep = (): FlowStep => {
    // If user was in quote-flow, return there
    if (project.noxSubStatus === 'quote_drafted') return 'quote-flow';
    if (project.noxSubStatus === 'quote_sent_to_customer') return 'awaiting-payment';
    switch (project.noxStatus) {
      case 'input_completed': return 'pre-estimation';
      case 'price_generated':
      case 'awaiting_payment': return 'quote-flow';
      case 'paid': return 'detailed-calculation';
      case 'report_in_progress':
      case 'report_delivered': return 'results';
      default: return 'pre-estimation';
    }
  };

  const [step, setStep] = useState<FlowStep>(getInitialStep);
  const [quoteReference, setQuoteReference] = useState(
    `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
  );

  const refresh = () => {
    const updated = getPilotProjectById(projectId);
    if (updated) setProject(updated);
    onRefresh();
  };

  const oxiProject: OxiCloudProject = pilotProjectToOxiCloud(project);

  // Resolve the Opdrachtgever (bouwheer) contact for quote recipient
  const getRecipientInfo = () => {
    const contacts = getPilotContacts();
    if (project.bouwheerContactId) {
      const bouwheer = contacts.find((c: any) => c.id === project.bouwheerContactId);
      if (bouwheer) {
        const companyContact = project.clientCompanyId
          ? contacts.find((c: any) => c.id === project.clientCompanyId)
          : null;
        return {
          name: `${bouwheer.firstName || ''} ${bouwheer.lastName || ''}`.trim() || 'Opdrachtgever',
          email: bouwheer.email || '',
          company: companyContact?.companyName || '',
        };
      }
    }
    // Fallback to client company
    if (project.clientCompanyId) {
      const clientCo = contacts.find((c: any) => c.id === project.clientCompanyId);
      if (clientCo) {
        return { name: clientCo.companyName || 'Opdrachtgever', email: '', company: clientCo.companyName || '' };
      }
    }
    return { name: 'Opdrachtgever', email: '' };
  };

  const recipientInfo = getRecipientInfo();

  // --- Handlers mirroring OxiCloudContent ---

  const handlePreEstimationSubmit = (data: PreEstimationData) => {
    savePilotPreEstimation(projectId, data);
    generatePilotNoxPrice(projectId);
    refresh();
    setQuoteReference(`QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
    // Persist sub-status so user can return to authorization step
    updatePilotProject(projectId, { noxSubStatus: 'quote_drafted' });
    setStep('quote-flow');
    toast.success('Price generated - quote is ready.');
  };

  const handleQuoteSent = (quoteRef: string) => {
    setQuoteReference(quoteRef);
    updatePilotProject(projectId, { noxStatus: 'awaiting_payment', status: 'quoted', noxSubStatus: 'quote_sent_to_customer' });
    refresh();
  };

  const handleClientPaymentReceived = () => {
    processPilotNoxPayment(projectId);
    refresh();
  };

  const handlePaymentComplete = (vatNumber?: string) => {
    processPilotNoxPayment(projectId, vatNumber);
    refresh();
    setStep('detailed-calculation');
    toast.success('Payment processed - detailed calculation unlocked.');
  };

  const handleDetailedCalculationSubmit = (data: DetailedCalculationData) => {
    savePilotDetailedCalculation(projectId, data);
    refresh();
    setStep('results');
    toast.success('NOx assessment results are ready.');
  };

  const handleBackToDashboard = () => {
    onRefresh();
    onBack();
  };

  // --- Render ---
  switch (step) {
    case 'pre-estimation': {
      // Build werflocatie address string from project site address
      const siteAddr = project.siteAddress;
      const werflocatieAddress = siteAddr
        ? `${siteAddr.street} ${siteAddr.number}, ${siteAddr.postalCode} ${siteAddr.city}, ${siteAddr.country || 'Belgium'}`
        : undefined;
      return (
        <PreEstimationForm
          initialData={project.preEstimation}
          initialAddress={werflocatieAddress}
          onSubmit={handlePreEstimationSubmit}
          onBack={handleBackToDashboard}
          onAutoSave={(data) => {
            savePilotPreEstimation(projectId, data);
            refresh();
          }}
        />
      );
    }

    case 'quote-flow':
      return (
        <QuoteFlow
          projectName={project.name}
          partnerShareAmount={project.commissionAmount || 0}
          recipientInfo={recipientInfo}
          quoteReference={quoteReference}
          initialStep="authorization"
          isPaid={project.noxStatus === 'paid'}
          isPilotMode={true}
          onBack={() => setStep('pre-estimation')}
          onQuoteSent={handleQuoteSent}
          onPaymentReceived={handleClientPaymentReceived}
          onNavigateToNox={() => setStep('detailed-calculation')}
          onNavigateToSettlement={() => {}}
          onSettlementComplete={() => {}}
          onBackToProject={handleBackToDashboard}
        />
      );

    case 'awaiting-payment':
      return (
        <QuoteFlow
          projectName={project.name}
          partnerShareAmount={project.commissionAmount || 0}
          recipientInfo={recipientInfo}
          quoteReference={quoteReference}
          initialStep="awaiting-payment"
          isPaid={project.noxStatus === 'paid'}
          isPilotMode={true}
          onBack={handleBackToDashboard}
          onQuoteSent={handleQuoteSent}
          onPaymentReceived={handleClientPaymentReceived}
          onNavigateToNox={() => setStep('detailed-calculation')}
          onNavigateToSettlement={() => {}}
          onSettlementComplete={() => {}}
          onBackToProject={handleBackToDashboard}
        />
      );

    case 'payment':
      return (
        <NoxPaymentDemoFlow
          project={oxiProject}
          onPaymentComplete={handlePaymentComplete}
          onBack={() => setStep('quote-flow')}
        />
      );

    case 'detailed-calculation':
      return (
        <DetailedCalculationForm
          project={oxiProject}
          onSubmit={handleDetailedCalculationSubmit}
          onBack={handleBackToDashboard}
          onAutoSave={(data) => {
            if (project) {
              updatePilotProject(project.id, { detailedCalculation: data });
            }
          }}
        />
      );

    case 'results':
      return (
        <OxiCloudResultScreen
          project={oxiProject}
          onBack={() => setStep('detailed-calculation')}
          onRecalculate={() => setStep('pre-estimation')}
          onBackToDashboard={handleBackToDashboard}
        />
      );

    default:
      return null;
  }
}
