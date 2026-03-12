import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@/components/icons/OxiIcons';

const benefits = [
  {
    title: 'Get Paid for Compliance Work',
    target: 'For Architects',
    description: 'Stop treating regulatory documentation as a cost center. OxiCloud\'s Partnership Program ensures design teams are compensated for every validated project.',
    link: '/for-architects',
    linkText: 'See partnership details',
    variant: 'black' as const
  },
  {
    title: 'Faster Permits, Fewer Rejections',
    target: 'For Projects',
    description: 'Automated validation. Standardized reports. Clear data that authorities trust. No more endless revisions or re-submissions.',
    link: '/for-architects',
    linkText: 'View approval timeline',
    variant: 'green' as const
  },
  {
    title: 'Review Smart, Decide Fast',
    target: 'For Authorities',
    description: 'Stop chasing incomplete data. Access standardized environmental analysis you can defend. The neutral layer that makes your job easier.',
    link: '/for-authorities',
    linkText: 'Learn more',
    variant: 'glass' as const
  }
];

export const BenefitsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getCardStyles = (variant: 'black' | 'green' | 'glass') => {
    switch (variant) {
      case 'black':
        return 'editorial-card-black';
      case 'green':
        return 'editorial-card-green';
      default:
        return 'glass-card-strong glass-hover';
    }
  };

  const getTextStyles = (variant: 'black' | 'green' | 'glass') => {
    switch (variant) {
      case 'black':
        return {
          badge: 'bg-primary/20 text-primary',
          title: 'text-secondary-foreground',
          description: 'text-secondary-foreground/70',
          link: 'text-primary'
        };
      case 'green':
        return {
          badge: 'bg-primary-foreground/20 text-primary-foreground',
          title: 'text-primary-foreground',
          description: 'text-primary-foreground/80',
          link: 'text-primary-foreground'
        };
      default:
        return {
          badge: 'bg-muted text-muted-foreground',
          title: 'text-foreground',
          description: 'text-muted-foreground',
          link: 'text-foreground'
        };
    }
  };

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="heading-md text-foreground">
            The compliance model that actually makes sense
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const cardStyles = getCardStyles(benefit.variant);
            const textStyles = getTextStyles(benefit.variant);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group relative p-8 transition-all duration-300 hover-lift cursor-pointer ${cardStyles}`}
              >
                {/* Badge */}
                <div className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-6 ${textStyles.badge}`}>
                  {benefit.target}
                </div>

                <div className="space-y-4">
                  <h3 className={`text-xl font-semibold transition-colors ${textStyles.title}`}>
                    {benefit.title}
                  </h3>
                  <p className={`leading-relaxed ${textStyles.description}`}>
                    {benefit.description}
                  </p>
                  <div className="pt-2">
                    <Link 
                      to={benefit.link}
                      className={`inline-flex items-center gap-2 text-sm font-medium group/link ${textStyles.link}`}
                    >
                      {benefit.linkText}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
