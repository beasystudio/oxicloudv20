import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { Trash2 } from 'lucide-react';
import type { Contact } from '@/types/project';

interface ContactDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact;
  onContactUpdated: (contact: Contact) => void;
  onContactDeleted: (id: string) => void;
}

export const ContactDetailsDialog = ({
  open, onOpenChange, contact, onContactUpdated, onContactDeleted
}: ContactDetailsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firm_name: formData.get('firm_name') as string,
      contact_person: formData.get('contact_person') as string,
      phone: formData.get('phone') as string || null,
      mobile: formData.get('mobile') as string || null,
      email: formData.get('email') as string || null,
      contact_type: formData.get('contact_type') as string,
      address: formData.get('address') as string || null,
      correspondence_notes: formData.get('correspondence_notes') as string || null,
      company_info: formData.get('company_info') as string || null,
    };

    try {
      const { data: updated, error } = await supabase
        .from('project_contacts')
        .update(data)
        .eq('id', contact.id)
        .select()
        .single();

      if (error) throw error;

      toast({ title: t('contactDetailsDialog.success'), description: t('contactDetailsDialog.contactUpdated') });
      onContactUpdated(updated);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('contactDetailsDialog.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('project_contacts')
        .delete()
        .eq('id', contact.id);

      if (error) throw error;

      toast({ title: t('contactDetailsDialog.success'), description: t('contactDetailsDialog.contactDeleted') });
      onContactDeleted(contact.id);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {t('contactDetailsDialog.title')}
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firm_name">{t('contactDetailsDialog.firmName')}</Label>
              <Input id="firm_name" name="firm_name" defaultValue={contact.firm_name} required />
            </div>
            <div>
              <Label htmlFor="contact_person">{t('contactDetailsDialog.contactPerson')}</Label>
              <Input id="contact_person" name="contact_person" defaultValue={contact.contact_person} required />
            </div>
            <div>
              <Label htmlFor="phone">{t('contactDetailsDialog.phone')}</Label>
              <Input id="phone" name="phone" defaultValue={contact.phone || ''} />
            </div>
            <div>
              <Label htmlFor="mobile">{t('contactDetailsDialog.mobile')}</Label>
              <Input id="mobile" name="mobile" defaultValue={contact.mobile || ''} />
            </div>
            <div>
              <Label htmlFor="email">{t('contactDetailsDialog.email')}</Label>
              <Input id="email" name="email" type="email" defaultValue={contact.email || ''} />
            </div>
            <div>
              <Label htmlFor="contact_type">{t('contactDetailsDialog.contactType')}</Label>
              <Select name="contact_type" defaultValue={contact.contact_type} required>
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
          </div>
          <div>
            <Label htmlFor="address">{t('contactDetailsDialog.address')}</Label>
            <Input id="address" name="address" defaultValue={contact.address || ''} />
          </div>
          <div>
            <Label htmlFor="correspondence_notes">{t('contactDetailsDialog.correspondenceNotes')}</Label>
            <Textarea id="correspondence_notes" name="correspondence_notes" defaultValue={contact.correspondence_notes || ''} rows={3} />
          </div>
          <div>
            <Label htmlFor="company_info">{t('contactDetailsDialog.companyInfo')}</Label>
            <Textarea id="company_info" name="company_info" defaultValue={contact.company_info || ''} rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('contactDetailsDialog.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('contactDetailsDialog.saving') : t('contactDetailsDialog.saveChanges')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};