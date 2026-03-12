import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, RefreshCw } from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectDetails } from '@/components/projects/ProjectDetails';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { useSupabaseProjects, type NoxProject } from '@/hooks/useSupabaseProjects';
import type { Project } from '@/types/project';
import { cn } from '@/lib/utils';

const Projects = () => {
  const { projects, loading, refetch } = useSupabaseProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const handleProjectCreated = async (project: Project) => {
    await refetch();
    setSelectedProject(project);
    setIsCreateDialogOpen(false);
    toast({
      title: 'Project aangemaakt',
      description: 'Je kunt nu contacten toevoegen en de NOx workflow starten.',
    });
  };

  const handleProjectUpdated = async (updatedProject: Project) => {
    await refetch();
    setSelectedProject(updatedProject);
  };

  const handleProjectDeleted = async (projectId: string) => {
    await refetch();
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  // Get NOx status counts for summary
  const noxStats = {
    total: projects.length,
    withNox: projects.filter((p: NoxProject) => p.noxData).length,
    awaitingPayment: projects.filter((p: NoxProject) => p.noxData?.status === 'awaiting_payment').length,
    paid: projects.filter((p: NoxProject) => p.noxData?.status === 'paid').length,
    delivered: projects.filter((p: NoxProject) => p.noxData?.status === 'report_delivered').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      <div className="container mx-auto px-6 py-6">
        {/* Header with Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {noxStats.total} projecten
              </Badge>
              {noxStats.awaitingPayment > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {noxStats.awaitingPayment} wachten op betaling
                </Badge>
              )}
              {noxStats.delivered > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {noxStats.delivered} rapporten geleverd
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Nieuw Project
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Projecten laden...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
            <FolderKanban className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-xl font-medium text-foreground mb-2">Nog geen projecten</p>
            <p className="text-muted-foreground mb-6">
              Start door je eerste project aan te maken
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Eerste Project Aanmaken
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <ProjectList
                projects={projects}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
              />
            </div>
            <div className="col-span-9">
              {selectedProject ? (
                <ProjectDetails
                  project={selectedProject}
                  onProjectUpdated={handleProjectUpdated}
                  onProjectDeleted={handleProjectDeleted}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/20 rounded-xl border border-dashed">
                  <FolderKanban className="h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-foreground mb-1">
                    Selecteer een project
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Klik op een project in de lijst om details te bekijken
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default Projects;
