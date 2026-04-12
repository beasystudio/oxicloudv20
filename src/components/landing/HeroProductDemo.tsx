import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEP_DURATION = 4000;

interface DemoStep {
  id: string;
  label: string;
  screen: React.ReactNode;
}

/* ── Shared building blocks ── */
const StatusDot = ({ status }: { status: 'green' | 'yellow' | 'orange' | 'blue' | 'gray' }) => {
  const colors = {
    green: 'bg-primary',
    yellow: 'bg-muted-foreground',
    orange: 'bg-muted-foreground',
    blue: 'bg-muted-foreground/70',
    gray: 'bg-muted-foreground/30',
  };
  return <div className={`w-2 h-2 rounded-full shrink-0 ${colors[status]}`} />;
};

const Pill = ({ children, primary }: { children: React.ReactNode; primary?: boolean }) => (
  <div className={`h-7 px-3.5 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-default whitespace-nowrap ${
    primary ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
  }`}>
    {children}
  </div>
);

/* ── Top bar ── */
const FakeTopNav = ({ activeNav }: { activeNav: string }) => (
  <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
    <div className="flex items-center gap-5">
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
          <span className="text-[7px] font-black text-primary-foreground">OC</span>
        </div>
        <span className="text-[11px] font-bold text-foreground tracking-tight">OxiCloud</span>
      </div>
      <div className="hidden sm:flex items-center gap-0.5">
        {['Home', 'Projecten'].map((label) => (
          <div
            key={label}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${
              activeNav === label.toLowerCase() ? 'bg-muted text-foreground' : 'text-muted-foreground'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-muted-foreground">●</span>
      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[7px] font-bold text-muted-foreground">AB</div>
    </div>
  </div>
);

/* ═══════════════════════════════════════ */
/*  Screen 1: Dashboard                    */
/* ═══════════════════════════════════════ */
const DashboardScreen = () => (
  <div className="h-full flex flex-col">
    <FakeTopNav activeNav="home" />
    <div className="flex-1 p-4 max-w-[500px] mx-auto w-full">
      <div className="mb-3">
        <div className="text-[9px] text-muted-foreground">dinsdag 11 maart</div>
        <div className="text-[16px] font-semibold text-foreground leading-tight">
          Goedemorgen,<br />Anna.
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {/* Insights */}
        <div className="col-span-2 rounded-xl p-3 min-h-[80px]" style={{ background: '#1a1a1a' }}>
          <span className="text-[8px] font-bold uppercase tracking-wider text-primary">Smart Insights</span>
          <div className="space-y-1.5 mt-2">
            <div className="flex items-start gap-1.5">
              <StatusDot status="orange" />
              <span className="text-[9px] text-white/80 leading-tight">2 projecten wachten op invoer</span>
            </div>
            <div className="flex items-start gap-1.5">
              <StatusDot status="green" />
              <span className="text-[9px] text-white/80 leading-tight">1 rapport klaar voor download</span>
            </div>
          </div>
        </div>
        {/* Right column */}
        <div className="flex flex-col gap-1.5">
          <div className="rounded-xl bg-primary text-primary-foreground p-2 text-center">
            <span className="text-[8px] font-bold">+ Nieuw Project</span>
          </div>
          <div className="flex-1 rounded-xl p-2.5 flex flex-col justify-between bg-secondary">
            <span className="text-[7px] uppercase tracking-wider font-bold text-secondary-foreground/50">To do</span>
            <span className="text-[22px] font-extrabold text-secondary-foreground leading-none">4</span>
          </div>
        </div>
        {/* Actions */}
        <div className="col-span-3 rounded-xl bg-card border border-border p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Actie vereist</span>
            <span className="bg-foreground text-background text-[9px] font-bold px-1.5 py-0.5 rounded-md">2</span>
          </div>
          {[
            { name: 'Berkenlaan 7', desc: 'Invoer onvolledig', color: 'orange' as const },
            { name: 'Kloosterstraat 14', desc: 'Wacht op bevestiging', color: 'blue' as const },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5">
              <StatusDot status={item.color} />
              <span className="text-[10px] font-semibold text-foreground">{item.name}</span>
              <span className="text-[9px] text-muted-foreground">- {item.desc}</span>
            </div>
          ))}
        </div>
        {/* Stats */}
        {[
          { label: 'Team', value: '4', sub: 'actieve leden' },
          { label: 'Projecten', value: '7', sub: '5 actief' },
          { label: 'Rapporten', value: '3', sub: 'geleverd' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-primary text-primary-foreground p-2.5">
            <div className="text-[7px] uppercase tracking-wider font-bold text-primary-foreground/50">{stat.label}</div>
            <div className="text-[18px] font-extrabold leading-none mt-0.5">{stat.value}</div>
            <div className="text-[8px] text-primary-foreground/50 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════ */
/*  Screen 2: Projects list                */
/* ═══════════════════════════════════════ */
const ProjectsScreen = () => (
  <div className="h-full flex flex-col">
    <FakeTopNav activeNav="projecten" />
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-bold text-foreground">Projecten</div>
        <div className="flex items-center gap-2">
          <div className="h-7 px-2.5 rounded-lg border border-border flex items-center text-[10px] text-muted-foreground">
            Zoeken...
          </div>
          <Pill primary>+ Nieuw</Pill>
        </div>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_90px_100px_60px] gap-2 px-3 py-2 bg-muted/40 text-[8px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
          <div>Project</div><div>Type</div><div>Status</div><div className="text-right">Actie</div>
        </div>
        {[
          { name: 'Berkenlaan 7', loc: 'Gent', type: 'Nieuwbouw', status: 'Rapport klaar', sc: 'green' as const, cta: 'Download' },
          { name: 'Kloosterstraat 14', loc: 'Brugge', type: 'Appartementen', status: 'Invoer nodig', sc: 'orange' as const, cta: 'Invullen' },
          { name: 'Havenpark 22', loc: 'Aalst', type: 'Kantoor', status: 'In berekening', sc: 'yellow' as const, cta: 'Bekijk' },
          { name: 'Eikelberg 5', loc: 'Hasselt', type: 'Renovatie', status: 'Betaling', sc: 'blue' as const, cta: 'Betaal' },
          { name: 'Stationsplein 1', loc: 'Kortrijk', type: 'Industrie', status: 'Nieuw', sc: 'gray' as const, cta: 'Start' },
        ].map((p, i) => (
          <div key={i} className={`grid grid-cols-[1fr_90px_100px_60px] gap-2 px-3 py-2.5 items-center text-[10px] ${i % 2 ? 'bg-muted/10' : ''} border-b border-border last:border-0`}>
            <div>
              <div className="font-semibold text-foreground">{p.name}</div>
              <div className="text-[8px] text-muted-foreground">{p.loc}</div>
            </div>
            <div className="text-muted-foreground">{p.type}</div>
            <div className="flex items-center gap-1.5">
              <StatusDot status={p.sc} />
              <span className="text-[9px] font-medium">{p.status}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-semibold text-primary cursor-default">{p.cta} →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════ */
/*  Screen 3: NOx Input                    */
/* ═══════════════════════════════════════ */
const NoxInputScreen = () => (
  <div className="h-full flex flex-col">
    <FakeTopNav activeNav="projecten" />
    <div className="flex-1 p-4">
      <div className="text-[10px] text-muted-foreground mb-1">Projecten / <span className="font-semibold text-foreground">Berkenlaan 7</span> / Invoer</div>
      <div className="text-[13px] font-bold text-foreground mb-1">Voorlopige Schatting</div>
      <div className="text-[10px] text-muted-foreground mb-4">Vul de basisgegevens in voor de stikstofberekening</div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-1.5">
          <div className="text-[9px] font-medium text-foreground/50 uppercase tracking-wider">Projecttype</div>
          <div className="h-8 rounded-lg border border-border bg-muted/30 px-3 flex items-center text-[11px] text-foreground">
            Nieuwbouw - Woningen
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-[9px] font-medium text-foreground/50 uppercase tracking-wider">Bouwtype</div>
          <div className="h-8 rounded-lg border border-border bg-muted/30 px-3 flex items-center text-[11px] text-foreground">Standaard bouw</div>
        </div>
      </div>

      {/* Map area */}
      <div className="h-[120px] rounded-xl bg-muted/30 border border-border relative overflow-hidden mb-3">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <motion.div
            className="w-3 h-3 rounded-full bg-primary"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[10px] text-muted-foreground font-medium">Eikenlaan 42, 9000 Gent</span>
          <span className="text-[8px] text-primary font-semibold">Perceel & gebouwen geselecteerd ✓</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-primary font-medium">✓ Alle velden ingevuld</span>
        <Pill primary>Bevestigen & Berekenen →</Pill>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════ */
/*  Screen 4: NOx Results                  */
/* ═══════════════════════════════════════ */
const NoxResultScreen = () => (
  <div className="h-full flex flex-col">
    <FakeTopNav activeNav="projecten" />
    <div className="flex-1 p-4">
      <div className="text-[10px] text-muted-foreground mb-1">Berkenlaan 7 / <span className="font-semibold text-foreground">Resultaat</span></div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-bold text-foreground">Stikstofberekening</div>
        <span className="text-[9px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">Resultaat</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-3 rounded-xl border border-border bg-card">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Bouwfase</div>
          <div className="text-[18px] font-bold text-foreground">1.7 <span className="text-[10px] font-normal text-muted-foreground">kg/jaar</span></div>
          <div className="flex items-center gap-1 mt-1">
            <StatusDot status="green" />
            <span className="text-[9px] text-primary font-semibold">Onder KDW</span>
          </div>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Exploitatie</div>
          <div className="text-[18px] font-bold text-foreground">0.9 <span className="text-[10px] font-normal text-muted-foreground">kg/jaar</span></div>
          <div className="flex items-center gap-1 mt-1">
            <StatusDot status="green" />
            <span className="text-[9px] text-primary font-semibold">Onder KDW</span>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-3">
        <div className="text-[11px] font-bold text-foreground">Geen significante effecten</div>
        <div className="text-[9px] text-muted-foreground mt-0.5">Voortoets volstaat - geen passende beoordeling nodig</div>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════ */
/*  Screen 5: Report delivery              */
/* ═══════════════════════════════════════ */
const ReportScreen = () => (
  <div className="h-full flex flex-col">
    <FakeTopNav activeNav="projecten" />
    <div className="flex-1 p-4">
      <div className="text-[10px] text-muted-foreground mb-1">Berkenlaan 7 / <span className="font-semibold text-foreground">Rapport</span></div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[13px] font-bold text-foreground">Rapport klaar</div>
          <div className="text-[9px] text-muted-foreground">Goedgekeurd door certified specialist</div>
        </div>
        <span className="text-[10px] px-3 py-1 rounded-full bg-primary/15 text-primary font-bold">✓ Goedgekeurd</span>
      </div>

      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-foreground">Stikstofscreening - Berkenlaan 7</span>
          <span className="text-[8px] text-muted-foreground">11 maart 2026 • v1.0</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['PDF Rapport', 'Analyse', 'Kaarten'].map((label) => (
            <div key={label} className="p-2.5 rounded-lg bg-background/60 border border-border text-center">
              <div className="text-[10px] font-semibold text-foreground">{label}</div>
              <div className="text-[8px] text-muted-foreground mt-0.5">Beschikbaar</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 mr-3 p-2.5 rounded-xl bg-muted/50">
          <span className="text-[9px] text-muted-foreground">Partner settlement - <span className="font-semibold text-foreground">automatisch verrekend</span></span>
        </div>
        <div className="flex gap-2">
          <Pill>Verstuur</Pill>
          <Pill primary>Download</Pill>
        </div>
      </div>
    </div>
  </div>
);

/* ── Steps ── */
const demoSteps: DemoStep[] = [
  { id: 'dashboard', label: 'Dashboard', screen: <DashboardScreen /> },
  { id: 'projects', label: 'Projecten', screen: <ProjectsScreen /> },
  { id: 'input', label: 'NOx Input', screen: <NoxInputScreen /> },
  { id: 'result', label: 'Resultaat', screen: <NoxResultScreen /> },
  { id: 'report', label: 'Rapport', screen: <ReportScreen /> },
];

/* ═══════════════════════════════════════ */
/*  HeroProductDemo                        */
/* ═══════════════════════════════════════ */
export const HeroProductDemo = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % demoSteps.length);
    }, STEP_DURATION);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex-1 mx-4">
          <div className="h-6 rounded-lg bg-background border border-border px-3 flex items-center">
            <span className="text-[10px] text-muted-foreground">app.oxicloud.be</span>
          </div>
        </div>
      </div>

      {/* Step navigation - numbered text pills, no icons */}
      <div className="flex items-center gap-1 px-5 pt-3 pb-2">
        {demoSteps.map((step, i) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(i)}
            className={`flex-1 relative py-2 text-[10px] font-semibold text-center transition-all duration-300 rounded-lg ${
              i === activeStep
                ? 'text-foreground bg-muted'
                : i < activeStep
                ? 'text-muted-foreground/60'
                : 'text-muted-foreground/30 hover:text-muted-foreground/60'
            }`}
          >
            <span className="relative z-10">
              <span className="text-[8px] mr-1 font-normal">{String(i + 1).padStart(2, '0')}</span>
              {step.label}
            </span>
            {i === activeStep && !isPaused && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-muted"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ transformOrigin: 'left' }}
                transition={{ duration: STEP_DURATION / 1000, ease: 'linear' }}
                key={`fill-${activeStep}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Screen content */}
      <div className="relative min-h-[380px] sm:min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            className="h-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {demoSteps[activeStep].screen}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
