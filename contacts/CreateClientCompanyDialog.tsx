/**
 * Create Client Company Dialog
 * Two-step modal matching Settings → Add Company UX-UI
 * Step 1: VAT Lookup (recommended)
 * Step 2: Details Form with Contact Type
 * Saves to Contacts (address book), NOT Settings → Company
 */

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Loader2, AlertCircle, CheckCircle2, Plus, ArrowLeft } from "lucide-react";
import { getAllTaxonomy, createContact, getHoofdtypesByContext, getTaxonomyByContext } from "@/lib/mockContactDB";
import { ContactType, COUNTRIES } from "@/types/contact";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAllContacts } from "@/lib/mockContactDB";
import { useLanguage } from "@/i18n/LanguageContext";

interface CreateClientCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}
const LANGUAGES = ['Dutch', 'French', 'English', 'German', 'Spanish', 'Italian', 'Portuguese'];

const normalizeVatNumber = (vat: string): string => {
  return vat.replace(/[\s.\-]/g, '').toUpperCase();
};

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

interface FormData {
  name: string;
  vatNumber: string;
  legalName: string;
  street: string;
  number: string;
  bus: string;
  postalCode: string;
  city: string;
  country: string;
  peppolId: string;
  poNummer: string;
  kboNumber: string;
  companyEmail: string;
  telephone: string;
  email: string;
  website: string;
  language: string;
  description: string;
  hoofdtypeId: string;
  subtypeId: string;
  evaluationNotes: string;
}

