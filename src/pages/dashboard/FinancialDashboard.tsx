import { useState, useEffect, useMemo } from 'react';
import { TopNavigation } from '@/components/TopNavigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PillToggle } from '@/components/ui/pill-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFinancialData, seedFinancialData, clearFinancialData, calculateGrowth, getOxiCloudFinancials, type CompanyFinancials } from '@/lib/mockFinancialDB';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { toast } from 'sonner';
import { RefreshCw, ArrowUpRight, ArrowDownRight, Search, Clock, FileText, CheckCircle, AlertCircle, Euro, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { getNoxProjects } from '@/lib/noxProjectStore';
import { OxiCloudStatusBadge } from '@/components/oxicloud/OxiCloudStatusBadge';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getAllCompanies } from '@/lib/mockCompanyDB';
import { isPilotAccount, isPilotCompany } from '@/lib/pilotAccountUtils';
import { ChevronDown } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const COMMISSION_RATE = 0.15;

interface PaymentRecord {
  id: string;
  quoteNumber: string;
  projectName: string;
  clientName: string;
  clientCompany: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'refunded';
  createdAt: string;
  paidAt?: string;
  paymentMethod?: string;
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

const getCommissionRateForCompany = (companyId: string): number => {
  const stored = localStorage.getItem('oxicloud_commission_rates');
  if (stored) {
    const rates = JSON.parse(stored);
    const rate = rates.find((r: { companyId: string; percentage: number }) => r.companyId === companyId);
    return rate?.percentage ?? 30;
  }
  return 30;
};

const FinancialDashboard = () => {
  const { currentUser, selectedCompanyId, getSelectedCompany, userCompanies } = useMockAuth();
  const [financialData, setFinancialData] = useState<CompanyFinancials[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [refreshKey, setRefreshKey] = useState(0);
  const [commissionsOpen, setCommissionsOpen] = useState(true);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [commissionSearchTerm, setCommissionSearchTerm] = useState('');
  const [commissionStatusFilter, setCommissionStatusFilter] = useState('all');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const isOwner = currentUser?.role === 'owner';
  const isOwnerOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const selectedCompany = getSelectedCompany();
  const isPilot = isPilotAccount(currentUser?.email) || isPilotCompany(selectedCompanyId);
  const hasMultipleCompanies = userCompanies && userCompanies.length > 1;
  const [activeTab, setActiveTab] = useState(isOwnerOrAdmin ? 'payment-tracking' : 'commissions');
  const { t } = useLanguage();

  const financialTabs = useMemo(() => {
    const tabs: { id: string; label: string }[] = [];
    if (!isOwnerOrAdmin) tabs.push({ id: 'commissions', label: t('dashboard.financial.commissions') });
    if (isOwnerOrAdmin) tabs.push({ id: 'payment-tracking', label: t('dashboard.financial.payments') });
    if (isOwnerOrAdmin) tabs.push({ id: 'commission-tracking', label: t('dashboard.financial.commissionTracking') });
    tabs.push({ id: 'overview', label: t('dashboard.financial.fiveYearOverview') });
    tabs.push({ id: 'monthly', label: t('dashboard.financial.monthly') });
    if (isOwnerOrAdmin || hasMultipleCompanies) tabs.push({ id: 'companies', label: t('dashboard.financial.perCompany') });
    return tabs;
  }, [isOwnerOrAdmin, hasMultipleCompanies, t]);

  useEffect(() => {
    if (isPilot) {
      setFinancialData([]);
      setPayments([]);
      setCommissions([]);
      return;
    }
    const data = getFinancialData();
    setFinancialData(data);
    if (isOwnerOrAdmin) {
      const mockPayments: PaymentRecord[] = [
        { id: 'pay-1', quoteNumber: 'Q-2025-001', projectName: 'Pauwels Herent', clientName: 'Marc Pauwels', clientCompany: 'Pauwels Construction NV', amount: 2500, vatAmount: 525, totalAmount: 3025, status: 'paid', createdAt: '2025-01-10T10:30:00Z', paidAt: '2025-01-15T14:00:00Z', paymentMethod: 'Bank Transfer' },
        { id: 'pay-2', quoteNumber: 'Q-2025-002', projectName: 'Office Tower Brussels', clientName: 'Sophie Vandenberghe', clientCompany: 'Brussels Real Estate BVBA', amount: 4800, vatAmount: 1008, totalAmount: 5808, status: 'paid', createdAt: '2025-01-25T09:15:00Z', paidAt: '2025-02-01T11:30:00Z', paymentMethod: 'Credit Card' },
        { id: 'pay-3', quoteNumber: 'Q-2025-003', projectName: 'School Campus Gent', clientName: 'Peter De Smet', clientCompany: 'Stad Gent', amount: 6500, vatAmount: 1365, totalAmount: 7865, status: 'pending', createdAt: '2025-02-10T11:00:00Z' },
        { id: 'pay-4', quoteNumber: 'Q-2025-004', projectName: 'Retail Park Leuven', clientName: 'Els Janssen', clientCompany: 'Leuven Retail Group', amount: 3200, vatAmount: 672, totalAmount: 3872, status: 'overdue', createdAt: '2025-01-05T08:00:00Z' },
      ];
      setPayments(mockPayments);
      const mockCommissions: CommissionRecord[] = [
        { id: 'comm-1', companyId: 'gdesign', companyName: 'GDesign Architecten', quoteNumber: 'Q-2025-001', projectName: 'Pauwels Herent', quoteAmount: 2500, commissionPercentage: getCommissionRateForCompany('gdesign'), commissionAmount: 2500 * (getCommissionRateForCompany('gdesign') / 100), status: 'paid', createdAt: '2025-01-15T10:30:00Z', invoiceReference: 'INV-GD-2025-001', paidAt: '2025-01-25T14:00:00Z' },
        { id: 'comm-2', companyId: 'gdesign', companyName: 'GDesign Architecten', quoteNumber: 'Q-2025-002', projectName: 'Office Tower Brussels', quoteAmount: 4800, commissionPercentage: getCommissionRateForCompany('gdesign'), commissionAmount: 4800 * (getCommissionRateForCompany('gdesign') / 100), status: 'invoice_received', createdAt: '2025-02-01T09:15:00Z', invoiceReference: 'INV-GD-2025-002' },
        { id: 'comm-3', companyId: '4takt', companyName: '4TAKT', quoteNumber: 'Q-2025-003', projectName: 'School Campus Gent', quoteAmount: 6500, commissionPercentage: getCommissionRateForCompany('4takt'), commissionAmount: 6500 * (getCommissionRateForCompany('4takt') / 100), status: 'pending_invoice', createdAt: '2025-02-10T11:00:00Z' },
      ];
      setCommissions(mockCommissions);
    }
  }, [refreshKey, isOwnerOrAdmin, isPilot]);

  const noxProjects = useMemo(() => {
    if (isPilot || isOwnerOrAdmin) return [];
    const companyFilter = selectedCompanyId || undefined;
    return getNoxProjects(companyFilter);
  }, [selectedCompanyId, isOwnerOrAdmin, refreshKey, isPilot]);

  const paymentStats = useMemo(() => {
    const projectsWithNox = noxProjects.filter((p) => p.noxData);
    const paidProjects = projectsWithNox.filter((p) => p.noxData?.status === 'paid' || p.noxData?.status === 'report_in_progress' || p.noxData?.status === 'report_delivered');
    const awaitingPaymentProjects = projectsWithNox.filter((p) => p.noxData?.status === 'awaiting_payment');
    const totalPaidByClients = paidProjects.reduce((sum, p) => sum + (p.noxData?.priceData?.totalPrice || 0), 0);
    const totalPendingPayments = awaitingPaymentProjects.reduce((sum, p) => sum + (p.noxData?.priceData?.totalPrice || 0), 0);
    return { paidProjects, awaitingPaymentProjects, totalPaidByClients, totalPendingPayments, totalCommissionEarned: totalPaidByClients * COMMISSION_RATE, totalCommissionPending: totalPendingPayments * COMMISSION_RATE, totalProjects: projectsWithNox.length };
  }, [noxProjects]);

  const handleSeedData = () => { seedFinancialData(); setRefreshKey((prev) => prev + 1); toast.success("Financial demo data seeded successfully"); };
  const handleClearData = () => { clearFinancialData(); setRefreshKey((prev) => prev + 1); toast.success("Financial data cleared"); };

  const getFilteredData = (): CompanyFinancials[] => {
    if (isOwner) return [getOxiCloudFinancials()];
    if (userCompanies && userCompanies.length > 1) {
      const companyIds = userCompanies.map((c) => c.id);
      return financialData.filter((c) => companyIds.includes(c.companyId));
    }
    if (!selectedCompanyId) return financialData;
    return financialData.filter((c) => c.companyId === selectedCompanyId);
  };

  const getClientCompanyData = (): CompanyFinancials[] => {
    if (hasMultipleCompanies) {
      const companyIds = userCompanies!.map((c) => c.id);
      return financialData.filter((c) => companyIds.includes(c.companyId));
    }
    return financialData;
  };

  const calculateTotals = () => {
    const filtered = getFilteredData();
    let currentYearRevenue = 0, previousYearRevenue = 0, activeUsers = 0, projectsCompleted = 0, lifetimeRevenue = 0;
    filtered.forEach((company) => {
      company.fiscalYears.forEach((fy) => {
        lifetimeRevenue += fy.totalRevenue;
        if (fy.year === selectedYear) { currentYearRevenue += fy.totalRevenue; activeUsers += fy.activeUsers; projectsCompleted += fy.projectsCompleted; }
        if (fy.year === selectedYear - 1) { previousYearRevenue += fy.totalRevenue; }
      });
    });
    return { currentYearRevenue, previousYearRevenue, activeUsers, projectsCompleted, lifetimeRevenue, growth: calculateGrowth(currentYearRevenue, previousYearRevenue) };
  };

  const totals = calculateTotals();

  const getFiveYearData = () => {
    const years = [2020, 2021, 2022, 2023, 2024];
    const filtered = getFilteredData();
    return years.map((year) => {
      let totalRevenue = 0, subscriptions = 0, projects = 0;
      filtered.forEach((company) => { const fy = company.fiscalYears.find((f) => f.year === year); if (fy) { totalRevenue += fy.totalRevenue; subscriptions += fy.subscriptionRevenue; projects += fy.projectRevenue; } });
      return { year: year.toString(), totalRevenue, subscriptions, projects };
    });
  };

  const getMonthlyData = () => {
    const filtered = getFilteredData();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, i) => {
      let revenue = 0, subscriptions = 0, projects = 0;
      filtered.forEach((company) => { const fy = company.fiscalYears.find((f) => f.year === selectedYear); if (fy && fy.monthlyData[i]) { revenue += fy.monthlyData[i].revenue; subscriptions += fy.monthlyData[i].subscriptions; projects += fy.monthlyData[i].projects; } });
      return { month, revenue, subscriptions, projects };
    });
  };

