/**
 * Self-Billing Invoice Preview
 * Compact preview of the self-billing invoice with option to view full document
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ExternalLink, Building2 } from "lucide-react";
import { format } from "date-fns";

interface SelfBillingInvoicePreviewProps {
  invoiceNumber: string;
  projectReference: string;
  partnerCompanyName: string;
  partnerVatNumber: string;
  amount: number;
}

export function SelfBillingInvoicePreview({
  invoiceNumber,
  projectReference,
  partnerCompanyName,
  partnerVatNumber,
  amount
}: SelfBillingInvoicePreviewProps) {
  const [showFullDocument, setShowFullDocument] = useState(false);
  const currentDate = format(new Date(), 'dd/MM/yyyy');
  const vatAmount = 0; // Self-billing is typically VAT exempt for B2B
  const totalAmount = amount + vatAmount;

  return (
    <>
      {/* Preview Card */}
      <Card className="border-dashed">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Self-Billing Invoice Preview</p>
                <p className="text-xs text-muted-foreground font-mono">{invoiceNumber}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFullDocument(true)}
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              View Full Document
            </Button>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice Date:</span>
              <span>{currentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project Reference:</span>
              <span className="font-mono">{projectReference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supplier:</span>
              <span>{partnerCompanyName}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between font-medium">
                <span>Net Commission:</span>
                <span>€{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>VAT (0%):</span>
                <span>€{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base mt-2">
                <span>Total Payable:</span>
                <span>€{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Document Dialog */}
      <Dialog open={showFullDocument} onOpenChange={setShowFullDocument}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Self-Billing Invoice</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6 text-sm">
              {/* Header */}
              <div className="text-center border-b pb-6">
                <h2 className="text-xl font-bold mb-2">SELF-BILLING INVOICE</h2>
                <p className="text-muted-foreground">(PARTNER COMMISSION)</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Issued by A-spine BV on behalf of {partnerCompanyName}
                </p>
                <p className="text-xs text-muted-foreground">
                  In accordance with Article 224 of EU VAT Directive 2006/112/EC
                </p>
              </div>

              {/* 1. Parties */}
              <section>
                <h3 className="font-semibold mb-3">1. Parties</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium mb-2">Customer (Self-Billing Party / Debtor)</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p className="font-medium text-foreground">A-spine BV</p>
                      <p>Address: _________________________</p>
                      <p>Postcode & City: _________________</p>
                      <p>Country: Belgium</p>
                      <p>VAT No.: BE0XXX.XXX.XXX</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium mb-2">Supplier (Partner / Creditor)</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p className="font-medium text-foreground">{partnerCompanyName}</p>
                      <p>Address: _________________________</p>
                      <p>Postcode & City: _________________</p>
                      <p>Country: Belgium</p>
                      <p>VAT No.: {partnerVatNumber}</p>
                      <p>IBAN: BE00 XXXX XXXX XXXX</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Invoice Identification */}
              <section>
                <h3 className="font-semibold mb-3">2. Invoice Identification</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Invoice Number:</span>
                      <span className="ml-2 font-mono">{invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Project Reference:</span>
                      <span className="ml-2 font-mono">{projectReference}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Invoice Date:</span>
                      <span className="ml-2">{currentDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Service Period:</span>
                      <span className="ml-2">{currentDate} – {currentDate}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Description of Service */}
              <section>
                <h3 className="font-semibold mb-3">3. Description of Service</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium mb-2">Partner Commission / Facilitation Services – OxiCloud Platform</p>
                  <p className="text-muted-foreground">
                    This invoice relates to partner services provided by {partnerCompanyName} in connection with 
                    the introduction, facilitation, and platform participation for an environmental compliance 
                    project delivered by A-spine BV to the end client under the OxiCloud platform.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    No contractual or financial relationship exists between {partnerCompanyName} and the end 
                    client for this service.
                  </p>
                </div>
              </section>

              {/* 4. Amount */}
              <section>
                <h3 className="font-semibold mb-3">4. Amount</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Description</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">Net Commission</td>
                        <td className="text-right py-2">€{amount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-2">VAT</td>
                        <td className="text-right py-2">€{vatAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t font-bold">
                        <td className="py-2">Total Payable</td>
                        <td className="text-right py-2">€{totalAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 5. VAT Treatment */}
              <section>
                <h3 className="font-semibold mb-3">5. VAT Treatment</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground">
                    Belgian VAT at 21% applied in accordance with Belgian VAT Code.
                  </p>
                </div>
              </section>

              {/* 6. Payment Terms */}
              <section>
                <h3 className="font-semibold mb-3">6. Payment Terms</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p><span className="text-muted-foreground">Payment Method:</span> Bank Transfer</p>
                  <p><span className="text-muted-foreground">Beneficiary:</span> {partnerCompanyName}</p>
                  <p><span className="text-muted-foreground">IBAN:</span> BE00 XXXX XXXX XXXX</p>
                  <p><span className="text-muted-foreground">Payment Reference:</span> {invoiceNumber} / {projectReference}</p>
                  <p><span className="text-muted-foreground">Payment Term:</span> 14 days from invoice date</p>
                </div>
              </section>

              {/* 7. Self-Billing Declaration */}
              <section>
                <h3 className="font-semibold mb-3">7. Self-Billing Declaration</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <p className="text-muted-foreground">
                    This invoice was issued by A-spine BV under a valid self-billing agreement with {partnerCompanyName}.
                  </p>
                  <p className="text-muted-foreground">
                    {partnerCompanyName} confirms acceptance and approval of this invoice through electronic 
                    confirmation within the OxiCloud platform.
                  </p>
                  <div className="border-t pt-3 mt-3">
                    <p><span className="text-muted-foreground">Approval Timestamp:</span> ___ / ___ / {new Date().getFullYear()} – __:__ CET</p>
                    <p><span className="text-muted-foreground">Approval Reference:</span> {projectReference}</p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                    <p className="font-medium mb-2">This self-billing invoice complies with:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>EU VAT Directive 2006/112/EC, Articles 44, 196, and 224</li>
                      <li>Belgian VAT Code, Royal Decree No. 1, Article 5 (Self-Billing)</li>
                      <li>EU Implementing Regulation No. 282/2011</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
