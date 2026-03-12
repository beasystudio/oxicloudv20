/**
 * Project Commission Card
 * Displays commission information based on NOx status
 * Shows commission amount only after payment is confirmed
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, CheckCircle2, AlertCircle, FileText, ExternalLink } from "lucide-react";
import { OxiCloudProjectStatus } from "@/types/oxicloud";
import { useToast } from "@/hooks/use-toast";

interface ProjectCommissionCardProps {
  projectId: string;
  noxStatus: OxiCloudProjectStatus;
  commissionAmount?: number;
  invoiceReference?: string;
  quoteNumber?: string;
  onClaimCommission?: () => void;
}

export function ProjectCommissionCard({
  projectId,
  noxStatus,
  commissionAmount,
  invoiceReference,
  quoteNumber,
  onClaimCommission
}: ProjectCommissionCardProps) {
  const { toast } = useToast();

  const handleClaimClick = () => {
    if (onClaimCommission) {
      onClaimCommission();
    } else {
      // Default behavior: copy reference and show instructions
      if (invoiceReference) {
        navigator.clipboard.writeText(invoiceReference);
        toast({
          title: "Reference copied",
          description: `Invoice reference ${invoiceReference} copied to clipboard. Send your invoice to invoices@oxicloud.be`,
        });
      }
    }
  };

  // Status-based content configuration
  const getStatusContent = () => {
    switch (noxStatus) {
      case 'input_completed':
        return {
          badge: { label: 'Pending', variant: 'secondary' as const },
          icon: Clock,
          iconColor: 'text-muted-foreground',
          title: 'No commission yet',
          description: 'Commission will appear once quote is generated and sent to your end client.',
          showAmount: false,
          showCTA: false
        };
      
      case 'price_generated':
        return {
          badge: { label: 'Draft', variant: 'secondary' as const },
          icon: FileText,
          iconColor: 'text-muted-foreground',
          title: 'Commission pending',
          description: 'Prepare to send the quote to your end client to unlock your commission.',
          showAmount: false,
          showCTA: false
        };
      
      case 'awaiting_payment':
        return {
          badge: { label: 'Awaiting Payment', variant: 'outline' as const },
          icon: Clock,
          iconColor: 'text-amber-500',
          title: 'Commission pending',
          description: 'Your commission will become available once your end client completes payment.',
          showAmount: false,
          showCTA: false
        };
      
      case 'paid':
      case 'report_in_progress':
      case 'report_delivered':
        return {
          badge: { label: 'Available', variant: 'default' as const },
          icon: CheckCircle2,
          iconColor: 'text-green-500',
          title: 'Commission available',
          description: noxStatus === 'report_delivered' 
            ? 'Report delivered. Ensure invoice is submitted to receive payment.'
            : noxStatus === 'report_in_progress'
            ? 'Work in progress. Commission can be claimed anytime after payment.'
            : 'You can submit an invoice to OxiCloud with the reference number provided.',
          showAmount: true,
          showCTA: true
        };
      
      case 'input_incomplete':
      
      default:
        return {
          badge: { label: 'Unknown', variant: 'secondary' as const },
          icon: Clock,
          iconColor: 'text-muted-foreground',
          title: 'Status unknown',
          description: 'Unable to determine commission status.',
          showAmount: false,
          showCTA: false
        };
    }
  };

  const content = getStatusContent();
  const IconComponent = content.icon;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Project Commission</CardTitle>
          </div>
          <Badge variant={content.badge.variant}>
            {content.badge.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Icon + Title */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${content.iconColor}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">{content.title}</p>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </div>
        </div>

        {/* Commission Amount (only shown after payment) */}
        {content.showAmount && commissionAmount !== undefined && (
          <div className="bg-background rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground mb-1">Your Commission</p>
            <p className="text-3xl font-bold text-green-600">
              €{commissionAmount.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {quoteNumber && (
              <p className="text-xs text-muted-foreground mt-1">
                Quote: {quoteNumber}
              </p>
            )}
          </div>
        )}

        {/* Invoice Reference */}
        {content.showCTA && invoiceReference && (
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-200 font-medium mb-1">
              Invoice Reference
            </p>
            <p className="text-sm font-mono font-bold text-amber-900 dark:text-amber-100">
              {invoiceReference}
            </p>
          </div>
        )}

        {/* Claim CTA */}
        {content.showCTA && (
          <div className="space-y-2">
            <Button 
              onClick={handleClaimClick}
              className="w-full"
              size="lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Claim Commission
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Send invoice to <span className="font-medium">invoices@oxicloud.be</span>
            </p>
          </div>
        )}

        {/* Awaiting Payment Indicator */}
        {noxStatus === 'awaiting_payment' && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Waiting for end client payment...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}