import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Euro, Clock, FileText, ArrowLeft, Gift } from 'lucide-react';
import { OxiCloudProject } from '@/types/oxicloud';
import { format } from 'date-fns';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { getUserByEmail } from '@/lib/mockUserDB';

interface QuoteSubmittedScreenProps {
  project: OxiCloudProject;
  commissionAmount: number;
  clientName: string;
  onBackToDashboard: () => void;
}

export function QuoteSubmittedScreen({ 
  project, 
  commissionAmount, 
  clientName,
  onBackToDashboard 
}: QuoteSubmittedScreenProps) {
  const { currentUser } = useMockAuth();

  // Check if user has financial dashboard access
  const hasFinancialAccess = (): boolean => {
    if (!currentUser) return false;
    
    // Owners always have access
    if (currentUser.role === 'owner') return true;
    
    // Client owners always have access
    if (currentUser.role === 'client_owner') return true;
    
    // For other roles, check their financial dashboard access setting
    const userRecord = getUserByEmail(currentUser.email);
    return userRecord?.general?.financialDashboardAccess ?? false;
  };

  const showSpecificAmount = hasFinancialAccess();

  const validUntil = project.priceData?.validUntil 
    ? format(new Date(project.priceData.validUntil), 'dd MMMM yyyy')
    : '14 days';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Bedankt voor uw invoer!</h1>
          <p className="text-muted-foreground">
            Uw voorlopige schatting voor <span className="font-medium text-foreground">{project.name}</span> is succesvol ingediend.
          </p>
        </CardContent>
      </Card>

      {/* Quote Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Offerte verzonden
          </CardTitle>
          <CardDescription>
            De offerte is automatisch verstuurd naar uw klant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">In afwachting van betaling</p>
              <p className="text-sm text-muted-foreground">
                Uw klant <span className="font-medium">{clientName}</span> heeft een betalingslink ontvangen. 
                U wordt automatisch op de hoogte gebracht zodra de betaling is voltooid.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Geldig tot {validUntil}</p>
              <p className="text-sm text-muted-foreground">
                De offerte blijft 14 dagen geldig. Na deze periode vervalt de prijsgarantie.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Card - conditional based on access */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            {showSpecificAmount ? (
              <Euro className="h-5 w-5" />
            ) : (
              <Gift className="h-5 w-5" />
            )}
            Uw commissie
          </CardTitle>
          <CardDescription>
            {showSpecificAmount 
              ? 'Na betaling door uw klant ontvangt u een commissie'
              : 'U ontvangt een commissie wanneer uw klant de offerte betaalt'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSpecificAmount ? (
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                €{commissionAmount.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Commissiebedrag bij succesvolle betaling
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-3">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-muted-foreground">
                Uw commissie wordt berekend en aan u meegedeeld zodra de betaling is voltooid.
              </p>
            </div>
          )}
          
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Volgende stappen:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Wacht tot uw klant de offerte betaalt</li>
              <li>U ontvangt een melding zodra de betaling is voltooid</li>
              <li>De gedetailleerde berekening wordt ontgrendeld</li>
              {showSpecificAmount ? (
                <li>
                  Stuur een factuur naar OxiCloud voor uw commissie van{' '}
                  <span className="font-medium text-foreground">€{commissionAmount.toFixed(2)}</span>
                </li>
              ) : (
                <li>U ontvangt instructies voor het claimen van uw commissie</li>
              )}
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onBackToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar overzicht
        </Button>
      </div>
    </div>
  );
}
