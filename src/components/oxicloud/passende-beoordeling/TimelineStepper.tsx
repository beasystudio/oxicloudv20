import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';

interface TimelineStepperProps {
  currentStep: number;
}

export function TimelineStepper({ currentStep }: TimelineStepperProps) {
  const { t } = useLanguage();

  const STEPS = [
    t('timelineStepper.quoteSent'),
    t('timelineStepper.paymentConfirmed'),
    t('timelineStepper.reportInProgress'),
    t('timelineStepper.reportDelivered'),
  ];

  return (
    <div className="flex items-center w-full gap-0">
      {STEPS.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isUpcoming = i > currentStep;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted
                    ? 'hsl(142 71% 45%)'
                    : isCurrent
                    ? 'hsl(78 90% 65%)'
                    : 'hsl(0 0% 90%)',
                  scale: isCurrent ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                  isCompleted && 'text-white',
                  isCurrent && 'text-foreground ring-2 ring-primary/30',
                  isUpcoming && 'text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-medium text-center leading-tight max-w-[80px]',
                  isCompleted && 'text-green-700',
                  isCurrent && 'text-foreground font-semibold',
                  isUpcoming && 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 rounded-full transition-colors duration-300',
                  i < currentStep ? 'bg-green-500' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}