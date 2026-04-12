/**
 * Create New Project Dialog - Production Mode
 * 5-step wizard mirroring pilot flow:
 *   Step 1: Projectgegevens (naam, nummer, projectleider dropdown, team members)
 *   Step 2: Opdrachtgeverbedrijf (search address book / KBO lookup)
 *   Step 3: Bedrijfsgegevens invullen (company detail form - only if new company)
 *   Step 4: Bouwheer (person linked to client company)
 *   Step 5: Werflocatie (construction site address)
 */

import { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getAllProjectPhases } from '@/lib/mockProjectSettingsDB';
import { getEmployeesByCompany, isCompanyDataSeeded, seedCompanyData } from '@/lib/mockCompanyDB';
import { createLocalProject, getAllLocalProjects, addProjectContact, type LocalProject, type PhaseHours } from '@/lib/mockLocalProjects';
import { getAllContacts, createContact } from '@/lib/mockContactDB';
import { supabase } from '@/integrations/supabase/client';
import { useMockAuth } from '@/contexts/MockAuthContext';
import {
  Check, ChevronsUpDown, Search, Loader2, AlertCircle, CheckCircle2,
  ArrowLeft, ArrowRight, Upload, X, User } from
'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import { COUNTRIES } from '@/types/contact';

interface CreateNewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: LocalProject) => void;
  companyId: string;
  useProduction?: boolean;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

// Step labels are now dynamic via t()

const LANGUAGES_LIST = [
{ value: 'NL', label: 'Nederlands' },
{ value: 'FR', label: 'Frans' },
{ value: 'EN', label: 'Engels' },
{ value: 'DE', label: 'Duits' }];


// VAT helpers
const normalizeVatNumber = (vat: string): string => vat.replace(/[\s.\-]/g, '').toUpperCase();
const isValidBelgianVat = (vat: string): boolean => /^BE[01]\d{9}$/.test(normalizeVatNumber(vat));

