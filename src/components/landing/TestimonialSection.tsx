import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

import img1 from '@/assets/testimonials/testimonial-1.jpg';
import img2 from '@/assets/testimonials/testimonial-2.jpg';
import img3 from '@/assets/testimonials/testimonial-3.jpg';
import img4 from '@/assets/testimonials/testimonial-4.jpg';
import img5 from '@/assets/testimonials/testimonial-5.jpg';

const ROTATE_DURATION = 5000;

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  image: string;
}

const getTestimonials = (t: (key: string) => string): Testimonial[] => [
  { quote: t('testimonials.quote1'), name: 'Kristof Willems', role: 'Managing Partner', company: 'Willems & Cooreman Architecten', image: img1 },
  { quote: t('testimonials.quote2'), name: 'Eline Van Damme', role: 'Architect', company: 'Studio Lumen', image: img2 },
  { quote: t('testimonials.quote3'), name: 'Bram Peeters', role: 'Project Manager', company: 'Groep Hendrix', image: img3 },
  { quote: t('testimonials.quote4'), name: 'Nadia El Amrani', role: 'Founder', company: 'Atelier Noor', image: img4 },
  { quote: t('testimonials.quote5'), name: 'Thomas Claes', role: 'Environmental Advisor', company: 'Gemeente Lier', image: img5 },
  { quote: t('testimonials.quote6'), name: 'Sofie Janssen', role: 'Senior Architect', company: 'BURO Vier', image: img2 },
  { quote: t('testimonials.quote7'), name: 'Pieter De Smedt', role: 'Director', company: 'De Smedt Architectuur', image: img1 },
  { quote: t('testimonials.quote8'), name: 'Lies Verhoeven', role: 'Technical Lead', company: 'Verhoeven & Partners', image: img4 },
  { quote: t('testimonials.quote9'), name: 'Marc Goossens', role: 'Partner', company: 'Goossens Architects', image: img3 },
  { quote: t('testimonials.quote10'), name: 'Jan-Willem Hoste', role: 'Managing Director', company: 'Hoste Group', image: img5 },
];

export const TestimonialSection = () => {
  const { t } = useLanguage();
  const testimonials = getTestimonials(t);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const timer = setInterval(goNext, ROTATE_DURATION);
    return () => clearInterval(timer);
  }, [goNext]);

  const active = testimonials[activeIndex];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section className="py-24 md:py-32 px-6 bg-background overflow-hidden">
      <div className="container mx-auto max-w-4xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground/60 text-xs uppercase tracking-[0.15em] mb-12"
        >
          {t('testimonials.title')}
        </motion.p>

        <div className="relative min-h-[280px] md:min-h-[240px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            >
              <blockquote className="text-xl md:text-2xl lg:text-3xl font-medium text-foreground leading-snug tracking-tight max-w-3xl text-balance mb-10">
                &ldquo;{active.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                <img
                  src={active.image}
                  alt={active.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-background shadow-md"
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{active.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {active.role} · {active.company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={goPrev}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/50 hover:text-foreground hover:border-foreground/40 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > activeIndex ? 1 : -1);
                  setActiveIndex(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'bg-primary w-4' : 'bg-foreground/15 hover:bg-foreground/30'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/50 hover:text-foreground hover:border-foreground/40 transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
