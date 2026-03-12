/**
 * Payment Success Dialog
 * Shown after successful payment simulation, redirecting user to home dashboard
 */

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PartyPopper, ArrowRight } from "lucide-react";

interface PaymentSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName?: string;
}

export function PaymentSuccessDialog({
  open,
  onOpenChange,
  projectName
}: PaymentSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Success header */}
        <div className="bg-primary/10 p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
            <PartyPopper className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-1">Payment Successful!</h2>
          <p className="text-sm text-muted-foreground">
            {projectName ? `Payment received for ${projectName}` : 'Your payment has been processed'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Next Steps</p>
              <p className="text-xs text-muted-foreground mt-1">
                Complete the NOₓ Assessment to finalize your project.
              </p>
            </div>
          </div>

          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full gap-2"
          >
            Continue to Project
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
