/**
 * Add Person Dialog (+ Button / Contacts module context)
 * Single-section form: Profiel
 * Company-filtered subtypes based on selected company's main type
 */

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTaxonomyByContext, getAllContacts, createContact } from "@/lib/mockContactDB";
import { ContactType, Contact, COUNTRIES } from "@/types/contact";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { Upload, X, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

interface AddPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  fixedCompanyId?: string;
  fixedSubtype?: string;
}

const INTERNAL_COMPANIES = ['gdesign architecten', 'gdesign', '4takt'];

export function AddPersonDialog({
  open,
  onOpenChange,
  onSaved,
  fixedCompanyId,
  fixedSubtype
}: AddPersonDialogProps) {
  const { logApiCall } = useMockAuth();
  const { t } = useLanguage();
  const [taxonomy, setTaxonomy] = useState<ContactType[]>([]);
  const [companies, setCompanies] = useState<Contact[]>([]);
  const [subtypes, setSubtypes] = useState<string[]>([]);
  const [selectedHoofdtype, setSelectedHoofdtype] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    jobTitle: '',
    linkedCompanyId: '',
    contactSubtype: '',
    workEmail: '',
    gsm: '',
    phone: '',
    nationality: '',
    language: '',
    avatarUrl: null as string | null,
    street: '',
    number: '',
    bus: '',
    postalCode: '',
    city: '',
    country: 'Belgium'
  });

  useEffect(() => {
    if (open) {
      const allTaxonomy = getTaxonomyByContext('external');
      setTaxonomy(allTaxonomy);

      const allContacts = getAllContacts();
      const companyContacts = allContacts.filter(
        (c) => c.contactType === 'company' && !INTERNAL_COMPANIES.includes(c.name.toLowerCase())
      );
      setCompanies(companyContacts);
      resetForm();

      if (fixedCompanyId) {
        setFormData((prev) => ({ ...prev, linkedCompanyId: fixedCompanyId }));
        const company = allContacts.find((c) => c.id === fixedCompanyId);
        if (company) {
          const companyEntry = allTaxonomy.find((t) => t.id === company.hoofdtypeId);
          if (companyEntry) {
            const subs = allTaxonomy.
            filter((t) => t.hoofdtype === companyEntry.hoofdtype).
            map((t) => t.subtype);
            setSubtypes(subs);
            setSelectedHoofdtype(companyEntry.hoofdtype);
          }
        }
      }

      if (fixedSubtype) {
        setFormData((prev) => ({ ...prev, contactSubtype: fixedSubtype }));
      }
    }
  }, [open, fixedCompanyId, fixedSubtype]);

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', jobTitle: '',
      linkedCompanyId: fixedCompanyId || '', contactSubtype: fixedSubtype || '',
      workEmail: '', gsm: '', phone: '', nationality: '', language: '',
      avatarUrl: null,
      street: '', number: '', bus: '', postalCode: '', city: '', country: 'Belgium'
    });
    setSubtypes([]);
    setSelectedHoofdtype('');
  };

  const handleCompanyChange = (companyId: string) => {
    setFormData((prev) => ({ ...prev, linkedCompanyId: companyId, contactSubtype: '' }));

    const company = companies.find((c) => c.id === companyId);
    if (company) {
      const companyEntry = taxonomy.find((t) => t.id === company.hoofdtypeId);
      if (companyEntry) {
        const subs = taxonomy.
        filter((t) => t.hoofdtype === companyEntry.hoofdtype).
        map((t) => t.subtype);
        setSubtypes(subs);
        setSelectedHoofdtype(companyEntry.hoofdtype);
      }
    } else {
      setSubtypes([]);
      setSelectedHoofdtype('');
    }
  };

  const handleSave = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error(t('addPerson.firstLastRequired'));
      return;
    }
    if (!formData.linkedCompanyId) {
      toast.error(t('addPerson.selectCompany'));
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`;
    const linkedCompany = companies.find((c) => c.id === formData.linkedCompanyId);

    const taxonomyEntry = taxonomy.find(
      (t) => t.subtype === formData.contactSubtype && t.hoofdtype === selectedHoofdtype
    );

    const newContact = createContact({
      hoofdtypeId: taxonomyEntry?.id || '',
      subtypeId: taxonomyEntry?.id || '',
      name: fullName,
      contactType: 'individual',
      companyName: linkedCompany?.name,
      linkedCompanyId: formData.linkedCompanyId || undefined,
      vatNumber: '',
      street: formData.street,
      number: formData.number,
      postalCode: formData.postalCode,
      city: formData.city,
      country: formData.country,
      phone: formData.phone,
      gsm: formData.gsm,
      email: formData.workEmail,
      avatarUrl: formData.avatarUrl || undefined,
      status: 'Active'
    });

    logApiCall('POST', '/api/mock/contacts', {
      ...newContact,
      firstName: formData.firstName,
      lastName: formData.lastName,
      jobTitle: formData.jobTitle,
      nationality: formData.nationality,
      language: formData.language
    });

    toast.success(t('addPerson.addedToContacts').replace('{name}', fullName));
    onSaved();
    onOpenChange(false);
  };

  const getInitials = () => {
    if (!formData.firstName && !formData.lastName) return "??";
    return `${formData.firstName[0] || ""}${formData.lastName[0] || ""}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b bg-background shrink-0">
          <h2 className="text-lg font-semibold">{t('addPerson.title')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('addPerson.subtitle')}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-5">
            {/* Identity */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('addPerson.identity')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('addPerson.firstName')}</Label>
                  <Input value={formData.firstName} onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))} placeholder={t('addPerson.firstNamePlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('addPerson.lastName')}</Label>
                  <Input value={formData.lastName} onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))} placeholder={t('addPerson.lastNamePlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('addPerson.company')}</Label>
                  {fixedCompanyId ?
                  <Input value={companies.find((c) => c.id === fixedCompanyId)?.name || ''} disabled className="bg-muted" /> :
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={companySearch}
                        onChange={(e) => {
                          setCompanySearch(e.target.value);
                          if (!companyDropdownOpen) setCompanyDropdownOpen(true);
                          if (formData.linkedCompanyId) {
                            setFormData((prev) => ({ ...prev, linkedCompanyId: '', contactSubtype: '' }));
                            setSubtypes([]);
                            setSelectedHoofdtype('');
                          }
                        }}
                        onFocus={() => setCompanyDropdownOpen(true)}
                        onBlur={() => {
                          setTimeout(() => setCompanyDropdownOpen(false), 200);
                        }}
                        placeholder={t('addPerson.searchCompany')}
                        className="pl-8 h-9 text-sm" />

                      {formData.linkedCompanyId &&
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, linkedCompanyId: '', contactSubtype: '' }));
                          setCompanySearch('');
                          setSubtypes([]);
                          setSelectedHoofdtype('');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      }
                    </div>
                    {companyDropdownOpen && !formData.linkedCompanyId &&
                    <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {companies.
                      filter((c) => !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase())).
                      slice(0, 20).
                      map((c) =>
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          handleCompanyChange(c.id);
                          setCompanySearch(c.name);
                          setCompanyDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors",
                          formData.linkedCompanyId === c.id && "bg-primary/10 text-primary"
                        )}>
                              <span className="truncate">{c.name}</span>
                              {formData.linkedCompanyId === c.id && <Check className="h-3.5 w-3.5 shrink-0" />}
                            </button>
                      )}
                        {companies.filter((c) => !companySearch || c.name.toLowerCase().includes(companySearch.toLowerCase())).length === 0 &&
                      <p className="px-3 py-4 text-sm text-muted-foreground text-center">{t('addPerson.noCompaniesFound')}</p>
                      }
                      </div>
                    }
                  </div>
                  }
                </div>
              </div>
            </section>

            {/* Work Contact */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('addPerson.workContact')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('addPerson.workEmail')}</Label>
                  <Input type="email" value={formData.workEmail} onChange={(e) => setFormData((prev) => ({ ...prev, workEmail: e.target.value }))} placeholder={t('addPerson.emailPlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('addPerson.gsm')}</Label>
                  <Input value={formData.gsm} onChange={(e) => setFormData((prev) => ({ ...prev, gsm: e.target.value }))} placeholder={t('addPerson.gsmPlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('addPerson.phone')}</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} placeholder={t('addPerson.phonePlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('addPerson.nationality')}</Label>
                  <Select value={formData.nationality} onValueChange={(v) => setFormData((prev) => ({ ...prev, nationality: v }))}>
                    <SelectTrigger><SelectValue placeholder={t('addPerson.select')} /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('addPerson.language')}</Label>
                  <Select value={formData.language} onValueChange={(v) => setFormData((prev) => ({ ...prev, language: v }))}>
                    <SelectTrigger><SelectValue placeholder={t('addPerson.select')} /></SelectTrigger>
                    <SelectContent>
                      {['Nederlands', 'Frans', 'Engels', 'Duits'].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Profile Photo */}
            <section className="space-y-3">
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-background shrink-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t('addPerson.cancel')}</Button>
          <Button size="sm" onClick={handleSave}>{t('addPerson.save')}</Button>
        </div>
      </DialogContent>
    </Dialog>);
}
