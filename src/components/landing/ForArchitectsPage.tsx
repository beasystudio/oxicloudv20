import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowUpFromLine, BrainCircuit, FileOutput, Wallet, ChevronLeft, ChevronRight, Check, Pause, Play } from 'lucide-react';
import { LandingNavbar } from './LandingNavbar';
import { Footer } from './Footer';
import { AdvancedCTAButton, CTAButton } from './AdvancedCTAButton';
import { PreFooterCTA } from './PreFooterCTA';
import { useLanguage } from '@/i18n/LanguageContext';

/* ── Mockup screen type ── */
type MockupData = { heading: string; rows: { label: string; value: string }[]; badge: string };

/* ── Onboarding Tour Steps (multi-screen per step) ── */
const getTourSteps = (t: (key: string) => string): { step: string; title: string; desc: string; screens: MockupData[] }[] => [
  {
    step: '01',
    title: t('forArchitects.tourStep1Title'),
    desc: t('forArchitects.tourStep1Desc'),
    screens: [
      {
        heading: 'New Project',
        rows: [
          { label: 'Project name', value: '' },
          { label: 'Address', value: '' },
          { label: 'Project type', value: 'Select…' },
        ],
        badge: 'Start typing to begin',
      },
      {
        heading: 'New Project',
        rows: [
          { label: 'Project name', value: 'Residence Helios' },
          { label: 'Address', value: 'Bondgenotenlaan 42, 3000 Leuven' },
          { label: 'Project type', value: 'Residential - New build' },
        ],
        badge: 'Auto-detecting location data…',
      },
      {
        heading: 'New Project',
        rows: [
          { label: 'Parcel', value: 'BE-44032A (auto-detected)' },
          { label: 'Natura 2000', value: '1.2km - Demervallei' },
          { label: 'Zoning', value: 'Residential area' },
        ],
        badge: 'Project created - ready for screening',
      },
    ],
  },
  {
    step: '02',
    title: t('forArchitects.tourStep2Title'),
    desc: t('forArchitects.tourStep2Desc'),
    screens: [
      {
        heading: 'NOx Screening - Construction',
        rows: [
          { label: 'Excavators', value: 'Select…' },
          { label: 'Duration', value: 'Select…' },
          { label: 'Crane', value: 'Select…' },
        ],
        badge: 'Choose from simple dropdowns',
      },
      {
        heading: 'NOx Screening - Construction',
        rows: [
          { label: 'Excavators', value: '2' },
          { label: 'Duration', value: '18 months' },
          { label: 'Crane', value: 'Yes - tower crane' },
        ],
        badge: 'Construction phase complete',
      },
      {
        heading: 'NOx Screening - Exploitation',
        rows: [
          { label: 'Heating system', value: 'Gas condensing - 24kW' },
          { label: 'Parking spaces', value: '12 (underground)' },
          { label: 'Traffic generation', value: 'Low - residential' },
        ],
        badge: 'All inputs confirmed - calculating',
      },
    ],
  },
  {
    step: '03',
    title: t('forArchitects.tourStep3Title'),
    desc: t('forArchitects.tourStep3Desc'),
    screens: [
      {
        heading: 'Calculating…',
        rows: [
          { label: 'Construction NOx', value: 'Processing…' },
          { label: 'Exploitation NOx', value: 'Processing…' },
          { label: 'KDW check', value: 'Pending' },
        ],
        badge: 'Running compliance engine',
      },
      {
        heading: 'Results',
        rows: [
          { label: 'Construction NOx', value: '0.42 kg/ha/y' },
          { label: 'Exploitation NOx', value: '0.18 kg/ha/y' },
          { label: 'KDW threshold', value: 'Below - compliant' },
        ],
        badge: 'Screening passed ✓',
      },
      {
        heading: 'Report Ready',
        rows: [
          { label: 'Result', value: 'Below KDW threshold - compliant' },
          { label: 'Format', value: 'PDF - municipality standard' },
          { label: 'Validity', value: '6 months from generation' },
        ],
        badge: 'Report generated - ready for download',
      },
    ],
  },
  {
    step: '04',
    title: t('forArchitects.tourStep4Title'),
    desc: t('forArchitects.tourStep4Desc'),
    screens: [
      {
        heading: 'Project Complete',
        rows: [
          { label: 'Project', value: 'Residence Helios' },
          { label: 'Report', value: 'Delivered & validated' },
          { label: 'Client', value: 'Notified ✓' },
        ],
        badge: 'Project closed successfully',
      },
      {
        heading: 'Partner Dashboard',
        rows: [
          { label: 'Projects this month', value: '4' },
          { label: 'Partner status', value: 'Active ✓' },
          { label: 'Next settlement', value: 'End of month' },
        ],
        badge: 'You earn on every approved project',
      },
    ],
  },
];

