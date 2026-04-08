import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Project } from '@/types/project';

interface ProjectInfoProps {
  project: Project;
}

export const ProjectInfo = ({ project }: ProjectInfoProps) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('projectInfo.projectDetails')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm text-muted-foreground">{t('projectInfo.projectNumber')}</div>
          <div className="font-medium">{project.project_number}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{t('projectInfo.name')}</div>
          <div className="font-medium">{project.name}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{t('projectInfo.status')}</div>
          <Badge variant="secondary">{project.status}</Badge>
        </div>
        {project.office && (
          <div>
            <div className="text-sm text-muted-foreground">{t('projectInfo.office')}</div>
            <div className="font-medium">{project.office}</div>
          </div>
        )}
        {project.code && (
          <div>
            <div className="text-sm text-muted-foreground">{t('projectInfo.code')}</div>
            <div className="font-medium">{project.code}</div>
          </div>
        )}
        {project.client_contact && (
          <div>
            <div className="text-sm text-muted-foreground">{t('projectInfo.clientContact')}</div>
            <div className="font-medium">{project.client_contact}</div>
          </div>
        )}
        {project.project_type && (
          <div>
            <div className="text-sm text-muted-foreground">{t('projectInfo.projectType')}</div>
            <div className="font-medium">{project.project_type}</div>
          </div>
        )}
        {project.overview && (
          <div>
            <div className="text-sm text-muted-foreground">{t('projectInfo.overview')}</div>
            <div className="text-sm">{project.overview}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};