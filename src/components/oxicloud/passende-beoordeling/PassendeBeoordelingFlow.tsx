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
import { Check, FileText, Download, Mail, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { useLanguage } from '@/i18n/LanguageContext';

import { type PBStatus, buildPBProjectData, QUOTE_LINE_ITEMS, COMMISSION_RATE, PB_STATUS_CONFIG } from './types';
import { TemporaryReport } from './TemporaryReport';
import { EmailPreviewModal } from './EmailPreviewModal';

interface PassendeBeoordelingFlowProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onComplete: () => void;
  onBack: () => void;
}

const STEP_KEYS: PBStatus[] = [
  'input_complete',
  'quote_generated',
  'awaiting_payment',
  'paid',
  'report_delivered',
];

const STEP_LABELS: Record<PBStatus, string> = {
  on_hold: 'On Hold',
  input_complete: 'Notification',
  quote_generated: 'Quote',
  awaiting_payment: 'Payment',
  paid: 'In Progress',
  report_delivered: 'Delivered',
};

export function PassendeBeoordelingFlow({
  project: oxiProject,
  results,
  onComplete,
  onBack,
}: PassendeBeoordelingFlowProps) {
  const { t } = useLanguage();
  const [pbStatus, setPbStatus] = useState<PBStatus>('input_complete');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<
    'generate_quote' | 'reactivate' | null
  >(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [edgeCases] = useState({
    noResponse14Days: false,
    quoteExpired: false,
    slaMissed: false,
  });

  const [pbProject] = useState(() => buildPBProjectData());
  const subtotal = QUOTE_LINE_ITEMS.reduce((s, i) => s + i.amount, 0);
  const commission = subtotal * COMMISSION_RATE;
  const quoteSentDate = new Date().toLocaleDateString('nl-BE');
  const slaDate = useMemo(
    () => new Date(Date.now() + 21 * 86400000).toLocaleDateString('nl-BE'),
    []
  );

  const openConfirm = (action: typeof confirmDialogAction) => {
    setConfirmDialogAction(action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    if (confirmDialogAction === 'generate_quote') {
      setPbStatus('quote_generated');
    } else if (confirmDialogAction === 'reactivate') {
      setPbStatus('input_complete');
    }
    setConfirmDialogAction(null);
  };

  const handleSendQuote = () => setShowEmailPreview(true);

  const handleEmailConfirm = () => {
    setShowEmailPreview(false);
    toast.success(t('pbFlow.quoteSentSuccess'));
    setPbStatus('awaiting_payment');
  };

  const activeStep: PBStatus = pbStatus === 'on_hold' ? 'input_complete' : pbStatus;
  const stepIndex = STEP_KEYS.indexOf(activeStep);

  const renderFooterAction = () => {
    switch (pbStatus) {
      case 'on_hold':
        return (
          <Button onClick={() => openConfirm('reactivate')} className="h-9 rounded-full text-sm px-5">
            {t('pbFlow.resumeProject')}
          </Button>
        );
      case 'input_complete':
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setPbStatus('on_hold')}
              className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
            >
              {t('pbFlow.clientNotProceeding')}
            </Button>
            <Button onClick={() => openConfirm('generate_quote')} className="h-9 rounded-full text-sm px-5">
              {t('pbFlow.generateQuote')}
            </Button>
          </div>
        );
      case 'quote_generated':
        return (
          <Button onClick={handleSendQuote} className="h-9 rounded-full text-sm px-5 gap-2">
            <Mail className="w-3.5 h-3.5" />
            {t('pbFlow.sendQuoteToClient')}
          </Button>
        );
      case 'awaiting_payment':
        return edgeCases.quoteExpired ? (
          <Button
            variant="outline"
            onClick={() => setPbStatus('input_complete')}
            className="h-9 rounded-full text-sm px-5"
          >
            {t('pbFlow.requestNewQuote')}
          </Button>
        ) : null;
      case 'paid':
        return null;
      case 'report_delivered':
        return (
          <Button
            onClick={() => {
              toast.info(t('pbFlow.reportOpening'));
              onComplete();
            }}
            className="h-9 rounded-full text-sm px-5 gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            {t('pbFlow.viewReport')}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background">
      {/* ── Project binder header strip ── */}
      <div className="border-b border-border bg-background">
        <div className="px-6 py-3 flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('pbFlow.backToProject') || 'Project'}
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

        {/* Compact KPI bar — exceedance + service fee */}
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
            {t('pbFlow.legallyRequired')}
          </span>
        </div>

        {/* ── Step nav (Sandbox-style tabs) ── */}
        <div className="px-6">
          <div className="flex gap-0 -mb-px">
            {STEP_KEYS.map((key, i) => {
              const done = i < stepIndex;
              const current = i === stepIndex;
              return (
                <div
                  key={key}
                  className={cn(
                    'border-b-2 px-4 py-2.5 text-xs font-medium gap-2 inline-flex items-center select-none',
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

      {/* ── Step body — single column, Sandbox-style reading width ── */}
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
              {pbStatus === 'on_hold' && (
                <>
                  <InfoCard tone="muted">{t('pbFlow.onHoldBanner')}</InfoCard>
                  <TemporaryReport project={pbProject} condensed />
                </>
              )}

              {pbStatus === 'input_complete' && (
                <>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('pbFlow.introDesc')}
                  </p>
                  <TemporaryReport project={pbProject} />
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                    {t('pbFlow.discussReport')}
                  </p>
                </>
              )}

              {pbStatus === 'quote_generated' && (
                <>
                  <TemporaryReport project={pbProject} condensed />
                  <div className="rounded-md border border-border bg-card overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/15">
                      <h4 className="text-xs font-medium text-foreground">
                        {t('pbFlow.generatedQuote')}
                      </h4>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-muted-foreground/30 text-muted-foreground">
                        {t('pbFlow.readyToSend')}
                      </span>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-3 py-1.5 text-left font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
                            {t('pbFlow.description')}
                          </th>
                          <th className="px-3 py-1.5 text-right font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
                            {t('pbFlow.amount')}
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
                          <td className="px-3 py-2 font-medium">{t('pbFlow.subtotal')}</td>
                          <td className="px-3 py-2 text-right font-medium tabular-nums">
                            € {subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-muted-foreground">
                            {t('pbFlow.architectCommission')}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                            € {commission.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr className="font-semibold border-t border-border">
                          <td className="px-3 py-2.5">{t('pbFlow.totalExclVat')}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">
                            € {subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-muted-foreground text-[11px]">
                            {t('pbFlow.expectedDelivery')}
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground text-[11px]">
                            {t('pbFlow.threeWeeksAfterPayment')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                    {t('pbFlow.commissionAutoSettled')}
                  </p>
                </>
              )}

              {pbStatus === 'awaiting_payment' && (
                <>
                  <InfoCard tone="muted" icon={<Clock className="w-3.5 h-3.5" />}>
                    {t('pbFlow.awaitingPaymentBanner')}
                  </InfoCard>
                  {edgeCases.noResponse14Days && (
                    <InfoCard tone="muted" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                      {t('pbFlow.noResponse14d')}
                    </InfoCard>
                  )}
                  {edgeCases.quoteExpired && (
                    <InfoCard tone="warning" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                      {t('pbFlow.quoteExpired30d')}
                    </InfoCard>
                  )}
                  <div className="rounded-md border border-border bg-card divide-y divide-border">
                    <Row
                      label={t('pbFlow.quote')}
                      value={`€ ${subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}`}
                    />
                    <Row label={t('pbFlow.sentOn')} value={quoteSentDate} />
                    <Row
                      label={t('pbFlow.expectedDelivery')}
                      value={t('pbFlow.threeWeeksAfterPayment')}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                    {t('pbFlow.clientMustTransfer')}
                  </p>
                  <TemporaryReport project={pbProject} condensed />
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                    {t('pbFlow.noResponse14dAuto')}
                  </p>
                </>
              )}

              {pbStatus === 'paid' && (
                <>
                  <InfoCard tone="muted" icon={<Clock className="w-3.5 h-3.5" />}>
                    {t('pbFlow.reportInProgressBanner')}
                  </InfoCard>
                  {edgeCases.slaMissed && (
                    <InfoCard tone="warning" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                      {t('pbFlow.delayExpected')}
                    </InfoCard>
                  )}
                  <div className="rounded-md border border-border bg-card p-4 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t('pbFlow.expectedDeliveryDate')}
                    </p>
                    <p className="text-3xl font-light tracking-tight tabular-nums text-foreground/85 leading-none">
                      {slaDate}
                    </p>
                    <p className="text-[11px] text-muted-foreground pt-1">
                      {t('pbFlow.threeWeeksWorking')}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                    {t('pbFlow.notificationWhenReady')}
                  </p>
                  <TemporaryReport project={pbProject} condensed />
                </>
              )}

              {pbStatus === 'report_delivered' && (
                <>
                  <InfoCard tone="success" icon={<Check className="w-3.5 h-3.5" />}>
                    {t('pbFlow.reportDelivered')}
                  </InfoCard>
                  <div>
                    <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">
                      {t('pbFlow.documents')}
                    </h4>
                    <div className="rounded-md border border-border bg-card divide-y divide-border">
                      <DocRow
                        label={`${t('pbFlow.temporaryComplianceReport')} — ${pbProject.scanDate}`}
                        onClick={() => toast.info(t('pbFlow.pdfPreparing'))}
                      />
                      <DocRow
                        label={`${t('pbFlow.appropriateAssessmentReport')} — ${pbProject.scanDate}`}
                        onClick={() => toast.info(t('pbFlow.reportLoading'))}
                      />
                    </div>
                  </div>
                  <InfoCard tone="muted">{t('pbFlow.eligibleForPermit')}</InfoCard>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Inline footer actions — sits with the content (no sticky chrome) */}
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmDialogAction === 'generate_quote' && t('pbFlow.generateQuoteTitle')}
              {confirmDialogAction === 'reactivate' && t('pbFlow.resumeProjectTitle')}
            </DialogTitle>
            <DialogDescription>
              {confirmDialogAction === 'generate_quote' && t('pbFlow.generateQuoteDesc')}
              {confirmDialogAction === 'reactivate' && t('pbFlow.resumeProjectDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowConfirmDialog(false)}>
              {t('sandboxTabs.cancel')}
            </Button>
            <Button onClick={handleConfirm}>
              {confirmDialogAction === 'generate_quote'
                ? t('pbFlow.yesGenerateQuote')
                : t('pbFlow.confirmBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EmailPreviewModal
        open={showEmailPreview}
        onOpenChange={setShowEmailPreview}
        project={pbProject}
        onConfirm={handleEmailConfirm}
      />
    </div>
  );
}

/* ─── Helpers ─── */

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
        tone === 'success' && 'border-border bg-muted/15 text-foreground'
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
  );
}
