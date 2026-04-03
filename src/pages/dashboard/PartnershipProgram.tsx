import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { TopNavigation } from '@/components/TopNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Info, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { InviteManagerDialog } from '@/components/demo/InviteManagerDialog';

const copy = {
  en: {
    pageTitle: 'Partner Program',
    back: 'Back',
    heroTitle: 'OxiCloud Partner Program',
    heroIntro1: 'Architects, engineers, and consultants already play a key role in environmental compliance. OxiCloud allows them to generate compliant NOx emission reports for their projects without needing specialized software or environmental expertise.',
    heroIntro2: 'Using OxiCloud is free for professionals. Your client only pays when they request a report.',
    heroIntro3: 'As a partner, you provide the essential project information that makes the emissions calculation possible. Because this input is valuable, OxiCloud shares part of the report revenue with the partner who initiates the project.',
    heroIntro4: 'The entire process - from quotation to payment - is handled automatically.',
    whoTitle: 'Who is the Partner Program for?',
    whoIntro: 'The program is designed for professionals who are already involved in project preparation and environmental documentation, including:',
    whoList: ['Architects', 'Engineering offices', 'Environmental consultants', 'Urban planners', 'Permit and compliance advisors'],
    whoOutro: 'If you are already collecting project information for your clients, OxiCloud allows you to turn that information into a compliant emissions report with minimal additional effort.',
    howTitle: 'How the workflow works',
    steps: [
      {
        title: 'Enter the basic project details',
        body: 'You enter a few simple parameters such as:',
        list: ['project type', 'location', 'gross floor area (GFA)'],
        extra: 'This takes only a few minutes.\n\nOxiCloud uses this information to prepare a quotation for the emissions report.',
      },
      {
        title: 'Review the quotation with your client',
        body: 'The quotation is generated automatically inside OxiCloud.\n\nYou can review it with your client and discuss whether they want to proceed with the report.\n\nIf your client agrees, you send the quotation directly through the OxiCloud platform.',
      },
      {
        title: 'Your client confirms and pays',
        body: 'The client receives the quotation and completes the payment through OxiCloud.',
        extra: 'Once the payment is confirmed:',
        list: ['the NOx calculation module is automatically unlocked', 'the project can proceed to the calculation stage'],
      },
      {
        title: 'Complete the calculation',
        body: 'You enter a few additional project parameters.\n\nThis typically takes less than 10 minutes.\n\nOnce you click Calculate, the emissions report is generated immediately.',
      },
      {
        title: 'Payment is handled automatically',
        body: 'As soon as the module is unlocked after your client\'s payment:',
        list: ['OxiCloud processes the partner settlement automatically', 'an invoice is issued via self-billing', 'the invoice is delivered to you through Peppol'],
        extra: 'Your payment is transferred directly to your bank account.\n\nThere is no administration required from your side.',
      },
    ],
    multiTitle: 'Working with more than one firm',
    multiBody1: 'Some OxiCloud users operate both independently and on behalf of another firm.',
    multiBody2: 'To ensure the correct organization is associated with each project, you can create a Workspace for the firm you represent. The connection is made automatically based on the email address you use to log in.',
    multiBody3: 'This allows you to clearly separate:',
    multiList: ['Independent work', 'Work carried out on behalf of a firm'],
    whyTitle: 'Why partners choose OxiCloud',
    benefits: [
      { title: 'Simple integration into your workflow', body: 'Add emissions analysis to projects without complex tools.' },
      { title: 'No administrative burden', body: 'Quotations, billing, and payments are handled automatically.' },
      { title: 'Transparent revenue sharing', body: 'Partners are fairly compensated for initiating projects.' },
      { title: 'Compliant reports for your clients', body: 'Deliver professional emissions calculations aligned with regulatory requirements.' },
    ],
    ctaTitle: 'Start Your Workspace',
    ctaBody: 'Work independently or for a firm. Your Workspace links automatically via your login email - or invite your manager.',
    ctaCreate: 'Create Workspace',
    ctaInvite: 'Invite My Manager',
    ctaTooltip: 'Your manager will get an email to link your Workspace.',
    ctaTip: 'Freelancers keep their Workspace and settlements. Employees\' settlements go to the Workspace owner - invite your manager to link your firm.',
  },
  nl: {
    pageTitle: 'Partnerprogramma',
    back: 'Terug',
    heroTitle: 'OxiCloud Partnerprogramma',
    heroIntro1: 'Architecten, ingenieurs en consultants spelen al een sleutelrol in milieuconformiteit. OxiCloud stelt hen in staat conforme NOx-emissierapportages te genereren voor hun projecten, zonder gespecialiseerde software of milieuexpertise.',
    heroIntro2: 'Het gebruik van OxiCloud is gratis voor professionals. Uw klant betaalt pas wanneer hij een rapport aanvraagt.',
    heroIntro3: 'Als partner levert u de essentiële projectinformatie die de emissieberekening mogelijk maakt. Omdat deze input waardevol is, deelt OxiCloud een deel van de rapportopbrengst met de partner die het project initieert.',
    heroIntro4: 'Het volledige proces - van offerte tot betaling - wordt automatisch afgehandeld.',
    whoTitle: 'Voor wie is het Partnerprogramma?',
    whoIntro: 'Het programma is ontworpen voor professionals die al betrokken zijn bij projectvoorbereiding en milieudocumentatie, waaronder:',
    whoList: ['Architecten', 'Ingenieursbureaus', 'Milieuconsultants', 'Stedenbouwkundigen', 'Vergunnings- en conformiteitsadviseurs'],
    whoOutro: 'Als u al projectinformatie verzamelt voor uw klanten, stelt OxiCloud u in staat die informatie om te zetten in een conform emissierapport met minimale extra inspanning.',
    howTitle: 'Hoe het werkproces verloopt',
    steps: [
      {
        title: 'Vul de basisgegevens in',
        body: 'U voert een paar eenvoudige parameters in, zoals:',
        list: ['projecttype', 'locatie', 'bruto vloeroppervlakte (BVO)'],
        extra: 'Dit duurt slechts enkele minuten.\n\nOxiCloud gebruikt deze informatie om een offerte voor te bereiden voor het emissierapport.',
      },
      {
        title: 'Bekijk de offerte met uw klant',
        body: 'De offerte wordt automatisch aangemaakt in OxiCloud.\n\nU kunt deze met uw klant bespreken en beslissen of ze het rapport willen aanvragen.\n\nAls uw klant akkoord gaat, verstuurt u de offerte rechtstreeks via het OxiCloud-platform.',
      },
      {
        title: 'Uw klant bevestigt en betaalt',
        body: 'De klant ontvangt de offerte en voltooit de betaling via OxiCloud.',
        extra: 'Zodra de betaling is bevestigd:',
        list: ['wordt de NOx-berekeningsmodule automatisch ontgrendeld', 'kan het project doorgaan naar de berekeningsfase'],
      },
      {
        title: 'Voltooi de berekening',
        body: 'U voert nog enkele aanvullende projectparameters in.\n\nDit duurt doorgaans minder dan 10 minuten.\n\nZodra u op Berekenen klikt, wordt het emissierapport onmiddellijk gegenereerd.',
      },
      {
        title: 'Betaling wordt automatisch afgehandeld',
        body: 'Zodra de module is ontgrendeld na betaling door uw klant:',
        list: ['OxiCloud verwerkt de partnerafrekening automatisch', 'een factuur wordt opgesteld via self-billing', 'de factuur wordt aan u bezorgd via Peppol'],
        extra: 'Uw betaling wordt rechtstreeks op uw bankrekening gestort.\n\nEr is geen administratie vereist van uw kant.',
      },
    ],
    multiTitle: 'Werken voor meerdere kantoren',
    multiBody1: 'Sommige OxiCloud-gebruikers werken zowel zelfstandig als namens een ander kantoor.',
    multiBody2: 'Om te garanderen dat de juiste organisatie aan elk project wordt gekoppeld, kunt u een Workspace aanmaken voor het kantoor dat u vertegenwoordigt. De koppeling gebeurt automatisch op basis van het e-mailadres waarmee u inlogt.',
    multiBody3: 'Dit stelt u in staat om duidelijk te scheiden:',
    multiList: ['Zelfstandig werk', 'Werk uitgevoerd namens een kantoor'],
    whyTitle: 'Waarom partners kiezen voor OxiCloud',
    benefits: [
      { title: 'Eenvoudige integratie in uw workflow', body: 'Voeg emissieanalyse toe aan projecten zonder complexe tools.' },
      { title: 'Geen administratieve last', body: 'Offertes, facturatie en betalingen worden automatisch afgehandeld.' },
      { title: 'Transparante opbrengstverdeling', body: 'Partners worden eerlijk vergoed voor het initiëren van projecten.' },
      { title: 'Conforme rapporten voor uw klanten', body: 'Lever professionele emissieberekeningen in lijn met regelgevingsvereisten.' },
    ],
    ctaTitle: 'Start uw Workspace',
    ctaBody: 'Werk zelfstandig of voor een kantoor. Uw Workspace wordt automatisch gekoppeld via uw inlog-e-mail - of nodig uw manager uit.',
    ctaCreate: 'Maak Workspace',
    ctaInvite: 'Nodig mijn manager uit',
    ctaTooltip: 'Uw manager ontvangt een e-mail om uw Workspace te koppelen.',
    ctaTip: 'Freelancers behouden hun Workspace en afrekeningen. Afrekeningen van werknemers gaan naar de Workspace-eigenaar - nodig uw manager uit om uw kantoor te koppelen.',
  },
};

