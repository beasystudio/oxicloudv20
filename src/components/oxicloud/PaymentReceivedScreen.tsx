import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Euro, Calculator, ArrowRight, ArrowLeft, PartyPopper } from 'lucide-react';
import { OxiCloudProject } from '@/types/oxicloud';
import { format } from 'date-fns';
import { useLanguage } from '@/i18n/LanguageContext';

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
  const { t } = useLanguage();
  const paidDate = project.paymentData?.paymentDate 
    ? format(new Date(project.paymentData.paymentDate), 'dd MMMM yyyy')
    : t('paymentReceivedScreen.today');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
            <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-green-700 dark:text-green-400">{t('paymentReceivedScreen.title')}</h1>
          <p className="text-muted-foreground">
            {t('paymentReceivedScreen.clientPaid')} <span className="font-medium text-foreground">{project.name}</span> {t('paymentReceivedScreen.paidOn')} {paidDate}.
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            {t('paymentReceivedScreen.yourCommission')}
          </CardTitle>
          <CardDescription>
            {t('paymentReceivedScreen.commissionEntitlement')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-primary">
              €{commissionAmount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('paymentReceivedScreen.sendInvoice')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t('paymentReceivedScreen.calcUnlocked')}
          </CardTitle>
          <CardDescription>
            {t('paymentReceivedScreen.canNowPerform')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">{t('paymentReceivedScreen.calcModuleAvailable')}</p>
              <p className="text-sm text-muted-foreground">
                {t('paymentReceivedScreen.calcModuleDesc')}
              </p>
            </div>
          </div>
          
          <div className="pt-2 space-y-2">
            <h4 className="font-medium">{t('paymentReceivedScreen.nextSteps')}</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>{t('paymentReceivedScreen.nextStep1')}</li>
              <li>{t('paymentReceivedScreen.nextStep2')}</li>
              <li>{t('paymentReceivedScreen.nextStep3')} €{commissionAmount.toFixed(2)} {t('paymentReceivedScreen.nextStep3b')}</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBackToDashboard}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('paymentReceivedScreen.backToOverview')}
        </Button>
        <Button onClick={onProceedToCalculation}>
          {t('paymentReceivedScreen.startDetailedCalc')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}