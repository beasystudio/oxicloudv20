/**
 * Report Held Screen — Report is ready but values are blurred until payment
 * Shows metric tiles with blurred values, placeholder content, and disabled download
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Info, ArrowLeft, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/i18n/LanguageContext';

interface NoxReportHeldScreenProps {
  projectName: string;
  onBack: () => void;
  onBackToDashboard: () => void;
  onSimulatePayment: () => void;
}

export function NoxReportHeldScreen({
  projectName,
  onBack,
  onBackToDashboard,
  onSimulatePayment,
}: NoxReportHeldScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Yellow info banner */}
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

      {/* Report preview card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t('reportHeld.reportTitle')}</h2>
              <p className="text-sm text-muted-foreground">{projectName}</p>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">
              {t('reportHeld.heldBadge')}
            </Badge>
          </div>

          {/* Metric tiles - blurred values */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">{t('reportHeld.totalNox')}</p>
              <p className="text-2xl font-bold blur-[6px] select-none">14.85</p>
              <p className="text-xs text-muted-foreground blur-[6px] select-none">kg/jaar</p>
            </div>
            <div className="rounded-xl border border-border p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">{t('reportHeld.threshold')}</p>
              <p className="text-2xl font-bold blur-[6px] select-none">938.00</p>
              <p className="text-xs text-muted-foreground blur-[6px] select-none">kg/jaar</p>
            </div>
            <div className="rounded-xl border border-border p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Status</p>
              <div className="blur-[6px] select-none">
                <Badge className="bg-primary/20 text-primary">Compliant</Badge>
              </div>
              <p className="text-xs text-muted-foreground blur-[6px] select-none">{'< 1%'}</p>
            </div>
          </div>

          {/* Blurred placeholder content rows */}
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-muted/60 blur-[4px]" />
            <div className="h-4 w-3/4 rounded bg-muted/60 blur-[4px]" />
            <div className="h-4 w-5/6 rounded bg-muted/60 blur-[4px]" />
          </div>

          {/* Disabled download button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button disabled className="w-full gap-2 opacity-50" variant="outline">
                    <Download className="h-4 w-4" />
                    {t('reportHeld.downloadFull')}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('reportHeld.downloadTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Simulation button */}
      <div className="border border-dashed border-muted-foreground/30 rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-3 font-medium">Simulation</p>
        <Button
          variant="outline"
          onClick={onSimulatePayment}
          className="w-full gap-2 border-dashed border-muted-foreground/30 text-muted-foreground text-sm"
        >
          <Zap className="h-3.5 w-3.5" />
          {t('reportHeld.simulatePayment')}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('reportHeld.backToCalc')}
        </Button>
        <Button variant="outline" onClick={onBackToDashboard}>
          {t('reportHeld.backToDashboard')}
        </Button>
      </div>
    </div>
  );
}
