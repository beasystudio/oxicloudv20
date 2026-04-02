import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Project, Task } from '@/types/project';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';

interface ProjectProgressProps {
  project: Project;
}

export const ProjectProgress = ({ project }: ProjectProgressProps) => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, [project.id]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', project.id);

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('projectProgress.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('projectProgress.overallProgress')}</span>
            <Badge variant={progressPercentage === 100 ? 'default' : 'secondary'}>
              {Math.round(progressPercentage)}%
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {completedTasks} {t('projectProgress.completed')}
            </span>
            <span>{totalTasks} {t('projectProgress.totalTasks')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">{t('projectProgress.status')}</span>
          <Badge variant="outline" className="capitalize">{project.status}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {t('projectProgress.created')}
          </span>
          <span className="text-sm">{new Date(project.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};