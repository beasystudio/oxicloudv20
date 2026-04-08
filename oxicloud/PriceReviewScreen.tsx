import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { OxiCloudProject } from '@/types/oxicloud';
import { OxiCloudStatusBadge } from './OxiCloudStatusBadge';
import { ArrowLeft, AlertCircle, Euro } from 'lucide-react';
import { format } from 'date-fns';

interface PriceReviewScreenProps {
  project: OxiCloudProject;
  onProceedToPayment: () => void;
  onBackToEdit: () => void;
}

export function PriceReviewScreen({ project, onProceedToPayment, onBackToEdit }: PriceReviewScreenProps) {
  if (!project.priceData) {
    return <div>Price data not available</div>;
  }

  const { basePrice, vat, totalPrice, validUntil } = project.priceData;
  const isExpired = new Date(validUntil) < new Date();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Price Estimate Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Price Estimate
              </CardTitle>
              <CardDescription>{project.name}</CardDescription>
            </div>
            <OxiCloudStatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Report Fee</span>
              <span className="font-medium">€{basePrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">VAT (21%)</span>
              <span className="font-medium">€{vat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">€{totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valid Until</span>
              <span className={isExpired ? 'text-destructive font-medium' : 'font-medium'}>
                {format(new Date(validUntil), 'dd MMM yyyy')}
              </span>
            </div>
            {isExpired && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>This price estimate has expired. Please re-calculate.</span>
              </div>
            )}
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Scope Disclaimer</p>
            <p>
              This estimate is based on the information provided in your pre-estimation form. 
              The final report fee may vary if the actual project scope differs significantly 
              from the initial assessment.
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            <Button variant="outline" onClick={onBackToEdit} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Edit Pre-Estimation
            </Button>
            <Button onClick={onProceedToPayment} className="flex-1" disabled={isExpired}>
              Proceed to Quote & Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
