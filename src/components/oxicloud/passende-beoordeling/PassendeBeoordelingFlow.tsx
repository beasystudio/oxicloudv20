import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { useLanguage } from '@/i18n/LanguageContext';

import { type PBStatus, buildPBProjectData, QUOTE_LINE_ITEMS, COMMISSION_RATE } from './types';
import { DevStatusSimulator } from './DevStatusSimulator';
import { TemporaryReport } from './TemporaryReport';
import { StatusBanner } from './StatusBanner';
import { TimelineStepper } from './TimelineStepper';
import { EmailPreviewModal } from './EmailPreviewModal';

interface PassendeBeoordelingFlowProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onComplete: () => void;
  onBack: () => void;
}

const sandboxExhausted = true;

export function PassendeBeoordelingFlow({
  project,
  results,
  onComplete,
  onBack,
}: PassendeBeoordelingFlowProps) {
  const { t } = useLanguage();
  const [pbStatus, setPbStatus] = useState<PBStatus>('input_complete');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState<'generate_quote' | 'reactivate' | 'confirm_changes' | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [edgeCases, setEdgeCases] = useState({
    noResponse14Days: false,
    quoteExpired: false,
    slaMissed: false,
  });

  const [pbProject] = useState(() => buildPBProjectData());
  const subtotal = QUOTE_LINE_ITEMS.reduce((s, i) => s + i.amount, 0);
  const commission = subtotal * COMMISSION_RATE;
  const quoteSentDate = new Date().toLocaleDateString('nl-BE');
  const slaDate = new Date(Date.now() + 21 * 86400000).toLocaleDateString('nl-BE');

  if (!sandboxExhausted) return null;

  const toggleEdgeCase = (key: 'noResponse14Days' | 'quoteExpired' | 'slaMissed') => {
    setEdgeCases((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  const handleSendQuote = () => {
    setShowEmailPreview(true);
  };

  const handleEmailConfirm = () => {
    setShowEmailPreview(false);
    toast.success(t('pbFlow.quoteSentSuccess'));
    setPbStatus('awaiting_payment');
  };

  return (
    <div className="space-y-6">
      <DevStatusSimulator
        currentStatus={pbStatus}
        onStatusChange={setPbStatus}
        edgeCases={edgeCases}
        onToggleEdgeCase={toggleEdgeCase}
      />

      <Separator />
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-foreground">{t('pbFlow.title')}</h2>
        <Badge variant="outline" className="text-xs font-medium text-muted-foreground border-border rounded-full">
          {t('pbFlow.legallyRequired')}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t('pbFlow.introDesc')}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={pbStatus}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* STATUS 0: ON HOLD */}
          {pbStatus === 'on_hold' && (
            <>
              <StatusBanner variant="grey">
                {t('pbFlow.onHoldBanner')}
              </StatusBanner>
              <TemporaryReport project={pbProject} condensed />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => openConfirm('reactivate')}
              >
                
                {t('pbFlow.resumeProject')}
              </Button>
            </>
          )}

          {/* STATUS 1: INPUT COMPLETE */}
          {pbStatus === 'input_complete' && (
            <>
              <TemporaryReport project={pbProject} />
              <p className="text-xs text-muted-foreground">
                {t('pbFlow.discussReport')}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setPbStatus('on_hold')}
                >
                  {t('pbFlow.clientNotProceeding')}
                </Button>
                <Button className="flex-1" onClick={() => openConfirm('generate_quote')}>
                  {t('pbFlow.generateQuote')}
                  
                </Button>
              </div>
            </>
          )}

          {/* STATUS 2: QUOTE GENERATED */}
          {pbStatus === 'quote_generated' && (
            <>
              <TemporaryReport project={pbProject} condensed />

              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{t('pbFlow.generatedQuote')}</h4>
                  <Badge variant="outline" className="text-xs font-medium text-muted-foreground border-border rounded-full">
                    {t('pbFlow.readyToSend')}
                  </Badge>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                          {t('pbFlow.description')}
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                          {t('pbFlow.amount')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {QUOTE_LINE_ITEMS.map((item) => (
                        <tr key={item.description}>
                          <td className="px-4 py-2.5">{item.description}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            € {item.amount.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/20">
                        <td className="px-4 py-2.5 font-medium">{t('pbFlow.subtotal')}</td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                          € {subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {t('pbFlow.architectCommission')}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          € {commission.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr className="font-semibold">
                        <td className="px-4 py-3">{t('pbFlow.totalExclVat')}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          € {subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {t('pbFlow.expectedDelivery')}
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">
                          {t('pbFlow.threeWeeksAfterPayment')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-muted-foreground">
                  {t('pbFlow.commissionAutoSettled')}
                </p>
              </div>

              <Button className="w-full" onClick={handleSendQuote}>
                
                {t('pbFlow.sendQuoteToClient')}
              </Button>
            </>
          )}

          {/* STATUS 3: AWAITING PAYMENT */}
          {pbStatus === 'awaiting_payment' && (
            <>
              <StatusBanner variant="amber">
                {t('pbFlow.awaitingPaymentBanner')}
              </StatusBanner>

              {edgeCases.noResponse14Days && (
                <StatusBanner variant="amber">
                  {t('pbFlow.noResponse14d')}
                </StatusBanner>
              )}

              {edgeCases.quoteExpired && (
                <>
                  <StatusBanner variant="red">
                    {t('pbFlow.quoteExpired30d')}
                  </StatusBanner>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setPbStatus('input_complete')}
                  >
                    {t('pbFlow.requestNewQuote')}
                  </Button>
                </>
              )}

              <p className="text-xs text-muted-foreground">
                {t('pbFlow.clientMustTransfer')}
              </p>

              <TemporaryReport project={pbProject} condensed />

              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{t('pbFlow.quote')}</p>
                  <p className="text-xs text-muted-foreground">
                    € {subtotal.toLocaleString('nl-BE', { minimumFractionDigits: 2 })} •
                    {t('pbFlow.sentOn')} {quoteSentDate}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {t('pbFlow.noResponse14dAuto')}
              </p>

              <TimelineStepper currentStep={0} />
            </>
          )}

          {/* STATUS 4: PAID / REPORT IN PROGRESS */}
          {pbStatus === 'paid' && (
            <>
              <StatusBanner variant="blue">
                {t('pbFlow.reportInProgressBanner')}
              </StatusBanner>

              {edgeCases.slaMissed && (
                <StatusBanner variant="amber">
                  {t('pbFlow.delayExpected')}
                </StatusBanner>
              )}

              <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                <p className="text-sm font-semibold">{t('pbFlow.expectedDeliveryDate')}</p>
                <p className="text-lg font-semibold tabular-nums">{slaDate}</p>
                <p className="text-xs text-muted-foreground">
                  {t('pbFlow.threeWeeksWorking')}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('pbFlow.notificationWhenReady')}
                </p>
              </div>

              <TemporaryReport project={pbProject} condensed />
              <TimelineStepper currentStep={2} />
            </>
          )}

          {/* STATUS 5: REPORT DELIVERED */}
          {pbStatus === 'report_delivered' && (
            <>
              <StatusBanner variant="green">
                {t('pbFlow.reportDelivered')}
              </StatusBanner>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                <h4 className="text-sm font-semibold">{t('pbFlow.documents')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      
                      <span className="text-sm">{t('pbFlow.temporaryComplianceReport')} - {pbProject.scanDate}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => toast.info(t('pbFlow.pdfPreparing'))}
                    >
                      
                      {t('pbFlow.download')}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      
                      <span className="text-sm">{t('pbFlow.appropriateAssessmentReport')} - {pbProject.scanDate}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => toast.info(t('pbFlow.reportLoading'))}
                    >
                      
                      {t('pbFlow.download')}
                    </Button>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={() => toast.info(t('pbFlow.reportOpening'))}>
                
                {t('pbFlow.viewReport')}
              </Button>

              <div className="rounded-2xl border border-border bg-background px-4 py-3">
                <p className="text-sm text-foreground">
                  {t('pbFlow.eligibleForPermit')}
                </p>
              </div>

              <TimelineStepper currentStep={4} />
            </>
          )}
        </motion.div>
      </AnimatePresence>

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
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirmDialog(false)}>
              {t('sandboxTabs.cancel')}
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              {confirmDialogAction === 'generate_quote' ? t('pbFlow.yesGenerateQuote') : t('pbFlow.confirmBtn')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        open={showEmailPreview}
        onOpenChange={setShowEmailPreview}
        project={pbProject}
        onConfirm={handleEmailConfirm}
      />
    </div>
  );
}