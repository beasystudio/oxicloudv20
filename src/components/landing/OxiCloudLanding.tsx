import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { Footer } from './Footer';
import { TestimonialSection } from './TestimonialSection';
import { FAQSection } from './FAQSection';
import { PreFooterCTA } from './PreFooterCTA';
import { FlandersInteractiveMap } from './flanders-map';
import { useLanguage } from '@/i18n/LanguageContext';

export const OxiCloudLanding = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />

      {/* ── Flanders Map ── */}
      <FlandersInteractiveMap />

      {/* ── Testimonials ── */}
      <TestimonialSection />

      {/* ── FAQ ── */}
      

      {/* ── CTA Band ── */}
      <PreFooterCTA
        headline={<>{t('homepage.ctaHeadline')}<br /> <span className="text-primary">{t('homepage.ctaHighlight')}</span></>}
        subtitle={t('homepage.ctaSubtitle')}
        primaryLabel={t('homepage.ctaPrimary')}
        primaryTo="/register"
        secondaryLabel={t('homepage.ctaSecondary')}
        secondaryTo="/for-architects" />
      

      <Footer />
    </div>);

};