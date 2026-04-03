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
      tasks.push({ id: `ap-${p.id}`, title: `"${p.name}" - ${t('dashboard.client.awaitingPayment')}`, description: t('dashboard.client.followUpPayment'), action: () => navigate('/dashboard/projects', { state: { highlightProjectId: p.id, noxAction: 'pay' } }) });
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

         <main className="container mx-auto px-4 py-6">

          {/* Demo Marquee Banner */}
          <div className="relative rounded-xl bg-primary/5 py-2.5 mb-5 overflow-hidden">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
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
          <header className="mb-8">
            <p className="text-sm text-muted-foreground mb-0.5">
              {new Date().toLocaleDateString(language === 'nl' ? 'nl-BE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-3xl tracking-tight leading-[1.15] text-foreground font-semibold">
              {greeting()}, {currentUser?.name?.split(' ')[0]}.
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {language === 'nl'
                ? 'Welkom in de OxiCloud demo-omgeving. Verken de modules hieronder om het platform te leren kennen.'
                : 'Welcome to the OxiCloud demo environment. Explore the modules below to get to know the platform.'}
            </p>
          </header>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

            {/* Card 1 - Settings */}
            <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-6 flex flex-col group hover:border-foreground/15 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-foreground">
                  1
                </div>
                <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                  {language === 'nl' ? 'Ontdek de Workspace-instellingen' : 'See How Settings Work'}
                </h2>
              </div>
              <p className="text-[13px] text-muted-foreground leading-[1.6] flex-1 mb-6">
                {language === 'nl'
                  ? 'Bekijk hoe u uw organisatie, team en bedrijfsinformatie beheert.'
                  : 'Explore how you can manage your organization, team, and company information.'}
              </p>
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="w-full rounded-full px-4 py-2.5 text-sm font-medium border border-border text-foreground hover:bg-muted/50 transition-colors">
                {language === 'nl' ? 'Bekijk Instellingen' : 'Go to Settings'}
              </button>
            </div>

            {/* Card 2 - Projects */}
            <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-6 flex flex-col group hover:border-foreground/15 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-foreground">
                  2
                </div>
                <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                  {language === 'nl' ? 'Verken de Projectmap' : 'Explore the Project Binder'}
                </h2>
              </div>
              <p className="text-[13px] text-muted-foreground leading-[1.6] flex-1 mb-6">
                {language === 'nl'
                  ? 'Ontdek hoe OxiCloud uw projectdossier centraal organiseert.'
                  : 'Discover how OxiCloud organizes your project dossier in one central place.'}
              </p>
              <button
                onClick={() => navigate('/dashboard/projects')}
                className="w-full rounded-full px-4 py-2.5 text-sm font-medium border border-border text-foreground hover:bg-muted/50 transition-colors">
                {language === 'nl' ? 'Verken Projecten' : 'Explore Projects'}
              </button>
            </div>

            {/* Card 3 - Contacts */}
            <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-6 flex flex-col group hover:border-foreground/15 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-foreground">
                  3
                </div>
                <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                  {language === 'nl' ? 'Ervaar de Contactmodule' : 'Experience the Contact Module'}
                </h2>
              </div>
              <p className="text-[13px] text-muted-foreground leading-[1.6] flex-1 mb-6">
                {language === 'nl'
                  ? 'Bekijk hoe uw adresboek gestructureerd en gesynchroniseerd is over het platform.'
                  : 'See how your address book stays structured and synced across the platform.'}
              </p>
              <button
                onClick={() => navigate('/dashboard/contacts')}
                className="w-full rounded-full px-4 py-2.5 text-sm font-medium border border-border text-foreground hover:bg-muted/50 transition-colors">
                {language === 'nl' ? 'Bekijk Contacten' : 'View Contacts'}
              </button>
            </div>

            {/* Card 4 - Partner Program */}
            <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-6 flex flex-col group hover:border-foreground/15 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-foreground">
                  4
                </div>
                <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                  {language === 'nl' ? 'Word Partner' : 'Become a Partner'}
                </h2>
              </div>
              <p className="text-[13px] text-muted-foreground leading-[1.6] flex-1 mb-6">
                {language === 'nl'
                  ? 'Ontdek hoe het Partnerprogramma u helpt emissieanalyses in uw workflow te integreren.'
                  : 'Learn how the Partner Program helps you integrate emissions analysis into your workflow.'}
              </p>
              <button
                onClick={() => navigate('/dashboard/partnership-program')}
                className="w-full rounded-full px-4 py-2.5 text-sm font-medium border border-border text-foreground hover:bg-muted/50 transition-colors">
                {language === 'nl' ? 'Verken Partnerprogramma' : 'Explore Partner Program'}
              </button>
            </div>

            {/* Card 5 - Start Your Own Workspace (spans 2 cols, emphasized) */}
            <div className="md:col-span-2 rounded-2xl border-2 border-primary/30 bg-card/80 backdrop-blur-xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-primary-foreground" />
                </div>
                <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                  {language === 'nl' ? 'Start uw eigen Workspace' : 'Start Your Own Workspace'}
                </h2>
              </div>

              <p className="text-[13px] text-muted-foreground leading-[1.6] mt-2 mb-5 relative z-10">
                {language === 'nl'
                  ? 'Klaar om echte analyses uit te voeren? We koppelen uw Workspace automatisch aan uw bureau op basis van uw e-mail - of nodig uw manager uit.'
                  : 'Ready to run real analyses? We automatically link your Workspace to your firm based on your login email - or you can invite your manager if needed.'}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                <button
                  onClick={() => navigate('/pilot-demo/create-account')}
                  className="rounded-full px-5 py-3 text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:brightness-110">
                  {language === 'nl' ? 'Maak Workspace' : 'Create Workspace'}
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowInviteManager(true)}
                    className="flex-1 rounded-full px-5 py-3 text-sm font-semibold border-2 border-foreground/20 text-foreground hover:bg-muted/50 transition-colors">
                    {language === 'nl' ? 'Nodig mijn manager uit' : 'Invite My Manager'}
                  </button>
                  <div className="relative group">
                    <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center cursor-help hover:bg-muted/50 transition-colors shrink-0">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-foreground text-background text-xs p-2.5 leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 shadow-lg">
                      {language === 'nl'
                        ? 'Uw manager ontvangt een e-mail om uw Workspace aan het bureau te koppelen.'
                        : 'Your manager will get an email to link your Workspace to the firm.'}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground/60 leading-relaxed relative z-10">
                <span className="font-medium text-muted-foreground/80">Tip:</span>{' '}
                {language === 'nl'
                  ? 'Als freelancer behoort uw Workspace aan u en worden partnerafrekeningen rechtstreeks aan u toegewezen. Als werknemer worden deze afrekeningen toegewezen aan de Workspace-eigenaar - nodig uw manager uit zodat uw bureau correct gekoppeld is en erkenning krijgt.'
                  : 'As a freelancer, your Workspace belongs to you and partner settlements are assigned directly to you. As an employee, these settlements are assigned to the Workspace owner - invite your manager to ensure your firm is properly linked and receives recognition.'}
              </p>
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