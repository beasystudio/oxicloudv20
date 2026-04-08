/**
 * Contact Form Dialog Component
 * Add/Edit contact with all fields
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllTaxonomy, getHoofdtypes, getSubtypesByHoofdtype, createContact, updateContact, getAllContacts, getAllOrganizationalLabels, OrganizationalLabel } from "@/lib/mockContactDB";
import { Contact, ContactType, COUNTRIES } from "@/types/contact";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSaved: () => void;
}

export function ContactFormDialog({ open, onOpenChange, contact, onSaved }: ContactFormDialogProps) {
  const { t } = useLanguage();
  const { logApiCall } = useMockAuth();
  const [taxonomy, setTaxonomy] = useState<ContactType[]>([]);
  const [hoofdtypes, setHoofdtypes] = useState<string[]>([]);
  const [subtypes, setSubtypes] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Contact[]>([]);
  const [organizationalLabels, setOrganizationalLabels] = useState<OrganizationalLabel[]>([]);
  
  const [formData, setFormData] = useState({
    selectedHoofdtype: '',
    selectedSubtype: '',
    hoofdtypeId: '',
    subtypeId: '',
    name: '',
    contactType: 'company' as 'company' | 'individual',
    companyName: '',
    linkedCompanyId: '',
    vatNumber: '',
    street: '',
    number: '',
    postalCode: '',
    city: '',
    country: 'Belgium',
    phone: '',
    gsm: '',
    email: '',
    linkedProjectId: '',
    organizationalLabelId: '',
    status: 'Active' as 'Active' | 'Pending'
  });

  useEffect(() => {
    const tax = getAllTaxonomy();
    setTaxonomy(tax);
    setHoofdtypes(getHoofdtypes());
    setOrganizationalLabels(getAllOrganizationalLabels());
    
    const companyContacts = getAllContacts().filter(c => c.contactType === 'company');
    setCompanies(companyContacts);
  }, [open]);

  useEffect(() => {
    if (contact) {
      const entry = taxonomy.find(t => t.id === contact.hoofdtypeId);
      setFormData({
        selectedHoofdtype: entry?.hoofdtype || '',
        selectedSubtype: entry?.subtype || '',
        hoofdtypeId: contact.hoofdtypeId,
        subtypeId: contact.subtypeId,
        name: contact.name,
        contactType: contact.contactType,
        companyName: contact.companyName || '',
        linkedCompanyId: contact.linkedCompanyId || '',
        vatNumber: contact.vatNumber || '',
        street: contact.street,
        number: contact.number,
        postalCode: contact.postalCode,
        city: contact.city,
        country: contact.country,
        phone: contact.phone,
        gsm: contact.gsm,
        email: contact.email,
        linkedProjectId: contact.linkedProjectId || '',
        organizationalLabelId: contact.organizationalLabelId || '',
        status: contact.status
      });
      if (entry) {
        setSubtypes(getSubtypesByHoofdtype(entry.hoofdtype));
      }
    } else {
      setFormData({
        selectedHoofdtype: '',
        selectedSubtype: '',
        hoofdtypeId: '',
        subtypeId: '',
        name: '',
        contactType: 'company',
        companyName: '',
        linkedCompanyId: '',
        vatNumber: '',
        street: '',
        number: '',
        postalCode: '',
        city: '',
        country: 'Belgium',
        phone: '',
        gsm: '',
        email: '',
        linkedProjectId: '',
        organizationalLabelId: '',
        status: 'Active'
      });
      setSubtypes([]);
    }
  }, [contact, taxonomy]);

  const handleHoofdtypeChange = (value: string) => {
    const subs = getSubtypesByHoofdtype(value);
    setSubtypes(subs);
    setFormData({ ...formData, selectedHoofdtype: value, selectedSubtype: '', hoofdtypeId: '', subtypeId: '' });
  };

  const handleSubtypeChange = (value: string) => {
    const entry = taxonomy.find(t => t.hoofdtype === formData.selectedHoofdtype && t.subtype === value);
    setFormData({ 
      ...formData, 
      selectedSubtype: value, 
      hoofdtypeId: entry?.id || '',
      subtypeId: entry?.id || ''
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.hoofdtypeId) {
      toast.error(t('contactForm.fillRequired'));
      return;
    }

    const contactData = {
      hoofdtypeId: formData.hoofdtypeId,
      subtypeId: formData.subtypeId,
      name: formData.name,
      contactType: formData.contactType,
      companyName: formData.contactType === 'company' ? formData.companyName : undefined,
      linkedCompanyId: formData.contactType === 'individual' ? formData.linkedCompanyId : undefined,
      vatNumber: formData.contactType === 'company' ? formData.vatNumber : undefined,
      street: formData.street,
      number: formData.number,
      postalCode: formData.postalCode,
      city: formData.city,
      country: formData.country,
      phone: formData.phone,
      gsm: formData.gsm,
      email: formData.email,
      linkedProjectId: formData.linkedProjectId || undefined,
      organizationalLabelId: formData.organizationalLabelId || undefined,
      status: formData.status
    };

    if (contact) {
      updateContact(contact.id, contactData);
      toast.success(t('contactForm.contactUpdated'));
      logApiCall('PUT', '/api/mock/contacts/' + contact.id, contactData);
    } else {
      createContact(contactData as any);
      toast.success(t('contactForm.contactCreated'));
      logApiCall('POST', '/api/mock/contacts', contactData);
    }

    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b bg-background shrink-0">
          <h2 className="text-lg font-semibold">{contact ? t('contactForm.editContact') : t('contactForm.newContact')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {contact ? t('contactForm.updateDetails') : t('contactForm.createNew')}
          </p>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-5">
            {/* Contact Type */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('contactForm.contactTypeSection')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.mainType')}</Label>
                  <Select value={formData.selectedHoofdtype} onValueChange={handleHoofdtypeChange}>
                    <SelectTrigger><SelectValue placeholder={t('contactForm.select')} /></SelectTrigger>
                    <SelectContent>
                      {hoofdtypes.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.subtype')}</Label>
                  <Select value={formData.selectedSubtype} onValueChange={handleSubtypeChange} disabled={!formData.selectedHoofdtype}>
                    <SelectTrigger><SelectValue placeholder={!formData.selectedHoofdtype ? t('contactForm.selectFirst') : t('contactForm.select')} /></SelectTrigger>
                    <SelectContent>
                      {subtypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Identification */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('contactForm.identification')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.type')}</Label>
                  <Select value={formData.contactType} onValueChange={(value: 'company' | 'individual') => setFormData({ ...formData, contactType: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">{t('contactForm.companyType')}</SelectItem>
                      <SelectItem value="individual">{t('contactForm.individualType')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.name')}</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t('contactForm.namePlaceholder')} />
                </div>
              </div>

              {formData.contactType === 'company' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('contactForm.companyName')}</Label>
                    <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder={t('contactForm.companyNamePlaceholder')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('contactForm.vatNumber')}</Label>
                    <Input value={formData.vatNumber} onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })} placeholder={t('contactForm.vatPlaceholder')} />
                  </div>
                </div>
              )}

              {formData.contactType === 'individual' && (
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.linkedCompany')}</Label>
                  <Select value={formData.linkedCompanyId} onValueChange={(value) => setFormData({ ...formData, linkedCompanyId: value })}>
                    <SelectTrigger><SelectValue placeholder={t('contactForm.select')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('contactForm.none')}</SelectItem>
                      {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </section>

            {/* Address */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('contactForm.address')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.street')}</Label>
                  <Input value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} placeholder={t('contactForm.streetPlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.nr')}</Label>
                  <Input value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} placeholder={t('contactForm.nrPlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.postalCode')}</Label>
                  <Input value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} placeholder={t('contactForm.postalCodePlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.city')}</Label>
                  <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder={t('contactForm.cityPlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.country')}</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('contactForm.contactDetails')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.phone')}</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder={t('contactForm.phonePlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.gsm')}</Label>
                  <Input value={formData.gsm} onChange={(e) => setFormData({ ...formData, gsm: e.target.value })} placeholder={t('contactForm.gsmPlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.emailLabel')}</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={t('contactForm.emailPlaceholder')} />
                </div>
              </div>
            </section>

            {/* Organization & Status */}
            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('contactForm.orgAndStatus')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.orgLabel')}</Label>
                  <Select value={formData.organizationalLabelId} onValueChange={(value) => setFormData({ ...formData, organizationalLabelId: value })}>
                    <SelectTrigger><SelectValue placeholder={t('contactForm.select')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('contactForm.none')}</SelectItem>
                      {organizationalLabels.map(label => <SelectItem key={label.id} value={label.id}>{label.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t('contactForm.statusLabel')}</Label>
                  <Select value={formData.status} onValueChange={(value: 'Active' | 'Pending') => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">{t('contactForm.statusActive')}</SelectItem>
                      <SelectItem value="Pending">{t('contactForm.statusPending')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-background shrink-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t('contactForm.cancelBtn')}</Button>
          <Button size="sm" onClick={handleSave}>{contact ? t('contactForm.updateBtn') : t('contactForm.createBtn')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
