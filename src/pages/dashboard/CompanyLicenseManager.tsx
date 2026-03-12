import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { TopNavigation } from '@/components/TopNavigation';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { seedAdminData } from '@/lib/adminStore';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArchitectPaymentManager } from '@/components/license/ArchitectPaymentManager';
import { MonitorSubscriptionManager } from '@/components/license/MonitorSubscriptionManager';

export default function CompanyLicenseManager() {
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('architects');

  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  useEffect(() => { seedAdminData(); }, []);

  if (!isAdmin) return <Navigate to="/dashboard/client/home" replace />;

  return (
    <>
      <Helmet>
        <title>{t('monitor.license.title')} - OxiCloud</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <TopNavigation />

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{t('monitor.license.title')}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t('monitor.license.subtitle')}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="architects">OxiCloud – Architects</TabsTrigger>
              <TabsTrigger value="monitor">OxiCloud – Monitor</TabsTrigger>
              <TabsTrigger value="aspine" disabled>
                A-Spine
                <Badge variant="outline" className="ml-2 text-[9px] px-1.5 py-0">Soon</Badge>
              </TabsTrigger>
              <TabsTrigger value="plotter" disabled>
                Plotter
                <Badge variant="outline" className="ml-2 text-[9px] px-1.5 py-0">Soon</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="architects">
              <ArchitectPaymentManager />
            </TabsContent>

            <TabsContent value="monitor">
              <MonitorSubscriptionManager />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
