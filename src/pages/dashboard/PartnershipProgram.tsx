import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { TopNavigation } from '@/components/TopNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const copy = {
  nl: {
    pageTitle: 'Partnerprogramma',
    intro: 'Als partner van OxiCloud levert u waardevolle expertise: u vult de basisgegevens in die nodig zijn om de berekening te maken. Die inzet verdient een vergoeding. Daarom delen we de kost van het rapport tussen OxiCloud en u, eerlijk en automatisch.',
    cardHeading: 'Werkt u voor meerdere kantoren?',
    cardBody: 'Het komt voor dat gebruikers van OxiCloud zowel voor zichzelf werken als voor een ander kantoor. Daarom vragen we u een account aan te maken voor het kantoor waarvoor u werkt. De koppeling gebeurt automatisch op basis van het e-mailadres waarmee u inlogt.',
    sectionHeading: 'Hoe verloopt uw vergoeding?',
    steps: [
      { title: 'U vult de basisgegevens in', body: 'U geeft de projectgegevens in. Op basis hiervan maakt OxiCloud de berekening op.' },
      { title: 'OxiCloud maakt een offerte op', body: 'De offerte wordt rechtstreeks naar uw klant verstuurd. U ontvangt automatisch een afschrift.' },
      { title: 'Uw klant bevestigt en betaalt', body: 'Zodra uw klant de offerte heeft goedgekeurd en betaald, wordt het proces automatisch verdergezet.' },
      { title: 'U wordt vergoed, zonder extra werk', body: 'OxiCloud maakt voor u een factuur op voor uw prestaties. Geen nood: dit vraagt geen enkele inspanning van uw kant. Via het self-billing principe maken wij zelf een deelfactuur op aan onszelf, van zodra we de betaling van uw klant ontvangen. U ontvangt deze factuur via Peppol. Wij betalen uiteraard prompt.' },
    ],
    back: 'Terug',
  },
  en: {
    pageTitle: 'Partner Program',
    intro: 'As an OxiCloud partner, you provide valuable expertise: you enter the basic project details that make the calculation possible. That effort deserves compensation. That is why we share the cost of the report between OxiCloud and you, fairly and automatically.',
    cardHeading: 'Working for more than one firm?',
    cardBody: 'Some OxiCloud users work both independently and on behalf of another firm. That is why we ask you to create an account for the firm you work for. The link is made automatically based on the email address you use to log in.',
    sectionHeading: 'How does your compensation work?',
    steps: [
      { title: 'You enter the basic project details', body: 'You fill in the project information. OxiCloud uses this to generate the calculation.' },
      { title: 'OxiCloud sends a quotation', body: 'The quotation is sent directly to your client. You automatically receive a copy.' },
      { title: 'Your client confirms and pays', body: 'Once your client has approved and paid the quotation, the process continues automatically.' },
      { title: 'You get paid, with no extra work', body: 'OxiCloud draws up an invoice for your services. No need to worry: this requires no effort on your part. Via the self-billing principle, we issue a partial invoice to ourselves as soon as we receive payment from your client. You will receive this invoice via Peppol. We pay promptly, of course.' },
    ],
    back: 'Back',
  },
};

export default function PartnershipProgram() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <>
      <Helmet>
        <title>{t.pageTitle} - OxiCloud</title>
        <meta name="description" content={t.intro.slice(0, 155)} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <TopNavigation />

        <main className="container mx-auto px-6 py-12 max-w-2xl">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-10 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t.back}
          </Button>

          {/* Intro */}
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
            {t.intro}
          </p>

          {/* Info card */}
          <div className="rounded-xl bg-secondary p-6 mb-12">
            <p className="text-sm font-semibold text-foreground mb-2">{t.cardHeading}</p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{t.cardBody}</p>
          </div>

          {/* Section heading */}
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-8">
            {t.sectionHeading}
          </h2>

          {/* Step list */}
          <div className="space-y-0">
            {t.steps.map((step, i) => (
              <div key={i} className="flex gap-5">
                {/* Left: circle + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 3
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < t.steps.length - 1 && (
                    <div className="w-px flex-1 bg-border my-2" />
                  )}
                </div>
                {/* Right: text */}
                <div className={`pb-8 ${i === t.steps.length - 1 ? 'pb-0' : ''}`}>
                  <p className="text-sm font-semibold text-foreground mb-1">{step.title}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
