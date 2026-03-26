import { useState } from 'react';
import { TopNavigation } from '@/components/TopNavigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PillToggle } from '@/components/ui/pill-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

const AuthoritySettings = () => {
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('subscription');

  const TABS = [
    { id: 'subscription', label: t('authority.settings.subscription') },
    { id: 'users', label: t('authority.settings.users') },
    { id: 'activity', label: t('authority.settings.activityLog') },
  ] as const;

  const subscription = {
    plan: 'Authority Professional',
    billing: 'Annual',
    price: '€2,400/year',
    nextBilling: '2026-01-15',
    seats: { used: 4, total: 10 },
  };

  const teamMembers = [
    { id: '1', name: 'Koen Van den Berg', email: 'koen@antwerpen.be', role: 'Power User', license: 'Power User/Admin', status: 'active' },
    { id: '2', name: 'Els Peeters', email: 'els@antwerpen.be', role: 'Standard User', license: 'Standard User', status: 'active' },
    { id: '3', name: 'Anna Martens', email: 'anna.martens@antwerpen.be', role: 'Standard User', license: 'Standard User', status: 'active' },
    { id: '4', name: 'Thomas De Smedt', email: 'thomas.desmedt@antwerpen.be', role: 'Standard User', license: 'Standard User', status: 'pending' },
  ];

  const activityLog = [
    { id: '1', action: t('authority.settings.projectReviewed'), user: 'Koen Van den Berg', timestamp: '2025-01-19 14:32' },
    { id: '2', action: t('authority.settings.reportUploaded'), user: 'Anna Martens', timestamp: '2025-01-19 11:15' },
    { id: '3', action: t('authority.settings.userInvited'), user: 'Koen Van den Berg', timestamp: '2025-01-18 16:45' },
    { id: '4', action: t('authority.settings.subscriptionRenewed'), user: 'System', timestamp: '2025-01-15 00:00' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('authority.settings.title')}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('authority.settings.subtitle')}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <PillToggle
            items={TABS}
            activeId={activeTab}
            onSelect={(id) => setActiveTab(id)}
            layoutId="authoritySettingsPillToggle"
          />
        </div>

        {activeTab === 'subscription' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">{t('authority.settings.currentPlan')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{subscription.plan}</h3>
                    <p className="text-sm text-muted-foreground">{subscription.billing} {t('authority.settings.billing')}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">{t('authority.settings.active')}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('authority.settings.price')}</p>
                    <p className="text-lg font-semibold">{subscription.price}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('authority.settings.nextBilling')}</p>
                    <p className="text-lg font-semibold">{subscription.nextBilling}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">{t('authority.settings.changePlan')}</Button>
                  <Button variant="outline">{t('authority.settings.updatePayment')}</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('authority.settings.userSeats')}</CardTitle>
                <CardDescription>{t('authority.settings.teamSizeAvailability')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-foreground">{subscription.seats.used}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('authority.settings.seatsUsed').replace('{total}', String(subscription.seats.total))}
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(subscription.seats.used / subscription.seats.total) * 100}%` }} />
                </div>
                {subscription.seats.used >= subscription.seats.total * 0.8 && (
                  <p className="text-xs text-muted-foreground text-center">{t('authority.settings.seatsLow')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{t('authority.settings.teamMembers')}</CardTitle>
                  <CardDescription>{t('authority.settings.manageAccess')}</CardDescription>
                </div>
                <Button size="sm" className="gap-2">{t('authority.settings.inviteUser')}</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 group",
                      "hover:scale-[1.02] hover:z-10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground group-hover:text-black transition-colors">{member.name}</p>
                        <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={member.license === 'Power User/Admin'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-muted text-muted-foreground'}
                      >
                        {member.license}
                      </Badge>
                      {member.status === 'active' ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">{t('authority.settings.pending')}</Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('authority.settings.systemActivity')}</CardTitle>
              <CardDescription>{t('authority.settings.recentActions')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                {activityLog.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 group",
                      "hover:shadow-md hover:shadow-foreground/20 hover:scale-[1.02] hover:z-10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium text-sm text-foreground group-hover:text-black transition-colors">{log.action}</p>
                        <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">{t('authority.settings.by')} {log.user}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AuthoritySettings;
