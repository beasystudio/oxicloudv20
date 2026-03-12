import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageEditorialProps {
  imageSrc: string;
  imageAlt: string;
  overline?: string;
  headline: string;
  body: string;
  accentPosition?: 'top' | 'middle' | 'bottom';
  imagePosition?: 'left' | 'right';
  className?: string;
}

export const ImageEditorial = ({
  imageSrc,
  imageAlt,
  overline,
  headline,
  body,
  accentPosition = 'middle',
  imagePosition = 'left',
  className
}: ImageEditorialProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section 
      ref={ref}
      className={cn('section-padding bg-background relative overflow-hidden', className)}
    >
      {/* Green accent band */}
      <div className={cn(
        'absolute left-0 right-0 h-24 bg-primary/10',
        accentPosition === 'top' && 'top-[20%]',
        accentPosition === 'middle' && 'top-1/2 -translate-y-1/2',
        accentPosition === 'bottom' && 'bottom-[20%]'
      )} />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className={cn(
          'grid lg:grid-cols-2 gap-12 lg:gap-20 items-center',
          imagePosition === 'right' && 'lg:grid-flow-col-dense'
        )}>
          {/* Image */}
          <motion.div
            style={{ y: imageY }}
            className={cn(
              'relative',
              imagePosition === 'right' && 'lg:col-start-2'
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <img 
                src={imageSrc} 
                alt={imageAlt}
                className="w-full h-auto rounded-lg"
              />
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-lg" />
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: imagePosition === 'left' ? 40 : -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              imagePosition === 'right' && 'lg:col-start-1 lg:row-start-1'
            )}
          >
            {overline && (
              <p className="overline text-primary mb-6">{overline}</p>
            )}
            <h2 className="heading-md text-foreground mb-6">{headline}</h2>
            <p className="body-lg text-muted-foreground">{body}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
