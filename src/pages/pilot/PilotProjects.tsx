import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import { PilotNavigation } from '@/components/pilot/PilotNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, ArrowLeft, Users, Download, ArrowDown, ArrowUp, Play, Clock, FileCheck, Lock, X, CreditCard, RefreshCw, User, Copy, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPilotSession, getPilotUser, getPilotCompany, getPilotProjects, getPilotContacts, getPilotQuotes, getPilotReports, getPilotEmployees, PilotProject, PilotContact, clonePilotNoxVersion, PilotNoxVersionEntry } from '@/lib/pilotSessionStore';
import { toast } from 'sonner';
import { PilotOnboardingFlow2 } from '@/components/pilot/PilotOnboardingFlow2';
import { PilotNoxFlow } from '@/components/pilot/PilotNoxFlow';
import { OxiCloudProjectStatus, STATUS_CONFIG } from '@/types/oxicloud';
import { useLanguage } from '@/i18n/LanguageContext';
import { getTranslatedStatusLabel } from '@/lib/statusLabels';

// View states - matching production
type ViewState = 'default' | 'list' | 'binder' | 'nox-flow';
export default function PilotProjects() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getPilotSession();
  const user = getPilotUser();
  const company = getPilotCompany();
  const [projects, setProjects] = useState(getPilotProjects());
  const [contacts, setContacts] = useState(getPilotContacts());
  const [quotes, setQuotes] = useState(getPilotQuotes());
  const [reports, setReports] = useState(getPilotReports());
  const [employees, setEmployees] = useState(getPilotEmployees());
  const [currentView, setCurrentView] = useState<ViewState>('default');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [lastSelectedProjectId, setLastSelectedProjectId] = useState<string | null>(null);
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [contactFilter, setContactFilter] = useState<'all' | 'client' | 'team'>('all');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [searchMyActiveProjects, setSearchMyActiveProjects] = useState(false);

  // Default view filters
  const [defaultFilterNumber, setDefaultFilterNumber] = useState('');
  const [defaultFilterName, setDefaultFilterName] = useState('');
  const [defaultFilterNoxStatus, setDefaultFilterNoxStatus] = useState<OxiCloudProjectStatus | 'all'>('all');
  const [defaultFilterPlot, setDefaultFilterPlot] = useState('');
  const [defaultFilterLocation, setDefaultFilterLocation] = useState('');
  const [defaultFilterManager, setDefaultFilterManager] = useState('');
  const [defaultFilterTeamMembers, setDefaultFilterTeamMembers] = useState('');
  const [defaultFilterCustom, setDefaultFilterCustom] = useState('');

  // List view search
  const [listSearchNumber, setListSearchNumber] = useState('');
  const [listSearchName, setListSearchName] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  useEffect(() => {
    if (!session) navigate('/pilot-demo');
  }, []);
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowCreateFlow(true);
      setSearchParams({}, {
        replace: true
      });
    }
  }, [searchParams]);

  // Handle deep-link navigation from dashboard Action Required
  useEffect(() => {
    const state = location.state as {
      filterStatus?: string;
      highlightProjectId?: string;
      noxAction?: string;
    } | null;
    if (!state?.highlightProjectId) return;

    setSelectedProjectId(state.highlightProjectId);

    if (state.noxAction) {
      // Open the NOx flow directly
      setTimeout(() => {
        setCurrentView('nox-flow');
      }, 100);
    } else {
      setCurrentView('binder');
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [location, navigate]);
  const refreshAll = () => {
    setProjects(getPilotProjects());
    setContacts(getPilotContacts());
    setQuotes(getPilotQuotes());
    setReports(getPilotReports());
    setEmployees(getPilotEmployees());
  };
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const lastSelectedProject = projects.find(p => p.id === lastSelectedProjectId);

  // Project contacts for binder
  const projectContacts = useMemo(() => {
    if (!selectedProject || !user || !company) return [];
    const result: {
      id: string;
      name: string;
      company: string;
      type: 'client' | 'team';
      email: string;
      function: string;
      phone?: string;
    }[] = [];
    const seenEmails = new Set<string>();
    result.push({
      id: 'owner',
      name: `${user.firstName} ${user.lastName}`,
      company: company.name,
      type: 'team',
      email: user.email,
      function: 'Projectleider',
      phone: user.phone
    });
    seenEmails.add(user.email.toLowerCase());
    employees.filter(e => selectedProject.teamMemberIds.includes(e.id)).forEach(emp => {
      const key = emp.email.toLowerCase();
      if (seenEmails.has(key)) return;
      seenEmails.add(key);
      result.push({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        company: company.name,
        type: 'team',
        email: emp.email,
        function: emp.function || 'Team Member',
        phone: emp.phone || emp.mobile
      });
    });
    if (selectedProject.clientCompanyId) {
      const cc = contacts.find(c => c.id === selectedProject.clientCompanyId);
      if (cc) result.push({
        id: cc.id,
        name: cc.companyName || 'Client Company',
        company: cc.companyName || '',
        type: 'client',
        email: cc.email || '',
        function: 'Opdrachtgeverbedrijf',
        phone: cc.phone
      });
    }
    if (selectedProject.bouwheerContactId) {
      const bh = contacts.find(c => c.id === selectedProject.bouwheerContactId);
      if (bh) result.push({
        id: bh.id,
        name: `${bh.firstName || ''} ${bh.lastName || ''}`.trim(),
        company: contacts.find(c => c.id === bh.companyId)?.companyName || '',
        type: 'client',
        email: bh.email || '',
        function: 'Bouwheer',
        phone: bh.phone || bh.mobile
      });
    }
    return result;
  }, [selectedProject, contacts, employees, user, company]);
  const filteredContacts = useMemo(() => {
    return projectContacts.filter(c => {
      if (contactFilter !== 'all' && c.type !== contactFilter) return false;
      if (contactSearchQuery) {
        const q = contactSearchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q);
      }
      return true;
    });
  }, [projectContacts, contactFilter, contactSearchQuery]);
  const groupedContacts = useMemo(() => {
    const groups: Record<string, typeof filteredContacts> = {};
    filteredContacts.forEach(c => {
      const key = c.company || c.name;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return groups;
  }, [filteredContacts]);

  // Get NOx status using STATUS_CONFIG from production
  const getNoxStatus = (project: PilotProject): {
    label: string;
    color: string;
    status: OxiCloudProjectStatus | null;
  } => {
     if (project.noxStatus) {
       const config = STATUS_CONFIG[project.noxStatus];
       return {
         label: getTranslatedStatusLabel(project.noxStatus, t),
         color: config.color,
         status: project.noxStatus
       };
     }
    const q = quotes.find(qq => qq.projectId === project.id);
    const r = reports.find(rr => rr.projectId === project.id);
     if (r?.status === 'completed') return {
       label: getTranslatedStatusLabel('report_delivered', t),
       color: STATUS_CONFIG.report_delivered.color,
       status: 'report_delivered'
     };
     if (r?.status === 'processing') return {
       label: getTranslatedStatusLabel('report_in_progress', t),
       color: STATUS_CONFIG.report_in_progress.color,
       status: 'report_in_progress'
     };
     if (q?.status === 'paid') return {
       label: getTranslatedStatusLabel('paid', t),
       color: STATUS_CONFIG.paid.color,
       status: 'paid'
     };
     if (q?.status === 'sent') return {
       label: getTranslatedStatusLabel('awaiting_payment', t),
       color: STATUS_CONFIG.awaiting_payment.color,
       status: 'awaiting_payment'
     };
     if (q?.status === 'draft') return {
       label: getTranslatedStatusLabel('price_generated', t),
       color: STATUS_CONFIG.price_generated.color,
       status: 'price_generated'
    };
    return {
      label: 'Empty',
      color: '',
      status: null
    };
  };

  // Filtered projects for default view
  const defaultFilteredProjects = useMemo(() => {
    let result = projects;
    if (defaultFilterNumber) result = result.filter(p => p.projectNumber.toLowerCase().includes(defaultFilterNumber.toLowerCase()));
    if (defaultFilterName) result = result.filter(p => p.name.toLowerCase().includes(defaultFilterName.toLowerCase()));
    if (defaultFilterLocation) {
      result = result.filter(p => {
        if (!p.siteAddress) return false;
        const loc = `${p.siteAddress.street} ${p.siteAddress.number} ${p.siteAddress.city}`.toLowerCase();
        return loc.includes(defaultFilterLocation.toLowerCase());
      });
    }
    if (defaultFilterManager) {
      result = result.filter(p => {
        const managerName = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : '';
        return managerName.includes(defaultFilterManager.toLowerCase());
      });
    }
    if (defaultFilterNoxStatus !== 'all') {
      result = result.filter(p => getNoxStatus(p).status === defaultFilterNoxStatus);
    }
    return result;
  }, [projects, defaultFilterNumber, defaultFilterName, defaultFilterLocation, defaultFilterManager, defaultFilterNoxStatus]);

  // Paginated projects
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return defaultFilteredProjects.slice(start, start + itemsPerPage);
  }, [defaultFilteredProjects, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(defaultFilteredProjects.length / itemsPerPage);

  // Filtered projects for list view
  const listFilteredProjects = useMemo(() => {
    let result = projects;
    if (listSearchNumber) result = result.filter(p => p.projectNumber.toLowerCase().includes(listSearchNumber.toLowerCase()));
    if (listSearchName) result = result.filter(p => p.name.toLowerCase().includes(listSearchName.toLowerCase()));
    if (searchMyActiveProjects) result = result.filter(p => p.status === 'active' || p.status === 'paid');
    return result;
  }, [projects, listSearchNumber, listSearchName, searchMyActiveProjects]);
  if (!session || !user || !company) return null;
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setLastSelectedProjectId(id);
    setCurrentView('binder');
  };
  const handleGlobalSearchClick = () => setCurrentView('list');
  const handleCloseListView = () => {
    setCurrentView('default');
    setListSearchNumber('');
    setListSearchName('');
  };
  const handleBackToDefault = () => {
    setCurrentView('default');
    setSelectedProjectId(null);
  };
  const hasClientContact = projectContacts.some(c => c.type === 'client');
  const hasTeamContact = projectContacts.some(c => c.type === 'team');
  const isNoxFrozen = !hasClientContact || !hasTeamContact;
  const clearAllFilters = () => {
    setDefaultFilterNumber('');
    setDefaultFilterName('');
    setDefaultFilterNoxStatus('all');
    setDefaultFilterPlot('');
    setDefaultFilterLocation('');
    setDefaultFilterManager('');
    setDefaultFilterTeamMembers('');
    setDefaultFilterCustom('');
  };

  // --- NOX FLOW VIEW ---
  if (currentView === 'nox-flow' && selectedProjectId) {
    return <>
      <Helmet><title>NOx Beoordeling - OxiCloud</title></Helmet>
      <div className="min-h-screen bg-background">
        <PilotNavigation />
        <main className="container mx-auto px-4 py-6">
          <PilotNoxFlow projectId={selectedProjectId} onBack={() => {
            setCurrentView('binder');
            refreshAll();
          }} onRefresh={refreshAll} />
        </main>
      </div>
    </>;
  }

  // --- VIEW 3: BINDER VIEW ---
  const renderBinderView = () => {
    if (!selectedProject) return null;
    const noxInfo = getNoxStatus(selectedProject);
    const statusConfig = selectedProject.noxStatus ? STATUS_CONFIG[selectedProject.noxStatus] : null;
    const NOX_STEPS: OxiCloudProjectStatus[] = ['input_incomplete', 'input_completed', 'price_generated', 'awaiting_payment', 'paid', 'report_in_progress', 'report_delivered'];
    const currentStepIndex = selectedProject.noxStatus ? NOX_STEPS.indexOf(selectedProject.noxStatus) : -1;
    const handleCTAClick = () => {
      setCurrentView('nox-flow');
    };
    return <>
      {/* Search Bar with current project - clickable to return */}
      <div className="relative mb-6 cursor-pointer" onClick={handleBackToDefault}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <div className="pl-12 h-12 text-base bg-background border rounded-md flex items-center">
          <span className={cn("inline-block w-2.5 h-2.5 rounded-full mr-2", noxInfo.status ? STATUS_CONFIG[noxInfo.status].color : 'border-2 border-muted-foreground/40')} />
          <span className="font-medium font-mono">{selectedProject.projectNumber}</span>
          <span className="mx-2 text-muted-foreground">—</span>
          <span>{selectedProject.name}</span>
        </div>
      </div>

      {/* Two-Column Split Layout */}
      <div className="flex gap-5 h-[calc(100vh-160px)]">
        {/* LEFT COLUMN: 30% */}
        <div className="w-[30%] flex flex-col gap-4 overflow-auto">
          {/* Details Card */}
          <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Gegevens</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-xs">
                <span className="text-muted-foreground">Nummer</span>
                <span className="font-medium">{selectedProject.projectNumber}</span>
                <span className="text-muted-foreground">Naam</span>
                <span className="font-medium">{selectedProject.name}</span>
                <span className="text-muted-foreground">Bedrijf</span>
                <span className="font-medium">{company.name}</span>
              </div>

              <div className="pt-2 border-t">
                <span className="text-xs font-medium text-muted-foreground">Omschrijving</span>
                <p className="text-xs mt-1">{selectedProject.projectGoal || 'Geen omschrijving'}</p>
              </div>

              {selectedProject.siteAddress && <div className="pt-2 border-t">
                <span className="text-xs font-medium text-muted-foreground">Werflocatie</span>
                <p className="text-xs mt-1.5 text-muted-foreground">
                  {selectedProject.siteAddress.street} {selectedProject.siteAddress.number}, {selectedProject.siteAddress.postalCode} {selectedProject.siteAddress.city}
                </p>
              </div>}
            </CardContent>
          </Card>

          {/* Version History + Clone CTA Card — shown after v0 report delivered */}
          {selectedProject.noxStatus === 'report_delivered' && (
            <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Versiegeschiedenis
                  <Badge variant="secondary" className="text-[10px] ml-auto">
                    {(selectedProject.versionHistory?.length || 0) + 1} {((selectedProject.versionHistory?.length || 0) + 1) === 1 ? 'versie' : 'versies'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {/* Version timeline */}
                <div className="space-y-0">
                  {/* Archived versions */}
                  {(selectedProject.versionHistory || []).map((v, i) => {
                    const statusInfo = STATUS_CONFIG[v.status] || { label: v.status, color: 'bg-muted' };
                    return (
                      <div key={v.version} className="relative">
                        {i < (selectedProject.versionHistory?.length || 0) && (
                          <div className="absolute left-[11px] top-[28px] bottom-0 w-px bg-border/60" />
                        )}
                        <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/20">
                          <div className="mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-muted-foreground/20 text-[9px] font-bold text-muted-foreground">
                            <Lock className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold font-mono">{v.version}</span>
                              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium text-white", statusInfo.color)}>
                                {statusInfo.label}
                              </span>
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 gap-0.5">
                                <Lock className="h-2 w-2" />
                                Vergrendeld
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(v.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <User className="h-2.5 w-2.5" />
                                {v.createdBy}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Current version */}
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-primary text-white text-[9px] font-bold">
                      {(selectedProject.currentVersion || 'v0').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold font-mono">{selectedProject.currentVersion || 'v0'}</span>
                        <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium text-white", STATUS_CONFIG[selectedProject.noxStatus!].color)}>
                          {getTranslatedStatusLabel(selectedProject.noxStatus!, t)}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-primary text-primary">
                          Actief
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(selectedProject.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <User className="h-2.5 w-2.5" />
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clone CTA */}
                <div className="pt-2 border-t border-border/40 space-y-2">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-200">
                        Rapport afgeleverd
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Maak een nieuwe versie aan met aangepaste NOx-berekeningen. Pre-estimatie en werflocatie worden overgenomen.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      const userName = `${user.firstName} ${user.lastName}`;
                      const result = clonePilotNoxVersion(selectedProject.id, userName);
                      if (result) {
                        refreshAll();
                        setSelectedProjectId(selectedProject.id);
                        toast.success(`Nieuwe versie ${result.currentVersion} aangemaakt`);
                      }
                    }}
                    className="w-full gap-2"
                    size="sm"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Nieuwe versie aanmaken
                    <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audit Log Card — shown when versions exist */}
          {(selectedProject.versionHistory?.length || 0) > 0 && (
            <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Audit Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {[...(selectedProject.versionHistory || []), {
                    version: selectedProject.currentVersion || 'v0',
                    createdAt: selectedProject.createdAt,
                    createdBy: `${user.firstName} ${user.lastName}`,
                    status: selectedProject.noxStatus || 'input_incomplete',
                  }].map((entry) => (
                    <div key={entry.version} className="flex items-center justify-between py-1.5 px-2 rounded text-[10px] hover:bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs">{entry.version}</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[9px] font-medium text-white",
                          STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]?.color || 'bg-muted'
                        )}>
                          {STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]?.label || entry.status}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2">
                        <span>{new Date(entry.createdAt).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{entry.createdBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: 70% */}
        <div className="w-[70%] flex flex-col gap-4 overflow-hidden">
          {/* NOx Status Card */}
          {isNoxFrozen ? <Card className="rounded-xl border-muted-foreground/30 bg-muted/40 shadow-sm shrink-0 border border-dotted">
              <CardHeader className="px-4 py-3 pb-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">NOx Assessment</h3>
                  <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 text-muted-foreground border-muted-foreground/30">Setup vereist</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-3">
                  <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50">
                    <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Contacten vereist</p>
                     <p className="text-[10px] text-amber-600 dark:text-amber-400">
                       Voeg minstens één <strong>Klant</strong>-contact en één <strong>Team</strong>-contact toe om verder te gaan.
                     </p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <div className={cn("flex-1 px-2.5 py-1.5 rounded-md border text-[10px] font-medium flex items-center gap-1.5", hasTeamContact ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300")}>
                    {hasTeamContact ? "✓ Team toegevoegd" : "✗ Team ontbreekt"}
                  </div>
                </div>
                <Button className="w-full h-9 text-xs font-medium opacity-50" variant="secondary" disabled>
                  NOx Beoordeling vergrendeld
                </Button>
              </CardContent>
            </Card> : <Card className="rounded-xl border shadow-sm shrink-0 bg-card text-card-foreground">
              <CardHeader className="px-4 py-3 pb-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">NOx Assessment</h3>
                  {statusConfig && <Badge className={cn(statusConfig.color, "text-[10px] font-medium px-2 py-0.5 text-white")}>
                      {statusConfig.label}
                    </Badge>}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                {/* Progress Steps - Visual workflow indicator */}
                {selectedProject.noxStatus && <div className="mb-4">
                    <div className="flex items-center gap-0.5">
                      {NOX_STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex || index === currentStepIndex && step === 'report_delivered';
                    const isCurrent = index === currentStepIndex;
                    return <div key={step} className="flex items-center flex-1">
                            <div className={cn("h-1 flex-1 rounded-full transition-all", isCompleted ? "bg-primary" : isCurrent ? "bg-primary/60" : "bg-muted")} />
                          </div>;
                  })}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[9px] text-muted-foreground">Input</span>
                      <span className="text-[9px] text-muted-foreground">Delivered</span>
                    </div>
                  </div>}

                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Button onClick={handleCTAClick} className="w-full h-9 text-xs font-medium" variant={selectedProject.noxStatus === 'paid' || selectedProject.noxStatus === 'report_in_progress' ? 'default' : 'secondary'}>
                      {(!selectedProject.noxStatus || selectedProject.noxStatus === 'input_incomplete') && <><Play className="h-3.5 w-3.5 mr-1.5" />{selectedProject.preEstimation ? 'Continue your NOx assessment' : 'Start Input'}</>}
                      {selectedProject.noxStatus === 'input_completed' && <><FileCheck className="h-3.5 w-3.5 mr-1.5" />Generate Quote</>}
                      {selectedProject.noxStatus === 'price_generated' && <><CreditCard className="h-3.5 w-3.5 mr-1.5" />Send Quote to Client</>}
                      {selectedProject.noxStatus === 'awaiting_payment' && <><Clock className="h-3.5 w-3.5 mr-1.5" />Awaiting Payment</>}
                      {selectedProject.noxStatus === 'paid' && <><FileCheck className="h-3.5 w-3.5 mr-1.5" />Continue your NOx assessment</>}
                      {selectedProject.noxStatus === 'report_in_progress' && <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Continue your NOx assessment</>}
                      {selectedProject.noxStatus === 'report_delivered' && <><Download className="h-3.5 w-3.5 mr-1.5" />View Report</>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>}

          {/* Contacts Card */}
          <Card className="rounded-xl border bg-card text-card-foreground shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
            <CardHeader className="px-4 py-2.5 flex flex-row items-center justify-between shrink-0 border-b">
              <CardTitle className="text-sm font-semibold">Contacten</CardTitle>
              <div className="flex gap-1.5 items-center">
                <Button size="sm" variant="ghost" onClick={() => setExpandedCompanies(new Set(Object.keys(groupedContacts)))} disabled={expandedCompanies.size === Object.keys(groupedContacts).length} className="h-6 text-[10px] px-2 gap-1">
                  <ArrowDown className="h-3 w-3" />Alles tonen
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setExpandedCompanies(new Set())} disabled={expandedCompanies.size === 0} className="h-6 text-[10px] px-2 gap-1">
                  <ArrowUp className="h-3 w-3" />Inklappen
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input placeholder="Search..." value={contactSearchQuery} onChange={e => setContactSearchQuery(e.target.value)} className="pl-6 h-6 w-24 text-[10px] bg-background" />
                </div>
                <div className="flex bg-muted/50 rounded-md p-0.5">
                  {(['all', 'client', 'team'] as const).map(tab => <button key={tab} onClick={() => setContactFilter(tab)} className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-all ${contactFilter === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                      {tab === 'all' ? 'Alles' : tab === 'client' ? 'Klant' : 'Team'}
                    </button>)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto min-h-0 flex flex-col">
              {projectContacts.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="p-2.5 rounded-full bg-muted mb-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                   <h3 className="text-xs font-medium mb-1">Nog geen contacten gekoppeld</h3>
                   <p className="text-[10px] text-muted-foreground mb-3 max-w-xs">
                     Voeg contacten toe vanuit uw database of maak nieuwe aan.
                   </p>
                </div> : <>
                  {/* Table Header */}
                  <div className="grid grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_100px_minmax(160px,1fr)] gap-3 px-4 py-2 bg-background border-b border-border text-[10px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-20">
                     <div>Bedrijf</div>
                     <div>E-mail</div>
                     <div>Telefoon</div>
                     <div>Adres</div>
                  </div>
                  <div className="p-1.5 flex-1 overflow-auto">
                    {Object.entries(groupedContacts).map(([companyName, persons]) => <div key={companyName} className={cn(expandedCompanies.has(companyName) && "bg-muted/20 rounded-xl my-0.5 shadow-sm")}>
                        {/* Company Row */}
                        <div className={cn("grid grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_100px_minmax(160px,1fr)] gap-3 px-4 py-2 my-0.5 cursor-pointer transition-all duration-200 rounded-lg group", expandedCompanies.has(companyName) ? "bg-[hsl(var(--neon-lime))]/90 rounded-b-none" : "hover:bg-muted/60")} onClick={() => {
                      setExpandedCompanies(prev => {
                        const next = new Set(prev);
                        next.has(companyName) ? next.delete(companyName) : next.add(companyName);
                        return next;
                      });
                    }}>
                          <div className={cn("font-medium text-xs truncate transition-colors", expandedCompanies.has(companyName) ? "text-black" : "text-foreground group-hover:text-foreground")}>{companyName}</div>
                          <div className={cn("text-xs truncate transition-colors", expandedCompanies.has(companyName) ? "text-black/80" : "text-muted-foreground group-hover:text-foreground/80")}>{persons[0]?.email || '—'}</div>
                          <div className={cn("text-xs transition-colors", expandedCompanies.has(companyName) ? "text-black/80" : "text-muted-foreground group-hover:text-foreground/80")}>{persons[0]?.phone || '—'}</div>
                          <div className={cn("text-xs transition-colors", expandedCompanies.has(companyName) ? "text-black/80" : "text-muted-foreground group-hover:text-foreground/80")}>—</div>
                        </div>

                        {/* Expanded Content */}
                        {expandedCompanies.has(companyName) && persons.length > 0 && <div className="bg-background/60 rounded-b-xl mx-0.5">
                            <div className="px-4 py-3 ml-6 border-l-2 border-primary/30">
                              <div className="flex items-center gap-1.5 text-[9px] font-semibold text-primary uppercase tracking-wider mb-2">
                                CONTACTPERSONEN
                                <span className="ml-1 px-1.5 py-0.5 bg-primary/15 rounded-full text-[8px] font-bold">{persons.length}</span>
                              </div>
                              <div className="grid grid-cols-[minmax(100px,1fr)_minmax(120px,1fr)_minmax(140px,1.2fr)_90px] gap-2 text-[9px] font-medium text-muted-foreground mb-1.5 pb-1.5 border-b border-border/40">
                                 <div>Naam</div>
                                 <div>Functie</div>
                                 <div>E-mail</div>
                                 <div>Telefoon</div>
                              </div>
                              <div className="space-y-0">
                                {persons.map(p => <div key={p.id} className="grid grid-cols-[minmax(100px,1fr)_minmax(120px,1fr)_minmax(140px,1.2fr)_90px] gap-2 py-1.5 px-2 -mx-2 text-xs rounded-lg cursor-pointer transition-all group/person hover:bg-muted/50">
                                    <div className="font-medium text-foreground truncate group-hover/person:text-foreground">{p.name}</div>
                                    <div className="text-muted-foreground truncate group-hover/person:text-foreground/70">{p.function || '-'}</div>
                                    <div className="text-muted-foreground truncate group-hover/person:text-foreground/70">{p.email || '-'}</div>
                                    <div className="text-muted-foreground group-hover/person:text-foreground/70">{p.phone || '-'}</div>
                                  </div>)}
                              </div>
                            </div>

                            {/* VESTIGINGEN / ADRESSEN Section */}
                            <div className={cn("px-4 py-3 ml-6 border-l-2 border-primary/30", persons.length > 0 && "border-t border-border/30")}>
                              <div className="flex items-center gap-1.5 text-[9px] font-semibold text-primary uppercase tracking-wider mb-2">
                                VESTIGINGEN / ADRESSEN
                                <span className="ml-1 px-1.5 py-0.5 bg-primary/15 rounded-full text-[8px] font-bold">1</span>
                              </div>
                              <div className="grid grid-cols-[minmax(80px,1fr)_minmax(100px,1fr)_50px_60px_minmax(90px,1fr)] gap-2 text-[9px] font-medium text-muted-foreground mb-1.5 pb-1.5 border-b border-border/40">
                                 <div>Naam</div>
                                 <div>Straat</div>
                                 <div>Nr</div>
                                 <div>Code</div>
                                 <div>Gemeente</div>
                              </div>
                              <div className="grid grid-cols-[minmax(80px,1fr)_minmax(100px,1fr)_50px_60px_minmax(90px,1fr)] gap-2 py-1.5 px-2 -mx-2 text-xs rounded-lg hover:bg-muted/50 cursor-pointer transition-all group/address">
                                <div className="font-medium text-foreground truncate group-hover/address:text-foreground">{companyName.split(' ')[0]}</div>
                                <div className="text-muted-foreground truncate group-hover/address:text-foreground/70">—</div>
                                <div className="text-muted-foreground group-hover/address:text-foreground/70">—</div>
                                <div className="text-muted-foreground group-hover/address:text-foreground/70">—</div>
                                <div className="text-muted-foreground truncate group-hover/address:text-foreground/70">—</div>
                              </div>
                            </div>
                          </div>}
                      </div>)}

                    {Object.keys(groupedContacts).length === 0 && projectContacts.length > 0 && <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <User className="h-6 w-6 mb-2 opacity-30" />
                        <p className="text-xs">Geen contacten gevonden met dit filter</p>
                      </div>}
                  </div>
                </>}
            </CardContent>
          </Card>
        </div>
      </div>
    </>;
  };

  // --- VIEW 2: LIST VIEW ---
  const renderListView = () => <>
      {/* Top Bar with active search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Zoek projecten…" value={globalSearchQuery} onChange={e => setGlobalSearchQuery(e.target.value)} className="pl-12 pr-12 h-12 text-base bg-background" autoFocus />
        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={handleCloseListView}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Last Selected */}
          {lastSelectedProject && <div className="mb-6 pb-4 border-b">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                 <Clock className="h-4 w-4" />
                 <span>Laatst geselecteerd</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors" onClick={() => handleSelectProject(lastSelectedProject.id)}>
                <span className="font-medium">{lastSelectedProject.projectNumber}</span>
                <span className="text-muted-foreground">—</span>
                <span>{lastSelectedProject.name}</span>
              </div>
            </div>}

          {/* Search Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Switch checked={searchMyActiveProjects} onCheckedChange={setSearchMyActiveProjects} id="my-projects" />
              <Label htmlFor="my-projects" className="text-sm cursor-pointer">Zoek in mijn actieve projecten</Label>
            </div>
          </div>

          {/* Search Results List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-0.5 p-2">
              {listFilteredProjects.map(project => {
              const noxInfo = getNoxStatus(project);
              return <div key={project.id} className={cn("flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group items-start relative", "hover:bg-muted/60")} onClick={() => handleSelectProject(project.id)}>
                    <span className="font-mono text-sm font-medium w-24 flex items-center gap-2 text-foreground group-hover:text-black transition-colors pt-0.5">
                      <span className={cn("inline-block w-2.5 h-2.5 rounded-full shrink-0", noxInfo.status ? STATUS_CONFIG[noxInfo.status].color : 'border-2 border-muted-foreground/40')} />
                      {project.projectNumber}
                    </span>
                    <span className="text-sm text-foreground group-hover:text-black transition-colors pt-0.5">{project.name}</span>
                  </div>;
            })}
              {listFilteredProjects.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Geen projecten gevonden</p>
                </div>}
            </div>
          </ScrollArea>

          {/* Pagination */}
          {listFilteredProjects.length > itemsPerPage && <div className="flex justify-center mt-4 pt-4 border-t">
              <div className="flex gap-1">
                {Array.from({
              length: Math.ceil(listFilteredProjects.length / itemsPerPage)
            }, (_, i) => i + 1).map(page => <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>)}
              </div>
            </div>}
        </CardContent>
      </Card>
    </>;

  // --- VIEW 1: DEFAULT VIEW ---
  const renderDefaultView = () => <>
      {/* Global Search Bar - click to activate list view */}
      <div className="relative mb-6 cursor-pointer" onClick={handleGlobalSearchClick}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Zoek projecten…" className="pl-12 h-12 text-base bg-background cursor-pointer" readOnly />
      </div>

      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Left Panel: Search Filters */}
        <Card className="w-80 shrink-0 flex flex-col">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zoekfilters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Zoek op nummer</Label>
              <Input placeholder="e.g. 2025-001" className="h-8 text-sm" value={defaultFilterNumber} onChange={e => setDefaultFilterNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Zoek op naam</Label>
              <Input placeholder="e.g. Pauwels" className="h-8 text-sm" value={defaultFilterName} onChange={e => setDefaultFilterName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">NOx Status</Label>
              <Select value={defaultFilterNoxStatus} onValueChange={v => setDefaultFilterNoxStatus(v as OxiCloudProjectStatus | 'all')}>
                <SelectTrigger className="h-8 text-sm bg-background">
                   <SelectValue placeholder={t('projectList.allStatuses')} />
                 </SelectTrigger>
                 <SelectContent className="bg-background z-50">
                   <SelectItem value="all">
                     <span className="flex items-center gap-2">
                       <span className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/40" />
                       {t('projectList.allStatuses')}
                     </span>
                   </SelectItem>
                   {(Object.keys(STATUS_CONFIG) as OxiCloudProjectStatus[]).map(status => <SelectItem key={status} value={status}>
                       <span className="flex items-center gap-2">
                         <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[status].color}`} />
                         {getTranslatedStatusLabel(status, t)}
                       </span>
                     </SelectItem>)}
                 </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Zoek op perceel</Label>
              <Input placeholder="" className="h-8 text-sm" value={defaultFilterPlot} onChange={e => setDefaultFilterPlot(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Locatie</Label>
              <Input placeholder="" className="h-8 text-sm" value={defaultFilterLocation} onChange={e => setDefaultFilterLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Manager</Label>
              <Input placeholder="" className="h-8 text-sm" value={defaultFilterManager} onChange={e => setDefaultFilterManager(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Teamleden</Label>
              <Input placeholder="" className="h-8 text-sm" value={defaultFilterTeamMembers} onChange={e => setDefaultFilterTeamMembers(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Aangepaste velden</Label>
              <Input placeholder="" className="h-8 text-sm" value={defaultFilterCustom} onChange={e => setDefaultFilterCustom(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-4">
               <Button variant="outline" className="flex-1 h-8 text-sm" onClick={clearAllFilters}>Wissen</Button>
               <Button variant="outline" className="h-8 text-sm">
                 <Download className="h-3 w-3 mr-1" />Exporteren
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel: Project Table */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3 shrink-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projectoverzicht</CardTitle>
            <Button size="sm" onClick={() => setShowCreateFlow(true)}>
              <Plus className="h-4 w-4 mr-1" />Nieuw Project
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-auto min-h-0">
              {/* Table Header */}
              <div className="grid grid-cols-[140px_1fr_180px_1fr] gap-6 px-4 py-3 border-b border-border bg-background text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 z-20">
                <div>N°</div>
                 <div>Naam</div>
                 <div>Manager</div>
                 <div>Locatie</div>
              </div>

              {/* Project Rows */}
              <div>
                {paginatedProjects.map(project => {
                const noxInfo = getNoxStatus(project);
                return <div key={project.id} className={cn("grid grid-cols-[140px_1fr_180px_1fr] gap-6 px-4 py-3 cursor-pointer transition-all duration-200 rounded-lg group items-start relative", "hover:bg-muted/60")} onClick={() => handleSelectProject(project.id)}>
                      <div className="flex items-center gap-2.5 pt-0.5">
                        <span className={cn("inline-block w-2.5 h-2.5 rounded-full shrink-0", noxInfo.status ? STATUS_CONFIG[noxInfo.status].color : 'border-2 border-muted-foreground/40')} />
                        <span className="text-sm font-medium text-foreground group-hover:text-black transition-colors">{project.projectNumber}</span>
                      </div>
                      <div className="text-sm font-medium text-foreground group-hover:text-black transition-colors pt-0.5">{project.name}</div>
                      <div className="text-muted-foreground text-xs group-hover:text-foreground/80 transition-colors pt-0.5">{user.firstName} {user.lastName}</div>
                      <div className="text-muted-foreground text-xs group-hover:text-foreground/80 transition-colors leading-relaxed">
                        {project.siteAddress ? `${project.siteAddress.street} ${project.siteAddress.number}, ${project.siteAddress.postalCode} ${project.siteAddress.city}` : '—'}
                      </div>
                    </div>;
              })}
                {paginatedProjects.length === 0 && <div className="text-center py-16 text-muted-foreground">
                     <p className="text-base font-medium mb-2">Geen projecten gevonden</p>
                     <p className="text-xs mb-4">Maak uw eerste project aan om een NOx-beoordeling te starten</p>
                    
                  </div>}
              </div>
            </div>

            {/* Pagination */}
            {defaultFilteredProjects.length > 0 && <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">{defaultFilteredProjects.length} projecten gevonden</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Toon</span>
                    <Select value={String(itemsPerPage)} onValueChange={v => {
                  setItemsPerPage(Number(v));
                  setCurrentPage(1);
                }}>
                      <SelectTrigger className="w-16 h-8 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {totalPages > 1 && <div className="flex gap-1">
                      {Array.from({
                  length: totalPages
                }, (_, i) => i + 1).map(page => <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(page)}>
                          {page}
                        </Button>)}
                    </div>}
                </div>
              </div>}
          </CardContent>
        </Card>
      </div>
    </>;
  return <>
      <Helmet><title>Projecten - OxiCloud</title></Helmet>
      <div className="min-h-screen bg-background">
        <PilotNavigation />
        <main className="container mx-auto py-6 px-4">
          {currentView === 'default' && renderDefaultView()}
          {currentView === 'list' && renderListView()}
          {currentView === 'binder' && renderBinderView()}
        </main>
      </div>
      {showCreateFlow && <PilotOnboardingFlow2 onComplete={() => {
      setShowCreateFlow(false);
      refreshAll();
    }} onClose={() => setShowCreateFlow(false)} />}
    </>;
}