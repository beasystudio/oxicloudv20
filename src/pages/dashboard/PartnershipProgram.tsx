import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { TopNavigation } from '@/components/TopNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, TrendingUp, Shield, Layers, CheckCircle } from 'lucide-react';

const commissionSteps = [
  { n: '01', label: 'Project aanmaken', desc: 'Voeg projectgegevens toe in OxiCloud' },
  { n: '02', label: 'Inschatting indienen', desc: 'Voorlopige schatting & offerte voltooien' },
  { n: '03', label: 'Klant betaalt', desc: 'Rapport betaald door uw klant' },
  { n: '04', label: 'Afrekening', desc: 'Partnervergoeding automatisch verwerkt' },
];

const benefits = [
  {
    icon: CheckCircle,
    title: 'Projectafhandeling',
    desc: 'Voltooi compliance-dossiers efficiënt. Uw klanten krijgen sneller hun vergunning — u bespaart tijd op elk project.',
  },
  {
    icon: TrendingUp,
    title: 'Professionele meerwaarde',
    desc: 'Positioneer uzelf als compliance-adviseur. Klanten waarderen uw proactieve aanpak en betrouwbare service.',
  },
  {
    icon: Shield,
    title: 'Nul financieel risico',
    desc: 'U betaalt nooit vooraf. Klanten betalen rechtstreeks. Uw vergoeding wordt automatisch berekend na betaling.',
  },
  {
    icon: Layers,
    title: 'Strategisch partnerschap',
    desc: 'Een langetermijnsamenwerking gericht op kwaliteit, compliance en wederzijds vertrouwen.',
  },
];

export default function PartnershipProgram() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Partnerprogramma · OxiCloud</title>
        <meta name="description" content="Het OxiCloud Partnerprogramma — samenwerken aan succesvolle projectafhandeling." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <TopNavigation />

        <main className="container mx-auto px-6 py-12 max-w-3xl">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-10 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Terug
          </Button>

          {/* Page Header */}
          <header className="mb-12">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3">
              Partnerprogramma
            </p>
            <h1 className="text-[2rem] font-semibold tracking-tight text-foreground leading-tight mb-4">
              Samenwerken aan<br />
              succesvolle projecten.
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
              Dien projecten in. Laat uw klanten betalen voor de rapporten die ze nodig hebben. 
              Ontvang automatische afrekening — zonder financieel risico.
            </p>
          </header>

          {/* How It Works */}
          <section className="mb-14">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-6">
              Hoe het werkt
            </h2>
            <div className="space-y-0 border border-border rounded-xl overflow-hidden">
              {commissionSteps.map((step, i) => (
                <div
                  key={step.n}
                  className={`flex items-center gap-6 px-6 py-5 ${i < commissionSteps.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <span className="text-[11px] font-semibold text-muted-foreground/50 tracking-wider w-6 shrink-0">
                    {step.n}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{step.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                  {i < commissionSteps.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-14">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-6">
              Voordelen
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((b) => (
                <div key={b.title} className="p-5 rounded-xl border border-border/60 bg-background">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <b.icon className="h-4 w-4 text-foreground/70" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">{b.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="p-8 rounded-2xl border border-border/50 bg-muted/20 text-center">
            <h3 className="text-base font-semibold mb-2">Klaar om te starten?</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Maak uw eerste project aan en dien een NOx-beoordeling in.
            </p>
            <Button onClick={() => navigate('/dashboard/projects')} className="px-6">
              Naar projecten
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}