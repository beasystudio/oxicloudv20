/**
 * Self-Billing Agreement Dialog
 * Full legal agreement document for self-billing authorization
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface SelfBillingAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerCompanyName: string;
}

export function SelfBillingAgreementDialog({
  open,
  onOpenChange,
  partnerCompanyName
}: SelfBillingAgreementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Self-Billing Agreement</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <div className="text-center border-b pb-4">
              <h2 className="text-lg font-bold">SELF-BILLING AGREEMENT</h2>
              <p className="text-muted-foreground mt-2">
                Between A-Spine BV and {partnerCompanyName}
              </p>
            </div>

            <section>
              <h3 className="font-semibold mb-2">1. Parties</h3>
              <p className="text-muted-foreground">
                This Self-Billing Agreement ("Agreement") is entered into between:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li><strong className="text-foreground">A-Spine BV</strong> (hereinafter "Customer" or "Self-Billing Party")</li>
                <li><strong className="text-foreground">{partnerCompanyName}</strong> (hereinafter "Supplier" or "Partner")</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. Purpose</h3>
              <p className="text-muted-foreground">
                The purpose of this Agreement is to establish the conditions under which the Customer 
                will issue invoices on behalf of the Supplier for partner commission services rendered 
                through the OxiCloud platform.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Legal Basis</h3>
              <p className="text-muted-foreground">
                This self-billing arrangement is established in accordance with:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>EU VAT Directive 2006/112/EC, Article 224</li>
                <li>Belgian VAT Code, Royal Decree No. 1, Article 5</li>
                <li>EU Implementing Regulation No. 282/2011</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Scope of Agreement</h3>
              <p className="text-muted-foreground">
                Under this Agreement, the Customer is authorized to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Issue self-billing invoices on behalf of the Supplier</li>
                <li>Determine the correct VAT treatment for services rendered</li>
                <li>Maintain records of all self-billed invoices for the statutory retention period</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Supplier Obligations</h3>
              <p className="text-muted-foreground">
                The Supplier agrees to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Accept invoices issued by the Customer under this Agreement</li>
                <li>Not issue separate invoices for the same supplies</li>
                <li>Notify the Customer immediately of any changes to VAT registration or business details</li>
                <li>Review and approve each self-billed invoice through the OxiCloud platform</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Customer Obligations</h3>
              <p className="text-muted-foreground">
                The Customer agrees to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Issue invoices that comply with all applicable VAT legislation</li>
                <li>Provide the Supplier with a copy of each invoice for their records</li>
                <li>Process payments within the agreed payment terms (14 days)</li>
                <li>Maintain accurate records for audit and compliance purposes</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. Invoice Acceptance</h3>
              <p className="text-muted-foreground">
                Each self-billed invoice shall be deemed accepted by the Supplier unless objection 
                is raised within 5 business days of electronic delivery through the OxiCloud platform. 
                Electronic approval through the platform constitutes formal acceptance.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">8. Duration and Termination</h3>
              <p className="text-muted-foreground">
                This Agreement shall remain in force until terminated by either party with 30 days 
                written notice. Termination shall not affect invoices already issued under this Agreement.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">9. Governing Law</h3>
              <p className="text-muted-foreground">
                This Agreement shall be governed by and construed in accordance with Belgian law. 
                Any disputes arising from this Agreement shall be subject to the exclusive jurisdiction 
                of the courts of Belgium.
              </p>
            </section>

            <div className="border-t pt-4 mt-6">
              <p className="text-xs text-muted-foreground">
                By accepting this Agreement through the OxiCloud platform, both parties acknowledge 
                that they have read, understood, and agree to be bound by the terms and conditions 
                set forth herein.
              </p>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
