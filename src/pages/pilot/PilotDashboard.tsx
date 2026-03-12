import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card as ShadCard } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getPilotSession, getPilotUser, getPilotCompany, getPilotOnboarding, getPilotStats, getPilotProjects, getPilotEmployees } from '@/lib/pilotSessionStore';
import { PilotNavigation } from '@/components/pilot/PilotNavigation';
import { PilotOnboardingFlow1 } from '@/components/pilot/PilotOnboardingFlow1';
import { PilotOnboardingFlow2 } from '@/components/pilot/PilotOnboardingFlow2';
import { useLanguage } from '@/i18n/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/* ── Primitives (matching Demo Environment) ── */
function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-2xl border border-border bg-card px-5 py-3.5 ${className}`} {...props}>
      {children}
    </div>);

}

function Label({ className = '', children }: {className?: string;children: React.ReactNode;}) {
  return (
    <p className={`text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground ${className}`}>
      {children}
    </p>);

}

const fade = (d: number) => ({ initial: { opacity: 0, y: 8 } as const, animate: { opacity: 1, y: 0 } as const, transition: { delay: d, duration: 0.3 } });

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

  // Pending tasks
  const pendingTasks = useMemo(() => {
    const tasks: {id: string;title: string;description: string;action: () => void;}[] = [];
    projects.filter((p) => p.noxStatus === 'awaiting_payment').forEach((p) => {
      tasks.push({ id: `ap-${p.id}`, title: `"${p.name}" — ${t('pilot.dashboard.awaitingPayment')}`, description: t('pilot.dashboard.followUpPayment'), action: () => navigate('/pilot-demo/projects', { state: { highlightProjectId: p.id, noxAction: 'pay' } }) });
    });
    projects.filter((p) => !p.noxStatus || p.noxStatus === 'input_completed' && !p.priceData).forEach((p) => {
      tasks.push({ id: `ni-${p.id}`, title: `"${p.name}" — ${t('pilot.dashboard.inputIncomplete')}`, description: t('pilot.dashboard.fillPreEstimation'), action: () => navigate('/pilot-demo/projects', { state: { highlightProjectId: p.id, noxAction: 'pre-estimation' } }) });
    });
    projects.filter((p) => p.noxStatus === 'report_in_progress').forEach((p) => {
      tasks.push({ id: `ip-${p.id}`, title: `"${p.name}" — ${t('pilot.dashboard.reportInProgress')}`, description: t('pilot.dashboard.finishCalculation'), action: () => navigate('/pilot-demo/projects', { state: { highlightProjectId: p.id, noxAction: 'details' } }) });
    });
    projects.filter((p) => p.noxStatus === 'paid').forEach((p) => {
      tasks.push({ id: `pc-${p.id}`, title: `"${p.name}" — ${t('pilot.dashboard.startCalculation')}`, description: t('pilot.dashboard.paymentReceivedStart'), action: () => navigate('/pilot-demo/projects', { state: { highlightProjectId: p.id, noxAction: 'details' } }) });
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

  const todoCount = pendingTasks.length || 1;

  const displayActions = pendingTasks.length > 0 ? pendingTasks : [
  { id: '1', title: `"Renovatie Villa Mechelen" — ${t('pilot.dashboard.inputIncomplete')}`, description: t('pilot.dashboard.fillPreEstimation'), action: () => {} }];


  // Setup checklist
  const setupSteps = [
  { key: 'company', label: t('pilot.dashboard.companyDetails'), done: onboarding.flow1Complete, flow: 1 as const },
  { key: 'team', label: t('pilot.dashboard.teamMembers'), done: onboarding.flow1Complete, flow: 1 as const },
  { key: 'project', label: t('pilot.dashboard.firstProject'), done: onboarding.flow2Complete, flow: 2 as const }];

  const completedSteps = setupSteps.filter((s) => s.done).length;
  const isFirstTimeUser = !onboarding.flow1Complete || !onboarding.flow2Complete;

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

      <div className="min-h-screen bg-background overflow-y-auto flex flex-col">
        <PilotNavigation onStartOnboarding={(flow) => {
          if (flow === 3) navigate('/pilot-demo/projects');else
          setActiveOnboarding(flow);
        }} />

        <div className="max-w-[1120px] mx-auto px-5 py-6 pb-16 w-full">

          {/* Greeting */}
          <motion.div {...fade(0.1)} className="mb-5">
            <p className="text-xs text-muted-foreground mb-0.5">
              {new Date().toLocaleDateString(language === 'nl' ? 'nl-BE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-[2rem] font-bold tracking-tight leading-[1.1] text-foreground">
              {greeting()},<br />{user.firstName}.
            </h1>
            {summaryLine && <p className="text-sm text-muted-foreground mt-1">{summaryLine}</p>}
          </motion.div>

          {/* Row 1: New Project + To Do */}
          <div className="grid grid-cols-12 gap-2.5 mb-2.5">
            <motion.div {...fade(0.15)} className="col-span-12 lg:col-span-7">
              


              
            </motion.div>

            <motion.div {...fade(0.18)} className="col-span-12 lg:col-span-5 flex flex-col gap-2.5">
              <button
                onClick={() => setActiveOnboarding(2)}
                className="h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm w-full shrink-0 transition-colors">
                
                {language === 'nl' ? 'Nieuw Project' : 'New Project'}
              </button>
              <Card>
                <Label>TODO</Label>
                
              </Card>
            </motion.div>
          </div>

          {/* Row 2: Team + Projects | Partner Program */}
          <div className="grid grid-cols-12 gap-2.5 mb-2.5">
            <motion.div {...fade(0.2)} className="col-span-12 lg:col-span-3 grid grid-rows-2 gap-2.5">
              <Card>
                <Label>TEAM</Label>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-1">{stats.teamSize}</p>
                <p className="text-xs text-muted-foreground">{t('pilot.dashboard.activeMembers')}</p>
              </Card>
              <Card>
                <Label>{language === 'nl' ? 'PROJECTEN' : 'PROJECTS'}</Label>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-1">{stats.totalProjects}</p>
                <p className="text-xs text-muted-foreground">{stats.activeProjects} {language === 'nl' ? 'actief' : 'active'}</p>
              </Card>
            </motion.div>

            <motion.div {...fade(0.22)} className="col-span-12 lg:col-span-9">
              <Card>
                <p className="text-sm font-semibold text-foreground">
                  {language === 'nl' ? 'OxiCloud Partner Programma' : 'OxiCloud Partner Program'}
                </p>
                <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                  {language === 'nl' ?
                  'Zet elk project om in omzet. Als OxiCloud-partner verdient uw bureau automatisch commissie bij elk gegenereerd NOx-rapport — zonder administratieve last. Bouwheren ontvangen een transparante offerte en betalen via overschrijving. Uw commissie wordt rechtstreeks op uw bedrijfsrekening gestort.' :
                  'Turn every project into revenue. As an OxiCloud partner, your firm earns a commission each time a NOx report is generated — automatically, with zero admin overhead. Clients receive a transparent quote and pay via bank transfer. Your commission settles directly to your company account.'}
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Row 3: Setup checklist (first-time) OR Action details */}
          {isFirstTimeUser ?
          <motion.div {...fade(0.25)} className="mb-2.5">
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{t('pilot.dashboard.completeConfig')}</h2>
                    <p className="text-xs text-muted-foreground">{t('pilot.dashboard.setupWorkspace')}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{completedSteps}/{setupSteps.length}</span>
                </div>
                <div className="space-y-1">
                  {setupSteps.map((step, index) =>
                <button
                  key={step.key}
                  onClick={() => setActiveOnboarding(step.flow)}
                  className={cn("w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors", step.done ? "opacity-40" : "hover:bg-muted/50")}>
                  
                      <div className={cn("w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px]", step.done ? "bg-foreground text-background" : "border border-border text-muted-foreground")}>
                        {step.done ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                      </div>
                      <p className={cn("text-sm", step.done && "line-through text-muted-foreground")}>{step.label}</p>
                    </button>
                )}
                </div>
              </Card>
            </motion.div> :

          <motion.div {...fade(0.25)} className="mb-2.5">
              <Card>
                <Label className="mb-2">{language === 'nl' ? 'OPENSTAANDE TAKEN' : 'OPEN TASKS'}</Label>
                <div className="space-y-0.5">
                  {displayActions.map((task) =>
                <button
                  key={task.id}
                  onClick={task.action}
                  className="w-full flex items-start gap-2 px-1.5 py-2 text-left rounded-lg hover:bg-muted/50 transition-colors">
                  
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-muted-foreground/30" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                    </button>
                )}
                </div>
              </Card>
            </motion.div>
          }

          {/* Footer */}
          <motion.div {...fade(0.3)}>
            <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground">
              {[
              language === 'nl' ? '100% gratis voor architecten' : '100% free for architects',
              language === 'nl' ? 'Geen abonnementen' : 'No subscriptions',
              language === 'nl' ? 'Geen kredietkaart' : 'No credit card'].
              map((t) =>
              <span key={t}>{t}</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Welcome Modal */}
      {showWelcomeModal &&
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">{t('pilot.dashboard.welcome')}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('pilot.dashboard.welcomeDesc')}</p>
              </div>
              <div className="space-y-2">
                {[t('pilot.dashboard.stepCompany'), t('pilot.dashboard.stepTeam'), t('pilot.dashboard.stepProject')].map((step, i) =>
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-5 w-5 rounded-full border border-border bg-muted flex items-center justify-center shrink-0 text-xs font-medium text-foreground">{i + 1}</div>
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
            
              <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center space-y-6 shadow-xl">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">{t('pilot.dashboard.companyTeamSetup')}</span>
                  </div>
                  <h2 className="text-2xl font-semibold">{t('pilot.dashboard.readyForProject')}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t('pilot.dashboard.readyForProjectDesc')}</p>
                </div>
                <Progress value={transitionProgress} className="h-1.5" />
                <div className="flex flex-col gap-3">
                  <Button onClick={handleTransitionContinue} size="lg" className="w-full h-12 gap-2">
                    {t('pilot.dashboard.createProject')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={handleTransitionLater} className="text-muted-foreground">
                    {t('pilot.dashboard.doThisLater')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}