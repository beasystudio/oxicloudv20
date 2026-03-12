import { Helmet } from 'react-helmet-async';
import { PillToggle } from '@/components/ui/pill-toggle';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import { PilotNavigation } from '@/components/pilot/PilotNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContactTaxonomyTable } from '@/components/contacts/ContactTaxonomyTable';
import { Plus, Search, User, Upload, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import {
  getPilotSession, getPilotUser, getPilotCompany, getPilotEmployees,
  getPilotOnboarding, addPilotEmployee, updatePilotEmployee, updatePilotUser, PilotEmployee,
  getPilotContacts, addPilotContact,
  getPilotCompanyLogo, setPilotCompanyLogo
} from '@/lib/pilotSessionStore';
import { getPilotTaxonomy } from '@/lib/mockContactDB';
import { AddCompanyModal, type CompanyModalData } from '@/components/settings/AddCompanyModal';
import { UserFormDialogRedesigned } from '@/components/users/UserFormDialogRedesigned';
import { FullUser } from '@/types/user';
import { PilotOnboardingFlow1 } from '@/components/pilot/PilotOnboardingFlow1';
import { cn } from '@/lib/utils';
import { SecurityOverviewPanel } from '@/components/security/SecurityOverviewPanel';
import { useLanguage } from '@/i18n/LanguageContext';

const usePilotTabs = () => {
  const { t } = useLanguage();
  return [
    { id: 'company', label: t('pilot.settings.company') },
    { id: 'users', label: t('pilot.settings.users') },
    { id: 'contacts', label: t('pilot.settings.contacts') },
    { id: 'security', label: t('pilot.settings.security') },
  ] as const;
};

// Storage key for pilot companies list (mirrors production CompanyInfoTab)
const PILOT_COMPANIES_KEY = 'oxicloud_pilot_companies';

interface PilotCompanyData {
  id: string;
  name: string;
  vatNumber: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
  legalName: string;
  branchAddress: string;
  divisions: string[];
  logoUrl: string;
}

export default function PilotSettings() {
  const { t } = useLanguage();
  const TABS = usePilotTabs();
  const navigate = useNavigate();
  const session = getPilotSession();
  const user = getPilotUser();
  const company = getPilotCompany();
  const [employees, setEmployees] = useState(getPilotEmployees());
  const [activeTab, setActiveTab] = useState('company');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [triggerAddType, setTriggerAddType] = useState(0);
  const [companyLogo, setCompanyLogoState] = useState<string | null>(getPilotCompanyLogo());
  const logoInputRef = useRef<HTMLInputElement>(null);
  const onboarding = getPilotOnboarding();

  // Company modal state (mirrors production CompanyInfoTab)
  const [companies, setCompanies] = useState<PilotCompanyData[]>([]);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<CompanyModalData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompanyForDelete, setSelectedCompanyForDelete] = useState<PilotCompanyData | null>(null);
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  // User modal state (mirrors production SettingsUsers)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<FullUser | undefined>(undefined);
  const [activeUserTab, setActiveUserTab] = useState<'active' | 'former'>('active');

  useEffect(() => {
    if (!session) navigate('/pilot-demo');
  }, []);

  const refreshEmployees = () => setEmployees(getPilotEmployees());

  // Load companies from localStorage (mirrors production CompanyInfoTab)
  useEffect(() => {
    const saved = localStorage.getItem(PILOT_COMPANIES_KEY);
    if (saved) {
      setCompanies(JSON.parse(saved));
    } else if (company) {
      // Seed with pilot company
      const seeded: PilotCompanyData = {
        id: company.id,
        name: company.name,
        vatNumber: company.vatNumber || '',
        street: company.legalAddress || '',
        number: '',
        postalCode: company.postalCode || '',
        city: company.city || '',
        country: company.country || 'Belgium',
        legalName: company.name,
        branchAddress: '',
        divisions: [],
        logoUrl: '',
      };
      saveCompanies([seeded]);
    }
  }, []);

  const saveCompanies = (updated: PilotCompanyData[]) => {
    localStorage.setItem(PILOT_COMPANIES_KEY, JSON.stringify(updated));
    setCompanies(updated);
  };

  const handleAddCompany = (companyData: CompanyModalData) => {
    const newCompany: PilotCompanyData = {
      id: crypto.randomUUID(),
      name: companyData.name,
      vatNumber: companyData.vatNumber,
      street: companyData.street,
      number: companyData.number,
      postalCode: companyData.postalCode,
      city: companyData.city,
      country: companyData.country,
      legalName: companyData.legalName || companyData.name,
      branchAddress: companyData.locations?.length > 0 ? `${companyData.locations[0].street} ${companyData.locations[0].number}, ${companyData.locations[0].postalCode} ${companyData.locations[0].city}` : '',
      divisions: companyData.divisions || [],
      logoUrl: (companyData as any).logoUrl || '',
    };
    saveCompanies([...companies, newCompany]);

    // Also add to pilot contacts
    addPilotContact({
      type: 'company',
      companyName: companyData.name,
      vatNumber: companyData.vatNumber,
      street: companyData.street,
      number: companyData.number,
      postalCode: companyData.postalCode,
      city: companyData.city,
      country: companyData.country,
      peppolId: companyData.peppolId || '',
      legalForm: '',
      contactType: 'Consultant',
    });
  };

  const handleUpdateCompany = (companyData: CompanyModalData) => {
    if (!editModalData?.id) return;
    const updated: PilotCompanyData = {
      id: editModalData.id,
      name: companyData.name,
      vatNumber: companyData.vatNumber,
      street: companyData.street,
      number: companyData.number,
      postalCode: companyData.postalCode,
      city: companyData.city,
      country: companyData.country,
      legalName: companyData.legalName || companyData.name,
      branchAddress: companyData.locations?.length > 0 ? `${companyData.locations[0].street} ${companyData.locations[0].number}, ${companyData.locations[0].postalCode} ${companyData.locations[0].city}` : '',
      divisions: companyData.divisions || [],
      logoUrl: (companyData as any).logoUrl || editModalData.logoUrl || '',
    };
    saveCompanies(companies.map(c => c.id === editModalData.id ? updated : c));
    setEditModalData(null);
  };

  const handleDeleteCompany = () => {
    const target = editModalData || selectedCompanyForDelete;
    if (!target?.id) return;
    saveCompanies(companies.filter(c => c.id !== target.id));
    setSelectedCompanyForDelete(null);
    setEditModalData(null);
    setIsDeleteDialogOpen(false);
  };

  const openEditCompanyDialog = (company: PilotCompanyData) => {
    const modalData: CompanyModalData = {
      id: company.id,
      name: company.name,
      vatNumber: company.vatNumber,
      street: company.street,
      number: company.number,
      bus: '',
      postalCode: company.postalCode,
      city: company.city,
      country: company.country,
      peppolId: '',
      kboNumber: '',
      legalName: company.legalName,
      divisions: company.divisions || [],
      locations: [],
      logoUrl: company.logoUrl,
    };
    setEditModalData(modalData);
  };

  // Convert PilotEmployee to FullUser for the production dialog
  const pilotEmployeeToFullUser = (emp: PilotEmployee): FullUser => ({
    id: emp.id,
    general: {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      workEmail: emp.email,
      jobTitle: emp.function || '',
      phone: emp.phone || '',
      gsm: emp.mobile || '',
      language: 'NL',
      nationality: '',
      avatarUrl: null,
      company: company?.name || '',
      myProjectsOnly: false,
      isEmployee: emp.employeeType === 'employee',
      responsibleForHR: false,
      crmAccess: false,
      financialDashboardAccess: false,
      leaveDays: 20,
      extraLeaveDays: 0,
    },
    confidential: {
      street: '', number: '', bus: '', postalCode: '', city: '', country: '',
      idNumber: '', nationalNumber: '', personalEmail: '', personalPhone: '',
      birthdate: null, startDate: null,
    },
    subscription: {
      contractType: emp.id === 'owner-function' ? 'Power User/Admin' : 'Standard User',
      workEmail: emp.email,
      password: '',
      status: 'Active',
    },
    costRates: [],
    availability: { monday: 8, tuesday: 8, wednesday: 8, thursday: 8, friday: 8, breaks: [] },
    createdAt: new Date(emp.createdAt),
    updatedAt: new Date(),
    isFormerEmployee: false,
    terminationDate: null,
  });

  // Handle saving from the production UserFormDialogRedesigned
  const handleUserSaved = () => {
    // The production dialog saves to mockUserDB internally.
    // For pilot, we also refresh our local state.
    refreshEmployees();
    setIsUserDialogOpen(false);
    setEditingUser(undefined);
  };

  const handleEditEmployee = (emp: PilotEmployee) => {
    setEditingUser(pilotEmployeeToFullUser(emp));
    setIsUserDialogOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(undefined);
    setIsUserDialogOpen(true);
  };

  // Ensure owner record exists
  useEffect(() => {
    if (user && company) {
      const emps = getPilotEmployees();
      const ownerRecord = emps.find(e => e.id === 'owner-function');
      if (!ownerRecord) {
        addPilotEmployee({
          firstName: user.firstName, lastName: user.lastName, email: user.email,
          phone: user.phone || '', mobile: '', function: 'Zaakvoerder',
          contactSubtype: 'Architect', employeeType: 'employee', companyId: company.id,
        });
        const all = getPilotEmployees();
        const newest = all.find(e => e.email === user.email && e.id !== 'owner-function');
        if (newest) {
          const idx = all.findIndex(e => e.id === newest.id);
          all[idx] = { ...all[idx], id: 'owner-function' };
          sessionStorage.setItem('pilot_employees', JSON.stringify(all));
          setEmployees(all);
        }
      }
    }
  }, [user, company]);

  if (!session || !user || !company) return null;

  const ownerRecord = employees.find(e => e.id === 'owner-function');

  const allUsers = [
    { id: 'owner', emp: { id: 'owner-function', firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, mobile: '', function: ownerRecord?.function || 'Zaakvoerder', contactSubtype: ownerRecord?.contactSubtype || 'Architect', employeeType: 'employee' as const, companyId: company.id, createdAt: user.createdAt } as PilotEmployee, name: `${user.firstName} ${user.lastName}`, initials: `${user.firstName[0]}${user.lastName[0]}`, function: ownerRecord?.function || 'Zaakvoerder', email: user.email, licenseType: 'Power User' as const, isOwner: true },
    ...employees.filter(emp => emp.email !== user.email && emp.id !== 'owner-function').map(emp => ({
      id: emp.id, emp, name: `${emp.firstName} ${emp.lastName}`, initials: `${emp.firstName[0]}${emp.lastName[0]}`, function: emp.function || '', email: emp.email, licenseType: 'Standard User' as const, isOwner: false,
    })),
  ];

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()) || u.function.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
    c.vatNumber?.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
    c.city?.toLowerCase().includes(companySearchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Settings - OxiCloud</title></Helmet>
      <div className="min-h-screen bg-background">
        <PilotNavigation />
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{t('pilot.settings.title')}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{t('pilot.settings.subtitle')}</p>
            </div>
          </div>

          {/* Pill Tab Navigation */}
          <div className="mb-8">
            <PillToggle
              items={TABS}
              activeId={activeTab}
              onSelect={(id) => setActiveTab(id)}
              layoutId="pilotSettingsPillToggle"
            />
          </div>

          {/* ═══ COMPANY TAB ═══ (mirrors production CompanyInfoTab) */}
          {activeTab === 'company' && (
            <Card className="rounded-xl border border-border/50 shadow-sm">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold">{t('pilot.settings.companies')}</h3>
                    <p className="text-xs text-muted-foreground">{t('pilot.settings.companiesDesc')}</p>
                  </div>
                  <Button size="sm" onClick={() => setIsAddCompanyOpen(true)} className="h-8 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />{t('pilot.settings.addCompany')}
                  </Button>
                </div>
                <div className="relative w-64 mb-4">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder={t('pilot.settings.searchPlaceholder')} value={companySearchQuery} onChange={(e) => setCompanySearchQuery(e.target.value)} className="pl-8 h-8 text-xs" />
                </div>
                {companies.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p className="text-sm">{t('pilot.settings.noCompaniesYet')}</p>
                    <p className="text-xs mt-1">{t('pilot.settings.clickToAdd')}</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b">
                           <TableHead className="h-9 text-xs font-medium text-muted-foreground !pl-5">{t('pilot.settings.companyCol')}</TableHead>
                           <TableHead className="h-9 text-xs font-medium text-muted-foreground">{t('pilot.settings.vatNumber')}</TableHead>
                           <TableHead className="h-9 text-xs font-medium text-muted-foreground">{t('pilot.settings.headOffice')}</TableHead>
                           <TableHead className="h-9 text-xs font-medium text-muted-foreground">{t('pilot.settings.branches')}</TableHead>
                           <TableHead className="h-9 text-xs font-medium text-muted-foreground !pr-5">{t('pilot.settings.divisions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCompanies.map(comp => (
                          <TooltipProvider key={comp.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <TableRow className="group cursor-pointer border-b border-border/30 transition-all duration-200" onDoubleClick={() => openEditCompanyDialog(comp)}>
                                  <TableCell className="py-3 !pl-5">
                                    <div className="flex items-center gap-2.5">
                                      {comp.logoUrl && <img src={comp.logoUrl} alt="Logo" className="w-7 h-7 object-contain rounded" />}
                                      <div>
                                        <div className="text-sm font-medium">{comp.name}</div>
                                        {comp.legalName && <div className="text-xs text-muted-foreground">{comp.legalName}</div>}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-3 text-xs text-muted-foreground">{comp.vatNumber || '—'}</TableCell>
                                  <TableCell className="py-3">
                                    {comp.street || comp.city ? (
                                      <div>
                                        <div className="text-xs">{comp.street && `${comp.street} ${comp.number}`}</div>
                                        {comp.city && <div className="text-xs text-muted-foreground">{comp.postalCode} {comp.city}</div>}
                                      </div>
                                    ) : <span className="text-xs text-muted-foreground">—</span>}
                                  </TableCell>
                                  <TableCell className="py-3">
                                    {comp.branchAddress ? (
                                      <span className="text-xs text-muted-foreground">{comp.branchAddress}</span>
                                    ) : <span className="text-xs text-muted-foreground">—</span>}
                                  </TableCell>
                                  <TableCell className="py-3 !pr-5">
                                    <div className="flex flex-wrap gap-1">
                                      {comp.divisions.length > 0 ? (
                                        <>
                                          {comp.divisions.slice(0, 2).map((div, index) => (
                                            <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">{div}</Badge>
                                          ))}
                                          {comp.divisions.length > 2 && (
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">+{comp.divisions.length - 2}</Badge>
                                          )}
                                        </>
                                      ) : <span className="text-xs text-muted-foreground">—</span>}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                <p className="text-xs">{t('pilot.settings.doubleClickEdit')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ═══ USERS TAB ═══ (mirrors production SettingsUsers) */}
          {activeTab === 'users' && (
            <Card className="rounded-xl border border-border/50 shadow-sm">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold">{t('pilot.settings.employees')}</h3>
                    <p className="text-xs text-muted-foreground">{t('pilot.settings.employeesDesc')}</p>
                  </div>
                  <Button onClick={handleAddUser} size="sm" className="h-8 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />{t('pilot.settings.addEmployee')}
                  </Button>
                </div>
                {/* Tab buttons */}
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setActiveUserTab('active')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeUserTab === 'active' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
                    {t('pilot.settings.activeTab')} ({allUsers.length})
                  </button>
                  <button onClick={() => setActiveUserTab('former')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeUserTab === 'former' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
                    {t('pilot.settings.formerTab')} (0)
                  </button>
                </div>

                {activeUserTab === 'active' && (
                  <>
                    {allUsers.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm font-medium mb-1">{t('pilot.settings.noTeamYet')}</p>
                        <p className="text-xs">{t('pilot.settings.noTeamDesc')}</p>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/30">
                              <TableHead className="h-9 text-xs font-medium text-muted-foreground">{t('pilot.settings.employeeCol')}</TableHead>
                              <TableHead className="h-9 text-xs font-medium text-muted-foreground">{t('pilot.settings.licenseType')}</TableHead>
                              <TableHead className="h-9 text-xs font-medium text-muted-foreground">{t('pilot.settings.myProjects')}</TableHead>
                              <TableHead className="h-9 text-xs font-medium text-muted-foreground">{t('pilot.settings.accessModules')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TooltipProvider>
                              {filteredUsers.map((u) => (
                                <Tooltip key={u.id}>
                                  <TooltipTrigger asChild>
                                    <TableRow
                                      className="group cursor-pointer transition-all duration-200"
                                      onDoubleClick={() => handleEditEmployee(u.emp)}
                                    >
                                      <TableCell className="py-3">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                          <div>
                                            <div className="text-sm font-medium">{u.name}</div>
                                            <div className="text-xs text-muted-foreground">{u.function}</div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-3">
                                        <Badge variant={u.licenseType === 'Power User' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5">{u.licenseType}</Badge>
                                      </TableCell>
                                      <TableCell className="py-3 text-sm">{u.isOwner ? '✕' : '✓'}</TableCell>
                                      <TableCell className="py-3">
                                        {u.isOwner ? (
                                          <div className="flex flex-wrap gap-1">
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Settings</Badge>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Financial Dashboard</Badge>
                                          </div>
                                        ) : <span className="text-xs text-muted-foreground">{t('pilot.settings.standard')}</span>}
                                      </TableCell>
                                    </TableRow>
                                  </TooltipTrigger>
                                  <TooltipContent side="top"><p className="text-xs">{t('pilot.settings.doubleClickEdit')}</p></TooltipContent>
                                </Tooltip>
                              ))}
                            </TooltipProvider>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
                {activeUserTab === 'former' && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">{t('pilot.settings.noFormerEmployees')}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ═══ CONTACTS TAB ═══ */}
          {activeTab === 'contacts' && (
            <Card className="rounded-xl border border-border/50 shadow-sm">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold">{t('pilot.settings.contactTypes')}</h3>
                    <p className="text-xs text-muted-foreground">{t('pilot.settings.contactTypesDesc')}</p>
                  </div>
                  <Button onClick={() => setTriggerAddType(prev => prev + 1)} size="sm" className="h-8 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />{t('pilot.settings.addType')}
                  </Button>
                </div>
                <ContactTaxonomyTable triggerAdd={triggerAddType} />
              </div>
            </Card>
          )}

          {/* ═══ SECURITY TAB ═══ */}
          {activeTab === 'security' && (
            <SecurityOverviewPanel />
          )}
        </main>
      </div>

      {/* Production AddCompanyModal */}
      <AddCompanyModal
        open={isAddCompanyOpen || !!editModalData}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddCompanyOpen(false);
            setEditModalData(null);
          }
        }}
        existingVatNumbers={companies
          .filter(c => c.id !== editModalData?.id)
          .map(c => c.vatNumber?.replace(/[\s.\-]/g, '').toUpperCase())
          .filter(Boolean)}
        initialData={editModalData}
        onCompanyAdded={handleAddCompany}
        onCompanyUpdated={handleUpdateCompany}
        onCompanyDeleted={() => {
          if (editModalData) {
            setSelectedCompanyForDelete({ id: editModalData.id } as PilotCompanyData);
            setEditModalData(null);
            setIsDeleteDialogOpen(true);
          }
        }}
      />

      {/* Delete Confirmation (mirrors production) */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
         <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">{t('pilot.settings.deleteCompany')}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {t('pilot.settings.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('pilot.settings.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCompany} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('pilot.settings.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Production UserFormDialogRedesigned */}
      <UserFormDialogRedesigned
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        user={editingUser}
        onSaved={handleUserSaved}
      />

      {showOnboarding && <PilotOnboardingFlow1 onComplete={() => { setShowOnboarding(false); navigate('/pilot-demo/projects'); }} onClose={() => setShowOnboarding(false)} />}
    </>
  );
}
