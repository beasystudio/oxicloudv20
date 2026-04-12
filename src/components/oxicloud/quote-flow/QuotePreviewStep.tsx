/**
 * Quote Preview Step
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, ArrowRight, FileText, Download,
  Layers, Scale, ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface QuotePreviewStepProps {
  projectName: string;
  quoteReference: string;
  recipientName: string;
  partnerShareAmount: number;
  totalSteps: number;
  currentStepNumber: number;
  onContinue: () => void;
  onBack: () => void;
}

export function QuotePreviewStep({
  projectName, quoteReference, recipientName, partnerShareAmount,
  totalSteps, currentStepNumber, onContinue, onBack,
}: QuotePreviewStepProps) {
  const { t } = useLanguage();

  const handleDownloadPDF = () => {
    const el = document.createElement("a");
    el.setAttribute("href", "#");
    el.click();
  };

  const scopeItems = [
    { label: t('quoteFlow.preEstReport'), included: true },
    { label: t('quoteFlow.noxConstruction'), included: true },
    { label: t('quoteFlow.noxOperational'), included: true },
    { label: t('quoteFlow.natura2000Check'), included: true },
    { label: t('quoteFlow.officialReport'), included: true },
    { label: t('quoteFlow.passendeBeoordeling'), included: false },
  ];

  const legalDocs = [
    t('quoteFlow.generalTerms'),
    t('quoteFlow.privacyStatement'),
    t('quoteFlow.selfBillingAgreement'),
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-2 w-8 rounded-full ${i < currentStepNumber ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          Step {currentStepNumber} of {totalSteps}
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium mb-2">{t('quoteFlow.previewTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('quoteFlow.previewSubtitle')}</p>
      </div>

      {/* Quote Reference & Project */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('quoteFlow.quoteReference')}</p>
              <p className="font-mono font-semibold">{quoteReference}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('quoteFlow.project')}</p>
              <p className="font-medium">{projectName}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('quoteFlow.endClient')}</p>
              <p className="font-medium">{recipientName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('quoteFlow.validUntil')}</p>
              <p className="font-medium">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("nl-BE")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scope Breakdown */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">{t('quoteFlow.scopeBreakdown')}</p>
          </div>
          <div className="space-y-2.5">
            {scopeItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  item.included ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {item.included ? "✓" : "-"}
                </div>
                <span className={item.included ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
                {!item.included && (
                  <span className="text-xs text-muted-foreground ml-auto">{t('quoteFlow.notIncluded')}</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legal Documents */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">{t('quoteFlow.legalDocuments')}</p>
          </div>
          <div className="space-y-3">
            {legalDocs.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doc}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                  <Download className="h-3 w-3" />
                  PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partner Share Info */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t('quoteFlow.yourPartnerShare')}</p>
              <p className="text-xs text-muted-foreground">{t('quoteFlow.earnedWhenPaid')}</p>
            </div>
            <p className="text-xl font-semibold text-primary">
              €{partnerShareAmount.toLocaleString("nl-BE", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Download full quote */}
      <Button variant="outline" className="w-full mb-4 h-11 gap-2" onClick={handleDownloadPDF}>
        <Download className="h-4 w-4" />
        {t('quoteFlow.downloadFullQuote')}
      </Button>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('quoteFlow.back')}
        </Button>
        <Button onClick={onContinue} className="flex-[2] h-12" size="lg">
          {t('quoteFlow.continueToSelfBilling')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}