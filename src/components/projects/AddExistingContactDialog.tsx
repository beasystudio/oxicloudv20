/**
 * Add Existing Contact Dialog
 * Address book picker to link existing contacts to a project
 */

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Building2, User, Check } from "lucide-react";
import { getAllContacts, getAllProjectRoles } from "@/lib/mockContactDB";
import { addProjectContact } from "@/lib/mockLocalProjects";
import { supabase } from "@/integrations/supabase/client";
import { Contact, ProjectRole } from "@/types/contact";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

interface AddExistingContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onContactLinked: () => void;
}

const isSupabaseProject = async (projectId: string): Promise<boolean> => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(projectId)) return false;
  try {
    const { data, error } = await supabase.from('projects').select('id').eq('id', projectId).maybeSingle();
    return !error && data !== null;
  } catch { return false; }
};

export function AddExistingContactDialog({ open, onOpenChange, projectId, onContactLinked }: AddExistingContactDialogProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setContacts(getAllContacts());
      setRoles(getAllProjectRoles());
      setSearchQuery('');
      setSelectedContactId(null);
      setSelectedRole('');
    }
  }, [open]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.companyName?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const handleLink = async () => {
    if (!selectedContact) return;
    setLoading(true);
    try {
      let contactType: 'client' | 'contractor' | 'external_team' | 'team' | 'others' = 'others';
      if (selectedContact.hoofdtypeId?.toLowerCase().includes('client')) contactType = 'client';
      else if (selectedContact.hoofdtypeId?.toLowerCase().includes('contractor')) contactType = 'contractor';
      else if (selectedContact.hoofdtypeId?.toLowerCase().includes('consultant')) contactType = 'external_team';

      const address = selectedContact.street 
        ? `${selectedContact.street} ${selectedContact.number}, ${selectedContact.postalCode} ${selectedContact.city}` : '';

      const isSupabase = await isSupabaseProject(projectId);
      
      if (isSupabase) {
        const { error } = await supabase.from('project_contacts').insert({
          project_id: projectId,
          firm_name: selectedContact.companyName || selectedContact.name,
          contact_person: selectedContact.name,
          contact_type: contactType,
          phone: selectedContact.phone || null,
          mobile: selectedContact.gsm || null,
          email: selectedContact.email || null,
          address: address || null,
          company_info: (selectedRole && selectedRole !== 'none') ? selectedRole : null,
        });
        if (error) throw error;
      } else {
        addProjectContact({
          projectId, contactId: selectedContact.id, contactName: selectedContact.name,
          contactType, company: selectedContact.companyName || selectedContact.name,
          phone: selectedContact.phone || '', gsm: selectedContact.gsm || '',
          email: selectedContact.email || '',
          firstName: selectedContact.name.split(' ')[0],
          lastName: selectedContact.name.split(' ').slice(1).join(' '),
          vatNumber: selectedContact.vatNumber,
          function: (selectedRole && selectedRole !== 'none') ? selectedRole : '',
        });
      }

      toast.success(t('addExistingContactDialog.contactLinked'));
      onContactLinked();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error linking contact:', error);
      toast.error(error.message || "Failed to link contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addExistingContactDialog.title')}</DialogTitle>
          <DialogDescription>{t('addExistingContactDialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('addExistingContactDialog.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[280px] border rounded-md">
            {filteredContacts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                {t('addExistingContactDialog.noContactsFound')}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors ${
                      selectedContactId === contact.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      contact.contactType === 'company' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {contact.contactType === 'company' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{contact.name}</div>
                      {contact.companyName && contact.contactType === 'individual' && (
                        <div className="text-xs text-muted-foreground truncate">{contact.companyName}</div>
                      )}
                      {contact.email && (
                        <div className="text-xs text-muted-foreground truncate">{contact.email}</div>
                      )}
                    </div>
                    {selectedContactId === contact.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {selectedContact && (
            <div className="space-y-2">
              <Label>{t('addExistingContactDialog.assignRole')}</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t('addExistingContactDialog.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('addExistingContactDialog.noRole')}</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('addExistingContactDialog.cancel')}</Button>
          <Button onClick={handleLink} disabled={!selectedContact || loading}>
            {loading ? t('addExistingContactDialog.linking') : t('addExistingContactDialog.linkContact')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}