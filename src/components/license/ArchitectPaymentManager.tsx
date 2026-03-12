import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { getNoxProjects, updateNoxData, type NoxProject } from '@/lib/noxProjectStore';
import { getAllCompanies, type Company } from '@/lib/mockCompanyDB';
import { Search, ChevronDown, Percent, Save, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';

// Commission rates localStorage
const COMMISSION_RATES_KEY = 'oxicloud_commission_rates';
interface CompanyCommissionRate {
  companyId: string;
  percentage: number;
  updatedAt: string;
}
const getCommissionRates = (): CompanyCommissionRate[] => {
  const stored = localStorage.getItem(COMMISSION_RATES_KEY);
  return stored ? JSON.parse(stored) : [];
};
const saveCommissionRates = (rates: CompanyCommissionRate[]) => {
  localStorage.setItem(COMMISSION_RATES_KEY, JSON.stringify(rates));
};

interface QuoteRow {
  projectId: string;
  projectName: string;
  projectNumber: string;
  companyId: string;
  companyName: string;
  architect: string;
  quoteAmount: number;
  vatAmount: number;
  totalAmount: number;
  status: 'awaiting_payment' | 'paid' | 'unlocked';
  quoteSentDate?: string;
  daysPending?: number;
}

export function ArchitectPaymentManager() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser } = useMockAuth();
  const isOwner = currentUser?.role === 'owner';
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [commissionRates, setCommissionRates] = useState<CompanyCommissionRate[]>([]);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const companies = getAllCompanies();

  // Initialize commission rates
  useState(() => {
    const rates = getCommissionRates();
    const updatedRates = companies.map(company => {
      const existing = rates.find(r => r.companyId === company.id);
      return existing || { companyId: company.id, percentage: 30, updatedAt: new Date().toISOString() };
    });
    setCommissionRates(updatedRates);
  });

  const handleRateChange = (companyId: string, newPercentage: number) => {
    setCommissionRates(prev => prev.map(rate => rate.companyId === companyId ? { ...rate, percentage: newPercentage } : rate));
  };

  const handleSaveRate = async (companyId: string) => {
    const rate = commissionRates.find(r => r.companyId === companyId);
    if (!rate) return;
    if (rate.percentage < 0 || rate.percentage > 100) {
      toast({ title: t('monitor.license.invalidValue') || 'Invalid Value', description: 'Commission percentage must be between 0 and 100', variant: 'destructive' });
      return;
    }
    setIsSaving(companyId);
    await new Promise(resolve => setTimeout(resolve, 500));
    const updatedRates = commissionRates.map(r => r.companyId === companyId ? { ...r, updatedAt: new Date().toISOString() } : r);
    saveCommissionRates(updatedRates);
    setCommissionRates(updatedRates);
    const company = companies.find(c => c.id === companyId);
    toast({ title: 'Rate Updated', description: `Commission rate for ${company?.name} set to ${rate.percentage}%` });
    setIsSaving(null);
  };

  const quoteRows = useMemo(() => {
    const rows: QuoteRow[] = [];
    companies.forEach(company => {
      const projects = getNoxProjects(company.id);
      projects.forEach(project => {
        if (!project.noxData?.priceData) return;
        const nox = project.noxData;
        let status: QuoteRow['status'] = 'awaiting_payment';
        if (nox.status === 'report_delivered' || nox.status === 'report_in_progress') status = 'unlocked';
        else if (nox.status === 'paid') status = 'paid';
        rows.push({
          projectId: project.id, projectName: project.name, projectNumber: project.projectNumber || '',
          companyId: company.id, companyName: company.name, architect: project.managerName || '',
          quoteAmount: nox.priceData!.basePrice, vatAmount: nox.priceData!.vat, totalAmount: nox.priceData!.totalPrice,
          status, quoteSentDate: nox.quoteSentDate, daysPending: nox.daysPending,
        });
      });
    });
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const companiesWithQuotes = useMemo(() => {
    const grouped: Record<string, { company: Company; quotes: QuoteRow[] }> = {};
    quoteRows.forEach(row => {
      if (!grouped[row.companyId]) {
        const company = companies.find(c => c.id === row.companyId);
        if (company) grouped[row.companyId] = { company, quotes: [] };
      }
      if (grouped[row.companyId]) grouped[row.companyId].quotes.push(row);
    });
    return Object.values(grouped);
  }, [quoteRows, companies]);

  const filteredCompanies = companiesWithQuotes.filter(g =>
    g.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.quotes.some(q => q.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleMarkPaid = (projectId: string, projectName: string) => {
    updateNoxData(projectId, { status: 'paid', reportJobQueued: true });
    toast({ title: t('monitor.license.paymentConfirmed'), description: `${projectName} ${t('monitor.license.markedAsPaid')}` });
    setRefreshKey(k => k + 1);
  };

  const handleUnlock = (projectId: string, projectName: string) => {
    updateNoxData(projectId, { status: 'report_in_progress' });
    toast({ title: t('monitor.license.projectUnlocked'), description: `${projectName} ${t('monitor.license.nowUnlocked')}` });
    setRefreshKey(k => k + 1);
  };

  const totalPending = quoteRows.filter(q => q.status === 'awaiting_payment').length;
  const totalPaid = quoteRows.filter(q => q.status === 'paid' || q.status === 'unlocked').length;
  const totalRevenue = quoteRows.filter(q => q.status !== 'awaiting_payment').reduce((s, q) => s + q.totalAmount, 0);
  const pendingRevenue = quoteRows.filter(q => q.status === 'awaiting_payment').reduce((s, q) => s + q.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('monitor.license.pendingPayments'), value: totalPending, color: totalPending > 0 ? 'text-foreground' : 'text-foreground' },
          { label: t('monitor.license.confirmed'), value: totalPaid, color: 'text-primary' },
          { label: t('monitor.license.revenueCollected'), value: `€${totalRevenue.toLocaleString()}` },
          { label: t('monitor.license.pendingRevenue'), value: `€${pendingRevenue.toLocaleString()}` },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-border p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">{s.label}</p>
            <p className={cn("text-2xl font-semibold mt-2", s.color || 'text-foreground')}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('monitor.license.searchCompanies')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {/* Company Groups */}
      <div className="space-y-2">
        {filteredCompanies.map(({ company, quotes }) => {
          const pendingCount = quotes.filter(q => q.status === 'awaiting_payment').length;
          const isOpen = expandedCompany === company.id;
          return (
            <div key={company.id} className="rounded-2xl border border-border overflow-hidden">
              <Collapsible open={isOpen} onOpenChange={() => setExpandedCompany(isOpen ? null : company.id)}>
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors text-left">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{company.name}</h3>
                        {pendingCount > 0 && (
                          <Badge variant="outline" className="text-[10px]">
                            {pendingCount} {t('monitor.license.pending')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{quotes.length} {t('monitor.license.quotes')}</p>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t divide-y divide-border">
                    {quotes.map(quote => (
                      <div key={quote.projectId} className="p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{quote.projectName}</span>
                            <span className="text-xs text-muted-foreground">{quote.projectNumber}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{quote.architect}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold tabular-nums">€{quote.totalAmount.toFixed(2)}</div>
                          <div className="text-[10px] text-muted-foreground tabular-nums">excl. VAT: €{quote.quoteAmount.toFixed(2)}</div>
                        </div>
                        {quote.daysPending != null && quote.status === 'awaiting_payment' && (
                          <span className="text-xs text-muted-foreground shrink-0">{quote.daysPending}d</span>
                        )}
                        <div className="flex gap-1 shrink-0">
                          {quote.status === 'awaiting_payment' && isOwner && (
                            <Button size="sm" variant="outline" onClick={() => handleMarkPaid(quote.projectId, quote.projectName)}>
                              {t('monitor.license.markPaid')}
                            </Button>
                          )}
                          {quote.status === 'awaiting_payment' && !isOwner && (
                            <Badge variant="outline" className="text-muted-foreground">{t('monitor.license.pending')}</Badge>
                          )}
                          {quote.status === 'paid' && isOwner && (
                            <Button size="sm" onClick={() => handleUnlock(quote.projectId, quote.projectName)}>
                              {t('monitor.license.unlock')}
                            </Button>
                          )}
                          {quote.status === 'paid' && !isOwner && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">Paid</Badge>
                          )}
                          {quote.status === 'unlocked' && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              {t('monitor.license.unlocked')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}

        {filteredCompanies.length === 0 && quoteRows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p className="font-semibold">{t('monitor.license.noQuotes')}</p>
            <p className="text-sm mt-1">{t('monitor.license.quotesAppear')}</p>
          </div>
        )}
      </div>

      {/* Commission Rates Section */}
      <div className="rounded-2xl border border-border p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Commission Rates by Company
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Set the commission percentage each client company earns when their end customers pay for NOx calculations.
          </p>
        </div>

        <div className="space-y-2">
          {companies.map(company => {
            const rate = commissionRates.find(r => r.companyId === company.id);
            const percentage = rate?.percentage ?? 30;
            return (
              <div key={company.id} className="flex items-center gap-4 p-4 rounded-xl border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.vatNumber}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative w-20">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={percentage}
                      onChange={e => handleRateChange(company.id, Number(e.target.value))}
                      className="pr-7 text-right"
                    />
                    <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleSaveRate(company.id)} disabled={isSaving === company.id} className="gap-1.5">
                    {isSaving === company.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
