import { cn } from '@/lib/utils';
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

        return (
          <div key={label} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium border',
                  isCompleted && 'bg-foreground text-background border-foreground',
                  isCurrent && 'bg-background text-foreground border-foreground',
                  !isCompleted && !isCurrent && 'bg-background text-muted-foreground border-border'
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] text-center leading-tight max-w-[80px]',
                  isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-2',
                  i < currentStep ? 'bg-foreground' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
