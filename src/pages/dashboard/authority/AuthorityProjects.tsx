import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { TopNavigation } from '@/components/TopNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search, X, FileText, Download, ChevronDown, ChevronRight, ChevronUp, Loader2, Shield, ClipboardList } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ReportData } from '@/components/authority/UploadReportDialog';
import { MonitorValidationFlow } from '@/components/authority/MonitorValidationFlow';
import { MonitorAuditLog } from '@/components/authority/MonitorAuditLog';
import { getMonitorProjectById, updateMonitorProject, type MonitorProject } from '@/lib/monitorProjectStore';
import { useMockAuth } from '@/contexts/MockAuthContext';

// Lazy load the map component
const ProjectLocationMiniMap = lazy(() => import('@/components/authority/ProjectLocationMiniMap'));
// View states for the 3-view structure
type ProjectView = 'default' | 'list' | 'binder';
interface AuthorityProject {
  id: string;
  projectCode: string;
  projectName: string;
  architect: string;
  company: string;
  address: string;
  location: string;
  projectType: string;
  constructionType: string;
  constructionProgress: number;
  operationProgress: number;
  natura2000Site: string;
  natura2000Code: string;
  distanceToHabitat: number;
  description: string;
  technicalParams: {
    groundFloorArea: number;
    numberOfFloors: number;
    demolitionVolume: number;
    newBuildVolume: number;
    parkingSpaces: number;
    energyConnection: string;
  };
}

