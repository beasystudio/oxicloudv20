import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Users, User, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ContactDetailsDialog } from './ContactDetailsDialog';
import { AddExistingContactDialog } from './AddExistingContactDialog';
import { CreateProjectContactDialog } from './CreateProjectContactDialog';
import { getProjectContacts as getLocalProjectContacts } from '@/lib/mockLocalProjects';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import type { Contact } from '@/types/project';

interface ProjectContactsProps {
  projectId: string;
  onContactsChanged?: () => void;
}

const isSupabaseProjectId = (projectId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(projectId);
};

// Group contacts by firm_name to create company-like structure
interface CompanyGroup {
  firmName: string;
  contacts: Contact[];
}

export const ProjectContacts = ({ projectId, onContactsChanged }: ProjectContactsProps) => {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
  const [isCreateNewOpen, setIsCreateNewOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, [projectId]);

  const fetchContacts = async () => {
    if (isSupabaseProjectId(projectId)) {
      try {
        const { data, error } = await supabase
          .from('project_contacts')
          .select('*')
          .eq('project_id', projectId);

        if (error) throw error;
        setContacts(data || []);
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } else {
      const localContacts = getLocalProjectContacts(projectId);
      const mappedContacts: Contact[] = localContacts.map(c => ({
        id: c.id,
        project_id: c.projectId,
        firm_name: c.company,
        contact_person: c.contactName,
        contact_type: c.contactType,
        phone: c.phone,
        mobile: c.gsm,
        email: c.email,
        address: '',
        company_info: c.vatNumber || '',
        correspondence_notes: '',
        created_at: '',
        updated_at: '',
      }));
      setContacts(mappedContacts);
    }
  };

  const handleContactLinked = () => {
    fetchContacts();
    onContactsChanged?.();
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailsOpen(true);
  };

  // Group contacts by firm_name
  const companyGroups: CompanyGroup[] = (() => {
    const groupMap = new Map<string, Contact[]>();
    contacts.forEach(c => {
      const key = c.firm_name || 'Unknown';
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(c);
    });
    return Array.from(groupMap.entries())
      .map(([firmName, contacts]) => ({ firmName, contacts }))
      .sort((a, b) => a.firmName.localeCompare(b.firmName));
  })();

  const selectedCompanyData = companyGroups.find(g => g.firmName === selectedCompany);
  const hasAnyContacts = contacts.length > 0;

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="p-4 rounded-full bg-muted mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{t('projectContacts.noContactsTitle')}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {t('projectContacts.noContactsDesc')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={() => setIsAddExistingOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('projectContacts.addExistingContact')}
        </Button>
        <Button onClick={() => setIsCreateNewOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t('projectContacts.createNewContact')}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base">{t('projectContacts.title')}</CardTitle>
          {hasAnyContacts && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsAddExistingOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {t('projectContacts.addExisting')}
              </Button>
              <Button size="sm" onClick={() => setIsCreateNewOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1" />
                {t('projectContacts.createNew')}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {!hasAnyContacts ? (
            <EmptyState />
          ) : (
            <div className="h-[340px] flex gap-0 overflow-hidden">
              {/* LEFT: Company List */}
              <div className={cn(
                "flex flex-col min-h-0 transition-all duration-300 border border-border/40 rounded-2xl bg-card/80 overflow-hidden",
                selectedCompany ? "w-[260px] shrink-0" : "flex-1"
              )}>
                <div className="flex-1 overflow-auto min-h-0">
                  {companyGroups.map(group => {
                    const isSelected = selectedCompany === group.firmName;
                    return (
                      <div
                        key={group.firmName}
                        className={cn(
                          "px-4 py-3 border-b border-border/20 cursor-pointer transition-all duration-200 relative",
                          isSelected
                            ? "bg-[hsl(var(--neon-lime))]/90"
                            : "hover:scale-[1.02] hover:z-10"
                        )}
                        onClick={() => setSelectedCompany(isSelected ? null : group.firmName)}
                      >
                        <div className={cn("text-sm font-semibold transition-colors", isSelected ? "text-black" : "text-foreground")}>
                          {group.firmName}
                        </div>
                        <div className={cn("text-[11px] mt-0.5 transition-colors", isSelected ? "text-black/60" : "text-muted-foreground")}>
                          {group.contacts[0]?.contact_type || ''}
                        </div>
                        {group.contacts.length > 0 && (
                          <div className={cn("absolute right-4 top-1/2 -translate-y-1/2 text-[10px] tabular-nums transition-colors", isSelected ? "text-black/50" : "text-muted-foreground/40")}>
                            {group.contacts.length} <User className="inline h-3 w-3 -mt-0.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Detail Panel */}
              {selectedCompany && selectedCompanyData && (
                <div className="flex-1 min-h-0 overflow-auto border border-border/40 rounded-2xl bg-card/80 ml-3">
                  {/* Detail Header */}
                  <div className="px-5 py-4 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{selectedCompanyData.firmName}</h3>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                          {selectedCompanyData.contacts[0]?.email && (
                            <span>{selectedCompanyData.contacts[0].email}</span>
                          )}
                          {selectedCompanyData.contacts[0]?.phone && (
                            <>
                              <span className="opacity-40">·</span>
                              <span>{selectedCompanyData.contacts[0].phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Content */}
                  <div className="p-5 space-y-5">
                    {/* Contact Persons Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                          {t('projectContacts.contactPerson')}
                        </h4>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          ({selectedCompanyData.contacts.length})
                        </span>
                      </div>
                      <div className="rounded-xl border border-border/30 overflow-hidden">
                        {/* Sub-table header */}
                        <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-muted/30 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/20">
                          <div>{t('projectContacts.contactPerson')}</div>
                          <div>{t('projectContacts.email')}</div>
                          <div>{t('projectContacts.phone')}</div>
                          <div>{t('projectContacts.mobile')}</div>
                        </div>
                        {/* Sub-table rows */}
                        {selectedCompanyData.contacts.map((contact, idx) => (
                          <div
                            key={contact.id}
                            className={cn(
                              "grid grid-cols-4 gap-4 px-4 py-2.5 text-xs cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:z-10 relative",
                              idx < selectedCompanyData.contacts.length - 1 && "border-b border-border/10"
                            )}
                            onDoubleClick={() => handleContactClick(contact)}
                          >
                            <div className="font-medium text-foreground">{contact.contact_person}</div>
                            <div className="text-muted-foreground truncate">{contact.email || '—'}</div>
                            <div className="text-muted-foreground">{contact.phone || '—'}</div>
                            <div className="text-muted-foreground">{contact.mobile || '—'}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address Section (non-editable, no hover) */}
                    {selectedCompanyData.contacts[0]?.address && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            {t('projectContacts.address') || 'Address'}
                          </h4>
                        </div>
                        <div className="rounded-xl border border-border/30 overflow-hidden">
                          <div className="px-4 py-2.5 text-xs text-muted-foreground">
                            {selectedCompanyData.contacts[0].address}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedContact && (
        <ContactDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          contact={selectedContact}
          onContactUpdated={(updated) => {
            setContacts(contacts.map(c => c.id === updated.id ? updated : c));
            setSelectedContact(updated);
          }}
          onContactDeleted={(id) => {
            setContacts(contacts.filter(c => c.id !== id));
            setIsDetailsOpen(false);
          }}
        />
      )}

      <AddExistingContactDialog
        open={isAddExistingOpen}
        onOpenChange={setIsAddExistingOpen}
        projectId={projectId}
        onContactLinked={handleContactLinked}
      />

      <CreateProjectContactDialog
        open={isCreateNewOpen}
        onOpenChange={setIsCreateNewOpen}
        projectId={projectId}
        onContactCreated={handleContactLinked}
      />
    </>
  );
};
