/**
 * Settlement Platform Step
 * Self-billing authorization flow for partner commission claims
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText, CheckCircle2, Lock, ExternalLink, AlertCircle } from "lucide-react";
import { SelfBillingInvoicePreview } from "./SelfBillingInvoicePreview";
import { SelfBillingAgreementDialog } from "./SelfBillingAgreementDialog";
import { SettlementSuccessDialog } from "./SettlementSuccessDialog";
interface SettlementPlatformStepProps {
  projectName: string;
  projectReference: string;
  partnerCompanyName: string;
  partnerVatNumber: string;
  settlementAmount: number;
  hasFinancialAccess: boolean;
  onComplete: () => void;
  onBack: () => void;
}
export function SettlementPlatformStep({
  projectName,
  projectReference,
  partnerCompanyName,
  partnerVatNumber,
  settlementAmount,
  hasFinancialAccess,
  onComplete,
  onBack
}: SettlementPlatformStepProps) {
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [showAgreementDialog, setShowAgreementDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const handleGenerateInvoice = () => {
    setInvoiceGenerated(true);
  };
  const handleApproveSelfBilling = () => {
    setShowSuccessDialog(true);
  };
  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    onComplete();
  };
  const invoiceNumber = `SB-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
  return <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium mb-2">Settlement Platform</h1>
        <p className="text-muted-foreground text-sm">
          Review settlement for this project under the OxiCloud Partnership Program.
        </p>
      </div>

      {/* Method Card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Method</p>
              <p className="font-medium">Self-Billing</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">between</p>
              <p className="text-sm font-medium">A-Spine BV <span className="text-muted-foreground">and</span> {partnerCompanyName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settlement Amount (conditional) */}
      {hasFinancialAccess && <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Settlement Amount</p>
                <p className="text-2xl font-bold">€{settlementAmount.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Project Reference</p>
                <p className="font-mono text-sm">{projectReference}</p>
              </div>
            </div>
          </CardContent>
        </Card>}

      {/* Project Details */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Project</p>
              <p className="font-medium">{projectName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Company</p>
              <p className="font-medium">{partnerCompanyName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">VAT Number</p>
              <p className="font-mono">{partnerVatNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Cards */}
      <div className="space-y-4 mb-6">
        {/* Card 1: Generate Invoice */}
        <Card className={`border cursor-pointer transition-all ${invoiceGenerated ? 'bg-primary/5 border-primary/30' : 'hover:border-primary/40'}`} onClick={!invoiceGenerated ? handleGenerateInvoice : undefined}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${invoiceGenerated ? 'bg-primary/10' : 'bg-muted'}`}>
                {invoiceGenerated ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">Generate Invoice</h3>
                  {invoiceGenerated && <span className="text-xs text-primary font-medium">Generated</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Create self-billing invoice for partner commission
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Approve Self-Billing */}
        <Card className={`border transition-all ${!invoiceGenerated ? 'opacity-50 cursor-not-allowed' : agreementAccepted ? 'cursor-pointer hover:border-primary/40' : 'cursor-not-allowed'}`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${!invoiceGenerated ? 'bg-muted' : 'bg-muted'}`}>
                {!invoiceGenerated ? <Lock className="h-5 w-5 text-muted-foreground" /> : <AlertCircle className="h-5 w-5 text-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">Approve Self-Billing</h3>
                  {!invoiceGenerated && <span className="text-xs text-muted-foreground">Locked</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Confirm partner information, VAT, bank details. Invoice locked for audit compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Preview (shown after generation) */}
      {invoiceGenerated && <div className="mb-6">
          <SelfBillingInvoicePreview invoiceNumber={invoiceNumber} projectReference={projectReference} partnerCompanyName={partnerCompanyName} partnerVatNumber={partnerVatNumber} amount={settlementAmount} />
        </div>}

      {/* Self-Billing Agreement Checkbox */}
      {invoiceGenerated && <Card className="mb-6 border-border bg-muted/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Checkbox id="agreement" checked={agreementAccepted} onCheckedChange={checked => setAgreementAccepted(checked === true)} className="mt-0.5" />
              <label htmlFor="agreement" className="text-sm cursor-pointer">
                <span className="font-medium">Self-Billing Agreement</span>
                <span className="text-muted-foreground block mt-1">
                  By checking this box, I confirm that I have read, acknowledge, and agree to the{' '}
                  <button type="button" onClick={e => {
                e.preventDefault();
                setShowAgreementDialog(true);
              }} className="text-primary hover:underline inline-flex items-center gap-1">
                    Self-Billing Agreement
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  {' '}between A-Spine BV and {partnerCompanyName}.
                </span>
              </label>
            </div>
          </CardContent>
        </Card>}

      {/* Approve Button */}
      {invoiceGenerated && <Button onClick={handleApproveSelfBilling} disabled={!agreementAccepted} className="w-full h-12" size="lg">
          
          Approve Self-Billing
        </Button>}

      {/* Dialogs */}
      <SelfBillingAgreementDialog open={showAgreementDialog} onOpenChange={setShowAgreementDialog} partnerCompanyName={partnerCompanyName} />

      <SettlementSuccessDialog open={showSuccessDialog} onClose={handleSuccessClose} />
    </div>;
}