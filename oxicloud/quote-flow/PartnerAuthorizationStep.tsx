/**
 * Step 3: Offerte Preview, Self-Billing Agreement & Authorization
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

interface RecipientInfo {
  name: string;
  vatNumber?: string;
  billingAddress?: string;
  email: string;
  phone?: string;
}

interface PartnerAuthorizationStepProps {
  recipientInfo: RecipientInfo;
  partnerShareAmount: number;
  isFinancialAuthorized: boolean;
  projectName: string;
  quoteReference: string;
  partnerCompanyName: string;
  onContinue: () => void;
  onBack: () => void;
}

function QuotePDFPreview({
  projectName,
  quoteReference,
  recipientInfo,
  partnerCompanyName,
  t
}: {
  projectName: string;
  quoteReference: string;
  recipientInfo: RecipientInfo;
  partnerCompanyName: string;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-background border border-border rounded-xl p-6 space-y-5 text-sm shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('quoteFlow.quote')}</p>
          <p className="font-semibold text-lg">{quoteReference}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{partnerCompanyName}</p>
          <p className="text-xs text-muted-foreground">Via OxiCloud Platform</p>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{t('quoteFlow.project')}</p>
          <p className="font-medium">{projectName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('quoteFlow.date')}</p>
          <p className="font-medium">{new Date().toLocaleDateString("nl-BE")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('quoteFlow.validUntil')}</p>
          <p className="font-medium">
            {new Date(Date.now() + 30 * 86400000).toLocaleDateString("nl-BE")}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('quoteFlow.endClient')}</p>
          <p className="font-medium">{recipientInfo.name}</p>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <p className="font-medium mb-2">{t('quoteFlow.scope')}</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
          <li>{t('quoteFlow.scopeItem1')}</li>
          <li>{t('quoteFlow.scopeItem2')}</li>
          <li>{t('quoteFlow.scopeItem3')}</li>
          <li>{t('quoteFlow.scopeItem4')}</li>
        </ul>
      </div>

      <div className="h-px bg-border" />

      <div className="text-xs text-muted-foreground">
        <p>{t('quoteFlow.termsFooter1')}</p>
        <p>{t('quoteFlow.termsFooter2')}</p>
      </div>
    </div>
  );
}

export function PartnerAuthorizationStep({
  recipientInfo,
  partnerShareAmount,
  isFinancialAuthorized,
  projectName,
  quoteReference,
  partnerCompanyName,
  onContinue,
  onBack
}: PartnerAuthorizationStepProps) {
  const { t } = useLanguage();
  const [showLegalDocs, setShowLegalDocs] = useState(false);
  const [showQuotePreview, setShowQuotePreview] = useState(false);

  const canAuthorize = true;

  const handleDownload = (docName: string) => {
    const a = document.createElement("a");
    a.href = "#";
    a.download = `${docName}.pdf`;
    a.click();
  };

  const legalDocs = [
    { key: 'generalTerms', label: t('quoteFlow.generalTerms') },
    { key: 'privacyStatement', label: t('quoteFlow.privacyStatement') },
    { key: 'selfBillingAgreement', label: t('quoteFlow.selfBillingAgreement') },
  ];

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1.5">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className={cn("h-1.5 w-6 rounded-full transition-colors", i <= 3 ? "bg-primary" : "bg-muted")} />
        ))}
        <span className="text-[11px] text-muted-foreground ml-3">3 / 6</span>
      </div>

      {/* Partner reward banner */}
      <div className="rounded-xl bg-primary/5 border border-primary/15 px-5 py-4">
        <p className="text-sm font-medium text-center">
          {t('quoteFlow.partnerRewardBanner')}
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          {t('quoteFlow.selfBillingAutomatic')}
        </p>
      </div>

      {/* Compact summary grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border/60 p-3.5 space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('quoteFlow.project')}</p>
          <p className="font-medium truncate">{projectName}</p>
          <p className="text-xs text-muted-foreground font-mono">{quoteReference}</p>
        </div>
        <div className="rounded-lg border border-border/60 p-3.5 space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('quoteFlow.recipient')}</p>
          <p className="font-medium truncate">{recipientInfo.name}</p>
          <p className="text-xs text-muted-foreground truncate">{recipientInfo.email || '-'}</p>
        </div>
      </div>

      {/* Quote preview + PDF */}
      <div className="flex gap-2">
        <Button
          variant={showQuotePreview ? "default" : "outline"}
          className="flex-1 gap-2 h-11"
          onClick={() => setShowQuotePreview(!showQuotePreview)}>
          <Eye className="h-4 w-4" />
          {showQuotePreview ? t('quoteFlow.hideQuote') : t('quoteFlow.viewQuote')}
        </Button>
        <Button
          variant="outline"
          className="gap-2 h-11 px-5"
          onClick={() => handleDownload(`Quote-${quoteReference}`)}>
          <Download className="h-4 w-4" />
          PDF
        </Button>
      </div>

      {showQuotePreview && (
        <QuotePDFPreview
          projectName={projectName}
          quoteReference={quoteReference}
          recipientInfo={recipientInfo}
          partnerCompanyName={partnerCompanyName}
          t={t}
        />
      )}

      {/* Legal docs */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <button
          type="button"
          className="flex items-center justify-between w-full text-sm font-medium px-4 py-3 hover:bg-muted/40 transition-colors"
          onClick={() => setShowLegalDocs(!showLegalDocs)}>
          <span>{t('quoteFlow.legalDocs')}</span>
          {showLegalDocs ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {showLegalDocs && (
          <div className="border-t border-border/40 divide-y divide-border/40">
            {legalDocs.map((doc) => (
              <button
                key={doc.key}
                className="flex items-center gap-2.5 w-full text-left text-sm px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                onClick={() => handleDownload(doc.label.replace(/ /g, "-"))}>
                <Download className="h-3.5 w-3.5 shrink-0" />
                {doc.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('quoteFlow.backBtn')}
        </Button>
        <Button
          onClick={onContinue}
          disabled={!canAuthorize}
          className="flex-1 h-11 gap-2"
          size="lg">
          {t('quoteFlow.authorizeAndSend')}
        </Button>
      </div>
    </div>
  );
}