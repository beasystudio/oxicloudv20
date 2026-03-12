import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreateQuoteDialog } from './CreateQuoteDialog';
import { QuotePaymentFlow } from './QuotePaymentFlow';
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle,
  Euro,
  ArrowRight,
  Loader2,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import type { Quote, QuoteStatus } from '@/types/payment';

interface ProjectQuotePanelProps {
  projectId: string;
  projectName: string;
  companyId: string;
  estimatedAmount: number;
  onPaymentComplete: () => void;
}

export function ProjectQuotePanel({
  projectId,
  projectName,
  companyId,
  estimatedAmount,
  onPaymentComplete
}: ProjectQuotePanelProps) {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, [projectId]);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes((data || []) as Quote[]);
    } catch (error: any) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuoteCreated = (quoteId: string) => {
    fetchQuotes();
    setSelectedQuoteId(quoteId);
  };

  const handlePaymentComplete = () => {
    fetchQuotes();
    setSelectedQuoteId(null);
    onPaymentComplete();
  };

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-muted"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20"><Send className="h-3 w-3 mr-1" />Awaiting Payment</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'expired':
        return <Badge variant="destructive"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // If viewing a specific quote payment flow
  if (selectedQuoteId) {
    return (
      <QuotePaymentFlow
        quoteId={selectedQuoteId}
        onPaymentComplete={handlePaymentComplete}
        onBack={() => setSelectedQuoteId(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeQuote = quotes.find(q => q.status !== 'cancelled' && q.status !== 'expired');
  const paidQuote = quotes.find(q => q.status === 'paid');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Client Quotes & Payment
            </CardTitle>
            <CardDescription>
              Create and manage quotes for your client
            </CardDescription>
          </div>
          {!paidQuote && (
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Quote
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-2">No quotes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a quote to send to your client for this project assessment.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Quote
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div 
                key={quote.id} 
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{quote.quote_number}</span>
                    {getStatusBadge(quote.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    To: {quote.client_contact_name} • Created {format(new Date(quote.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      €{Number(quote.total_amount).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      incl. VAT
                    </div>
                  </div>
                  {quote.status !== 'paid' && quote.status !== 'cancelled' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedQuoteId(quote.id)}
                      className="gap-2"
                    >
                      Manage
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  {quote.status === 'paid' && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Payment Received
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            How it works
          </h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Create a quote for your client</li>
            <li>Send the quote with a payment link to the client</li>
            <li>Client pays directly to OxiCloud</li>
            <li>Calculation module unlocks for detailed NOx assessment</li>
            <li>Your company receives a commission notification</li>
          </ol>
        </div>
      </CardContent>

      <CreateQuoteDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projectId={projectId}
        projectName={projectName}
        companyId={companyId}
        estimatedAmount={estimatedAmount}
        onQuoteCreated={handleQuoteCreated}
      />
    </Card>
  );
}
