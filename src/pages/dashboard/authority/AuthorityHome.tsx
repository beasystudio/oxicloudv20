import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { TopNavigation } from '@/components/TopNavigation';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Plus, Upload, FileText, Eye, ChevronDown, CheckCircle2 } from 'lucide-react';
import { UploadReportDialog, ReportData } from '@/components/authority/UploadReportDialog';
import { MonitorProjectUploadDialog } from '@/components/authority/MonitorProjectUploadDialog';
import { getMonitorProjects, type MonitorProject } from '@/lib/monitorProjectStore';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const AuthorityHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useMockAuth();
  const { t, language } = useLanguage();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isMonitorUploadOpen, setIsMonitorUploadOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);

  const monitorProjects = getMonitorProjects();

  const statusOverview = {
    pendingReview: monitorProjects.filter(p => p.validationStatus === 'pending').length || 12,
    reviewedThisMonth: monitorProjects.filter(p => p.validationStatus === 'validated' || p.validationStatus === 'conditional').length || 15,
    totalProjects: monitorProjects.length || 48,
  };

  const announcements = [
    { id: '1', type: 'regulatory' as const, title: 'Stikstofdecreet Update v1.3', description: language === 'nl' ? 'Nieuwe drempelberekeningen geldig vanaf februari 2025' : 'New threshold calculations effective from February 2025', date: '2025-01-15' },
    { id: '2', type: 'deadline' as const, title: language === 'nl' ? 'Q1 Indienvenster Sluit' : 'Q1 Submission Window Closing', description: language === 'nl' ? 'Uiterste datum voor Q1 indieningen: 31 maart 2025' : 'Final date for Q1 submissions: March 31, 2025', date: '2025-01-10' },
    { id: '3', type: 'consultation' as const, title: language === 'nl' ? 'Openbare Raadpleging: Dijlevallei' : 'Public Consultation: Dijlevallei', description: language === 'nl' ? 'Open voor commentaar tot 28 februari 2025' : 'Open for comments until February 28, 2025', date: '2025-01-08' },
  ];

  const smartInsights = useMemo(() => {
    const insights: { text: string; type: 'warning' | 'positive' | 'neutral' }[] = [];
    const pending = monitorProjects.filter(p => p.validationStatus === 'pending');
    if (pending.length > 0) insights.push({
      text: language === 'nl' ? `${pending.length} project${pending.length !== 1 ? 'en' : ''} wacht${pending.length !== 1 ? 'en' : ''} op validatie` : `${pending.length} project${pending.length !== 1 ? 's' : ''} awaiting validation`,
      type: 'warning',
    });
    const validated = monitorProjects.filter(p => p.validationStatus === 'validated');
    if (validated.length > 0) insights.push({
      text: language === 'nl' ? `${validated.length} project${validated.length !== 1 ? 'en' : ''} gevalideerd deze periode` : `${validated.length} project${validated.length !== 1 ? 's' : ''} validated this period`,
      type: 'positive',
    });
    const conditional = monitorProjects.filter(p => p.validationStatus === 'conditional');
    if (conditional.length > 0) insights.push({
      text: language === 'nl' ? `${conditional.length} project${conditional.length !== 1 ? 'en' : ''} met voorwaardelijke status` : `${conditional.length} project${conditional.length !== 1 ? 's' : ''} with conditional status`,
      type: 'neutral',
    });
    if (insights.length === 0) {
      insights.push({ text: language === 'nl' ? 'Alle lopende beoordelingen zijn actueel' : 'All ongoing assessments are up to date', type: 'positive' });
    }
    return insights.slice(0, 4);
  }, [monitorProjects, language]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard.greeting.morning');
    if (h < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  const handleUploadReport = () => setIsUploadDialogOpen(true);

  const handleReportUploaded = (reportData: ReportData) => {
    sessionStorage.setItem('newAuthorityProject', JSON.stringify(reportData));
    toast({ title: language === 'nl' ? 'Projectdossier aangemaakt' : 'Project dossier created', description: `${reportData.projectName}` });
    navigate('/dashboard/authority/projects', { state: { newProjectId: reportData.id } });
  };

  return (
    <>
      <Helmet>
        <title>{language === 'nl' ? 'Authority Dashboard' : 'Authority Dashboard'} - OxiCloud</title>
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

          {/* Bento Grid — fills remaining viewport */}
          <div
            className="flex-1 min-h-0 grid gap-2"
            style={{
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: 'auto 1fr auto auto',
            }}
          >
            {/* ═══ ROW 1: Smart Insights (2col) + Quick Action / Todo (1col) ═══ */}
            <div
              className="rounded-2xl p-4 flex flex-col justify-center bg-background border border-border"
              style={{ gridColumn: '1 / 3', gridRow: '1' }}
            >
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">
                {t('monitor.home.smartInsights')}
              </p>
              <div className="space-y-2">
                {smartInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                      insight.type === 'warning' ? 'bg-muted-foreground/50' : 'bg-muted-foreground/25'
                    )} />
                    <p className="text-sm leading-relaxed text-muted-foreground">{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2" style={{ gridColumn: '3', gridRow: '1' }}>
              <button
                onClick={handleUploadReport}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors whitespace-nowrap"
              >
                <Upload className="h-3.5 w-3.5" />
                {t('monitor.home.uploadReport')}
              </button>
              <div className="flex-1 rounded-xl border border-border p-3.5 flex flex-col justify-between min-h-[60px]">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('monitor.home.todo')}</p>
                <span className="text-2xl font-semibold text-foreground leading-none">{statusOverview.pendingReview}</span>
              </div>
            </div>

            {/* ═══ ROW 2: Quick Actions — full width ═══ */}
            <div
              className="rounded-2xl border border-border p-4 overflow-y-auto"
              style={{ gridColumn: '1 / 4', gridRow: '2' }}
            >
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-3">
                {t('monitor.home.quickActions')}
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => setIsMonitorUploadOpen(true)}
                  className="w-full flex items-start gap-2 px-1.5 py-2.5 text-left rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-primary/60" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium">{t('monitor.home.createProject')}</p>
                    <p className="text-sm text-muted-foreground">{t('monitor.home.createProjectDesc')}</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/dashboard/authority/projects')}
                  className="w-full flex items-start gap-2 px-1.5 py-2.5 text-left rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-muted-foreground/30" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium">{t('monitor.home.viewProjects')}</p>
                    <p className="text-sm text-muted-foreground">{t('monitor.home.viewProjectsDesc')}</p>
                  </div>
                </button>
              </div>

              {/* Important Note */}
              <div className="mt-4 pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">{t('monitor.home.importantNote')}: </span>
                  {t('monitor.home.importantNoteText')}
                </p>
              </div>
            </div>

            {/* ═══ ROW 3: Stats + Announcements ═══ */}
            <div className="rounded-2xl border border-border p-4 flex flex-col justify-between" style={{ gridColumn: '1', gridRow: '3' }}>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('monitor.home.pendingReview')}</p>
              <div>
                <p className="text-2xl font-semibold text-foreground leading-none">{statusOverview.pendingReview}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{t('monitor.home.submissions')}</p>
              </div>
            </div>

            <div
              className="rounded-2xl border border-border p-3.5"
              style={{ gridColumn: '2 / 4', gridRow: '3 / 5' }}
            >
              <Collapsible open={isAnnouncementsOpen} onOpenChange={setIsAnnouncementsOpen}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between text-left">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {t('monitor.home.announcements')} · {announcements.length} {t('monitor.home.updates')}
                    </p>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isAnnouncementsOpen && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 space-y-1">
                    {announcements.map(a => (
                      <div key={a.id} className="flex items-center justify-between py-2 px-1">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                            a.type === 'regulatory' ? 'bg-primary' : a.type === 'deadline' ? 'bg-destructive/60' : 'bg-muted-foreground/40'
                          )} />
                          <div className="min-w-0">
                            <p className="text-sm text-foreground">{a.title}</p>
                            <p className="text-xs text-muted-foreground">{a.description}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-3">{a.date}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* ═══ ROW 4: Stats ═══ */}
            <div className="rounded-2xl border border-border p-4 flex flex-col justify-between" style={{ gridColumn: '1', gridRow: '4' }}>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{t('monitor.home.totalProjects')}</p>
              <div>
                <p className="text-2xl font-semibold text-foreground leading-none">{statusOverview.totalProjects}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{statusOverview.reviewedThisMonth} {t('monitor.home.reviewed')}</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <UploadReportDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} onReportUploaded={handleReportUploaded} />
      <MonitorProjectUploadDialog
        open={isMonitorUploadOpen}
        onOpenChange={setIsMonitorUploadOpen}
        onProjectCreated={(project: MonitorProject) => {
          toast({ title: t('monitor.upload.projectCreated'), description: `${project.projectName} ${t('monitor.upload.addedToWorkspace')}` });
          navigate('/dashboard/authority/projects');
        }}
        userName={currentUser?.name || 'Unknown'}
        municipality={currentUser?.company || 'Unknown'}
      />
    </>
  );
};

export default AuthorityHome;
