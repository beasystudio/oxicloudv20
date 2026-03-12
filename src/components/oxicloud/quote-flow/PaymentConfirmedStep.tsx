/**
 * Payment Confirmed — Single clean confirmation screen
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, PartyPopper } from "lucide-react";
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
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
          <PartyPopper className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-medium mb-2">{t('quoteFlow.paymentReceived')}</h1>
        <p className="text-muted-foreground text-sm">
          {t('quoteFlow.completeNox')}
        </p>
      </div>

      <div className="space-y-4">
        <Card
          className={`border cursor-pointer transition-all hover:border-primary/40 ${noxCompleted ? 'bg-primary/5 border-primary/30' : ''}`}
          onClick={!noxCompleted ? onNavigateToNox : undefined}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">{t('quoteFlow.noxAssessment')}</h3>
                  {noxCompleted ? (
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t('quoteFlow.completedLabel')}
                    </span>
                  ) : (
                    <Button size="sm" variant="default" className="h-8 gap-1.5">
                      {t('quoteFlow.start')}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('quoteFlow.detailedEnvAssessment')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {noxCompleted && (
        <div className="mt-8 p-5 bg-primary/5 border border-primary/20 rounded-xl text-center">
          <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="font-medium">{t('quoteFlow.assessmentComplete')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('quoteFlow.settlementProcessed')}
          </p>
        </div>
      )}
    </div>
  );
}