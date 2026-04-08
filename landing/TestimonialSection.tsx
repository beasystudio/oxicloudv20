import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import img1 from '@/assets/testimonials/testimonial-1.jpg';
import img2 from '@/assets/testimonials/testimonial-2.jpg';
import img3 from '@/assets/testimonials/testimonial-3.jpg';

const ROTATE_DURATION = 6000;

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'We used to spend hours every week chasing data, answering agencies, and supporting nitrogen reports without getting paid for it. With OxiCloud, that entire process is structured and handled in minutes. It finally feels like our time is respected again.',
    name: 'Arthur Frederic Narusberk',
    role: 'Architect',
    company: 'SOMA',
    image: img1,
  },
  {
    quote: 'The nitrogen regulations are complex and constantly evolving. Before OxiCloud, we were never fully confident that everything was correct. Now we generate compliant reports instantly and know they\'re ready for submission. That peace of mind is huge.',
    name: 'Steven Broos',
    role: 'Project Architect',
    company: '',
    image: img2,
  },
  {
    quote: 'OxiCloud gives us control back. Instead of reacting to requests from agencies and consultants, we manage the process ourselves. What used to be weeks of back-and-forth is now a clear workflow we can handle in-house.',
    name: 'Boud Van Weert',
    role: 'Managing Partner',
    company: '',
    image: img3,
  },
];

export const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

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
          Trusted by 20+ early users
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
                    {active.role}{active.company ? ` · ${active.company}` : ''}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

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
