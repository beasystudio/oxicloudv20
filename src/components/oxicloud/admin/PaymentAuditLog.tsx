import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  CreditCard, 
  Mail, 
  Unlock, 
  CheckCircle,
  Search,
  Loader2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import type { PaymentAuditLog } from '@/types/payment';

const EVENT_ICONS: Record<string, React.ReactNode> = {
  quote_created: <FileText className="h-4 w-4" />,
  quote_sent: <Mail className="h-4 w-4" />,
  quote_paid: <CreditCard className="h-4 w-4" />,
  quote_expired: <Clock className="h-4 w-4" />,
  quote_cancelled: <FileText className="h-4 w-4" />,
  calculation_unlocked: <Unlock className="h-4 w-4" />,
  commission_email_sent: <Mail className="h-4 w-4" />,
  invoice_received: <FileText className="h-4 w-4" />,
  commission_paid: <CheckCircle className="h-4 w-4" />,
  payment_webhook_received: <CreditCard className="h-4 w-4" />,
};

const EVENT_LABELS: Record<string, string> = {
  quote_created: 'Quote Created',
  quote_sent: 'Quote Sent',
  quote_paid: 'Quote Paid',
  quote_expired: 'Quote Expired',
  quote_cancelled: 'Quote Cancelled',
  calculation_unlocked: 'Calculation Unlocked',
  commission_email_sent: 'Commission Email Sent',
  invoice_received: 'Invoice Received',
  commission_paid: 'Commission Paid',
  payment_webhook_received: 'Payment Received',
};

const EVENT_COLORS: Record<string, string> = {
  quote_created: 'bg-blue-500',
  quote_sent: 'bg-purple-500',
  quote_paid: 'bg-green-500',
  quote_expired: 'bg-red-500',
  quote_cancelled: 'bg-gray-500',
  calculation_unlocked: 'bg-primary',
  commission_email_sent: 'bg-orange-500',
  invoice_received: 'bg-cyan-500',
  commission_paid: 'bg-emerald-500',
  payment_webhook_received: 'bg-green-600',
};

export function PaymentAuditLog() {
  const [logs, setLogs] = useState<PaymentAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data || []) as PaymentAuditLog[]);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.event_type.toLowerCase().includes(searchLower) ||
      log.company_id?.toLowerCase().includes(searchLower) ||
      log.quote_id?.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.event_data).toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Audit Log</CardTitle>
        <CardDescription>
          Complete history of all payment-related events for compliance tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? 'No matching events found' : 'No audit events recorded yet'}
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${EVENT_COLORS[log.event_type] || 'bg-gray-500'}`}>
                    {EVENT_ICONS[log.event_type] || <FileText className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {EVENT_LABELS[log.event_type] || log.event_type}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.event_type}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      {log.company_id && (
                        <div>Company: <span className="font-mono">{log.company_id}</span></div>
                      )}
                      {log.quote_id && (
                        <div>Quote: <span className="font-mono text-xs">{log.quote_id}</span></div>
                      )}
                      {log.event_data && Object.keys(log.event_data).length > 0 && (
                        <div className="text-xs bg-muted p-2 rounded mt-2 font-mono">
                          {JSON.stringify(log.event_data, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
