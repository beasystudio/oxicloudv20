import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Plus, ArrowRight, Clock, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getPilotSession, getPilotUser, getPilotCompany, getPilotOnboarding, getPilotStats, getPilotProjects, getPilotEmployees } from '@/lib/pilotSessionStore';
import { PilotNavigation } from '@/components/pilot/PilotNavigation';
import { PilotOnboardingFlow1 } from '@/components/pilot/PilotOnboardingFlow1';
import { PilotOnboardingFlow2 } from '@/components/pilot/PilotOnboardingFlow2';
import { useLanguage } from '@/i18n/LanguageContext';

export default function PilotDashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeOnboarding, setActiveOnboarding] = useState<1 | 2 | 3 | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const session = getPilotSession();
  const user = getPilotUser();
  const company = getPilotCompany();
  const onboarding = getPilotOnboarding();
  const stats = getPilotStats();
  const projects = getPilotProjects();
  const employees = getPilotEmployees();

  useEffect(() => {
    if (!session || !user) {
      navigate('/pilot-demo');
      return;
    }
    if (!onboarding.flow1Complete && onboarding.currentStep === 0) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleStartOnboarding = () => {
    setShowWelcomeModal(false);
    setActiveOnboarding(1);
  };
  const handleSkipOnboarding = () => {
    setShowWelcomeModal(false);
  };

  const startTransition = () => {
    setShowTransition(true);
    setTransitionProgress(0);
    const interval = setInterval(() => {
      setTransitionProgress((prev) => {
        if (prev >= 100) {clearInterval(interval);return 100;}
        return prev + 2;
      });
    }, 50);
  };

  const handleTransitionContinue = () => {
    setShowTransition(false);
    setTransitionProgress(0);
    setActiveOnboarding(2);
  };

  const handleTransitionLater = () => {
    setShowTransition(false);
    setTransitionProgress(0);
  };

  const handleOnboardingComplete = (flow: 1 | 2 | 3) => {
    setActiveOnboarding(null);
    if (flow === 1 && !onboarding.flow2Complete) {
      setTimeout(() => startTransition(), 300);
    } else if (flow === 2) {
      navigate('/pilot-demo/projects');
    }
  };

  // Pending tasks based on NOx status
  const pendingTasks = useMemo(() => {
    const tasks: {id: string;title: string;description: string;action: () => void;}[] = [];

    projects.filter((p) => p.noxStatus === 'awaiting_payment').forEach((p) => {
      tasks.push({
        id: `ap-${p.id}`,
        title: `"${p.name}" — ${t('pilot.dashboard.awaitingPayment')}`,
        description: t('pilot.dashboard.followUpPayment'),
        action: () => navigate('/pilot-demo/projects', { state: { highlightProjectId: p.id, noxAction: 'pay' } })
      });
    });

    projects.filter((p) => !p.noxStatus || p.noxStatus === 'input_completed' && !p.priceData).forEach((p) => {
      tasks.push({
        id: `ni-${p.id}`,
        title: `"${p.name}" — ${t('pilot.dashboard.inputIncomplete')}`,
        description: t('pilot.dashboard.fillPreEstimation'),
        action: () => navigate('/pilot-demo/projects', { state: { highlightProjectId: p.id, noxAction: 'pre-estimation' } })
      });
    });

    projects.filter((p) => p.noxStatus === 'report_in_progress').forEach((p) => {
      tasks.push({
        id: `ip-${p.id}`,
        title: `"${p.name}" — ${t('pilot.dashboard.reportInProgress')}`,
        description: t('pilot.dashboard.finishCalculation'),
        action: () => navigate('/pilot-demo/projects', { state: { highlightProjectId: p.id, noxAction: 'details' } })
      });
    });

    projects.filter((p) => p.noxStatus === 'paid').forEach((p) => {
      tasks.push({
        id: `pc-${p.id}`,
        title: `"${p.name}" — ${t('pilot.dashboard.startCalculation')}`,
        description: t('pilot.dashboard.paymentReceivedStart'),
        action: () => navigate('/pilot-demo/projects', { state: { highlightProjectId: p.id, noxAction: 'details' } })
      });
    });

    return tasks;
  }, [projects, navigate, t]);

  if (!session || !user || !company) return null;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('pilot.dashboard.goodMorning');
    if (hour < 18) return t('pilot.dashboard.goodAfternoon');
    return t('pilot.dashboard.goodEvening');
  };

  // Smart insights
  const smartInsights = (() => {
    const insights: {text: string;type: 'warning' | 'positive' | 'neutral';}[] = [];
    const missing = projects.filter((p) => !p.noxStatus || p.noxStatus === 'input_completed');
    if (missing.length > 0) insights.push({ text: `${t('pilot.dashboard.noxMissing')} ${missing.length} ${missing.length === 1 ? t('pilot.dashboard.activeProject') : t('pilot.dashboard.activeProjects')}`, type: 'warning' });
    const awaiting = projects.filter((p) => p.noxStatus === 'awaiting_payment');
    if (awaiting.length > 0) insights.push({ text: `${awaiting.length} ${awaiting.length === 1 ? t('pilot.dashboard.projectWaiting') : t('pilot.dashboard.projectsWaiting')}`, type: 'warning' });
    const delivered = projects.filter((p) => p.noxStatus === 'report_delivered');
    if (delivered.length > 0) insights.push({ text: `${delivered.length} ${delivered.length === 1 ? t('pilot.dashboard.reportDelivered') : t('pilot.dashboard.reportsDelivered')}`, type: 'positive' });
    if (stats.teamSize > 1) insights.push({ text: `${language === 'nl' ? 'Uw team telt' : 'Your team has'} ${stats.teamSize} ${t('pilot.dashboard.activeMembers')}`, type: 'neutral' });
    return insights.slice(0, 4);
  })();

  // Recent activities
  const recentActivities = (() => {
    const a: {label: string;time: string;}[] = [];
    if (projects.some((p) => p.noxStatus === 'report_delivered')) a.push({ label: language === 'nl' ? 'NOx rapport afgeleverd' : 'NOx report delivered', time: language === 'nl' ? '2 uur geleden' : '2 hours ago' });
    if (projects.some((p) => p.noxStatus === 'paid')) a.push({ label: language === 'nl' ? 'Betaling ontvangen' : 'Payment received', time: language === 'nl' ? 'Gisteren' : 'Yesterday' });
    if (stats.teamSize > 1) a.push({ label: language === 'nl' ? 'Nieuw teamlid toegevoegd' : 'New team member added', time: language === 'nl' ? '3 dagen geleden' : '3 days ago' });
    if (a.length === 0) a.push({ label: language === 'nl' ? 'Account aangemaakt' : 'Account created', time: language === 'nl' ? 'Vandaag' : 'Today' });
    return a;
  })();

  const todoCount = pendingTasks.length || 0;
  const noxDelivered = projects.filter((p) => p.noxStatus === 'report_delivered').length;

  // Setup checklist
  const setupSteps = [
  { key: 'company', label: t('pilot.dashboard.companyDetails'), description: t('pilot.dashboard.setupCompanyDesc'), done: onboarding.flow1Complete, flow: 1 as const },
  { key: 'team', label: t('pilot.dashboard.teamMembers'), description: t('pilot.dashboard.addTeamDesc'), done: onboarding.flow1Complete, flow: 1 as const },
  { key: 'project', label: t('pilot.dashboard.firstProject'), description: t('pilot.dashboard.createProjectDesc'), done: onboarding.flow2Complete, flow: 2 as const }];

  const completedSteps = setupSteps.filter((s) => s.done).length;
  const isFirstTimeUser = !onboarding.flow1Complete || !onboarding.flow2Complete;

  const displayActions = pendingTasks.length > 0 ? pendingTasks : [
  { id: '1', title: `"Renovatie Villa Mechelen" — ${t('pilot.dashboard.inputIncomplete')}`, description: t('pilot.dashboard.fillPreEstimation'), action: () => {} }];


  // Summary line
  const summaryLine = (() => {
    const parts: string[] = [];
    if (pendingTasks.length > 0) parts.push(`${pendingTasks.length} ${language === 'nl' ? 'openstaande acties' : 'open actions'}`);
    if (stats.activeProjects > 0) parts.push(`${stats.activeProjects} ${language === 'nl' ? 'actieve projecten' : 'active projects'}`);
    return parts.length > 0 ? `${language === 'nl' ? 'U heeft' : 'You have'} ${parts.join(` ${language === 'nl' ? 'en' : 'and'} `)}` : null;
  })();

  return (
    <>
      <Helmet>
        <title>{company.name} - OxiCloud</title>
        <meta name="description" content="Your production workspace" />
      </Helmet>

      <div className="h-[100dvh] overflow-hidden bg-background flex flex-col">
        <PilotNavigation onStartOnboarding={(flow) => {
          if (flow === 3) {
            navigate('/pilot-demo/projects');
          } else {
            setActiveOnboarding(flow);
          }
        }} />

        <main className="flex-1 min-h-0 overflow-hidden container mx-auto px-4 py-5 flex flex-col">

          {/* Header — matches production */}
          <header className="mb-4 shrink-0">
            <p className="text-sm text-muted-foreground mb-0.5">
              {new Date().toLocaleDateString(language === 'nl' ? 'nl-BE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-3xl tracking-tight leading-[1.15] text-foreground font-semibold text-balance">
              {greeting()},<br />{user.firstName}.
            </h1>
            {summaryLine && <p className="text-sm text-muted-foreground mt-1">{summaryLine}</p>}
          </header>

          {/* Bento Grid — fills remaining viewport (matches production 3-column grid) */}
          <div
            className="flex-1 min-h-0 grid gap-2"
            style={{
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: 'auto auto auto 1fr'
            }}>
            

            {/* ═══ ROW 1: Insights (2col) + New Project / Todo (1col) ═══ */}
            <div
              className="rounded-2xl p-4 flex flex-col justify-center bg-white text-primary-foreground"
              style={{ gridColumn: '1 / 3', gridRow: '1' }}>
              
              <p className="text-xs uppercase tracking-[0.12em] mb-3 text-primary-foreground">
                {language === 'nl' ? 'SLIMME INZICHTEN' : 'SMART INSIGHTS'}
              </p>
              <div className="space-y-2">
                {(smartInsights.length > 0 ? smartInsights : [
                { text: language === 'nl' ? 'NOx rapport ontbreekt bij 1 actief project' : 'NOx report missing for 1 active project', type: 'warning' as const },
                { text: language === 'nl' ? 'Uw team telt 2 actieve leden' : 'Your team has 2 active members', type: 'neutral' as const }]).
                map((insight, i) =>
                <div key={i} className="flex items-start gap-2">
                    <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                  insight.type === 'warning' ? 'bg-background/50' : 'bg-background/25'
                  )} />
                    <p className="text-sm leading-relaxed text-secondary">{insight.text}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2" style={{ gridColumn: '3', gridRow: '1' }}>
              <button
                onClick={() => setActiveOnboarding(2)}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors whitespace-nowrap">
                
                <Plus className="h-3.5 w-3.5" />
                {language === 'nl' ? 'Nieuw Project' : 'New Project'}
              </button>
              <div className="flex-1 rounded-xl border border-border p-3.5 flex flex-col justify-between min-h-[60px]">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">TODO</p>
                <span className="text-2xl font-semibold text-foreground leading-none">{todoCount || 1}</span>
              </div>
            </div>

            {/* ═══ ROW 2: Team stat ═══ */}
            <div className="rounded-2xl border border-border p-4 flex flex-col justify-between" style={{ gridColumn: '1', gridRow: '2' }}>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">TEAM</p>
              <div>
                <p className="text-2xl font-semibold text-foreground leading-none">{stats.teamSize}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{t('pilot.dashboard.activeMembers')}</p>
              </div>
            </div>

            {/* Recent Activity (spans rows 2-3, cols 2-3) */}
            <div
              className="rounded-2xl border border-border p-3.5"
              style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}>
              
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">{language === 'nl' ? 'RECENTE ACTIVITEIT' : 'RECENT ACTIVITY'}</p>
              <div className="space-y-1">
                {recentActivities.map((item, i) =>
                <div key={i} className="flex items-center justify-between py-2 px-1">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className="text-sm text-muted-foreground whitespace-nowrap ml-3">{item.time}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ ROW 3: Projects stat ═══ */}
            <div className="rounded-2xl border border-border p-4 flex flex-col justify-between" style={{ gridColumn: '1', gridRow: '3' }}>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{language === 'nl' ? 'PROJECTEN' : 'PROJECTS'}</p>
              <div>
                <p className="text-2xl font-semibold text-foreground leading-none">{stats.totalProjects}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stats.activeProjects} {language === 'nl' ? 'actief' : 'active'}</p>
              </div>
            </div>

            {/* ═══ ROW 4: Setup OR Action Required — full width (bottom) ═══ */}
            {isFirstTimeUser ?
            <div
              className="rounded-2xl border border-border p-4 overflow-y-auto"
              style={{ gridColumn: '1 / 4', gridRow: '4' }}>
              
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-semibold">{t('pilot.dashboard.completeConfig')}</h2>
                    <p className="text-sm text-muted-foreground">{t('pilot.dashboard.setupWorkspace')}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{completedSteps}/{setupSteps.length}</span>
                </div>
                <div className="space-y-1">
                  {setupSteps.map((step, index) =>
                <button key={step.key} onClick={() => setActiveOnboarding(step.flow)} className={cn("w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors", step.done ? "opacity-40" : "hover:bg-muted/50")}>
                      <div className={cn("w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px]", step.done ? "bg-foreground text-background" : "border border-border text-muted-foreground")}>
                        {step.done ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", step.done && "line-through text-muted-foreground")}>{step.label}</p>
                      </div>
                    </button>
                )}
                </div>
              </div> :

            <div
              className="rounded-2xl border border-border p-4 overflow-y-auto"
              style={{ gridColumn: '1 / 4', gridRow: '4' }}>
              
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{language === 'nl' ? 'ACTIE VEREIST' : 'ACTION REQUIRED'}</span>
                  <span className="text-sm text-muted-foreground">{displayActions.length}</span>
                </div>
                <div className="space-y-0.5">
                  {displayActions.map((task) =>
                <button
                  key={task.id}
                  onClick={task.action}
                  className="w-full flex items-start gap-2 px-1.5 py-2 text-left rounded-lg hover:bg-muted/50 transition-colors">
                  
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-muted-foreground/30" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </button>
                )}
                </div>
              </div>
            }
          </div>
        </main>
      </div>

      {/* Welcome Modal */}
      {showWelcomeModal &&
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">{t('pilot.dashboard.welcome')}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('pilot.dashboard.welcomeDesc')}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {[t('pilot.dashboard.stepCompany'), t('pilot.dashboard.stepTeam'), t('pilot.dashboard.stepProject')].map((step, i) =>
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-5 w-5 rounded-full border border-border bg-muted flex items-center justify-center shrink-0 text-xs font-medium text-foreground">
                      {i + 1}
                    </div>
                    {step}
                  </div>
              )}
              </div>
              <div className="flex gap-2.5 pt-1">
                <Button variant="ghost" size="sm" onClick={handleSkipOnboarding} className="flex-1 text-muted-foreground hover:text-foreground">
                  {t('pilot.dashboard.later')}
                </Button>
                <Button onClick={handleStartOnboarding} size="sm" className="flex-1 font-medium">
                  {t('pilot.dashboard.startSetup')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      }

      {/* Onboarding Flows */}
      {activeOnboarding === 1 && <PilotOnboardingFlow1 onComplete={() => handleOnboardingComplete(1)} onClose={() => setActiveOnboarding(null)} />}
      {activeOnboarding === 2 && <PilotOnboardingFlow2 onComplete={() => handleOnboardingComplete(2)} onClose={() => setActiveOnboarding(null)} />}

      {/* Transition Screen */}
      <AnimatePresence>
        {showTransition &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          
            <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}>
            
              <Card className="max-w-md w-full p-8 text-center space-y-6 border-border/50 shadow-xl">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">{t('pilot.dashboard.companyTeamSetup')}</span>
                  </div>
                  <h2 className="text-2xl font-semibold">{t('pilot.dashboard.readyForProject')}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t('pilot.dashboard.readyForProjectDesc')}
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Progress value={transitionProgress} className="h-1.5" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col gap-3">
                  <Button onClick={handleTransitionContinue} size="lg" className="w-full h-12 gap-2">
                    {t('pilot.dashboard.createProject')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={handleTransitionLater} className="text-muted-foreground">
                    {t('pilot.dashboard.doThisLater')}
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}