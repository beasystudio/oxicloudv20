import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { getPilotSession, getPilotUser, getPilotCompany, getPilotOnboarding, getPilotStats, getPilotProjects } from '@/lib/pilotSessionStore';
import { PilotNavigation } from '@/components/pilot/PilotNavigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { motion } from 'framer-motion';

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
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const session = getPilotSession();
  const user = getPilotUser();
  const company = getPilotCompany();
  const stats = getPilotStats();
  const projects = getPilotProjects();

  useEffect(() => {
    if (!session || !user) {
      navigate('/pilot-demo');
    }
  }, []);

  // Pending tasks
  const pendingTasks = useMemo(() => {
    const tasks: {id: string;title: string;description: string;action: () => void;}[] = [];
    projects.filter((p) => p.noxStatus === 'awaiting_payment').forEach((p) => {
      tasks.push({ id: `ap-${p.id}`, title: `"${p.name}" — ${t('pilot.dashboard.awaitingPayment')}`, description: t('pilot.dashboard.followUpPayment'), action: () => navigate('/pilot-demo/projects', { state: { highlightProjectId: p.id, noxAction: 'pay' } }) });
    });
    projects.filter((p) => !p.noxStatus || p.noxStatus === 'input_completed' && !p.priceData).forEach((p) => {
      tasks.push({ id: `ni-${p.id}`, title: `"${p.name}" — ${t('pilot.dashboard.inputIncomplete')}`, description: t('pilot.dashboard.fillPreEstimation'), action: () => navigate('/pilot-demo/projects', { state: { highlightProjectId: p.id, noxAction: 'pre-estimation' } }) });
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
          if (flow === 3) navigate('/pilot-demo/projects');
        }} />

        <div className="max-w-[1120px] mx-auto px-5 py-6 pb-16 w-full">

          {/* Greeting */}
          <motion.div {...fade(0.1)} className="mb-5">
            <p className="text-xs text-muted-foreground mb-0.5">
              {new Date().toLocaleDateString(language === 'nl' ? 'nl-BE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-[1.75rem] font-medium tracking-tight leading-[1.1] text-foreground">
              {greeting()}, {user.firstName}.
            </h1>
            {summaryLine && <p className="text-sm text-muted-foreground mt-1">{summaryLine}</p>}
          </motion.div>

          {/* Setup Guide (OnboardingChecklist) */}
          <motion.div {...fade(0.15)} className="mb-2.5">
            <OnboardingChecklist forceShow={searchParams.get('showGuide') === 'true'} />
          </motion.div>

          {/* Partner Program */}
          <motion.div {...fade(0.18)} className="mb-2.5">
            








            
          </motion.div>

          {/* Stats row */}
          <motion.div {...fade(0.22)} className="grid grid-cols-3 gap-2.5 mb-2.5">
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
            <Card>
              <Label>{language === 'nl' ? 'TE DOEN' : 'TO DO'}</Label>
              <p className="text-2xl font-bold tracking-tight text-foreground mt-1">{todoCount}</p>
              <p className="text-xs text-muted-foreground">{language === 'nl' ? 'openstaand' : 'pending'}</p>
            </Card>
          </motion.div>

        </div>
      </div>
    </>);

}