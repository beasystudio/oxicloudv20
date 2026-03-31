/**
 * Project NOx Status Card
 * Shows the current NOx workflow status with secondary sub-status dropdown
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  PlayCircle, 
  FileCheck, 
  AlertTriangle,
  Lock,
  Unlock
} from "lucide-react";
import { 
  OxiCloudProjectStatus, 
  NoxSubStatus, 
  STATUS_CONFIG, 
  SUB_STATUS_OPTIONS, 
  SUB_STATUS_CONFIG 
} from "@/types/oxicloud";

interface ProjectNoxStatusCardProps {
  noxStatus: OxiCloudProjectStatus;
  subStatus?: NoxSubStatus;
  projectName: string;
  quoteNumber?: string;
  quoteSentDate?: string;
  daysPending?: number;
  hasPartialData?: boolean; // Whether partial pre-estimation data exists
  onStartCalculation?: () => void;
  onViewReport?: () => void;
  onSubStatusChange?: (subStatus: NoxSubStatus | undefined) => void;
  /** If true, the card is frozen/disabled - requires contacts to be added first */
  isFrozen?: boolean;
  /** Message to show when frozen */
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
  frozenMessage = "Please add at least one Client contact and one Team contact before proceeding with the NOₓ assessment."
}: ProjectNoxStatusCardProps) {
  
  const getStatusDetails = () => {
    switch (noxStatus) {
      case 'input_incomplete':
        return {
          icon: FileText,
          iconColor: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-950/30',
          borderColor: 'border-gray-200 dark:border-gray-800',
          title: 'Input Incomplete',
          description: hasPartialData
            ? 'Your project data entry is partially completed. Continue where you left off.'
            : 'Project data entry has not been started yet.',
          isLocked: true,
          showStartBtn: true,
          ctaLabel: hasPartialData ? 'Continue your NOx assessment' : 'Start input to receive your quote'
        };

      case 'input_completed':
        return {
          icon: FileText,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          title: 'Input Complete',
          description: 'All required project data has been entered. Ready for quote generation.',
          isLocked: true,
          showStartBtn: true,
          ctaLabel: 'Generate Quote'
        };
      
      case 'price_generated':
        return {
          icon: FileText,
          iconColor: 'text-indigo-500',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
          borderColor: 'border-indigo-200 dark:border-indigo-800',
          title: 'Quote Ready',
          description: 'Quote has been generated. Send it to your end client to proceed.',
          isLocked: true,
          showStartBtn: true,
          ctaLabel: 'Send Quote to Client'
        };
      
      case 'awaiting_payment':
        return {
          icon: CreditCard,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-50 dark:bg-amber-950/30',
          borderColor: 'border-amber-200 dark:border-amber-800',
          title: 'Awaiting Payment',
          description: 'Once your client has paid the quote, this module will be unlocked. We will notify you so you can continue the NOx assessment.',
          isLocked: true,
          showStartBtn: false,
          ctaLabel: ''
        };
      
      case 'paid':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          title: 'Payment Received',
          description: 'Payment confirmed! The NOₓ assessment module is now unlocked.',
          isLocked: false,
          showStartBtn: true,
          ctaLabel: 'Continue your NOx assessment'
        };
      
      case 'report_in_progress':
        return {
          icon: PlayCircle,
          iconColor: 'text-purple-500',
          bgColor: 'bg-purple-50 dark:bg-purple-950/30',
          borderColor: 'border-purple-200 dark:border-purple-800',
          title: 'Report in Progress',
          description: 'NOₓ assessment is in progress. Progress is auto-saved.',
          isLocked: false,
          showStartBtn: true,
          ctaLabel: 'Continue your NOx assessment'
        };
      
      case 'report_delivered':
        return {
          icon: FileCheck,
          iconColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
          borderColor: 'border-emerald-200 dark:border-emerald-800',
          title: 'Report Delivered',
          description: 'The NOₓ assessment report has been completed and the PDF is available.',
          isLocked: false,
          showStartBtn: false,
          ctaLabel: 'View Report'
        };
      
      default:
        return {
          icon: Clock,
          iconColor: 'text-muted-foreground',
          bgColor: 'bg-muted/30',
          borderColor: 'border-border',
          title: 'Unknown Status',
          description: 'Unable to determine the current status.',
          isLocked: true,
          showStartBtn: false,
          ctaLabel: ''
        };
    }
  };

  const details = getStatusDetails();
  const IconComponent = details.icon;
  const statusConfig = STATUS_CONFIG[noxStatus];
  const subStatusOptions = SUB_STATUS_OPTIONS[noxStatus] || [];
  
  // Check if sub-status indicates a warning (Overdue, etc.)
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

  // If frozen, show a disabled/locked state
  if (isFrozen) {
    return (
      <Card className="bg-muted/40 border-2 border-dashed border-muted-foreground/30">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">NOₓ Status</CardTitle>
              <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                Pending Setup
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Contacts Required
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {frozenMessage}
              </p>
            </div>
          </div>
          <Button 
            variant="secondary"
            className="w-full opacity-50"
            size="default"
            disabled
          >
            <Lock className="h-4 w-4 mr-2" />
            NOₓ Assessment Locked
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isWarningSubStatus ? 'bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800' : details.bgColor + ' border-2 ' + details.borderColor}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm font-semibold">NOₓ Status</CardTitle>
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Status Row with CTA Button */}
        <div className="flex items-center gap-4">
          {/* Left: Primary Status with Action Button */}
          <div className="flex-1 space-y-3">
            {/* Action Buttons */}
            {details.showStartBtn && onStartCalculation && (
              <Button 
                onClick={onStartCalculation}
                className="w-full"
                size="default"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                {details.ctaLabel}
              </Button>
            )}

            {noxStatus === 'report_delivered' && onViewReport && (
              <Button 
                onClick={onViewReport}
                variant="outline"
                className="w-full"
                size="default"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                View Report
              </Button>
            )}
            
            {noxStatus === 'awaiting_payment' && (
              <Button 
                variant="secondary"
                className="w-full"
                size="default"
                disabled
              >
                <Lock className="h-4 w-4 mr-2" />
                Calculation Locked
              </Button>
            )}
          </div>

          {/* Right: Secondary Sub-Status Dropdown */}
          <div className="w-[200px] border-l-2 border-dashed border-border pl-4">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Secondary Sub-Status
              </span>
              <Select 
                value={subStatus || 'none'} 
                onValueChange={handleSubStatusChange}
                disabled={!onSubStatusChange}
              >
                <SelectTrigger className={`h-9 text-sm ${isWarningSubStatus ? 'border-red-400 bg-red-50 dark:bg-red-950/50' : 'bg-background'}`}>
                  <SelectValue placeholder="Select sub-status" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="none" className="text-muted-foreground">
                    — None —
                  </SelectItem>
                  {subStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Show sub-status badge if selected */}
              {subStatus && SUB_STATUS_CONFIG[subStatus] && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${SUB_STATUS_CONFIG[subStatus].color} text-white border-0`}
                >
                  {SUB_STATUS_CONFIG[subStatus].label}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Days Pending indicator for Awaiting Payment */}
        {noxStatus === 'awaiting_payment' && daysPending !== undefined && daysPending > 0 && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            daysPending > 14 
              ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300' 
              : daysPending > 7 
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                : 'bg-muted text-muted-foreground'
          }`}>
            <Clock className="h-4 w-4" />
            <span className="font-medium">
              {daysPending} days pending
              {quoteSentDate && (
                <span className="font-normal ml-1">
                  (since {new Date(quoteSentDate).toLocaleDateString()})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Quote Reference */}
        {quoteNumber && (
          <div className="text-xs text-muted-foreground">
            Quote Reference: <span className="font-mono font-medium">{quoteNumber}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}