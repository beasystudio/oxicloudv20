/**
 * Two-step modal for adding/editing companies in Settings
 * Step 1: VAT Lookup (recommended) - skipped when editing
 * Step 2: Details Form with locations and divisions
 */

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, AlertCircle, CheckCircle2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface Location {
  id: string;
  name: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
}
interface CompanyFormData {
  name: string;
  vatNumber: string;
  street: string;
  number: string;
  bus: string;
  postalCode: string;
  city: string;
  country: string;
  peppolId: string;
  kboNumber: string;
  legalName: string;
  companyEmail: string;
}
export interface CompanyModalData extends CompanyFormData {
  id?: string;
  divisions: string[];
  locations: Location[];
  logoUrl?: string;
}
interface AddCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyAdded: (company: CompanyFormData & { divisions: string[]; locations: Location[] }) => void;
  onCompanyUpdated?: (company: CompanyFormData & { divisions: string[]; locations: Location[] }) => void;
  onCompanyDeleted?: () => void;
  existingVatNumbers?: string[];
  initialData?: CompanyModalData | null;
}

const normalizeVatNumber = (vat: string): string => vat.replace(/[\s.\-]/g, '').toUpperCase();
const formatVatDisplay = (vat: string): string => {
  const normalized = normalizeVatNumber(vat);
  if (normalized.startsWith('BE') && normalized.length === 12) {
    return `${normalized.slice(0, 2)} ${normalized.slice(2, 6)}.${normalized.slice(6, 9)}.${normalized.slice(9)}`;
  }
  return vat;
};
const isValidBelgianVat = (vat: string): boolean => {
  const normalized = normalizeVatNumber(vat);
  return /^BE[01]\d{9}$/.test(normalized);
};

