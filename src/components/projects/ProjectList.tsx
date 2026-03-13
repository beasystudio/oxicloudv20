import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Project } from '@/types/project';

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

export const ProjectList = ({ projects, selectedProject, onSelectProject }: ProjectListProps) => {
  const { t } = useLanguage();

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">{t('projectList.allProjects')}</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="p-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={cn(
                'w-full text-left p-3 rounded-md mb-2 transition-colors group',
                selectedProject?.id === project.id
                  ? 'bg-secondary text-secondary-foreground'
                  : 'hover:bg-muted/50 hover:text-primary'
              )}
            >
              <div className="font-medium truncate">{project.name}</div>
              <div className="text-sm opacity-80 truncate">{project.project_number}</div>
              <div className="text-xs opacity-70 mt-1">{project.status}</div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};