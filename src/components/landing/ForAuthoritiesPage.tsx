import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, useInView, MotionValue } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Shield, Eye, FileCheck, AlertTriangle, ArrowRight, ChevronDown } from 'lucide-react';
import { LandingNavbar } from './LandingNavbar';
import { Footer } from './Footer';
import { AdvancedCTAButton, CTAButton } from './AdvancedCTAButton';
import { PreFooterCTA } from './PreFooterCTA';
import { useLanguage } from '@/i18n/LanguageContext';

/* ── Fade helper ── */
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 40 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

/* ── Two-track comparison data ── */
const tracks = {
  oxicloud: {
    label: 'OxiCloud Report',
    tagColor: 'bg-primary/10 text-primary border-primary/30',
    steps: [
      { title: 'Spatial validation', desc: 'Verifies distance from plot centre to nearest site boundary, parcel data, and Natura 2000 proximity.' },
      { title: 'Consistency check', desc: 'Confirms results are spatially and logically coherent with the project context.' },
      { title: 'Deviation flagging', desc: 'If the algorithm suggests 2–3 excavators but the user submitted 1, the system flags it.' },
      { title: 'Structured remarks', desc: 'A clear performance summary is generated — ready for the reviewer to sign off.' },
    ],
  },
  thirdParty: {
    label: '3rd Party Report',
    tagColor: 'bg-muted text-muted-foreground border-border',
    steps: [
      { title: 'Data extraction', desc: 'Reads all fields from the third-party document. Missing or empty fields are explicitly marked.' },
      { title: 'Split-screen review', desc: 'Original document on the left. OxiCloud\'s extracted canvas on the right. Edit before confirming.' },
      { title: 'Baseline run', desc: 'Reconstructs the project data and runs an independent baseline calculation.' },
      { title: 'Comparison & remarks', desc: 'Third-party output vs OxiCloud baseline. Deviations and risk indicators surfaced automatically.' },
    ],
  },
};

/* ── Tabbed features ── */
const featureTabs = [
  {
    id: 'validate',
    label: 'Validate',
    icon: Shield,
    title: 'Automated spatial & logical validation',
    desc: 'Every report is checked against parcel boundaries, Natura 2000 proximity, building footprints, and deviation thresholds — automatically.',
    details: [
      'Distance from plot centre to nearest site boundary',
      'Parcel boundaries & building footprint verification',
      'Natura 2000 habitat proximity check',
      'Deviation flagging for altered parameters',
    ],
    mockupRows: [
      { label: 'Distance to site', value: '142m — Verified ✓' },
      { label: 'Parcel match', value: 'BE-44032A — Confirmed ✓' },
      { label: 'Natura 2000', value: '1.2km — Not in proximity ✓' },
      { label: 'Footprint', value: '326m² — Within limits ✓' },
    ],
  },
  {
    id: 'review',
    label: 'Review',
    icon: Eye,
    title: 'Split-screen review interface',
    desc: 'For third-party reports: original document on the left, OxiCloud\'s extracted and pre-filled canvas on the right. Edit anything before confirming.',
    details: [
      'Side-by-side document comparison',
      'Editable extracted fields',
      'Independent baseline calculation',
      'Anomaly highlighting',
    ],
    mockupRows: [
      { label: 'Source document', value: 'NOx_Report_External.pdf' },
      { label: 'Fields extracted', value: '24 of 24 — Complete' },
      { label: 'Baseline result', value: '0.38 kg/ha/y (OxiCloud)' },
      { label: 'Submitted result', value: '0.41 kg/ha/y — Δ 7.9%' },
    ],
  },
  {
    id: 'certify',
    label: 'Certify',
    icon: FileCheck,
    title: 'One-click validation report',
    desc: 'Generate a certified, timestamped PDF proving your team assessed this project rigorously. Your audit trail, liability shield, and proof of due diligence.',
    details: [
      'Certified PDF generation',
      'Timestamped & digitally signed',
      'Full audit trail included',
      'Reviewer identification logged',
    ],
    mockupRows: [
      { label: 'Report format', value: 'PDF — Municipality standard' },
      { label: 'Digital signature', value: 'SHA-256 — Signed ✓' },
      { label: 'Reviewer', value: 'J. Peeters — ENV-024' },
      { label: 'Timestamp', value: '07 Mar 2026 · 14:22 CET' },
    ],
  },
  {
    id: 'flag',
    label: 'Flag',
    icon: AlertTriangle,
    title: 'Risk indicators & deviation alerts',
    desc: 'Any user-altered parameter that deviates from system recommendations is flagged. No more guessing if the numbers are real.',
    details: [
      'Automated anomaly detection',
      'Threshold breach alerts',
      'Historical comparison data',
      'Structured risk assessment',
    ],
    mockupRows: [
      { label: 'Excavators', value: '1 submitted (rec: 2–3) ⚠' },
      { label: 'Duration', value: '6 months (rec: 12–18) ⚠' },
      { label: 'Heating system', value: 'Gas condensing — OK ✓' },
      { label: 'Risk level', value: 'Medium — 2 flags' },
    ],
  },
];

