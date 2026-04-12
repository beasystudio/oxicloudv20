/**
 * Project NOx Status Card
 * Shows the current NOx workflow status with labeled step progress
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PlayCircle, 
  FileCheck, 
  AlertTriangle,
  Lock,
  Clock
} from "lucide-react";
import { 
  OxiCloudProjectStatus, 
  NoxSubStatus, 
  STATUS_CONFIG, 
  SUB_STATUS_OPTIONS, 
  SUB_STATUS_CONFIG 
} from "@/types/oxicloud";
import { NoxStepProgress } from "@/components/projects/NoxStepProgress";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslatedStatusLabel } from "@/lib/statusLabels";

interface ProjectNoxStatusCardProps {
  noxStatus: OxiCloudProjectStatus;
  subStatus?: NoxSubStatus;
  projectName: string;
  quoteNumber?: string;
  quoteSentDate?: string;
  daysPending?: number;
  hasPartialData?: boolean;
  onStartCalculation?: () => void;
  onViewReport?: () => void;
  onSubStatusChange?: (subStatus: NoxSubStatus | undefined) => void;
  isFrozen?: boolean;
  frozenMessage?: string;
}

export function ProjectNoxStatusCard({
  noxStatus,
  subStatus,
  projectName,
  quoteNumber,
  quoteSentDate,
  daysPending,
  hasPartialData = false,
  onStartCalculation,
  onViewReport,
  onSubStatusChange,
  isFrozen = false,
  frozenMessage
}: ProjectNoxStatusCardProps) {
  const { t } = useLanguage();

  const getStatusDetails = () => {
    switch (noxStatus) {
      case 'input_incomplete':
        return {
          title: t('noxStatus.inputIncompleteTitle'),
          showStartBtn: true,
          ctaLabel: hasPartialData ? t('noxStatus.inputIncompleteCtaPartial') : t('noxStatus.inputIncompleteCtaEmpty')
        };
      case 'input_completed':
        return {
          title: t('noxStatus.inputCompleteTitle'),
          showStartBtn: true,
          ctaLabel: t('dashboard.projects.generateQuote')
        };
      case 'price_generated':
        return {
          title: t('noxStatus.priceGeneratedTitle'),
          showStartBtn: true,
          ctaLabel: t('dashboard.projects.sendQuoteToClient')
        };
      case 'awaiting_payment':
        return {
          title: t('noxStatus.awaitingPaymentTitle'),
          showStartBtn: false,
          ctaLabel: ''
        };
      case 'paid':
        return {
          title: t('noxStatus.paidTitle'),
          showStartBtn: true,
          ctaLabel: t('noxStatus.inputIncompleteCtaPartial')
        };
      case 'report_in_progress':
        return {
          title: t('noxStatus.reportInProgressTitle'),
          showStartBtn: true,
          ctaLabel: t('noxStatus.inputIncompleteCtaPartial')
        };
      case 'report_delivered':
        return {
          title: t('noxStatus.reportDeliveredTitle'),
          showStartBtn: false,
          ctaLabel: t('dashboard.projects.viewReport')
        };
      default:
        return {
          title: 'Unknown',
          showStartBtn: false,
          ctaLabel: ''
        };
    }
  };

  const details = getStatusDetails();
  const statusConfig = STATUS_CONFIG[noxStatus];
  const subStatusOptions = SUB_STATUS_OPTIONS[noxStatus] || [];
  const isWarningSubStatus = subStatus && SUB_STATUS_CONFIG[subStatus]?.isWarning;

  const handleSubStatusChange = (value: string) => {
    if (onSubStatusChange) {
      if (value === 'none') {
        onSubStatusChange(undefined);
      } else {
        onSubStatusChange(value as NoxSubStatus);
      }
    }
  };

  // Frozen state
  if (isFrozen) {
    return (
      <Card className="border border-dashed border-muted-foreground/30">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground">{t('noxStatus.noxStatusLabel')}</CardTitle>
            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 text-[10px]">
              {t('noxStatus.pendingSetup')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/40">
            <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-foreground">{t('noxStatus.contactsRequired')}</p>
              <p className="text-[11px] text-muted-foreground">{frozenMessage || t('dashboard.projects.contactsRequiredDesc')}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full opacity-50" size="sm" disabled>
            <Lock className="h-3.5 w-3.5 mr-2" />
            {t('noxStatus.noxAssessmentLocked')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm font-semibold">{t('noxStatus.noxStatusLabel')}</CardTitle>
            <Badge variant="outline" className="text-[10px] font-medium">
              {getTranslatedStatusLabel(noxStatus, t)}
            </Badge>
          </div>
          {subStatusOptions.length > 0 && (
            <Select 
              value={subStatus || 'none'} 
              onValueChange={handleSubStatusChange}
              disabled={!onSubStatusChange}
            >
              <SelectTrigger className="h-7 w-[160px] text-[10px] border-border/40">
                <SelectValue placeholder="Sub-status" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="none" className="text-muted-foreground text-xs">
                  - None -
                </SelectItem>
                {subStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-4 pb-4">
        <NoxStepProgress currentStatus={noxStatus} />

        {isWarningSubStatus && subStatus && SUB_STATUS_CONFIG[subStatus] && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{SUB_STATUS_CONFIG[subStatus].label}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1">
            {details.showStartBtn && onStartCalculation && (
              <Button onClick={onStartCalculation} className="w-full" size="sm" variant="outline">
                <PlayCircle className="h-3.5 w-3.5 mr-2" />
                {details.ctaLabel}
              </Button>
            )}

            {noxStatus === 'report_delivered' && onViewReport && (
              <Button onClick={onViewReport} variant="outline" className="w-full" size="sm">
                <FileCheck className="h-3.5 w-3.5 mr-2" />
                {t('dashboard.projects.viewReport')}
              </Button>
            )}
            
            {noxStatus === 'awaiting_payment' && (
              <Button variant="outline" className="w-full" size="sm" disabled>
                <Clock className="h-3.5 w-3.5 mr-2" />
                {t('noxStatus.calculationLocked')}
              </Button>
            )}

            {noxStatus === 'report_in_progress' && (
              <Button variant="outline" className="w-full" size="sm" disabled>
                <Clock className="h-3.5 w-3.5 mr-2" />
                {t('noxStatus.reportHeldPaymentLocked')}
              </Button>
            )}
          </div>
        </div>

        {noxStatus === 'awaiting_payment' && daysPending !== undefined && daysPending > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">
              {daysPending} {t('noxStatus.daysPending')}
              {quoteSentDate && (
                <span className="font-normal ml-1">
                  ({t('noxStatus.since')} {new Date(quoteSentDate).toLocaleDateString()})
                </span>
              )}
            </span>
          </div>
        )}

        {quoteNumber && (
          <div className="text-[10px] text-muted-foreground">
            {t('noxStatus.quoteRef')}: <span className="font-mono font-medium">{quoteNumber}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
