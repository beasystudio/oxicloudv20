import { useState, useEffect } from "react";
import { PillToggle } from "@/components/ui/pill-toggle";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { TopNavigation } from "@/components/TopNavigation";
import { SettingsCompanies } from "./settings/SettingsCompanies";
import { SettingsUsers } from "./settings/SettingsUsers";
import { SettingsContacts } from "./settings/SettingsContacts";
import { SecurityOverviewPanel } from "@/components/security/SecurityOverviewPanel";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ModuleOnboardingTour, OnboardingTooltip } from "@/components/onboarding/ModuleOnboardingTour";
import { isPilotAccount, getOnboardingProgress, saveOnboardingProgress, type OnboardingModule } from "@/lib/pilotAccountUtils";
import { cn } from "@/lib/utils";
import { getUserByEmail } from "@/lib/mockUserDB";
import { useLanguage } from "@/i18n/LanguageContext";

const useTabs = () => {
  const { t } = useLanguage();
  return [
  { id: 'company', label: t('dashboard.settings.company') },
  { id: 'users', label: t('dashboard.settings.users') },
  { id: 'contacts', label: t('dashboard.settings.contacts') },
  { id: 'security', label: t('dashboard.settings.security') }] as
  const;
};

export default function Settings() {
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const TABS = useTabs();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("company");
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentOnboardingModule, setCurrentOnboardingModule] = useState<OnboardingModule>('settings-company');

  const isPilot = isPilotAccount(currentUser?.email);

  useEffect(() => {
    const progress = getOnboardingProgress();
    if (progress.currentModule.startsWith('settings-') && !isPilot) {
      setCurrentOnboardingModule(progress.currentModule);
      setTimeout(() => setShowOnboarding(true), 500);
    }
    if (isPilot) {
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, [isPilot]);

  useEffect(() => {
    if (activeTab === 'company') setCurrentOnboardingModule('settings-company');else
    if (activeTab === 'users') setCurrentOnboardingModule('settings-users');else
    if (activeTab === 'contacts') setCurrentOnboardingModule('settings-contacts');
  }, [activeTab]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (showOnboarding) {
      setShowOnboarding(false);
      setTimeout(() => {
        if (newTab === 'users') setCurrentOnboardingModule('settings-users');else
        if (newTab === 'contacts') setCurrentOnboardingModule('settings-contacts');
        setShowOnboarding(true);
      }, 300);
    }
  };




  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (currentOnboardingModule === 'settings-company') {
      setActiveTab('users');
      setTimeout(() => {setCurrentOnboardingModule('settings-users');setShowOnboarding(true);}, 300);
    } else if (currentOnboardingModule === 'settings-users') {
      setActiveTab('contacts');
      setTimeout(() => {setCurrentOnboardingModule('settings-contacts');setShowOnboarding(true);}, 300);
    } else if (currentOnboardingModule === 'settings-contacts') {
      toast({ title: t('dashboard.settings.setupComplete'), description: t('dashboard.settings.setupCompleteDesc') });
      setTimeout(() => navigate('/dashboard/projects'), 2500);
    }
  };

  const handleOnboardingSkip = () => setShowOnboarding(false);

  // Allow client_admin if they have settingsAccess toggled on
  const clientAdminHasAccess = currentUser?.role === 'client_admin' ?
  getUserByEmail(currentUser.email)?.general?.settingsAccess ?? false :
  false;
  if (!currentUser || currentUser.role !== 'client_owner' && currentUser.role !== 'owner' && currentUser.role !== 'admin' && !clientAdminHasAccess) {
    return <Navigate to="/dashboard/partner" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
           <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard.settings.title')}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('dashboard.settings.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
          </div>
        </div>

        {/* Pill Tab Navigation */}
        <div className="mb-8">
          <PillToggle
            items={TABS}
            activeId={activeTab}
            onSelect={(id) => handleTabChange(id)}
            layoutId="settingsPillToggle" />
          
        </div>

        {/* Content */}
        {activeTab === 'company' && <SettingsCompanies />}
        {activeTab === 'users' && <SettingsUsers />}
        {activeTab === 'contacts' && <SettingsContacts />}
        {activeTab === 'security' && <SecurityOverviewPanel />}
      </div>

      {/* Onboarding Tour */}
      <AnimatePresence>
        {showOnboarding &&
        <ModuleOnboardingTour module={currentOnboardingModule} onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
        }
      </AnimatePresence>
    </div>);

}