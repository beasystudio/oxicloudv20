import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, ChevronRight, MapPin, User, Building, Phone, Mail, Lock, FileText, Plus, UserPlus, Users } from "lucide-react";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { useState, useMemo, useEffect } from "react";
import { getAllLocalProjects, getProjectContacts, updateLocalProject, addProjectContact, type LocalProject, type ProjectContact } from "@/lib/mockLocalProjects";
import { getEmployeesByCompany, type CompanyEmployee } from "@/lib/mockCompanyDB";
import { getNoxDataByProjectId, updateNoxSubStatus } from "@/lib/noxProjectStore";
import { NoxSubStatus, hasPreEstimationProgress } from "@/types/oxicloud";
import { ProjectCommissionCard } from "@/components/oxicloud/ProjectCommissionCard";
import { ProjectNoxStatusCard } from "@/components/oxicloud/ProjectNoxStatusCard";
import { useNavigate } from "react-router-dom";
import { AddExistingContactDialog } from "@/components/projects/AddExistingContactDialog";
import { CreateProjectContactDialog } from "@/components/projects/CreateProjectContactDialog";
import { ProjectContactDetailModal, type ProjectContactData, type ProjectInfo } from "@/components/projects/ProjectContactDetailModal";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Extended contact interface for the binder view
interface BinderContact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  mobile?: string;
  company: string;
  companyType: 'client' | 'team' | 'others';
  function?: string;
  vatNumber?: string;
  invoiceAddress?: string;
  workPhone?: string;
  isCompany?: boolean; // true if this is a company contact, false for person
}

// Mock coordinates for demo projects
const projectCoordinates: Record<string, {
  lat: number;
  lng: number;
}> = {
  'proj-gdesign-001': {
    lat: 50.9297,
    lng: 4.4320
  },
  // Vilvoorde
  'proj-gdesign-002': {
    lat: 50.8503,
    lng: 4.3517
  },
  // Brussels
  'proj-gdesign-003': {
    lat: 51.0259,
    lng: 4.4777
  },
  // Mechelen
  'proj-4takt-001': {
    lat: 51.0543,
    lng: 3.7174
  } // Gent
};

