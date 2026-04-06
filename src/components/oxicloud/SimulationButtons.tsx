/**
 * Simulation Buttons — Dev/demo tools for simulating client actions
 * Styled with dashed borders to clearly indicate they are not part of the real UI
 */

import { Button } from '@/components/ui/button';
import { Zap, PenLine, CreditCard } from 'lucide-react';

interface SimulationButtonsProps {
  showSignButton?: boolean;
  showPaymentButton?: boolean;
  onSimulateSigned?: () => void;
  onSimulatePayment?: () => void;
}

export function SimulationButtons({
  showSignButton = false,
  showPaymentButton = false,
  onSimulateSigned,
  onSimulatePayment,
}: SimulationButtonsProps) {
  if (!showSignButton && !showPaymentButton) return null;

  return (
    <div className="border border-dashed border-muted-foreground/30 rounded-xl p-4 space-y-3">
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
        Simulation Controls
      </p>
      <div className="flex flex-wrap gap-2">
        {showSignButton && onSimulateSigned && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSimulateSigned}
            className="gap-2 border-dashed border-muted-foreground/30 text-muted-foreground text-xs"
          >
            <PenLine className="h-3.5 w-3.5" />
            Simulate client signed
          </Button>
        )}
        {showPaymentButton && onSimulatePayment && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSimulatePayment}
            className="gap-2 border-dashed border-muted-foreground/30 text-muted-foreground text-xs"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Simulate payment received
          </Button>
        )}
      </div>
    </div>
  );
}