/* ── Mockup Screen (stateless - parent controls screen index) ── */
const AnimatedMockup = ({ data, animKey }: { data: MockupData; animKey: string }) => (
  <div className="rounded-xl border border-border shadow-xl bg-background overflow-hidden">
    {/* Browser chrome */}
    <div className="h-9 bg-muted/50 flex items-center gap-1.5 px-4 border-b border-border">
      <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
      <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
      <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
      <span className="ml-4 text-[10px] text-muted-foreground/40 font-mono">oxicloud.app</span>
    </div>

    {/* Content */}
    <div className="p-6 md:p-8 min-h-[280px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={animKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <h4 className="text-sm font-semibold text-foreground mb-6">{data.heading}</h4>

          <div className="space-y-4">
            {data.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{row.label}</span>
                <span className={`text-sm font-medium ${row.value && !row.value.includes('Select') && !row.value.includes('Processing') ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                  {row.value || '-'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10">
            <Check size={14} className="text-primary shrink-0" />
            <span className="text-xs text-primary font-medium">{data.badge}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
);

const processSteps = [
  { num: '01', title: 'Submit Project Data', desc: "Upload your project through OxiCloud's streamlined interface." },
  { num: '02', title: 'Automated Calculations', desc: 'AI processes NOx, sustainability metrics, and compliance requirements.' },
  { num: '03', title: 'Generate Reports', desc: 'Receive standardized, defensible documentation ready for submission.' },
  { num: '04', title: 'Settlement', desc: 'Get compensated per validated project through our partnership program.' },
];

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 40 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

/* ── Onboarding Tour - unified timing ── */
const SCREEN_MS = 3500;

const OnboardingTour = () => {
  const { t } = useLanguage();
  const tourSteps = getTourSteps(t);
  const [active, setActive] = useState(0);
  const [screenIdx, setScreenIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(Date.now());
  const elapsedRef = useRef(0);

  const currentStep = tourSteps[active];
  const totalScreens = currentStep.screens.length;

  // Reset sub-screen when step changes
  useEffect(() => {
    setScreenIdx(0);
    setProgress(0);
    startRef.current = Date.now();
    elapsedRef.current = 0;
  }, [active]);

  // Unified timer - drives sub-screens within a step, then advances step
  useEffect(() => {
    if (paused) return;
    let raf: number;
    const tick = () => {
      const elapsed = elapsedRef.current + (Date.now() - startRef.current);
      const pct = Math.min(elapsed / SCREEN_MS, 1);
      setProgress(pct);
      if (pct >= 1) {
        // Advance sub-screen or step
        setScreenIdx(prev => {
          const next = prev + 1;
          if (next >= totalScreens) {
            // Move to next step
            setActive(a => (a + 1) % tourSteps.length);
            return 0;
          }
          return next;
        });
        setProgress(0);
        startRef.current = Date.now();
        elapsedRef.current = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, active, totalScreens, tourSteps.length]);

  const togglePause = () => {
    if (paused) {
      startRef.current = Date.now();
      setPaused(false);
    } else {
      elapsedRef.current += Date.now() - startRef.current;
      setPaused(true);
    }
  };

  const goToStep = (i: number) => {
    setActive(i);
    setPaused(false);
  };

  const next = () => {
    setActive(i => (i + 1) % tourSteps.length);
    setPaused(false);
  };
  const prev = () => {
    setActive(i => (i - 1 + tourSteps.length) % tourSteps.length);
    setPaused(false);
  };

  return (
    <section className="py-24 md:py-32 px-6 bg-background overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <motion.div {...fadeIn(0)} className="text-center mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.15em] uppercase mb-4">{t('forArchitects.tourTag')}</p>
          <h2 className="heading-md text-foreground">{t('forArchitects.tourTitle')}<br className="hidden md:block" /> {t('forArchitects.tourTitleBr')}</h2>
        </motion.div>

        <div>
          {/* Step indicator - segmented progress bars (like Instagram stories) */}
          <div className="flex gap-3 mb-12">
            {tourSteps.map((s, i) => {
              const stepScreens = s.screens.length;
              return (
                <button
                  key={i}
                  onClick={() => goToStep(i)}
                  className="flex-1 group text-left"
                >
                  {/* Segmented sub-screen progress */}
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: stepScreens }).map((_, si) => (
                      <div key={si} className="flex-1 h-1 rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-[width] duration-100 ease-linear"
                          style={{
                            width:
                              i < active ? '100%' :
                              i > active ? '0%' :
                              si < screenIdx ? '100%' :
                              si === screenIdx ? `${progress * 100}%` :
                              '0%',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Step label */}
                  <span className={`text-xs font-semibold tracking-wider uppercase transition-colors duration-200 ${
                    i === active ? 'text-primary' : i < active ? 'text-foreground/60' : 'text-foreground/30'
                  }`}>
                    {t('forArchitects.tourStep')} {s.step}
                  </span>
                  <p className={`text-xs mt-1 transition-colors duration-200 hidden md:block ${
                    i === active ? 'text-foreground' : 'text-muted-foreground/50'
                  }`}>
                    {s.title}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="relative min-h-[420px] md:min-h-[400px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full grid md:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-center"
              >
                <AnimatedMockup
                  data={currentStep.screens[screenIdx]}
                  animKey={`${active}-${screenIdx}`}
                />

                <div>
                  <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">{currentStep.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{currentStep.desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls - arrows + pause */}
          <div className="flex items-center justify-end mt-8 gap-2">
            <button
              onClick={togglePause}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors duration-200"
              aria-label={paused ? 'Play' : 'Pause'}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors duration-200"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors duration-200"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ForArchitectsPage = () => {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroY = useTransform(heroScroll, [0, 0.6], [0, -60]);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-[100dvh] flex flex-col justify-center px-6 overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h1 className="heading-lg text-foreground mb-10">
              {t('forArchitects.headline')}<br className="hidden md:block" /> {t('forArchitects.headlineBr')}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance"
            >
              {t('forArchitects.subtitle')}
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer"
          onClick={() => document.getElementById('architect-tension')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-7 h-11 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-2">
            <motion.div animate={{ opacity: [1, 0, 1], y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-1 h-2 rounded-full bg-muted-foreground/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── TENSION ── */}
      <div className="min-h-[100dvh] flex flex-col">
        <section id="architect-tension" className="flex-1 flex items-center py-16 md:py-20 px-6 bg-secondary">
          <div className="container mx-auto max-w-4xl">
            <motion.div {...fadeIn(0)} className="text-center mb-16">
              <p className="text-muted-foreground text-sm tracking-[0.15em] uppercase mb-6">{t('forArchitects.tensionTag')}</p>
              <h2 className="heading-md text-secondary-foreground max-w-3xl mx-auto">
                {t('forArchitects.tensionTitle')}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { num: t('forArchitects.tensionStat1Num'), label: t('forArchitects.tensionStat1Label') },
                { num: t('forArchitects.tensionStat2Num'), label: t('forArchitects.tensionStat2Label') },
                { num: t('forArchitects.tensionStat3Num'), label: t('forArchitects.tensionStat3Label') },
              ].map((item, i) => (
                <motion.div key={i} {...fadeIn(i * 0.1)} className="text-center p-8">
                  <span className="text-4xl md:text-5xl font-semibold text-secondary-foreground block mb-3">{item.num}</span>
                  <p className="text-sm text-muted-foreground text-balance">{item.label}</p>
                </motion.div>
              ))}
            </div>

            <motion.p {...fadeIn(0.3)} className="text-center text-muted-foreground text-base mt-12 max-w-2xl mx-auto text-balance">
              {t('forArchitects.tensionBody')}
            </motion.p>
          </div>
        </section>

        <section className="relative py-16 md:py-20 px-6 bg-primary overflow-hidden">
          {/* Animated background pulse */}
          <motion.div
            className="absolute inset-0 bg-primary-foreground/5"
            initial={{ scale: 0, borderRadius: '100%' }}
            whileInView={{ scale: 3, borderRadius: '0%' }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="container mx-auto max-w-3xl text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-2xl md:text-4xl font-semibold text-primary-foreground"
            >
              {t('forArchitects.shiftTitle')}<br className="hidden md:block" /> {t('forArchitects.shiftTitleBr')}
            </motion.h2>
          </div>
        </section>
      </div>

      {/* ── ONBOARDING TOUR ── */}
      <OnboardingTour />


      {/* ── FINAL CTA ── */}
      <PreFooterCTA
        headline={<>{t('forArchitects.ctaHeadline')}<br /> <span className="text-primary">{t('forArchitects.ctaHighlight')}</span></>}
        subtitle={t('forArchitects.ctaSubtitle')}
        primaryLabel={t('forArchitects.ctaPrimary')}
        primaryTo="/register"
        secondaryLabel={t('forArchitects.ctaSecondary')}
        secondaryTo="/contact"
      />

      <Footer />
    </div>
  );
};
