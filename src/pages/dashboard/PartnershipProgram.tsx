import { useState, useEffect, useRef } from 'react';
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
        body: 'You enter a few simple parameters - project type, location, gross floor area (GFA), and your client\'s name, company, email, and VAT number. This takes only a few minutes.',
        extra: 'That\'s all OxiCloud needs to generate the quotation.',
      },
      {
        title: 'The quote goes straight to your client automatically',
        body: 'The moment the quote is generated, OxiCloud sends it directly to your client. No extra steps, no manual trigger from your side.',
        extra: 'Your client receives a personalised email with a smart URL. When they open it, they see an HTML version of the quote - identical to the PDF - where they fill in any remaining details and, if applicable, a PO number.\n\nYou receive a PDF copy for your own reference. You can view or download it at any time.',
        badges: ['Sent automatically on quote generation', 'PDF copy available to you instantly'],
        callout: 'If you spot an error after the quote has been sent, contact us and we\'ll issue a corrected version.',
      },
      {
        title: 'Your client signs - and the project is yours to complete',
        body: 'Once your client has reviewed and filled in the quote, they sign it digitally via Penneo Sign. That signature is the binding moment - a legal contract between the end client and A-Spine.',
        extra: 'As soon as the signature is confirmed, the project is released to you and the NOx calculation module is unlocked. Your client doesn\'t pay anything at this stage.',
        badges: ['Project unlocked on signature'],
        badgesVariant: ['default'],
        badgesRed: ['Signed = legally bound - non-payment is actionable'],
        callout: 'If a client goes quiet or refuses to pay after signing, A-Spine holds a valid contract and can pursue the outstanding amount. Your commission is protected.',
      },
      {
        title: 'Complete the calculation',
        body: 'You enter a few additional project parameters directly in OxiCloud. This typically takes less than 10 minutes.',
        extra: 'Click Calculate and the emissions report is generated immediately.',
      },
      {
        title: 'Report delivered - once your client pays',
        body: 'The final report is released only after A-Spine has received full payment from your client. Until then, the report is ready but held.',
        extra: 'Once payment is confirmed, the report is delivered and your settlement is triggered automatically - no invoice to write, no follow-up needed.',
        badges: ['Report held until full payment'],
        callout: 'Per the algemene voorwaarden: your commission is paid only after A-Spine has received full payment for the report.',
      },
      {
        title: 'Your payment - fully automatic',
        body: 'OxiCloud handles the partner settlement without any action from you. An invoice is issued via self-billing and delivered through Peppol. Your fee is transferred directly to your bank account.',
        extra: 'You close the project. We handle the rest.',
        badges: ['Self-billing via Peppol - zero admin'],
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
    navIntro: 'Introduction',
    navWho: 'Who is it for',
    navHow: 'How it works',
    navMulti: 'Multiple firms',
    navWhy: 'Why OxiCloud',
    navCta: 'Get started',
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
        body: 'U voert een paar eenvoudige parameters in - projecttype, locatie, bruto vloeroppervlakte (BVO), en de naam, het bedrijf, e-mailadres en btw-nummer van uw klant. Dit duurt slechts enkele minuten.',
        extra: 'Dat is alles wat OxiCloud nodig heeft om de offerte te genereren.',
      },
      {
        title: 'De offerte gaat automatisch rechtstreeks naar uw klant',
        body: 'Zodra de offerte is gegenereerd, stuurt OxiCloud deze rechtstreeks naar uw klant. Geen extra stappen, geen handmatige actie van uw kant.',
        extra: 'Uw klant ontvangt een gepersonaliseerde e-mail met een slimme URL. Wanneer ze deze openen, zien ze een HTML-versie van de offerte - identiek aan de PDF - waar ze eventuele resterende gegevens invullen en, indien van toepassing, een PO-nummer.\n\nU ontvangt een PDF-kopie ter referentie. U kunt deze op elk moment bekijken of downloaden.',
        badges: ['Automatisch verstuurd bij offertegeneratie', 'PDF-kopie direct beschikbaar'],
        callout: 'Als u een fout ontdekt nadat de offerte is verstuurd, neem dan contact met ons op en wij sturen een gecorrigeerde versie.',
      },
      {
        title: 'Uw klant tekent - en het project is vrijgegeven',
        body: 'Zodra uw klant de offerte heeft bekeken en ingevuld, tekenen ze digitaal via Penneo Sign. Die handtekening is het bindende moment - een juridisch contract tussen de eindklant en A-Spine.',
        extra: 'Zodra de handtekening is bevestigd, wordt het project aan u vrijgegeven en wordt de NOx-berekeningsmodule ontgrendeld. Uw klant betaalt op dit moment niets.',
        badges: ['Project ontgrendeld bij handtekening'],
        badgesVariant: ['default'],
        badgesRed: ['Getekend = juridisch gebonden - wanbetaling is afdwingbaar'],
        callout: 'Als een klant stilzwijgt of weigert te betalen na ondertekening, beschikt A-Spine over een geldig contract en kan het uitstaande bedrag vorderen. Uw commissie is beschermd.',
      },
      {
        title: 'Voltooi de berekening',
        body: 'U voert nog enkele aanvullende projectparameters rechtstreeks in OxiCloud in. Dit duurt doorgaans minder dan 10 minuten.',
        extra: 'Klik op Berekenen en het emissierapport wordt onmiddellijk gegenereerd.',
      },
      {
        title: 'Rapport geleverd - zodra uw klant betaalt',
        body: 'Het definitieve rapport wordt pas vrijgegeven nadat A-Spine volledige betaling van uw klant heeft ontvangen. Tot dan is het rapport klaar maar wordt het vastgehouden.',
        extra: 'Zodra de betaling is bevestigd, wordt het rapport geleverd en wordt uw afrekening automatisch gestart - geen factuur te schrijven, geen opvolging nodig.',
        badges: ['Rapport vastgehouden tot volledige betaling'],
        callout: 'Conform de algemene voorwaarden: uw commissie wordt pas betaald nadat A-Spine de volledige betaling voor het rapport heeft ontvangen.',
      },
      {
        title: 'Uw betaling - volledig automatisch',
        body: 'OxiCloud verwerkt de partnerafrekening zonder enige actie van uw kant. Een factuur wordt opgesteld via self-billing en bezorgd via Peppol. Uw vergoeding wordt rechtstreeks op uw bankrekening gestort.',
        extra: 'U sluit het project af. Wij regelen de rest.',
        badges: ['Self-billing via Peppol - nul administratie'],
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
    navIntro: 'Introductie',
    navWho: 'Voor wie',
    navHow: 'Hoe het werkt',
    navMulti: 'Meerdere kantoren',
    navWhy: 'Waarom OxiCloud',
    navCta: 'Aan de slag',
  },
};

