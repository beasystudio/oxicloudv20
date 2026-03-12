import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { TopNavigation } from '@/components/TopNavigation';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';
import { getEmployeesByCompany, getCompanyStats, isCompanyDataSeeded, type CompanyEmployee } from '@/lib/mockCompanyDB';
import { getSettingsStatus, type SettingsStatus } from '@/lib/settingsValidator';
import { getNoxProjects, type NoxProject } from '@/lib/noxProjectStore';
import { cn } from '@/lib/utils';
import { isPilotAccount, isPilotCompany, getEmptyStats } from '@/lib/pilotAccountUtils';
import { PaymentSuccessDialog } from '@/components/oxicloud/PaymentSuccessDialog';
import { CreateNewProjectDialog } from '@/components/projects/CreateNewProjectDialog';
import { InviteManagerDialog } from '@/components/demo/InviteManagerDialog';


export default function ClientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, selectedCompanyId, getSelectedCompany, login } = useMockAuth();

  // Auto-login as Jan when accessing /dashboard/demo without a mock user
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
    const state = location.state as {showPaymentSuccess?: boolean;projectName?: string;} | null;
    if (state?.showPaymentSuccess) {
      setShowPaymentSuccessDialog(true);
      setPaymentProjectName(state.projectName || '');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (isPilot) {
      setEmployees([]);setStats(getEmptyStats());setNoxProjects([]);
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

  /* ── Computed data ── */
  const pendingTasks = useMemo(() => {
    const tasks: {id: string;title: string;description: string;action: () => void;}[] = [];
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
    const insights: {text: string;type: 'warning' | 'positive' | 'neutral';}[] = [];
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
    const a: {label: string;time: string;}[] = [];
    if (noxProjects.some((p) => p.noxData?.status === 'report_delivered')) a.push({ label: t('dashboard.client.reportDelivered'), time: `2${t('dashboard.client.hoursAgo')}` });
    if (noxProjects.some((p) => p.noxData?.status === 'paid')) a.push({ label: t('dashboard.client.paymentReceived'), time: t('dashboard.client.yesterday') });
    if (stats.totalEmployees > 1) a.push({ label: t('dashboard.client.newTeamMember'), time: `3 ${t('dashboard.client.daysAgo')}` });
    if (a.length === 0) a.push({ label: t('dashboard.client.accountCreated'), time: t('dashboard.client.today') });
    return a;
  }, [noxProjects, stats.totalEmployees, t]);

  const noxDelivered = noxProjects.filter((p) => p.noxData?.status === 'report_delivered').length;

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
  { key: 'contacts', label: t('dashboard.client.contactTypes'), description: t('dashboard.client.configureContacts'), done: settingsStatus.contacts, path: '/dashboard/settings', tab: 'contacts' }];

  const completedSteps = setupSteps.filter((s) => s.done).length;
  const isFirstTimeUser = !settingsStatus.allComplete;

  const displayActions = pendingTasks.length > 0 ? pendingTasks : [
  { id: '1', title: `"Renovatie Villa Mechelen" — ${t('dashboard.client.inputIncomplete')}`, description: t('dashboard.client.fillPreEstimation'), action: () => {} }];


  return (
    <>
      <Helmet>
        <title>{selectedCompany?.name || 'Dashboard'} - OxiCloud</title>
      </Helmet>

      <div className="h-[100dvh] overflow-hidden bg-background flex flex-col">
        <TopNavigation />

        <main className="flex-1 min-h-0 overflow-y-auto container mx-auto px-5 py-6 max-w-[1120px]">

          {/* Demo Marquee Banner */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 py-2.5 mb-5 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {Array.from({ length: 4 }).map((_, i) =>
              <span key={i} className="flex items-center gap-6 mx-6 text-[13px] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {language === 'nl' ? 'U verkent momenteel de OxiCloud Demo-omgeving.' : 'You are currently exploring the OxiCloud Demo Environment.'}
                  </span>
                  <span>
                    {language === 'nl' ? 'Alle data is fictief. Maak een Workspace aan om echt aan de slag te gaan.' : 'All data is fictional. Create a Workspace to start working for real.'}
                  </span>
                  <span className="text-primary">•</span>
                </span>
              )}
            </div>
          </div>

          {/* Header */}
          <header className="mb-6">
            <p className="text-sm text-muted-foreground mb-0.5">
              {new Date().toLocaleDateString(language === 'nl' ? 'nl-BE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-3xl tracking-tight leading-[1.15] text-foreground font-semibold">
              {greeting()}, {currentUser?.name?.split(' ')[0]}.
            </h1>
            {summaryLine && <p className="text-sm text-muted-foreground mt-1">{summaryLine}</p>}
          </header>

          {/* KPI Row */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="rounded-xl border border-border p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">Team</p>
              <p className="text-2xl font-semibold text-foreground leading-none">{stats.totalEmployees || 6}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('dashboard.client.activeMembers')}</p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">{t('dashboard.nav.projects')}</p>
              <p className="text-2xl font-semibold text-foreground leading-none">{stats.totalProjects || 3}</p>
              <p className="text-sm text-muted-foreground mt-1">{stats.activeProjects || 2} {language === 'nl' ? 'actief' : 'active'}</p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">To do</p>
              <p className="text-2xl font-semibold text-foreground leading-none">{todoCount}</p>
              <p className="text-sm text-muted-foreground mt-1">{language === 'nl' ? 'openstaand' : 'pending'}</p>
            </div>
          </div>

          {/* Two-column: Actions + Next Step */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {/* Action Required */}
            <div className="col-span-2 rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('dashboard.client.actionRequired')}</p>
                <span className="text-xs text-muted-foreground">{displayActions.length}</span>
              </div>
              <div className="space-y-1">
                {displayActions.map((task) =>
                <button
                  key={task.id}
                  onClick={task.action}
                  className="w-full flex items-start gap-3 py-2.5 text-left rounded-lg hover:bg-muted/40 transition-colors px-2 -mx-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0 bg-muted-foreground/30" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{task.title}</p>
                      <p className="text-[13px] text-muted-foreground mt-0.5">{task.description}</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Partner Card */}
            <div className="rounded-xl border border-border p-5 flex flex-col items-center text-center">
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 max-w-[240px]">
                {language === 'nl'
                  ? 'Verdien automatisch commissie op elk NOx-rapport. Geen voorschot, geen admin.'
                  : 'Earn automatic commission on every NOx report. No upfront cost, no admin.'}
              </p>
              <button
                onClick={() => navigate('/dashboard/partnership-program')}
                className="text-sm font-semibold text-primary hover:underline mb-4">
                {language === 'nl' ? 'Bekijk OxiCloud Partnerprogramma' : 'View OxiCloud Partnership Program'}
              </button>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => navigate('/register/workspace')}
                  className="w-full rounded-xl px-4 py-3 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors">
                  {language === 'nl' ? 'Maak mijn Workspace' : 'Create my Workspace'}
                </button>
                <button
                  onClick={() => setShowInviteManager(true)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium border border-border text-foreground hover:bg-muted/50 transition-colors">
                  {language === 'nl' ? 'Nodig mijn manager uit' : 'Invite my manager'}
                </button>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-xl border border-border p-5 mb-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">
              {t('dashboard.client.smartInsights')}
            </p>
            <div className="space-y-2">
              {(smartInsights.length > 0 ? smartInsights : [
              { text: language === 'nl' ? 'NOx rapport ontbreekt bij 1 actief project' : 'NOx report missing for 1 active project', type: 'warning' as const },
              { text: language === 'nl' ? 'Uw team telt 6 actieve leden' : 'Your team has 6 active members', type: 'neutral' as const }]).
              map((insight, i) =>
              <div key={i} className="flex items-start gap-2.5">
                  <span className={cn('w-1.5 h-1.5 rounded-full mt-[7px] shrink-0',
                insight.type === 'warning' ? 'bg-foreground/50' : 'bg-foreground/20'
                )} />
                  <p className="text-sm leading-relaxed text-muted-foreground">{insight.text}</p>
                </div>
              )}
            </div>
          </div>

          {/* Partner Program */}
          








          

          {/* Setup Checklist */}
          {isFirstTimeUser && isClientOwnerOrAdmin &&
          <div className="rounded-xl border border-border p-5 mb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold">{t('dashboard.client.completeSetup')}</h2>
                  <p className="text-sm text-muted-foreground">{t('dashboard.client.setupWorkspace')}</p>
                </div>
                <span className="text-sm text-muted-foreground">{completedSteps}/{setupSteps.length}</span>
              </div>
              <div className="space-y-1">
                {setupSteps.map((step, index) =>
              <button key={step.key} onClick={() => navigate(step.path, { state: { activeTab: step.tab } })} className={cn("w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors", step.done ? "opacity-40" : "hover:bg-muted/40")}>
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px]", step.done ? "bg-foreground text-background" : "border border-border text-muted-foreground")}>
                      {step.done ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                    </div>
                    <p className={cn("text-sm", step.done && "line-through text-muted-foreground")}>{step.label}</p>
                  </button>
              )}
              </div>
            </div>
          }
        </main>
      </div>

      <PaymentSuccessDialog open={showPaymentSuccessDialog} onOpenChange={setShowPaymentSuccessDialog} projectName={paymentProjectName} />
      <CreateNewProjectDialog
        open={showCreateProjectDialog}
        onOpenChange={setShowCreateProjectDialog}
        companyId={selectedCompanyId || ''}
        onProjectCreated={() => {setShowCreateProjectDialog(false);navigate('/dashboard/projects');}} />
      <InviteManagerDialog open={showInviteManager} onOpenChange={setShowInviteManager} />
    </>);

}