export function AddCompanyModal({
  open, onOpenChange, onCompanyAdded, onCompanyUpdated, onCompanyDeleted, existingVatNumbers = [], initialData
}: AddCompanyModalProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const isEditMode = !!initialData?.id;
  const [step, setStep] = useState<1 | 2>(1);
  const [vatInput, setVatInput] = useState("");
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [vatLookedUp, setVatLookedUp] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "", vatNumber: "", street: "", number: "", bus: "", postalCode: "", city: "", country: "Belgium", peppolId: "", kboNumber: "", legalName: "", companyEmail: ""
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [showAddDivision, setShowAddDivision] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState("");
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState<Omit<Location, "id">>({ name: "", street: "", number: "", postalCode: "", city: "", country: "Belgium" });
  const [logoUrl, setLogoUrl] = useState<string>("");
  const vatInputRef = useRef<HTMLInputElement>(null);
  const divisionInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (initialData?.id) {
        setFormData({
          name: initialData.name || "", vatNumber: initialData.vatNumber || "", street: initialData.street || "",
          number: initialData.number || "", bus: initialData.bus || "", postalCode: initialData.postalCode || "",
          city: initialData.city || "", country: initialData.country || "Belgium", peppolId: initialData.peppolId || "",
          kboNumber: initialData.kboNumber || "", legalName: initialData.legalName || "", companyEmail: (initialData as any).companyEmail || ""
        });
        setLocations(initialData.locations || []);
        setDivisions(initialData.divisions || []);
        setLogoUrl(initialData.logoUrl || "");
        setStep(2);
        setVatLookedUp(false);
        setLookupState("idle");
        setErrorMessage("");
      } else {
        resetAll();
        setTimeout(() => vatInputRef.current?.focus(), 100);
      }
    }
  }, [open, initialData]);

  useEffect(() => {
    if (showAddDivision) setTimeout(() => divisionInputRef.current?.focus(), 50);
  }, [showAddDivision]);

  const resetAll = () => {
    setStep(1); setVatInput(""); setLookupState("idle"); setErrorMessage(""); setVatLookedUp(false);
    setFormData({ name: "", vatNumber: "", street: "", number: "", bus: "", postalCode: "", city: "", country: "Belgium", peppolId: "", kboNumber: "", legalName: "", companyEmail: "" });
    setLocations([]); setDivisions([]); setLogoUrl(""); setShowAddDivision(false); setNewDivisionName("");
    setShowAddLocation(false); setNewLocation({ name: "", street: "", number: "", postalCode: "", city: "", country: "Belgium" });
  };

  const handleVatLookup = async () => {
    if (!vatInput.trim()) return;
    const normalized = normalizeVatNumber(vatInput);
    if (existingVatNumbers.includes(normalized)) {
      setLookupState("error");
      setErrorMessage(t('companyModal.duplicateVat'));
      return;
    }
    setLookupState("loading"); setErrorMessage("");
    try {
      const { data, error } = await supabase.functions.invoke('vat-lookup', { body: { vatNumber: normalized } });
      if (error || !data?.success) {
        const { lookupVATNumber } = await import('@/lib/vatLookupService');
        const mockResult = await lookupVATNumber(normalized, true);
        if (mockResult.success && mockResult.data) {
          const cd = mockResult.data;
          setFormData({ name: cd.companyName || "", vatNumber: normalized, street: cd.street || "", number: cd.number || "", bus: "", postalCode: cd.postalCode || "", city: cd.city || "", country: cd.country || "Belgium", peppolId: cd.peppolId || "", kboNumber: cd.kboNumber || "", legalName: cd.legalName || cd.companyName || "", companyEmail: "" });
          setVatLookedUp(true); setLookupState("success"); setStep(2);
          return;
        }
        setLookupState("error"); setErrorMessage(data?.error || t('companyModal.noCompanyFound'));
        return;
      }
      const cd = data.data;
      setFormData({ name: cd.companyName || "", vatNumber: normalized, street: cd.street || "", number: cd.number || "", bus: "", postalCode: cd.postalCode || "", city: cd.city || "", country: cd.country || "Belgium", peppolId: cd.peppolId || "", kboNumber: cd.kboNumber || "", legalName: cd.legalName || cd.companyName || "", companyEmail: "" });
      setVatLookedUp(true); setLookupState("success"); setStep(2);
    } catch (err) {
      try {
        const { lookupVATNumber } = await import('@/lib/vatLookupService');
        const mockResult = await lookupVATNumber(normalized, true);
        if (mockResult.success && mockResult.data) {
          const cd = mockResult.data;
          setFormData({ name: cd.companyName || "", vatNumber: normalized, street: cd.street || "", number: cd.number || "", bus: "", postalCode: cd.postalCode || "", city: cd.city || "", country: cd.country || "Belgium", peppolId: cd.peppolId || "", kboNumber: cd.kboNumber || "", legalName: cd.legalName || cd.companyName || "" });
          setVatLookedUp(true); setLookupState("success"); setStep(2);
          return;
        }
      } catch {}
      setLookupState("error"); setErrorMessage(t('companyModal.lookupError'));
    }
  };

  const handleSkipToManual = () => { setVatLookedUp(false); setStep(2); };
  const handleBack = () => { setStep(1); };
  const generatePeppolId = () => {
    if (formData.vatNumber) {
      const normalized = normalizeVatNumber(formData.vatNumber);
      setFormData(prev => ({ ...prev, peppolId: `0208:${normalized}` }));
    }
  };
  const handleAddDivision = () => {
    if (newDivisionName.trim()) { setDivisions(prev => [...prev, newDivisionName.trim()]); setNewDivisionName(""); setShowAddDivision(false); }
  };
  const handleRemoveDivision = (index: number) => { setDivisions(prev => prev.filter((_, i) => i !== index)); };
  const handleAddLocation = () => {
    if (newLocation.name.trim() && newLocation.street.trim()) {
      setLocations(prev => [...prev, { ...newLocation, id: crypto.randomUUID() }]);
      setNewLocation({ name: "", street: "", number: "", postalCode: "", city: "", country: "Belgium" });
      setShowAddLocation(false);
    }
  };
  const handleRemoveLocation = (id: string) => { setLocations(prev => prev.filter(loc => loc.id !== id)); };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) { toast({ title: t('companyModal.error'), description: t('companyModal.companyNameRequired'), variant: "destructive" }); return false; }
    if (!formData.vatNumber.trim()) { toast({ title: t('companyModal.error'), description: t('companyModal.vatRequired'), variant: "destructive" }); return false; }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (isEditMode && onCompanyUpdated) {
      onCompanyUpdated({ ...formData, divisions, locations, logoUrl } as any);
      toast({ title: t('companyModal.companyUpdated'), description: `${formData.name} ${t('companyModal.companyUpdatedDesc')}` });
    } else {
      onCompanyAdded({ ...formData, divisions, locations, logoUrl } as any);
      toast({ title: t('companyModal.companySaved'), description: `${formData.name} ${t('companyModal.companySavedDesc')}` });
    }
    onOpenChange(false);
  };

  const handleSaveAndAddNew = () => {
    if (!validateForm()) return;
    onCompanyAdded({ ...formData, divisions, locations });
    toast({ title: t('companyModal.companySaved'), description: `${formData.name} ${t('companyModal.companySavedDesc')}` });
    resetAll();
    setTimeout(() => vatInputRef.current?.focus(), 100);
  };

  const handleDelete = () => {
    if (isEditMode && onCompanyDeleted) { onCompanyDeleted(); onOpenChange(false); }
    else { resetAll(); setTimeout(() => vatInputRef.current?.focus(), 100); }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        <div className="px-6 pt-5 pb-4 border-b shrink-0">
          <h2 className="text-lg font-semibold">
            {isEditMode ? t('companyModal.editCompany') : t('companyModal.addCompany')}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEditMode ? t('companyModal.editDesc') : t('companyModal.addDesc')}
          </p>
        </div>

        {step === 1 ? (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 overflow-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{t('companyModal.vatLookupTitle')}</h3>
              <p className="text-sm text-muted-foreground max-w-sm">{t('companyModal.vatLookupDesc')}</p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              <div className="space-y-2">
                <Label htmlFor="vat-lookup" className="text-sm font-medium">{t('companyModal.vatNumber')}</Label>
                <Input ref={vatInputRef} id="vat-lookup" placeholder={t('companyModal.vatPlaceholder')} value={vatInput} onChange={e => { setVatInput(e.target.value); setErrorMessage(""); setLookupState("idle"); }} onKeyDown={e => e.key === "Enter" && handleVatLookup()} className="text-center" />
              </div>
              {errorMessage && <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>}
              <Button onClick={handleVatLookup} disabled={lookupState === "loading" || !vatInput.trim()} className="w-full">
                {lookupState === "loading" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('companyModal.searching')}</> : <><Search className="h-4 w-4 mr-2" />{t('companyModal.lookupData')}</>}
              </Button>
            </div>
            <div className="w-full max-w-sm pt-4 border-t">
              <Button variant="ghost" onClick={handleSkipToManual} className="w-full text-primary">{t('companyModal.skipManual')}</Button>
            </div>
          </div>
        ) : (
      <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 space-y-5">
              {vatLookedUp && <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">{t('companyModal.dataFound')}</p>
                </div>}

              <section className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('companyModal.contactType')}</h4>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/30">
                  <span className="text-xs font-medium">Consultant</span>
                  <span className="text-[11px] text-muted-foreground">{t('companyModal.fixedForInternal')}</span>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('companyModal.companyLogo')}</h4>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="relative group">
                      <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-lg border bg-muted p-1" />
                      <button type="button" onClick={() => setLogoUrl("")} className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                    </div>
                  ) : (
                    <div onClick={() => logoInputRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Plus className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} className="text-xs">
                      {logoUrl ? t('companyModal.changeLogo') : t('companyModal.uploadLogo')}
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1">{t('companyModal.logoFormats')}</p>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) { toast({ title: t('companyModal.fileTooLarge'), description: t('companyModal.fileTooLargeDesc'), variant: "destructive" }); return; }
                    const reader = new FileReader();
                    reader.onload = (ev) => setLogoUrl(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }} />
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('companyModal.businessInfo')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs">{t('companyModal.companyName')} *</Label>
                      <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-xs">{t('companyModal.streetLabel')} *</Label>
                      <Input id="street" value={formData.street} onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bus" className="text-xs">{t('companyModal.busLabel')}</Label>
                      <Input id="bus" value={formData.bus} onChange={e => setFormData(prev => ({ ...prev, bus: e.target.value }))} placeholder="Bus/Unit" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs">{t('companyModal.cityLabel')} *</Label>
                      <Input id="city" value={formData.city} onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="peppol" className="text-xs">{t('companyModal.peppolId')}</Label>
                      <div className="flex gap-2">
                        <Input id="peppol" value={formData.peppolId} onChange={e => setFormData(prev => ({ ...prev, peppolId: e.target.value }))} placeholder="0208:BE0123456789" className="flex-1" />
                        <Button type="button" variant="outline" size="sm" onClick={generatePeppolId}>{t('companyModal.generate')}</Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="vat" className="text-xs">{t('companyModal.vatNr')} *</Label>
                      <Input id="vat" value={formatVatDisplay(formData.vatNumber)} onChange={e => setFormData(prev => ({ ...prev, vatNumber: normalizeVatNumber(e.target.value) }))} placeholder="BE 0123.456.789" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number" className="text-xs">{t('companyModal.houseNumber')} *</Label>
                      <Input id="number" value={formData.number} onChange={e => setFormData(prev => ({ ...prev, number: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-xs">{t('companyModal.postalCodeLabel')} *</Label>
                      <Input id="postalCode" value={formData.postalCode} onChange={e => setFormData(prev => ({ ...prev, postalCode: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="country" className="text-xs">{t('companyModal.countryLabel')} *</Label>
                        <Badge variant="outline" className="text-[10px]">✓ {t('companyModal.headquarters')}</Badge>
                      </div>
                      <Input id="country" value={formData.country} onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))} placeholder="Belgium" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('companyModal.locations')}</h4>
                    <p className="text-[11px] text-muted-foreground">{t('companyModal.locationsDesc')}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddLocation(true)} className="text-xs">
                    <Plus className="h-3 w-3 mr-1" />{t('companyModal.add')}
                  </Button>
                </div>

                {showAddLocation && <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-xs">{t('companyModal.locationName')} *</Label><Input value={newLocation.name} onChange={e => setNewLocation(prev => ({ ...prev, name: e.target.value }))} className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('companyModal.streetLabel')} *</Label><Input value={newLocation.street} onChange={e => setNewLocation(prev => ({ ...prev, street: e.target.value }))} className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('userForm.nr')}</Label><Input value={newLocation.number} onChange={e => setNewLocation(prev => ({ ...prev, number: e.target.value }))} className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('companyModal.postalCodeLabel')}</Label><Input value={newLocation.postalCode} onChange={e => setNewLocation(prev => ({ ...prev, postalCode: e.target.value }))} className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('companyModal.cityLabel')}</Label><Input value={newLocation.city} onChange={e => setNewLocation(prev => ({ ...prev, city: e.target.value }))} className="h-8 text-xs" /></div>
                      <div className="space-y-1"><Label className="text-xs">{t('companyModal.countryLabel')}</Label><Input value={newLocation.country} onChange={e => setNewLocation(prev => ({ ...prev, country: e.target.value }))} className="h-8 text-xs" /></div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddLocation(false)} className="text-xs">{t('companyModal.cancelBtn')}</Button>
                      <Button type="button" size="sm" onClick={handleAddLocation} className="text-xs">{t('companyModal.saveBtn')}</Button>
                    </div>
                  </div>}

                {locations.length > 0 ? <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="h-8 text-xs">{t('companyModal.locationName')}</TableHead>
                          <TableHead className="h-8 text-xs">{t('companyModal.streetLabel')}</TableHead>
                          <TableHead className="h-8 text-xs">{t('userForm.nr')}</TableHead>
                          <TableHead className="h-8 text-xs">{t('companyModal.postalCodeLabel')}</TableHead>
                          <TableHead className="h-8 text-xs">{t('companyModal.cityLabel')}</TableHead>
                          <TableHead className="h-8 text-xs">{t('companyModal.countryLabel')}</TableHead>
                          <TableHead className="h-8 text-xs w-12">{t('companyModal.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locations.map(loc => <TableRow key={loc.id} className="group">
                            <TableCell className="py-2 text-xs">{loc.name}</TableCell>
                            <TableCell className="py-2 text-xs">{loc.street}</TableCell>
                            <TableCell className="py-2 text-xs">{loc.number}</TableCell>
                            <TableCell className="py-2 text-xs">{loc.postalCode}</TableCell>
                            <TableCell className="py-2 text-xs">{loc.city}</TableCell>
                            <TableCell className="py-2 text-xs">{loc.country}</TableCell>
                            <TableCell className="py-2 text-xs">
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveLocation(loc.id)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>)}
                      </TableBody>
                    </Table>
                  </div> : !showAddLocation && <p className="text-xs text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">{t('companyModal.noLocationsAdded')}</p>}
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('companyModal.divisions')}</h4>
                    <p className="text-[11px] text-muted-foreground">{t('companyModal.divisionsDesc')}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddDivision(true)} className="text-xs">
                    <Plus className="h-3 w-3 mr-1" />{t('companyModal.add')}
                  </Button>
                </div>

                {showAddDivision && <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex gap-2">
                      <Input ref={divisionInputRef} value={newDivisionName} onChange={e => setNewDivisionName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddDivision()} placeholder={t('companyModal.divisionName')} className="h-8 text-xs flex-1" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddDivision(false)} className="text-xs">{t('companyModal.cancelBtn')}</Button>
                      <Button type="button" size="sm" onClick={handleAddDivision} className="text-xs">{t('companyModal.saveBtn')}</Button>
                    </div>
                  </div>}

                {divisions.length > 0 ? <div className="space-y-2">
                    {divisions.map((div, index) => <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
                        <span className="text-sm">{div}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveDivision(index)} />
                      </div>)}
                  </div> : !showAddDivision && <p className="text-xs text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">{t('companyModal.noDivisionsAdded')}</p>}
              </section>
            </div>
          </div>
        )}

        {step === 2 && <div className="flex items-center justify-between px-6 py-4 border-t bg-background shrink-0">
            {!isEditMode ? <Button type="button" variant="ghost" size="sm" onClick={handleBack}>{t('companyModal.back')}</Button> : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t('companyModal.cancelBtn')}</Button>
              <Button type="button" size="sm" onClick={handleSave}>{isEditMode ? t('companyModal.update') : t('companyModal.saveBtn')}</Button>
            </div>
          </div>}
      </DialogContent>
    </Dialog>;
}
