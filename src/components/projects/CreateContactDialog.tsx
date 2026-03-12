import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onContactCreated: (contact: any) => void;
}

export const CreateContactDialog = ({ open, onOpenChange, projectId, onContactCreated }: CreateContactDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [contactType, setContactType] = useState('Client');
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      project_id: projectId,
      firm_name: formData.get('firm_name') as string,
      contact_person: formData.get('contact_person') as string,
      phone: formData.get('phone') as string || null,
      mobile: formData.get('mobile') as string || null,
      email: formData.get('email') as string || null,
      contact_type: contactType,
    };

    try {
      const { data: contact, error } = await supabase
        .from('project_contacts')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      toast({ title: t('createContactDialog.success'), description: t('createContactDialog.contactCreated') });
      onContactCreated(contact);
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createContactDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firm_name">{t('createContactDialog.firmName')}</Label>
            <Input id="firm_name" name="firm_name" required />
          </div>
          <div>
            <Label htmlFor="contact_person">{t('createContactDialog.contactPerson')}</Label>
            <Input id="contact_person" name="contact_person" required />
          </div>
          <div>
            <Label htmlFor="phone">{t('createContactDialog.phone')}</Label>
            <Input id="phone" name="phone" />
          </div>
          <div>
            <Label htmlFor="mobile">{t('createContactDialog.mobile')}</Label>
            <Input id="mobile" name="mobile" />
          </div>
          <div>
            <Label htmlFor="email">{t('createContactDialog.email')}</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div>
            <Label htmlFor="contact_type">{t('createContactDialog.contactType')}</Label>
            <Select value={contactType} onValueChange={setContactType} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Client">{t('contactDetailsDialog.contactTypeClient')}</SelectItem>
                <SelectItem value="Team">{t('contactDetailsDialog.contactTypeTeam')}</SelectItem>
                <SelectItem value="External Team">{t('contactDetailsDialog.contactTypeExternal')}</SelectItem>
                <SelectItem value="Contractor">{t('contactDetailsDialog.contactTypeContractor')}</SelectItem>
                <SelectItem value="Others">{t('contactDetailsDialog.contactTypeOthers')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('createContactDialog.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('createContactDialog.creating') : t('createContactDialog.createContact')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};