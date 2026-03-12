import { TopNavigation } from '@/components/TopNavigation';
import { OxiCloudContent } from '@/components/oxicloud/OxiCloudContent';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

const NoxDashboard = () => {
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">
            {isAdmin ? t('dashboard.nox.settingsTitle') : t('dashboard.nox.dashboardTitle')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-balance">
            {isAdmin 
              ? t('dashboard.nox.settingsSubtitle')
              : t('dashboard.nox.dashboardSubtitle')
            }
          </p>
        </div>

        <OxiCloudContent />
      </div>
    </div>
  );
};

export default NoxDashboard;
