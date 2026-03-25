import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ContactDetailsDialog } from './ContactDetailsDialog';
import { AddExistingContactDialog } from './AddExistingContactDialog';
import { CreateProjectContactDialog } from './CreateProjectContactDialog';
import { getProjectContacts as getLocalProjectContacts } from '@/lib/mockLocalProjects';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Contact } from '@/types/project';

interface ProjectContactsProps {
  projectId: string;
  onContactsChanged?: () => void;
}

const TEAM_COMPANY_IDS = ['gdesign', '4takt'];

const isSupabaseProjectId = (projectId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(projectId);
};

export const ProjectContacts = ({ projectId, onContactsChanged }: ProjectContactsProps) => {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
  const [isCreateNewOpen, setIsCreateNewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('client');
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

  const getFilteredContacts = () => {
    return contacts.filter(c => c.contact_type === activeTab);
  };

  const filteredContacts = getFilteredContacts();
  const hasAnyContacts = contacts.length > 0;

  const TAB_LABELS: Record<string, string> = {
    client: t('projectContacts.client'),
    team: t('projectContacts.team'),
    external_team: t('projectContacts.external'),
    contractor: t('projectContacts.contractor'),
    others: t('projectContacts.others'),
  };

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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start h-9">
                <TabsTrigger value="client" className="text-xs">{t('projectContacts.client')}</TabsTrigger>
                <TabsTrigger value="team" className="text-xs">{t('projectContacts.team')}</TabsTrigger>
                <TabsTrigger value="external_team" className="text-xs">{t('projectContacts.external')}</TabsTrigger>
                <TabsTrigger value="contractor" className="text-xs">{t('projectContacts.contractor')}</TabsTrigger>
                <TabsTrigger value="others" className="text-xs">{t('projectContacts.others')}</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-3">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    {t('projectContacts.noContacts').replace('{type}', TAB_LABELS[activeTab] || activeTab)}
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow className="h-9">
                          <TableHead className="text-xs">{activeTab === 'team' ? t('projectContacts.firm') : t('projectContacts.firm')}</TableHead>
                          <TableHead className="text-xs">{activeTab === 'team' ? t('contactList.name') : t('projectContacts.contactPerson')}</TableHead>
                          <TableHead className="text-xs">{t('projectContacts.phone')}</TableHead>
                          <TableHead className="text-xs">{t('projectContacts.mobile')}</TableHead>
                          <TableHead className="text-xs">{t('projectContacts.email')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContacts.map((contact) => (
                          <TableRow
                            key={contact.id}
                            className="cursor-pointer h-10 group transition-colors hover:backdrop-blur-md hover:shadow-lg hover:shadow-foreground/5 hover:scale-[1.02] hover:z-10"
                            onClick={() => handleContactClick(contact as Contact)}
                          >
                            <TableCell className="text-sm py-2 group-hover:text-foreground">{contact.firm_name}</TableCell>
                            <TableCell className="text-sm py-2 group-hover:text-foreground">{contact.contact_person}</TableCell>
                            <TableCell className="text-sm py-2 group-hover:text-foreground">{contact.phone || '-'}</TableCell>
                            <TableCell className="text-sm py-2 group-hover:text-foreground">{contact.mobile || '-'}</TableCell>
                            <TableCell className="text-sm py-2 group-hover:text-foreground">{contact.email || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