export function CreateClientCompanyDialog({
  open,
  onOpenChange,
  onSaved
}: CreateClientCompanyDialogProps) {
  const { logApiCall } = useMockAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [vatInput, setVatInput] = useState("");
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [vatLookedUp, setVatLookedUp] = useState(false);
  const [taxonomy, setTaxonomy] = useState<ContactType[]>([]);
  const [hoofdtypes, setHoofdtypes] = useState<string[]>([]);
  const [subtypes, setSubtypes] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: "", vatNumber: "", legalName: "", street: "", number: "", bus: "",
    postalCode: "", city: "", country: "Belgium", peppolId: "", poNummer: "", kboNumber: "",
    companyEmail: "", telephone: "", email: "", website: "", language: "Dutch", description: "",
    hoofdtypeId: "", subtypeId: "", evaluationNotes: ""
  });
  const vatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const allTaxonomy = getTaxonomyByContext('external');
      setTaxonomy(allTaxonomy);
      setHoofdtypes(getHoofdtypesByContext('external'));
      resetAll();
      setTimeout(() => vatInputRef.current?.focus(), 100);
    }
  }, [open]);

  const resetAll = () => {
    setStep(1);
    setVatInput("");
    setLookupState("idle");
    setErrorMessage("");
    setVatLookedUp(false);
    setRating(0);
    setSubtypes([]);
    setFormData({
      name: "", vatNumber: "", legalName: "", street: "", number: "", bus: "",
      postalCode: "", city: "", country: "Belgium", peppolId: "", poNummer: "", kboNumber: "",
      companyEmail: "", telephone: "", email: "", website: "", language: "Dutch", description: "",
      hoofdtypeId: "", subtypeId: "", evaluationNotes: ""
    });
  };

  const checkDuplicateVat = (vatNumber: string): boolean => {
    const contacts = getAllContacts();
    return contacts.some((c) => c.contactType === 'company' && c.vatNumber && normalizeVatNumber(c.vatNumber) === normalizeVatNumber(vatNumber));
  };

  const handleVatLookup = async () => {
    const normalized = normalizeVatNumber(vatInput);
    if (!isValidBelgianVat(vatInput)) {
      setLookupState("error");
      setErrorMessage(t('createClientCompany.invalidVat'));
      return;
    }
    if (checkDuplicateVat(normalized)) {
      setLookupState("error");
      setErrorMessage(t('createClientCompany.duplicateVat'));
      return;
    }
    setLookupState("loading");
    setErrorMessage("");
    try {
      const { data, error } = await supabase.functions.invoke('vat-lookup', {
        body: { vatNumber: normalized }
      });
      if (error || !data?.success) {
        setLookupState("error");
        setErrorMessage(data?.error || t('createClientCompany.notFound'));
        return;
      }
      const companyData = data.data;
      setFormData((prev) => ({
        ...prev,
        name: companyData.companyName || "",
        vatNumber: normalized,
        legalName: companyData.legalName || companyData.companyName || "",
        street: companyData.street || "",
        number: companyData.number || "",
        postalCode: companyData.postalCode || "",
        city: companyData.city || "",
        country: companyData.country || "Belgium",
        peppolId: companyData.peppolId || "",
        kboNumber: companyData.kboNumber || ""
      }));
      setVatLookedUp(true);
      setLookupState("success");
      setStep(2);
    } catch (err) {
      setLookupState("error");
      setErrorMessage(t('createClientCompany.fetchError'));
    }
  };

  const handleSkipToManual = () => {
    setVatLookedUp(false);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const generatePeppolId = () => {
    if (formData.vatNumber) {
      const normalized = normalizeVatNumber(formData.vatNumber);
      setFormData((prev) => ({ ...prev, peppolId: `0208:${normalized}` }));
    }
  };

  const handleHoofdtypeChange = (value: string) => {
    const matchingEntries = taxonomy.filter((t) => t.hoofdtype === value);
    const subs = [...new Set(matchingEntries.map((t) => t.subtype))];
    setSubtypes(subs);
    setFormData((prev) => ({ ...prev, hoofdtypeId: matchingEntries[0]?.id || '', subtypeId: '' }));
  };

  const handleSubtypeChange = (subtype: string) => {
    const entry = taxonomy.find((t) => t.subtype === subtype && taxonomy.find((x) => x.id === formData.hoofdtypeId)?.hoofdtype === t.hoofdtype);
    setFormData((prev) => ({ ...prev, subtypeId: entry?.id || prev.hoofdtypeId }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error(t('createClientCompany.companyNameRequired'));
      return;
    }
    if (!formData.companyEmail.trim()) {
      toast.error(t('createClientCompany.companyEmailRequired'));
      return;
    }
    if (formData.companyEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail.trim())) {
      toast.error(t('createClientCompany.companyEmailInvalid'));
      return;
    }
    if (!formData.vatNumber.trim() && !vatLookedUp) {
      // Allow save without VAT if skipped
    }
    const newContact = createContact({
      hoofdtypeId: formData.hoofdtypeId,
      subtypeId: formData.subtypeId || formData.hoofdtypeId,
      name: formData.name,
      contactType: 'company',
      companyName: formData.name,
      vatNumber: formData.vatNumber,
      street: formData.street,
      number: formData.number,
      postalCode: formData.postalCode,
      city: formData.city,
      country: formData.country,
      phone: formData.telephone,
      gsm: '',
      email: formData.email,
      status: 'Active'
    });
    logApiCall('POST', '/api/mock/contacts', {
      ...newContact,
      legalName: formData.legalName,
      website: formData.website,
      peppolId: formData.peppolId,
      language: formData.language,
      kboNumber: formData.kboNumber,
      description: formData.description,
      evaluation: rating,
      evaluationNotes: formData.evaluationNotes
    });
    toast.success(t('createClientCompany.addedToContacts').replace('{name}', formData.name));
    onSaved();
    onOpenChange(false);
  };

  const handleSaveAndAddNew = () => {
    if (!formData.name.trim()) {
      toast.error(t('createClientCompany.companyNameRequired'));
      return;
    }
    if (!formData.companyEmail.trim()) {
      toast.error(t('createClientCompany.companyEmailRequired'));
      return;
    }
    if (formData.companyEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail.trim())) {
      toast.error(t('createClientCompany.companyEmailInvalid'));
      return;
    }
    const newContact = createContact({
      hoofdtypeId: formData.hoofdtypeId,
      subtypeId: formData.subtypeId || formData.hoofdtypeId,
      name: formData.name,
      contactType: 'company',
      companyName: formData.name,
      vatNumber: formData.vatNumber,
      street: formData.street,
      number: formData.number,
      postalCode: formData.postalCode,
      city: formData.city,
      country: formData.country,
      phone: formData.telephone,
      gsm: '',
      email: formData.email,
      status: 'Active'
    });
    logApiCall('POST', '/api/mock/contacts', {
      ...newContact,
      legalName: formData.legalName,
      website: formData.website,
      peppolId: formData.peppolId,
      language: formData.language,
      kboNumber: formData.kboNumber,
      description: formData.description,
      evaluation: rating,
      evaluationNotes: formData.evaluationNotes
    });
    toast.success(t('createClientCompany.addedToContacts').replace('{name}', formData.name));
    resetAll();
    setTimeout(() => vatInputRef.current?.focus(), 100);
  };

  const handleDelete = () => {
    resetAll();
    setTimeout(() => vatInputRef.current?.focus(), 100);
  };

  const selectedHoofdtype = taxonomy.find((t) => t.id === formData.hoofdtypeId)?.hoofdtype || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b bg-background shrink-0">
          <h2 className="text-lg font-semibold">{t('createClientCompany.title')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('createClientCompany.subtitle')}
          </p>
        </div>

        {step === 1 ? (
        /* STEP 1: VAT Lookup */
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-5 overflow-auto">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-7 w-7 text-primary" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-semibold">{t('createClientCompany.lookupTitle')}</h3>
              <p className="text-sm text-muted-foreground max-w-sm text-balance">
                {t('createClientCompany.lookupDesc')}
              </p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('createClientCompany.vatNumber')}</Label>
                <Input ref={vatInputRef} placeholder={t('createClientCompany.vatPlaceholder')} value={vatInput} onChange={(e) => {
                setVatInput(e.target.value);
                setErrorMessage("");
                setLookupState("idle");
              }} onKeyDown={(e) => e.key === "Enter" && handleVatLookup()} className="text-center" />
              </div>

              {errorMessage &&
            <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
            }

              <Button onClick={handleVatLookup} disabled={lookupState === "loading" || !vatInput.trim()} className="w-full" size="sm">
                {lookupState === "loading" ?
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{t('createClientCompany.searching')}</> :
              <><Search className="h-3.5 w-3.5 mr-1.5" />{t('createClientCompany.lookupBtn')}</>
              }
              </Button>
            </div>

            <div className="w-full max-w-sm pt-4 border-t">
              <Button variant="ghost" onClick={handleSkipToManual} className="w-full text-primary" size="sm">
                {t('createClientCompany.skipManual')}
              </Button>
            </div>
          </div>) : (

        /* STEP 2: Details Form */
        <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 space-y-5">
              {/* Success banner */}
              {vatLookedUp &&
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {t('createClientCompany.companyFound')}
                  </p>
                </div>
            }

              {/* Section 1: Business Information */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createClientCompany.businessInfo')}</h4>
                
                {/* Row 1: Company Name + VAT */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.companyName')}</Label>
                    <Input value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder={t('createClientCompany.companyNamePlaceholder')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.vatLabel')}</Label>
                    <Input value={formatVatDisplay(formData.vatNumber)} onChange={(e) => setFormData((prev) => ({ ...prev, vatNumber: normalizeVatNumber(e.target.value) }))} placeholder={t('createClientCompany.vatPlaceholder')} />
                  </div>
                </div>

                {/* Row 2: KBO + Peppol */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.kboNumber')}</Label>
                    <Input value={formData.kboNumber} onChange={(e) => setFormData((prev) => ({ ...prev, kboNumber: e.target.value }))} placeholder={t('createClientCompany.kboPlaceholder')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.peppolId')}</Label>
                    <div className="flex gap-2">
                      <Input value={formData.peppolId} onChange={(e) => setFormData((prev) => ({ ...prev, peppolId: e.target.value }))} placeholder={t('createClientCompany.peppolPlaceholder')} className="flex-1" />
                      <Button type="button" variant="outline" size="sm" onClick={generatePeppolId}>
                        {t('createClientCompany.generate')}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Row 3: Street + House Number + Bus */}
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-3 space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.street')}</Label>
                    <Input value={formData.street} onChange={(e) => setFormData((prev) => ({ ...prev, street: e.target.value }))} placeholder={t('createClientCompany.streetPlaceholder')} />
                  </div>
                  <div className="col-span-1 space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.houseNumber')}</Label>
                    <Input value={formData.number} onChange={(e) => setFormData((prev) => ({ ...prev, number: e.target.value }))} placeholder={t('createClientCompany.houseNumberPlaceholder')} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.bus')}</Label>
                    <Input value={formData.bus} onChange={(e) => setFormData((prev) => ({ ...prev, bus: e.target.value }))} placeholder={t('createClientCompany.busPlaceholder')} />
                  </div>
                </div>

                {/* Row 4: Postal Code + City */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.postalCode')}</Label>
                    <Input value={formData.postalCode} onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))} placeholder={t('createClientCompany.postalCodePlaceholder')} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.city')}</Label>
                    <Input value={formData.city} onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))} placeholder={t('createClientCompany.cityPlaceholder')} />
                  </div>
                </div>

                {/* Row 5: Company Email + Country */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.companyEmail')}</Label>
                    <Input type="email" value={formData.companyEmail} onChange={(e) => setFormData((prev) => ({ ...prev, companyEmail: e.target.value }))} placeholder={t('createClientCompany.companyEmailPlaceholder')} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">{t('createClientCompany.country')}</Label>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground border-border">
                        {t('createClientCompany.headquarters')}
                      </Badge>
                    </div>
                    <Select value={formData.country} onValueChange={(v) => setFormData((prev) => ({ ...prev, country: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>



              {/* Section 3: Contact Information */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('createClientCompany.contactInfo')}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.phone')}</Label>
                    <Input value={formData.telephone} onChange={(e) => setFormData((prev) => ({ ...prev, telephone: e.target.value }))} placeholder={t('createClientCompany.phonePlaceholder')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.emailLabel')}</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} placeholder={t('createClientCompany.emailPlaceholder')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.websiteLabel')}</Label>
                    <Input value={formData.website} onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))} placeholder={t('createClientCompany.websitePlaceholder')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('createClientCompany.preferredLang')}</Label>
                    <Select value={formData.language} onValueChange={(v) => setFormData((prev) => ({ ...prev, language: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{t('createClientCompany.companyDesc')}</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder={t('createClientCompany.descPlaceholder')} rows={2} />
                </div>
              </section>
            </div>
          </div>)
        }

        {/* Footer */}
        {step === 2 &&
        <div className="flex items-center justify-between px-6 py-4 border-t bg-background shrink-0">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />{t('createClientCompany.back')}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t('createClientCompany.cancel')}</Button>
              <Button size="sm" onClick={handleSave}>{t('createClientCompany.save')}</Button>
            </div>
          </div>
        }
      </DialogContent>
    </Dialog>);
}
