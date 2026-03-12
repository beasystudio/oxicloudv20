import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@/components/icons/OxiIcons';

interface EditorialCard {
  badge?: string;
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  variant: 'white' | 'black' | 'green' | 'glass';
  tall?: boolean;
}

interface EditorialCardGridProps {
  cards: EditorialCard[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const EditorialCardGrid = ({ 
  cards, 
  columns = 3,
  className 
}: EditorialCardGridProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getCardStyles = (variant: EditorialCard['variant']) => {
    switch (variant) {
      case 'black':
        return 'editorial-card-black';
      case 'green':
        return 'editorial-card-green';
      case 'glass':
        return 'glass-card-strong glass-hover';
      default:
        return 'bg-card border border-border';
    }
  };

  const getTextStyles = (variant: EditorialCard['variant']) => {
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
          link: 'text-primary'
        };
    }
  };

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div 
      ref={ref}
      className={cn('grid gap-6', gridCols[columns], className)}
    >
      {cards.map((card, index) => {
        const cardStyles = getCardStyles(card.variant);
        const textStyles = getTextStyles(card.variant);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.1,
              ease: [0.16, 1, 0.3, 1]
            }}
            className={cn(
              'group p-8 rounded-lg transition-all duration-300 hover-lift cursor-pointer',
              cardStyles,
              card.tall && 'row-span-2'
            )}
          >
            {card.badge && (
              <div className={cn(
                'inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-6',
                textStyles.badge
              )}>
                {card.badge}
              </div>
            )}

            <div className="space-y-4">
              <h3 className={cn('text-xl font-semibold', textStyles.title)}>
                {card.title}
              </h3>
              <p className={cn('leading-relaxed', textStyles.description)}>
                {card.description}
              </p>
              
              {card.link && (
                <div className="pt-2">
                  <Link 
                    to={card.link}
                    className={cn(
                      'inline-flex items-center gap-2 text-sm font-medium group/link',
                      textStyles.link
                    )}
                  >
                    {card.linkText || 'Learn more'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
