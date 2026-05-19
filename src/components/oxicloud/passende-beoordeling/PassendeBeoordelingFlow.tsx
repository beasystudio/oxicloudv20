import { useMemo, useState } from 'react';
import { QuoteSentAwaitingStep } from '@/components/oxicloud/quote-flow/QuoteSentAwaitingStep';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { buildPBProjectData, QUOTE_LINE_ITEMS, type PBStatus } from './types';

interface PassendeBeoordelingFlowProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onComplete: () => void;
  onBack: () => void;
}

export function PassendeBeoordelingFlow({
  project,
  onComplete,
  onBack,
}: PassendeBeoordelingFlowProps) {
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState<PBStatus>('quote_sent');
  const [pbProject] = useState(() => buildPBProjectData());
  const quoteReference = useMemo(
    () => `QT-${new Date().getFullYear()}-${project.id.slice(0, 4).toUpperCase() || 'PROJ'}`,
    [project.id]
  );
  const quoteAmount = useMemo(
    () => QUOTE_LINE_ITEMS.reduce((total, item) => total + item.amount, 0),
    []
  );

  const handleClientSigned = () => {
    setStatus('signed');
    window.setTimeout(onComplete, 250);
  };

  return (
    <QuoteSentAwaitingStep
      showFieldChecklist={false}
      quoteReference={quoteReference}
      endClientName={pbProject.clientName}
      onBackToProject={onBack}
      onSimulatePayment={status === 'quote_sent' ? handleClientSigned : undefined}
      recipientInfo={{
        name: pbProject.clientName,
        email: pbProject.clientEmail,
      }}
      partnerShareAmount={quoteAmount}
      projectName={project.name || pbProject.name}
      partnerCompanyName={currentUser?.company || pbProject.architectName}
      nextSteps={[
        t('pbFlow.awaitStep1') || 'Your client receives the Passende Beoordeling quote via email with a secure signing link',
        t('pbFlow.awaitStep2') || 'They review and sign online - you\u2019ll be notified instantly',
        t('pbFlow.awaitStep3') || 'Once payment is received, the A-Spine team prepares your Passende Beoordeling report and delivers it to this project binder',
      ]}
    />
  );
}
