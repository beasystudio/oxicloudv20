import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Project } from '@/types/project';

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onProjectUpdated: (project: Project) => void;
}

export const EditProjectDialog = ({ open, onOpenChange, project, onProjectUpdated }: EditProjectDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      project_number: formData.get('project_number') as string,
      name: formData.get('name') as string,
      status: formData.get('status') as string,
      office: formData.get('office') as string || null,
      code: formData.get('code') as string || null,
      client_contact: formData.get('client_contact') as string || null,
      project_type: formData.get('project_type') as string || null,
      overview: formData.get('overview') as string || null,
      address: formData.get('address') as string || null,
      lat: formData.get('lat') ? parseFloat(formData.get('lat') as string) : null,
      lng: formData.get('lng') ? parseFloat(formData.get('lng') as string) : null,
    };

    try {
      const { data: updatedProject, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', project.id)
        .select()
        .single();

      if (error) throw error;

      toast({ title: t('editProject.success'), description: t('editProject.projectUpdated') });
      onProjectUpdated(updatedProject);
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editProject.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project_number">{t('editProject.projectNumber')}</Label>
              <Input id="project_number" name="project_number" defaultValue={project.project_number} required />
            </div>
            <div>
              <Label htmlFor="name">{t('editProject.name')}</Label>
              <Input id="name" name="name" defaultValue={project.name} required />
            </div>
            <div>
              <Label htmlFor="status">{t('editProject.status')}</Label>
              <Input id="status" name="status" defaultValue={project.status} required />
            </div>
            <div>
              <Label htmlFor="office">{t('editProject.office')}</Label>
              <Input id="office" name="office" defaultValue={project.office || ''} />
            </div>
            <div>
              <Label htmlFor="code">{t('editProject.code')}</Label>
              <Input id="code" name="code" defaultValue={project.code || ''} />
            </div>
            <div>
              <Label htmlFor="client_contact">{t('editProject.clientContact')}</Label>
              <Input id="client_contact" name="client_contact" defaultValue={project.client_contact || ''} />
            </div>
            <div>
              <Label htmlFor="project_type">{t('editProject.projectType')}</Label>
              <Input id="project_type" name="project_type" defaultValue={project.project_type || ''} />
            </div>
          </div>
          <div>
            <Label htmlFor="overview">{t('editProject.overview')}</Label>
            <Textarea id="overview" name="overview" defaultValue={project.overview || ''} rows={3} />
          </div>
          <div>
            <Label htmlFor="address">{t('editProject.address')}</Label>
            <Input id="address" name="address" defaultValue={project.address || ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">{t('editProject.latitude')}</Label>
              <Input id="lat" name="lat" type="number" step="any" defaultValue={project.lat || ''} />
            </div>
            <div>
              <Label htmlFor="lng">{t('editProject.longitude')}</Label>
              <Input id="lng" name="lng" type="number" step="any" defaultValue={project.lng || ''} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('editProject.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('editProject.saving') : t('editProject.saveChanges')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};