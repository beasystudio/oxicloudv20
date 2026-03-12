import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PROJECT_TYPES } from '@/types/oxicloud';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { getUsersByCompany } from '@/lib/mockUserDB';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: any) => void;
}

const PROJECT_STATUSES = [
  { value: 'Active', label: 'Actief' },
  { value: 'Pending', label: 'In afwachting' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Completed', label: 'Afgerond' },
];

export const CreateProjectDialog = ({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_number: '',
    name: '',
    status: 'Active',
    project_type: '',
    address: '',
    overview: '',
  });
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const { toast } = useToast();
  const { currentUser, selectedCompanyId, getSelectedCompany } = useMockAuth();

  // Get team members from the current company
  const teamMembers = useMemo(() => {
    if (!selectedCompanyId) return [];
    return getUsersByCompany(selectedCompanyId);
  }, [selectedCompanyId]);

  // Find the owner (current user)
  const ownerMember = useMemo(() => {
    return teamMembers.find(m => 
      m.general.workEmail.toLowerCase() === currentUser?.email?.toLowerCase()
    );
  }, [teamMembers, currentUser]);

  // Get selectable team members (exclude owner - they're always added)
  const selectableTeamMembers = useMemo(() => {
    return teamMembers.filter(m => m.id !== ownerMember?.id);
  }, [teamMembers, ownerMember]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedTeamMembers([]);
    }
  }, [open]);

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          project_number: formData.project_number,
          name: formData.name,
          status: formData.status,
          project_type: formData.project_type || null,
          address: formData.address || null,
          overview: formData.overview || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add owner as team contact
      const selectedCompany = getSelectedCompany();
      const companyName = selectedCompany?.name || currentUser?.company || 'Team';
      
      if (ownerMember) {
        await supabase.from('project_contacts').insert({
          project_id: project.id,
          firm_name: companyName,
          contact_person: `${ownerMember.general.firstName} ${ownerMember.general.lastName}`,
          contact_type: 'team',
          phone: ownerMember.general.phone || null,
          mobile: ownerMember.general.gsm || null,
          email: ownerMember.general.workEmail || null,
          company_info: ownerMember.general.jobTitle || 'Owner',
        });
      }

      // Add selected team members as team contacts
      for (const memberId of selectedTeamMembers) {
        const member = teamMembers.find(m => m.id === memberId);
        if (member) {
          await supabase.from('project_contacts').insert({
            project_id: project.id,
            firm_name: companyName,
            contact_person: `${member.general.firstName} ${member.general.lastName}`,
            contact_type: 'team',
            phone: member.general.phone || null,
            mobile: member.general.gsm || null,
            email: member.general.workEmail || null,
            company_info: member.general.jobTitle || 'Team Member',
          });
        }
      }

      toast({
        title: 'Project aangemaakt',
        description: `${project.name} is succesvol aangemaakt.`,
      });
      
      // Reset form
      setFormData({
        project_number: '',
        name: '',
        status: 'Active',
        project_type: '',
        address: '',
        overview: '',
      });
      setSelectedTeamMembers([]);
      
      onProjectCreated(project);
    } catch (error: any) {
      toast({
        title: 'Fout',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuw project aanmaken</DialogTitle>
          <DialogDescription>
            Vul de basisgegevens in om een nieuw project dossier te starten.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Number & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="project_number" className="text-xs text-muted-foreground">
                Projectnummer *
              </Label>
              <Input 
                id="project_number" 
                value={formData.project_number}
                onChange={(e) => setFormData({ ...formData, project_number: e.target.value })}
                placeholder="bv. 2025-001"
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">
                Projectnaam *
              </Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="bv. Pauwels Herent"
                required 
              />
              <p className="text-[10px] text-muted-foreground">Formaat: Klant + Locatie</p>
            </div>
          </div>

          {/* Status & Project Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Projecttype</Label>
              <Select 
                value={formData.project_type} 
                onValueChange={(value) => setFormData({ ...formData, project_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer..." />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs text-muted-foreground">
              Werfadres
            </Label>
            <Input 
              id="address" 
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Straat, nummer, postcode, gemeente"
            />
          </div>

          {/* Overview */}
          <div className="space-y-1.5">
            <Label htmlFor="overview" className="text-xs text-muted-foreground">
              Projectomschrijving
            </Label>
            <Textarea 
              id="overview" 
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              rows={3}
              placeholder="Korte beschrijving van het project..."
            />
          </div>

          {/* Team Assignment */}
          {selectableTeamMembers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Teamleden toewijzen
              </Label>
              <p className="text-[10px] text-muted-foreground">
                {ownerMember && `${ownerMember.general.firstName} ${ownerMember.general.lastName} (jij) wordt automatisch toegevoegd.`}
              </p>
              <ScrollArea className="h-32 border rounded-md p-2">
                <div className="space-y-2">
                  {selectableTeamMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                      onClick={() => toggleTeamMember(member.id)}
                    >
                      <Checkbox 
                        checked={selectedTeamMembers.includes(member.id)}
                        onCheckedChange={() => toggleTeamMember(member.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {member.general.firstName} {member.general.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.general.jobTitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Bezig...' : 'Project aanmaken'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
