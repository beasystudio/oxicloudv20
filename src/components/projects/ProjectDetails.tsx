import { ProjectDetailView } from './ProjectDetailView';
import type { Project } from '@/types/project';

interface ProjectDetailsProps {
  project: Project;
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: (projectId: string) => void;
}

export const ProjectDetails = (props: ProjectDetailsProps) => {
  return <ProjectDetailView {...props} />;
};
