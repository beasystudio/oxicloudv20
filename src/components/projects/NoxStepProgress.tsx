import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const NOX_STEP_KEYS = [
  { key: 'input_incomplete', labelKey: 'noxStatus.stepDraft' },
  { key: 'price_generated', labelKey: 'noxStatus.stepQuoteSent' },
  { key: 'paid', labelKey: 'noxStatus.stepSigned' },
  { key: 'report_in_progress', labelKey: 'noxStatus.stepNoxSubmitted' },
  { key: 'report_delivered', labelKey: 'noxStatus.stepReportHeld' },
];

// Map all possible statuses to the step index they represent
const STATUS_TO_STEP: Record<string, number> = {
  input_incomplete: 0,
  input_completed: 0,
  price_generated: 1,
  awaiting_payment: 1,
  paid: 2,
  report_in_progress: 3,
  report_delivered: 4,
};

interface NoxStepProgressProps {
  currentStatus: string;
}

export function NoxStepProgress({ currentStatus }: NoxStepProgressProps) {
  const { t } = useLanguage();
  const currentIndex = STATUS_TO_STEP[currentStatus] ?? 0;

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
