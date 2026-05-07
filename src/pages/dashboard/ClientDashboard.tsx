import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { TopNavigation } from '@/components/TopNavigation';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Settings, FolderKanban, Users, Trophy, Plus, Info } from 'lucide-react';
import { getEmployeesByCompany, getCompanyStats, isCompanyDataSeeded, type CompanyEmployee } from '@/lib/mockCompanyDB';
import { getSettingsStatus, type SettingsStatus } from '@/lib/settingsValidator';
import { getNoxProjects, type NoxProject } from '@/lib/noxProjectStore';
import { cn } from '@/lib/utils';
import { isDemoEnvironmentUser, isPilotAccount, isPilotCompany, getEmptyStats } from '@/lib/pilotAccountUtils';
import { DemoWelcomeModal } from '@/components/demo/DemoWelcomeModal';
import { PaymentSuccessDialog } from '@/components/oxicloud/PaymentSuccessDialog';
import { CreateNewProjectDialog } from '@/components/projects/CreateNewProjectDialog';
import { InviteManagerDialog } from '@/components/demo/InviteManagerDialog';


export default function ClientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, selectedCompanyId, getSelectedCompany, login } = useMockAuth();

  // Demo route behavior:
  // - users with an existing workspace are redirected to production workspace
  // - users without one can still explore demo as Jan
  useEffect(() => {
    let isMounted = true;

    const handleDemoEntry = async () => {
      if (currentUser || location.pathname !== '/dashboard/demo') return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (session?.user) {
        const { data: profile } = await supabase.
        from('profiles').
        select('workspace_id').
        eq('id', session.user.id).
        single();

        if (!isMounted) return;

        if (profile?.workspace_id) {
          navigate('/dashboard/partner', { replace: true });
          return;
        }
      }

      login('jan@gdesign.be', 'demo123');
    };

    void handleDemoEntry();

    return () => {
      isMounted = false;
    };
  }, [currentUser, location.pathname, login, navigate]);
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
  const [showDemoWelcomeModal, setShowDemoWelcomeModal] = useState(false);

  const selectedCompany = getSelectedCompany();
  const isClientOwnerOrAdmin = currentUser?.role === 'client_owner' || currentUser?.role === 'client_admin';
  const isPilot = isPilotAccount(currentUser?.email) || isPilotCompany(selectedCompanyId);

  useEffect(() => {
    if (currentUser && isDemoEnvironmentUser(currentUser.email) && sessionStorage.getItem('oxicloud_demo_welcome_dismissed') !== 'true') {
      setShowDemoWelcomeModal(true);
    }
  }, [currentUser]);

  const dismissDemoWelcomeModal = () => {
    sessionStorage.setItem('oxicloud_demo_welcome_dismissed', 'true');
    setShowDemoWelcomeModal(false);
  };

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
      tasks.push({ id: `ap-${p.id}`, title: `"${p.name}" - ${t('dashboard.client.awaitingSignature')}`, description: t('dashboard.client.followUpSignature'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'pay' } }) });
    });
    noxProjects.filter((p) => !p.noxData || p.noxData.status === 'input_completed' && !p.noxData.priceData).forEach((p) => {
      tasks.push({ id: `ni-${p.id}`, title: `"${p.name}" - ${t('dashboard.client.inputIncomplete')}`, description: t('dashboard.client.fillPreEstimation'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'pre-estimation' } }) });
    });
    noxProjects.filter((p) => p.noxData?.status === 'price_generated' || p.noxData?.status === 'input_completed' && p.noxData?.priceData).forEach((p) => {
      tasks.push({ id: `rq-${p.id}`, title: `"${p.name}" - ${t('dashboard.client.prepareQuote')}`, description: t('dashboard.client.generateAndSend'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'payment' } }) });
    });
    noxProjects.filter((p) => p.noxData?.status === 'report_in_progress').forEach((p) => {
      tasks.push({ id: `ip-${p.id}`, title: `"${p.name}" - ${t('dashboard.client.reportInProgress')}`, description: t('dashboard.client.finishCalculation'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'details' } }) });
    });
    noxProjects.filter((p) => p.noxData?.status === 'paid' && !p.noxData?.detailedCalculation).forEach((p) => {
      tasks.push({ id: `pc-${p.id}`, title: `"${p.name}" - ${t('dashboard.client.startCalculation')}`, description: t('dashboard.client.paymentReceivedStart'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'details' } }) });
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
  { id: '1', title: `"Renovatie Villa Mechelen" - ${t('dashboard.client.inputIncomplete')}`, description: t('dashboard.client.fillPreEstimation'), action: () => {} }];


  return (
    <>
      <Helmet>
        <title>{selectedCompany?.name || 'Dashboard'} - OxiCloud</title>
      </Helmet>

       <div className="min-h-screen bg-background">
        <TopNavigation />

         <main className="container mx-auto px-4 py-5">

          {/* Demo Marquee Banner */}
          <div className="relative rounded-lg bg-muted/40 py-1.5 mb-4 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="flex animate-marquee whitespace-nowrap">
              {Array.from({ length: 4 }).map((_, i) =>
              <span key={i} className="flex items-center gap-5 mx-5 text-[12px] text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {language === 'nl' ? 'U verkent momenteel de OxiCloud Demo-omgeving.' : 'You are currently exploring the OxiCloud Demo Environment.'}
                  </span>
                  <span>
                    {language === 'nl' ? 'Alle data is fictief. Maak een Workspace aan om echt aan de slag te gaan.' : 'All data is fictional. Create a Workspace to start working for real.'}
                  </span>
                  <span className="text-muted-foreground">•</span>
                </span>
              )}
            </div>
          </div>

          {/* Header */}
          <header className="mb-5 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {new Date().toLocaleDateString(language === 'nl' ? 'nl-BE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-2xl tracking-tight leading-tight text-foreground font-semibold">
                {greeting()}, {currentUser?.name?.split(' ')[0]}.
              </h1>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              {language === 'nl'
                ? 'Verken de modules hieronder om het OxiCloud-platform te leren kennen.'
                : 'Explore the modules below to get to know the OxiCloud platform.'}
            </p>
          </header>

          {/* Compact module cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            {[
              { n: 1, title: language === 'nl' ? 'Workspace-instellingen' : 'Settings',
                desc: language === 'nl' ? 'Beheer organisatie, team en bedrijfsinformatie.' : 'Manage organization, team and company info.',
                cta: language === 'nl' ? 'Bekijk' : 'Open', path: '/dashboard/settings' },
              { n: 2, title: language === 'nl' ? 'Projectmap' : 'Project Binder',
                desc: language === 'nl' ? 'Centraal projectdossier voor uw werk.' : 'Your project dossier in one place.',
                cta: language === 'nl' ? 'Verken' : 'Explore', path: '/dashboard/projects' },
              { n: 3, title: language === 'nl' ? 'Contactmodule' : 'Contacts',
                desc: language === 'nl' ? 'Adresboek gesynchroniseerd over het platform.' : 'Address book synced across the platform.',
                cta: language === 'nl' ? 'Bekijk' : 'Open', path: '/dashboard/contacts' },
              { n: 4, title: language === 'nl' ? 'Partnerprogramma' : 'Partner Program',
                desc: language === 'nl' ? 'Integreer emissieanalyses in uw workflow.' : 'Integrate emissions analysis in your workflow.',
                cta: language === 'nl' ? 'Verken' : 'Explore', path: '/dashboard/partnership-program', highlight: true },
            ].map((c) => (
              <button
                key={c.n}
                onClick={() => navigate(c.path)}
                className={cn(
                  "group text-left rounded-xl border bg-card p-4 flex flex-col gap-2 transition-colors hover:border-foreground/30",
                  c.highlight ? "border-foreground/20 bg-muted/30" : "border-border/40"
                )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                    c.highlight ? "bg-foreground text-background" : "bg-muted text-foreground"
                  )}>
                    {c.n}
                  </div>
                  <h2 className="text-[13px] font-semibold text-foreground tracking-tight truncate">{c.title}</h2>
                </div>
                <p className="text-[12px] text-muted-foreground leading-snug flex-1">{c.desc}</p>
                <span className="text-[12px] font-medium text-foreground/80 group-hover:text-foreground inline-flex items-center gap-1">
                  {c.cta} <span aria-hidden>→</span>
                </span>
              </button>
            ))}
          </div>

          {/* Highlight: Start your own Workspace */}
          <div className="rounded-xl border border-foreground/15 bg-card p-4 sm:p-5 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-background" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
                    {language === 'nl' ? 'Start uw eigen Workspace' : 'Start Your Own Workspace'}
                  </h2>
                  <p className="text-[12px] text-muted-foreground leading-snug mt-1">
                    {language === 'nl'
                      ? 'Klaar voor echte analyses? We koppelen uw Workspace automatisch aan uw bureau - of nodig uw manager uit.'
                      : 'Ready for real analyses? We auto-link your Workspace to your firm - or invite your manager.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:shrink-0">
                <button
                  onClick={() => navigate('/pilot-demo/create-account')}
                  className="rounded-full px-4 py-2 text-[13px] font-semibold bg-foreground text-background hover:opacity-90 transition-opacity">
                  {language === 'nl' ? 'Maak Workspace' : 'Create Workspace'}
                </button>
                <button
                  onClick={() => setShowInviteManager(true)}
                  className="rounded-full px-4 py-2 text-[13px] font-medium border border-border text-foreground hover:bg-muted/50 transition-colors">
                  {language === 'nl' ? 'Nodig manager uit' : 'Invite Manager'}
                </button>
                <div className="relative group">
                  <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center cursor-help hover:bg-muted/50 transition-colors shrink-0">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="absolute bottom-full right-0 mb-2 w-60 rounded-lg bg-foreground text-background text-[11px] p-2.5 leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 shadow-lg">
                    {language === 'nl'
                      ? 'Als freelancer is de Workspace van u. Als werknemer: nodig uw manager uit zodat uw bureau correct gekoppeld is.'
                      : 'As a freelancer the Workspace is yours. As an employee, invite your manager so your firm is properly linked.'}
                  </div>
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
        onProjectCreated={() => {setShowCreateProjectDialog(false);navigate('/dashboard/projects');}} />
      <InviteManagerDialog open={showInviteManager} onOpenChange={setShowInviteManager} />
      {showDemoWelcomeModal && <DemoWelcomeModal onClose={dismissDemoWelcomeModal} />}
    </>);

}