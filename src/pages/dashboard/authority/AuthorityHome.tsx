import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TopNavigation } from '@/components/TopNavigation';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Eye } from 'lucide-react';
import { UploadReportDialog, ReportData } from '@/components/authority/UploadReportDialog';
import { MonitorProjectUploadDialog } from '@/components/authority/MonitorProjectUploadDialog';
import { type MonitorProject } from '@/lib/monitorProjectStore';

const AuthorityHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useMockAuth();
  const { t, language } = useLanguage();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isMonitorUploadOpen, setIsMonitorUploadOpen] = useState(false);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard.greeting.morning');
    if (h < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  const handleReportUploaded = (reportData: ReportData) => {
    sessionStorage.setItem('newAuthorityProject', JSON.stringify(reportData));
    toast({ title: language === 'nl' ? 'Projectdossier aangemaakt' : 'Project dossier created', description: `${reportData.projectName}` });
    navigate('/dashboard/authority/projects', { state: { newProjectId: reportData.id } });
  };

  const actions = [
    {
      icon: Plus,
      label: language === 'nl' ? 'Project aanmaken' : 'Create project',
      description: language === 'nl' ? 'Start een nieuw projectdossier' : 'Start a new project dossier',
      onClick: () => setIsMonitorUploadOpen(true),
    },
    {
      icon: Upload,
      label: language === 'nl' ? 'PDF-rapport uploaden' : 'Upload PDF report',
      description: language === 'nl' ? 'Upload een bestaand rapport' : 'Upload an existing report',
      onClick: () => setIsUploadDialogOpen(true),
    },
    {
      icon: Eye,
      label: language === 'nl' ? 'Projecten bekijken' : 'View projects',
      description: language === 'nl' ? 'Bekijk alle projectdossiers' : 'Browse all project dossiers',
      onClick: () => navigate('/dashboard/authority/projects'),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Authority Dashboard - OxiCloud</title>
      </Helmet>

      <div className="h-[100dvh] overflow-hidden bg-background flex flex-col">
        <TopNavigation />

        <main className="flex-1 min-h-0 overflow-hidden container mx-auto px-4 py-8 flex flex-col items-center justify-center max-w-xl">
          <header className="mb-10 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {new Date().toLocaleDateString(language === 'nl' ? 'nl-BE' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-3xl tracking-tight text-foreground font-semibold">
              {greeting()}, {currentUser?.name?.split(' ')[0]}.
            </h1>
          </header>

          <div className="w-full space-y-3">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left hover:bg-muted/50 transition-colors group"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </button>
            ))}
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
