/**
 * Payment Success Dialog
 * Shown after successful payment simulation
 */

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
 import { PartyPopper, ArrowRight, Apple } from "lucide-react";

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
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Success hero */}
        <div className="pt-10 pb-6 px-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 animate-in zoom-in duration-300">
            <PartyPopper className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Payment Successful!</h2>
          <p className="text-sm text-muted-foreground">
            {projectName ? `Payment received for ${projectName}` : 'Your payment has been processed'}
          </p>
        </div>

        {/* Next step + CTA */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center gap-3 p-3.5 bg-muted/40 rounded-xl">
             <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
               <Apple className="h-4 w-4 text-primary" />
             </div>
            <div>
              <p className="text-xs font-medium">Next Step</p>
              <p className="text-[11px] text-muted-foreground">
                Complete the NOₓ Assessment to finalize your project.
              </p>
            </div>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-11 gap-2">
            Continue to Project
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
