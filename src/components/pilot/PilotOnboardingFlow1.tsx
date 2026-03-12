/**
 * PilotOnboardingFlow1 — Bedrijf & Team instellen
 * Step 1: BTW-opzoeken → bedrijfsgegevens invullen (matches PilotAddCompanyDialog)
 * Step 2: Teamleden toevoegen (matches PilotAddEmployeeDialog)
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Search, Loader2, CheckCircle2, ArrowLeft, ArrowRight, UserPlus,
  Building2, X, Plus, Trash2 } from
'lucide-react';
import {
  getPilotCompany, updatePilotCompany, getPilotUser, getPilotEmployees,
  addPilotEmployee, completeOnboardingFlow, PilotEmployee } from
'@/lib/pilotSessionStore';
import { getPilotTaxonomy } from '@/lib/mockContactDB';
import { COUNTRIES } from '@/types/user';

interface Props {
  onComplete: () => void;
  onClose: () => void;
  initialStep?: Step;
  onStepComplete?: (stepId: 'company' | 'team') => void;
}

type Step = 'vat-lookup' | 'company-details' | 'team';

// Mock KBO lookup — always returns random data
function mockKBOLookup(vatInput: string) {
  const companies = [
  { name: 'Architectenbureau Van Der Berg BV', form: 'BV', street: 'Lange Nieuwstraat', city: 'Antwerpen', postalCode: '2000' },
  { name: 'Studio Bouwmeester', form: 'BV', street: 'Korenmarkt', city: 'Gent', postalCode: '9000' },
  { name: 'Atelier Moderne Architecten', form: 'NV', street: 'Bondgenotenlaan', city: 'Leuven', postalCode: '3000' },
  { name: 'Design & Build Partners', form: 'BV', street: 'Meir', city: 'Antwerpen', postalCode: '2000' },
  { name: 'Architectengroep Limburg', form: 'BV', street: 'Kunstlaan', city: 'Hasselt', postalCode: '3500' }];

  const index = Math.floor(Math.random() * companies.length);
  const mock = companies[index];
  const houseNum = Math.floor(Math.random() * 200) + 1;

  let cleaned = vatInput.replace(/[\s.\-]/g, '').toUpperCase();
  if (!cleaned.startsWith('BE')) cleaned = 'BE' + cleaned;
  const digits = cleaned.replace(/\D/g, '');
  const paddedDigits = (digits + '0000000000').slice(0, 10);
  const normalizedVat = 'BE' + paddedDigits;

  return {
    name: mock.name,
    legalForm: mock.form,
    vatNumber: normalizedVat,
    peppolId: `0208:${normalizedVat}`,
    street: mock.street,
    number: String(houseNum),
    postalCode: mock.postalCode,
    city: mock.city,
    country: 'Belgium'
  };
}

export function PilotOnboardingFlow1({ onComplete, onClose }: Props) {
  const company = getPilotCompany();
  const user = getPilotUser();
  const employees = getPilotEmployees();

  const consultantSubtypes = useMemo(() => {
    const taxonomy = getPilotTaxonomy();
    return [...new Set(taxonomy.filter((t) => t.hoofdtype === 'Consultant').map((t) => t.subtype))];
  }, []);

  // Auto-run VAT lookup on mount — skip the lookup screen entirely
  const autoData = useMemo(() => mockKBOLookup(company?.vatNumber || 'BE0885703733'), []);

  const [currentStep, setCurrentStep] = useState<Step>('company-details');

  // --- VAT lookup ---
  const [vatInput, setVatInput] = useState(autoData.vatNumber);
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'success'>('success');
  const vatInputRef = useRef<HTMLInputElement>(null);

  // --- Company form (pre-filled from auto lookup) ---
  const [companyForm, setCompanyForm] = useState({
    name: company?.name || autoData.name,
    vatNumber: company?.vatNumber || autoData.vatNumber,
    legalForm: company?.legalForm || autoData.legalForm,
    peppolId: company?.peppolId || autoData.peppolId,
    street: company?.legalAddress || autoData.street,
    number: autoData.number,
    postalCode: company?.postalCode || autoData.postalCode,
    city: company?.city || autoData.city,
    country: company?.country || autoData.country
  });

  // --- Team ---
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmp, setNewEmp] = useState({
    firstName: '', lastName: '', email: '', gsm: '', functie: '',
    employeeType: 'employee' as 'employee' | 'freelancer',
    contactSubtype: 'Architect'
  });

  // Focus VAT input on mount
  useEffect(() => {
    if (currentStep === 'vat-lookup') {
      setTimeout(() => vatInputRef.current?.focus(), 100);
    }
  }, [currentStep]);

  // Filter real employees (exclude owner metadata)
  const teamMembers = employees.filter((e) => {
    if (e.id === 'owner-function') return false;
    if (user && e.email?.toLowerCase() === user.email?.toLowerCase()) return false;
    return true;
  });

  // Check if company already has an architect
  const hasArchitect = employees.some((e) => e.contactSubtype === 'Architect');
  const availableSubtypes = hasArchitect ? consultantSubtypes : ['Architect'];

  // ========== HANDLERS ==========

  const handleVATLookup = async () => {
    if (!vatInput.trim()) return;
    setLookupState('loading');
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));

    const data = mockKBOLookup(vatInput);
    setCompanyForm({
      name: data.name,
      vatNumber: data.vatNumber,
      legalForm: data.legalForm,
      peppolId: data.peppolId,
      street: data.street,
      number: data.number,
      postalCode: data.postalCode,
      city: data.city,
      country: data.country
    });
    setLookupState('success');
    toast.success('Bedrijfsgegevens opgehaald uit het KBO-register');
    setCurrentStep('company-details');
  };

  const scrollToTop = () => {
    document.querySelector('[data-wizard-scroll]')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompanySave = () => {
    if (!companyForm.name.trim()) {
      toast.error('Bedrijfsnaam is verplicht');
      return;
    }
    updatePilotCompany({
      name: companyForm.name,
      vatNumber: companyForm.vatNumber,
      legalAddress: `${companyForm.street} ${companyForm.number}`.trim(),
      postalCode: companyForm.postalCode,
      city: companyForm.city,
      country: companyForm.country,
      peppolId: companyForm.peppolId,
      legalForm: companyForm.legalForm
    });
    toast.success('Bedrijfsgegevens opgeslagen');
    scrollToTop();
    setCurrentStep('team');
  };

  const handleAddEmployee = () => {
    if (!newEmp.firstName || !newEmp.lastName || !newEmp.email) {
      toast.error('Voornaam, achternaam en e-mail zijn verplicht');
      return;
    }
    addPilotEmployee({
      ...newEmp,
      function: newEmp.functie,
      mobile: newEmp.gsm,
      phone: '',
      employeeType: newEmp.employeeType,
      companyId: company?.id || '',
      contactSubtype: newEmp.contactSubtype
    });
    setNewEmp({ firstName: '', lastName: '', email: '', gsm: '', functie: '', employeeType: 'employee', contactSubtype: 'Architect' });
    setShowAddEmployee(false);
    toast.success('Teamlid toegevoegd');
  };

  const handleComplete = () => {
    completeOnboardingFlow(1);
    toast.success('Bedrijf & team ingesteld');
    onComplete();
  };

  const generatePeppolId = () => {
    if (companyForm.vatNumber) {
      const normalized = companyForm.vatNumber.replace(/[\s.\-]/g, '').toUpperCase();
      setCompanyForm((prev) => ({ ...prev, peppolId: `0208:${normalized}` }));
    }
  };

  // ========== STEP INDICATORS ==========

  const stepIndex = currentStep === 'vat-lookup' ? 0 : currentStep === 'company-details' ? 0 : 1;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border-border/50">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-background shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">
              {currentStep === 'team' ? 'Team instellen' : 'Bedrijfsgegevens'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentStep === 'team' ?
            'Voeg medewerkers toe aan uw team' :
            'Stel uw bedrijfsgegevens in om te beginnen'}
          </p>

          {/* Progress */}
          <div className="flex gap-2 mt-4">
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${stepIndex >= 0 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-colors ${stepIndex >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">1. Bedrijf</span>
            <span className="text-[10px] text-muted-foreground">2. Team</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0" data-wizard-scroll>
          <div className="p-6">

            {/* ===== STEP: VAT LOOKUP ===== */}
            {currentStep === 'vat-lookup' &&
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">BTW-nummer opzoeken</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    We laden de bedrijfsgegevens automatisch op basis van het BTW-nummer. Dit bespaart u veel tijd!
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">BTW-nummer</Label>
                    <Input
                    ref={vatInputRef}
                    placeholder="BE 1234 567 819"
                    value={vatInput}
                    onChange={(e) => {setVatInput(e.target.value);setLookupState('idle');}}
                    onKeyDown={(e) => e.key === 'Enter' && handleVATLookup()}
                    className="text-center" />

                  </div>
                  <Button onClick={handleVATLookup} disabled={lookupState === 'loading' || !vatInput.trim()} className="w-full">
                    {lookupState === 'loading' ?
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Zoeken...</> :
                  <><Search className="h-4 w-4 mr-2" />Gegevens opzoeken</>}
                  </Button>
                </div>
                <div className="w-full max-w-sm pt-4 border-t">
                  <Button variant="ghost" onClick={() => setCurrentStep('company-details')} className="w-full text-primary">
                    Overslaan en handmatig invullen
                  </Button>
                </div>
              </div>
            }

            {/* ===== STEP: COMPANY DETAILS ===== */}
            {currentStep === 'company-details' &&
            <div className="space-y-6">
                {lookupState === 'success'






              }

                {/* Business Info */}
                <section className="space-y-4">
                  <h4 className="text-sm font-semibold">Bedrijfsgegevens</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs">Bedrijfsnaam *</Label>
                      <Input value={companyForm.name} onChange={(e) => setCompanyForm((p) => ({ ...p, name: e.target.value }))} placeholder="Bedrijfsnaam" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">BTW-nummer *</Label>
                      <Input value={companyForm.vatNumber} onChange={(e) => setCompanyForm((p) => ({ ...p, vatNumber: e.target.value }))} className="bg-muted/50" readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Rechtsvorm</Label>
                      <Input value={companyForm.legalForm} onChange={(e) => setCompanyForm((p) => ({ ...p, legalForm: e.target.value }))} placeholder="BV, NV, ..." />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs">Peppol ID</Label>
                      <div className="flex gap-2">
                        <Input value={companyForm.peppolId} onChange={(e) => setCompanyForm((p) => ({ ...p, peppolId: e.target.value }))} placeholder="0208:BE0123456789" className="flex-1" />
                        <Button type="button" variant="outline" size="sm" onClick={generatePeppolId}>Genereer</Button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Address */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Adres</h4>
                    <Badge variant="outline" className="text-[10px]">✓ Hoofdzetel</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-xs">Straat *</Label><Input value={companyForm.street} onChange={(e) => setCompanyForm((p) => ({ ...p, street: e.target.value }))} placeholder="Straatnaam" /></div>
                    <div className="space-y-2"><Label className="text-xs">Huisnummer</Label><Input value={companyForm.number} onChange={(e) => setCompanyForm((p) => ({ ...p, number: e.target.value }))} placeholder="Nr" /></div>
                    <div className="space-y-2"><Label className="text-xs">Postcode *</Label><Input value={companyForm.postalCode} onChange={(e) => setCompanyForm((p) => ({ ...p, postalCode: e.target.value }))} placeholder="1000" /></div>
                    <div className="space-y-2"><Label className="text-xs">Gemeente *</Label><Input value={companyForm.city} onChange={(e) => setCompanyForm((p) => ({ ...p, city: e.target.value }))} placeholder="Gemeente" /></div>
                    <div className="col-span-2 space-y-2"><Label className="text-xs">Land</Label><Input value={companyForm.country} onChange={(e) => setCompanyForm((p) => ({ ...p, country: e.target.value }))} /></div>
                  </div>
                </section>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('vat-lookup')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />Terug
                  </Button>
                  <Button onClick={handleCompanySave}>
                    Opslaan & verder
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            }

            {/* ===== STEP: TEAM ===== */}
            {currentStep === 'team' &&
            <div className="space-y-6">
                {/* Owner card */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">Eigenaar</Badge>
                  </div>
                </div>

                {/* Existing team members */}
                {teamMembers.map((emp) =>
              <div key={emp.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {emp.contactSubtype || emp.function || 'Medewerker'}
                      </span>
                    </div>
                  </div>
              )}

                {/* Add Employee Form */}
                {showAddEmployee ?
              <div className="p-5 rounded-lg border border-primary/20 bg-primary/5 space-y-4">
                    <h4 className="text-sm font-semibold">Nieuw teamlid</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Voornaam *</Label>
                        <Input value={newEmp.firstName} onChange={(e) => setNewEmp((p) => ({ ...p, firstName: e.target.value }))} placeholder="Jan" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Achternaam *</Label>
                        <Input value={newEmp.lastName} onChange={(e) => setNewEmp((p) => ({ ...p, lastName: e.target.value }))} placeholder="Peeters" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">E-mail (bedrijf) *</Label>
                        <Input type="email" value={newEmp.email} onChange={(e) => setNewEmp((p) => ({ ...p, email: e.target.value }))} placeholder="jan@bedrijf.be" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">GSM</Label>
                        <Input value={newEmp.gsm} onChange={(e) => setNewEmp((p) => ({ ...p, gsm: e.target.value }))} placeholder="+32 475 12 34 56" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Functie</Label>
                        <Input value={newEmp.functie} onChange={(e) => setNewEmp((p) => ({ ...p, functie: e.target.value }))} placeholder="bv. Projectmanager" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Type medewerker</Label>
                        <Select value={newEmp.employeeType} onValueChange={(v) => setNewEmp((p) => ({ ...p, employeeType: v as any }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Werknemer</SelectItem>
                            <SelectItem value="freelancer">Freelancer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-xs">Contacttype</Label>
                        <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 mb-2">
                          <span className="text-xs text-muted-foreground">Hoofdtype:</span>
                          <span className="text-sm font-medium">Consultant</span>
                        </div>
                        <Select value={newEmp.contactSubtype} onValueChange={(v) => setNewEmp((p) => ({ ...p, contactSubtype: v }))}>
                          <SelectTrigger><SelectValue placeholder="Selecteer subtype" /></SelectTrigger>
                          <SelectContent>
                            {availableSubtypes.map((st) =>
                        <SelectItem key={st} value={st}>{st}</SelectItem>
                        )}
                          </SelectContent>
                        </Select>
                        {!hasArchitect &&
                    <p className="text-xs text-amber-600">
                            Elke firma moet eerst minstens één Architect hebben.
                          </p>
                    }
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowAddEmployee(false)}>Annuleren</Button>
                      <Button size="sm" onClick={handleAddEmployee}>
                        <Plus className="h-3.5 w-3.5 mr-1" />Toevoegen
                      </Button>
                    </div>
                  </div> :

              <Button variant="outline" className="w-full gap-2" onClick={() => setShowAddEmployee(true)}>
                    <UserPlus className="h-4 w-4" />
                    Teamlid toevoegen
                  </Button>
              }

                <p className="text-xs text-muted-foreground text-center">
                  U kunt later meer teamleden toevoegen via Instellingen.
                </p>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('company-details')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />Terug
                  </Button>
                  <Button onClick={handleComplete}>
                    Setup voltooien
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            }

          </div>
        </div>
      </Card>
    </div>);

}