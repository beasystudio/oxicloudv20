/**
 * Awaiting Signature screen.
 * Clean summary with separate client/architect cards, quote overview, and PDF viewer.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  ArrowLeft,
  Zap,
  FileText,
  Eye,
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
  Mail,
  MapPin,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface RecipientInfo {
  name: string;
  vatNumber?: string;
  billingAddress?: string;
  email: string;
}

interface QuoteSentAwaitingStepProps {
  quoteReference: string;
  endClientName: string;
  isPilotMode?: boolean;
  onBackToProject: () => void;
  onSimulatePayment?: () => void;
  recipientInfo?: RecipientInfo;
  partnerShareAmount?: number;
  projectName?: string;
  partnerCompanyName?: string;
  /** Optional override for the "what happens next" steps (used by PB flow). */
  nextSteps?: string[];
}

export function QuoteSentAwaitingStep({
  quoteReference,
  endClientName,
  isPilotMode = false,
  onBackToProject,
  onSimulatePayment,
  recipientInfo,
  partnerShareAmount = 0,
  projectName = "",
  partnerCompanyName = "",
  nextSteps,
}: QuoteSentAwaitingStepProps) {
  const { t } = useLanguage();
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);

  const quoteDate = new Date().toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const expiryDate = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const clientEmail =
    recipientInfo?.email || "vandenberghe.family@gmail.com";
  const clientInitials = endClientName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const partnerInitials = partnerCompanyName
    ? partnerCompanyName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "PA";

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-5">
      {/* Locked banner */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-muted/40 border border-border/60">
        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">
          {t('quoteFlow.awaitingLocked') || 'This quote has been sent and is locked for editing.'}
        </span>
      </div>

      {/* Status + Title */}
      <div className="text-center space-y-3 pt-2">
        <Badge
          variant="outline"
          className="text-xs font-medium px-3 py-1 border-amber-300/60 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40"
        >
          <span className="relative flex h-1.5 w-1.5 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
          </span>
          {t('quoteFlow.awaitingSignatureLabel') || 'Awaiting Signature'}
        </Badge>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t('quoteFlow.quoteSentToClient') || 'Quote sent to your client'}
        </h1>
      </div>

      {/* Two separate party cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Client Card */}
        <Card className="p-4 border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t('quoteFlow.client') || 'Client'}
            </span>
            <Badge variant="outline" className="text-[10px] shrink-0 border-amber-300/50 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20 dark:text-amber-400">
              {t('quoteFlow.signatory') || 'Signatory'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-secondary-foreground shrink-0">
              {clientInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {endClientName}
              </p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-3 w-3 shrink-0" />
                {clientEmail}
              </p>
            </div>
          </div>
        </Card>

        {/* Architect / Issuer Card */}
        {partnerCompanyName && (
          <Card className="p-4 border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t('quoteFlow.architect') || 'Architect'}
              </span>
              <Badge variant="outline" className="text-[10px] shrink-0 text-muted-foreground">
                {t('quoteFlow.issuer') || 'Issuer'}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                {partnerInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {partnerCompanyName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('quoteFlow.sender') || 'Sender'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Quote Overview */}
      <Card className="p-0 overflow-hidden border-border/60">
        <div className="px-4 py-3 border-b border-border/40">
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t('quoteFlow.quoteSummary') || 'Quote Overview'}
          </h3>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Hash className="h-3 w-3" />
              {t('quoteFlow.quoteNumber') || 'Quote number'}
            </span>
            <span className="text-sm font-mono font-medium text-foreground">
              {quoteReference}
            </span>
          </div>
          {projectName && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t('quoteFlow.briefProject') || 'Project'}
              </span>
              <span className="text-sm font-medium text-foreground">
                {projectName}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {t('quoteFlow.briefDate') || 'Date'}
            </span>
            <span className="text-sm text-foreground">{quoteDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {t('quoteFlow.briefValidUntil') || 'Valid until'}
            </span>
            <span className="text-sm text-foreground">{expiryDate}</span>
          </div>
          <div className="h-px bg-border/40 my-1" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              {t('quoteFlow.totalAmount') || 'Total amount'}
            </span>
            <span className="text-base font-semibold text-foreground">
              {"\u20AC"}{" "}
              {partnerShareAmount.toLocaleString("nl-BE", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </Card>

      {/* View Quote PDF */}
      <Card className="p-0 overflow-hidden border-border/60">
        <button
          onClick={() => setShowPdfViewer(!showPdfViewer)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
        >
          <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {t('quoteFlow.quoteCopyPdf') || 'Your quote copy (PDF)'}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('quoteFlow.readOnlyRef') || 'Read-only reference copy'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Eye className="h-4 w-4 text-muted-foreground" />
            {showPdfViewer ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
        <AnimatePresence>
          {showPdfViewer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 400, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-border/40"
            >
              <div className="h-[400px] bg-muted/20 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {t('quoteFlow.pdfPreviewPlaceholder') || 'Quote PDF preview'}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {quoteReference}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* What happens next */}
      <Card className="p-0 overflow-hidden border-border/60">
        <button
          onClick={() => setShowNextSteps(!showNextSteps)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
        >
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t('quoteFlow.whatHappensNext')}
          </h3>
          {showNextSteps ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
        <AnimatePresence>
          {showNextSteps && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0">
                <ol className="space-y-3 text-sm text-muted-foreground">
                  {(nextSteps ?? [
                    t('quoteFlow.awaitStep1'),
                    t('quoteFlow.awaitStep2'),
                    t('quoteFlow.awaitStep3'),
                  ]).map((stepText, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{stepText}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Simulation + Back */}
      <div className="space-y-3 pt-2">
        {onSimulatePayment && (
          <Card className="p-4 border-dashed border-border/60">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t('quoteFlow.simulationControls') || 'Simulation Controls'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onSimulatePayment}
              className="gap-2"
            >
              <Zap className="h-3.5 w-3.5" />
              {t('quoteFlow.simulateClientSigned') || 'Simulate client signed'}
            </Button>
          </Card>
        )}
        <Button
          variant="outline"
          onClick={onBackToProject}
          className="w-full h-11"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('quoteFlow.backToProjectBinder')}
        </Button>
      </div>
    </div>
  );
}
