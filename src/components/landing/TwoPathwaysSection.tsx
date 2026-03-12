import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
export const TwoPathwaysSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px"
  });
  return <section className="poster-black section-padding">
      <div className="container mx-auto px-6 lg:px-8" ref={ref}>
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={isInView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.6
      }} className="text-center mb-16">
          <h2 className="heading-md text-secondary-foreground mb-4">Choose your entry point</h2>
          <p className="body-md text-secondary-foreground/60 max-w-2xl mx-auto">
            Whether you're submitting projects or reviewing them, OxiCloud is built to work with you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* For Architects */}
          <motion.div initial={{
          opacity: 0,
          x: -40
        }} animate={isInView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.7,
          delay: 0.2
        }}>
            <Link to="/for-architects" className="block group">
              <div className="relative glass-card-strong rounded-lg p-8 lg:p-10 h-full border border-secondary-foreground/10 hover:border-primary/50 transition-all duration-300 hover-lift">
                <span className="overline text-primary">For Design Teams</span>
                <h3 className="text-2xl font-semibold mt-4 mb-6 text-secondary">
                  Stop losing money on compliance work
                </h3>
                <p className="mb-8 leading-relaxed text-secondary">
                  OxiCloud's Partnership Program ensures you're compensated for environmental 
                  validation — not just delivering projects, but getting paid for the regulatory heavy lifting.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {['Priority platform access', 'Dedicated workflow support', 'Participation in settlement program', 'Know exactly what clients pay for'].map(item => <li key={item} className="flex items-center gap-3 text-sm text-secondary">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                      {item}
                    </li>)}
                </ul>

                <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                  Explore Partnership Program
                  <span className="text-lg">→</span>
                </span>
              </div>
            </Link>
          </motion.div>

          {/* For Authorities */}
          <motion.div initial={{
          opacity: 0,
          x: 40
        }} animate={isInView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.7,
          delay: 0.3
        }}>
            <Link to="/for-authorities" className="block group">
              <div className="relative bg-primary/10 rounded-lg p-8 lg:p-10 h-full border border-primary/20 hover:border-primary/50 transition-all duration-300 hover-lift">
                <span className="overline text-primary">For Authorities</span>
                <h3 className="text-2xl font-semibold text-secondary-foreground mt-4 mb-6">
                  Validate faster without sacrificing rigor
                </h3>
                <p className="text-secondary-foreground/60 mb-8 leading-relaxed">
                  Review standardized environmental data. Make defensible decisions. 
                  Reduce review cycles. OxiCloud is the neutral infrastructure both sides can trust.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {['Automated compliance checks', 'Audit-trail documentation', 'Integration-ready workflows', 'Built for transparency'].map(item => <li key={item} className="flex items-center gap-3 text-secondary-foreground/70 text-sm">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                      {item}
                    </li>)}
                </ul>

                <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                  Book a Call
                  <span className="text-lg">→</span>
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>;
};