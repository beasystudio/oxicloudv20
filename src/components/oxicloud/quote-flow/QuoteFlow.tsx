/**
 * Quote Flow Container - Simplified workflow:
 * 1. Quote Preview + Self-Billing - Review & authorize
 * 2. Generating animation
 * 3. Authorize & Send - Final confirmation + send
 * 4. Sending animation (Peppol/Email)
 * 5. Awaiting Payment
 * 6. Payment Confirmed
 */

import { useState, useEffect, useCallback } from "react";
import { QuotePreviewStep } from "./QuotePreviewStep";
import { PartnerAuthorizationStep } from "./PartnerAuthorizationStep";
import { QuoteSentAwaitingStep } from "./QuoteSentAwaitingStep";
import { PaymentConfirmedStep } from "./PaymentConfirmedStep";
import { QuoteGeneratingScreen } from "./QuoteGeneratingScreen";
import { QuoteSendingScreen } from "./QuoteSendingScreen";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { getUserByEmail } from "@/lib/mockUserDB";

type QuoteFlowStep =
  | "quote-preview"
  | "generating"
  | "authorization"
  | "sending"
  | "awaiting-payment"
  | "payment-confirmed";

interface RecipientInfo {
  name: string;
  vatNumber?: string;
  billingAddress?: string;
  email: string;
}

interface PartnerCompanyInfo {
  name: string;
  vatNumber: string;
}

interface QuoteFlowProps {
  projectName: string;
  partnerShareAmount: number;
  recipientInfo: RecipientInfo;
  partnerCompanyInfo?: PartnerCompanyInfo;
  quoteReference?: string;
  initialStep?: QuoteFlowStep;
  isPaid?: boolean;
  isPilotMode?: boolean;
  noxCompleted?: boolean;
  settlementClaimed?: boolean;
  onBack: () => void;
  onQuoteSent: (quoteRef: string) => void;
  onPaymentReceived: () => void;
  onNavigateToNox: () => void;
  onNavigateToSettlement: () => void;
  onSettlementComplete: () => void;
  onBackToProject: () => void;
  onSubStatusUpdate?: (subStatus: string) => void;
}

export function QuoteFlow({
  projectName,
  partnerShareAmount,
  recipientInfo,
  partnerCompanyInfo,
  quoteReference: initialQuoteRef,
  initialStep = "quote-preview",
  isPaid = false,
  isPilotMode = false,
  noxCompleted: initialNoxCompleted = false,
  settlementClaimed: initialSettlementClaimed = false,
  onBack,
  onQuoteSent,
  onPaymentReceived,
  onNavigateToNox,
  onNavigateToSettlement,
  onSettlementComplete,
  onBackToProject,
  onSubStatusUpdate,
}: QuoteFlowProps) {
  const { currentUser } = useMockAuth();
  const [currentStep, setCurrentStep] = useState<QuoteFlowStep>(initialStep);
  const [quoteReference] = useState(
    initialQuoteRef ||
      `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
  );

  const [selfBillingDone, setSelfBillingDone] = useState(initialSettlementClaimed);

  const hasFinancialAccess = (): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "owner") return true;
    if (currentUser.role === "client_owner") return true;
    const userRecord = getUserByEmail(currentUser.email);
    return userRecord?.general?.financialDashboardAccess ?? false;
  };

  const defaultPartnerInfo: PartnerCompanyInfo = partnerCompanyInfo || {
    name: currentUser?.company || "Partner",
    vatNumber: "BE0XXX.XXX.XXX",
  };

  useEffect(() => {
    // Map old step names to new simplified flow
    if (initialStep === "settlement" as any || initialStep === "confirmation" as any) {
      setCurrentStep("quote-preview");
    } else {
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  const handleSimulatePayment = () => {
    onPaymentReceived();
    setCurrentStep("payment-confirmed");
  };

  const handleQuoteSent = () => {
    onQuoteSent(quoteReference);
  };

  // After sending animation completes, move to awaiting payment
  const handleSendingComplete = () => {
    handleQuoteSent();
    setCurrentStep("awaiting-payment");
  };

  // From quote preview, go to generating → authorization
  const handleContinueFromPreview = () => {
    setSelfBillingDone(true);
    onSettlementComplete();
    setCurrentStep("generating");
  };

  const handleGeneratingComplete = useCallback(() => {
    onSubStatusUpdate?.('quote_drafted');
    setCurrentStep("authorization");
  }, [onSubStatusUpdate]);

  switch (currentStep) {
    case "quote-preview":
      return (
        <QuotePreviewStep
          projectName={projectName}
          quoteReference={quoteReference}
          recipientName={recipientInfo.name}
          partnerShareAmount={partnerShareAmount}
          totalSteps={4}
          currentStepNumber={1}
          onContinue={handleContinueFromPreview}
          onBack={onBack}
        />
      );

    case "generating":
      return (
        <QuoteGeneratingScreen onComplete={handleGeneratingComplete} />
      );

    case "authorization":
      return (
        <PartnerAuthorizationStep
          recipientInfo={recipientInfo}
          partnerShareAmount={partnerShareAmount}
          isFinancialAuthorized={hasFinancialAccess()}
          projectName={projectName}
          quoteReference={quoteReference}
          partnerCompanyName={defaultPartnerInfo.name}
          onContinue={() => {
            setSelfBillingDone(true);
            onSettlementComplete();
            // Go to sending animation instead of directly to awaiting
            setCurrentStep("sending");
          }}
          onBack={onBackToProject}
        />
      );

    case "sending":
      return (
        <QuoteSendingScreen
          recipientName={recipientInfo.name}
          recipientEmail={recipientInfo.email}
          quoteReference={quoteReference}
          onComplete={handleSendingComplete}
        />
      );

    case "awaiting-payment":
      return (
        <QuoteSentAwaitingStep
          quoteReference={quoteReference}
          endClientName={recipientInfo.name}
          isPilotMode={isPilotMode}
          onBackToProject={onBackToProject}
          onSimulatePayment={handleSimulatePayment}
          recipientInfo={recipientInfo}
          partnerShareAmount={partnerShareAmount}
          projectName={projectName}
          partnerCompanyName={defaultPartnerInfo.name}
        />
      );

    case "payment-confirmed":
      return (
        <PaymentConfirmedStep
          noxCompleted={initialNoxCompleted}
          settlementClaimed={selfBillingDone}
          onNavigateToNox={onNavigateToNox}
        />
      );

    default:
      return null;
  }
}