  const getCompanyBreakdown = () => {
    return getClientCompanyData().map((company) => {
      const fy = company.fiscalYears.find((f) => f.year === selectedYear);
      return { name: company.companyName, value: isOwnerOrAdmin ? fy?.subscriptionRevenue || 0 : fy?.totalRevenue || 0, plan: company.currentPlan, monthlyFee: company.monthlyFee };
    });
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatCurrency2 = (value: number) => `€${value.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;

  // Filtered payments & commissions
  const filteredPayments = payments.filter((p) => {
    const matchesStatus = paymentStatusFilter === 'all' || p.status === paymentStatusFilter;
    const matchesSearch = !paymentSearchTerm || [p.quoteNumber, p.clientName, p.clientCompany, p.projectName].some(s => s.toLowerCase().includes(paymentSearchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredCommissions = commissions.filter((c) => {
    const matchesStatus = commissionStatusFilter === 'all' || c.status === commissionStatusFilter;
    const matchesSearch = !commissionSearchTerm || [c.quoteNumber, c.companyName, c.projectName].some(s => s.toLowerCase().includes(commissionSearchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Payment sub-stats
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const overdueCount = payments.filter(p => p.status === 'overdue').length;
  const receivedTotal = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.totalAmount, 0);
  const outstandingTotal = payments.filter(p => p.status !== 'paid' && p.status !== 'refunded').reduce((s, p) => s + p.totalAmount, 0);

  // Commission sub-stats
  const awaitingInvoiceCount = commissions.filter(c => c.status === 'pending_invoice').length;
  const invoiceReceivedCount = commissions.filter(c => c.status === 'invoice_received').length;
  const commPaidCount = commissions.filter(c => c.status === 'paid').length;
  const commOutstanding = commissions.filter(c => c.status !== 'paid').reduce((s, c) => s + c.commissionAmount, 0);
  const commPaidTotal = commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.commissionAmount, 0);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    fontSize: '12px',
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto px-4 py-8">
        {/* Header row */}
        <div className="flex items-center justify-end gap-2 mb-6">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2020, 2021, 2022, 2023, 2024].map((year) => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isOwnerOrAdmin && (
            <>
              <Button onClick={handleClearData} variant="ghost" size="icon" className="h-9 w-9"><RefreshCw className="h-4 w-4" /></Button>
              <Button onClick={handleSeedData} variant="outline" size="sm" className="h-9">Seed</Button>
            </>
          )}
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <KpiCard
            label={`${selectedYear} ${t('dashboard.financial.yearRevenue')}`}
            value={formatCurrency(totals.currentYearRevenue)}
            accent
            footer={totals.growth !== 0 ? (
              <div className="flex items-center gap-1">
                {totals.growth >= 0 ? <ArrowUpRight className="h-3 w-3 text-primary" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                <span className={cn("text-xs font-medium", totals.growth >= 0 ? "text-primary" : "text-destructive")}>
                  {totals.growth >= 0 ? '+' : ''}{totals.growth}%
                </span>
                <span className="text-xs text-muted-foreground">{t('dashboard.financial.vsLastYear')}</span>
              </div>
            ) : <span className="text-xs text-muted-foreground">{t('dashboard.financial.thisYear')}</span>}
          />
          <KpiCard
            label={t('dashboard.financial.totalRevenue')}
            value={formatCurrency(totals.lifetimeRevenue)}
            footer={<span className="text-xs text-muted-foreground">{t('dashboard.financial.since2020')}</span>}
          />
          <KpiCard
            label={isOwnerOrAdmin ? t('dashboard.financial.clientCompanies') : t('dashboard.financial.activeUsers')}
            value={isOwnerOrAdmin ? financialData.length : totals.activeUsers}
            footer={<span className="text-xs text-muted-foreground">{isOwnerOrAdmin ? t('dashboard.financial.activeSubscriptions') : t('dashboard.financial.licensedSeats')}</span>}
          />
          <KpiCard
            label={isOwnerOrAdmin ? t('dashboard.financial.mrr') : t('dashboard.financial.completedProjects')}
            value={isOwnerOrAdmin ? formatCurrency(financialData.reduce((sum, c) => sum + c.monthlyFee, 0)) : totals.projectsCompleted}
            footer={<span className="text-xs text-muted-foreground">{isOwnerOrAdmin ? t('dashboard.financial.monthlyRecurring') : `${t('dashboard.financial.inYear')} ${selectedYear}`}</span>}
          />
        </div>

        {/* Tabs */}
        <PillToggle items={financialTabs} activeId={activeTab} onSelect={setActiveTab} layoutId="financialPillToggle" />

        <div className="mt-8">
          {/* ───── COMMISSIONS (Client Users) ───── */}
          {!isOwnerOrAdmin && activeTab === 'commissions' && (
            <div className="space-y-4">
              <Collapsible open={commissionsOpen} onOpenChange={setCommissionsOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-medium">{t('dashboard.financial.commissionEarned')}</h3>
                      <span className="text-sm text-muted-foreground">{paymentStats.paidProjects.length} {paymentStats.paidProjects.length !== 1 ? t('dashboard.financial.projects') : t('dashboard.financial.project')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-primary">{formatCurrency(paymentStats.totalCommissionEarned)}</span>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", commissionsOpen && "rotate-180")} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1">
                    {paymentStats.paidProjects.length === 0
                      ? <p className="text-sm text-muted-foreground py-4">{t('dashboard.financial.noCommissionsYet')}</p>
                      : paymentStats.paidProjects.map((project) => {
                          const totalPrice = project.noxData?.priceData?.totalPrice || 0;
                          const commission = totalPrice * COMMISSION_RATE;
                          return (
                            <div key={project.id} className="flex items-center justify-between py-3 px-4 -mx-4 hover:bg-muted/50 rounded-lg transition-colors">
                              <div>
                                <p className="font-medium text-sm">{project.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {project.noxData?.paymentData?.paymentDate ? format(new Date(project.noxData.paymentData.paymentDate), 'dd MMM yyyy') : t('dashboard.financial.recentlyPaid')}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <OxiCloudStatusBadge status={project.noxData?.status || 'paid'} />
                                <span className="font-semibold text-primary tabular-nums min-w-[80px] text-right">{formatCurrency(commission)}</span>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {paymentStats.awaitingPaymentProjects.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-chart-4">{t('dashboard.financial.awaitingPayment')}</h3>
                    <span className="text-sm text-muted-foreground">{paymentStats.awaitingPaymentProjects.length} {t('dashboard.financial.pending')}</span>
                  </div>
                  <div className="space-y-2">
                    {paymentStats.awaitingPaymentProjects.map((project) => {
                      const totalPrice = project.noxData?.priceData?.totalPrice || 0;
                      const potentialCommission = totalPrice * COMMISSION_RATE;
                      return (
                        <div key={project.id} className="flex items-center justify-between py-3 px-4 -mx-4 bg-chart-4/5 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{t('dashboard.financial.validUntil')}: {project.noxData?.priceData?.validUntil ? format(new Date(project.noxData.priceData.validUntil), 'dd MMM yyyy') : 'N/B'}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-chart-4 tabular-nums">{formatCurrency(potentialCommission)}</span>
                            <p className="text-xs text-muted-foreground">{t('dashboard.financial.potential')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───── PAYMENT TRACKING (Owner/Admin) ───── */}
          {isOwnerOrAdmin && activeTab === 'payment-tracking' && (
            <div className="space-y-6">
              {/* Inline stats row */}
              <div className="grid grid-cols-4 gap-px rounded-xl border overflow-hidden">
                <MiniStat label={t('dashboard.financial.pendingPayments')} value={pendingCount} color="text-chart-4" />
                <MiniStat label={t('dashboard.financial.overdue')} value={overdueCount} color="text-destructive" />
                <MiniStat label={t('dashboard.financial.received')} value={formatCurrency2(receivedTotal)} color="text-primary" />
                <MiniStat label={t('dashboard.financial.outstanding')} value={formatCurrency2(outstandingTotal)} />
              </div>

              {/* Search + Filter */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">{t('dashboard.financial.incomingPayments')}</h3>
                  <p className="text-sm text-muted-foreground">{t('dashboard.financial.trackEndClientPayments')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setRefreshKey(p => p + 1)} className="gap-2 shrink-0">
                  <RefreshCw className="h-3.5 w-3.5" />{t('dashboard.financial.refresh')}
                </Button>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t('dashboard.financial.searchQuoteClientProject')} value={paymentSearchTerm} onChange={(e) => setPaymentSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('dashboard.financial.allStatuses')}</SelectItem>
                    <SelectItem value="pending">{t('dashboard.financial.pendingStatus')}</SelectItem>
                    <SelectItem value="paid">{t('dashboard.financial.paidStatus')}</SelectItem>
                    <SelectItem value="overdue">{t('dashboard.financial.overdueStatus')}</SelectItem>
                    <SelectItem value="refunded">{t('dashboard.financial.refundedStatus')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredPayments.length === 0 ? (
                <EmptyState icon={<Euro className="h-10 w-10" />} title={t('dashboard.financial.noPaymentsFound')} sub={t('dashboard.financial.paymentsAppearHere')} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dashboard.financial.quote')}</TableHead>
                      <TableHead>{t('dashboard.financial.clientName')}</TableHead>
                      <TableHead>{t('dashboard.financial.projectName')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.financial.amount')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.financial.vat')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.financial.total')}</TableHead>
                      <TableHead>{t('dashboard.financial.status')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.financial.date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.quoteNumber}</TableCell>
                        <TableCell>
                          <p className="font-medium">{p.clientName}</p>
                          <p className="text-xs text-muted-foreground">{p.clientCompany}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.projectName}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency2(p.amount)}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency2(p.vatAmount)}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-primary">{formatCurrency2(p.totalAmount)}</TableCell>
                        <TableCell><StatusBadge status={p.status} t={t} /></TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{format(new Date(p.paidAt || p.createdAt), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* ───── COMMISSION TRACKING (Owner/Admin) ───── */}
          {isOwnerOrAdmin && activeTab === 'commission-tracking' && (
            <div className="space-y-6">
              <div className="grid grid-cols-5 gap-px rounded-xl border overflow-hidden">
                <MiniStat label={t('dashboard.financial.awaitingInvoice')} value={awaitingInvoiceCount} color="text-chart-4" />
                <MiniStat label={t('dashboard.financial.invoiceReceived')} value={invoiceReceivedCount} color="text-chart-2" />
                <MiniStat label={t('dashboard.financial.paid')} value={commPaidCount} color="text-primary" />
                <MiniStat label={t('dashboard.financial.outstanding')} value={formatCurrency2(commOutstanding)} />
                <MiniStat label={t('dashboard.financial.totalPaid')} value={formatCurrency2(commPaidTotal)} color="text-primary" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">{t('dashboard.financial.commissionPayouts')}</h3>
                  <p className="text-sm text-muted-foreground">{t('dashboard.financial.trackCommissionPayments')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setRefreshKey(p => p + 1)} className="gap-2 shrink-0">
                  <RefreshCw className="h-3.5 w-3.5" />{t('dashboard.financial.refresh')}
                </Button>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t('dashboard.financial.searchQuoteCompanyProject')} value={commissionSearchTerm} onChange={(e) => setCommissionSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={commissionStatusFilter} onValueChange={setCommissionStatusFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('dashboard.financial.allStatuses')}</SelectItem>
                    <SelectItem value="pending_invoice">{t('dashboard.financial.awaitingInvoice')}</SelectItem>
                    <SelectItem value="invoice_received">{t('dashboard.financial.invoiceReceived')}</SelectItem>
                    <SelectItem value="paid">{t('dashboard.financial.paidStatus')}</SelectItem>
                    <SelectItem value="disputed">{t('dashboard.financial.disputedStatus')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredCommissions.length === 0 ? (
                <EmptyState icon={<Euro className="h-10 w-10" />} title={t('dashboard.financial.noCommissionsFound')} sub={t('dashboard.financial.commissionsCreatedWhen')} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dashboard.financial.quote')}</TableHead>
                      <TableHead>{t('dashboard.financial.partnerCompany')}</TableHead>
                      <TableHead>{t('dashboard.financial.projectName')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.financial.quoteAmount')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.financial.rate')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.financial.commission')}</TableHead>
                      <TableHead>{t('dashboard.financial.status')}</TableHead>
                      <TableHead className="text-right">{t('dashboard.financial.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommissions.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.quoteNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {c.companyName}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.projectName}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency2(c.quoteAmount)}</TableCell>
                        <TableCell className="text-right">{c.commissionPercentage}%</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-primary">{formatCurrency2(c.commissionAmount)}</TableCell>
                        <TableCell><CommissionStatusBadge status={c.status} t={t} /></TableCell>
                        <TableCell className="text-right">
                          {c.status === 'pending_invoice' && (
                            <Button size="sm" variant="outline" onClick={() => {
                              setCommissions(prev => prev.map(x => x.id === c.id ? { ...x, status: 'invoice_received' as const, invoiceReference: `INV-${Date.now()}` } : x));
                              toast.success("Invoice marked as received");
                            }} className="gap-1.5 h-8 text-xs">
                              <FileText className="h-3.5 w-3.5" />{t('dashboard.financial.markReceived')}
                            </Button>
                          )}
                          {c.status === 'invoice_received' && (
                            <Button size="sm" onClick={() => {
                              setCommissions(prev => prev.map(x => x.id === c.id ? { ...x, status: 'paid' as const, paidAt: new Date().toISOString() } : x));
                              toast.success("Commission marked as paid");
                            }} className="gap-1.5 h-8 text-xs">
                              <CheckCircle className="h-3.5 w-3.5" />{t('dashboard.financial.markPaid')}
                            </Button>
                          )}
                          {c.status === 'paid' && c.paidAt && (
                            <span className="text-xs text-muted-foreground">Paid {format(new Date(c.paidAt), 'MMM d')}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* ───── 5-YEAR OVERVIEW ───── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">{t('dashboard.financial.revenueGrowth')}</h3>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getFiveYearData()}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="year" className="text-xs" axisLine={false} tickLine={false} />
                      <YAxis className="text-xs" tickFormatter={(v) => `€${v / 1000}k`} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="totalRevenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} name="Total Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">{t('dashboard.financial.revenueComposition')}</h3>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getFiveYearData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="year" className="text-xs" axisLine={false} tickLine={false} />
                      <YAxis className="text-xs" tickFormatter={(v) => `€${v / 1000}k`} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="subscriptions" name={t('dashboard.financial.subscriptions')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="projects" name={t('dashboard.financial.projects')} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ───── MONTHLY ───── */}
          {activeTab === 'monthly' && (
            <div className="rounded-2xl border p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">{t('dashboard.financial.monthlyRevenue')} — {selectedYear}</h3>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getMonthlyData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="month" className="text-xs" axisLine={false} tickLine={false} />
                    <YAxis className="text-xs" tickFormatter={(v) => `€${v / 1000}k`} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="revenue" name={t('dashboard.financial.totalLabel')} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="subscriptions" name={t('dashboard.financial.subscriptions')} stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="projects" name={t('dashboard.financial.projects')} stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ───── PER COMPANY ───── */}
          {(isOwnerOrAdmin || hasMultipleCompanies) && activeTab === 'companies' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  {isOwnerOrAdmin ? t('dashboard.financial.revenueByClient') : t('dashboard.financial.revenueByCompany')} — {selectedYear}
                </h3>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={getCompanyBreakdown()} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                        {getCompanyBreakdown().map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-3">
                {getClientCompanyData().map((company) => {
                  const currentFY = company.fiscalYears.find((f) => f.year === selectedYear);
                  const previousFY = company.fiscalYears.find((f) => f.year === selectedYear - 1);
                  const growth = previousFY ? calculateGrowth(currentFY?.totalRevenue || 0, previousFY.totalRevenue) : 0;
                  return (
                    <div key={company.companyId} className="p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-sm">{company.companyName}</h3>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(currentFY?.totalRevenue || 0)}</p>
                          <div className="flex items-center justify-end gap-1">
                            {growth >= 0 ? <TrendingUp className="h-3 w-3 text-primary" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                            <span className={cn("text-xs", growth >= 0 ? "text-primary" : "text-destructive")}>{growth >= 0 ? '+' : ''}{growth}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border/50">
                        <div><p className="text-xs text-muted-foreground">{t('dashboard.financial.users')}</p><p className="text-sm font-medium">{currentFY?.activeUsers || 0}</p></div>
                        <div><p className="text-xs text-muted-foreground">{t('dashboard.financial.projects')}</p><p className="text-sm font-medium">{currentFY?.projectsCompleted || 0}</p></div>
                        <div><p className="text-xs text-muted-foreground">{t('dashboard.financial.since')}</p><p className="text-sm font-medium">{new Date(company.contractStartDate).getFullYear()}</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

/* ── Sub-components ── */

function KpiCard({ label, value, footer, accent }: { label: string; value: string | number; footer: React.ReactNode; accent?: boolean }) {
  return (
    <div className={cn("flex flex-col justify-between p-5 rounded-2xl border min-h-[120px]", accent ? "bg-primary/5 border-primary/10" : "border-border/40")}>
      <span className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] font-medium">{label}</span>
      <div>
        <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        <div className="mt-1">{footer}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-background p-4 text-center">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium mb-1">{label}</p>
      <p className={cn("text-xl font-semibold tabular-nums", color || "text-foreground")}>{value}</p>
    </div>
  );
}

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <div className="mx-auto mb-3 opacity-40">{icon}</div>
      <p className="font-medium">{title}</p>
      <p className="text-sm mt-1">{sub}</p>
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    pending: { icon: <Clock className="h-3 w-3 mr-1" />, label: t('dashboard.financial.pendingStatus'), cls: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
    paid: { icon: <CheckCircle className="h-3 w-3 mr-1" />, label: t('dashboard.financial.paidStatus'), cls: 'bg-chart-1/10 text-chart-1 border-chart-1/20' },
    overdue: { icon: <AlertCircle className="h-3 w-3 mr-1" />, label: t('dashboard.financial.overdueStatus'), cls: 'bg-destructive/10 text-destructive border-destructive/20' },
    refunded: { icon: null, label: t('dashboard.financial.refundedStatus'), cls: 'bg-muted text-muted-foreground border-muted' },
  };
  const c = config[status];
  if (!c) return null;
  return <Badge variant="outline" className={c.cls}>{c.icon}{c.label}</Badge>;
}

function CommissionStatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    pending_invoice: { icon: <Clock className="h-3 w-3 mr-1" />, label: t('dashboard.financial.awaitingInvoice'), cls: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
    invoice_received: { icon: <FileText className="h-3 w-3 mr-1" />, label: t('dashboard.financial.invoiceReceived'), cls: 'bg-chart-2/10 text-chart-2 border-chart-2/20' },
    paid: { icon: <CheckCircle className="h-3 w-3 mr-1" />, label: t('dashboard.financial.paidStatus'), cls: 'bg-chart-1/10 text-chart-1 border-chart-1/20' },
    disputed: { icon: <AlertCircle className="h-3 w-3 mr-1" />, label: t('dashboard.financial.disputedStatus'), cls: 'bg-destructive/10 text-destructive border-destructive/20' },
  };
  const c = config[status];
  if (!c) return null;
  return <Badge variant="outline" className={c.cls}>{c.icon}{c.label}</Badge>;
}

export default FinancialDashboard;
