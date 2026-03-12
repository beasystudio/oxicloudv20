import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Play, Clock, FileCheck, RefreshCw, Download, CreditCard, Lock, Copy } from 'lucide-react';
import { ProjectInfo } from './ProjectInfo';
import { SiteDetails } from './SiteDetails';
import { ProjectContacts } from './ProjectContacts';
import { ProjectProgress } from './ProjectProgress';
import { NoxVersionHistory } from './NoxVersionHistory';
import { EditProjectDialog } from './EditProjectDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  getNoxDataByProjectId, 
  initializeNoxProject,
  cloneNoxVersion,
  type NoxProjectData,
  type NoxVersionEntry,
} from '@/lib/supabaseNoxStore';
import { NoxProjectData as LocalNoxData } from '@/lib/noxProjectStore';
import type { Project, Contact } from '@/types/project';
import { cn } from '@/lib/utils';

interface ProjectDetailsProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: (projectId: string) => void;
}

const NOX_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  input_incomplete: { label: 'Input Incompleet', color: 'bg-gray-500', icon: Play },
  input_completed: { label: 'Input Voltooid', color: 'bg-blue-500', icon: Play },
  price_generated: { label: 'Prijs Berekend', color: 'bg-indigo-500', icon: CreditCard },
  awaiting_payment: { label: 'Wacht op Betaling', color: 'bg-amber-500', icon: Clock },
  paid: { label: 'Betaald', color: 'bg-green-500', icon: FileCheck },
  report_in_progress: { label: 'Rapport in Progress', color: 'bg-orange-500', icon: RefreshCw },
  report_delivered: { label: 'Rapport Geleverd', color: 'bg-emerald-500', icon: Download },
};

export const ProjectDetails = ({ project, onProjectUpdated, onProjectDeleted }: ProjectDetailsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [noxData, setNoxData] = useState<NoxProjectData | null>(null);
  const [noxLoading, setNoxLoading] = useState(false);
  const [projectContacts, setProjectContacts] = useState<Contact[]>([]);
  const { toast } = useToast();

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

  // Check if NOx workflow can be started (requires at least one contact)
  const hasContacts = projectContacts.length > 0;
  const canStartNox = hasContacts;

  const handleStartNoxWorkflow = async () => {
    setNoxLoading(true);
    try {
      const data = await initializeNoxProject(project.id);
      if (data) {
        setNoxData(data);
        toast({
          title: 'NOx Workflow Gestart',
          description: 'Je kunt nu de pre-estimatie invullen.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
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
        toast({
          title: 'Nieuwe versie aangemaakt',
          description: 'De voorlopige schatting is behouden. U kunt nu de berekening aanpassen.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setNoxLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      onProjectDeleted(project.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const statusConfig = noxData ? NOX_STATUS_CONFIG[noxData.status] : null;
  const StatusIcon = statusConfig?.icon || Play;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{project.name}</h2>
          <p className="text-muted-foreground">{project.project_number}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* 4 Cards Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Project Info */}
        <ProjectInfo project={project} />

        {/* Card 2: Site Details with Map */}
        <SiteDetails project={project} />

        {/* Card 3: NOx Status */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>NOx Assessment</span>
              {noxData && statusConfig && (
                <Badge className={cn("text-xs text-white", statusConfig.color)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
              {noxData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium">{statusConfig?.label}</p>
                  </div>
                  {noxData.commission_amount && (
                    <div>
                      <p className="text-muted-foreground text-xs">Commissie</p>
                      <p className="font-medium">€{noxData.commission_amount.toFixed(2)}</p>
                    </div>
                  )}
                  {noxData.pre_estimation?.projectType && (
                    <div>
                      <p className="text-muted-foreground text-xs">Projecttype</p>
                      <p className="font-medium capitalize">{noxData.pre_estimation.projectType.replace(/_/g, ' ')}</p>
                    </div>
                  )}
                  {noxData.days_pending !== undefined && noxData.days_pending > 0 && (
                    <div>
                      <p className="text-muted-foreground text-xs">Dagen Wachtend</p>
                      <p className={cn(
                        "font-medium",
                        noxData.days_pending > 14 ? "text-destructive" : 
                        noxData.days_pending > 7 ? "text-muted-foreground" : ""
                      )}>
                        {noxData.days_pending} dagen
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Clone CTA when report is delivered */}
                {noxData.status === 'report_delivered' ? (
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-xs text-muted-foreground mb-3">
                      Rapport succesvol afgeleverd. U kunt een nieuwe versie aanmaken met aangepaste berekeningen.
                    </p>
                    <Button 
                      onClick={handleCloneVersion}
                      variant="outline"
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                      Nieuwe versie aanmaken
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Ga naar het Project Dashboard om verder te gaan met de workflow.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                {canStartNox ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Nog geen NOx assessment gestart voor dit project.
                    </p>
                    <Button 
                      onClick={handleStartNoxWorkflow} 
                      disabled={noxLoading}
                      className="w-full"
                    >
                      {noxLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Start NOx Workflow
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
                      <Lock className="h-5 w-5" />
                      <span className="font-medium">Pending Setup</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Voeg eerst contacten toe aan dit project om de NOx workflow te starten.
                    </p>
                    <Button 
                      variant="outline"
                      disabled
                      className="w-full"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Start NOx Workflow
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Card 4: Project Contacts */}
        <div className="lg:col-span-1">
          <ProjectContacts projectId={project.id} onContactsChanged={fetchProjectContacts} />
        </div>

        {/* Card 5: Version History — show when NOx data exists */}
        {noxData && (
          <div className="lg:col-span-2">
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
          </div>
        )}

        {/* Card 6: Progress - Full Width */}
        <div className="lg:col-span-2">
          <ProjectProgress project={project} />
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
