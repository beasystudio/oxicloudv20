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

      {/* ── Government CTA ── */}
      <section className="py-16 px-6 bg-muted/30 border-t border-border">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground text-base mb-6">
            {language === 'nl' ? 'Overheid of milieuautoriteit?' : 'Government or environmental authority?'}
          </p>
          <a
            href="/government-register"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6"
          >
            {language === 'nl' ? 'Toegang aanvragen' : 'Request access'}
          </a>
        </div>
      </section>

      <Footer />
    </div>);

};