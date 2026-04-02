import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const NOX_STEPS = [
  { key: 'input_incomplete', label: 'Data' },
  { key: 'input_completed', label: 'Input' },
  { key: 'price_generated', label: 'Price' },
  { key: 'awaiting_payment', label: 'Payment' },
  { key: 'paid', label: 'Paid' },
  { key: 'report_in_progress', label: 'Report' },
  { key: 'report_delivered', label: 'Delivered' },
];

const STATUS_ORDER = NOX_STEPS.map(s => s.key);

interface NoxStepProgressProps {
  currentStatus: string;
}

export function NoxStepProgress({ currentStatus }: NoxStepProgressProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-3 left-4 right-4 h-px bg-border" />
        
        {NOX_STEPS.map((step, i) => {
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
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
