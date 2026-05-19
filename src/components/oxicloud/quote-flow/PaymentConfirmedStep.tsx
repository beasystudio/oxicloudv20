/**
 * Payment Confirmed - Clean, focused confirmation screen
 */

import { Button } from "@/components/ui/button";
 import { CheckCircle2, ArrowRight, PartyPopper, Apple } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface PaymentConfirmedStepProps {
  noxCompleted?: boolean;
  settlementClaimed?: boolean;
  onNavigateToNox: () => void;
  onNavigateToSettlement?: () => void;
}

export function PaymentConfirmedStep({
  noxCompleted = false,
  onNavigateToNox
}: PaymentConfirmedStepProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      {/* Hero confirmation */}
      <div className="text-center mb-10">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 animate-in zoom-in duration-300">
          <PartyPopper className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold mb-2">{t('quoteFlow.paymentReceived')}</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {t('quoteFlow.completeNox')}
        </p>
      </div>

      {/* Single clear action card */}
      {!noxCompleted ? (
        <div className="rounded-2xl border border-border bg-card p-6">
           <div className="flex items-center gap-3 mb-4">
             <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
               <Apple className="h-4.5 w-4.5 text-primary" />
             </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">{t('quoteFlow.noxAssessment')}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('quoteFlow.detailedEnvAssessment')}
              </p>
            </div>
          </div>
          <Button onClick={onNavigateToNox} className="w-full h-11 gap-2">
            {t('quoteFlow.start')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="font-medium text-sm">{t('quoteFlow.assessmentComplete')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('quoteFlow.settlementProcessed')}
          </p>
        </div>
      )}
    </div>
  );
}
