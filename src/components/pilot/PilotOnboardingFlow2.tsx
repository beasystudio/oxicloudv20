/**
 * Create Project Wizard — Pilot Mode
 * 5-step flow:
 *   Step 1: Projectgegevens (naam, nummer, projectleider)
 *   Step 2: Opdrachtgeverbedrijf (zoeken in adresboek / KBO opzoeken / handmatig)
 *   Step 3: Bedrijfsgegevens invullen (company detail form)
 *   Step 4: Bouwheer aanmaken (person linked to client company)
 *   Step 5: Werflocatie (construction site address)
 */

import { useState, useMemo, useRef, useEffect, Fragment } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Check, ArrowLeft, ArrowRight, Search, Loader2, AlertCircle, CheckCircle2,
  User, Upload, X } from
'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPilotUser, getPilotCompany, getPilotEmployees, getPilotContacts,
  addPilotProject, addPilotContact, findPilotContactByVat, completeOnboardingFlow,
  PilotContact } from
'@/lib/pilotSessionStore';
import { lookupVATNumber, formatVATNumber } from '@/lib/vatLookupService';
import { getPilotTaxonomy } from '@/lib/mockContactDB';
import { COUNTRIES } from '@/types/user';

interface Props {
  onComplete: () => void;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS = [
'Projectgegevens',
'Opdrachtgever',
'Bedrijfsgegevens',
'Bouwheer',
'Werflocatie'];


const LANGUAGES_LIST = [
{ value: 'NL', label: 'Nederlands' },
{ value: 'FR', label: 'Frans' },
{ value: 'EN', label: 'Engels' },
{ value: 'DE', label: 'Duits' }];


export function PilotOnboardingFlow2({ onComplete, onClose }: Props) {
  const user = getPilotUser();
  const company = getPilotCompany();
  const allEmployees = getPilotEmployees();
  const allContacts = getPilotContacts();

  // Filter real employees, EXCLUDE the owner (current user) and metadata records
  const selectableEmployees = useMemo(() => {
    return allEmployees.filter((e) => {
      if (e.id === 'owner-function') return false;
      // Exclude the owner by matching email
      if (user && e.email?.toLowerCase() === user.email?.toLowerCase()) return false;
      return true;
    });
  }, [allEmployees, user]);

  // Check if there are employees other than the owner
  const hasOtherEmployees = selectableEmployees.length > 0;

  const [currentStep, setCurrentStep] = useState<Step>(1);

  // --- Step 1: Project info ---
  const [projectData, setProjectData] = useState({
    name: '',
    projectNumber: '',
    projectLeaderId: '' // empty means owner is auto-assigned
  });

  // --- Step 2: Client company search ---
  const [companySearchMode, setCompanySearchMode] = useState<'search' | 'manual' | 'selected'>('search');
  const [vatInput, setVatInput] = useState('');
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lookupError, setLookupError] = useState('');
  const [selectedExistingCompany, setSelectedExistingCompany] = useState<PilotContact | null>(null);
  const vatInputRef = useRef<HTMLInputElement>(null);

  // --- Step 3: Company form data ---
  const [companyForm, setCompanyForm] = useState({
    name: '', vatNumber: '', legalForm: '',
    peppolId: '', kboNumber: '',
    street: '', number: '', postalCode: '', bus: '', city: '', country: 'Belgium',
    telephone: '', email: '', website: '', language: 'NL'
  });
  const [clientContactId, setClientContactId] = useState<string | null>(null);

  // --- Step 4: Bouwheer person form ---
  const [bouwheerForm, setBouwheerForm] = useState({
    firstName: '', lastName: '', functie: '',
    email: '', gsm: '', phone: '', nationality: '',
    street: '', number: '', bus: '', postalCode: '', city: '', country: 'Belgium',
    notes: ''
  });

  // --- Step 5: Werflocatie ---
  const [werflocatieForm, setWerflocatieForm] = useState({
    street: '',
    number: '',
    postalCode: '',
    city: '',
    country: 'Belgium'
  });

  // Existing client companies from address book
  const existingClientCompanies = useMemo(() => {
    return allContacts.filter((c) =>
    c.type === 'company' &&
    c.contactType &&
    c.contactType.toLowerCase() !== 'consultant'
    );
  }, [allContacts]);