const SECTIONS = ['intro', 'who', 'how', 'multi', 'why', 'cta'] as const;
type SectionId = typeof SECTIONS[number];

export default function PartnershipProgram() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = copy[language];
  const [showInviteManager, setShowInviteManager] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('intro');
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    intro: null, who: null, how: null, multi: null, why: null, cta: null,
  });

  const navItems: { id: SectionId; label: string }[] = [
    { id: 'intro', label: t.navIntro },
    { id: 'who', label: t.navWho },
    { id: 'how', label: t.navHow },
    { id: 'multi', label: t.navMulti },
    { id: 'why', label: t.navWhy },
    { id: 'cta', label: t.navCta },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveSection(topmost.target.id as SectionId);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    SECTIONS.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: SectionId) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Helmet>
        <title>{t.pageTitle} - OxiCloud</title>
        <meta name="description" content={t.heroIntro1.slice(0, 155)} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <TopNavigation />

        <div className="container mx-auto px-6 py-10 max-w-5xl">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-10 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t.back}
          </Button>

          <div className="flex gap-12">
            {/* Side nav - sticky */}
            <nav className="hidden lg:block w-44 shrink-0">
              <div className="sticky top-24">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollTo(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all ${
                          activeSection === item.id
                            ? 'text-foreground font-semibold bg-muted/60'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {/* Hero */}
              <section id="intro" ref={(el) => { sectionRefs.current.intro = el; }} className="mb-16 scroll-mt-24">
                <h1 className="text-3xl font-bold text-foreground tracking-tight mb-8">
                  {t.heroTitle}
                </h1>
                <div className="space-y-5 text-[15px] text-muted-foreground leading-[1.8]">
                  <p>{t.heroIntro1}</p>
                  <p>{t.heroIntro2}</p>
                  <p>{t.heroIntro3}</p>
                  <p className="font-semibold text-foreground text-[15px]">{t.heroIntro4}</p>
                </div>
              </section>

              <div className="w-full h-px bg-border/60 mb-16" />

              {/* Who */}
              <section id="who" ref={(el) => { sectionRefs.current.who = el; }} className="mb-16 scroll-mt-24">
                <h2 className="text-xl font-bold text-foreground mb-5">{t.whoTitle}</h2>
                <p className="text-[15px] text-muted-foreground leading-[1.8] mb-6">{t.whoIntro}</p>
                <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-6 mb-6">
                  <ul className="space-y-3">
                    {t.whoList.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-[15px] text-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-[15px] text-muted-foreground leading-[1.8]">{t.whoOutro}</p>
              </section>

              <div className="w-full h-px bg-border/60 mb-16" />

              {/* How it works */}
              <section id="how" ref={(el) => { sectionRefs.current.how = el; }} className="mb-16 scroll-mt-24">
                <h2 className="text-xl font-bold text-foreground mb-8">{t.howTitle}</h2>
                <div className="space-y-0">
                  {t.steps.map((step, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                          i === t.steps.length - 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border/60 text-foreground'
                        }`}>
                          {i + 1}
                        </div>
                        {i < t.steps.length - 1 && (
                          <div className="w-px flex-1 bg-border/40 my-2" />
                        )}
                      </div>
                      <div className={`pt-1.5 ${i === t.steps.length - 1 ? 'pb-0' : 'pb-10'}`}>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1">Step {i + 1}</p>
                        <p className="text-[15px] font-semibold text-foreground mb-3">{step.title}</p>
                        {step.body.split('\n\n').map((para, j) => (
                          <p key={j} className="text-[14px] text-muted-foreground leading-[1.8] mb-3">{para}</p>
                        ))}
                        {step.extra && step.extra.split('\n\n').map((para, j) => (
                          <p key={`e${j}`} className="text-[14px] text-muted-foreground leading-[1.8] mb-3">{para}</p>
                        ))}
                        {'badges' in step && step.badges && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {step.badges.map((badge) => (
                              <span key={badge} className="inline-block text-[12px] font-medium px-3 py-1.5 rounded-full border border-border/60 bg-background text-foreground/80">
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                        {'badgesRed' in step && step.badgesRed && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {step.badgesRed.map((badge) => (
                              <span key={badge} className="inline-block text-[12px] font-medium px-3 py-1.5 rounded-full border border-foreground/20 bg-foreground text-background">
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                        {'callout' in step && step.callout && (
                          <div className="border-l-2 border-border/60 pl-4 mt-2 mb-3">
                            <p className="text-[13px] text-muted-foreground/70 leading-[1.7]">{step.callout}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="w-full h-px bg-border/60 mb-16" />

              {/* Multi-firm */}
              <section id="multi" ref={(el) => { sectionRefs.current.multi = el; }} className="mb-16 scroll-mt-24">
                <div className="rounded-2xl border-2 border-primary/40 bg-primary/[0.08] p-6 sm:p-8 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.15)]">
                  <h2 className="text-lg font-bold text-foreground mb-4">{t.multiTitle}</h2>
                  <div className="space-y-3 text-[14px] text-muted-foreground leading-[1.7]">
                    <p>{t.multiBody1}</p>
                    <p>{t.multiBody2}</p>
                    <p className="font-medium text-foreground">{t.multiBody3}</p>
                  </div>
                  <ul className="space-y-2.5 mt-4 ml-1">
                    {t.multiList.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-[14px] font-medium text-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <div className="w-full h-px bg-border/60 mb-16" />

              {/* Why */}
              <section id="why" ref={(el) => { sectionRefs.current.why = el; }} className="mb-16 scroll-mt-24">
                <h2 className="text-xl font-bold text-foreground mb-6">{t.whyTitle}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {t.benefits.map((b) => (
                    <div key={b.title} className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[15px] font-semibold text-foreground leading-snug">{b.title}</p>
                      </div>
                      <p className="text-[14px] text-muted-foreground leading-[1.8] ml-8">{b.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section id="cta" ref={(el) => { sectionRefs.current.cta = el; }} className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/30 p-8 relative overflow-hidden mb-10 scroll-mt-24">
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{t.ctaTitle}</h2>
                </div>

                <p className="text-[14px] text-muted-foreground leading-[1.8] mt-4 mb-6 relative z-10">
                  {t.ctaBody}
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 relative z-10">
                  <button
                    onClick={() => navigate('/pilot-demo/create-account')}
                    className="rounded-full px-8 py-3.5 text-sm font-semibold transition-all bg-muted text-foreground hover:bg-muted/70">
                    {t.ctaCreate}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowInviteManager(true)}
                      className="rounded-full px-8 py-3.5 text-sm font-semibold border border-border/60 text-foreground hover:bg-muted/40 transition-all">
                      {t.ctaInvite}
                    </button>
                    <div className="relative group">
                      <div className="w-8 h-8 rounded-full border border-border/60 flex items-center justify-center cursor-help hover:bg-muted/40 transition-colors shrink-0">
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="absolute bottom-full right-0 mb-2 w-60 rounded-xl bg-foreground text-background text-xs p-3 leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 shadow-xl">
                        {t.ctaTooltip}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[12px] text-muted-foreground/60 leading-[1.7] relative z-10">
                  <span className="font-semibold text-muted-foreground/80">Tip:</span>{' '}
                  {t.ctaTip}
                </p>
              </section>
            </main>
          </div>
        </div>
      </div>

      <InviteManagerDialog open={showInviteManager} onOpenChange={setShowInviteManager} />
    </>
  );
}
