import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2, AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { addPilotContact } from '@/lib/pilotSessionStore';
import { getPilotTaxonomy } from '@/lib/mockContactDB';
import { useLanguage } from '@/i18n/LanguageContext';

interface Location {
  id: string;
  name: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
}

interface EditData {
  name: string;
  vatNumber: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
  peppolId: string;
  legalForm: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
  editData?: EditData;
  context?: 'settings' | 'external';
}

// Random mock company generator - returns a different company each time
function generateRandomMockCompany(vatInput: string) {
  const companies = [
    { name: 'Architectenbureau Van Der Berg BV', form: 'BV', street: 'Lange Nieuwstraat', city: 'Antwerpen', postalCode: '2000' },
    { name: 'Studio Bouwmeester', form: 'BV', street: 'Korenmarkt', city: 'Gent', postalCode: '9000' },
    { name: 'Atelier Moderne Architecten', form: 'NV', street: 'Bondgenotenlaan', city: 'Leuven', postalCode: '3000' },
    { name: 'Design & Build Partners', form: 'BV', street: 'Meir', city: 'Antwerpen', postalCode: '2000' },
    { name: 'Vlaams Architectencollectief', form: 'CV', street: 'Grote Markt', city: 'Brugge', postalCode: '8000' },
    { name: 'Architectengroep Limburg', form: 'BV', street: 'Kunstlaan', city: 'Hasselt', postalCode: '3500' },
    { name: 'Kust Architecten', form: 'BV', street: 'Zeedijk', city: 'Oostende', postalCode: '8400' },
    { name: 'Bureau Duurzaam Bouwen', form: 'BV', street: 'Stationsstraat', city: 'Mechelen', postalCode: '2800' },
    { name: 'Architectuurstudio Schelde', form: 'NV', street: 'Scheldelaan', city: 'Antwerpen', postalCode: '2000' },
    { name: 'Groep Ruimte & Ontwerp', form: 'BV', street: 'Diestsestraat', city: 'Leuven', postalCode: '3000' },
    { name: 'Bouwkunst Vlaanderen', form: 'BV', street: 'Vrijdagmarkt', city: 'Gent', postalCode: '9000' },
    { name: 'De Nieuwe Architect', form: 'NV', street: 'Huidevettersstraat', city: 'Brugge', postalCode: '8000' },
    { name: 'Planbureau West-Vlaanderen', form: 'BV', street: 'Markt', city: 'Kortrijk', postalCode: '8500' },
    { name: 'Concept & Structuur', form: 'BV', street: 'Leopoldlaan', city: 'De Panne', postalCode: '8660' },
    { name: 'Atelier Groen Bouwen', form: 'CV', street: 'Mechelseplein', city: 'Antwerpen', postalCode: '2000' },
  ];

  const index = Math.floor(Math.random() * companies.length);
  const mock = companies[index];
  const houseNum = Math.floor(Math.random() * 200) + 1;

  let cleaned = vatInput.replace(/[\s.\-]/g, '').toUpperCase();
  if (!cleaned.startsWith('BE')) cleaned = 'BE' + cleaned;
  const digits = cleaned.replace(/\D/g, '');
  const paddedDigits = (digits + '0000000000').slice(0, 10);
  const normalizedVat = 'BE' + paddedDigits;

  return {
    companyName: mock.name,
    legalForm: mock.form,
    vatNumber: normalizedVat,
    kboNumber: paddedDigits.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3'),
    peppolId: `0208:${normalizedVat}`,
    street: mock.street,
    number: String(houseNum),
    postalCode: mock.postalCode,
    city: mock.city,
    country: 'Belgium',
  };
}

