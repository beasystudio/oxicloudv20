<<<<<<< HEAD
import { useMemo, useState } from 'react';
import { QuoteSentAwaitingStep } from '@/components/oxicloud/quote-flow/QuoteSentAwaitingStep';
=======
/**
 * Passende Beoordeling — Functional Spec v4
 *
 * Manually delivered service. No automated calculation.
 * Same status sequence as the v0 compliance flow:
 *   price_generated → awaiting_payment → paid → report_in_progress → report_delivered
 *
 * PB-specific elements:
 *   • Quote email uses the Kennisgeving Passende Beoordeling template
 *   • Once paid, Christine prepares the report manually (no architect form)
 *   • Christine uploads the final report → report is held → released to the client
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Check,
  FileText,
  Download,
  Mail,
  Clock,
  ArrowLeft,
  Upload,
  Lock,
  Zap,
  CheckCircle2,
  User,
} from 'lucide-react';
>>>>>>> 5f4d97eabf43c197dfea62a530a8b48de1c13a49
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

<<<<<<< HEAD
=======
const STEP_LABELS: Record<PBStatus, string> = {
  price_generated:    'Quote',
  awaiting_payment:   'Payment',
  paid:               'In Preparation',
  report_in_progress: 'Report Held',
  report_delivered:   'Released',
};

>>>>>>> 5f4d97eabf43c197dfea62a530a8b48de1c13a49
export function PassendeBeoordelingFlow({
  project,
  onComplete,
  onBack,
}: PassendeBeoordelingFlowProps) {
<<<<<<< HEAD
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState<PBStatus>('quote_sent');
=======
  const [pbStatus, setPbStatus] = useState<PBStatus>('price_generated');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [reportReleased, setReportReleased] = useState(false);

>>>>>>> 5f4d97eabf43c197dfea62a530a8b48de1c13a49
  const [pbProject] = useState(() => buildPBProjectData());
  const quoteReference = useMemo(
    () => `QT-${new Date().getFullYear()}-${project.id.slice(0, 4).toUpperCase() || 'PROJ'}`,
    [project.id]
  );
  const quoteAmount = useMemo(
    () => QUOTE_LINE_ITEMS.reduce((total, item) => total + item.amount, 0),
    []
  );

<<<<<<< HEAD
  const handleClientSigned = () => {
    setStatus('signed');
    window.setTimeout(onComplete, 250);
  };

  return (
    <QuoteSentAwaitingStep
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
        t('pbFlow.awaitStep2') || 'They review and sign online — you\u2019ll be notified instantly',
        t('pbFlow.awaitStep3') || 'Once payment is received, the A-Spine team prepares your Passende Beoordeling report and delivers it to this project binder',
      ]}
    />
=======
  const handleSendQuote = () => {
    setShowEmailPreview(false);
    toast.success(`Kennisgeving + quote sent to ${pbProject.clientEmail} from ${KENNISGEVING_SENDER}`);
    setPbStatus('awaiting_payment');
  };

  const handlePaymentReceived = () => {
    toast.success('Payment confirmed. Christine has been notified to prepare the PB report.');
    setPbStatus('paid');
  };

  const handleChristineUpload = () => {
    toast.success('Final PB report uploaded by Christine. Held until client confirms release.');
    setPbStatus('report_in_progress');
  };

  const handleReleaseReport = () => {
    setReportReleased(true);
    toast.success('Report released — client now has access.');
    setTimeout(() => setPbStatus('report_delivered'), 600);
  };

  const stepIndex = PB_STATUSES.indexOf(pbStatus);

  const renderFooterAction = () => {
    switch (pbStatus) {
      case 'price_generated':
        return (
          <Button onClick={() => setShowEmailPreview(true)} className="h-9 rounded-full text-sm px-5 gap-2">
            <Mail className="w-3.5 h-3.5" />
            Send quote (Kennisgeving email)
          </Button>
        );
      case 'awaiting_payment':
        return (
          <Button
            variant="outline"
            onClick={handlePaymentReceived}
            className="h-9 rounded-full text-sm px-5 gap-2 border-dashed"
          >
            <Zap className="w-3.5 h-3.5" />
            Simulate signature + payment
          </Button>
        );
      case 'paid':
        return (
          <Button onClick={handleChristineUpload} className="h-9 rounded-full text-sm px-5 gap-2">
            <Upload className="w-3.5 h-3.5" />
            Christine: upload final PB report
          </Button>
        );
      case 'report_in_progress':
        return (
          <Button
            onClick={handleReleaseReport}
            className="h-9 rounded-full text-sm px-5 gap-2"
            variant="outline"
          >
            <Zap className="w-3.5 h-3.5" />
            Simulate client release payment
          </Button>
        );
      case 'report_delivered':
        return (
          <Button
            onClick={() => {
              toast.info('Opening PB report…');
              onComplete();
            }}
            className="h-9 rounded-full text-sm px-5 gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            View PB report
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="px-6 py-3 flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Project
          </button>
          <span className="text-muted-foreground/40">/</span>
          <div className="flex items-baseline gap-3 min-w-0">
            <h1 className="text-sm font-medium text-foreground truncate">{pbProject.name}</h1>
            <span className="text-[11px] text-muted-foreground truncate">{pbProject.address}</span>
          </div>
          <div className="ml-auto flex items-center gap-4 text-[11px] text-muted-foreground shrink-0">
            <MetaItem label="Ref" value={pbProject.referenceNumber} />
            <MetaItem label="Architect" value={pbProject.architectName} />
            <MetaItem label="Client" value={pbProject.clientName} />
            <MetaItem label="Scan" value={pbProject.scanDate} />
          </div>
        </div>

        <div className="px-6 pb-3 flex items-center gap-6 text-xs">
          <KpiInline
            label="NOx exceedance"
            value={`+${pbProject.overshoot.toFixed(1)}`}
            unit="kg NOₓ"
            sub={`${pbProject.noxImpact} / ${pbProject.threshold} kg`}
          />
          <span className="h-6 w-px bg-border" />
          <KpiInline
            label="Service fee"
            value={`€ ${subtotal.toLocaleString('nl-BE')}`}
            unit="excl. VAT"
            sub="Architect commission auto-settled"
          />
          <span className="h-6 w-px bg-border" />
          <KpiInline label="Status" value={PB_STATUS_CONFIG[pbStatus].label} />
          <span className="ml-auto text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border border-muted-foreground/30 text-muted-foreground">
            Manually delivered service
          </span>
        </div>

        {/* Step rail — mirrors v0 status sequence */}
        <div className="px-6">
          <div className="flex gap-0 -mb-px overflow-x-auto">
            {PB_STATUSES.map((key, i) => {
              const done = i < stepIndex;
              const current = i === stepIndex;
              return (
                <div
                  key={key}
                  className={cn(
                    'border-b-2 px-4 py-2.5 text-xs font-medium gap-2 inline-flex items-center select-none whitespace-nowrap',
                    current
                      ? 'border-foreground text-foreground'
                      : done
                        ? 'border-transparent text-foreground/55'
                        : 'border-transparent text-muted-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-[9px] tabular-nums border',
                      current && 'bg-foreground text-background border-foreground',
                      done && 'bg-muted-foreground/40 text-background border-transparent',
                      !current && !done && 'border-border text-muted-foreground'
                    )}
                  >
                    {done ? <Check className="w-2.5 h-2.5" /> : i + 1}
                  </span>
                  {STEP_LABELS[key]}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pbStatus}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* ─── 1. Quote Ready — preview the Kennisgeving email + quote ─── */}
              {pbStatus === 'price_generated' && (
                <>
                  <InfoCard tone="muted" icon={<Mail className="w-3.5 h-3.5" />}>
                    The quote will be sent to <strong>{pbProject.clientEmail}</strong> from{' '}
                    <strong>{KENNISGEVING_SENDER}</strong> using the <em>Kennisgeving Passende
                    Beoordeling</em> email template — the legal context is delivered alongside
                    the quote link.
                  </InfoCard>

                  <QuoteBreakdown subtotal={subtotal} commission={commission} />

                  <div>
                    <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">
                      Email preview — Kennisgeving template
                    </h4>
                    <KennisgevingEmailPreview project={pbProject} quoteAmount={subtotal} />
                  </div>
                </>
              )}

              {/* ─── 2. Awaiting Payment ─── */}
              {pbStatus === 'awaiting_payment' && (
                <>
                  <InfoCard tone="muted" icon={<Clock className="w-3.5 h-3.5" />}>
                    Kennisgeving + quote sent to <strong>{pbProject.clientEmail}</strong> on{' '}
                    {quoteSentDate}. Waiting for the client to sign and pay. Once payment is
                    received, Christine is automatically notified to begin the PB report.
                  </InfoCard>
                  <div className="rounded-md border border-border bg-card divide-y divide-border">
                    <Row label="Quote total" value={`€ ${subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}`} />
                    <Row label="Sent from" value={KENNISGEVING_SENDER} />
                    <Row label="Sent to" value={pbProject.clientEmail} />
                    <Row label="Sent on" value={quoteSentDate} />
                    <Row label="Architect commission" value={`€ ${commission.toLocaleString('nl-BE', { minimumFractionDigits: 2 })} (auto-settled on payment)`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                    The Kennisgeving email is permanently archived in the NOx Card.
                  </p>
                </>
              )}

              {/* ─── 3. Paid — Christine preparing report manually ─── */}
              {pbStatus === 'paid' && (
                <>
                  <InfoCard tone="muted" icon={<User className="w-3.5 h-3.5" />}>
                    Payment received. Unlike the v0 compliance flow, no detailed NOx form is
                    required from the architect. Christine is now manually preparing the
                    Passende Beoordeling report internally.
                  </InfoCard>
                  <div className="rounded-md border border-border bg-card p-4 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Expected delivery date
                    </p>
                    <p className="text-3xl font-light tracking-tight tabular-nums text-foreground/85 leading-none">
                      {slaDate}
                    </p>
                    <p className="text-[11px] text-muted-foreground pt-1">
                      ≈ 3 working weeks after payment
                    </p>
                  </div>
                  <div className="rounded-md border border-dashed border-border bg-muted/10 p-4 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Internal action:</span>{' '}
                    Christine drafts the report, completes the legal review and the ecological
                    impact analysis, then uploads the final PDF to this NOx Card.
                  </div>
                </>
              )}

              {/* ─── 4. Report in Progress — Christine has uploaded; held until release ─── */}
              {pbStatus === 'report_in_progress' && (
                <>
                  <InfoCard tone="muted" icon={<Lock className="w-3.5 h-3.5" />}>
                    Christine has uploaded the final PB report. The report is held until the
                    client confirms the release payment — identical to the v0 report-held gate.
                  </InfoCard>

                  {/* Held report card */}
                  <div className="rounded-md border border-border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/15">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          Passende Beoordeling — Final Report.pdf
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/40 text-amber-600 dark:text-amber-400">
                        Held — awaiting release
                      </span>
                    </div>
                    <div className="p-4 flex items-center gap-3">
                      <div className="h-16 w-12 rounded border border-border bg-muted/40 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">
                          Uploaded by Christine · {new Date().toLocaleDateString('nl-BE')}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          The download will unlock automatically once the release payment is
                          confirmed.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ─── 5. Report Delivered ─── */}
              {pbStatus === 'report_delivered' && (
                <>
                  <InfoCard tone="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                    The PB report has been released and is permanently stored in the NOx Card.
                    The project is eligible to proceed to permit application.
                  </InfoCard>
                  <div>
                    <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">
                      Documents (stored permanently in NOx Card)
                    </h4>
                    <div className="rounded-md border border-border bg-card divide-y divide-border">
                      <DocRow
                        label={`Kennisgeving email — ${pbProject.scanDate}`}
                        onClick={() => toast.info('Email archive preparing…')}
                      />
                      <DocRow
                        label={`Passende Beoordeling — Final Report — ${pbProject.scanDate}`}
                        onClick={() => toast.info('PB report preparing…')}
                      />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer actions */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </Button>
            <div>{renderFooterAction()}</div>
          </div>
        </div>
      </div>

      {/* Send-quote confirmation with Kennisgeving email preview */}
      <Dialog open={showEmailPreview} onOpenChange={setShowEmailPreview}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send quote via Kennisgeving email
            </DialogTitle>
            <DialogDescription>
              Review the email below — it will be sent from {KENNISGEVING_SENDER} to{' '}
              {pbProject.clientEmail}.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <KennisgevingEmailPreview project={pbProject} quoteAmount={subtotal} />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowEmailPreview(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendQuote}>Confirm &amp; Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Helpers ─── */

function QuoteBreakdown({ subtotal, commission }: { subtotal: number; commission: number }) {
  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/15">
        <h4 className="text-xs font-medium text-foreground">
          Generated quote — Passende Beoordeling
        </h4>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-muted-foreground/30 text-muted-foreground">
          Ready to send
        </span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-1.5 text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
              Description
            </th>
            <th className="px-3 py-1.5 text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {QUOTE_LINE_ITEMS.map((item) => (
            <tr key={item.description}>
              <td className="px-3 py-2 text-foreground">{item.description}</td>
              <td className="px-3 py-2 text-right tabular-nums">
                € {item.amount.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
          <tr className="bg-muted/15">
            <td className="px-3 py-2 font-medium">Subtotal</td>
            <td className="px-3 py-2 text-right font-medium tabular-nums">
              € {subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2 text-muted-foreground">
              Architect commission (auto-settled)
            </td>
            <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
              € {commission.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="font-semibold border-t border-border">
            <td className="px-3 py-2.5">Total (excl. VAT)</td>
            <td className="px-3 py-2.5 text-right tabular-nums">
              € {subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 min-w-0">
      <span className="text-muted-foreground/70">{label}</span>
      <span className="text-foreground/85 truncate max-w-[140px]">{value}</span>
    </div>
  );
}

function KpiInline({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-medium text-foreground tabular-nums">{value}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      {sub && <span className="text-[10px] text-muted-foreground/80 mt-0.5">{sub}</span>}
    </div>
  );
}

function InfoCard({
  children,
  tone = 'muted',
  icon,
}: {
  children: React.ReactNode;
  tone?: 'muted' | 'warning' | 'success';
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2.5 text-xs leading-relaxed flex items-start gap-2',
        tone === 'muted' && 'border-border bg-muted/15 text-foreground',
        tone === 'warning' && 'border-border bg-muted/30 text-foreground',
        tone === 'success' && 'border-emerald-500/30 bg-emerald-500/5 text-foreground'
      )}
    >
      {icon && <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground tabular-nums">{value}</span>
    </div>
  );
}

function DocRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-foreground truncate">{label}</span>
      </div>
      <button
        onClick={onClick}
        className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <Download className="w-3 h-3" />
        Download
      </button>
    </div>
>>>>>>> 5f4d97eabf43c197dfea62a530a8b48de1c13a49
  );
}
