/**
 * Report Held Screen — Report is ready but values are blurred until payment
 * After simulated payment: values unblur with animation, download unlocks, notifications fire
 * Download: fake progress bar → auto-return to project binder with report_delivered status
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Download, Info, ArrowLeft, Zap, CheckCircle2, ExternalLink, ChevronDown, Clock, ShieldCheck, FileCheck, Shield } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { addNotification } from '@/lib/notificationStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NoxReportHeldScreenProps {
  projectName: string;
  onBackToDashboard: () => void;
  onReportDownloaded?: () => void;
}

export function NoxReportHeldScreen({
  projectName,
  onBackToDashboard,
  onReportDownloaded,
}: NoxReportHeldScreenProps) {
  const { t } = useLanguage();
  const [isPaid, setIsPaid] = useState(false);
  const [isUnblurring, setIsUnblurring] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleSimulatePayment = () => {
    setTimeout(() => {
      addNotification({
        type: 'nox_complete',
        title: t('reportHeld.notifReportReady') || 'Your NOx report is ready to download',
        message: t('reportHeld.notifReportReadyDesc') || `The NOx report for ${projectName} has been unlocked and is ready for download.`,
        projectName,
      });
    }, 1200);

    setTimeout(() => {
      addNotification({
        type: 'settlement_complete',
        title: t('reportHeld.notifCommission') || 'Your commission has been processed',
        message: t('reportHeld.notifCommissionDesc') || `The partner commission for ${projectName} has been settled.`,
        projectName,
      });
    }, 4000);

    setIsPaid(true);
    setTimeout(() => setIsUnblurring(true), 300);
    setTimeout(() => setShowConfirmation(true), 800);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Fake progress: 0 → 100 over ~2.5s
    const steps = [
      { progress: 15, delay: 200 },
      { progress: 35, delay: 500 },
      { progress: 58, delay: 900 },
      { progress: 78, delay: 1400 },
      { progress: 92, delay: 1800 },
      { progress: 100, delay: 2200 },
    ];

    steps.forEach(({ progress, delay }) => {
      setTimeout(() => setDownloadProgress(progress), delay);
    });

    // After download completes, mark as delivered and return to binder
    setTimeout(() => {
      onReportDownloaded?.();
      onBackToDashboard();
    }, 2800);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Banner */}
      {!isPaid ? (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {t('reportHeld.bannerTitle')}
            </p>
            <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mt-1">
              {t('reportHeld.bannerDesc')}
            </p>
          </div>
        </div>
      ) : showConfirmation ? (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {t('reportHeld.paymentConfirmed') || 'Payment confirmed — report unlocked'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Report preview card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t('reportHeld.reportTitle')}</h2>
              <p className="text-sm text-muted-foreground">{projectName}</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'transition-all duration-500',
                isPaid
                  ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10'
                  : 'text-amber-600 border-amber-500/30 bg-amber-500/10'
              )}
            >
              {isPaid ? (t('reportHeld.unlockedBadge') || 'Unlocked') : t('reportHeld.heldBadge')}
            </Badge>
          </div>

          {/* Metric tiles */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t('reportHeld.totalNox'), value: '14.85', unit: 'kg/jaar' },
              { label: t('reportHeld.threshold'), value: '938.00', unit: 'kg/jaar' },
            ].map((metric) => (
              <div key={metric.label} className="rounded-xl border border-border p-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
                <p className={cn('text-2xl font-bold select-none transition-all duration-700 ease-out', !isUnblurring && 'blur-[6px]', isUnblurring && 'blur-0')}>{metric.value}</p>
                <p className={cn('text-xs text-muted-foreground select-none transition-all duration-700 ease-out', !isUnblurring && 'blur-[6px]', isUnblurring && 'blur-0')}>{metric.unit}</p>
              </div>
            ))}
            <div className="rounded-xl border border-border p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Status</p>
              <div className={cn('select-none transition-all duration-700 ease-out', !isUnblurring && 'blur-[6px]', isUnblurring && 'blur-0')}>
                <Badge className="bg-primary/20 text-primary">Compliant</Badge>
              </div>
              <p className={cn('text-xs text-muted-foreground select-none transition-all duration-700 ease-out', !isUnblurring && 'blur-[6px]', isUnblurring && 'blur-0')}>{'< 1%'}</p>
            </div>
          </div>

          {/* Blurred placeholder rows */}
          <div className="space-y-3">
            {['w-full', 'w-3/4', 'w-5/6'].map((w, i) => (
              <div key={i} className={cn(`h-4 ${w} rounded bg-muted/60 transition-all duration-700 ease-out`, !isUnblurring && 'blur-[4px]', isUnblurring && 'blur-0')} />
            ))}
          </div>

          {/* Download button with progress */}
          {isDownloading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Downloading report…</span>
                <span className="font-medium">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          ) : (
            <Button
              disabled={!isPaid}
              onClick={handleDownload}
              className={cn(
                'w-full gap-2 transition-all duration-500',
                isPaid ? 'bg-primary text-primary-foreground shadow-md animate-fade-in' : 'opacity-50'
              )}
              variant={isPaid ? 'default' : 'outline'}
            >
              <Download className="h-4 w-4" />
              {t('reportHeld.downloadFull')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Simulation button */}
      {!isPaid && (
        <div className="border border-dashed border-muted-foreground/30 rounded-xl p-4">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-3">
            Simulation
          </p>
          <Button
            variant="outline"
            onClick={handleSimulatePayment}
            className="w-full gap-2 border-dashed border-muted-foreground/30 text-muted-foreground text-sm"
          >
            <Zap className="h-3.5 w-3.5" />
            {t('reportHeld.simulatePayment')}
          </Button>
        </div>
      )}

      {/* Why Work With Us — collapsible card */}
      {!isPaid && (
        <Collapsible>
          <Card className="overflow-hidden border-border/30 shadow-none">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/20 transition-colors">
                <h3 className="text-sm font-semibold text-foreground">Why work with us?</h3>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-5 px-5 space-y-5">
                <p className="text-[13px] text-muted-foreground">
                  Built to support you and your client every step of the way.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Clock, title: 'Fast delivery', desc: 'Receive your reports quickly so your project keeps moving without delays.' },
                    { icon: ShieldCheck, title: 'Full legal compliance', desc: 'All reports are aligned with current regulations and accepted by authorities.' },
                    { icon: FileCheck, title: 'Official, ready-to-use reports', desc: 'Clear, professional documents you can confidently share with clients and administrations.' },
                    { icon: Shield, title: 'Liability protection for architects', desc: 'Reduce your risk with reliable, compliant, and well-documented outputs.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-border/30 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="text-xs font-semibold text-foreground">{item.title}</p>
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => toast.info('This page will be available soon — a shareable link for your client.')}
                  className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border/30 bg-muted/10 hover:bg-muted/30 transition-colors group cursor-pointer text-left"
                >
                  <p className="text-xs text-muted-foreground group-hover:text-foreground/80">
                    Share with your client to help them clearly understand the value, build trust, and confidently move forward.
                  </p>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Back button - only show when not downloading */}
      {!isDownloading && (
        <Button variant="outline" onClick={onBackToDashboard} className="w-full gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('reportHeld.backToProjectBinder') || 'Back to project binder'}
        </Button>
      )}
    </div>
  );
}