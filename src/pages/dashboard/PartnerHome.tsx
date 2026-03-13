/**
 * Unified Partner Home Page
 * The main dashboard for architects after login
 * Shows settlement info, KPIs, and onboarding for new users
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { TopNavigation } from '@/components/TopNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, ArrowRight, Check, Clock, Settings, FolderKanban, Users, Info, HelpCircle } from 'lucide-react';
import { ModuleOnboardingTour, OnboardingTooltip } from '@/components/onboarding/ModuleOnboardingTour';
import { ProductionWelcomeModal } from '@/components/demo/ProductionWelcomeModal';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { isPilotAccount as checkPilotAccount, getEmptyDashboardData, resetPilotOnboarding, isOnboardingComplete, completeOnboarding, getOnboardingProgress } from '@/lib/pilotAccountUtils';
import { cn } from '@/lib/utils';

// Dashboard data based on account type
const getDashboardData = (isPilot: boolean) => {
  if (isPilot) {
    return getEmptyDashboardData();
  }
  return {
    projectsSubmitted: 3,
    estimatedSettlement: 1120,
    pendingReports: 1,
    completedReports: 2,
    typicalSettlementRange: {
      min: 280,
      max: 450
    },
    commissionRate: 40
  };
};
const PartnerHome = () => {
  const navigate = useNavigate();
  const {
    currentUser
  } = useMockAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [checklist, setChecklist] = useState({
    partnerTermsRead: false,
    companySetup: false,
    usersAdded: false,
    contactTypesConfigured: false,
    firstProjectCreated: false
  });
  const isPilot = checkPilotAccount(currentUser?.email);
  const dashboardData = getDashboardData(isPilot);
  useEffect(() => {
    // Only pilot account should see this page - redirect others to client home
    if (!isPilot) {
      navigate('/dashboard/client/home', {
        replace: true
      });
      return;
    }

    // Reset onboarding for pilot account to always show fresh experience
    resetPilotOnboarding();
    setOnboardingCompleted(false);
    setChecklist({
      partnerTermsRead: false,
      companySetup: false,
      usersAdded: false,
      contactTypesConfigured: false,
      firstProjectCreated: false
    });
    // Delay to let page render
    setTimeout(() => setShowOnboarding(true), 600);
  }, [isPilot, navigate]);
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
    completeOnboarding();
    setChecklist(prev => ({
      ...prev,
      partnerTermsRead: true
    }));
    saveChecklist({
      ...checklist,
      partnerTermsRead: true
    });
  };
  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
    completeOnboarding();
  };
  const saveChecklist = (newChecklist: typeof checklist) => {
    localStorage.setItem('oxicloud_home_checklist', JSON.stringify(newChecklist));
  };
  const updateChecklist = (key: keyof typeof checklist) => {
    const updated = {
      ...checklist,
      [key]: true
    };
    setChecklist(updated);
    saveChecklist(updated);
  };
  const completedSteps = Object.values(checklist).filter(Boolean).length;
  const totalSteps = Object.keys(checklist).length;
  const progressPercentage = completedSteps / totalSteps * 100;
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  return <>
      <Helmet>
        <title>Partner Dashboard - OxiCloud</title>
        <meta name="description" content="Your partner settlement dashboard" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <TopNavigation />
        
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          {/* Header */}
          <motion.header initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-1">
                  {greeting()}, {currentUser?.name?.split(' ')[0]}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isPilot ? 'Your Partner Account Is Active' : 'Partner Settlement Dashboard'}
                </p>
              </div>
              {!onboardingCompleted && <Button variant="ghost" size="sm" onClick={() => setShowOnboarding(true)} className="gap-2 text-muted-foreground">
                  <HelpCircle className="w-4 h-4" />
                  Restart Tour
                </Button>}
            </div>
          </motion.header>

          {/* Welcome Message for New Users */}
          {(isPilot || !onboardingCompleted) && <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="mb-6">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    
                    <div className="flex-1">
                      <h2 className="font-semibold text-foreground mb-1">
                        Welkom bij het Partnerprogramma
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Dien projecten in voor compliance review en profiteer van automatische 
                        partnervergoedingen op elk goedgekeurd rapport.
                      </p>
                      <div className="flex gap-3">
                        <Button size="sm" onClick={() => {
                      updateChecklist('firstProjectCreated');
                      navigate('/dashboard/projects');
                    }} data-onboarding="create-project-btn">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Project
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                      updateChecklist('partnerTermsRead');
                      setShowHelp(true);
                    }}>
                          View Partner Settlement Terms
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>}

          {/* Settlement Preview Widget */}
          <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.15
        }} className="mb-6" data-onboarding="settlement-preview">
            <Card className="bg-secondary">
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-secondary-foreground/70 uppercase tracking-wide mb-1">
                      Estimated Partner Settlement
                    </p>
                    <p className="text-sm text-secondary-foreground">
                      Typical residential project: <span className="font-semibold text-primary">
                        €{dashboardData.typicalSettlementRange.min} – €{dashboardData.typicalSettlementRange.max}
                      </span>
                    </p>
                  </div>
                  <OnboardingTooltip text="This is your potential earnings per approved project">
                    <Info className="w-4 h-4 text-secondary-foreground/50 cursor-help" />
                  </OnboardingTooltip>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* KPI Cards */}
          <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="grid grid-cols-3 gap-4 mb-6" data-onboarding="kpi-section">
            {/* Settlement Card */}
            <Card data-onboarding="settlement-card" className="h-[140px]">
              <CardContent className="py-5 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Settlement</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {dashboardData.commissionRate}%
                  </Badge>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-foreground">
                    €{dashboardData.estimatedSettlement.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isPilot ? 'Start submitting projects' : 'This quarter'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Projects Card */}
            <Card data-onboarding="projects-card" className="h-[140px]">
              <CardContent className="py-5 h-full flex flex-col justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Projects</span>
                <div>
                  <p className="text-3xl font-semibold text-foreground">
                    {dashboardData.projectsSubmitted}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isPilot ? 'No projects yet' : 'Submitted this quarter'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="h-[140px]">
              <CardContent className="py-5 h-full flex flex-col justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-medium">{dashboardData.pendingReports}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-primary">{dashboardData.completedReports}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Setup Checklist */}
          {!onboardingCompleted && <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.25
        }} className="mb-6">
              <Card className="border-border/50">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">Getting Started</span>
                      <Badge variant="secondary" className="text-xs">
                        {completedSteps}/{totalSteps}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{Math.round(progressPercentage)}% complete</span>
                  </div>
                  <Progress value={progressPercentage} className="h-1.5 mb-4" />
                  
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {[{
                  key: 'partnerTermsRead',
                  label: 'Read Terms',
                  icon: Check
                }, {
                  key: 'companySetup',
                  label: 'Company',
                  icon: Settings
                }, {
                  key: 'usersAdded',
                  label: 'Users',
                  icon: Users
                }, {
                  key: 'contactTypesConfigured',
                  label: 'Contacts',
                  icon: Users
                }, {
                  key: 'firstProjectCreated',
                  label: 'First Project',
                  icon: FolderKanban
                }].map(item => <div key={item.key} className={cn("flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors", checklist[item.key as keyof typeof checklist] ? 'text-primary bg-primary/5' : 'text-muted-foreground')}>
                        {checklist[item.key as keyof typeof checklist] ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        <span className="text-center leading-tight">{item.label}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>}

          {/* Quick Actions */}
          <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }} className="grid grid-cols-3 gap-4 mb-6">
            {[{
            label: 'Settings',
            desc: 'Company & Users',
            path: '/dashboard/settings',
            onboarding: 'settings-link',
            checklistKey: 'companySetup'
          }, {
            label: 'Projects',
            desc: 'All dossiers',
            path: '/dashboard/projects',
            onboarding: 'projects-link'
          }, {
            label: 'Contacts',
            desc: 'Clients & teams',
            path: '/dashboard/contacts',
            onboarding: 'contacts-link'
          }].map(item => <Card key={item.label} className="cursor-pointer hover:border-primary/30 transition-colors h-[90px]" onClick={() => {
            if (item.checklistKey) {
              updateChecklist(item.checklistKey as keyof typeof checklist);
            }
            navigate(item.path);
          }} data-onboarding={item.onboarding}>
                <CardContent className="py-4 h-full flex flex-col justify-center">
                  <h4 className="font-medium text-sm mb-0.5">{item.label}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>)}
          </motion.div>

          {/* How It Works */}
          <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.35
        }}>
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">How Partner Settlement Works</h3>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => updateChecklist('partnerTermsRead')}>
                    View Terms <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[{
                  step: '1',
                  title: 'Aanmaken',
                  desc: 'Projectgegevens toevoegen'
                }, {
                  step: '2',
                  title: 'Indienen',
                  desc: 'Inschatting voltooien'
                }, {
                  step: '3',
                  title: 'Klant betaalt',
                  desc: 'Rapportkost betaald'
                }, {
                  step: '4',
                  title: 'Afrekening',
                  desc: 'Vergoeding ontvangen'
                }].map(item => <div key={item.step} className="text-center">
                      <div className="w-8 h-8 rounded-full bg-muted text-foreground text-sm font-medium flex items-center justify-center mx-auto mb-2">
                        {item.step}
                      </div>
                      <h4 className="text-sm font-medium mb-0.5">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Onboarding Tour */}
        <AnimatePresence>
          {showOnboarding && <ModuleOnboardingTour module="home" onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />}
        </AnimatePresence>
        <AnimatePresence>
          {showWelcomeModal && <ProductionWelcomeModal userName={currentUser?.name?.split(' ')[0] || 'there'} onClose={() => setShowWelcomeModal(false)} />}
        </AnimatePresence>
      </div>
    </>;
};
export default PartnerHome;