/* ── Vertical timeline mockup data ── */
const timelineMockups = [
  {
    step: '01',
    title: 'Upload the report',
    desc: 'OxiCloud or third-party — just submit. The system automatically identifies the type and routes it.',
    mockup: {
      heading: 'Report Upload',
      rows: [
        { label: 'File', value: 'NOx_Report_PRJ-2024-00471.pdf' },
        { label: 'Type', value: 'Auto-detected: OxiCloud Report' },
        { label: 'Status', value: 'Queued for validation' },
      ],
    },
  },
  {
    step: '02',
    title: 'System validates',
    desc: 'Distance, parcel, footprint, Natura 2000 — all checked automatically in seconds.',
    mockup: {
      heading: 'Validation Engine',
      rows: [
        { label: 'Distance check', value: '142m — Verified ✓' },
        { label: 'Parcel boundaries', value: 'Confirmed ✓' },
        { label: 'Natura 2000', value: 'Not in proximity ✓' },
      ],
    },
  },
  {
    step: '03',
    title: 'Review the remarks',
    desc: 'OxiCloud surfaces all deviations, anomalies, and risk indicators. You confirm or investigate.',
    mockup: {
      heading: 'Deviation Report',
      rows: [
        { label: 'Excavators', value: '1 submitted (system: 2–3) ⚠' },
        { label: 'Baseline comparison', value: 'Within tolerance ✓' },
        { label: 'Risk level', value: 'Low — flagged item noted' },
      ],
    },
  },
  {
    step: '04',
    title: 'Generate the report',
    desc: 'One click. A certified validation report — proving this project was reviewed and approved.',
    mockup: {
      heading: 'Validation Complete',
      rows: [
        { label: 'Result', value: 'Acceptable — 1 flag noted' },
        { label: 'Report', value: 'PDF generated — audit-ready' },
        { label: 'Timestamp', value: '07 Mar 2026 · 14:22 CET' },
      ],
    },
  },
];

/* ── Stats ── */
const stats = [
  { value: '100%', label: 'Automated spatial checks' },
  { value: '2×', label: 'Faster review per report' },
  { value: '0', label: 'Manual cross-checking needed' },
  { value: '1-click', label: 'Certified validation report' },
];

