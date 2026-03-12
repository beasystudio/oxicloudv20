import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  ArrowLeft, 
  Lock, 
  CheckCircle, 
  Loader2, 
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import type { Quote } from '@/types/payment';

interface QuotePaymentFlowProps {
  quoteId: string;
  onPaymentComplete: () => void;
  onBack: () => void;
}

export function QuotePaymentFlow({ quoteId, onPaymentComplete, onBack }: QuotePaymentFlowProps) {
  const { toast } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  useEffect(() => {
    fetchQuote();
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) throw error;
      setQuote(data as Quote);
      setPaymentLink(data.payment_link);
    } catch (error: any) {
      console.error('Failed to fetch quote:', error);
      toast({
        title: "Error",
        description: "Failed to load quote details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendQuote = async () => {
    if (!quote) return;
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { quote_id: quoteId },
        headers: { 'x-action': 'initiate' }
      });

      // Try alternative path approach
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment/initiate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ quote_id: quoteId })
        }
      );

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);

      setPaymentLink(result.payment_link);
      
      toast({
        title: "Quote Sent",
        description: "Payment link has been generated"
      });

      // Refresh quote data
      fetchQuote();

    } catch (error: any) {
      console.error('Failed to send quote:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send quote",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!quote) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment/simulate-success`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ quote_id: quoteId })
        }
      );

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);

      toast({
        title: "Payment Successful",
        description: "The calculation module has been unlocked. Commission email sent."
      });

      onPaymentComplete();

    } catch (error: any) {
      console.error('Payment simulation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Payment simulation failed",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center p-12">
        <p className="text-muted-foreground">Quote not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const isExpired = new Date(quote.valid_until) < new Date();
  const isPaid = quote.status === 'paid';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quote Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quote {quote.quote_number}
            </CardTitle>
            <Badge variant={isPaid ? 'default' : isExpired ? 'destructive' : 'secondary'}>
              {isPaid ? 'Paid' : isExpired ? 'Expired' : quote.status.toUpperCase()}
            </Badge>
          </div>
          <CardDescription>
            For: {quote.client_contact_name} ({quote.client_contact_email})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Amount</span>
            <span>€{Number(quote.amount).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT (21%)</span>
            <span>€{Number(quote.vat_amount).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total Due</span>
            <span>€{Number(quote.total_amount).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Valid until: {new Date(quote.valid_until).toLocaleDateString('nl-NL')}
              {isExpired && <span className="text-destructive ml-2">(Expired)</span>}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      {!isPaid && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment
            </CardTitle>
            <CardDescription>
              {paymentLink 
                ? "Quote has been sent. Waiting for client payment."
                : "Send quote to client to receive payment."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentLink ? (
              <div className="space-y-4">
                {/* Locked Module Warning */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Lock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-700 dark:text-amber-400">Calculation Module Locked</h4>
                      <p className="text-sm text-muted-foreground">
                        The detailed NOx assessment form will unlock once the client completes payment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Payment Link (sent to client):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background p-2 rounded border truncate">
                      {paymentLink}
                    </code>
                    <Button variant="outline" size="sm" asChild>
                      <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Demo Mode: Simulate client payment to unlock the calculation module
                  </p>
                  <Button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing || isExpired}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Simulate Successful Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Secure Payment via OxiCloud</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send the quote to generate a payment link for the client.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {isPaid && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Payment Complete</h3>
              <p className="text-sm text-muted-foreground">
                The calculation module has been unlocked. 
                A commission notification has been sent to the company.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        {!paymentLink && !isPaid && (
          <Button 
            onClick={handleSendQuote}
            className="flex-1 gap-2"
            disabled={isProcessing || isExpired}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Send Quote & Generate Payment Link
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
