/**
 * Screen 2: Final Quote Confirmation
 * Final verification before sending quote
 * All fields are read-only
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Mail, MapPin, FileText, Send, Tag } from "lucide-react";
interface RecipientInfo {
  name: string;
  vatNumber?: string;
  billingAddress?: string;
  email: string;
}
interface FinalQuoteConfirmationStepProps {
  recipientInfo: RecipientInfo;
  quoteReference: string;
  onConfirmAndSend: () => void;
  onBack: () => void;
}
export function FinalQuoteConfirmationStep({
  recipientInfo,
  quoteReference,
  onConfirmAndSend,
  onBack
}: FinalQuoteConfirmationStepProps) {
  const [isSending, setIsSending] = useState(false);
  const handleConfirm = async () => {
    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onConfirmAndSend();
  };
  return <div className="max-w-xl mx-auto py-8 px-4">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-muted" />
          <div className="h-2 w-8 rounded-full bg-muted" />
        </div>
        <span className="text-xs text-muted-foreground ml-2">Step 4 of 6</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Send className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-medium mb-2">Ready to Send</h1>
        <p className="text-sm text-muted-foreground">
          Review the details below before sending
        </p>
      </div>

      {/* Quote Reference Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Tag className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Quote Reference</span>
        </div>
        <p className="font-mono font-semibold text-lg">{quoteReference}</p>
        <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
          This reference code will be used to track payment and claim your partner share
        </p>
      </div>

      {/* Recipient billing details - read only */}
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Recipient Billing Details</p>
        <div className="border border-border rounded-xl p-5 bg-muted/10">
          <div className="space-y-4">
            {/* Company name */}
            <div className="flex items-start gap-3">
              
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="font-medium">{recipientInfo.name}</p>
              </div>
            </div>

            {/* VAT number */}
            {recipientInfo.vatNumber && <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">BTW number</p>
                  <p className="font-medium font-mono text-sm">{recipientInfo.vatNumber}</p>
                </div>
              </div>}

            {/* Billing address */}
            {recipientInfo.billingAddress && <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium text-sm">{recipientInfo.billingAddress}</p>
                </div>
              </div>}

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-sm">{recipientInfo.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change notice */}
      <p className="text-xs text-muted-foreground text-center mb-8">
        Need to make changes? Go back to the previous step.
      </p>

      {/* Actions */}
      <Button onClick={handleConfirm} disabled={isSending} size="lg" className="w-full h-14 text-base">
        {isSending ? <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Sending quote...
          </> : <>
            
            Confirm and allow OxiCloud to send quote to your client
          </>}
      </Button>

      <Button variant="ghost" onClick={onBack} disabled={isSending} className="w-full mt-3 text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    </div>;
}