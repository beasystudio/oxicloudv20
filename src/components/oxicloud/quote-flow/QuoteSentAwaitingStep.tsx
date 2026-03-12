/**
 * Screen: Quote Sent / Awaiting Payment
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Copy, CheckCircle2, ArrowLeft, Zap } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

interface QuoteSentAwaitingStepProps {
  quoteReference: string;
  endClientName: string;
  isPilotMode?: boolean;
  onBackToProject: () => void;
  onSimulatePayment?: () => void;
}

export function QuoteSentAwaitingStep({
  quoteReference,
  endClientName,
  isPilotMode = false,
  onBackToProject,
  onSimulatePayment
}: QuoteSentAwaitingStepProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyReference = () => {
    navigator.clipboard.writeText(quoteReference);
    setCopied(true);
    toast.success("Reference copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-primary" />
          <div className="h-2 w-8 rounded-full bg-muted" />
        </div>
        <span className="text-xs text-muted-foreground ml-2">5 / 6</span>
      </div>

      {/* Status hero */}
      <div className="text-center mb-8">
        <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          {t('quoteFlow.awaitingPayment')}
        </div>
        <h1 className="text-2xl font-medium mb-3">{t('quoteFlow.quoteSentTo')} {endClientName}</h1>
      </div>

      {/* What happens next */}
      <div className="bg-muted/30 rounded-xl p-5 mb-6">
        <p className="text-sm font-medium mb-3">{t('quoteFlow.whatHappensNext')}</p>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">1</span>
            <span>{t('quoteFlow.awaitStep1')}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">2</span>
            <span>{t('quoteFlow.awaitStep2')}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">3</span>
            <span>{t('quoteFlow.awaitStep3')}</span>
          </li>
        </ol>
      </div>

      {/* Quote reference */}
      <div className="bg-muted/30 rounded-xl p-5 mb-8">
        <p className="text-xs text-muted-foreground text-center mb-3">{t('quoteFlow.quoteRefCode')}</p>
        <button
          onClick={handleCopyReference}
          className="w-full flex items-center justify-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/50 transition-all group">
          <span className="font-mono font-semibold text-lg">{quoteReference}</span>
          {copied ?
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" /> :
          <Copy className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
          }
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {onSimulatePayment &&
        <Button onClick={onSimulatePayment} className="w-full h-12 gap-2">
            <Zap className="h-4 w-4" />
            {t('quoteFlow.simulatePayment')}
          </Button>
        }
        <Button variant="outline" onClick={onBackToProject} className="w-full h-12">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('quoteFlow.backToProjectBinder')}
        </Button>
      </div>
    </div>
  );
}