/* ═══════════════════════════════════════════════════ */
/*  Tabbed Feature Explorer Component                 */
/* ═══════════════════════════════════════════════════ */
const FeatureExplorer = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const localFeatureTabs = [
    { ...featureTabs[0], label: t('forAuthorities.featureValidateLabel'), title: t('forAuthorities.featureValidateTitle'), desc: t('forAuthorities.featureValidateDesc') },
    { ...featureTabs[1], label: t('forAuthorities.featureReviewLabel'), title: t('forAuthorities.featureReviewTitle'), desc: t('forAuthorities.featureReviewDesc') },
    { ...featureTabs[2], label: t('forAuthorities.featureCertifyLabel'), title: t('forAuthorities.featureCertifyTitle'), desc: t('forAuthorities.featureCertifyDesc') },
    { ...featureTabs[3], label: t('forAuthorities.featureFlagLabel'), title: t('forAuthorities.featureFlagTitle'), desc: t('forAuthorities.featureFlagDesc') },
  ];

  const tab = localFeatureTabs[activeTab];

  return (
    <section className="py-24 md:py-32 px-6 bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div {...fadeIn(0)} className="text-center mb-16">
          <p className="text-muted-foreground text-sm tracking-[0.15em] uppercase mb-4">{t('forAuthorities.capabilitiesTag')}</p>
          <h2 className="heading-md text-foreground">{t('forAuthorities.capabilitiesTitle')}</h2>
        </motion.div>

        {/* Tab bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {localFeatureTabs.map((ft, i) => (
            <button
              key={ft.id}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                i === activeTab
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {ft.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row gap-10 lg:gap-16"
          >
            {/* Left: text */}
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-semibold text-foreground mb-4">{tab.title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-8">{tab.desc}</p>
              <ul className="space-y-3">
                {tab.details.map((d, i) => (
                  <motion.li
                    key={d}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="flex items-center gap-3 text-sm text-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {d}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Right: mockup */}
            <div className="flex-1 min-w-0">
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl">
                <div className="h-9 bg-muted/50 flex items-center gap-1.5 px-4 border-b border-border">
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
                  <span className="ml-4 text-[10px] text-muted-foreground/40 font-mono">oxicloud.gov</span>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-sm font-semibold text-foreground mb-6">{tab.label} Module</p>
                  {tab.mockupRows.map((row, i) => (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-center justify-between py-3 border-b border-border/60 last:border-0"
                    >
                      <span className="text-xs text-muted-foreground">{row.label}</span>
                      <span className={`text-xs font-medium ${row.value.includes('⚠') ? 'text-amber-500' : 'text-foreground'}`}>{row.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════ */
/*  Timeline Step with scroll-progress number color    */
/* ═══════════════════════════════════════════════════ */
const TimelineStep = ({ item, isRight, index, totalSteps, scrollYProgress }: {
  item: typeof timelineMockups[number];
  isRight: boolean;
  index: number;
  totalSteps: number;
  scrollYProgress: MotionValue<number>;
}) => {
  const [isActive, setIsActive] = useState(false);

  // Each step activates when the line reaches its proportional position
  const threshold = 0.1 + ((index + 0.5) / totalSteps) * 0.8;

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setIsActive(latest >= threshold);
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: isRight ? 60 : -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative grid md:grid-cols-2 gap-8 items-center"
    >
      {/* Timeline dot */}
      <div className={`absolute left-6 md:left-1/2 w-3 h-3 rounded-full border-4 border-background -translate-x-1/2 z-10 top-8 md:top-1/2 md:-translate-y-1/2 transition-colors duration-500 ${isActive ? 'bg-primary' : 'bg-border'}`} />

      {/* Content side */}
      <div className={`pl-16 md:pl-0 ${isRight ? 'md:col-start-2 md:pl-12' : 'md:pr-12 md:text-right'}`}>
        <span
          className={`text-6xl font-semibold block mb-2 transition-colors duration-500 ${
            isActive ? 'text-primary' : 'text-foreground/5'
          }`}
        >
          {item.step}
        </span>
        <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
      </div>

      {/* Mockup side */}
      <div className={`pl-16 md:pl-0 ${isRight ? 'md:col-start-1 md:row-start-1 md:pr-12' : 'md:pl-12'}`}>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
          <div className="h-8 bg-muted/50 flex items-center gap-1.5 px-3 border-b border-border">
            <span className="w-2 h-2 rounded-full bg-foreground/10" />
            <span className="w-2 h-2 rounded-full bg-foreground/10" />
            <span className="w-2 h-2 rounded-full bg-foreground/10" />
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-foreground mb-4">{item.mockup.heading}</p>
            {item.mockup.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{row.label}</span>
                <span className={`text-xs font-medium ${row.value.includes('⚠') ? 'text-amber-500' : 'text-foreground'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════ */
/*  Scroll-driven Timeline Component                  */
/* ═══════════════════════════════════════════════════ */
const ScrollTimeline = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%']);

  return (
    <section ref={containerRef} id="how-it-works" className="py-24 md:py-32 px-6 bg-muted/30 border-y border-border">
      <div className="container mx-auto max-w-4xl">
        <motion.div {...fadeIn(0)} className="text-center mb-20">
          <p className="text-muted-foreground text-sm tracking-[0.15em] uppercase mb-4">{t('forAuthorities.workflowTag')}</p>
          <h2 className="heading-md text-foreground">{t('forAuthorities.workflowTitle')}</h2>
        </motion.div>

        <div className="relative">
          {/* Animated vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px">
            <motion.div
              className="w-full bg-primary origin-top"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-16 md:space-y-24">
            {timelineMockups.map((item, i) => {
              const isRight = i % 2 === 1;
              return (
                <TimelineStep key={item.step} item={item} isRight={isRight} index={i} totalSteps={timelineMockups.length} scrollYProgress={scrollYProgress} />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════ */
/*  Two-Track Comparison (horizontal toggle)          */
/* ═══════════════════════════════════════════════════ */
const TwoTrackComparison = () => {
  const { t } = useLanguage();
  const [activeTrack, setActiveTrack] = useState<'oxicloud' | 'thirdParty'>('oxicloud');

  const localTracks = {
    oxicloud: { ...tracks.oxicloud, label: t('forAuthorities.trackOxicloudLabel') },
    thirdParty: { ...tracks.thirdParty, label: t('forAuthorities.trackThirdPartyLabel') },
  };
  const track = localTracks[activeTrack];

  return (
    <section className="py-24 md:py-32 px-6 bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div {...fadeIn(0)} className="text-center mb-12">
          <p className="text-muted-foreground text-sm tracking-[0.15em] uppercase mb-4">{t('forAuthorities.twoTrackTag')}</p>
          <h2 className="heading-md text-foreground max-w-3xl mx-auto">{t('forAuthorities.twoTrackTitle')}</h2>
        </motion.div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-muted/50 rounded-full p-1 border border-border">
            {(['oxicloud', 'thirdParty'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTrack(key)}
                className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTrack === key
                    ? 'bg-background text-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {localTracks[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Track content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTrack}
            initial={{ opacity: 0, x: activeTrack === 'oxicloud' ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTrack === 'oxicloud' ? 40 : -40 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {track.steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1.5">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  {i < track.steps.length - 1 && (
                    <ArrowRight size={14} className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-border md:hidden" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════ */
/*  MAIN PAGE                                         */
/* ═══════════════════════════════════════════════════ */
export const ForAuthoritiesPage = () => {
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
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="container mx-auto max-w-5xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-center">
            <h1 className="heading-lg text-foreground mb-10">
              {t('forAuthorities.headline')}<br className="hidden md:block" /> {t('forAuthorities.headlineBr')}
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col items-center gap-2 mb-8"
            >
              <p className="text-muted-foreground text-lg max-w-2xl">
                {t('forAuthorities.subtitle')}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer"
          onClick={() => document.getElementById('gov-tension')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-7 h-11 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-2">
            <motion.div animate={{ opacity: [1, 0, 1], y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="w-1 h-2 rounded-full bg-muted-foreground/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── TENSION + SHIFT (combined full height) ── */}
      <div id="gov-tension" className="min-h-[100dvh] flex flex-col">
        <section className="flex-1 flex items-center py-16 md:py-20 px-6 bg-secondary">
          <div className="container mx-auto max-w-4xl">
            <motion.div {...fadeIn(0)} className="text-center mb-12">
              <p className="text-muted-foreground text-sm tracking-[0.15em] uppercase mb-6">{t('forAuthorities.tensionTag')}</p>
              <h2 className="heading-md text-secondary-foreground max-w-3xl mx-auto">
                {t('forAuthorities.tensionTitle')}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6 text-center">
              {[
                { num: t('forAuthorities.tensionStat1Num'), label: t('forAuthorities.tensionStat1Label') },
                { num: t('forAuthorities.tensionStat2Num'), label: t('forAuthorities.tensionStat2Label') },
                { num: t('forAuthorities.tensionStat3Num'), label: t('forAuthorities.tensionStat3Label') },
                { num: t('forAuthorities.tensionStat4Num'), label: t('forAuthorities.tensionStat4Label') },
              ].map((item, i) => (
                <motion.div key={i} {...fadeIn(i * 0.08)} className="p-4">
                  <span className="text-3xl md:text-4xl font-semibold text-secondary-foreground block mb-2">{item.num}</span>
                  <p className="text-xs text-muted-foreground text-balance">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-16 md:py-20 px-6 bg-primary overflow-hidden">
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
              {t('forAuthorities.shiftTitle')}<br className="hidden md:block" /> {t('forAuthorities.shiftTitleBr')}
            </motion.h2>
          </div>
        </section>
      </div>

      {/* ── TWO-TRACK COMPARISON ── */}
      <TwoTrackComparison />

      {/* ── SCROLL-DRIVEN TIMELINE ── */}
      <ScrollTimeline />




      {/* ── FINAL CTA ── */}
      <PreFooterCTA
        headline={<>{t('forAuthorities.ctaHeadline')}<br /> <span className="text-primary">{t('forAuthorities.ctaHighlight')}</span></>}
        subtitle={t('forAuthorities.ctaSubtitle')}
        primaryLabel={t('forAuthorities.ctaPrimary')}
        primaryTo="/contact"
        secondaryLabel={t('forAuthorities.ctaSecondary')}
        secondaryTo="/contact"
        disclaimer={t('forAuthorities.ctaDisclaimer')}
      />

      <Footer />
    </div>
  );
};