  // Address book search results
  const [addressBookResults, setAddressBookResults] = useState<PilotContact[]>([]);

  // ========================
  // STEP NAVIGATION
  // ========================

  const scrollToTop = () => {
    document.querySelector('[data-wizard-scroll]')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => {
    if (currentStep < 5) { setCurrentStep(currentStep + 1 as Step); scrollToTop(); }
  };
  const goBack = () => {
    if (currentStep > 1) { setCurrentStep(currentStep - 1 as Step); scrollToTop(); }
  };

  // ========================
  // STEP 1 VALIDATION
  // ========================

  const handleStep1Next = () => {
    if (!projectData.name.trim()) {
      toast.error('Projectnaam is verplicht');
      return;
    }
    if (!projectData.projectNumber.trim()) {
      toast.error('Projectnummer is verplicht');
      return;
    }
    goNext();
  };

  // ========================
  // STEP 2: VAT SEARCH LOGIC
  // ========================

  const handleAddressBookSearch = () => {
    if (!vatInput.trim()) return;
    const cleaned = vatInput.replace(/[\s.\-]/g, '').toUpperCase();

    const found = allContacts.filter((c) =>
    c.type === 'company' &&
    c.vatNumber &&
    c.vatNumber.replace(/[\s.\-]/g, '').toUpperCase().includes(cleaned)
    );

    setAddressBookResults(found);

    if (found.length > 0) {
      setLookupState('success');
    } else {
      handleKBOLookup();
    }
  };

  const handleKBOLookup = async () => {
    setLookupState('loading');
    setLookupError('');

    const result = await lookupVATNumber(vatInput, true);
    if (result.success && result.data) {
      const d = result.data;
      setCompanyForm((prev) => ({
        ...prev,
        name: d.companyName,
        vatNumber: d.vatNumber,
        legalForm: d.legalForm,
        kboNumber: d.kboNumber,
        peppolId: d.peppolId,
        street: d.street,
        number: d.number,
        postalCode: d.postalCode,
        city: d.city,
        country: d.country || 'Belgium'
      }));
      setLookupState('success');
      toast.success('Bedrijfsgegevens opgehaald uit het KBO-register');
      setCompanySearchMode('manual');
      setCurrentStep(3);
      scrollToTop();
    } else {
      setLookupState('error');
      setLookupError(result.error || 'Bedrijf niet gevonden');
    }
  };

  const handleSelectExistingCompany = (contact: PilotContact) => {
    setSelectedExistingCompany(contact);
    setClientContactId(contact.id);
    setCompanyForm((prev) => ({
      ...prev,
      name: contact.companyName || '',
      vatNumber: contact.vatNumber || '',
      street: contact.street || '',
      number: contact.number || '',
      postalCode: contact.postalCode || '',
      city: contact.city || 'Belgium',
      country: contact.country || 'Belgium',
      peppolId: contact.peppolId || '',
      legalForm: contact.legalForm || ''
    }));
    setCompanySearchMode('selected');
    toast.success(`${contact.companyName} geselecteerd uit het adresboek`);
  };

  const handleStep2SkipToManual = () => {
    setCompanySearchMode('manual');
    setCurrentStep(3);
    scrollToTop();
  };

  const handleStep2Next = () => {
    if (companySearchMode === 'selected' && clientContactId) {
      // Skip step 3, go directly to bouwheer
      setCurrentStep(4);
      scrollToTop();
    } else {
      setCurrentStep(3);
      scrollToTop();
    }
  };

  // ========================
  // STEP 3: CREATE COMPANY
  // ========================

  const handleStep3Next = () => {
    if (!companyForm.name.trim()) {
      toast.error('Bedrijfsnaam is verplicht');
      return;
    }
    if (!companyForm.vatNumber.trim()) {
      toast.error('BTW-nummer is verplicht');
      return;
    }

    const existingByVat = findPilotContactByVat(
      companyForm.vatNumber.replace(/[\s.\-]/g, '').toUpperCase()
    );

    if (existingByVat) {
      setClientContactId(existingByVat.id);
      toast.info('Dit bedrijf bestaat reeds in uw adresboek. De bestaande contactgegevens worden gebruikt.');
    } else {
      const newContact = addPilotContact({
        type: 'company',
        companyName: companyForm.name,
        vatNumber: companyForm.vatNumber,
        contactType: 'Opdrachtgever',
        street: companyForm.street,
        number: companyForm.number,
        postalCode: companyForm.postalCode,
        city: companyForm.city,
        country: companyForm.country,
        peppolId: companyForm.peppolId,
        legalForm: companyForm.legalForm,
        email: companyForm.email,
        phone: companyForm.telephone
      });
      setClientContactId(newContact.id);
      toast.success(`${companyForm.name} toegevoegd aan uw adresboek`);
    }

    setCurrentStep(4);
    scrollToTop();
  };

  // ========================
  // STEP 4: BOUWHEER -> next to Step 5
  // ========================

  const handleStep4Next = () => {
    if (!bouwheerForm.firstName.trim() || !bouwheerForm.lastName.trim()) {
      toast.error('Voornaam en achternaam van de bouwheer zijn verplicht');
      return;
    }
    if (!bouwheerForm.email.trim()) {
      toast.error('E-mailadres van de bouwheer is verplicht');
      return;
    }
    setCurrentStep(5);
    scrollToTop();
  };

  // ========================
  // STEP 5: CREATE PROJECT
  // ========================

  const handleCreateProject = () => {
    if (!werflocatieForm.street.trim() || !werflocatieForm.postalCode.trim() || !werflocatieForm.city.trim()) {
      toast.error('Vul minstens straat, postcode en gemeente in voor de werflocatie');
      return;
    }

    // Create bouwheer contact (person linked to client company)
    const bouwheer = addPilotContact({
      type: 'person',
      companyId: clientContactId || undefined,
      firstName: bouwheerForm.firstName,
      lastName: bouwheerForm.lastName,
      email: bouwheerForm.email,
      phone: bouwheerForm.phone,
      mobile: bouwheerForm.gsm,
      function: bouwheerForm.functie || 'Bouwheer',
      contactType: 'Bouwheer'
    });

    // Determine project leader — empty means the owner himself
    const leaderId = projectData.projectLeaderId || user?.id || '';

    // Create project
    addPilotProject({
      name: projectData.name,
      projectNumber: projectData.projectNumber,
      projectLeaderId: leaderId,
      clientCompanyId: clientContactId || undefined,
      bouwheerContactId: bouwheer.id,
      teamMemberIds: [],
      siteAddress: {
        street: werflocatieForm.street,
        number: werflocatieForm.number,
        postalCode: werflocatieForm.postalCode,
        city: werflocatieForm.city,
        country: werflocatieForm.country
      },
      projectGoal: undefined,
      constructionType: undefined
    });

    completeOnboardingFlow(2);
    toast.success('Projectdossier succesvol aangemaakt');
    onComplete();
  };

  // ========================
  // RENDER
  // ========================

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border-border/50">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-background shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">Nieuw project aanmaken</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Vul de projectgegevens in om een nieuw dossier aan te maken.
          </p>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-5">
            {STEP_LABELS.map((label, i) => (
              <Fragment key={i}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-200',
                    currentStep > i + 1 ? 'bg-primary text-primary-foreground' :
                    currentStep === i + 1 ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {currentStep > i + 1 ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium whitespace-nowrap',
                    currentStep === i + 1 ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {label}
                  </span>
                </div>
                {i < 4 && <div className={cn('w-6 h-px transition-colors', currentStep > i + 1 ? 'bg-primary' : 'bg-border')} />}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0" data-wizard-scroll>
          <div className="p-6 space-y-6">

            {/* ============ STEP 1: PROJECTGEGEVENS ============ */}
            {currentStep === 1 &&
            <>
                <div className="space-y-2">
                  <Label>Projectnaam *</Label>
                  <Input
                  value={projectData.name}
                  onChange={(e) => setProjectData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="(klantnaam + locatie)" />

                  <p className="text-xs text-muted-foreground">Formaat: Naam klant + Locatie</p>
                </div>

                <div className="space-y-2">
                  <Label>Projectnummer *</Label>
                  <Input
                  value={projectData.projectNumber}
                  onChange={(e) => setProjectData((p) => ({ ...p, projectNumber: e.target.value }))}
                  placeholder="(projectnummer)" />

                </div>

                {/* Project Leader */}
                <div className="space-y-2">
                  <Label>Projectleider *</Label>
                  {hasOtherEmployees ?
                <Select
                  value={projectData.projectLeaderId || '__owner__'}
                  onValueChange={(v) => setProjectData((p) => ({ ...p, projectLeaderId: v === '__owner__' ? '' : v }))}>

                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {selectableEmployees.map((emp) =>
                    <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} — {emp.function || emp.contactSubtype || 'Medewerker'}
                          </SelectItem>
                    )}
                      </SelectContent>
                    </Select> :

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">Automatisch toegewezen als projectleider</p>
                      </div>
                    </div>
                }
                  <p className="text-xs text-muted-foreground">
                    De projectleider verschijnt in de contactkaart van het projectdossier onder het filter "Team".
                  </p>
                </div>
              </>
            }

            {/* ============ STEP 2: OPDRACHTGEVERBEDRIJF ZOEKEN ============ */}
            {currentStep === 2 && companySearchMode === 'search' &&
            <>
                <div className="text-center space-y-2 mb-2">
                  


                  <h3 className="text-base font-semibold">Opdrachtgeverbedrijf toewijzen</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Zoek het bedrijf van de opdrachtgever op via BTW-nummer. We controleren eerst uw adresboek en zoeken daarna automatisch in het KBO-register.
                  </p>
                </div>

                <div className="max-w-sm mx-auto space-y-4">
                  <div className="space-y-2">
                    <Label>BTW-nummer *</Label>
                    <Input
                    ref={vatInputRef}
                    placeholder="BE 0123.456.789"
                    value={vatInput}
                    onChange={(e) => {
                      setVatInput(e.target.value);
                      setLookupError('');
                      setLookupState('idle');
                      setAddressBookResults([]);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddressBookSearch()}
                    className="text-center" />

                  </div>

                  {lookupError &&
                <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{lookupError}</span>
                    </div>
                }

                  <Button
                  onClick={handleAddressBookSearch}
                  disabled={lookupState === 'loading' || !vatInput.trim()}
                  className="w-full">

                    {lookupState === 'loading' ?
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Zoeken...</> :
                  <><Search className="h-4 w-4 mr-2" />Bedrijf opzoeken</>
                  }
                  </Button>

                  {/* Address book results */}
                  {addressBookResults.length > 0 &&
                <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Gevonden in uw adresboek</span>
                      </div>
                      {addressBookResults.map((c) =>
                  <button
                    key={c.id}
                    onClick={() => handleSelectExistingCompany(c)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all hover:border-primary/50 hover:bg-primary/5',
                      selectedExistingCompany?.id === c.id && 'border-primary bg-primary/5'
                    )}>

                          <p className="text-sm font-medium">{c.companyName}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.vatNumber} · {c.city || ''}
                          </p>
                        </button>
                  )}
                    </div>
                }

                  <div className="pt-4 border-t">
                    <Button variant="ghost" onClick={handleStep2SkipToManual} className="w-full text-primary">
                      Overslaan en handmatig invullen
                    </Button>
                  </div>
                </div>
              </>
            }

            {/* Step 2 — company selected from address book */}
            {currentStep === 2 && companySearchMode === 'selected' && selectedExistingCompany &&
            <>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Opdrachtgeverbedrijf geselecteerd
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      {selectedExistingCompany.companyName} — {selectedExistingCompany.vatNumber}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                    <span className="text-muted-foreground">Bedrijfsnaam</span>
                    <span className="font-medium">{selectedExistingCompany.companyName}</span>
                    <span className="text-muted-foreground">BTW-nummer</span>
                    <span className="font-medium">{selectedExistingCompany.vatNumber}</span>
                    {selectedExistingCompany.city &&
                  <>
                        <span className="text-muted-foreground">Gemeente</span>
                        <span className="font-medium">{selectedExistingCompany.city}</span>
                      </>
                  }
                  </div>
                </div>

                <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCompanySearchMode('search');
                  setSelectedExistingCompany(null);
                  setClientContactId(null);
                }}
                className="text-xs text-muted-foreground">

                  ← Ander bedrijf kiezen
                </Button>
              </>
            }

            {/* ============ STEP 3: BEDRIJFSGEGEVENS FORMULIER ============ */}
            {currentStep === 3 &&
            <>
                {lookupState === 'success' && companyForm.name &&
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Bedrijfsgegevens opgehaald. Controleer en vul de resterende velden aan.
                    </p>
                  </div>
              }

                {/* Contact Type — fixed to Opdrachtgever */}
                <section className="space-y-3">
                  <h4 className="text-sm font-semibold">Contacttype</h4>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30">
                    <Badge variant="outline" className="text-xs">Opdrachtgever</Badge>
                    <span className="text-xs text-muted-foreground">— Automatisch ingesteld voor projectdossiers</span>
                  </div>
                </section>

                {/* Bedrijfsgegevens */}
                <section className="space-y-4">
                  <h4 className="text-sm font-semibold">Bedrijfsgegevens</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Bedrijfsnaam *</Label>
                      <Input value={companyForm.name} onChange={(e) => setCompanyForm((p) => ({ ...p, name: e.target.value }))} placeholder="Bedrijfsnaam" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">BTW-nummer *</Label>
                      <Input value={companyForm.vatNumber} onChange={(e) => setCompanyForm((p) => ({ ...p, vatNumber: e.target.value }))} placeholder="BE 0123.456.789" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Peppol ID</Label>
                      <Input value={companyForm.peppolId} onChange={(e) => setCompanyForm((p) => ({ ...p, peppolId: e.target.value }))} placeholder="0208:BE0123456789" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">KBO-nummer</Label>
                      <Input value={companyForm.kboNumber} onChange={(e) => setCompanyForm((p) => ({ ...p, kboNumber: e.target.value }))} placeholder="0123.456.789" />
                    </div>
                  </div>
                </section>

                {/* Address */}
                <section className="space-y-4">
                  <h4 className="text-sm font-semibold">Adres</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Straat *</Label>
                      <Input value={companyForm.street} onChange={(e) => setCompanyForm((p) => ({ ...p, street: e.target.value }))} placeholder="Straatnaam" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Huisnummer *</Label>
                      <Input value={companyForm.number} onChange={(e) => setCompanyForm((p) => ({ ...p, number: e.target.value }))} placeholder="Nr" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Postcode *</Label>
                      <Input value={companyForm.postalCode} onChange={(e) => setCompanyForm((p) => ({ ...p, postalCode: e.target.value }))} placeholder="1000" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Bus</Label>
                      <Input value={companyForm.bus} onChange={(e) => setCompanyForm((p) => ({ ...p, bus: e.target.value }))} placeholder="Bus" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Gemeente *</Label>
                      <Input value={companyForm.city} onChange={(e) => setCompanyForm((p) => ({ ...p, city: e.target.value }))} placeholder="Gemeente" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Land *</Label>
                      <Select value={companyForm.country} onValueChange={(v) => setCompanyForm((p) => ({ ...p, country: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                {/* Contactgegevens */}
                <section className="space-y-4">
                  <h4 className="text-sm font-semibold">Contactgegevens</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Telefoon</Label>
                      <Input value={companyForm.telephone} onChange={(e) => setCompanyForm((p) => ({ ...p, telephone: e.target.value }))} placeholder="+32 2 123 45 67" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">E-mail</Label>
                      <Input type="email" value={companyForm.email} onChange={(e) => setCompanyForm((p) => ({ ...p, email: e.target.value }))} placeholder="info@bedrijf.be" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Website</Label>
                      <Input value={companyForm.website} onChange={(e) => setCompanyForm((p) => ({ ...p, website: e.target.value }))} placeholder="www.bedrijf.be" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Voorkeurstaal</Label>
                      <Select value={companyForm.language} onValueChange={(v) => setCompanyForm((p) => ({ ...p, language: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LANGUAGES_LIST.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>
              </>
            }

            {/* ============ STEP 4: BOUWHEER ============ */}
            {currentStep === 4 &&
            <>
                <div className="text-center space-y-1 mb-2">
                  <h3 className="font-semibold text-lg">Bouwheer toevoegen</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    De bouwheer is de contactpersoon van het opdrachtgeverbedrijf voor dit project.
                    {companyForm.name &&
                  <span className="font-medium"> Gekoppeld aan {companyForm.name}.</span>
                  }
                  </p>
                </div>

                {/* Profiel */}
                <section className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Identiteit</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Voornaam *</Label>
                      <Input value={bouwheerForm.firstName} onChange={(e) => setBouwheerForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="(voornaam)" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Achternaam *</Label>
                      <Input value={bouwheerForm.lastName} onChange={(e) => setBouwheerForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="(achternaam)" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Functie *</Label>
                      <Input value={bouwheerForm.functie} onChange={(e) => setBouwheerForm((p) => ({ ...p, functie: e.target.value }))} placeholder="(functietitel)" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Contacttype</Label>
                      <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                        <span className="text-sm font-medium">Bouwheer</span>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="border-t" />

                {/* Zakelijk contact */}
                <section className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Zakelijk contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">E-mail (bedrijf) *</Label>
                      <Input type="email" value={bouwheerForm.email} onChange={(e) => setBouwheerForm((p) => ({ ...p, email: e.target.value }))} placeholder="(e-mailadres)" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">GSM</Label>
                      <Input value={bouwheerForm.gsm} onChange={(e) => setBouwheerForm((p) => ({ ...p, gsm: e.target.value }))} placeholder="(gsm-nummer)" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Telefoon</Label>
                      <Input value={bouwheerForm.phone} onChange={(e) => setBouwheerForm((p) => ({ ...p, phone: e.target.value }))} placeholder="(telefoonnummer)" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Nationaliteit</Label>
                      <Select value={bouwheerForm.nationality} onValueChange={(v) => setBouwheerForm((p) => ({ ...p, nationality: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecteer land" /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <div className="border-t" />

                {/* Profielfoto */}
                <section className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Profielfoto</h4>
                  <div className="rounded-lg border border-dashed p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {bouwheerForm.firstName?.[0] || '?'}{bouwheerForm.lastName?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" />Upload foto</Button>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG of GIF. Max 2 MB.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="border-t" />

                {/* Notities */}
                <section className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Notities</h4>
                  <Textarea
                  value={bouwheerForm.notes}
                  onChange={(e) => setBouwheerForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Optionele notities over deze contactpersoon..."
                  rows={3} />

                </section>

              </>
            }

            {/* ============ STEP 5: WERFLOCATIE ============ */}
            {currentStep === 5 &&
            <>
                <div className="text-center space-y-2 mb-2">
                  


                  <h3 className="text-base font-semibold">Werflocatie</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Geef het adres van de bouwwerf in.
                  </p>
                </div>

                <section className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Straat *</Label>
                      <Input
                      value={werflocatieForm.street}
                      onChange={(e) => setWerflocatieForm((p) => ({ ...p, street: e.target.value }))}
                      placeholder="Straatnaam" />

                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Huisnummer</Label>
                      <Input
                      value={werflocatieForm.number}
                      onChange={(e) => setWerflocatieForm((p) => ({ ...p, number: e.target.value }))}
                      placeholder="Nr" />

                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Postcode *</Label>
                      <Input
                      value={werflocatieForm.postalCode}
                      onChange={(e) => setWerflocatieForm((p) => ({ ...p, postalCode: e.target.value }))}
                      placeholder="1000" />

                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Gemeente *</Label>
                      <Input
                      value={werflocatieForm.city}
                      onChange={(e) => setWerflocatieForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="Gemeente" />

                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs">Land *</Label>
                      <Select value={werflocatieForm.country} onValueChange={(v) => setWerflocatieForm((p) => ({ ...p, country: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>
              </>
            }

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-background flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 &&
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep === 3 && companySearchMode === 'selected') {
                  setCurrentStep(2);
                } else if (currentStep === 4 && companySearchMode === 'selected') {
                  setCurrentStep(2);
                } else {
                  goBack();
                }
              }}>

                <ArrowLeft className="h-4 w-4 mr-2" />Vorige
              </Button>
            }
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Annuleren</Button>

            {currentStep === 1 &&
            <Button onClick={handleStep1Next}>
                Volgende<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            }
            {currentStep === 2 && companySearchMode === 'selected' &&
            <Button onClick={handleStep2Next}>
                Volgende<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            }
            {currentStep === 3 &&
            <Button onClick={handleStep3Next}>
                Volgende<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            }
            {currentStep === 4 &&
            <Button onClick={handleStep4Next}>
                Volgende<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            }
            {currentStep === 5 &&
            <Button onClick={handleCreateProject}>
                <Check className="h-4 w-4 mr-2" />Project aanmaken
              </Button>
            }
          </div>
        </div>
      </Card>
    </div>);

}