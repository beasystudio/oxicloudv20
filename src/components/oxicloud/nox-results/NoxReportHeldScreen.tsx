/**
 * Report Held Screen - Report is ready but values are blurred until payment
 * After simulated payment: values unblur with animation, download unlocks, notifications fire
 * Download: fake progress bar -> auto-return to project binder with report_delivered status
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Info, ArrowLeft, Zap, CheckCircle2, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { addNotification } from '@/lib/notificationStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ReportBookletMockup } from './ReportBookletMockup';


interface NoxReportHeldScreenProps {
  projectName: string;
  onBackToDashboard: () => void;
  onReportDownloaded?: () => void;
  onPaymentReceived?: () => void;
}

export function NoxReportHeldScreen({
  projectName,
  onBackToDashboard,
  onReportDownloaded,
  onPaymentReceived,
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
    onPaymentReceived?.();
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);

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
              {t('reportHeld.paymentConfirmed') || 'Payment confirmed - report unlocked'}
            </p>
          </div>
        </div>
      ) : null}

      {/* 3D Booklet Mockup */}
      <ReportBookletMockup
        projectName={projectName}
        isPaid={isPaid}
        isUnblurring={isUnblurring}
        t={t}
      />

      {/* Download button with progress */}
      {isDownloading ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('reportHeld.downloadingReport') || 'Downloading report...'}</span>
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

      {/* Simulation button */}
      {!isPaid && (
        <div className="border border-dashed border-muted-foreground/30 rounded-xl p-4">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-3">
            {t('reportHeld.simulationLabel') || 'Simulation'}
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

      {/* Back button */}
      {!isDownloading && (
        <Button variant="outline" onClick={onBackToDashboard} className="w-full gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('reportHeld.backToProjectBinder') || 'Back to project binder'}
        </Button>
      )}
    </div>
  );
}
