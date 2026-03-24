import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const faqs = [
  {
    question: 'Does the government accept OxiCloud reports?',
    answer: 'Yes. OxiCloud is built on the official Nitrogen Decree, applicable PAS regulations, and VITO\'s methodological guidelines. The generated reports follow the exact format and required calculation structure for submission via the Omgevingsloket. To date, no OxiCloud reports have been rejected on grounds of conformity or methodology.',
  },
  {
    question: 'Can I use OxiCloud without an environmental background?',
    answer: 'Yes. OxiCloud is specifically designed for architects and project managers without specialised environmental training. You enter basic project data — address, built surface area, building category, and location relative to Natura 2000 areas. OxiCloud processes this automatically, performs the required nitrogen calculations, and generates a complete, ready-to-submit report.',
  },
  {
    question: 'Does OxiCloud stay up to date with regulatory changes?',
    answer: 'Yes. The OxiCloud team continuously monitors all changes to the Nitrogen Decree, PAS regulations, and VITO guidelines. When legislation changes, the platform is updated automatically — without you having to do anything. Every report you generate complies with the currently applicable regulations.',
  },
  {
    question: 'How is our project data secured and stored?',
    answer: 'All project data is stored and transmitted encrypted. OxiCloud is fully compliant with European GDPR. A-Spine BV (Belgium) acts as data controller. Your data is stored exclusively on Belgian servers and is never shared with or sold to third parties. You remain the owner of your project data.',
  },
];

export const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 px-6 bg-muted/30">
      <div className="container mx-auto max-w-3xl" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">FAQ</h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-background rounded-2xl overflow-hidden border border-border/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl text-primary flex-shrink-0"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
