import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TopNavigation } from '@/components/TopNavigation';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { getAllCompanies, getAllEmployees, getAllCompanyProjects, type Company } from '@/lib/mockCompanyDB';
import { getPlatformStats, getFeatureFlags, toggleFeatureFlag, getLicensesWithActualSeats, getActivityLogs, seedAdminData, type FeatureFlag, type CompanyLicense, type ActivityLog } from '@/lib/adminStore';
import { ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Navigate, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useMockAuth();
  const { t, language } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [licenses, setLicenses] = useState<CompanyLicense[]>([]);
  const [featureFlagsState, setFeatureFlagsState] = useState<FeatureFlag[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  useEffect(() => {
    seedAdminData();
    loadData();
  }, []);

  const loadData = () => {
    setCompanies(getAllCompanies());
    setLicenses(getLicensesWithActualSeats());
    setFeatureFlagsState(getFeatureFlags());
    setActivityLogs(getActivityLogs());
  };

  const handleToggleFeature = (flagId: string, enabled: boolean) => {
    toggleFeatureFlag(flagId, enabled);
    setFeatureFlagsState(getFeatureFlags());
  };

  if (!isAdmin) return <Navigate to="/dashboard/client/home" replace />;

  const totalProjects = getAllCompanyProjects().length;
  const totalEmployees = getAllEmployees().length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard.greeting.morning');
    if (h < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  const smartInsights = (() => {
    const insights: { text: string; type: 'warning' | 'positive' | 'neutral' }[] = [];
    const activeCompanies = licenses.filter(l => l.status === 'active').length;
    if (activeCompanies > 0) insights.push({ text: `${activeCompanies} ${language === 'nl' ? 'bedrijven met actieve licentie' : 'companies with active license'}`, type: 'positive' });
    const lowSeats = licenses.filter(l => l.usedSeats >= l.seats * 0.8);
    if (lowSeats.length > 0) insights.push({ text: `${lowSeats.length} ${language === 'nl' ? 'bedrijven bijna aan gebruikerslimiet' : 'companies near seat limit'}`, type: 'warning' });
    const enabledFlags = featureFlagsState.filter(f => f.enabled).length;
    insights.push({ text: `${enabledFlags}/${featureFlagsState.length} ${language === 'nl' ? 'feature flags actief' : 'feature flags enabled'}`, type: 'neutral' });
    if (activityLogs.length > 0) insights.push({ text: `${activityLogs.length} ${language === 'nl' ? 'recente activiteiten gelogd' : 'recent activities logged'}`, type: 'neutral' });
    return insights.slice(0, 4);
  })();

  const bulletins = [
    { title: language === 'nl' ? 'Gelukkige Verjaardag!' : 'Happy Birthday!', text: language === 'nl' ? 'Thomas viert vandaag zijn verjaardag! 🎂' : 'Wishing Thomas a fantastic birthday today! 🎂' },
    { title: language === 'nl' ? 'Werkjubileum' : 'Work Anniversary', text: language === 'nl' ? 'Christine viert 2 jaar bij OxiCloud! 🎉' : 'Christine celebrates 2 years at OxiCloud! 🎉' },
    { title: language === 'nl' ? 'Wist je dat?' : 'Did you know?', text: language === 'nl' ? '3 nieuwe bedrijven deze maand onboarded.' : '3 new companies onboarded this month.' },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - OxiCloud</title>
      </Helmet>

      <div className="h-[100dvh] overflow-hidden bg-background flex flex-col">
        <TopNavigation />

        <main className="flex-1 min-h-0 overflow-hidden container mx-auto px-4 py-5 flex flex-col">
          {/* Header */}
          <header className="mb-4 shrink-0">
            <p className="text-sm text-muted-foreground mb-0.5">
              {new Date().toLocaleDateString(language === 'nl' ? 'nl-BE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-3xl tracking-tight leading-[1.15] text-foreground font-semibold text-balance">
              {greeting()},<br />{currentUser?.name?.split(' ')[0]}.
            </h1>
          </header>

          {/* Bento Grid */}
          <div
            className="flex-1 min-h-0 grid gap-2"
            style={{
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: 'auto auto auto 1fr',
            }}
          >
            {/* ═══ ROW 1: Smart Insights (2col) + Quick Actions (1col) ═══ */}
            <div
              className="rounded-2xl p-4 flex flex-col justify-center bg-card text-card-foreground border border-border"
              style={{ gridColumn: '1 / 3', gridRow: '1' }}
            >
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">
                {language === 'nl' ? 'Slimme Inzichten' : 'Smart Insights'}
              </p>
              <div className="space-y-2">
                {smartInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                        insight.type === 'warning' ? 'bg-destructive/60' : insight.type === 'positive' ? 'bg-primary' : 'bg-muted-foreground/40'
                      )}
                    />
                    <p className="text-sm leading-relaxed text-muted-foreground">{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2" style={{ gridColumn: '3', gridRow: '1' }}>
              <button
                onClick={() => navigate('/dashboard/licenses')}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors whitespace-nowrap"
              >
                {language === 'nl' ? 'Licentiebeheer' : 'Manage Licenses'}
              </button>
              <div className="flex-1 rounded-xl border border-border p-3.5 flex flex-col justify-between min-h-[60px]">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {language === 'nl' ? 'Bedrijven' : 'Companies'}
                </p>
                <span className="text-2xl font-semibold text-foreground leading-none">{companies.length}</span>
              </div>
            </div>

            {/* ═══ ROW 2: Employees stat ═══ */}
            <div className="rounded-2xl border border-border p-4 flex flex-col justify-between" style={{ gridColumn: '1', gridRow: '2' }}>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{language === 'nl' ? 'Medewerkers' : 'Employees'}</p>
              <div>
                <p className="text-2xl font-semibold text-foreground leading-none">{totalEmployees}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{language === 'nl' ? 'over alle bedrijven' : 'across all companies'}</p>
              </div>
            </div>

            {/* Announcements (spans rows 2-3, cols 2-3) */}
            <div
              className="rounded-2xl border border-border p-3.5"
              style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}
            >
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">
                {language === 'nl' ? 'Mededelingen' : 'Announcements'}
              </p>
              <div className="space-y-1">
                {bulletins.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-2 px-1">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-muted-foreground/30" />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground font-medium">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ ROW 3: Projects stat ═══ */}
            <div className="rounded-2xl border border-border p-4 flex flex-col justify-between" style={{ gridColumn: '1', gridRow: '3' }}>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{language === 'nl' ? 'Projecten' : 'Projects'}</p>
              <div>
                <p className="text-2xl font-semibold text-foreground leading-none">{totalProjects}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{language === 'nl' ? 'platformbreed' : 'platform-wide'}</p>
              </div>
            </div>

            {/* ═══ ROW 4: Collapsible sections - full width (bottom) ═══ */}
            <div
              className="rounded-2xl border border-border p-4 overflow-y-auto"
              style={{ gridColumn: '1 / 4', gridRow: '4' }}
            >
              <div className="space-y-2">
                {/* Companies */}
                <Collapsible open={isCompaniesOpen} onOpenChange={setIsCompaniesOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors text-left">
                      <div>
                        <p className="text-sm font-semibold">{language === 'nl' ? 'Bedrijven' : 'Companies'}</p>
                        <p className="text-xs text-muted-foreground">{companies.length} {language === 'nl' ? 'klantbedrijven' : 'client companies'}</p>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isCompaniesOpen && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-2 space-y-0.5">
                      {companies.map(company => {
                        const license = licenses.find(l => l.companyId === company.id);
                        const employees = getAllEmployees().filter(e => e.companyId === company.id);
                        const projects = getAllCompanyProjects().filter(p => p.companyId === company.id);
                        return (
                          <div key={company.id} className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3 min-w-0">
                              {company.logoUrl
                                ? <img src={company.logoUrl} alt={company.name} className="h-8 w-8 rounded-md object-contain" />
                                : <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">{company.name.charAt(0)}</div>}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">{company.name}</span>
                                  <Badge variant={license?.status === 'active' ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0">{license?.status || 'No license'}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{employees.length} employees · {projects.length} projects · {license?.usedSeats || 0}/{license?.seats || 0} seats</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Feature Flags */}
                <Collapsible open={isFeaturesOpen} onOpenChange={setIsFeaturesOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors text-left">
                      <div>
                        <p className="text-sm font-semibold">Feature Flags</p>
                        <p className="text-xs text-muted-foreground">{featureFlagsState.filter(f => f.enabled).length} / {featureFlagsState.length} {language === 'nl' ? 'actief' : 'enabled'}</p>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isFeaturesOpen && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-2 space-y-0.5">
                      {featureFlagsState.map(flag => (
                        <div key={flag.id} className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{flag.name}</span>
                              {flag.enabledForCompanies.length > 0 && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Company-specific</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{flag.description}</p>
                          </div>
                          <Switch checked={flag.enabled} onCheckedChange={checked => handleToggleFeature(flag.id, checked)} />
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Activity */}
                <Collapsible open={isActivityOpen} onOpenChange={setIsActivityOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors text-left">
                      <div>
                        <p className="text-sm font-semibold">{language === 'nl' ? 'Recente Activiteit' : 'Recent Activity'}</p>
                        <p className="text-xs text-muted-foreground">{activityLogs.length} {language === 'nl' ? 'events gelogd' : 'events logged'}</p>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isActivityOpen && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ScrollArea className="h-[200px]">
                      <div className="pt-2 space-y-0.5">
                        {activityLogs.slice(0, 20).map(log => (
                          <div key={log.id} className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0">
                                {log.userName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium truncate">{log.userName}</span>
                                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">{log.module}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{log.action}</p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
