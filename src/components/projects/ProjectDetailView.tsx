import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Play, Clock, FileCheck, RefreshCw, Download, CreditCard, Lock, Copy, MapPin, Building2, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { ProjectContacts } from './ProjectContacts';
import { NoxVersionHistory } from './NoxVersionHistory';
import { NoxStepProgress } from './NoxStepProgress';
import { EditProjectDialog } from './EditProjectDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  getNoxDataByProjectId, 
  initializeNoxProject,
  cloneNoxVersion,
  type NoxProjectData,
} from '@/lib/supabaseNoxStore';
import type { Project, Contact } from '@/types/project';
import { cn } from '@/lib/utils';

interface ProjectDetailViewProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: (projectId: string) => void;
}

const NOX_STATUS_KEY: Record<string, string> = {
  input_incomplete: 'noxStatus.inputIncomplete',
  input_completed: 'noxStatus.inputCompleted',
  price_generated: 'noxStatus.priceGenerated',
  awaiting_payment: 'noxStatus.awaitingPayment',
  paid: 'noxStatus.paid',
  report_in_progress: 'noxStatus.reportInProgress',
  report_delivered: 'noxStatus.reportDelivered',
};

export const ProjectDetailView = ({ project, onProjectUpdated, onProjectDeleted }: ProjectDetailViewProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [noxData, setNoxData] = useState<NoxProjectData | null>(null);
  const [noxLoading, setNoxLoading] = useState(false);
  const [projectContacts, setProjectContacts] = useState<Contact[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchNoxData();
    fetchProjectContacts();
  }, [project.id]);

  const fetchNoxData = async () => {
    const data = await getNoxDataByProjectId(project.id);
    setNoxData(data);
  };

  const fetchProjectContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('project_contacts')
        .select('*')
        .eq('project_id', project.id);
      if (error) throw error;
      setProjectContacts(data || []);
    } catch (error) {
      console.error('Error fetching project contacts:', error);
      setProjectContacts([]);
    }
  };

  const hasContacts = projectContacts.length > 0;

  const handleStartNoxWorkflow = async () => {
    setNoxLoading(true);
    try {
      const data = await initializeNoxProject(project.id);
      if (data) {
        setNoxData(data);
        toast({ title: 'NOx Workflow Gestart', description: 'Je kunt nu de pre-estimatie invullen.' });
      }
    } catch (error: any) {
      toast({ title: 'Fout', description: error.message, variant: 'destructive' });
    } finally {
      setNoxLoading(false);
    }
  };

  const handleCloneVersion = async () => {
    setNoxLoading(true);
    try {
      const data = await cloneNoxVersion(project.id);
      if (data) {
        setNoxData(data);
        toast({ title: 'Nieuwe versie aangemaakt', description: 'U kunt nu de berekening aanpassen.' });
      }
    } catch (error: any) {
      toast({ title: 'Fout', description: error.message, variant: 'destructive' });
    } finally {
      setNoxLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', project.id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Project deleted successfully' });
      onProjectDeleted(project.id);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const statusLabel = noxData ? t(NOX_STATUS_KEY[noxData.status] || noxData.status) : null;

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-mono text-muted-foreground">{project.project_number}</span>
            <Badge variant="outline" className="text-[10px] capitalize">{project.status}</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
          {project.client_contact && (
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {project.client_contact}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ─── Two-column layout ─── */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Compact project info */}
        <div className="col-span-4 space-y-4">
          {/* Details card */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t('dashboard.projects.details')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('dashboard.projects.projectNumber')}</span>
                  <span className="font-medium">{project.project_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('dashboard.projects.projectName')}</span>
                  <span className="font-medium">{project.name}</span>
                </div>
                {project.client_contact && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('dashboard.projects.company')}</span>
                    <span className="font-medium">{project.client_contact}</span>
                  </div>
                )}
                {project.project_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('dashboard.projects.type')}</span>
                    <span className="font-medium capitalize">{project.project_type}</span>
                  </div>
                )}
              </div>

              {project.overview && (
                <>
                  <div className="border-t border-border/40" />
                  <div>
                    <span className="text-xs text-muted-foreground">{t('dashboard.projects.description')}</span>
                    <p className="text-sm mt-1">{project.overview}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {project.address && (
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-muted-foreground block">{t('dashboard.projects.siteLocation')}</span>
                    <span>{project.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: NOx + Contacts */}
        <div className="col-span-8 space-y-6">
          
          {/* ─── NOx Assessment ─── */}
          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">{t('dashboard.projects.noxAssessment')}</h3>
                {noxData && statusLabel && (
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {statusLabel}
                  </Badge>
                )}
              </div>

              {noxData ? (
                <>
                  {/* Step progress */}
                  <NoxStepProgress currentStatus={noxData.status} />
                  
                  {/* CTA */}
                  {noxData.status !== 'report_delivered' ? (
                     <Button className="w-full gap-2" size="lg" variant="outline">
                       <RefreshCw className="h-4 w-4" />
                       {t('dashboard.projects.continueNox')}
                       <ArrowRight className="h-4 w-4 ml-auto" />
                     </Button>
                  ) : (
                    <div className="pt-2 border-t border-border/30">
                       <p className="text-xs text-muted-foreground mb-3">
                         {t('noxStatus.reportDeliveredDesc')}
                       </p>
                       <Button onClick={handleCloneVersion} variant="outline" className="w-full gap-2" size="sm">
                         <Copy className="h-4 w-4" />
                         {t('projectDetail.createNewVersion')}
                       </Button>
                    </div>
                  )}

                  {/* Version toggle */}
                  {(noxData.version_history?.length ?? 0) > 0 && (
                    <button
                      onClick={() => setShowVersions(!showVersions)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showVersions ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      {(noxData.version_history?.length ?? 0) + 1} versions
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  {hasContacts ? (
                    <>
                       <p className="text-sm text-muted-foreground mb-4">
                         {t('projectDetail.noNoxAssessment')}
                       </p>
                       <Button onClick={handleStartNoxWorkflow} disabled={noxLoading} className="gap-2">
                         {noxLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                         {t('projectDetail.startNoxWorkflow')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Lock className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                       <p className="text-sm text-muted-foreground mb-1 font-medium">{t('dashboard.projects.setupRequired')}</p>
                       <p className="text-xs text-muted-foreground">
                         {t('projectDetail.addContactsFirst')}
                       </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Version History (collapsible) */}
          {showVersions && noxData && (
            <NoxVersionHistory 
              noxData={{
                status: noxData.status,
                currentVersion: noxData.current_version,
                versionHistory: (noxData.version_history || []).map(v => ({
                  version: v.version,
                  createdAt: v.createdAt,
                  createdBy: v.createdBy,
                  status: v.status,
                })),
                created_at: noxData.created_at,
              }} 
              onCloneVersion={handleCloneVersion} 
            />
          )}

          {/* ─── Contacts ─── */}
          <ProjectContacts projectId={project.id} onContactsChanged={fetchProjectContacts} />
        </div>
      </div>

      <EditProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
        onProjectUpdated={onProjectUpdated}
      />
    </div>
  );
};
