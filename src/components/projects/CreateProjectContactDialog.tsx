/**
 * Create Project Contact Dialog
 * Uses the same dialogs as GlobalAddMenu
 * After contact is created, automatically links it to the current project
 */

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CreateClientCompanyDialog } from "@/components/contacts/CreateClientCompanyDialog";
import { AddPersonDialog } from "@/components/contacts/AddPersonDialog";
import { getAllContacts } from "@/lib/mockContactDB";
import { addProjectContact, getLocalProjectById } from "@/lib/mockLocalProjects";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

interface CreateProjectContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onContactCreated: () => void;
}

type Step = 'choose' | 'company' | 'person';

const isSupabaseProject = async (projectId: string): Promise<boolean> => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(projectId)) return false;
  try {
    const { data, error } = await supabase.from('projects').select('id').eq('id', projectId).maybeSingle();
    return !error && data !== null;
  } catch { return false; }
};

export function CreateProjectContactDialog({ open, onOpenChange, projectId, onContactCreated }: CreateProjectContactDialogProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('choose');
  const [contactCountBefore, setContactCountBefore] = useState(0);

  const handleClose = () => { setStep('choose'); onOpenChange(false); };

  const handleOpenCompany = () => {
    setContactCountBefore(getAllContacts().length);
    setStep('company');
  };

  const handleOpenPerson = () => {
    setContactCountBefore(getAllContacts().length);
    setStep('person');
  };

  const linkNewContactToProject = useCallback(async () => {
    const contacts = getAllContacts();
    if (contacts.length > contactCountBefore) {
      const newContact = contacts[contacts.length - 1];
      const isCompany = newContact.contactType === 'company';
      const address = newContact.street 
        ? `${newContact.street} ${newContact.number}, ${newContact.postalCode} ${newContact.city}` : '';

      let contactType: 'client' | 'contractor' | 'external_team' | 'team' | 'others' = 'client';
      if (newContact.hoofdtypeId?.toLowerCase().includes('contractor')) contactType = 'contractor';
      else if (newContact.hoofdtypeId?.toLowerCase().includes('consultant')) contactType = 'external_team';

      try {
        const isSupabase = await isSupabaseProject(projectId);
        if (isSupabase) {
          const { error } = await supabase.from('project_contacts').insert({
            project_id: projectId,
            firm_name: isCompany ? (newContact.companyName || newContact.name) : (newContact.companyName || '-'),
            contact_person: newContact.name,
            contact_type: contactType,
            phone: newContact.phone || null,
            mobile: newContact.gsm || null,
            email: newContact.email || null,
            address: address || null,
            company_info: newContact.vatNumber || null,
          });
          if (error) throw error;
        } else {
          addProjectContact({
            projectId, contactId: newContact.id, contactName: newContact.name,
            contactType, company: isCompany ? newContact.name : (newContact.companyName || '-'),
            phone: newContact.phone || '', gsm: newContact.gsm || '',
            email: newContact.email || '',
            firstName: newContact.name.split(' ')[0],
            lastName: newContact.name.split(' ').slice(1).join(' '),
            vatNumber: newContact.vatNumber,
          });
        }
        toast.success(t('createProjectContact.createdAndLinked'));
      } catch (error: any) {
        console.error('Error linking contact to project:', error);
        toast.error(error.message || 'Failed to link contact to project');
      }
    }
    onContactCreated();
    handleClose();
  }, [contactCountBefore, projectId, onContactCreated, t]);

  if (step === 'company') {
    return <CreateClientCompanyDialog open={open} onOpenChange={isOpen => { if (!isOpen) handleClose(); }} onSaved={linkNewContactToProject} />;
  }

  if (step === 'person') {
    return <AddPersonDialog open={open} onOpenChange={isOpen => { if (!isOpen) handleClose(); }} onSaved={linkNewContactToProject} />;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('createProjectContact.title')}</DialogTitle>
          <DialogDescription>{t('createProjectContact.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <button onClick={handleOpenCompany} className="w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors text-left group">
            <div className="flex-1">
              <div className="font-medium">{t('createProjectContact.companyLabel')}</div>
              <div className="text-sm text-muted-foreground">{t('createProjectContact.companyDesc')}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          <button onClick={handleOpenPerson} className="w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors text-left group">
            <div className="flex-1">
              <div className="font-medium">{t('createProjectContact.personLabel')}</div>
              <div className="text-sm text-muted-foreground">{t('createProjectContact.personDesc')}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        <Button variant="outline" onClick={handleClose} className="w-full">
          {t('createProjectContact.cancel')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}