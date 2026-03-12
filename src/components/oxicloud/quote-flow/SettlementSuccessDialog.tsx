/**
 * Settlement Success Dialog
 * Confirmation popup after invoice is sent successfully
 */

import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PartyPopper } from "lucide-react";

interface SettlementSuccessDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettlementSuccessDialog({
  open,
  onClose
}: SettlementSuccessDialogProps) {
  // Auto-close after 4 seconds
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md text-center">
        <div className="py-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
            <PartyPopper className="h-8 w-8 text-primary" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Invoice Sent Successfully!</h2>
          
          <p className="text-muted-foreground text-sm mb-6">
            Your partner share invoice has been sent to OxiCloud. We will notify you once the payment reaches your bank account.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-primary mb-6">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settlement claim submitted</span>
          </div>

          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
