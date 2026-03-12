import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { PilotNavigation } from '@/components/pilot/PilotNavigation';
import { PillToggle } from '@/components/ui/pill-toggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPilotSession, getPilotUser, getPilotCompany, getPilotQuotes, getPilotProjects, getPilotReports } from '@/lib/pilotSessionStore';
import { useLanguage } from '@/i18n/LanguageContext';
export default function PilotFinancial() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const session = getPilotSession();
  const user = getPilotUser();
  const company = getPilotCompany();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [commissionsOpen, setCommissionsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('commissions');
  useEffect(() => {
    if (!session) navigate('/pilot-demo');
  }, []);
  if (!session || !user || !company) return null;
  const quotes = getPilotQuotes();
  const projects = getPilotProjects();
  const reports = getPilotReports();
  const paidQuotes = quotes.filter(q => q.status === 'paid');
  const pendingQuotes = quotes.filter(q => q.status === 'sent');
  const COMMISSION_RATE = 0.15;
  const totalPaidByClients = paidQuotes.reduce((sum, q) => sum + q.totalAmount, 0);
  const totalPending = pendingQuotes.reduce((sum, q) => sum + q.totalAmount, 0);
  const totalCommission = totalPaidByClients * COMMISSION_RATE;
  const pendingCommission = totalPending * COMMISSION_RATE;
  const formatCurrency = (value: number) => new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
  return <>
      <Helmet><title>Financial - OxiCloud</title></Helmet>
      <div className="min-h-screen bg-background">
        <PilotNavigation />
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div />
            <div className="flex items-center gap-2">
              <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2024, 2025].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* KPI Stats — Bento Grid */}
           <div className="grid grid-cols-12 gap-4 mb-8 pb-6 border-b">
             <div className="col-span-6 md:col-span-3 flex flex-col justify-between p-5 rounded-2xl border border-border/40 bg-primary/5 min-h-[120px]">
               <span className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] font-medium">{selectedYear} {t('dashboard.financial.yearRevenue')}</span>
               <div>
                 <p className="text-3xl font-semibold tracking-tight text-foreground">{formatCurrency(totalPaidByClients)}</p>
                 <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.financial.clientPayments')}</p>
               </div>
             </div>
             <div className="col-span-6 md:col-span-3 flex flex-col justify-between p-5 rounded-2xl border border-border/40 bg-muted/20 min-h-[120px]">
               <span className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] font-medium">{t('dashboard.financial.commissionEarned')}</span>
               <div>
                 <p className="text-3xl font-semibold tracking-tight text-foreground">{formatCurrency(totalCommission)}</p>
                 <p className="text-xs text-muted-foreground mt-0.5">{COMMISSION_RATE * 100}% {t('dashboard.financial.partnerRate')}</p>
               </div>
             </div>
             <div className="col-span-6 md:col-span-3 flex flex-col justify-between p-5 rounded-2xl border border-border/40 bg-muted/20 min-h-[120px]">
               <span className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] font-medium">{t('dashboard.financial.projects')}</span>
               <div>
                 <p className="text-3xl font-semibold tracking-tight text-foreground">{projects.length}</p>
                 <p className="text-xs text-muted-foreground mt-0.5">{reports.filter(r => r.status === 'completed').length} {t('dashboard.financial.reportsDelivered')}</p>
               </div>
             </div>
             <div className="col-span-6 md:col-span-3 flex flex-col justify-between p-5 rounded-2xl border border-border/40 bg-muted/20 min-h-[120px]">
               <span className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] font-medium">{t('dashboard.financial.pending')}</span>
               <div>
                 <p className="text-3xl font-semibold tracking-tight text-foreground">{formatCurrency(totalPending)}</p>
                 <p className="text-xs text-muted-foreground mt-0.5">{pendingQuotes.length} {t('dashboard.financial.pending')}</p>
               </div>
             </div>
           </div>

          {/* Content Tabs */}
          <div className="space-y-6">
            <div className="mb-8">
              <PillToggle
                 items={[
                    { id: 'commissions', label: t('dashboard.financial.commissions') },
                    { id: 'overview', label: t('dashboard.financial.overview') },
                  ]}
                 activeId={activeTab}
                onSelect={setActiveTab}
                layoutId="pilotFinancialPillToggle"
              />
            </div>

            {/* Commissions Tab */}
            {activeTab === 'commissions' && <div className="space-y-4 mt-6">
              <Collapsible open={commissionsOpen} onOpenChange={setCommissionsOpen}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between py-3 group">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-medium">{t('dashboard.financial.commissionEarned')}</h3>
                      <span className="text-sm text-muted-foreground">
                         {paidQuotes.length} {paidQuotes.length !== 1 ? t('dashboard.financial.projects') : t('dashboard.financial.project')}
                       </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(totalCommission)}
                      </span>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", commissionsOpen && "rotate-180")} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1">
                     {paidQuotes.length === 0 ? <div className="text-center py-12 text-muted-foreground">
                         
                          <p className="font-medium">{t('dashboard.financial.noCommissionsYet')}</p>
                        </div> : paidQuotes.map(q => {
                    const project = projects.find(p => p.id === q.projectId);
                    const commission = q.totalAmount * COMMISSION_RATE;
                    return <div key={q.id} className="flex items-center justify-between py-3 px-4 -mx-4 hover:bg-muted/50 rounded-lg transition-colors">
                            <div>
                              <p className="font-medium text-sm">{project?.name || 'Project'}</p>
                              <p className="text-xs text-muted-foreground">
                                {q.paidAt ? new Date(q.paidAt).toLocaleDateString('nl-BE') : 'Recent betaald'}
                              </p>
                            </div>
                            <span className="font-semibold text-primary tabular-nums">
                              {formatCurrency(commission)}
                            </span>
                          </div>;
                  })}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Awaiting Payment */}
              {pendingQuotes.length > 0 && <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                     <h3 className="text-base font-medium text-chart-4">{t('dashboard.financial.awaitingPayment')}</h3>
                     <span className="text-sm text-muted-foreground">{pendingQuotes.length} {t('dashboard.financial.pending')}</span>
                  </div>
                  <div className="space-y-2">
                    {pendingQuotes.map(q => {
                  const project = projects.find(p => p.id === q.projectId);
                  return <div key={q.id} className="flex items-center justify-between py-3 px-4 -mx-4 bg-chart-4/5 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{project?.name || 'Project'}</p>
                            <p className="text-xs text-muted-foreground">Sent {q.sentAt ? new Date(q.sentAt).toLocaleDateString('nl-BE') : t('dashboard.financial.recentlyPaid')}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-chart-4 tabular-nums">{formatCurrency(q.totalAmount * COMMISSION_RATE)}</span>
                            <p className="text-xs text-muted-foreground">{t('dashboard.financial.potential')}</p>
                          </div>
                        </div>;
                })}
                  </div>
                </div>}
            </div>}

            {/* Overview Tab */}
            {activeTab === 'overview' && <div className="mt-6">
              <div className="text-center py-16 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                 <p className="font-medium">{t('dashboard.financial.overview')}</p>
                  <p className="text-sm mt-1">{t('dashboard.financial.noCommissionsYet')}</p>
               </div>
            </div>}
          </div>
        </main>
      </div>
    </>;
}