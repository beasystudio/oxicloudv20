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
      <div className="flex items-center">
        {NOX_STEP_KEYS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === NOX_STEP_KEYS.length - 1;

          return (
            <div key={step.key} className={cn("flex items-center", !isLast && "flex-1")}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors',
                    isCompleted
                      ? 'bg-muted-foreground/40 text-background'
                      : isCurrent
                      ? 'bg-foreground text-background'
                      : 'bg-transparent text-muted-foreground'
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
              {!isLast && (
              <div className={cn(
                  "h-px flex-1 mx-1 -mt-4",
                  isCompleted ? "bg-muted-foreground/30" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
