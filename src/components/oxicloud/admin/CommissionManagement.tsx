import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getAllCompanies, Company } from '@/lib/mockCompanyDB';
import { Search, Clock, FileText, CheckCircle, AlertCircle, Euro, Building2, RefreshCw, Loader2, Percent, Save } from 'lucide-react';
import { format } from 'date-fns';

// Local storage key for company commission rates
const COMMISSION_RATES_KEY = 'oxicloud_commission_rates';
interface CompanyCommissionRate {
  companyId: string;
  percentage: number;
  updatedAt: string;
}
interface CommissionRecord {
  id: string;
  companyId: string;
  companyName: string;
  quoteNumber: string;
  projectName: string;
  quoteAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: 'pending_invoice' | 'invoice_received' | 'paid' | 'disputed';
  createdAt: string;
  invoiceReference?: string;
  paidAt?: string;
}

// Get commission rates from localStorage
const getCommissionRates = (): CompanyCommissionRate[] => {
  const stored = localStorage.getItem(COMMISSION_RATES_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save commission rates to localStorage
const saveCommissionRates = (rates: CompanyCommissionRate[]) => {
  localStorage.setItem(COMMISSION_RATES_KEY, JSON.stringify(rates));
};

// Get commission rate for a specific company
const getCommissionRateForCompany = (companyId: string): number => {
  const rates = getCommissionRates();
  const rate = rates.find(r => r.companyId === companyId);
  return rate?.percentage ?? 30; // Default 30%
};
export function CommissionManagement() {
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('settings');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [commissionRates, setCommissionRates] = useState<CompanyCommissionRate[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    loadData();
  }, []);
  const loadData = () => {
    setIsLoading(true);

    // Load companies
    const loadedCompanies = getAllCompanies();
    setCompanies(loadedCompanies);

    // Load commission rates
    const rates = getCommissionRates();

    // Ensure all companies have a rate entry
    const updatedRates = loadedCompanies.map(company => {
      const existing = rates.find(r => r.companyId === company.id);
      return existing || {
        companyId: company.id,
        percentage: 30,
        // Default
        updatedAt: new Date().toISOString()
      };
    });
    setCommissionRates(updatedRates);

    // Load mock commission records (in production, this would come from Supabase)
    const mockCommissions: CommissionRecord[] = [{
      id: 'comm-1',
      companyId: 'gdesign',
      companyName: 'GDesign Architecten',
      quoteNumber: 'Q-2025-001',
      projectName: 'Pauwels Herent',
      quoteAmount: 2500,
      commissionPercentage: getCommissionRateForCompany('gdesign'),
      commissionAmount: 2500 * (getCommissionRateForCompany('gdesign') / 100),
      status: 'paid',
      createdAt: '2025-01-15T10:30:00Z',
      invoiceReference: 'INV-GD-2025-001',
      paidAt: '2025-01-25T14:00:00Z'
    }, {
      id: 'comm-2',
      companyId: 'gdesign',
      companyName: 'GDesign Architecten',
      quoteNumber: 'Q-2025-002',
      projectName: 'Office Tower Brussels',
      quoteAmount: 4800,
      commissionPercentage: getCommissionRateForCompany('gdesign'),
      commissionAmount: 4800 * (getCommissionRateForCompany('gdesign') / 100),
      status: 'invoice_received',
      createdAt: '2025-02-01T09:15:00Z',
      invoiceReference: 'INV-GD-2025-002'
    }, {
      id: 'comm-3',
      companyId: '4takt',
      companyName: '4TAKT',
      quoteNumber: 'Q-2025-003',
      projectName: 'School Campus Gent',
      quoteAmount: 6500,
      commissionPercentage: getCommissionRateForCompany('4takt'),
      commissionAmount: 6500 * (getCommissionRateForCompany('4takt') / 100),
      status: 'pending_invoice',
      createdAt: '2025-02-10T11:00:00Z'
    }];
    setCommissions(mockCommissions);
    setIsLoading(false);
  };
  const handleRateChange = (companyId: string, newPercentage: number) => {
    setCommissionRates(prev => prev.map(rate => rate.companyId === companyId ? {
      ...rate,
      percentage: newPercentage
    } : rate));
  };
  const handleSaveRate = async (companyId: string) => {
    const rate = commissionRates.find(r => r.companyId === companyId);
    if (!rate) return;
    if (rate.percentage < 0 || rate.percentage > 100) {
      toast({
        title: "Invalid Value",
        description: "Commission percentage must be between 0 and 100",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(companyId);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const updatedRates = commissionRates.map(r => r.companyId === companyId ? {
      ...r,
      updatedAt: new Date().toISOString()
    } : r);
    saveCommissionRates(updatedRates);
    setCommissionRates(updatedRates);
    const company = companies.find(c => c.id === companyId);
    toast({
      title: "Rate Updated",
      description: `Commission rate for ${company?.name} set to ${rate.percentage}%`
    });
    setIsSaving(null);
  };
  const handleMarkInvoiceReceived = (commissionId: string) => {
    setCommissions(prev => prev.map(c => c.id === commissionId ? {
      ...c,
      status: 'invoice_received' as const,
      invoiceReference: `INV-${Date.now()}`
    } : c));
    toast({
      title: "Success",
      description: "Invoice marked as received"
    });
  };
  const handleMarkPaid = (commissionId: string) => {
    setCommissions(prev => prev.map(c => c.id === commissionId ? {
      ...c,
      status: 'paid' as const,
      paidAt: new Date().toISOString()
    } : c));
    toast({
      title: "Success",
      description: "Commission marked as paid"
    });
  };
  const filteredCommissions = commissions.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = !searchTerm || c.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) || c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || c.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  const getStatusBadge = (status: CommissionRecord['status']) => {
    switch (status) {
      case 'pending_invoice':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Awaiting Invoice</Badge>;
      case 'invoice_received':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20"><FileText className="h-3 w-3 mr-1" />Invoice Received</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'disputed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20"><AlertCircle className="h-3 w-3 mr-1" />Disputed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  const stats = {
    pending: commissions.filter(c => c.status === 'pending_invoice').length,
    received: commissions.filter(c => c.status === 'invoice_received').length,
    paid: commissions.filter(c => c.status === 'paid').length,
    totalPending: commissions.filter(c => c.status !== 'paid').reduce((sum, c) => sum + c.commissionAmount, 0),
    totalPaid: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0)
  };
  if (isLoading) {
    return <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>;
  }
  return <div className="space-y-6">
      {/* Commission Rates Settings - Payment Tracking moved to Financial Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Commission Rates by Company
          </CardTitle>
          <CardDescription>
            Set the commission percentage each client company earns when their end customers pay for NOx calculations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies.map(company => {
            const rate = commissionRates.find(r => r.companyId === company.id);
            const percentage = rate?.percentage ?? 30;
            return <div key={company.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 flex-1">
                    
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">{company.vatNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative w-24">
                      <Input type="number" min={0} max={100} step={1} value={percentage} onChange={e => handleRateChange(company.id, Number(e.target.value))} className="pr-8 text-right" />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <Button size="sm" onClick={() => handleSaveRate(company.id)} disabled={isSaving === company.id} className="gap-2">
                      {isSaving === company.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save
                    </Button>
                  </div>
                </div>;
          })}
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-3">How Commission Works</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Client company sends a NOx quote to their end customer
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                End customer pays the quote amount directly to OxiCloud
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                Client company receives commission notification
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                Client company sends invoice for their commission amount
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">5.</span>
                OxiCloud pays the commission to the client company
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>;
}