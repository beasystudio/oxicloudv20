import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { VideoSection } from './VideoSection';
import { ProblemSection } from './ProblemSection';
import { SolutionSection } from './SolutionSection';
import { HowItWorksSection } from './HowItWorksSection';
import { FlandersInteractiveMap } from './flanders-map';
import { FeaturesSection } from './FeaturesSection';
import { PricingSection } from './PricingSection';
import { TestimonialSection } from './TestimonialSection';
import { FAQSection } from './FAQSection';
import { Footer } from './Footer';

export const OxiCloudLanding = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <VideoSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FlandersInteractiveMap />
      <FeaturesSection />
      <PricingSection />
      <TestimonialSection />
      <FAQSection />
      <Footer />
    </div>
  );
};
