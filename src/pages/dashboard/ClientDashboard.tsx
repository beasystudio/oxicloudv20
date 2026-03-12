import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { TopNavigation } from '@/components/TopNavigation';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, CheckCircle2, ChevronRight, Zap, AlertCircle,
} from 'lucide-react';
import { getEmployeesByCompany, getCompanyStats, isCompanyDataSeeded, type CompanyEmployee } from '@/lib/mockCompanyDB';
import { getSettingsStatus, type SettingsStatus } from '@/lib/settingsValidator';
import { getNoxProjects, type NoxProject } from '@/lib/noxProjectStore';
import { cn } from '@/lib/utils';
import { isPilotAccount, isPilotCompany, getEmptyStats } from '@/lib/pilotAccountUtils';
import { PaymentSuccessDialog } from '@/components/oxicloud/PaymentSuccessDialog';
import { CreateNewProjectDialog } from '@/components/projects/CreateNewProjectDialog';
import { InviteManagerDialog } from '@/components/demo/InviteManagerDialog';
import { Handshake, Send } from 'lucide-react';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, selectedCompanyId, getSelectedCompany, login } = useMockAuth();

  useEffect(() => {
    if (!currentUser && location.pathname === '/dashboard/demo') {
      login('jan@gdesign.be', 'demo123');
    }
  }, [currentUser, location.pathname, login]);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus>({
    company: false, users: false, contacts: false, projects: false, allComplete: false
  });
  const [noxProjects, setNoxProjects] = useState<NoxProject[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0, totalProjects: 0, activeProjects: 0, completedProjects: 0, totalBudget: 0
  });
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [paymentProjectName, setPaymentProjectName] = useState('');
  const [showInviteManager, setShowInviteManager] = useState(false);

  const selectedCompany = getSelectedCompany();
  const isClientOwnerOrAdmin = currentUser?.role === 'client_owner' || currentUser?.role === 'client_admin';
  const isPilot = isPilotAccount(currentUser?.email) || isPilotCompany(selectedCompanyId);

  useEffect(() => {
    const state = location.state as {showPaymentSuccess?: boolean; projectName?: string;} | null;
    if (state?.showPaymentSuccess) {
      setShowPaymentSuccessDialog(true);
      setPaymentProjectName(state.projectName || '');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (isPilot) {
      setEmployees([]); setStats(getEmptyStats()); setNoxProjects([]);
      setSettingsStatus({ company: false, users: false, contacts: false, projects: false, allComplete: false });
      return;
    }
    if (selectedCompanyId && isCompanyDataSeeded()) {
      const ce = getEmployeesByCompany(selectedCompanyId);
      const cs = getCompanyStats(selectedCompanyId);
      setEmployees(ce);
      setStats({ ...cs, totalEmployees: ce.filter((e) => e.isActive).length });
    } else {
      setEmployees([]);
      setStats({ totalEmployees: 1, totalProjects: 0, activeProjects: 0, completedProjects: 0, totalBudget: 0 });
    }
    setSettingsStatus(getSettingsStatus());
    if (selectedCompanyId) setNoxProjects(getNoxProjects(selectedCompanyId));
  }, [selectedCompanyId, isPilot]);

  const pendingTasks = useMemo(() => {
    const tasks: {id: string; title: string; description: string; action: () => void;}[] = [];
    noxProjects.filter((p) => p.noxData?.status === 'awaiting_payment').forEach((p) => {
      tasks.push({ id: `ap-${p.id}`, title: `"${p.name}" — ${t('dashboard.client.awaitingPayment')}`, description: t('dashboard.client.followUpPayment'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'pay' } }) });
    });
    noxProjects.filter((p) => !p.noxData || p.noxData.status === 'input_completed' && !p.noxData.priceData).forEach((p) => {
      tasks.push({ id: `ni-${p.id}`, title: `"${p.name}" — ${t('dashboard.client.inputIncomplete')}`, description: t('dashboard.client.fillPreEstimation'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'pre-estimation' } }) });
    });
    noxProjects.filter((p) => p.noxData?.status === 'price_generated' || p.noxData?.status === 'input_completed' && p.noxData?.priceData).forEach((p) => {
      tasks.push({ id: `rq-${p.id}`, title: `"${p.name}" — ${t('dashboard.client.prepareQuote')}`, description: t('dashboard.client.generateAndSend'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'payment' } }) });
    });
    noxProjects.filter((p) => p.noxData?.status === 'report_in_progress').forEach((p) => {
      tasks.push({ id: `ip-${p.id}`, title: `"${p.name}" — ${t('dashboard.client.reportInProgress')}`, description: t('dashboard.client.finishCalculation'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'details' } }) });
    });
    noxProjects.filter((p) => p.noxData?.status === 'paid' && !p.noxData?.detailedCalculation).forEach((p) => {
      tasks.push({ id: `pc-${p.id}`, title: `"${p.name}" — ${t('dashboard.client.startCalculation')}`, description: t('dashboard.client.paymentReceivedStart'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'details' } }) });
    });
    return tasks;
  }, [noxProjects, navigate, t]);

  const summaryLine = useMemo(() => {
    const parts: string[] = [];
    if (pendingTasks.length > 0) parts.push(`${pendingTasks.length} ${pendingTasks.length !== 1 ? t('dashboard.client.openActions') : t('dashboard.client.openAction')}`);
    if (stats.activeProjects > 0) parts.push(`${stats.activeProjects} ${stats.activeProjects !== 1 ? t('dashboard.client.activeProjects') : t('dashboard.client.activeProject')}`);
    return parts.length > 0 ? `${t('dashboard.client.youHave')} ${parts.join(` ${t('dashboard.client.and')} `)}` : null;
  }, [pendingTasks.length, stats.activeProjects, t]);

  const smartInsights = useMemo(() => {
    const insights: {text: string; type: 'warning' | 'positive' | 'neutral';}[] = [];
    const missing = noxProjects.filter((p) => !p.noxData || p.noxData.status === 'input_completed');
    if (missing.length > 0) insights.push({ text: `${t('dashboard.client.noxMissing')} ${missing.length} ${t('dashboard.client.active')} ${missing.length === 1 ? 'project' : t('dashboard.nav.projects').toLowerCase()}`, type: 'warning' });
    const awaiting = noxProjects.filter((p) => p.noxData?.status === 'awaiting_payment');
    if (awaiting.length > 0) insights.push({ text: `${awaiting.length} ${awaiting.length === 1 ? t('dashboard.client.projectWaiting') : t('dashboard.client.projectsWaiting')}`, type: 'warning' });
    const delivered = noxProjects.filter((p) => p.noxData?.status === 'report_delivered');
    if (delivered.length > 0) insights.push({ text: `${delivered.length} ${delivered.length === 1 ? t('dashboard.client.reportDeliveredSingle') : t('dashboard.client.reportsDelivered')}`, type: 'positive' });
    if (stats.totalEmployees > 1) insights.push({ text: `${t('dashboard.client.teamCount')} ${stats.totalEmployees} ${t('dashboard.client.activeMembers')}`, type: 'neutral' });
    return insights.slice(0, 4);
  }, [noxProjects, stats.totalEmployees, t]);

  const recentActivities = useMemo(() => {
    const a: {label: string; time: string;}[] = [];
    if (noxProjects.some((p) => p.noxData?.status === 'report_delivered')) a.push({ label: t('dashboard.client.reportDelivered'), time: `2${t('dashboard.client.hoursAgo')}` });
    if (noxProjects.some((p) => p.noxData?.status === 'paid')) a.push({ label: t('dashboard.client.paymentReceived'), time: t('dashboard.client.yesterday') });
    if (stats.totalEmployees > 1) a.push({ label: t('dashboard.client.newTeamMember'), time: `3 ${t('dashboard.client.daysAgo')}` });
    if (a.length === 0) a.push({ label: t('dashboard.client.accountCreated'), time: t('dashboard.client.today') });
    return a;
  }, [noxProjects, stats.totalEmployees, t]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard.greeting.morning');
    if (h < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  const todoCount = pendingTasks.length || 0;

  const setupSteps = [
    { key: 'company', label: t('dashboard.client.companyDetails'), description: t('dashboard.client.setupCompany'), done: settingsStatus.company, path: '/dashboard/settings', tab: 'company' },
    { key: 'users', label: t('dashboard.client.teamMembers'), description: t('dashboard.client.addTeam'), done: settingsStatus.users, path: '/dashboard/settings', tab: 'users' },
    { key: 'contacts', label: t('dashboard.client.contactTypes'), description: t('dashboard.client.configureContacts'), done: settingsStatus.contacts, path: '/dashboard/settings', tab: 'contacts' },
  ];
  const completedSteps = setupSteps.filter((s) => s.done).length;
  const isFirstTimeUser = !settingsStatus.allComplete;

  const displayActions = pendingTasks.length > 0 ? pendingTasks : [
    { id: '1', title: `"Renovatie Villa Mechelen" — ${t('dashboard.client.inputIncomplete')}`, description: t('dashboard.client.fillPreEstimation'), action: () => {} },
  ];

  return (
    <>
      <Helmet>
        <title>{selectedCompany?.name || 'Dashboard'} - OxiCloud</title>
      </Helmet>

      <div className="h-[100dvh] overflow-hidden bg-background flex flex-col">
        <TopNavigation />

        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="container mx-auto px-4 py-4 max-w-6xl space-y-3">

            {/* Demo Environment Banner — compact */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    {language === 'nl' ? 'U verkent de OxiCloud Demo-omgeving.' : 'You are exploring the OxiCloud Demo Environment.'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {language === 'nl' ? 'Alle data is fictief. Maak een Workspace aan om echt te starten.' : 'All data is fictional. Create a Workspace to start for real.'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => navigate('/pilot-demo/create-account')}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors">
                    <Plus className="h-3 w-3" />
                    {language === 'nl' ? 'Workspace aanmaken' : 'Create Workspace'}
                  </button>
                  <button
                    onClick={() => setShowInviteManager(true)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium border border-border text-foreground hover:bg-muted/50 transition-colors">
                    <Send className="h-3 w-3" />
                    {language === 'nl' ? 'Manager uitnodigen' : 'Invite manager'}
                  </button>
                </div>
              </div>
            </div>

            {/* Header — tighter */}
            <header className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString(language === 'nl' ? 'nl-BE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h1 className="text-2xl tracking-tight leading-tight text-foreground font-semibold">
                  {greeting()}, {currentUser?.name?.split(' ')[0]}.
                </h1>
                {summaryLine && <p className="text-xs text-muted-foreground mt-0.5">{summaryLine}</p>}
              </div>
              <button
                onClick={() => setShowCreateProjectDialog(true)}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors shrink-0">
                <Plus className="h-3.5 w-3.5" />
                {t('dashboard.client.newProject')}
              </button>
            </header>

            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-xl border border-border px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t('dashboard.client.todo')}</p>
                <p className="text-xl font-semibold text-foreground leading-none mt-1">{todoCount || 1}</p>
              </div>
              <div className="rounded-xl border border-border px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t('dashboard.nav.projects')}</p>
                <p className="text-xl font-semibold text-foreground leading-none mt-1">{stats.totalProjects || 3}</p>
                <p className="text-[11px] text-muted-foreground">{stats.activeProjects || 2} {language === 'nl' ? 'actief' : 'active'}</p>
              </div>
              <div className="rounded-xl border border-border px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Team</p>
                <p className="text-xl font-semibold text-foreground leading-none mt-1">{stats.totalEmployees || 6}</p>
                <p className="text-[11px] text-muted-foreground">{t('dashboard.client.activeMembers')}</p>
              </div>
              <div className="rounded-xl border border-border px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">NOx</p>
                <p className="text-xl font-semibold text-foreground leading-none mt-1">
                  {noxProjects.filter((p) => p.noxData?.status === 'report_delivered').length || 0}
                </p>
                <p className="text-[11px] text-muted-foreground">{language === 'nl' ? 'rapporten' : 'reports'}</p>
              </div>
            </div>

            {/* ── Action Required ── */}
            <div className="rounded-xl border border-border px-3 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  {isFirstTimeUser && isClientOwnerOrAdmin ? t('dashboard.client.completeSetup') : t('dashboard.client.actionRequired')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isFirstTimeUser && isClientOwnerOrAdmin ? `${completedSteps}/${setupSteps.length}` : displayActions.length}
                </span>
              </div>

              {isFirstTimeUser && isClientOwnerOrAdmin ? (
                <div className="space-y-0.5">
                  {setupSteps.map((step, index) => (
                    <button key={step.key} onClick={() => navigate(step.path, { state: { activeTab: step.tab } })} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors", step.done ? "opacity-40" : "hover:bg-muted/50")}>
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0", step.done ? "bg-foreground text-background" : "border border-border text-muted-foreground")}>
                        {step.done ? <CheckCircle2 className="h-2.5 w-2.5" /> : index + 1}
                      </div>
                      <p className={cn("text-xs", step.done && "line-through text-muted-foreground")}>{step.label}</p>
                      <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {displayActions.map((task) => (
                    <button
                      key={task.id}
                      onClick={task.action}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-lg hover:bg-muted/50 transition-colors group">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-muted-foreground/40" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground truncate">{task.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{task.description}</p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Two-column: Insights + Activity ── */}
            <div className="grid grid-cols-2 gap-2">
              {/* Smart Insights */}
              <div className="rounded-xl border border-border px-3 py-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
                  {t('dashboard.client.smartInsights')}
                </p>
                <div className="space-y-1.5">
                  {(smartInsights.length > 0 ? smartInsights : [
                    { text: language === 'nl' ? 'NOx rapport ontbreekt bij 1 actief project' : 'NOx report missing for 1 active project', type: 'warning' as const },
                    { text: language === 'nl' ? 'Uw team telt 6 actieve leden' : 'Your team has 6 active members', type: 'neutral' as const },
                  ]).map((insight, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className={cn('w-1 h-1 rounded-full mt-1.5 shrink-0',
                        insight.type === 'warning' ? 'bg-foreground/50' : 'bg-foreground/20'
                      )} />
                      <p className="text-xs leading-relaxed text-muted-foreground">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl border border-border px-3 py-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">{t('dashboard.client.recentActivity')}</p>
                <div className="space-y-0.5">
                  {recentActivities.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-foreground">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Partner Program + Next Step ── */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 rounded-xl border border-border px-3 py-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                    <Handshake className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground mb-0.5">
                      {language === 'nl' ? 'OxiCloud Partner Programma' : 'OxiCloud Partner Program'}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {language === 'nl'
                        ? 'Architecten verdienen commissie wanneer hun bureau een project aanmaakt en een NOx rapport genereert. Commissie wordt overgemaakt naar de bankrekening van het bedrijf.'
                        : 'Architects earn commission when their firm creates a project and generates a NOx report. Commission is transferred to the company\'s bank account.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-3 flex flex-col justify-between">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
                  {language === 'nl' ? 'Volgende stap' : 'Next step'}
                </p>
                <div className="space-y-1.5">
                  <button
                    onClick={() => navigate('/pilot-demo/create-account')}
                    className="w-full flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors">
                    <Plus className="h-3 w-3" />
                    {language === 'nl' ? 'Workspace aanmaken' : 'Create Workspace'}
                  </button>
                  <button
                    onClick={() => setShowInviteManager(true)}
                    className="w-full flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium border border-border text-foreground hover:bg-muted/50 transition-colors">
                    <Send className="h-3 w-3" />
                    {language === 'nl' ? 'Manager uitnodigen' : 'Invite manager'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      <PaymentSuccessDialog open={showPaymentSuccessDialog} onOpenChange={setShowPaymentSuccessDialog} projectName={paymentProjectName} />
      <CreateNewProjectDialog
        open={showCreateProjectDialog}
        onOpenChange={setShowCreateProjectDialog}
        companyId={selectedCompanyId || ''}
        onProjectCreated={() => { setShowCreateProjectDialog(false); navigate('/dashboard/projects'); }} />
      <InviteManagerDialog open={showInviteManager} onOpenChange={setShowInviteManager} />
    </>
  );
}
