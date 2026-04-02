import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const NOX_STEP_KEYS = [
  { key: 'input_incomplete', labelKey: 'noxStatus.stepData' },
  { key: 'input_completed', labelKey: 'noxStatus.stepInput' },
  { key: 'price_generated', labelKey: 'noxStatus.stepPrice' },
  { key: 'awaiting_payment', labelKey: 'noxStatus.stepPayment' },
  { key: 'paid', labelKey: 'noxStatus.stepPaid' },
  { key: 'report_in_progress', labelKey: 'noxStatus.stepReport' },
  { key: 'report_delivered', labelKey: 'noxStatus.stepDelivered' },
];

const STATUS_ORDER = NOX_STEP_KEYS.map(s => s.key);

interface NoxStepProgressProps {
  currentStatus: string;
}

export function NoxStepProgress({ currentStatus }: NoxStepProgressProps) {
  const { t } = useLanguage();
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-3 left-4 right-4 h-px bg-border" />
        
        {NOX_STEP_KEYS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 min-w-[40px]">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors',
                  isCompleted
                    ? 'bg-muted-foreground/40 text-background'
                    : isCurrent
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-[9px] mt-1.5 font-medium whitespace-nowrap',
                  isCurrent ? 'text-foreground font-semibold' : 
                  isCompleted ? 'text-foreground/70' : 'text-muted-foreground/60'
                )}
              >
                {t(step.labelKey)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