// Helper function to format phone numbers for readability
const formatPhoneNumber = (phone: string): string => {
  // Remove any existing formatting
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Format Belgian phone numbers
  if (cleaned.startsWith('+32') || cleaned.startsWith('0')) {
    const normalized = cleaned.startsWith('+32') ? cleaned.slice(3) : cleaned.slice(1);
    if (normalized.length >= 8) {
      // Format as XX / XXX XX XX
      return `0${normalized.slice(0, 2)} / ${normalized.slice(2, 5)} ${normalized.slice(5, 7)} ${normalized.slice(7)}`;
    }
  }
  return phone;
};
const ProjectBinderDashboard = () => {
  const {
    currentUser,
    selectedCompanyId,
    getSelectedCompany
  } = useMockAuth();
  const selectedCompany = getSelectedCompany();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactFilter, setContactFilter] = useState<'all' | 'client' | 'team' | 'others'>('all');
  const [selectedContact, setSelectedContact] = useState<BinderContact | null>(null);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [modalContact, setModalContact] = useState<ProjectContactData | null>(null);

  // Project edit state
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [editedProject, setEditedProject] = useState<LocalProject | null>(null);
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0);
  
  // Contact dialogs state
  const [isAddExistingContactOpen, setIsAddExistingContactOpen] = useState(false);
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);
  const [contactsRefreshKey, setContactsRefreshKey] = useState(0);
  const [noxDataRefreshKey, setNoxDataRefreshKey] = useState(0);


  // Check if user can edit projects
  const canEditProject = currentUser?.role === 'client_owner' || currentUser?.role === 'client_admin';

  // Get projects filtered by selected company
  const projects = useMemo(() => {
    const allProjects = getAllLocalProjects();
    if (!selectedCompanyId) return [];
    return allProjects.filter(p => p.companyId === selectedCompanyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId, projectsRefreshKey]);

  // Set first project as default when projects change
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);
  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Get team employees from the owning company
  const teamEmployees = useMemo(() => {
    if (!selectedCompanyId) return [];
    return getEmployeesByCompany(selectedCompanyId);
  }, [selectedCompanyId]);

  // Get project contacts only (team employees are included if added via project contacts)
  const allContacts = useMemo((): BinderContact[] => {
    if (!selectedProjectId) return [];
    const projectContacts = getProjectContacts(selectedProjectId);
    const contacts: BinderContact[] = [];

    // Add project contacts (clients, team, and others)
    projectContacts.forEach(pc => {
      const isClient = pc.contactType === 'client';
      const isTeam = pc.contactType === 'team' || pc.contactType === 'external_team';
      contacts.push({
        id: pc.id,
        firstName: pc.firstName || pc.contactName.split(' ')[0] || '',
        lastName: pc.lastName || pc.contactName.split(' ').slice(1).join(' ') || '',
        fullName: pc.contactName,
        email: pc.email,
        phone: pc.phone || '',
        mobile: pc.gsm,
        company: pc.company,
        companyType: isClient ? 'client' : isTeam ? 'team' : 'others',
        function: pc.function,
        vatNumber: pc.vatNumber,
        invoiceAddress: pc.invoiceAddress,
        workPhone: pc.workPhone
      });
    });
    return contacts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, contactsRefreshKey]);
  
  // Handler for when a contact is added/created
  const handleContactAdded = () => {
    setContactsRefreshKey(prev => prev + 1);
  };

  // Filter contacts based on search and tab
  const filteredContacts = useMemo(() => {
    return allContacts.filter(contact => {
      // Filter by type
      if (contactFilter !== 'all' && contact.companyType !== contactFilter) return false;

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return contact.fullName.toLowerCase().includes(query) || contact.company.toLowerCase().includes(query) || contact.email.toLowerCase().includes(query);
      }
      return true;
    });
  }, [allContacts, contactFilter, searchQuery]);

  // Group contacts by company and create company-level contacts
  const groupedContacts = useMemo(() => {
    const groups: Record<string, { companyContact: BinderContact; persons: BinderContact[] }> = {};
    filteredContacts.forEach(contact => {
      if (!groups[contact.company]) {
        // Create a company-level contact from the first contact of that company
        groups[contact.company] = {
          companyContact: {
            id: `company-${contact.company}`,
            firstName: '',
            lastName: '',
            fullName: contact.company,
            email: contact.email, // Will be overridden if we find company-specific email
            phone: contact.phone,
            mobile: contact.mobile,
            company: contact.company,
            companyType: contact.companyType,
            vatNumber: contact.vatNumber,
            invoiceAddress: contact.invoiceAddress,
            workPhone: contact.workPhone,
            isCompany: true
          },
          persons: []
        };
      }
      // Add person to the group
      groups[contact.company].persons.push({ ...contact, isCompany: false });
      
      // Update company contact with any available company-level data
      if (contact.vatNumber && !groups[contact.company].companyContact.vatNumber) {
        groups[contact.company].companyContact.vatNumber = contact.vatNumber;
      }
      if (contact.invoiceAddress && !groups[contact.company].companyContact.invoiceAddress) {
        groups[contact.company].companyContact.invoiceAddress = contact.invoiceAddress;
      }
    });
    return groups;
  }, [filteredContacts]);

  // Companies are collapsed by default - user expands as needed
  
  const toggleCompanyExpanded = (company: string) => {
    setExpandedCompanies(prev => {
      const next = new Set(prev);
      if (next.has(company)) {
        next.delete(company);
      } else {
        next.add(company);
      }
      return next;
    });
  };
  const handleContactClick = (contact: BinderContact) => {
    setSelectedContact(contact);
  };

  const handleContactDoubleClick = (contact: BinderContact) => {
    // Convert BinderContact to ProjectContactData for the modal
    const projectContactData: ProjectContactData = {
      id: contact.id,
      name: contact.fullName,
      company: contact.company,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      isCompany: contact.isCompany,
      function: contact.function,
      vatNumber: contact.vatNumber,
      billingStreet: contact.invoiceAddress,
      addresses: [],
      projects: [],
    };
    setModalContact(projectContactData);
    setIsContactModalOpen(true);
  };

  const handleContactUpdated = (updatedContact: ProjectContactData) => {
    // Update local state
    setSelectedContact(prev => prev ? {
      ...prev,
      fullName: updatedContact.name,
      email: updatedContact.email,
      phone: updatedContact.phone,
      mobile: updatedContact.mobile,
    } : null);
    setIsContactModalOpen(false);
  };

  // Get current project info for the modal
  const currentProjectInfo: ProjectInfo | undefined = selectedProject ? {
    id: selectedProject.id,
    projectNumber: selectedProject.projectNumber,
    projectName: selectedProject.name,
    status: (selectedProject.status as 'Open' | 'In Progress' | 'On Hold' | 'Completed') || 'Open',
  } : undefined;

  // Project edit handlers
  const handleProjectFieldDoubleClick = () => {
    if (canEditProject && selectedProject) {
      setEditedProject({
        ...selectedProject
      });
      setIsProjectEditOpen(true);
    }
  };
  const handleSaveProject = () => {
    if (editedProject) {
      updateLocalProject(editedProject.id, {
        name: editedProject.name,
        projectNumber: editedProject.projectNumber,
        managerId: editedProject.managerId,
        managerName: editedProject.managerName,
        description: editedProject.description
      });
      setProjectsRefreshKey(prev => prev + 1);
      toast({
        title: "Project updated",
        description: "Project details have been saved."
      });
    }
    setIsProjectEditOpen(false);
    setEditedProject(null);
  };
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Open':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'On Hold':
        return 'outline';
      case 'Completed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Companies are collapsed by default - user expands as needed
  if (!currentUser) return null;
  return <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <main className="container mx-auto px-4 py-6">
        {/* Project Selector */}
        {projects.length > 0 && <div className="flex justify-start mb-6">
            <Select value={selectedProjectId || ''} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-[400px] h-12 text-lg font-semibold">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {projects.map(project => <SelectItem key={project.id} value={project.id} className="text-base py-3">
                    {project.projectNumber} - {project.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>}

        {projects.length === 0 ? <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No projects found for this company.</p>
            </CardContent>
          </Card> : !selectedProject ? <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Select a project to view details.</p>
            </CardContent>
          </Card> : 
          
          /* Two-Column Split Layout: ~35% left / ~65% right */
          <div className="flex gap-6 h-[calc(100vh-180px)]">
            
            {/* LEFT COLUMN: ~35% width - Project Details + Werflocatie */}
            <div className="w-[35%] flex flex-col gap-4">
              
              {/* Section 1: Project Details */}
              <Card className="flex-shrink-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Project Details</CardTitle>
                  {canEditProject && <p className="text-[10px] text-muted-foreground">Double-click to edit</p>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className={`space-y-3 ${canEditProject ? 'cursor-pointer hover:bg-muted/30 -mx-3 px-3 py-2 rounded-lg transition-colors' : ''}`} 
                    onDoubleClick={handleProjectFieldDoubleClick}
                  >
                    <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
                      <span className="text-muted-foreground">Number</span>
                      <span className="font-medium">{selectedProject.projectNumber}</span>
                      
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{selectedProject.name}</span>
                      
                      <span className="text-muted-foreground">Company</span>
                      <span className="font-medium">{selectedCompany?.name || '-'}</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`pt-3 border-t ${canEditProject ? 'cursor-pointer hover:bg-muted/30 -mx-3 px-3 py-2 rounded-lg transition-colors' : ''}`} 
                    onDoubleClick={handleProjectFieldDoubleClick}
                  >
                    <span className="text-sm text-muted-foreground">Description</span>
                    <p className="text-sm mt-1">{selectedProject.description || 'No description available'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: NOx Status Card */}
              {(() => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const noxData = getNoxDataByProjectId(selectedProject.id);
                if (!noxData) return null;
                
                const handleSubStatusChange = (subStatus: NoxSubStatus | undefined) => {
                  updateNoxSubStatus(selectedProject.id, subStatus);
                  setNoxDataRefreshKey(prev => prev + 1);
                  toast({
                    title: "Sub-status updated",
                    description: subStatus ? `Set to: ${subStatus.replace(/_/g, ' ')}` : "Sub-status cleared",
                  });
                };
                
                return (
                  <ProjectNoxStatusCard
                    noxStatus={noxData.status}
                    subStatus={noxData.subStatus}
                    projectName={selectedProject.name}
                    quoteSentDate={noxData.quoteSentDate}
                    daysPending={noxData.daysPending}
                    hasPartialData={hasPreEstimationProgress(noxData.preEstimation)}
                    onStartCalculation={() => navigate('/dashboard/projects')}
                    onSubStatusChange={handleSubStatusChange}
                  />
                );
              })()}

              {/* Section 3: Commission Card */}
              {(() => {
                const noxData = getNoxDataByProjectId(selectedProject.id);
                if (!noxData) return null;
                return (
                  <ProjectCommissionCard
                    projectId={selectedProject.id}
                    noxStatus={noxData.status}
                    commissionAmount={noxData.commissionAmount}
                  />
                );
              })()}

              {/* Section 4: Werflocatie */}
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Werflocatie</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <div className="space-y-2">
                    <p className="text-sm">{selectedProject.location || 'No address available'}</p>
                    {projectCoordinates[selectedProject.id] && (
                      <p className="text-xs text-muted-foreground">
                        {projectCoordinates[selectedProject.id].lat.toFixed(4)}°N, {projectCoordinates[selectedProject.id].lng.toFixed(4)}°E
                      </p>
                    )}
                  </div>
                  
                  {/* Map Container */}
                  <div className="flex-1 min-h-[200px] bg-muted rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/30">
                      <div 
                        className="absolute inset-0 opacity-30" 
                        style={{
                          backgroundImage: 'linear-gradient(hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }} 
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <MapPin className="h-8 w-8 text-destructive drop-shadow-md" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: ~65% width - Project Contacts */}
            <div className="w-[65%]">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 flex flex-row items-center justify-between shrink-0">
                  <CardTitle className="text-lg">Project Contacts</CardTitle>
                  <div className="flex gap-2 items-center">
                    {allContacts.length > 0 && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setIsAddExistingContactOpen(true)}
                          className="h-8"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add existing
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => setIsCreateContactOpen(true)}
                          className="h-8"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Create new
                        </Button>
                      </>
                    )}
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search..." 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        className="pl-8 h-8 w-40 text-sm bg-background" 
                      />
                    </div>
                    <div className="flex gap-1 bg-muted rounded-md p-1">
                      {(['all', 'client', 'team', 'others'] as const).map(tab => (
                        <button 
                          key={tab} 
                          onClick={() => setContactFilter(tab)} 
                          className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                            contactFilter === tab 
                              ? 'bg-background text-foreground shadow-sm' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {tab === 'all' ? 'All' : tab === 'client' ? 'Client' : tab === 'team' ? 'Team' : 'Others'}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                  {/* Empty state - shown when no contacts at all */}
                  {allContacts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
                      <div className="p-4 rounded-full bg-muted mb-4">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-medium mb-2">No contacts linked to this project yet</h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                        Add existing contacts from your address book or create new ones to get started.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" onClick={() => setIsAddExistingContactOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add existing contact
                        </Button>
                        <Button onClick={() => setIsCreateContactOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create new contact
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-full flex-1">
                      <div className="divide-y divide-border">
                        {Object.entries(groupedContacts).map(([company, { companyContact, persons }]) => (
                        <Collapsible 
                          key={company} 
                          open={expandedCompanies.has(company)} 
                          onOpenChange={() => toggleCompanyExpanded(company)}
                        >
                          {/* Company Group Header */}
                          <div className="flex items-center bg-muted/30">
                            <CollapsibleTrigger className="shrink-0 p-3">
                              {expandedCompanies.has(company) 
                                ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> 
                                : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              }
                            </CollapsibleTrigger>
                            <div className="flex-1 flex items-center gap-2 px-2 py-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-sm">{company}</span>
                              <Badge variant="secondary" className="text-xs h-5 px-2">
                                {persons.length + 1}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Expanded Content: Company Row + Person Rows */}
                          <CollapsibleContent>
                            {/* Company as a Contact Row */}
                            <div 
                              onClick={() => handleContactClick(companyContact)} 
                              onDoubleClick={() => handleContactDoubleClick(companyContact)} 
                              className={`flex items-center gap-4 px-4 py-3 pl-10 cursor-pointer transition-all duration-200 border-b border-border/50 rounded-lg group relative ${
                                selectedContact?.id === companyContact.id 
                                  ? 'bg-[hsl(var(--neon-lime))]/50 border-l-2 border-l-primary' 
                                  : 'hover:bg-[hsl(var(--neon-lime))]/90 hover:backdrop-blur-md hover:shadow-lg hover:shadow-[hsl(var(--neon-lime))]/20 hover:scale-[1.02] hover:z-10 hover:ring-2 hover:ring-[hsl(var(--neon-lime))]/50 hover:ring-offset-1'
                              }`}
                            >
                              {/* Company Avatar */}
                              <div className="w-8 h-8 rounded-full bg-secondary group-hover:bg-black/10 flex items-center justify-center shrink-0 transition-colors">
                                <Building className="h-4 w-4 text-muted-foreground group-hover:text-black transition-colors" />
                              </div>
                              
                              {/* Company Name */}
                              <div className="flex flex-col min-w-[180px]">
                                <span className="text-sm font-medium truncate group-hover:text-black transition-colors">{company}</span>
                                <span className="text-xs text-muted-foreground group-hover:text-black/70 transition-colors">Company</span>
                              </div>
                              
                              {/* Work Phone */}
                              <span className="text-sm text-muted-foreground group-hover:text-black transition-colors w-32">{companyContact.phone ? formatPhoneNumber(companyContact.phone) : '-'}</span>
                              
                              {/* Mobile */}
                              <span className="text-sm text-muted-foreground group-hover:text-black transition-colors w-32">{companyContact.mobile ? formatPhoneNumber(companyContact.mobile) : '-'}</span>
                              
                              {/* Email */}
                              <span className="text-sm text-primary group-hover:text-black transition-colors truncate flex-1">{companyContact.email || '-'}</span>
                            </div>
                            
                            {/* Person Rows - Employees of the Company */}
                            {persons.map((contact) => (
                              <div 
                                key={contact.id} 
                                onClick={() => handleContactClick(contact)} 
                                onDoubleClick={() => handleContactDoubleClick(contact)} 
                                className={`flex items-center gap-4 px-4 py-3 pl-10 cursor-pointer transition-all duration-200 border-b border-border/50 last:border-b-0 rounded-lg group relative ${
                                  selectedContact?.id === contact.id 
                                    ? 'bg-[hsl(var(--neon-lime))]/50 border-l-2 border-l-primary' 
                                    : 'hover:bg-[hsl(var(--neon-lime))]/70 hover:backdrop-blur-md hover:scale-[1.01] hover:z-10 hover:ring-1 hover:ring-[hsl(var(--neon-lime))]/40'
                                }`}
                              >
                                {/* Person Avatar */}
                                <div className="w-8 h-8 rounded-full bg-primary/10 group-hover:bg-black/10 flex items-center justify-center text-xs font-bold text-primary group-hover:text-black shrink-0 transition-colors">
                                  {contact.firstName?.[0]}{contact.lastName?.[0]}
                                </div>
                                
                                {/* Person Name & Function */}
                                <div className="flex flex-col min-w-[180px]">
                                  <span className="text-sm font-medium truncate group-hover:text-black transition-colors">{contact.fullName}</span>
                                  {contact.function && (
                                    <span className="text-xs text-muted-foreground group-hover:text-black/70 truncate transition-colors">{contact.function}</span>
                                  )}
                                </div>
                                
                                {/* Work Phone */}
                                <span className="text-sm text-muted-foreground group-hover:text-black transition-colors w-32">{contact.phone ? formatPhoneNumber(contact.phone) : '-'}</span>
                                
                                {/* Mobile Phone */}
                                <span className="text-sm text-muted-foreground group-hover:text-black transition-colors w-32">{contact.mobile ? formatPhoneNumber(contact.mobile) : '-'}</span>
                                
                                {/* Email */}
                                <span className="text-sm text-primary group-hover:text-black transition-colors truncate flex-1">{contact.email || '-'}</span>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                      
                      {Object.keys(groupedContacts).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                          <User className="h-10 w-10 mb-3 opacity-30" />
                          <p className="text-sm">No contacts match your filter</p>
                        </div>
                      )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        }
      </main>

      {/* Contact Detail Modal */}
      <ProjectContactDetailModal
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
        contact={modalContact}
        currentProject={currentProjectInfo}
        onContactUpdated={handleContactUpdated}
      />

      {/* Project Edit Sheet */}
      <Sheet open={isProjectEditOpen} onOpenChange={setIsProjectEditOpen}>
        <SheetContent className="sm:max-w-md flex flex-col h-full">
          <SheetHeader className="shrink-0">
            <SheetTitle>Edit Project Details</SheetTitle>
          </SheetHeader>
          {editedProject && <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="mt-6 space-y-4 pb-6">
                <div className="space-y-2">
                  <Label>Project Number</Label>
                  <Input value={editedProject.projectNumber} onChange={e => setEditedProject({
                ...editedProject,
                projectNumber: e.target.value
              })} />
                </div>
                
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={editedProject.name} onChange={e => setEditedProject({
                ...editedProject,
                name: e.target.value
              })} />
                </div>
                
                <div className="space-y-2">
                  <Label>Manager</Label>
                  <Select value={editedProject.managerId || ''} onValueChange={value => {
                const selectedEmployee = teamEmployees.find(e => e.id === value);
                setEditedProject({
                  ...editedProject,
                  managerId: value,
                  managerName: selectedEmployee?.name || ''
                });
              }}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {teamEmployees.map(employee => <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={editedProject.description || ''} onChange={e => setEditedProject({
                ...editedProject,
                description: e.target.value
              })} placeholder="Project description..." />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProject} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsProjectEditOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </ScrollArea>}
        </SheetContent>
      </Sheet>
      
      {/* Add Existing Contact Dialog */}
      {selectedProjectId && (
        <AddExistingContactDialog
          open={isAddExistingContactOpen}
          onOpenChange={setIsAddExistingContactOpen}
          projectId={selectedProjectId}
          onContactLinked={handleContactAdded}
        />
      )}
      
      {/* Create New Contact Dialog */}
      {selectedProjectId && (
        <CreateProjectContactDialog
          open={isCreateContactOpen}
          onOpenChange={setIsCreateContactOpen}
          projectId={selectedProjectId}
          onContactCreated={handleContactAdded}
        />
      )}
    </div>;
};
export default ProjectBinderDashboard;