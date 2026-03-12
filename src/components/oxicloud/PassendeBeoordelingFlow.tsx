import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { Lock, Unlock, FileText, Clock, CheckCircle2, Upload, CreditCard, AlertTriangle, Send } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

type AssessmentStatus =
'intro' |
'temporary_report' |
'quote_sent' |
'quote_accepted' |
'payment_pending' |
'payment_confirmed' |
'admin_in_progress' |
'admin_uploaded' |
'completed';

interface PassendeBeoordelingFlowProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onComplete: () => void;
  onBack: () => void;
}

export function PassendeBeoordelingFlow({ project, results, onComplete, onBack }: PassendeBeoordelingFlowProps) {
  const { t } = useLanguage();
  const [currentStatus, setCurrentStatus] = useState<AssessmentStatus>('intro');
  const [isDownloading, setIsDownloading] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);

  const quoteAmount = 2450;
  const estimatedDays = 15;

  const getStatusConfig = (status: AssessmentStatus) => {
    const configs: Record<AssessmentStatus, { label: string; subStatus: string; badgeColor: string; locked: boolean; stepIndex: number }> = {
      intro: { label: t('passendeBeoordeling.statusIntro'), subStatus: '', badgeColor: 'bg-muted', locked: false, stepIndex: 0 },
      temporary_report: { label: t('passendeBeoordeling.statusTemporaryReport'), subStatus: t('passendeBeoordeling.subStatusReport'), badgeColor: 'bg-muted', locked: false, stepIndex: 1 },
      quote_sent: { label: t('passendeBeoordeling.statusQuoteSent'), subStatus: t('passendeBeoordeling.subStatusAwaitingClient'), badgeColor: 'bg-yellow-500/20 text-yellow-700', locked: true, stepIndex: 2 },
      quote_accepted: { label: t('passendeBeoordeling.statusQuoteAccepted'), subStatus: t('passendeBeoordeling.subStatusClientAgreed'), badgeColor: 'bg-yellow-500/20 text-yellow-700', locked: true, stepIndex: 3 },
      payment_pending: { label: t('passendeBeoordeling.statusPaymentPending'), subStatus: t('passendeBeoordeling.subStatusPaymentLink'), badgeColor: 'bg-orange-500/20 text-orange-700', locked: true, stepIndex: 4 },
      payment_confirmed: { label: t('passendeBeoordeling.statusPaymentConfirmed'), subStatus: t('passendeBeoordeling.subStatusUnlocked'), badgeColor: 'bg-blue-500/20 text-blue-700', locked: false, stepIndex: 5 },
      admin_in_progress: { label: t('passendeBeoordeling.statusAdminInProgress'), subStatus: t('passendeBeoordeling.subStatusSpecialist'), badgeColor: 'bg-blue-500/20 text-blue-700', locked: true, stepIndex: 6 },
      admin_uploaded: { label: t('passendeBeoordeling.statusAdminUploaded'), subStatus: t('passendeBeoordeling.subStatusUploaded'), badgeColor: 'bg-primary/20 text-primary', locked: false, stepIndex: 7 },
      completed: { label: t('passendeBeoordeling.statusCompleted'), subStatus: t('passendeBeoordeling.subStatusFinal'), badgeColor: 'bg-primary/20 text-primary', locked: false, stepIndex: 8 }
    };
    return configs[status];
  };

  const STEPS = [
    { label: t('passendeBeoordeling.stepIntro'), icon: FileText },
    { label: t('passendeBeoordeling.stepPreliminary'), icon: FileText },
    { label: t('passendeBeoordeling.stepQuote'), icon: Send },
    { label: t('passendeBeoordeling.stepApproval'), icon: CheckCircle2 },
    { label: t('passendeBeoordeling.stepPayment'), icon: CreditCard },
    { label: t('passendeBeoordeling.stepUnlocked'), icon: Unlock },
    { label: t('passendeBeoordeling.stepInProgress'), icon: Clock },
    { label: t('passendeBeoordeling.stepUploaded'), icon: Upload },
    { label: t('passendeBeoordeling.stepCompleted'), icon: CheckCircle2 },
  ];

  const config = getStatusConfig(currentStatus);
  const progressPercent = (config.stepIndex + 1) / STEPS.length * 100;

  const handleDownloadTemporaryReport = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      toast.success(t('passendeBeoordeling.preliminaryReport'), { description: t('passendeBeoordeling.preliminaryReportDesc') });
    }, 1500);
  };

  const handleSendQuote = () => {
    if (!clientEmail || !clientName) { toast.error(t('passendeBeoordeling.provideClientDetails')); return; }
    setCurrentStatus('quote_sent');
    toast.success(t('passendeBeoordeling.quoteSent'), { description: t('passendeBeoordeling.quoteSentDesc').replace('{email}', clientEmail) });
    setTimeout(() => {
      setCurrentStatus('quote_accepted');
      setShowQuoteDialog(true);
    }, 2000);
  };

  const handleAcceptQuote = () => {
    setShowQuoteDialog(false);
    setCurrentStatus('payment_pending');
  };

  const handleSimulatePayment = () => {
    setCurrentStatus('payment_confirmed');
    toast.success(t('passendeBeoordeling.statusPaymentConfirmed'), { description: t('passendeBeoordeling.paymentReceived') });
    setTimeout(() => {
      setCurrentStatus('admin_in_progress');
    }, 2000);
  };

  const handleSimulateAdminUpload = () => {
    setCurrentStatus('admin_uploaded');
    toast.success(t('passendeBeoordeling.documentAvailable'), { description: t('passendeBeoordeling.documentAvailableDesc') });
  };

  const ProgressTracker = () =>
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('passendeBeoordeling.progress')}</p>
        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", config.badgeColor)}>
          {config.locked && <Lock className="inline w-3 h-3 mr-1" />}
          {!config.locked && config.stepIndex > 0 && <Unlock className="inline w-3 h-3 mr-1" />}
          {config.label}
        </span>
      </div>
      <Progress value={progressPercent} className="h-2" />
      {config.subStatus && <p className="text-xs text-muted-foreground mt-2">{config.subStatus}</p>}
    </div>;

  // ── INTRO ──
  if (currentStatus === 'intro') {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-background">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <ProgressTracker />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">{t('passendeBeoordeling.title')}</h1>
              <p className="text-base text-muted-foreground">{t('passendeBeoordeling.introDesc')}</p>
            </div>
            <div className="bg-destructive/5 rounded-xl border border-destructive/20 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-3">{t('passendeBeoordeling.currentStatus')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">{t('passendeBeoordeling.totalExceedance')}</p><p className="text-2xl font-semibold text-destructive tabular-nums">{(results.overall_max_percent * 100).toFixed(0)}%</p></div>
                    <div><p className="text-sm text-muted-foreground">{t('passendeBeoordeling.dominantPhase')}</p><p className="text-lg font-medium text-foreground">{results.dominant_phase === 'puntbronnen' ? t('passendeBeoordeling.stationarySources') : results.dominant_phase === 'lijnbronnen_construction' ? t('passendeBeoordeling.constructionTrafficLabel') : t('passendeBeoordeling.operationalTrafficLabel')}</p></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{t('passendeBeoordeling.processSteps')}</h3>
              <ol className="space-y-3 text-sm">
                {[
                  t('passendeBeoordeling.step1Download'),
                  t('passendeBeoordeling.step2Quote'),
                  t('passendeBeoordeling.step3Approve'),
                  t('passendeBeoordeling.step4Specialist'),
                  t('passendeBeoordeling.step5Upload'),
                ].map((text, i) =>
                  <li key={i} className="flex gap-3">
                    <span className={cn("flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium", i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>{i + 1}</span>
                    <span className="text-muted-foreground">{text}</span>
                  </li>
                )}
              </ol>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Button onClick={() => setCurrentStatus('temporary_report')} className="flex-1 h-12 rounded-xl text-base font-medium">{t('passendeBeoordeling.continueToPreliminary')}</Button>
              <Button variant="outline" onClick={onBack} className="rounded-xl h-12">← {t('modals.back')}</Button>
            </div>
          </motion.div>
        </div>
      </div>);
  }

  // ── TEMPORARY REPORT ──
  if (currentStatus === 'temporary_report') {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-background">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <ProgressTracker />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">{t('passendeBeoordeling.preliminaryReport')}</h1>
              <p className="text-base text-muted-foreground">{t('passendeBeoordeling.preliminaryReportDesc')}</p>
            </div>
            <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{t('passendeBeoordeling.reportContents')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t('passendeBeoordeling.reportContent1')}</li>
                <li>• {t('passendeBeoordeling.reportContent2')}</li>
                <li>• {t('passendeBeoordeling.reportContent3')}</li>
                <li>• {t('passendeBeoordeling.reportContent4')}</li>
                <li>• {t('passendeBeoordeling.reportContent5')}</li>
              </ul>
              <div className="pt-4 border-t border-border">
                <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
                  <p className="text-sm font-medium text-foreground">{t('passendeBeoordeling.assessmentStatus')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('passendeBeoordeling.assessmentStatusDesc')}</p>
                </div>
              </div>
            </div>
            <Button onClick={handleDownloadTemporaryReport} disabled={isDownloading} className="w-full h-12 text-base font-medium rounded-lg bg-primary">
              {isDownloading ? t('passendeBeoordeling.preparing') : t('passendeBeoordeling.downloadPreliminary')}
            </Button>
            <div className="bg-muted/30 rounded-xl border border-border p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{t('passendeBeoordeling.clientDetails')}</h3>
              <p className="text-sm text-muted-foreground">{t('passendeBeoordeling.clientDetailsDesc')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">{t('passendeBeoordeling.clientName')}</Label>
                  <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder={t('passendeBeoordeling.clientNamePlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">{t('passendeBeoordeling.clientEmail')}</Label>
                  <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder={t('passendeBeoordeling.clientEmailPlaceholder')} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Button onClick={handleSendQuote} disabled={!clientName || !clientEmail} className="flex-1 h-12 rounded-xl text-base font-medium">{t('passendeBeoordeling.sendQuote')}</Button>
              <Button variant="outline" onClick={() => setCurrentStatus('intro')} className="rounded-xl h-12">← {t('modals.back')}</Button>
            </div>
          </motion.div>
        </div>
      </div>);
  }

  // ── QUOTE SENT / ACCEPTED ──
  if (currentStatus === 'quote_sent' || currentStatus === 'quote_accepted') {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-background">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <ProgressTracker />
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Lock className="w-7 h-7 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {currentStatus === 'quote_sent' ? t('passendeBeoordeling.quoteSent') : t('passendeBeoordeling.quoteAccepted')}
              </h1>
              <p className="text-base text-muted-foreground">
                {currentStatus === 'quote_sent' ? t('passendeBeoordeling.quoteSentDesc').replace('{email}', clientEmail) : t('passendeBeoordeling.quoteAcceptedDesc')}
              </p>
            </div>
            {currentStatus === 'quote_accepted' &&
              <Button onClick={() => setShowQuoteDialog(true)} className="w-full h-12 rounded-xl text-base font-medium">{t('passendeBeoordeling.viewAndAcceptQuote')}</Button>
            }
          </motion.div>
        </div>

        <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="text-xl font-semibold">{t('passendeBeoordeling.quoteTitle')}</DialogTitle></DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">{t('passendeBeoordeling.assessmentType')}</span><span className="font-medium">{t('passendeBeoordeling.appropriateAssessment')}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">{t('passendeBeoordeling.project')}</span><span className="font-medium">{project.name}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">{t('passendeBeoordeling.deliveryTime')}</span><span className="font-medium">{t('passendeBeoordeling.workingDays').replace('{days}', String(estimatedDays))}</span></div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between text-lg"><span className="font-medium">{t('passendeBeoordeling.totalAmount')}</span><span className="font-semibold text-primary">€{quoteAmount.toLocaleString()}</span></div>
                  <p className="text-xs text-muted-foreground mt-1">{t('passendeBeoordeling.excludingVat')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="confirm" checked={confirmationChecked} onCheckedChange={(checked) => setConfirmationChecked(checked === true)} />
                <label htmlFor="confirm" className="text-sm text-muted-foreground leading-tight">{t('passendeBeoordeling.confirmQuoteDiscussion')}</label>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAcceptQuote} disabled={!confirmationChecked} className="flex-1 h-11 rounded-xl">{t('passendeBeoordeling.acceptQuote')}</Button>
                <Button variant="outline" onClick={() => setShowQuoteDialog(false)} className="rounded-xl">{t('passendeBeoordeling.cancel')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>);
  }

  // ── PAYMENT PENDING ──
  if (currentStatus === 'payment_pending') {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-background">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <ProgressTracker />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">{t('passendeBeoordeling.awaitingPayment')}</h1>
              <p className="text-base text-muted-foreground">{t('passendeBeoordeling.completePayment')}</p>
            </div>
            <div className="bg-muted/30 rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">{t('passendeBeoordeling.amountDue')}</span>
                <span className="text-2xl font-semibold text-primary">€{quoteAmount.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t('passendeBeoordeling.paymentBilled').replace('{name}', clientName).replace('{email}', clientEmail)}</p>
            </div>
            <div className="bg-orange-500/5 rounded-xl border border-orange-500/20 p-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{t('passendeBeoordeling.systemLocked')}</p>
            </div>
            <Button onClick={handleSimulatePayment} className="w-full h-12 rounded-xl text-base font-medium">
              <CreditCard className="w-4 h-4 mr-2" />
              {t('passendeBeoordeling.simulatePayment')}
            </Button>
          </motion.div>
        </div>
      </div>);
  }

  // ── PAYMENT CONFIRMED ──
  if (currentStatus === 'payment_confirmed') {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-background">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 text-center">
            <ProgressTracker />
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Unlock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('passendeBeoordeling.systemUnlocked')}</h1>
            <p className="text-base text-muted-foreground">{t('passendeBeoordeling.paymentReceived')}</p>
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
              <p className="text-sm text-muted-foreground">{t('passendeBeoordeling.specialistPreparation')}</p>
            </div>
          </motion.div>
        </div>
      </div>);
  }

  // ── ADMIN IN PROGRESS ──
  if (currentStatus === 'admin_in_progress') {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-background">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <ProgressTracker />
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('passendeBeoordeling.specialistWorking')}</h1>
              <p className="text-base text-muted-foreground">{t('passendeBeoordeling.specialistWorkingDesc')}</p>
            </div>
            <div className="bg-blue-500/5 rounded-xl border border-blue-500/20 p-5 flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{t('passendeBeoordeling.documentBeingPrepared')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('passendeBeoordeling.estimatedCompletion').replace('{days}', String(estimatedDays))}</p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground">{t('passendeBeoordeling.adminWillUpload')}</p>
            </div>
            <div className="border-t border-border pt-6">
              <p className="text-xs text-muted-foreground mb-3 text-center">{t('passendeBeoordeling.demoSimulate')}</p>
              <Button onClick={handleSimulateAdminUpload} variant="outline" className="w-full h-11 rounded-xl">
                <Upload className="w-4 h-4 mr-2" />
                {t('passendeBeoordeling.uploadDocument')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>);
  }

  // ── ADMIN UPLOADED ──
  if (currentStatus === 'admin_uploaded') {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-background">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <ProgressTracker />
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('passendeBeoordeling.documentAvailable')}</h1>
              <p className="text-base text-muted-foreground">{t('passendeBeoordeling.documentAvailableDesc')}</p>
            </div>
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
              <h3 className="font-semibold text-foreground mb-2">{t('passendeBeoordeling.projectFileUpdatedPB')}</h3>
              <p className="text-sm text-muted-foreground">{t('passendeBeoordeling.documentAddedTo').replace('{name}', project.name)}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { toast.success(t('passendeBeoordeling.viewDocument')); setCurrentStatus('completed'); }} className="flex-1 h-12 rounded-xl text-base font-medium">{t('passendeBeoordeling.viewDocument')}</Button>
              <Button variant="outline" onClick={() => setCurrentStatus('completed')} className="rounded-xl h-12">{t('modals.next')}</Button>
            </div>
          </motion.div>
        </div>
      </div>);
  }

  // ── COMPLETED ──
  if (currentStatus === 'completed') {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-background">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
            <ProgressTracker />
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-3">{t('passendeBeoordeling.assessmentCompleted')}</h1>
              <p className="text-base text-muted-foreground">{t('passendeBeoordeling.reportReady')}</p>
            </div>
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
              <h3 className="font-semibold text-foreground mb-2">{t('passendeBeoordeling.projectStatusUpdated')}</h3>
              <p className="text-sm text-muted-foreground">{t('passendeBeoordeling.markedAsCompliant')}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { toast.success(t('passendeBeoordeling.downloadFinalReport')); }} className="flex-1 h-12 rounded-xl text-base font-medium">{t('passendeBeoordeling.downloadFinalReport')}</Button>
              <Button variant="outline" onClick={onComplete} className="rounded-xl h-12">{t('passendeBeoordeling.toProjectFile')}</Button>
            </div>
          </motion.div>
        </div>
      </div>);
  }

  return null;
}