export function PilotAddCompanyDialog({ open, onOpenChange, onSaved, editData, context = 'external' }: Props) {
  const { t } = useLanguage();
  const isEditMode = !!editData;
  const [step, setStep] = useState<1 | 2>(1);

  const taxonomy = getPilotTaxonomy();
  const availableTypes = context === 'settings'
    ? [...new Set(taxonomy.filter(t => t.hoofdtype === 'Consultant').map(t => t.hoofdtype))]
    : [...new Set(taxonomy.filter(t => t.hoofdtype !== 'Consultant').map(t => t.hoofdtype))];
  const getSubtypesForType = (hoofdtype: string) =>
    [...new Set(taxonomy.filter(t => t.hoofdtype === hoofdtype).map(t => t.subtype))];
  const [vatInput, setVatInput] = useState('');
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const vatInputRef = useRef<HTMLInputElement>(null);
  const divisionInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', vatNumber: '', street: '', number: '', postalCode: '', city: '', country: 'Belgium',
    peppolId: '', legalForm: '', contactHoofdtype: '', contactSubtype: '',
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState<Omit<Location, 'id'>>({
    name: '', street: '', number: '', postalCode: '', city: '', country: 'Belgium',
  });

  const [divisions, setDivisions] = useState<string[]>([]);
  const [showAddDiv, setShowAddDiv] = useState(false);
  const [newDiv, setNewDiv] = useState('');

  useEffect(() => {
    if (open) {
      if (editData) {
        setStep(2);
        setLookupState('idle');
        setErrorMessage('');
        setForm({
          name: editData.name, vatNumber: editData.vatNumber, street: editData.street,
          number: editData.number, postalCode: editData.postalCode, city: editData.city,
          country: editData.country || 'Belgium', peppolId: editData.peppolId, legalForm: editData.legalForm,
          contactHoofdtype: '', contactSubtype: '',
        });
        setLocations([]);
        setDivisions([]);
      } else {
        setStep(1);
        setVatInput('');
        setLookupState('idle');
        setErrorMessage('');
        setForm({ name: '', vatNumber: '', street: '', number: '', postalCode: '', city: '', country: 'Belgium', peppolId: '', legalForm: '', contactHoofdtype: '', contactSubtype: '' });
        setLocations([]);
        setDivisions([]);
        setShowAddLocation(false);
        setShowAddDiv(false);
        setTimeout(() => vatInputRef.current?.focus(), 100);
      }
    }
  }, [open, editData]);

  useEffect(() => {
    if (showAddDiv) setTimeout(() => divisionInputRef.current?.focus(), 50);
  }, [showAddDiv]);

  const handleLookup = async () => {
    if (!vatInput.trim()) return;
    setLookupState('loading');
    setErrorMessage('');
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
    const data = generateRandomMockCompany(vatInput);
      setForm({
        name: data.companyName, vatNumber: data.vatNumber, street: data.street, number: data.number,
        postalCode: data.postalCode, city: data.city, country: data.country, peppolId: data.peppolId,
        legalForm: data.legalForm, contactHoofdtype: form.contactHoofdtype, contactSubtype: form.contactSubtype,
      });
    setLookupState('success');
    setStep(2);
  };

  const handleSave = () => {
    if (!form.name || !form.vatNumber) {
      toast.error(t('pilot.dialogs.nameRequired'));
      return;
    }
    if (context !== 'settings' && !form.contactHoofdtype) {
      toast.error(t('pilot.dialogs.typeRequired'));
      return;
    }
    addPilotContact({
      type: 'company',
      companyName: form.name,
      vatNumber: form.vatNumber,
      street: form.street,
      number: form.number,
      postalCode: form.postalCode,
      city: form.city,
      country: form.country,
      peppolId: form.peppolId,
      legalForm: form.legalForm,
      contactType: context === 'settings' ? (form.contactSubtype || 'Consultant') : (form.contactSubtype || form.contactHoofdtype),
    });
    toast.success(`${form.name} ${t('pilot.dialogs.addedToContacts')}`);
    onSaved?.();
    onOpenChange(false);
  };

  const handleAddLocation = () => {
    if (newLocation.name.trim() && newLocation.street.trim()) {
      setLocations(prev => [...prev, { ...newLocation, id: crypto.randomUUID() }]);
      setNewLocation({ name: '', street: '', number: '', postalCode: '', city: '', country: 'Belgium' });
      setShowAddLocation(false);
    }
  };

  const handleAddDivision = () => {
    if (newDiv.trim()) {
      setDivisions(prev => [...prev, newDiv.trim()]);
      setNewDiv('');
      setShowAddDiv(false);
    }
  };

  const generatePeppolId = () => {
    if (form.vatNumber) {
      const normalized = form.vatNumber.replace(/[\s.\-]/g, '').toUpperCase();
      setForm(prev => ({ ...prev, peppolId: `0208:${normalized}` }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-semibold">{isEditMode ? t('pilot.dialogs.editCompany') : t('pilot.dialogs.addCompany')}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditMode ? t('pilot.dialogs.editCompanyDesc') : t('pilot.dialogs.addCompanyDesc')}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 overflow-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{t('pilot.dialogs.vatLookup')}</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t('pilot.dialogs.vatLookupDesc')}
              </p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('pilot.dialogs.vatNumber')}</Label>
                <Input
                  ref={vatInputRef}
                  placeholder="BE 1234 567 819"
                  value={vatInput}
                  onChange={e => { setVatInput(e.target.value); setErrorMessage(''); setLookupState('idle'); }}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  className="text-center"
                />
              </div>
              {errorMessage && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" /><span>{errorMessage}</span>
                </div>
              )}
              <Button onClick={handleLookup} disabled={lookupState === 'loading' || !vatInput.trim()} className="w-full">
                {lookupState === 'loading' ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('pilot.dialogs.searching')}</> : <><Search className="h-4 w-4 mr-2" />{t('pilot.dialogs.searchBtn')}</>}
              </Button>
            </div>
            <div className="w-full max-w-sm pt-4 border-t">
              <Button variant="ghost" onClick={() => setStep(2)} className="w-full text-primary">
                {t('pilot.dialogs.skipManual')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 space-y-6">
              {lookupState === 'success' && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {t('pilot.dialogs.companyFound')}
                  </p>
                </div>
              )}

              {/* Contact Type */}
              <section className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.contactType')} *</h4>
                {context === 'settings' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{t('pilot.dialogs.mainType')}</Label>
                      <Input value="Consultant" disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t('pilot.dialogs.subType')}</Label>
                      <Select value={form.contactSubtype} onValueChange={(val) => setForm(p => ({ ...p, contactSubtype: val }))}>
                        <SelectTrigger><SelectValue placeholder={t('pilot.dialogs.selectSubtype')} /></SelectTrigger>
                        <SelectContent>
                          {getSubtypesForType('Consultant').map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{t('pilot.dialogs.mainType')} *</Label>
                      <Select value={form.contactHoofdtype} onValueChange={(val) => setForm(p => ({ ...p, contactHoofdtype: val, contactSubtype: '' }))}>
                        <SelectTrigger><SelectValue placeholder={t('pilot.dialogs.selectType')} /></SelectTrigger>
                        <SelectContent>
                          {availableTypes.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t('pilot.dialogs.subType')}</Label>
                      <Select value={form.contactSubtype} onValueChange={(val) => setForm(p => ({ ...p, contactSubtype: val }))} disabled={!form.contactHoofdtype}>
                        <SelectTrigger><SelectValue placeholder={form.contactHoofdtype ? t('pilot.dialogs.selectSubtype') : t('pilot.dialogs.chooseTypeFirst')} /></SelectTrigger>
                        <SelectContent>
                          {form.contactHoofdtype && getSubtypesForType(form.contactHoofdtype).map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </section>

              {/* Business Information */}
              <section className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.businessInfo')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.companyName')} *</Label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t('pilot.dialogs.companyName')} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.vatNr')} *</Label>
                    <Input value={form.vatNumber} onChange={e => setForm(p => ({ ...p, vatNumber: e.target.value }))} placeholder="BE 0123.456.789" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.peppolId')}</Label>
                    <div className="flex gap-2">
                      <Input value={form.peppolId} onChange={e => setForm(p => ({ ...p, peppolId: e.target.value }))} placeholder="0208:BE0123456789" className="flex-1" />
                      <Button type="button" variant="outline" size="sm" onClick={generatePeppolId}>{t('pilot.dialogs.generate')}</Button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Address */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.address')}</h4>
                  <Badge variant="outline" className="text-[10px]">{t('pilot.dialogs.headquarters')}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-xs">{t('pilot.dialogs.street')} *</Label><Input value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} placeholder={t('pilot.dialogs.street')} /></div>
                  <div className="space-y-2"><Label className="text-xs">{t('pilot.dialogs.houseNumber')} *</Label><Input value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder={t('pilot.dialogs.nr')} /></div>
                  <div className="space-y-2"><Label className="text-xs">{t('pilot.dialogs.postalCode')} *</Label><Input value={form.postalCode} onChange={e => setForm(p => ({ ...p, postalCode: e.target.value }))} placeholder="1000" /></div>
                  <div className="space-y-2"><Label className="text-xs">{t('pilot.dialogs.city')} *</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder={t('pilot.dialogs.city')} /></div>
                  <div className="col-span-2 space-y-2"><Label className="text-xs">{t('pilot.dialogs.country')} *</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Belgium" /></div>
                </div>
              </section>

              {/* Branches */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.branches')}</h4>
                    <p className="text-xs text-muted-foreground">{t('pilot.dialogs.branchesDesc')}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddLocation(true)} className="text-xs">
                    <Plus className="h-3 w-3 mr-1" />{t('pilot.dialogs.add')}
                  </Button>
                </div>

                {showAddLocation && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-xs">{t('pilot.dialogs.name')} *</Label><Input value={newLocation.name} onChange={e => setNewLocation(p => ({ ...p, name: e.target.value }))} placeholder={t('pilot.dialogs.branchName')} className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('pilot.dialogs.street')} *</Label><Input value={newLocation.street} onChange={e => setNewLocation(p => ({ ...p, street: e.target.value }))} placeholder={t('pilot.dialogs.street')} className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('pilot.dialogs.nr')}</Label><Input value={newLocation.number} onChange={e => setNewLocation(p => ({ ...p, number: e.target.value }))} placeholder={t('pilot.dialogs.nr')} className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('pilot.dialogs.postalCode')}</Label><Input value={newLocation.postalCode} onChange={e => setNewLocation(p => ({ ...p, postalCode: e.target.value }))} placeholder={t('pilot.dialogs.postalCode')} className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('pilot.dialogs.city')}</Label><Input value={newLocation.city} onChange={e => setNewLocation(p => ({ ...p, city: e.target.value }))} placeholder={t('pilot.dialogs.city')} className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('pilot.dialogs.land')}</Label><Input value={newLocation.country} onChange={e => setNewLocation(p => ({ ...p, country: e.target.value }))} placeholder={t('pilot.dialogs.land')} className="h-8 text-xs" /></div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddLocation(false)} className="text-xs">{t('pilot.dialogs.cancel')}</Button>
                      <Button type="button" size="sm" onClick={handleAddLocation} className="text-xs">{t('pilot.dialogs.save')}</Button>
                    </div>
                  </div>
                )}

                {locations.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="h-8 text-xs">{t('pilot.dialogs.name')}</TableHead>
                          <TableHead className="h-8 text-xs">{t('pilot.dialogs.street')}</TableHead>
                          <TableHead className="h-8 text-xs">{t('pilot.dialogs.nr')}</TableHead>
                          <TableHead className="h-8 text-xs">{t('pilot.dialogs.postalCode')}</TableHead>
                          <TableHead className="h-8 text-xs">{t('pilot.dialogs.city')}</TableHead>
                          <TableHead className="h-8 text-xs">{t('pilot.dialogs.land')}</TableHead>
                          <TableHead className="h-8 text-xs w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locations.map(loc => (
                          <TableRow key={loc.id} className="group">
                            <TableCell className="py-2 text-xs">{loc.name}</TableCell>
                            <TableCell className="py-2 text-xs">{loc.street}</TableCell>
                            <TableCell className="py-2 text-xs">{loc.number}</TableCell>
                            <TableCell className="py-2 text-xs">{loc.postalCode}</TableCell>
                            <TableCell className="py-2 text-xs">{loc.city}</TableCell>
                            <TableCell className="py-2 text-xs">{loc.country}</TableCell>
                            <TableCell className="py-2 text-xs">
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => setLocations(p => p.filter(l => l.id !== loc.id))}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : !showAddLocation && (
                  <p className="text-xs text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">{t('pilot.dialogs.noBranches')}</p>
                )}
              </section>

              {/* Divisions */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.divisionsLabel')}</h4>
                    <p className="text-xs text-muted-foreground">{t('pilot.dialogs.divisionsDesc')}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddDiv(true)} className="text-xs">
                    <Plus className="h-3 w-3 mr-1" />{t('pilot.dialogs.add')}
                  </Button>
                </div>

                {showAddDiv && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex gap-2">
                      <Input ref={divisionInputRef} value={newDiv} onChange={e => setNewDiv(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddDivision()} placeholder={t('pilot.dialogs.divisionName')} className="h-8 text-xs flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddDiv(false)} className="text-xs">{t('pilot.dialogs.cancel')}</Button>
                      <Button type="button" size="sm" onClick={handleAddDivision} className="text-xs">{t('pilot.dialogs.save')}</Button>
                    </div>
                  </div>
                )}

                {divisions.length > 0 ? (
                  <div className="space-y-2">
                    {divisions.map((div, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
                        <span className="text-sm">{div}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => setDivisions(p => p.filter((_, idx) => idx !== i))}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : !showAddDiv && (
                  <p className="text-xs text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">{t('pilot.dialogs.noDivisions')}</p>
                )}
              </section>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-background shrink-0">
            {!isEditMode ? <Button variant="ghost" onClick={() => setStep(1)}>{t('pilot.dialogs.back')}</Button> : <div />}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t('pilot.dialogs.cancel')}</Button>
              <Button onClick={handleSave}>{isEditMode ? t('pilot.dialogs.update') : t('pilot.dialogs.save')}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
