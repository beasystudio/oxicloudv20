import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Euro, Calculator, ArrowRight, ArrowLeft, PartyPopper } from 'lucide-react';
import { OxiCloudProject } from '@/types/oxicloud';
import { format } from 'date-fns';

interface PaymentReceivedScreenProps {
  project: OxiCloudProject;
  commissionAmount: number;
  onProceedToCalculation: () => void;
  onBackToDashboard: () => void;
}

export function PaymentReceivedScreen({ 
  project, 
  commissionAmount, 
  onProceedToCalculation,
  onBackToDashboard 
}: PaymentReceivedScreenProps) {
  const paidDate = project.paymentData?.paymentDate 
    ? format(new Date(project.paymentData.paymentDate), 'dd MMMM yyyy')
    : 'vandaag';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
            <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-green-700 dark:text-green-400">Betaling ontvangen!</h1>
          <p className="text-muted-foreground">
            Uw klant heeft de offerte voor <span className="font-medium text-foreground">{project.name}</span> betaald op {paidDate}.
          </p>
        </CardContent>
      </Card>

      {/* Commission Earned */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Uw commissie
          </CardTitle>
          <CardDescription>
            U heeft recht op de volgende commissie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-primary">
              €{commissionAmount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Stuur een factuur naar OxiCloud voor dit bedrag
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Gedetailleerde berekening ontgrendeld
          </CardTitle>
          <CardDescription>
            U kunt nu de volledige NOx-berekening uitvoeren
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Berekeningsmodule beschikbaar</p>
              <p className="text-sm text-muted-foreground">
                Nu de betaling is voltooid, heeft u toegang tot het gedetailleerde berekeningsformulier 
                voor een volledige NOx-beoordeling van het project.
              </p>
            </div>
          </div>
          
          <div className="pt-2 space-y-2">
            <h4 className="font-medium">Volgende stappen:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Vul het gedetailleerde berekeningsformulier in</li>
              <li>Bekijk de resultaten en het NOx-rapport</li>
              <li>Stuur een factuur van €{commissionAmount.toFixed(2)} naar OxiCloud</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBackToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar overzicht
        </Button>
        <Button onClick={onProceedToCalculation}>
          Start gedetailleerde berekening
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
