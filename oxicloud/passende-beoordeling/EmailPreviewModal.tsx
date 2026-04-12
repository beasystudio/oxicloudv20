import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { PBProjectData } from './types';

interface EmailPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: PBProjectData;
  onConfirm: () => void;
}

export function EmailPreviewModal({ open, onOpenChange, project, onConfirm }: EmailPreviewModalProps) {
  const { language } = useLanguage();
  const isNL = language === 'nl';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {isNL ? 'E-mail Preview' : 'Email Preview'}
          </DialogTitle>
          <DialogDescription>
            {isNL ? 'Controleer de e-mail voordat u deze verstuurt.' : 'Review the email before sending.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground w-16">{isNL ? 'Aan' : 'To'}:</span>
              <span className="text-foreground">{project.clientEmail}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground w-16">{isNL ? 'Betreft' : 'Subject'}:</span>
              <span className="text-foreground">
                {isNL ? 'Offerte Passende Beoordeling' : 'Appropriate Assessment Quote'} - {project.name}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-foreground space-y-3">
            {isNL ? (
              <>
                <p>Geachte opdrachtgever,</p>
                <p>
                  Na uitputting van alle optimalisatiemogelijkheden overschrijdt het project "{project.name}"
                  de toegestane NOx-drempel met +{project.overshoot} kg NOₓ. Conform de toepasselijke wetgeving
                  is een Passende Beoordeling verplicht.
                </p>
                <p>
                  Hierbij ontvangt u de offerte voor de uitvoering van deze beoordeling.
                  Het totaalbedrag bedraagt <strong>€ 3.800,00</strong> (excl. BTW).
                </p>
                <p>
                  Gelieve het bedrag over te schrijven op het opgegeven rekeningnummer.
                  Na ontvangst van uw betaling starten wij de beoordeling.
                  De verwachte leveringstermijn is ± 3 weken na betalingsbevestiging.
                </p>
                <p className="text-muted-foreground">Met vriendelijke groeten,<br />OxiCloud Platform</p>
              </>
            ) : (
              <>
                <p>Dear client,</p>
                <p>
                  After exhausting all optimisation options, the project "{project.name}" exceeds the
                  permitted NOx threshold by +{project.overshoot} kg NOₓ. Under applicable legislation,
                  an Appropriate Assessment is required.
                </p>
                <p>
                  Please find enclosed the quote for this assessment.
                  The total amount is <strong>€ 3,800.00</strong> (excl. VAT).
                </p>
                <p>
                  Please transfer the amount to the specified account.
                  Upon receipt of payment, we will commence the assessment.
                  Expected delivery time is approximately 3 weeks after payment confirmation.
                </p>
                <p className="text-muted-foreground">Kind regards,<br />OxiCloud Platform</p>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={onConfirm} className="flex-1">
              {isNL ? 'Bevestigen en Versturen' : 'Confirm and Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