// Mock projects data for Authority view
const mockProjects: AuthorityProject[] = [{
  id: 'auth-001',
  projectCode: '2025-001',
  projectName: 'Pauwels Herent',
  architect: 'Jan Vermeersch',
  company: 'GDesign Architects BVBA',
  address: 'Tervuursesteenweg 45, 3001 Heverlee',
  location: 'Herent',
  projectType: 'Residential Development',
  constructionType: 'New Construction',
  constructionProgress: 72,
  operationProgress: 45,
  natura2000Site: 'Dijlevallei',
  natura2000Code: 'BE2400014',
  distanceToHabitat: 1.2,
  description: `Dit project omvat de ontwikkeling van een residentieel complex bestaande uit 24 wooneenheden, verdeeld over twee fases.`,
  technicalParams: {
    groundFloorArea: 1250,
    numberOfFloors: 4,
    demolitionVolume: 350,
    newBuildVolume: 5000,
    parkingSpaces: 36,
    energyConnection: 'Gas + Elektriciteit'
  }
}, {
  id: 'auth-002',
  projectCode: '2025-002',
  projectName: 'Office Tower Brussels',
  architect: 'Marie Claessens',
  company: 'BURO+ Architecture',
  address: 'Havenstraat 120, 2000 Antwerpen',
  location: 'Brussels',
  projectType: 'Commercial Office',
  constructionType: 'Mixed Development',
  constructionProgress: 58,
  operationProgress: 32,
  natura2000Site: 'Scheldevallei',
  natura2000Code: 'BE2300006',
  distanceToHabitat: 2.5,
  description: `Een moderne kantoorontwikkeling in het hart van Brussel met focus op duurzaamheid en werknemerswelzijn.`,
  technicalParams: {
    groundFloorArea: 2800,
    numberOfFloors: 12,
    demolitionVolume: 1200,
    newBuildVolume: 28000,
    parkingSpaces: 150,
    energyConnection: 'Elektriciteit + Warmtenet'
  }
}, {
  id: 'auth-003',
  projectCode: '2025-003',
  projectName: 'Renovatie Villa Mechelen',
  architect: 'Peter Janssens',
  company: 'Immobel SA',
  address: 'Bondgenotenlaan 88, 3000 Leuven',
  location: 'Mechelen',
  projectType: 'Residential Renovation',
  constructionType: 'Renovation',
  constructionProgress: 85,
  operationProgress: 60,
  natura2000Site: 'Mechelse Heide',
  natura2000Code: 'BE2100024',
  distanceToHabitat: 0.8,
  description: `Renovatieproject van een historische villa met behoud van erfgoedwaarde.`,
  technicalParams: {
    groundFloorArea: 450,
    numberOfFloors: 2,
    demolitionVolume: 50,
    newBuildVolume: 100,
    parkingSpaces: 4,
    energyConnection: 'Elektriciteit'
  }
}];
const AuthorityProjects = () => {
  const { currentUser } = useMockAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // View state
  const [currentView, setCurrentView] = useState<ProjectView>('default');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [lastSelectedProjectId, setLastSelectedProjectId] = useState<string | null>(null);
  const [binderTab, setBinderTab] = useState('overview');
  const [phaseTab, setPhaseTab] = useState('overzicht');
  const [aanlegSubTab, setAanlegSubTab] = useState('overzicht');
  const [detailedPhaseTab, setDetailedPhaseTab] = useState('overzicht');
  const [detailedAanlegSubTab, setDetailedAanlegSubTab] = useState('overzicht');

  // Uploaded projects from reports
  const [uploadedProjects, setUploadedProjects] = useState<AuthorityProject[]>([]);

  // Search & filter state for default view
  const [defaultFilterName, setDefaultFilterName] = useState('');
  const [defaultFilterLocation, setDefaultFilterLocation] = useState('');
  const [defaultFilterCompany, setDefaultFilterCompany] = useState('');
  const [defaultFilterCustom, setDefaultFilterCustom] = useState('');

  // List view search state
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [searchMyActiveProjects, setSearchMyActiveProjects] = useState(false);

  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Check for newly uploaded project from sessionStorage
  useEffect(() => {
    const newProjectData = sessionStorage.getItem('newAuthorityProject');
    if (newProjectData) {
      try {
        const reportData: ReportData = JSON.parse(newProjectData);

        // Convert report data to AuthorityProject format
        const newProject: AuthorityProject = {
          id: reportData.id,
          projectCode: reportData.projectCode,
          projectName: reportData.projectName,
          architect: reportData.architect,
          company: reportData.company,
          address: reportData.address,
          location: reportData.address.split(',').pop()?.trim() || 'Unknown',
          projectType: reportData.projectType,
          constructionType: reportData.constructionType,
          constructionProgress: 0,
          operationProgress: 0,
          natura2000Site: reportData.natura2000Site,
          natura2000Code: reportData.natura2000Code,
          distanceToHabitat: reportData.distanceToHabitat,
          description: `Imported from report: ${reportData.fileName}. Submission date: ${reportData.submissionDate}`,
          technicalParams: reportData.technicalParams ? {
            groundFloorArea: reportData.technicalParams.groundFloorArea || 0,
            numberOfFloors: reportData.technicalParams.numberOfFloors || 0,
            demolitionVolume: 0,
            newBuildVolume: 0,
            parkingSpaces: reportData.technicalParams.parkingSpaces || 0,
            energyConnection: 'Pending'
          } : {
            groundFloorArea: 0,
            numberOfFloors: 0,
            demolitionVolume: 0,
            newBuildVolume: 0,
            parkingSpaces: 0,
            energyConnection: 'Pending'
          }
        };
        setUploadedProjects(prev => {
          // Avoid duplicates
          if (prev.find(p => p.id === newProject.id)) return prev;
          return [newProject, ...prev];
        });

        // Select the new project and show binder view
        setSelectedProjectId(newProject.id);
        setCurrentView('binder');

        // Clear the sessionStorage
        sessionStorage.removeItem('newAuthorityProject');
      } catch (e) {
        console.error('Failed to parse new project data:', e);
        sessionStorage.removeItem('newAuthorityProject');
      }
    }
  }, [location]);

  // Combine mock projects with uploaded projects
  const allProjects = useMemo(() => {
    return [...uploadedProjects, ...mockProjects];
  }, [uploadedProjects]);

  // Filter projects for default view
  const defaultFilteredProjects = useMemo(() => {
    let result = allProjects;
    if (defaultFilterName) {
      result = result.filter(p => p.projectName.toLowerCase().includes(defaultFilterName.toLowerCase()));
    }
    if (defaultFilterLocation) {
      result = result.filter(p => p.location.toLowerCase().includes(defaultFilterLocation.toLowerCase()));
    }
    if (defaultFilterCompany) {
      result = result.filter(p => p.company.toLowerCase().includes(defaultFilterCompany.toLowerCase()));
    }
    return result;
  }, [allProjects, defaultFilterName, defaultFilterLocation, defaultFilterCompany]);

  // Filter projects for list view
  const filteredProjects = useMemo(() => {
    if (!listSearchQuery) return allProjects;
    return allProjects.filter(p => p.projectName.toLowerCase().includes(listSearchQuery.toLowerCase()) || p.projectCode.toLowerCase().includes(listSearchQuery.toLowerCase()) || p.company.toLowerCase().includes(listSearchQuery.toLowerCase()));
  }, [allProjects, listSearchQuery]);
  const selectedProject = useMemo(() => {
    return allProjects.find(p => p.id === selectedProjectId) || null;
  }, [allProjects, selectedProjectId]);
  const lastSelectedProject = useMemo(() => {
    return allProjects.find(p => p.id === lastSelectedProjectId) || null;
  }, [allProjects, lastSelectedProjectId]);

  // Handlers - exactly like Jan's interface
  const handleGlobalSearchClick = () => {
    setCurrentView('list');
  };
  const handleCloseListView = () => {
    setCurrentView('default');
    setListSearchQuery('');
  };
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setLastSelectedProjectId(projectId);
    setCurrentView('binder');
  };
  const handleBackToDefault = () => {
    setCurrentView('default');
    setSelectedProjectId(null);
  };
  const clearFilters = () => {
    setDefaultFilterName('');
    setDefaultFilterLocation('');
    setDefaultFilterCompany('');
    setDefaultFilterCustom('');
  };

  // VIEW 1: Default View (Portfolio Overview)
  const renderDefaultView = () => <>
      {/* Global Search Bar - clickable to go to list view */}
      <div className="relative mb-6 cursor-pointer group" onClick={handleGlobalSearchClick}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
        <Input placeholder={t('authority.projects.searchProjects')} className="pl-12 h-12 text-base bg-background cursor-pointer border-border/60 transition-all group-hover:border-primary/50 group-hover:shadow-sm" readOnly />
      </div>

      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Left Panel: Search Filters */}
        <Card className="w-72 shrink-0 flex flex-col border-border/60">
          <CardHeader className="pb-4 shrink-0 border-b border-border/40">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('authority.projects.filters')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('authority.projects.projectName')}</Label>
              <Input placeholder={t('authority.projects.filterByName')} className="h-9 text-sm border-border/60 focus:border-primary/50" value={defaultFilterName} onChange={e => setDefaultFilterName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('authority.projects.location')}</Label>
              <Input placeholder={t('authority.projects.filterByLocation')} className="h-9 text-sm border-border/60 focus:border-primary/50" value={defaultFilterLocation} onChange={e => setDefaultFilterLocation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('authority.projects.company')}</Label>
              <Input placeholder={t('authority.projects.filterByCompany')} className="h-9 text-sm border-border/60 focus:border-primary/50" value={defaultFilterCompany} onChange={e => setDefaultFilterCompany(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{t('authority.projects.customFields')}</Label>
              <Input placeholder={t('authority.projects.searchCustomFields')} className="h-9 text-sm border-border/60 focus:border-primary/50" value={defaultFilterCustom} onChange={e => setDefaultFilterCustom(e.target.value)} />
            </div>
          </CardContent>
          <div className="p-4 border-t border-border/40 shrink-0">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 text-xs font-medium border-border/60 hover:bg-muted/80" onClick={clearFilters}>
                {t('authority.projects.clearAll')}
              </Button>
              <Button variant="outline" className="h-9 text-xs font-medium border-border/60 hover:bg-muted/80">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Panel: Project Overview Cards */}
        <Card className="flex-1 flex flex-col min-h-0 border-border/60">
          <CardHeader className="pb-3 shrink-0 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('authority.projects.projects')}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {defaultFilteredProjects.length} {t('authority.projects.results')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden p-0">
            <div className="flex-1 overflow-auto min-h-0">
              {defaultFilteredProjects.map(project => <div key={project.id} onClick={() => handleSelectProject(project.id)} className={cn("flex items-center gap-5 px-5 py-3 my-0.5 cursor-pointer transition-all duration-200 rounded-lg group", "hover:bg-[hsl(var(--neon-lime))]/90 hover:backdrop-blur-md hover:shadow-lg hover:shadow-[hsl(var(--neon-lime))]/20 hover:scale-[1.02] hover:z-10 hover:ring-2 hover:ring-[hsl(var(--neon-lime))]/50 hover:ring-offset-1")}>
                  {/* Center - Project Info */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-sm text-foreground group-hover:text-black transition-colors">
                        {project.projectName}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground group-hover:text-black/80 transition-colors">
                      {project.company}
                    </p>
                    <p className="text-xs text-muted-foreground/80 truncate group-hover:text-black/70 transition-colors">
                      {project.address}
                    </p>
                  </div>

                  {/* Right - Natura2000 Info */}
                  <div className="flex-shrink-0 text-right space-y-1 min-w-[200px]">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-medium text-foreground group-hover:text-black transition-colors">{project.natura2000Site}</span>
                    </div>
                    <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground group-hover:text-black/80 transition-colors">
                      <span>
                        <span className="group-hover:text-black/60">{t('authority.projects.impact')}: </span>
                        <span className={cn("font-semibold group-hover:text-black transition-colors", project.constructionProgress * 0.006 < 0.5 ? "text-primary" : "text-destructive")}>
                          {(project.constructionProgress * 0.006).toFixed(2)}%
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-black group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>)}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 text-xs text-muted-foreground shrink-0 bg-muted/20">
              <span>{defaultFilteredProjects.length} {t('authority.projects.projectsFound')}</span>
              <div className="flex items-center gap-2">
                <span>{t('authority.projects.show')}</span>
                <Select value={String(itemsPerPage)} onValueChange={v => setItemsPerPage(Number(v))}>
                  <SelectTrigger className="w-16 h-7 text-xs border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>;

  // VIEW 2: Project List (Workspace / Active Projects)
  const renderListView = () => <div className="space-y-4">
      {/* Search Bar with border */}
      <div className="relative border rounded-lg bg-background">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder={t('authority.projects.searchProjects')} className="pl-12 pr-12 h-12 text-base bg-transparent border-0 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer" value={listSearchQuery} onChange={e => setListSearchQuery(e.target.value)} onClick={handleBackToDefault} autoFocus />
        <button onClick={handleCloseListView} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-full transition-colors">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Projects Card */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          {/* Search toggle */}
          <div className="flex items-center gap-3 mb-6">
            <Switch id="active-projects" checked={searchMyActiveProjects} onCheckedChange={setSearchMyActiveProjects} />
             <Label htmlFor="active-projects" className="text-sm text-muted-foreground">
               {t('authority.projects.searchInActive')}
            </Label>
          </div>

          {/* Project List - Names only */}
          <div className="space-y-0">
            {filteredProjects.map(project => <div key={project.id} onClick={() => handleSelectProject(project.id)} className={cn("flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group", "hover:bg-[hsl(var(--neon-lime))]/90 hover:backdrop-blur-md hover:shadow-lg hover:shadow-[hsl(var(--neon-lime))]/20 hover:scale-[1.02] hover:z-10 hover:ring-2 hover:ring-[hsl(var(--neon-lime))]/50 hover:ring-offset-1")}>
                <span className="text-sm text-foreground group-hover:text-black transition-colors">
                  {project.projectName}
                </span>
              </div>)}
          </div>

          {filteredProjects.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">
              {t('authority.projects.noProjectsFound')}
            </div>}
        </CardContent>
      </Card>
    </div>;

  // VIEW 3: Project Binder (Single Project Dashboard)
  const renderBinderView = () => {
    if (!selectedProject) return null;
    return <div className="space-y-4">
        {/* Search Bar - returns to default view */}
        <div className="relative cursor-pointer" onClick={handleBackToDefault}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={`${selectedProject.projectCode} — ${selectedProject.projectName}`} className="pl-11 h-11 text-sm bg-background cursor-pointer font-medium border rounded-lg" readOnly />
        </div>

        {/* Horizontal Phase Tabs - Left aligned */}
        <div className="flex gap-6 border-b border-border/40">
          <button onClick={() => setPhaseTab('overzicht')} className={cn("pb-2 text-sm transition-colors", phaseTab === 'overzicht' ? "text-foreground border-b-2 border-foreground font-medium" : "text-muted-foreground hover:text-foreground")}>
            {t('authority.projects.overzicht')}
          </button>
          <button onClick={() => {
          setPhaseTab('aanlegfase');
          setAanlegSubTab('general');
        }} className={cn("pb-2 text-sm transition-colors", phaseTab === 'aanlegfase' ? "text-foreground border-b-2 border-foreground font-medium" : "text-muted-foreground hover:text-foreground")}>
            {t('authority.projects.aanlegfase')}
          </button>
          <button onClick={() => {
          setPhaseTab('exploitatiefase');
          setAanlegSubTab('general');
        }} className={cn("pb-2 text-sm transition-colors", phaseTab === 'exploitatiefase' ? "text-foreground border-b-2 border-foreground font-medium" : "text-muted-foreground hover:text-foreground")}>
            {t('authority.projects.exploitatiefase')}
          </button>
          <button onClick={() => setPhaseTab('validatie')} className={cn("pb-2 text-sm transition-colors flex items-center gap-1.5", phaseTab === 'validatie' ? "text-foreground border-b-2 border-foreground font-medium" : "text-muted-foreground hover:text-foreground")}>
            <Shield className="h-3.5 w-3.5" />
            {t('authority.projects.validatie')}
          </button>
          <button onClick={() => setPhaseTab('audit')} className={cn("pb-2 text-sm transition-colors flex items-center gap-1.5", phaseTab === 'audit' ? "text-foreground border-b-2 border-foreground font-medium" : "text-muted-foreground hover:text-foreground")}>
            <ClipboardList className="h-3.5 w-3.5" />
            Audit Log
          </button>
        </div>

        {/* Main Layout: Content varies by phase */}
        {phaseTab === 'overzicht' ? (/* Overzicht - No sidebar, full-width 5-card layout */
      <div className="flex-1 min-w-0">
            <OverzichtContent project={selectedProject} />
          </div>) : phaseTab === 'validatie' ? (
      <div className="flex-1 min-w-0 max-w-3xl">
            <ValidationTab project={selectedProject} />
          </div>) : phaseTab === 'audit' ? (
      <div className="flex-1 min-w-0 max-w-4xl">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Activity Log</h3>
              </div>
              <MonitorAuditLog projectId={selectedProject.id} />
            </Card>
          </div>) : (/* Aanlegfase / Exploitatiefase - With sidebar */
      <div className="flex gap-6">
            {/* Left Sidebar */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={() => setAanlegSubTab('general')} className={cn("px-4 py-2 text-[11px] font-medium rounded-full transition-all text-left whitespace-nowrap border", aanlegSubTab === 'general' ? "bg-muted text-foreground border-border" : "text-muted-foreground border-transparent hover:bg-foreground hover:text-[hsl(var(--neon-lime))] hover:border-foreground")}>
                GENERAL COMPLIANCE
              </button>
              <button onClick={() => setAanlegSubTab('puntbronnen')} className={cn("px-4 py-2 text-[11px] font-medium rounded-full transition-all text-left whitespace-nowrap border", aanlegSubTab === 'puntbronnen' ? "bg-muted text-foreground border-border" : "text-muted-foreground border-transparent hover:bg-foreground hover:text-[hsl(var(--neon-lime))] hover:border-foreground")}>
                PUNTBRONNEN
              </button>
              <button onClick={() => setAanlegSubTab('lijnbronnen')} className={cn("px-4 py-2 text-[11px] font-medium rounded-full transition-all text-left whitespace-nowrap border", aanlegSubTab === 'lijnbronnen' ? "bg-muted text-foreground border-border" : "text-muted-foreground border-transparent hover:bg-foreground hover:text-[hsl(var(--neon-lime))] hover:border-foreground")}>
                LIJNBRONNEN
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {phaseTab === 'aanlegfase' && aanlegSubTab === 'general' && <AanlegOverzichtTab project={selectedProject} />}
              {phaseTab === 'aanlegfase' && aanlegSubTab === 'puntbronnen' && <AanlegMachinesTab project={selectedProject} />}
              {phaseTab === 'aanlegfase' && aanlegSubTab === 'lijnbronnen' && <AanlegVerkeerTab project={selectedProject} />}
              {phaseTab === 'exploitatiefase' && aanlegSubTab === 'general' && <ExploitatiefaseGeneralTab project={selectedProject} />}
              {phaseTab === 'exploitatiefase' && aanlegSubTab === 'puntbronnen' && <ExploitatiefasePuntbronnenTab project={selectedProject} />}
              {phaseTab === 'exploitatiefase' && aanlegSubTab === 'lijnbronnen' && <ExploitatiefaseLijnbronnenTab project={selectedProject} />}
            </div>
          </div>)}
      </div>;
  };

  // Binder Overview Tab Component - No top phase tabs, just content
  const BinderOverviewTab = ({
    project
  }: {
    project: AuthorityProject;
  }) => <OverzichtContent project={project} />;

  // Overzicht Phase Content - matches reference image exactly
  const OverzichtContent = ({
    project
  }: {
    project: AuthorityProject;
  }) => <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Project Details */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          {/* Projectgegevens */}
          <div>
            <h3 className="text-base font-medium mb-4 text-foreground">Projectgegevens</h3>
            <div className="space-y-2">
              <Row label="Project Name" value={project.projectName} />
              <Row label="Project Number" value={project.projectCode} />
              <Row label="Company" value={project.company} />
              <Row label="Architect" value={project.architect} />
              <Row label="Project Type" value={project.projectType} />
              <Row label="Construction Type" value={project.constructionType} />
            </div>
          </div>

          {/* Projectbeschrijving */}
          <div className="pt-5 mt-5 border-t border-border/30">
            <h4 className="text-base font-medium mb-3 text-foreground">Projectbeschrijving</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {project.description}
            </p>

            {/* Bouwlogistiek */}
            <p className="text-muted-foreground text-sm mb-2">Bouwlogistiek</p>
            <div className="space-y-2">
              <Row label="Werkdagen/maand" value="20 dagen" />
              <Row label="Werkuren/dag" value="8 uur (07:00 - 16:00)" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Environmental Context + Emissions */}
      <div className="flex flex-col gap-5">
        {/* Ruimtelijke & ecologische context */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-medium mb-4 text-foreground">Ruimtelijke & ecologische context</h3>
            <div className="flex gap-6">
              {/* Left: Data */}
              <div className="flex-1 space-y-2">
                <Row label="SPZ-H code" value={project.natura2000Code} />
                <Row label="SPZ-H naam" value={project.natura2000Site} />
                <Row label="Kritische Depositiewaarde" value="6 kg N/jaar" />
                <Row label="Afstand" value={`${(project.distanceToHabitat * 1000).toFixed(0)} m`} />
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-col gap-2 shrink-0">
                <Button variant="outline" size="sm" className="text-xs justify-center h-8 px-4 border-border/60 rounded-full font-normal">
                  Bekijk de lijst met planten
                </Button>
                <Button variant="outline" size="sm" className="text-xs justify-center h-8 px-4 border-border/60 rounded-full font-normal">
                  Zoek de locatie op
                </Button>
                <Button variant="outline" size="sm" className="text-xs justify-center h-8 px-4 border-border/60 rounded-full font-normal">
                  Raadpleeg VITO-tabellen
                </Button>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-border/30">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground text-sm">Location:</span>
                <span className="text-sm text-foreground">{project.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stikstofemissie */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-medium mb-5 text-foreground">Stikstofemissie</h3>
            <div className="space-y-5">
              <EmissionBar label="Bouwfase" value={0.85} color="orange" />
              <EmissionBar label="Exploitatiefase" value={0.60} color="green" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;

  // Aanlegfase Phase Content - no sub-tabs (controlled by sidebar)
  const AanlegfaseContent = ({
    project,
    subTab
  }: {
    project: AuthorityProject;
    subTab: string;
  }) => <div>
      {subTab === 'overzicht' && <AanlegOverzichtTab project={project} />}
      {subTab === 'machines' && <AanlegMachinesTab project={project} />}
      {subTab === 'verkeer' && <AanlegVerkeerTab project={project} />}
    </div>;

  // Aanlegfase - Overzicht Sub-tab (GENERAL COMPLIANCE)
  const AanlegOverzichtTab = ({
    project
  }: {
    project: AuthorityProject;
  }) => {
    const [showMethodology, setShowMethodology] = useState(false);
    const [showDataSources, setShowDataSources] = useState(false);
    return <div className="space-y-4">
        {/* Hero Card - Main Result */}
        <Card className="border-border/40 shadow-none bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="bg-[hsl(var(--neon-lime))] text-foreground text-xs px-3 py-1 mb-3">
                  COMPLIANT
                </Badge>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">0.420</span>
                  <span className="text-2xl text-muted-foreground">%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Total nitrogen impact during construction phase</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Legal Limit</p>
                <p className="text-2xl font-semibold">1.00%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Impact Progress</span>
                <span>42% of limit used</span>
              </div>
              <div className="h-3 bg-muted/40 rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(var(--neon-lime))] rounded-full transition-all" style={{
                width: '42%'
              }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Point Sources</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-inherit">0.216</span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Stationary machinery emissions</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Line Sources</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-inherit">0.204</span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Traffic-related emissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Formula Box */}
        <Card className="border-border/40 shadow-none bg-muted/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Total Construction Phase Impact Formula</p>
            <p className="text-sm font-mono font-semibold">
              Point Sources (0.216%) + Line Sources (0.204%) = <span className="text-[hsl(var(--neon-lime))] text-inherit">0.420%</span>
            </p>
          </CardContent>
        </Card>

        {/* Conclusion */}
        <Card className="border-border/40 shadow-none">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-2">Conclusion</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The cumulative nitrogen impact during the construction phase (0.420%) remains below the 
              1% de minimis threshold. A further appropriate assessment is not required for this project phase.
            </p>
          </CardContent>
        </Card>

        {/* Assessment Methodology - Collapsible */}
        <Collapsible open={showMethodology} onOpenChange={setShowMethodology}>
          <Card className="border-border/40 shadow-none">
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Assessment Methodology</h4>
                  {showMethodology ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-4">
                <div className="border-t border-border/30 pt-4">
                  <h5 className="text-xs font-medium mb-1">Evaluation Framework</h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The construction phase assessment evaluates nitrogen oxide emissions from two primary categories.
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-1">Point Sources</h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Emissions from stationary construction equipment including asphalt machines, bulldozers, 
                    generators, excavators, cranes, and combustion equipment.
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-1">Line Sources</h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Traffic-related emissions from light vehicles (personnel, deliveries, finishing) and heavy 
                    vehicles (earthworks, foundations, shell construction).
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-1">Compliance Assessment</h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The total impact is compared against the 1% de minimis threshold as defined in the 
                    Stikstofdecreet.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Data Sources - Collapsible */}
        <Collapsible open={showDataSources} onOpenChange={setShowDataSources}>
          <Card className="border-border/40 shadow-none">
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Data Sources</h4>
                  {showDataSources ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-4">
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground">Government Standards</h5>
                  <p className="text-[10px] text-muted-foreground">
                    VITO threshold tables (v1, v2, v3), DDSV guidelines, and official calculation spreadsheets.
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground">Site-Specific Data</h5>
                  <p className="text-[10px] text-muted-foreground">
                    Natura 2000 critical deposition values, KDW thresholds, user-defined project boundaries.
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground">Analytic Methods</h5>
                  <p className="text-[10px] text-muted-foreground">
                    OxiCloud proprietary probability-based inference and industry-standard heuristics.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>;
  };

  // Aanlegfase - Machines Sub-tab (PUNTBRONNEN)
  const AanlegMachinesTab = ({
    project
  }: {
    project: AuthorityProject;
  }) => {
    const [showAssessment, setShowAssessment] = useState(false);
    const [showMethodology, setShowMethodology] = useState(false);
    const equipmentData = [{
      category: 'Asfalteermachine',
      qty: 2,
      perUnit: 12,
      total: 24,
      percentage: 7.8
    }, {
      category: 'Bulldozers',
      qty: 3,
      perUnit: 15,
      total: 45,
      percentage: 14.6
    }, {
      category: 'Generatoren (noodstroom + productiegroep)',
      qty: 13,
      perUnit: 6.5,
      total: 84.5,
      percentage: 27.5
    }, {
      category: 'Graafmachines (dieplepel + graafmachine)',
      qty: 4,
      perUnit: 10,
      total: 40,
      percentage: 13.0
    }, {
      category: 'Hijskranen',
      qty: 3,
      perUnit: 20,
      total: 60,
      percentage: 19.5
    }, {
      category: 'Walsen / Trilmachines / Stampers',
      qty: 9,
      perUnit: 6,
      total: 54,
      percentage: 17.6
    }];
    return <div className="space-y-4">
        {/* Hero Card - Main Result */}
        <Card className="border-border/40 shadow-none bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Emissions</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">307.5</span>
                  <span className="text-xl text-muted-foreground">kg NOₓ</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Stationary machinery during construction</p>
              </div>
              <Badge className="bg-[hsl(var(--neon-lime))] text-foreground text-xs px-3 py-1">
                COMPLIANT
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Threshold Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Maximum Threshold</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">5,000</span>
                <span className="text-lg text-muted-foreground">kg NOₓ</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Legal limit for point sources</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Impact Level</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[hsl(var(--neon-lime))] text-inherit">6.15</span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Of maximum threshold used</p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Progress */}
        <Card className="border-border/40 shadow-none">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Compliance Progress</p>
              <span className="text-sm font-semibold text-[hsl(var(--neon-lime))] text-inherit">6.15%</span>
            </div>
            <div className="h-3 bg-muted/40 rounded-full overflow-hidden">
              <div className="h-full bg-[hsl(var(--neon-lime))] rounded-full transition-all" style={{
              width: '6.15%'
            }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>100% (5,000 kg)</span>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Inventory */}
        <Card className="border-border/40 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold">Equipment Inventory</h4>
                <p className="text-xs text-muted-foreground">Stationary machines and emission breakdown</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2.5 text-muted-foreground font-medium">Equipment</th>
                    <th className="text-center py-2.5 text-muted-foreground font-medium w-16">Qty</th>
                    <th className="text-center py-2.5 text-muted-foreground font-medium w-20">Per Unit</th>
                    <th className="text-center py-2.5 text-muted-foreground font-medium w-20">Total</th>
                    <th className="text-right py-2.5 text-muted-foreground font-medium w-16">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentData.map((item, i) => <tr key={i} className="border-b border-border/20 hover:bg-muted/10">
                      <td className="py-2.5 font-medium">{item.category}</td>
                      <td className="text-center py-2.5 text-muted-foreground">{item.qty}</td>
                      <td className="text-center py-2.5 text-muted-foreground">{item.perUnit}</td>
                      <td className="text-center py-2.5 font-semibold">{item.total}</td>
                      <td className="text-right py-2.5 text-muted-foreground">{item.percentage}%</td>
                    </tr>)}
                  <tr className="font-semibold bg-muted/20">
                    <td className="py-2.5">Total</td>
                    <td className="text-center py-2.5"></td>
                    <td className="text-center py-2.5"></td>
                    <td className="text-center py-2.5 text-[hsl(var(--neon-lime))] text-inherit">307.5</td>
                    <td className="text-right py-2.5">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Formula Box */}
        <Card className="border-border/40 shadow-none bg-muted/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Calculation Formula</p>
            <p className="text-sm font-mono font-semibold">
              307.5 / 5,000 × 100 = <span className="text-[hsl(var(--neon-lime))] text-inherit">6.15%</span>
            </p>
          </CardContent>
        </Card>

        {/* Assessment - Collapsible */}
        <Collapsible open={showAssessment} onOpenChange={setShowAssessment}>
          <Card className="border-border/40 shadow-none">
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Assessment</h4>
                  {showAssessment ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The table above compares the maximum emissions from stationary sources during the 
                  construction phase with the maximum emissions at which the 1% de minimis threshold is not exceeded.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Assuming a KDW of 6 kg N/ha/year and a distance of 1 m to the boundary of the nearest 
                  SBZ-H — according to the step-by-step plan (step 2) from the information session on 
                  Mobility and the Nitrogen Decree (dated 21/08/2024) — the emissions from stationary 
                  sources during the construction phase will remain below the threshold.
                </p>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Methodology - Collapsible */}
        <Collapsible open={showMethodology} onOpenChange={setShowMethodology}>
          <Card className="border-border/40 shadow-none">
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Methodology</h4>
                  {showMethodology ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-4">
                <div>
                  <h5 className="text-xs font-medium mb-1">Data Sources</h5>
                  <p className="text-[10px] text-muted-foreground">
                    Various nitrogen-emitting machines will be used during the construction phase. Emissions 
                    were estimated using the government-provided calculation frameworks.
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-1">Calculation Formula</h5>
                  <p className="text-[10px] text-muted-foreground">
                    Derived from the official Excel spreadsheet provided by the government for emission 
                    calculations from stationary sources during the construction phase.
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-1">Vehicle Type Classification</h5>
                  <p className="text-[10px] text-muted-foreground">
                    Estimated using a probability-based inference method combined with "rule-of-thumb" 
                    heuristics — proprietary to OxiCloud.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>;
  };

  // Aanlegfase - Verkeer Sub-tab (LIJNBRONNEN)
  const AanlegVerkeerTab = ({
    project
  }: {
    project: AuthorityProject;
  }) => {
    const [showAssessment, setShowAssessment] = useState(false);
    const [showMethodology, setShowMethodology] = useState(false);
    return <div className="space-y-4">
        {/* Hero Card - Main Result */}
        <Card className="border-border/40 shadow-none bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Traffic Emissions</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">210</span>
                  <span className="text-xl text-muted-foreground">kg NOₓ</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Traffic during construction phase</p>
              </div>
              <Badge className="bg-[hsl(var(--neon-lime))] text-foreground text-xs px-3 py-1">
                COMPLIANT
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Split Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Light Vehicles</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">130</span>
                <span className="text-lg text-muted-foreground">kg NOₓ</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">62% of total emissions</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Heavy Vehicles</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">80</span>
                <span className="text-lg text-muted-foreground">kg NOₓ</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">38% of total emissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Light Vehicles Detail */}
        <Card className="border-border/40 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold">Light Vehicles</h4>
                <p className="text-xs text-muted-foreground">Personnel, transport, deliveries, finishing work</p>
              </div>
              <Badge className="bg-[hsl(var(--neon-lime))] text-foreground text-[10px] px-2">BELOW THRESHOLD</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Project Movements</p>
                <span className="text-2xl font-bold">1,250</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Maximum Threshold</p>
                <span className="text-2xl font-semibold text-muted-foreground">8,500</span>
              </div>
            </div>
            <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
              <div className="h-full bg-[hsl(var(--neon-lime))] rounded-full" style={{
              width: '14.7%'
            }} />
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">14.7% of limit</p>
          </CardContent>
        </Card>

        {/* Heavy Vehicles Detail */}
        <Card className="border-border/40 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold">Heavy Vehicles</h4>
                <p className="text-xs text-muted-foreground">Earthworks, foundations, shell construction</p>
              </div>
              <Badge className="bg-[hsl(var(--neon-lime))] text-foreground text-[10px] px-2">BELOW THRESHOLD</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Project Movements</p>
                <span className="text-2xl font-bold">450</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Maximum Threshold</p>
                <span className="text-2xl font-semibold text-muted-foreground">2,800</span>
              </div>
            </div>
            <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
              <div className="h-full bg-[hsl(var(--neon-lime))] rounded-full" style={{
              width: '16.1%'
            }} />
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">16.1% of limit</p>
          </CardContent>
        </Card>

        {/* Assessment - Collapsible */}
        <Collapsible open={showAssessment} onOpenChange={setShowAssessment}>
          <Card className="border-border/40 shadow-none">
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Assessment</h4>
                  {showAssessment ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The data compares transport movements generated by this project with the maximum 
                  number of traffic movements that does not exceed the 1% de minimis threshold.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Assuming a KDW of 6 kg N/ha/year and a distance of 1 m to the boundary of the nearest 
                  SBZ-H — the project does not exceed this threshold.
                </p>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Methodology - Collapsible */}
        <Collapsible open={showMethodology} onOpenChange={setShowMethodology}>
          <Card className="border-border/40 shadow-none">
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Methodology & Data Sources</h4>
                  {showMethodology ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-4">
                <div>
                  <h5 className="text-xs font-medium mb-1">Heavy Vehicles (HV)</h5>
                  <p className="text-[10px] text-muted-foreground">
                    Deployed during intensive construction activities including earthworks, foundation 
                    installation, and structural shell construction.
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-1">Light Vehicles (LV)</h5>
                  <p className="text-[10px] text-muted-foreground">
                    Utilized for personnel transport, material deliveries, and finishing operations.
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-1">Government Standards</h5>
                  <p className="text-[10px] text-muted-foreground">
                    DDSV guidelines and VITO calculation spreadsheets for line-source emission sources.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>;
  };

  // Exploitatiefase - General Compliance Tab
  const ExploitatiefaseGeneralTab = ({
    project
  }: {
    project: AuthorityProject;
  }) => {
    const [showMethodology, setShowMethodology] = useState(false);
    return <div className="space-y-4">
        {/* Hero Card - Main Result */}
        <Card className="border-border/40 shadow-none bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="bg-[hsl(var(--neon-lime))] text-foreground text-xs px-3 py-1 mb-3">
                  COMPLIANT
                </Badge>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">0.280</span>
                  <span className="text-2xl text-muted-foreground">%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Total nitrogen impact during operational phase</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Legal Limit</p>
                <p className="text-2xl font-semibold">1.00%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Impact Progress</span>
                <span>28% of limit used</span>
              </div>
              <div className="h-3 bg-muted/40 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{
                width: '28%'
              }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Point Sources</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">0.120</span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Heating and ventilation</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Line Sources</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">0.160</span>
                <span className="text-lg text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Resident and visitor traffic</p>
            </CardContent>
          </Card>
        </div>

        {/* Formula Box */}
        <Card className="border-border/40 shadow-none bg-muted/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Total Operational Phase Impact Formula</p>
            <p className="text-sm font-mono font-semibold">
              Point Sources (0.120%) + Line Sources (0.160%) = <span className="text-emerald-500">0.280%</span>
            </p>
          </CardContent>
        </Card>

        {/* Conclusion */}
        <Card className="border-border/40 shadow-none">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-2">Conclusion</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The cumulative nitrogen impact during the operational phase (0.280%) remains below the 
              1% de minimis threshold. A further appropriate assessment is not required for this project phase.
            </p>
          </CardContent>
        </Card>

        {/* Assessment Methodology - Collapsible */}
        <Collapsible open={showMethodology} onOpenChange={setShowMethodology}>
          <Card className="border-border/40 shadow-none">
            <CollapsibleTrigger asChild>
              <CardContent className="p-4 cursor-pointer hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Assessment Methodology</h4>
                  {showMethodology ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                <div>
                  <h5 className="text-xs font-medium mb-1">Evaluation Framework</h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    The operational phase assessment evaluates ongoing nitrogen emissions from building systems and traffic.
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-1">Point Sources</h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Emissions from heating systems, ventilation units, and any on-site generators or equipment.
                  </p>
                </div>
                <div>
                  <h5 className="text-xs font-medium mb-1">Line Sources</h5>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Traffic-related emissions from residents, employees, visitors, and delivery vehicles.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>;
  };

  // Exploitatiefase - Puntbronnen Tab
  const ExploitatiefasePuntbronnenTab = ({
    project
  }: {
    project: AuthorityProject;
  }) => {
    const heatingData = [{
      category: 'Gas boilers',
      qty: 2,
      perUnit: 8,
      total: 16,
      percentage: 40
    }, {
      category: 'Heat pumps',
      qty: 4,
      perUnit: 2,
      total: 8,
      percentage: 20
    }, {
      category: 'Ventilation systems',
      qty: 6,
      perUnit: 2.5,
      total: 15,
      percentage: 37.5
    }, {
      category: 'Emergency generators',
      qty: 1,
      perUnit: 1,
      total: 1,
      percentage: 2.5
    }];
    return <div className="space-y-4">
        {/* Hero Card */}
        <Card className="border-border/40 shadow-none bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Emissions</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">40</span>
                  <span className="text-xl text-muted-foreground">kg NOₓ/year</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Building systems during operation</p>
              </div>
              <Badge className="bg-emerald-500 text-white text-xs px-3 py-1">
                COMPLIANT
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Inventory */}
        <Card className="border-border/40 shadow-none">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-4">Building Systems Inventory</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2.5 text-muted-foreground font-medium">System</th>
                    <th className="text-center py-2.5 text-muted-foreground font-medium w-16">Qty</th>
                    <th className="text-center py-2.5 text-muted-foreground font-medium w-20">Per Unit</th>
                    <th className="text-center py-2.5 text-muted-foreground font-medium w-20">Total</th>
                    <th className="text-right py-2.5 text-muted-foreground font-medium w-16">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {heatingData.map((item, i) => <tr key={i} className="border-b border-border/20 hover:bg-muted/10">
                      <td className="py-2.5 font-medium">{item.category}</td>
                      <td className="text-center py-2.5 text-muted-foreground">{item.qty}</td>
                      <td className="text-center py-2.5 text-muted-foreground">{item.perUnit}</td>
                      <td className="text-center py-2.5 font-semibold">{item.total}</td>
                      <td className="text-right py-2.5 text-muted-foreground">{item.percentage}%</td>
                    </tr>)}
                  <tr className="font-semibold bg-muted/20">
                    <td className="py-2.5">Total</td>
                    <td className="text-center py-2.5"></td>
                    <td className="text-center py-2.5"></td>
                    <td className="text-center py-2.5 text-emerald-500">40</td>
                    <td className="text-right py-2.5">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>;
  };

  // Exploitatiefase - Lijnbronnen Tab
  const ExploitatiefaseLijnbronnenTab = ({
    project
  }: {
    project: AuthorityProject;
  }) => {
    return <div className="space-y-4">
        {/* Hero Card */}
        <Card className="border-border/40 shadow-none bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Traffic Emissions</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">85</span>
                  <span className="text-xl text-muted-foreground">kg NOₓ/year</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Operational traffic</p>
              </div>
              <Badge className="bg-emerald-500 text-white text-xs px-3 py-1">
                COMPLIANT
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Split Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Resident Traffic</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">55</span>
                <span className="text-lg text-muted-foreground">kg NOₓ/year</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Daily commutes and personal travel</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Visitor & Delivery</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">30</span>
                <span className="text-lg text-muted-foreground">kg NOₓ/year</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Guests, services, and deliveries</p>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Details */}
        <Card className="border-border/40 shadow-none">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3">Traffic Movement Analysis</h4>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Annual Movements</p>
                <span className="text-2xl font-bold">18,250</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Maximum Threshold</p>
                <span className="text-2xl font-semibold text-muted-foreground">65,000</span>
              </div>
            </div>
            <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{
              width: '28%'
            }} />
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">28% of limit</p>
          </CardContent>
        </Card>
      </div>;
  };

  // Exploitatiefase Content (placeholder) - kept for backwards compatibility
  const ExploitatiefaseContent = ({
    project
  }: {
    project: AuthorityProject;
  }) => <ExploitatiefaseGeneralTab project={project} />;

  // Binder Detailed Tab Component

  const BinderDetailedTab = ({
    project
  }: {
    project: AuthorityProject;
  }) => <div className="space-y-0">
      {/* Phase Tabs */}
      <div className="flex justify-start mb-4">
        <Tabs value={detailedPhaseTab} onValueChange={setDetailedPhaseTab} className="w-auto">
          <TabsList className="bg-muted/40 h-9">
            <TabsTrigger value="overzicht" className="text-sm px-4 h-7">Overzicht</TabsTrigger>
            <TabsTrigger value="aanlegfase" className="text-sm px-4 h-7">Aanlegfase</TabsTrigger>
            <TabsTrigger value="exploitatiefase" className="text-sm px-4 h-7">Exploitatiefase</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {detailedPhaseTab === 'overzicht' && <DetailedOverzichtContent project={project} />}
      {detailedPhaseTab === 'aanlegfase' && <AanlegfaseContent project={project} subTab={detailedAanlegSubTab} />}
      {detailedPhaseTab === 'exploitatiefase' && <ExploitatiefaseContent project={project} />}
    </div>;

  // Detailed Overzicht Content (Map + Technical Params)
  const DetailedOverzichtContent = ({
    project
  }: {
    project: AuthorityProject;
  }) => <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Map */}
      <Card className="border-border/40 shadow-none overflow-hidden">
        <div className="h-[280px]">
          <Suspense fallback={<div className="h-full w-full bg-muted/20 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>}>
            <ProjectLocationMiniMap address={project.address} className="h-full w-full" />
          </Suspense>
        </div>
      </Card>

      {/* Right: Technical Parameters */}
      <Card className="border-border/40 shadow-none">
        <CardContent className="p-4">
          <h3 className="text-xs font-semibold mb-4 text-foreground/80">Technische parameters</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px]">Ground Floor Area</span>
              <p className="font-medium text-[11px]">{project.technicalParams.groundFloorArea} m²</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px]">Number of Floors</span>
              <p className="font-medium text-[11px]">{project.technicalParams.numberOfFloors}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px]">Demolition Volume</span>
              <p className="font-medium text-[11px]">{project.technicalParams.demolitionVolume} m³</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px]">New Build Volume</span>
              <p className="font-medium text-[11px]">{project.technicalParams.newBuildVolume} m³</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px]">Parking Spaces</span>
              <p className="font-medium text-[11px]">{project.technicalParams.parkingSpaces}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground text-[10px]">Energy Connection</span>
              <p className="font-medium text-[11px]">{project.technicalParams.energyConnection}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;

  // Helper: Clean row display - matches reference: light gray label, normal weight value
  const Row = ({
    label,
    value,
    mono
  }: {
    label: string;
    value: string | number;
    mono?: boolean;
  }) => <div className="flex justify-between items-center py-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={`text-sm text-foreground ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>;

  // Helper: Emission progress bar - matches reference with orange/green colors
  const EmissionBar = ({
    label,
    value,
    color
  }: {
    label: string;
    value: number;
    color: 'orange' | 'green';
  }) => <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className={`text-sm font-medium ${color === 'orange' ? 'text-orange-500' : 'text-emerald-500'}`}>
          {value.toFixed(3)}%
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden bg-muted/40">
        <div className={`h-full rounded-full ${color === 'orange' ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{
        width: `${Math.min(value * 100, 100)}%`
      }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>Threshold: 1.00%</span>
      </div>
    </div>;
  // Validation Tab - wraps MonitorValidationFlow with project data mapping
  const ValidationTab = ({ project }: { project: AuthorityProject }) => {
    // Try to find a matching monitor project, or create a synthetic one
    const monitorProject: MonitorProject = getMonitorProjectById(project.id) || {
      id: project.id,
      referenceNumber: project.projectCode,
      projectName: project.projectName,
      projectType: project.projectType,
      projectSubtype: project.constructionType,
      developer: project.company,
      architect: project.architect,
      architectFirm: project.company,
      address: project.address,
      municipality: project.location,
      natura2000Site: project.natura2000Site,
      natura2000Code: project.natura2000Code,
      spzH: 'Zone A',
      closestDistanceToHabitat: project.distanceToHabitat,
      emissionSources: [
        { id: 'es1', name: 'Construction emissions', type: 'Mobile', emissionRate: project.constructionProgress * 0.15, unit: 'kg NOx/year' },
      ],
      validationStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Unknown',
      source: 'manual',
    };

    return (
      <MonitorValidationFlow
        project={monitorProject}
        onUpdate={(updated) => {
          updateMonitorProject(updated.id, updated);
        }}
        userName={currentUser?.name || 'Unknown'}
        municipality={currentUser?.company || 'Unknown'}
      />
    );
  };

  return <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto px-6 py-6">
        {currentView === 'default' && renderDefaultView()}
        {currentView === 'list' && renderListView()}
        {currentView === 'binder' && renderBinderView()}
      </div>
    </div>;
};
export default AuthorityProjects;