export const CreateNewProjectDialog = ({
  open, onOpenChange, onProjectCreated, companyId, useProduction = false
}: CreateNewProjectDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentUser, getSelectedCompany } = useMockAuth();
  const [step, setStep] = useState<WizardStep>(1);

  // Step 1 data
  const [formData, setFormData] = useState({
    naam: '', nummer: '', projectleiderId: ''
  });
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  // Step 2 - Company search
  const [companySearchMode, setCompanySearchMode] = useState<'search' | 'manual' | 'selected'>('search');
  const [companyNameSearch, setCompanyNameSearch] = useState('');
  const [vatInput, setVatInput] = useState('');
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lookupError, setLookupError] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedExistingCompany, setSelectedExistingCompany] = useState<any>(null);
  const [addressBookResults, setAddressBookResults] = useState<any[]>([]);
  const [showVatLookup, setShowVatLookup] = useState(false);
  const vatInputRef = useRef<HTMLInputElement>(null);

  // Step 3 - Company form
  const [companyFormData, setCompanyFormData] = useState({
    name: '', vatNumber: '', peppolId: '', kboNumber: '',
    street: '', number: '', postalCode: '', bus: '', city: '', country: 'Belgium',
    telephone: '', email: '', website: '', language: 'NL', poNummer: ''
  });
  const [companyCreated, setCompanyCreated] = useState(false);

  // Step 4 - Bouwheer
  const [bouwheerData, setBouwheerData] = useState({
    firstName: '', lastName: '', jobTitle: '', workEmail: '',
    gsm: '', phone: '', nationality: '', notes: ''
  });

  // Step 5 - Werflocatie
  const [werflocatieForm, setWerflocatieForm] = useState({
    street: '', number: '', postalCode: '', city: '', country: 'Belgium'
  });

  // Load employees
  const phases = useMemo(() => getAllProjectPhases(), []);
  const employees = useMemo(() => {
    if (!isCompanyDataSeeded()) seedCompanyData();
    return getEmployeesByCompany(companyId);
  }, [companyId]);

  const ownerEmployee = useMemo(() => {
    return employees.find((e) => e.email?.toLowerCase() === currentUser?.email?.toLowerCase());
  }, [employees, currentUser]);

  const selectableTeamMembers = useMemo(() => {
    return employees.filter((e) => e.id !== ownerEmployee?.id && e.id !== formData.projectleiderId);
  }, [employees, ownerEmployee, formData.projectleiderId]);

  const filteredEmployees = useMemo(() => {
    if (!managerSearch) return employees.slice(0, 10);
    const s = managerSearch.toLowerCase();
    return employees.filter((e) => e.name.toLowerCase().includes(s)).slice(0, 10);
  }, [employees, managerSearch]);

  const selectedManager = employees.find((e) => e.id === formData.projectleiderId);

  // Existing companies in address book
  const existingCompanies = useMemo(() => {
    return getAllContacts().filter((c) => c.contactType === 'company');
  }, [open]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setFormData({ naam: '', nummer: '', projectleiderId: '' });
      setSelectedTeamMembers([]);
      setCompanyNameSearch('');
      setVatInput('');
      setLookupState('idle');
      setLookupError('');
      setSelectedCompanyId(null);
      setSelectedExistingCompany(null);
      setAddressBookResults([]);
      setCompanySearchMode('search');
      setShowVatLookup(false);
      setCompanyCreated(false);
      setCompanyFormData({ name: '', vatNumber: '', peppolId: '', kboNumber: '', street: '', number: '', postalCode: '', bus: '', city: '', country: 'Belgium', telephone: '', email: '', website: '', language: 'NL', poNummer: '' });
      setBouwheerData({ firstName: '', lastName: '', jobTitle: '', workEmail: '', gsm: '', phone: '', nationality: '', notes: '' });
      setWerflocatieForm({ street: '', number: '', postalCode: '', city: '', country: 'Belgium' });
    }
  }, [open]);

  // ========================
  // STEP VALIDATION & NAV
  // ========================

  const validateStep1 = (): boolean => {
    if (!formData.naam.trim()) {toast({ title: t('createProject.error'), description: t('createProject.projectNameRequired'), variant: 'destructive' });return false;}
    if (!formData.nummer.trim()) {toast({ title: t('createProject.error'), description: t('createProject.projectNumberRequired'), variant: 'destructive' });return false;}
    const existing = getAllLocalProjects();
    if (existing.some((p) => p.projectNumber === formData.nummer)) {
      toast({ title: t('createProject.error'), description: t('createProject.projectNumberUnique'), variant: 'destructive' });return false;
    }
    return true;
  };

  // ========================
  // STEP 2: COMPANY NAME SEARCH + VAT LOOKUP
  // ========================

  // Live search address book by company name
  const filteredAddressBookCompanies = useMemo(() => {
    if (!companyNameSearch.trim() || companyNameSearch.length < 2) return [];
    const s = companyNameSearch.toLowerCase();
    return existingCompanies.filter((c) => {
      const name = (c.companyName || c.name || '').toLowerCase();
      const vat = (c.vatNumber || '').toLowerCase();
      return name.includes(s) || vat.includes(s);
    }).slice(0, 8);
  }, [companyNameSearch, existingCompanies]);

  const handleKBOLookup = async () => {
    if (!vatInput.trim()) return;
    setLookupState('loading');
    setLookupError('');
    try {
      const { data, error } = await supabase.functions.invoke('vat-lookup', { body: { vatNumber: normalizeVatNumber(vatInput) } });
      if (error || !data?.success) {
        setLookupState('error');
        setLookupError(data?.error || t('createProject.noCompanyFound').replace('"{search}"', ''));
        return;
      }
      const cd = data.data;
      setCompanyFormData((prev) => ({
        ...prev,
        name: cd.companyName || '', vatNumber: normalizeVatNumber(vatInput),
        peppolId: cd.peppolId || '', kboNumber: cd.kboNumber || '',
        street: cd.street || '', number: cd.number || '',
        postalCode: cd.postalCode || '', city: cd.city || '',
        country: cd.country || 'Belgium'
      }));
      setLookupState('success');
      toast({ title: t('createProject.found'), description: t('createProject.companyDetailsFetched') });
      setCompanySearchMode('manual');
      setStep(3);
    } catch {
      setLookupState('error');
      setLookupError(t('createProject.error'));
    }
  };

  const handleSelectExistingCompany = (contact: any) => {
    setSelectedExistingCompany(contact);
    setSelectedCompanyId(contact.id);
    setCompanyFormData((prev) => ({
      ...prev,
      name: contact.companyName || contact.name || '',
      vatNumber: contact.vatNumber || '',
      street: contact.street || '',
      number: contact.number || '',
      postalCode: contact.postalCode || '',
      city: contact.city || '',
      country: contact.country || 'Belgium'
    }));
    setCompanySearchMode('selected');
    setCompanyCreated(true);
    toast({ title: t('createProject.selected'), description: t('createProject.selectedFromAddressBook').replace('{name}', contact.companyName || contact.name) });
  };

  const handleStep2SkipToManual = () => {
    if (companyNameSearch.trim()) {
      setCompanyFormData((prev) => ({ ...prev, name: companyNameSearch.trim() }));
    }
    setCompanySearchMode('manual');
    setStep(3);
  };

  const handleStep2Next = () => {
    if (companySearchMode === 'selected' && selectedCompanyId) {
      setStep(4);
    } else {
      setStep(3);
    }
  };

  // ========================
  // STEP 3: CREATE COMPANY
  // ========================

  const handleStep3Next = () => {
    if (!companyFormData.name.trim()) {
      toast({ title: t('createProject.error'), description: t('createProject.companyNameRequired'), variant: 'destructive' });return;
    }

    if (companyFormData.vatNumber) {
      const normalized = normalizeVatNumber(companyFormData.vatNumber);
      const existing = existingCompanies.find((c) => c.vatNumber && normalizeVatNumber(c.vatNumber) === normalized);
      if (existing) {
        setSelectedCompanyId(existing.id);
        setCompanyCreated(true);
        toast({ title: t('createProject.found'), description: t('createProject.companyExists') });
        setStep(4);
        return;
      }
    }

    const newCompany = createContact({
      hoofdtypeId: 'default_opdrachtgever_bouwheer',
      subtypeId: 'default_opdrachtgever_bouwheer',
      name: companyFormData.name,
      contactType: 'company',
      companyName: companyFormData.name,
      vatNumber: companyFormData.vatNumber,
      street: companyFormData.street, number: companyFormData.number,
      postalCode: companyFormData.postalCode, city: companyFormData.city,
      country: companyFormData.country,
      phone: companyFormData.telephone, gsm: '', email: companyFormData.email,
      status: 'Active'
    });
    setSelectedCompanyId(newCompany.id);
    setCompanyCreated(true);
    toast({ title: t('createProject.companyCreatedMsg'), description: t('createProject.addedToAddressBook').replace('{name}', companyFormData.name) });
    setStep(4);
  };

  // ========================
  // STEP 4: BOUWHEER
  // ========================

  const handleStep4Next = () => {
    if (!bouwheerData.firstName.trim() || !bouwheerData.lastName.trim()) {
      toast({ title: t('createProject.error'), description: t('createProject.firstLastRequired'), variant: 'destructive' });return;
    }
    if (!bouwheerData.workEmail.trim()) {
      toast({ title: t('createProject.error'), description: t('createProject.emailRequired'), variant: 'destructive' });return;
    }
    setStep(5);
  };

  // ========================
  // STEP 5: CREATE PROJECT
  // ========================

  const handleSubmit = async () => {
    if (!werflocatieForm.street.trim() || !werflocatieForm.postalCode.trim() || !werflocatieForm.city.trim()) {
      toast({ title: t('createProject.error'), description: t('createProject.fillSiteAddress'), variant: 'destructive' });return;
    }

    setLoading(true);
    try {
      const phaseHours: PhaseHours[] = phases.map((p) => ({
        phaseId: p.id, phaseName: p.name, abbreviation: p.abbreviation,
        color: p.color, currentHours: 0, maxHours: p.type === 'percentage' ? p.value * 3 : p.value || 30
      }));

      const werfAddress = `${werflocatieForm.street} ${werflocatieForm.number}, ${werflocatieForm.postalCode} ${werflocatieForm.city}`;

      const project = createLocalProject({
        name: formData.naam, code: '', projectNumber: formData.nummer,
        status: 'Open', statusId: '',
        managerId: formData.projectleiderId || ownerEmployee?.id || '',
        managerName: selectedManager?.name || ownerEmployee?.name || '',
        managerRole: selectedManager?.jobTitle || 'Projectleider',
        projectType: '', projectTypeId: '', phaseId: '', phaseName: '',
        mission: '', description: '', location: werfAddress,
        photoUrl: null, scheduleId: '', scheduleName: '', companyId, phaseHours
      });

      const selectedCompany = getSelectedCompany();
      const companyName = selectedCompany?.name || currentUser?.company || 'Team';

      if (ownerEmployee) {
        addProjectContact({
          projectId: project.id, contactId: ownerEmployee.id, contactName: ownerEmployee.name,
          contactType: 'team', company: companyName,
          phone: ownerEmployee.phone || '', gsm: '', email: ownerEmployee.email || '',
          firstName: ownerEmployee.name.split(' ')[0], lastName: ownerEmployee.name.split(' ').slice(1).join(' '),
          function: ownerEmployee.jobTitle || 'Owner'
        });
      }

      if (selectedManager && selectedManager.id !== ownerEmployee?.id) {
        addProjectContact({
          projectId: project.id, contactId: selectedManager.id, contactName: selectedManager.name,
          contactType: 'team', company: companyName,
          phone: selectedManager.phone || '', gsm: '', email: selectedManager.email || '',
          firstName: selectedManager.name.split(' ')[0], lastName: selectedManager.name.split(' ').slice(1).join(' '),
          function: selectedManager.jobTitle || 'Projectleider'
        });
      }

      for (const memberId of selectedTeamMembers) {
        const member = employees.find((e) => e.id === memberId);
        if (member) {
          addProjectContact({
            projectId: project.id, contactId: member.id, contactName: member.name,
            contactType: 'team', company: companyName,
            phone: member.phone || '', gsm: '', email: member.email || '',
            firstName: member.name.split(' ')[0], lastName: member.name.split(' ').slice(1).join(' '),
            function: member.jobTitle || 'Team Member'
          });
        }
      }

      if (selectedCompanyId) {
        const comp = getAllContacts().find((c) => c.id === selectedCompanyId);
        if (comp) {
          addProjectContact({
            projectId: project.id, contactId: comp.id, contactName: comp.name,
            contactType: 'client', company: comp.name,
            phone: comp.phone || '', gsm: '', email: comp.email || '',
            firstName: comp.name, lastName: '',
            function: 'Opdrachtgeverbedrijf', vatNumber: comp.vatNumber
          });
        }
      }

      if (bouwheerData.firstName.trim()) {
        const fullName = `${bouwheerData.firstName} ${bouwheerData.lastName}`;
        const bouwheerContact = createContact({
          hoofdtypeId: 'default_opdrachtgever_bouwheer', subtypeId: 'default_opdrachtgever_bouwheer',
          name: fullName, contactType: 'individual',
          companyName: companyFormData.name, linkedCompanyId: selectedCompanyId || undefined,
          vatNumber: '', street: '', number: '',
          postalCode: '', city: '',
          country: 'Belgium', phone: bouwheerData.phone,
          gsm: bouwheerData.gsm, email: bouwheerData.workEmail, status: 'Active'
        });
        addProjectContact({
          projectId: project.id, contactId: bouwheerContact.id, contactName: fullName,
          contactType: 'client', company: companyFormData.name,
          phone: bouwheerData.phone, gsm: bouwheerData.gsm, email: bouwheerData.workEmail,
          firstName: bouwheerData.firstName, lastName: bouwheerData.lastName,
          function: 'Bouwheer'
        });
      }

      toast({ title: t('createProject.projectCreated'), description: t('createProject.projectCreatedDesc').replace('{name}', project.name) });
      onProjectCreated(project);
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: t('createProject.error'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTeamMember = (id: string) => {
    setSelectedTeamMembers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleBack = () => {
    if (step === 1) {onOpenChange(false);return;}
    if (step === 4 && companySearchMode === 'selected') {setStep(2);return;}
    if (step === 3 && companySearchMode === 'selected') {setStep(2);return;}
    setStep((prev) => prev - 1 as WizardStep);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header with Progress */}
        <div className="px-6 pt-5 pb-4 border-b bg-background shrink-0">
          <h2 className="text-lg font-semibold">{t('createProject.title')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('createProject.subtitle')}
          </p>
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-5">
            {[t('createProject.stepProjectDetails'), t('createProject.stepClient'), t('createProject.stepCompanyDetails'), t('createProject.stepBouwheer'), t('createProject.stepSiteLocation')].map((label, i) =>
            <Fragment key={i}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-200',
                  step > i + 1 ? 'bg-primary text-primary-foreground' :
                  step === i + 1 ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background' :
                  'bg-muted text-muted-foreground'
                )}>
                    {step > i + 1 ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className={cn(
                  'text-[10px] font-medium hidden lg:block whitespace-nowrap transition-colors',
                  step === i + 1 ? 'text-foreground' : 'text-muted-foreground'
                )}>
                    {label}
                  </span>
                </div>
                {i < 4 && <div className={cn('w-6 h-px transition-colors', step > i + 1 ? 'bg-primary' : 'bg-border')} />}
              </Fragment>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-5">

            {/* ============ STEP 1: PROJECTGEGEVENS ============ */}
            {step === 1 && <>
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createProject.projectDetails')}</h4>
                <div className="space-y-2">
                  <Label className="text-xs">{t('createProject.projectName')}</Label>
                  <Input value={formData.naam} onChange={(e) => setFormData({ ...formData, naam: e.target.value })} placeholder={t('createProject.projectNamePlaceholder')} />
                  <p className="text-[11px] text-muted-foreground">{t('createProject.projectNameFormat')}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('createProject.projectNumber')}</Label>
                  <Input value={formData.nummer} onChange={(e) => setFormData({ ...formData, nummer: e.target.value })} placeholder={t('createProject.projectNumberPlaceholder')} />
                </div>
              </section>

              {/* Project Leader */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createProject.teamAssignment')}</h4>
                <div className="space-y-2">
                  <Label className="text-xs">{t('createProject.projectLeader')}</Label>
                  <Popover open={managerOpen} onOpenChange={setManagerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between font-normal">
                        {selectedManager ? <span>{selectedManager.name} ({selectedManager.jobTitle})</span> : <span className="text-muted-foreground">{t('createProject.select')}</span>}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-popover" align="start">
                      <Command>
                        <CommandInput placeholder={t('createProject.search')} value={managerSearch} onValueChange={setManagerSearch} />
                        <CommandList>
                          <CommandEmpty>{t('createProject.noEmployeesFound')}</CommandEmpty>
                          <CommandGroup>
                            {filteredEmployees.map((e) =>
                            <CommandItem key={e.id} value={e.id} onSelect={() => {setFormData({ ...formData, projectleiderId: e.id });setManagerOpen(false);}}>
                                <Check className={cn("mr-2 h-4 w-4", formData.projectleiderId === e.id ? "opacity-100" : "opacity-0")} />
                                <div><div>{e.name}</div>{e.jobTitle && <div className="text-xs text-muted-foreground">{e.jobTitle}</div>}</div>
                              </CommandItem>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-[11px] text-muted-foreground">
                    {t('createProject.leaderAppears')}
                  </p>
                </div>

                {/* Additional Team Members */}
                {selectableTeamMembers.length > 0 &&
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      
                      <Label className="text-xs">{t('createProject.assignTeamMembers')}</Label>
                    </div>
                    <ScrollArea className="h-32 border rounded-lg p-2">
                      <div className="space-y-1">
                        {selectableTeamMembers.map((m) =>
                      <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => toggleTeamMember(m.id)}>
                            <Checkbox checked={selectedTeamMembers.includes(m.id)} onCheckedChange={() => toggleTeamMember(m.id)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{m.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{m.jobTitle}</p>
                            </div>
                          </div>
                      )}
                      </div>
                    </ScrollArea>
                  </div>
                }
              </section>
            </>}

            {/* ============ STEP 2: OPDRACHTGEVERBEDRIJF ZOEKEN ============ */}
            {step === 2 && companySearchMode === 'search' && <>
              <div className="text-center space-y-1.5 mb-1">
                <h3 className="text-base font-semibold">{t('createProject.assignClientCompany')}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto text-balance">
                  {t('createProject.searchClientDesc')}
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">{t('createProject.searchCompanyName')}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="(bedrijfsnaam)"
                      value={companyNameSearch}
                      onChange={(e) => setCompanyNameSearch(e.target.value)}
                      className="pl-10" />

                  </div>
                </div>

                {/* Live address book results */}
                {filteredAddressBookCompanies.length > 0 &&
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{t('createProject.foundInAddressBook').replace('{count}', String(filteredAddressBookCompanies.length))}</span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {filteredAddressBookCompanies.map((c) =>
                    <button
                      key={c.id}
                      onClick={() => handleSelectExistingCompany(c)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-all hover:border-primary/50 hover:bg-primary/5',
                        selectedExistingCompany?.id === c.id && 'border-primary bg-primary/5'
                      )}>
                          <p className="text-sm font-medium">{c.companyName || c.name}</p>
                          <p className="text-[11px] text-muted-foreground">{c.vatNumber ? `${c.vatNumber} · ` : ''}{c.city || ''}</p>
                        </button>
                    )}
                    </div>
                  </div>
                }

                {companyNameSearch.length >= 2 && filteredAddressBookCompanies.length === 0 &&
                <div className="text-center py-3 text-sm text-muted-foreground">
                    <p>{t('createProject.noCompanyFound').replace('"{search}"', `"${companyNameSearch}"`)}</p>
                  </div>
                }

                {/* VAT/KBO lookup section */}
                <div className="pt-3 border-t space-y-3">
                  {!showVatLookup ?
                  <div className="flex flex-col gap-2">
                      <Button variant="outline" onClick={() => setShowVatLookup(true)} className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        {t('createProject.lookupViaVat')}
                      </Button>
                      <Button variant="ghost" onClick={handleStep2SkipToManual} className="w-full accent-value">
                        {t('createProject.createManually')}
                      </Button>
                    </div> :

                  <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">{t('createProject.vatNumber')}</Label>
                        <Input
                        ref={vatInputRef}
                        placeholder={t('createProject.vatPlaceholder')}
                        value={vatInput}
                        onChange={(e) => {setVatInput(e.target.value);setLookupError('');setLookupState('idle');}}
                        onKeyDown={(e) => e.key === 'Enter' && handleKBOLookup()} />

                      </div>

                      {lookupError &&
                    <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{lookupError}</span>
                        </div>
                    }

                      <Button onClick={handleKBOLookup} disabled={lookupState === 'loading' || !vatInput.trim()} className="w-full">
                        {lookupState === 'loading' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('createProject.searchingKBO')}</> : <><Search className="h-4 w-4 mr-2" />{t('createProject.lookupKBO')}</>}
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => setShowVatLookup(false)} className="w-full text-xs text-muted-foreground">
                        {t('createProject.backToNameSearch')}
                      </Button>
                    </div>
                  }
                </div>
              </div>
            </>}

            {/* Step 2 - company selected from address book */}
            {step === 2 && companySearchMode === 'selected' && selectedExistingCompany && <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">{t('createProject.clientCompanySelected')}</p>
                  <p className="text-[11px] text-green-600 dark:text-green-500">{selectedExistingCompany.companyName || selectedExistingCompany.name} - {selectedExistingCompany.vatNumber}</p>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                   <span className="text-muted-foreground">{t('createProject.companyNameLabel')}</span>
                  <span className="font-medium">{selectedExistingCompany.companyName || selectedExistingCompany.name}</span>
                  <span className="text-muted-foreground">{t('createProject.vatNumberLabel')}</span>
                  <span className="font-medium">{selectedExistingCompany.vatNumber}</span>
                  {selectedExistingCompany.city && <>
                    <span className="text-muted-foreground">{t('createProject.cityLabel')}</span>
                    <span className="font-medium">{selectedExistingCompany.city}</span>
                  </>}
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => {setCompanySearchMode('search');setSelectedExistingCompany(null);setSelectedCompanyId(null);setCompanyCreated(false);}} className="text-xs text-muted-foreground">
                {t('createProject.chooseOther')}
              </Button>
            </>}

            {/* ============ STEP 3: BEDRIJFSGEGEVENS FORMULIER ============ */}
            {step === 3 && <>
              {lookupState === 'success' && companyFormData.name &&
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">{t('createProject.companyDetails')}</p>
                </div>
              }

              {/* Contact Type - fixed to Opdrachtgever */}
              <section className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createProject.contactType')}</h4>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30">
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">{t('createProject.stepClient')}</Badge>
                  <span className="text-[11px] text-muted-foreground">{t('createProject.autoSetClient')}</span>
                </div>
              </section>

              {/* Bedrijfsgegevens */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createProject.companyDetails')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">{t('createProject.projectName').replace(' *', '')} *</Label><Input value={companyFormData.name} onChange={(e) => setCompanyFormData((p) => ({ ...p, name: e.target.value }))} placeholder={t('createProject.companyNamePlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createProject.vatNumber')} *</Label><Input value={companyFormData.vatNumber} onChange={(e) => setCompanyFormData((p) => ({ ...p, vatNumber: e.target.value }))} placeholder={t('createProject.vatPlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Peppol ID</Label><Input value={companyFormData.peppolId} onChange={(e) => setCompanyFormData((p) => ({ ...p, peppolId: e.target.value }))} placeholder="(peppol-id)" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">KBO</Label><Input value={companyFormData.kboNumber} onChange={(e) => setCompanyFormData((p) => ({ ...p, kboNumber: e.target.value }))} placeholder="(kbo)" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">PO</Label><Input value={companyFormData.poNummer || ''} onChange={(e) => setCompanyFormData((p) => ({ ...p, poNummer: e.target.value }))} placeholder="(po)" /></div>
                </div>
              </section>

              {/* Address */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createProject.addressSection')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.street')}</Label><Input value={companyFormData.street} onChange={(e) => setCompanyFormData((p) => ({ ...p, street: e.target.value }))} placeholder={t('createClientCompany.streetPlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.houseNumber')}</Label><Input value={companyFormData.number} onChange={(e) => setCompanyFormData((p) => ({ ...p, number: e.target.value }))} placeholder={t('createClientCompany.houseNumberPlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.postalCode')}</Label><Input value={companyFormData.postalCode} onChange={(e) => setCompanyFormData((p) => ({ ...p, postalCode: e.target.value }))} placeholder={t('createClientCompany.postalCodePlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.bus')}</Label><Input value={companyFormData.bus} onChange={(e) => setCompanyFormData((p) => ({ ...p, bus: e.target.value }))} placeholder={t('createClientCompany.busPlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.city')}</Label><Input value={companyFormData.city} onChange={(e) => setCompanyFormData((p) => ({ ...p, city: e.target.value }))} placeholder={t('createClientCompany.cityPlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.country')}</Label>
                    <Select value={companyFormData.country} onValueChange={(v) => setCompanyFormData((p) => ({ ...p, country: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Contact details */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createProject.contactDetailsSection')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.phone')}</Label><Input value={companyFormData.telephone} onChange={(e) => setCompanyFormData((p) => ({ ...p, telephone: e.target.value }))} placeholder={t('createClientCompany.phonePlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.emailLabel')}</Label><Input type="email" value={companyFormData.email} onChange={(e) => setCompanyFormData((p) => ({ ...p, email: e.target.value }))} placeholder={t('createClientCompany.emailPlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.websiteLabel')}</Label><Input value={companyFormData.website} onChange={(e) => setCompanyFormData((p) => ({ ...p, website: e.target.value }))} placeholder={t('createClientCompany.websitePlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createProject.preferredLang')}</Label>
                    <Select value={companyFormData.language} onValueChange={(v) => setCompanyFormData((p) => ({ ...p, language: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{LANGUAGES_LIST.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            </>}

            {/* ============ STEP 4: BOUWHEER ============ */}
            {step === 4 && <>
              <div className="text-center space-y-1 mb-1">
                <h3 className="font-semibold text-base">{t('createProject.addBouwheer')}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto text-balance">
                  {t('createProject.bouwheerDesc')}
                  {companyFormData.name && <span className="font-medium"> {t('createProject.linkedTo').replace('{company}', companyFormData.name)}</span>}
                </p>
              </div>

              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createProject.identitySection')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">{t('addPerson.firstName')}</Label><Input value={bouwheerData.firstName} onChange={(e) => setBouwheerData((p) => ({ ...p, firstName: e.target.value }))} placeholder={t('addPerson.firstNamePlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('addPerson.lastName')}</Label><Input value={bouwheerData.lastName} onChange={(e) => setBouwheerData((p) => ({ ...p, lastName: e.target.value }))} placeholder={t('addPerson.lastNamePlaceholder')} /></div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createProject.contactTypeLabel')}</Label>
                    <div className="flex items-center gap-2 h-10 px-3 rounded-lg border bg-muted/30">
                      <span className="text-sm font-medium">{t('createProject.bouwheerLabel')}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createProject.workContact')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">{t('createProject.workEmail')}</Label><Input type="email" value={bouwheerData.workEmail} onChange={(e) => setBouwheerData((p) => ({ ...p, workEmail: e.target.value }))} placeholder={t('addPerson.emailPlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('addPerson.gsm')}</Label><Input value={bouwheerData.gsm} onChange={(e) => setBouwheerData((p) => ({ ...p, gsm: e.target.value }))} placeholder={t('addPerson.gsmPlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('addPerson.phone')}</Label><Input value={bouwheerData.phone} onChange={(e) => setBouwheerData((p) => ({ ...p, phone: e.target.value }))} placeholder={t('addPerson.phonePlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('addPerson.nationality')}</Label>
                    <Select value={bouwheerData.nationality} onValueChange={(v) => setBouwheerData((p) => ({ ...p, nationality: v }))}>
                      <SelectTrigger><SelectValue placeholder={t('addPerson.select')} /></SelectTrigger>
                      <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createProject.notesSection')}</h4>
                <Textarea
                  value={bouwheerData.notes}
                  onChange={(e) => setBouwheerData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder={t('createProject.notesPlaceholder')}
                  rows={2} />
              </section>
            </>}

            {/* ============ STEP 5: WERFLOCATIE ============ */}
            {step === 5 && <>
              <div className="text-center space-y-1.5 mb-1">
                <h3 className="text-base font-semibold">{t('createProject.siteLocation')}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto text-balance">{t('createProject.siteLocationDesc')}</p>
              </div>

              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createProject.addressSection')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.street')}</Label><Input value={werflocatieForm.street} onChange={(e) => setWerflocatieForm((p) => ({ ...p, street: e.target.value }))} placeholder={t('createClientCompany.streetPlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.houseNumber')}</Label><Input value={werflocatieForm.number} onChange={(e) => setWerflocatieForm((p) => ({ ...p, number: e.target.value }))} placeholder={t('createClientCompany.houseNumberPlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.postalCode')}</Label><Input value={werflocatieForm.postalCode} onChange={(e) => setWerflocatieForm((p) => ({ ...p, postalCode: e.target.value }))} placeholder={t('createClientCompany.postalCodePlaceholder')} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('createClientCompany.city')}</Label><Input value={werflocatieForm.city} onChange={(e) => setWerflocatieForm((p) => ({ ...p, city: e.target.value }))} placeholder={t('createClientCompany.cityPlaceholder')} /></div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-xs">{t('createClientCompany.country')}</Label>
                    <Select value={werflocatieForm.country} onValueChange={(v) => setWerflocatieForm((p) => ({ ...p, country: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            </>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-background shrink-0">
          <Button variant="outline" onClick={handleBack} size="sm">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            {step === 1 ? t('addPerson.cancel') : t('createProject.previous')}
          </Button>

          <div className="flex gap-2">
            {step === 1 &&
            <Button onClick={() => {if (validateStep1()) setStep(2);}} size="sm">
                {t('createProject.next')}<ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            }
            {step === 2 && companySearchMode === 'selected' &&
            <Button onClick={handleStep2Next} size="sm">
                {t('createProject.next')}<ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            }
            {step === 3 &&
            <Button onClick={handleStep3Next} size="sm">
                {t('createProject.next')}<ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            }
            {step === 4 &&
            <Button onClick={handleStep4Next} size="sm">
                {t('createProject.next')}<ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            }
            {step === 5 &&
            <Button onClick={handleSubmit} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
                {t('createProject.createProjectBtn')}
              </Button>
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>);

};