export default function PartnershipProgram() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = copy[language];
  const [showInviteManager, setShowInviteManager] = useState(false);

  return (
    <>
      <Helmet>
        <title>{t.pageTitle} - OxiCloud</title>
        <meta name="description" content={t.heroIntro1.slice(0, 155)} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <TopNavigation />

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-8 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t.back}
          </Button>

          {/* Hero */}
          <section className="mb-12">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-6">
              {t.heroTitle}
            </h1>
            <div className="space-y-4 text-[14px] text-muted-foreground leading-relaxed">
              <p>{t.heroIntro1}</p>
              <p>{t.heroIntro2}</p>
              <p>{t.heroIntro3}</p>
              <p className="font-medium text-foreground">{t.heroIntro4}</p>
            </div>
          </section>

          {/* Who */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t.whoTitle}</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">{t.whoIntro}</p>
            <ul className="space-y-2 mb-5">
              {t.whoList.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[14px] text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[14px] text-muted-foreground leading-relaxed">{t.whoOutro}</p>
          </section>

          {/* How it works */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-foreground mb-6">{t.howTitle}</h2>
            <div className="space-y-0">
              {t.steps.map((step, i) => (
                <div key={i} className="flex gap-5">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === t.steps.length - 1
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    {i < t.steps.length - 1 && (
                      <div className="w-px flex-1 bg-border my-2" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`pb-8 ${i === t.steps.length - 1 ? 'pb-0' : ''}`}>
                    <p className="text-[14px] font-semibold text-foreground mb-2">{step.title}</p>
                    {step.body.split('\n\n').map((para, j) => (
                      <p key={j} className="text-[13px] text-muted-foreground leading-relaxed mb-2">{para}</p>
                    ))}
                    {step.list && (
                      <ul className="space-y-1 mb-2 ml-0.5">
                        {step.list.map((li) => (
                          <li key={li} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                            <div className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0 mt-[7px]" />
                            {li}
                          </li>
                        ))}
                      </ul>
                    )}
                    {step.extra && step.extra.split('\n\n').map((para, j) => (
                      <p key={`e${j}`} className="text-[13px] text-muted-foreground leading-relaxed mb-2">{para}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Multi-firm */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t.multiTitle}</h2>
            <div className="space-y-3 text-[14px] text-muted-foreground leading-relaxed">
              <p>{t.multiBody1}</p>
              <p>{t.multiBody2}</p>
              <p>{t.multiBody3}</p>
            </div>
            <ul className="space-y-1.5 mt-3 ml-0.5">
              {t.multiList.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[14px] text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Why */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-foreground mb-5">{t.whyTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.benefits.map((b) => (
                <div key={b.title} className="rounded-xl border border-border/40 bg-card/80 p-5">
                  <div className="flex items-start gap-2.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-[13px] font-semibold text-foreground">{b.title}</p>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed ml-[26px]">{b.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border-2 border-primary/30 bg-card/80 backdrop-blur-xl p-6 relative overflow-hidden mb-8">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2.5 mb-1 relative z-10">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="text-base font-semibold text-foreground">{t.ctaTitle}</h2>
            </div>

            <p className="text-[13px] text-muted-foreground leading-relaxed mt-3 mb-5 relative z-10">
              {t.ctaBody}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
              <button
                onClick={() => navigate('/pilot-demo/create-account')}
                className="rounded-full px-5 py-3 text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:brightness-110">
                {t.ctaCreate}
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowInviteManager(true)}
                  className="flex-1 rounded-full px-5 py-3 text-sm font-semibold border-2 border-foreground/20 text-foreground hover:bg-muted/50 transition-colors">
                  {t.ctaInvite}
                </button>
                <div className="relative group">
                  <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center cursor-help hover:bg-muted/50 transition-colors shrink-0">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-foreground text-background text-xs p-2.5 leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 shadow-lg">
                    {t.ctaTooltip}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/70 leading-relaxed relative z-10">
              <span className="font-medium text-muted-foreground">Tip:</span>{' '}
              {t.ctaTip}
            </p>
          </section>
        </main>
      </div>

      <InviteManagerDialog open={showInviteManager} onOpenChange={setShowInviteManager} />
    </>
  );
}
