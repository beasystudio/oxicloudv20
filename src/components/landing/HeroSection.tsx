import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { AdvancedCTAButton, CTAButton } from './AdvancedCTAButton';
import { HeroProductDemo } from './HeroProductDemo';
import { useLanguage } from '@/i18n/LanguageContext';

/* ── Animation helper ── */
const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
});

/* ── Social proof stars ── */
const Stars = () => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-4 h-4 text-primary fill-primary" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const trustClients = [
  { name: 'Bureau Bouwtechniek', style: 'text-lg font-semibold tracking-wide', color: '#1a1a1a' },
  { name: 'ARCADIS', style: 'text-xl font-bold uppercase tracking-[0.15em]', color: '#e4002b' },
  { name: 'Gemeente Aarschot', style: 'text-lg font-medium italic', color: '#2d5f2d' },
  { name: 'Sweco', style: 'text-2xl font-bold tracking-tight', color: '#009639' },
  { name: 'Gemeente Leuven', style: 'text-lg font-medium italic', color: '#003d8f' },
  { name: 'ANTEA GROUP', style: 'text-xl font-bold uppercase tracking-[0.12em]', color: '#00a3e0' },
  { name: 'Stad Mechelen', style: 'text-lg font-medium italic', color: '#c41230' },
  { name: 'BURO II', style: 'text-xl font-bold uppercase tracking-[0.2em]', color: '#e85d00' },
  { name: 'Gemeente Herentals', style: 'text-lg font-medium italic', color: '#1b5e20' },
  { name: 'Tractebel', style: 'text-2xl font-bold tracking-tight', color: '#0072bc' },
  { name: 'Stad Turnhout', style: 'text-lg font-medium italic', color: '#8b0000' },
  { name: 'VK Architects', style: 'text-xl font-semibold tracking-wide', color: '#2c2c2c' },
  { name: 'Gemeente Mol', style: 'text-lg font-medium italic', color: '#006838' },
  { name: 'STRAMIEN', style: 'text-xl font-bold uppercase tracking-[0.15em]', color: '#d4a017' },
  { name: 'Stad Hasselt', style: 'text-lg font-medium italic', color: '#1a3c6e' },
];

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <>
      <section className="relative h-[100dvh] flex flex-col items-center justify-center bg-background px-6 overflow-hidden">
        <div className="flex flex-col items-center text-center max-w-[860px] mx-auto">
          <motion.a
            {...fadeUp(0.05)}
            href="#flanders-map"
            onClick={(e) => { e.preventDefault(); document.getElementById('flanders-map')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="flex flex-col items-center gap-2 mb-12 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Stars />
            <p className="text-sm text-muted-foreground font-medium">{t('hero.badge')}</p>
          </motion.a>

          <motion.h1
            {...fadeUp(0.15)}
            className="text-[42px] sm:text-[56px] md:text-[68px] font-semibold leading-[1.04] tracking-[-0.03em] text-foreground text-balance"
          >
            {t('hero.headline')}{' '}
            <br className="hidden md:block" />
            {t('hero.headlineBr')}
          </motion.h1>

          <motion.p
            {...fadeUp(0.3)}
            className="mt-8 text-muted-foreground text-base md:text-lg leading-relaxed max-w-[520px] text-balance"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            {...fadeUp(0.45)}
            className="flex flex-col sm:flex-row items-center gap-4 mt-12"
          >
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium overflow-hidden transition-shadow duration-300 hover:shadow-lg"
            >
              <span className="relative overflow-hidden h-[1.2em] inline-flex items-center">
                <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
                  {t('hero.ctaPrimary')}
                </span>
                <span className="absolute top-full left-0 block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
                  {t('hero.ctaPrimary')}
                </span>
              </span>
            </Link>

            <a
              href="#product-demo"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('product-demo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center h-[46px] min-w-[170px] px-6 rounded-full text-sm font-medium text-foreground bg-muted/50 hover:bg-muted transition-all duration-300"
            >
              {t('hero.ctaSecondary')}
            </a>
          </motion.div>

          <motion.div
            {...fadeUp(0.55)}
            className="mt-14 w-full max-w-[700px] mx-auto flex items-center gap-6"
          >
            <p className="text-xs text-muted-foreground/50 leading-tight shrink-0 max-w-[100px]">
              {t('hero.trustLabel')}
            </p>
            <div className="relative overflow-hidden flex-1">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
              <div className="flex animate-marquee items-center">
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex items-center shrink-0">
                    {trustClients.map((client, i) => (
                      <span
                        key={`${setIndex}-${i}`}
                        className={`shrink-0 mx-8 whitespace-nowrap transition-colors duration-300 cursor-default ${client.style}`}
                        style={{ color: 'hsl(var(--foreground) / 0.25)' }}
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.color = client.color; }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'hsl(var(--foreground) / 0.25)'; }}
                      >
                        {client.name}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="product-demo" className="relative min-h-[100dvh] flex items-center justify-center bg-background px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease }}
          className="w-full max-w-[1080px] mx-auto"
        >
          <HeroProductDemo />
        </motion.div>
      </section>
    </>
  );
};
