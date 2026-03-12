import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { PreFooterCTA } from "@/components/landing/PreFooterCTA";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

import aboutHero from "@/assets/about-hero.jpg";
import aboutEditorial from "@/assets/about-editorial-bw.jpg";
import aboutBento from "@/assets/about-bento.jpg";

/* ── Fade helper ─────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
});

const About = () => {
  const { t } = useLanguage();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const [activeSeq, setActiveSeq] = useState(0);

  const timelineSteps = [
  { year: "2024", title: t('about.timeline2024'), text: t('about.timeline2024Desc') },
  { year: "2025", title: t('about.timeline2025'), text: t('about.timeline2025Desc') },
  { year: "2026", title: t('about.timeline2026'), text: t('about.timeline2026Desc') }];


  const bentoValues = [
  { label: t('about.valueAccuracy'), desc: t('about.valueAccuracyDesc'), variant: "dark" as const },
  { label: t('about.valueCompliance'), desc: t('about.valueComplianceDesc'), variant: "green" as const },
  { label: t('about.valueTransparency'), desc: t('about.valueTransparencyDesc'), variant: "default" as const },
  { label: t('about.valueEvidence'), desc: t('about.valueEvidenceDesc'), variant: "default" as const },
  { label: t('about.valueResponsibility'), desc: t('about.valueResponsibilityDesc'), variant: "dark" as const }];


  const sequenceItems = [
  { title: t('about.integrityAuditable'), desc: t('about.integrityAuditableDesc') },
  { title: t('about.integrityGovernment'), desc: t('about.integrityGovernmentDesc') },
  { title: t('about.integrityReproducible'), desc: t('about.integrityReproducibleDesc') }];


  const pills = [
  { value: "40%", sub: t('about.pill40'), pos: "absolute -bottom-4 -right-4 md:-right-6", bg: "bg-primary text-primary-foreground", subColor: "text-primary-foreground/80", delay: 0, floatY: [0, -8, 0], floatDur: 3.5 },
  { value: "85%", sub: t('about.pill85'), pos: "absolute top-8 -left-4 md:-left-6", bg: "bg-secondary text-secondary-foreground", subColor: "text-secondary-foreground/60", delay: 0.8, floatY: [0, 6, 0], floatDur: 4 },
  { value: "500+", sub: t('about.pill500'), pos: "absolute top-1/3 -right-4 md:-right-8", bg: "bg-foreground text-background", subColor: "text-background/70", delay: 1.6, floatY: [0, -10, 0], floatDur: 3.8 },
  { value: "€15K", sub: t('about.pill15k'), pos: "absolute bottom-1/4 -left-3 md:-left-6", bg: "bg-primary text-primary-foreground", subColor: "text-primary-foreground/80", delay: 2.4, floatY: [0, 7, 0], floatDur: 4.2 }];


  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <img src={aboutHero} alt="Sustainable architecture" className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 bg-foreground/50" />
        </motion.div>
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.h1 {...fadeUp(0)} className="heading-lg text-background mb-8 text-balance">
            {t('about.heroTitle')}<br />{t('about.heroTitleBr')}
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="body-lg text-background/80 max-w-2xl mx-auto text-balance">
            {t('about.heroSubtitle')}
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ OUR WHY ═══ */}
      






















































      

      {/* ═══ VALUES ═══ */}
      <section className="min-h-[100dvh] flex items-center px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl py-16">
          <motion.div {...fadeUp()} className="mb-10">
            <h2 className="heading-md text-foreground text-balance">{t('about.valuesTitle')}</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
            className="md:col-span-5 rounded-2xl p-6 flex flex-col justify-end bg-secondary text-secondary-foreground cursor-default min-h-[140px]">
              <h3 className="text-base font-semibold mb-1.5">{bentoValues[0].label}</h3>
              <p className="text-sm text-secondary-foreground/60 leading-relaxed">{bentoValues[0].desc}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.05 }}
            className="md:col-span-3 rounded-2xl p-6 flex flex-col justify-end bg-primary text-primary-foreground cursor-default min-h-[140px]">
              <h3 className="text-base font-semibold mb-1.5">{bentoValues[1].label}</h3>
              <p className="text-sm text-primary-foreground/80 leading-relaxed">{bentoValues[1].desc}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
            className="md:col-span-4 md:row-span-2 rounded-2xl overflow-hidden relative min-h-[200px]">
              <img src={aboutBento} alt="Eco-friendly building" className="w-full h-full object-cover grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-background text-sm font-medium text-balance leading-snug">{t('about.bentoImageCaption')}</p>
              </div>
            </motion.div>

            {bentoValues.slice(2).map((item, i) => {
              const bgClass = item.variant === "dark" ? "bg-secondary text-secondary-foreground" : "bg-card border border-border text-foreground";
              const descClass = item.variant === "dark" ? "text-secondary-foreground/60" : "text-muted-foreground";
              const spans = ["md:col-span-3", "md:col-span-3", "md:col-span-2"];
              return (
                <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                className={cn("rounded-2xl p-6 flex flex-col justify-end cursor-default min-h-[140px]", bgClass, spans[i])}>
                  <h3 className="text-base font-semibold mb-1.5">{item.label}</h3>
                  <p className={cn("text-sm leading-relaxed", descClass)}>{item.desc}</p>
                </motion.div>);

            })}
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ═══ */}
      <section className="py-24 md:py-32 bg-secondary text-secondary-foreground">
        <div className="container mx-auto max-w-4xl px-6">
          <motion.div {...fadeUp()} className="mb-16">
            <h2 className="heading-md text-balance">{t('about.timelineTitle')}</h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-px bg-secondary-foreground/15 md:-translate-x-px" />
            {timelineSteps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={cn("relative grid md:grid-cols-2 gap-4 md:gap-12 mb-12 last:mb-0", "pl-14 md:pl-0")}>
                  <div className="absolute left-[16px] md:left-1/2 top-1 md:top-2 w-[15px] h-[15px] rounded-full border-[3px] border-primary bg-secondary md:-translate-x-1/2 z-10" />
                  <div className={cn("bg-secondary-foreground/5 border border-secondary-foreground/10 rounded-xl p-6", isLeft ? "md:col-start-1" : "md:col-start-2")}>
                    <span className="text-primary text-sm font-semibold">{step.year}</span>
                    <h3 className="text-lg font-semibold mt-2 mb-2 text-secondary-foreground">{step.title}</h3>
                    <p className="text-secondary-foreground/60 leading-relaxed text-sm text-balance">{step.text}</p>
                  </div>
                  {isLeft && <div className="hidden md:block md:col-start-2" />}
                  {!isLeft && <div className="hidden md:block md:col-start-1 md:row-start-1" />}
                </motion.div>);

            })}
          </div>
        </div>
      </section>

      {/* ═══ INTEGRITY ═══ */}
      <section className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp()} className="mb-16">
            <h2 className="heading-md text-foreground text-balance">{t('about.integrityTitle')}</h2>
          </motion.div>
          <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12">
            <motion.div {...fadeUp()} className="flex md:flex-col gap-2">
              {sequenceItems.map((item, i) =>
              <button key={i} onClick={() => setActiveSeq(i)}
              className={cn("text-left px-5 py-4 rounded-xl transition-all duration-300 group",
              activeSeq === i ? "bg-secondary text-secondary-foreground" : "hover:bg-muted text-muted-foreground")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                  activeSeq === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{i + 1}</div>
                    <span className={cn("text-sm font-medium transition-colors",
                  activeSeq === i ? "text-secondary-foreground" : "text-muted-foreground")}>{item.title}</span>
                  </div>
                </button>
              )}
            </motion.div>
            <motion.div {...fadeUp(0.1)} className="relative min-h-[240px]">
              <AnimatePresence mode="wait">
                <motion.div key={activeSeq} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-muted/40 border border-border rounded-2xl p-10 md:p-12">
                  <h3 className="heading-sm text-foreground mb-4">{sequenceItems[activeSeq].title}</h3>
                  <p className="body-md text-muted-foreground">{sequenceItems[activeSeq].desc}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <PreFooterCTA
        headline={<>{t('about.ctaHeadline1')}<br /><span className="text-primary">{t('about.ctaHeadline2')}</span></>}
        subtitle={t('about.ctaSubtitle')}
        primaryLabel={t('about.ctaPrimaryLabel')}
        primaryTo="/contact"
        secondaryLabel={t('about.ctaSecondaryLabel')}
        secondaryTo="/register" />
      

      <Footer />
    </div>);

};

export default About;