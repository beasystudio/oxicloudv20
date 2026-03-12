import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User } from 'lucide-react';
import { toast } from 'sonner';
import { getPilotContacts, getPilotCompany, addPilotContact, PilotContact } from '@/lib/pilotSessionStore';
import { getPilotTaxonomy } from '@/lib/mockContactDB';
import { useLanguage } from '@/i18n/LanguageContext';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const NATIONALITIES = ['Belgisch', 'Nederlands', 'Frans', 'Duits', 'Brits', 'Amerikaans', 'Overig'];
const LANGUAGES = ['Nederlands', 'Frans', 'Engels', 'Duits'];

export function PilotAddPersonDialog({ open, onOpenChange, onSaved }: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', function: '', companyId: '', contactSubtype: '',
    email: '', mobile: '', phone: '', nationality: '', language: 'Nederlands',
    street: '', number: '', bus: '', postalCode: '', city: '', country: 'Belgium',
  });

  const getAvailableCompanies = () => {
    const ownCompany = getPilotCompany();
    const contacts = getPilotContacts();
    const companies: { id: string; name: string; contactType?: string }[] = [];
    contacts
      .filter(c => c.type === 'company')
      .forEach(c => {
        if (ownCompany && c.companyName === ownCompany.name) return;
        companies.push({ id: c.id, name: c.companyName || 'Unnamed', contactType: c.contactType });
      });
    return companies;
  };

  const getSubtypesForCompany = (companyId: string) => {
    const companies = getAvailableCompanies();
    const company = companies.find(c => c.id === companyId);
    if (!company || !company.contactType) return [];
    const taxonomy = getPilotTaxonomy();
    let hoofdtype = '';
    const isHoofdtype = taxonomy.some(t => t.hoofdtype === company.contactType);
    if (isHoofdtype) {
      hoofdtype = company.contactType!;
    } else {
      const entry = taxonomy.find(t => t.subtype === company.contactType);
      if (entry) hoofdtype = entry.hoofdtype;
    }
    if (!hoofdtype) return [];
    return [...new Set(taxonomy.filter(t => t.hoofdtype === hoofdtype).map(t => t.subtype))];
  };

  useEffect(() => {
    if (open) {
      setActiveTab('profile');
      setPhotoPreview(null);
      setForm({
        firstName: '', lastName: '', function: '', companyId: '', contactSubtype: '',
        email: '', mobile: '', phone: '', nationality: '', language: 'Nederlands',
        street: '', number: '', bus: '', postalCode: '', city: '', country: 'Belgium',
      });
    }
  }, [open]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('pilot.dialogs.photoTooLarge'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!form.firstName.trim()) { toast.error(t('pilot.dialogs.firstNameRequired')); return; }
    if (!form.lastName.trim()) { toast.error(t('pilot.dialogs.lastNameRequired')); return; }
    if (!form.companyId) { toast.error(t('pilot.dialogs.companyRequired')); return; }
    if (!form.contactSubtype) { toast.error(t('pilot.dialogs.contactTypeRequired')); return; }
    if (!form.email.trim()) { toast.error(t('pilot.dialogs.emailRequired')); return; }

    addPilotContact({
      type: 'person',
      firstName: form.firstName,
      lastName: form.lastName,
      function: form.function,
      companyId: form.companyId,
      companyName: getAvailableCompanies().find(c => c.id === form.companyId)?.name,
      contactType: form.contactSubtype,
      email: form.email,
      phone: form.phone,
      mobile: form.mobile,
      street: form.street,
      number: form.number,
      postalCode: form.postalCode,
      city: form.city,
      country: form.country,
    });

    toast.success(`${form.firstName} ${form.lastName} ${t('pilot.dialogs.personAddedToContacts')}`);
    onSaved?.();
    onOpenChange(false);
  };

  const companies = getAvailableCompanies();
  const subtypes = form.companyId ? getSubtypesForCompany(form.companyId) : [];
  const initials = [form.firstName?.[0], form.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-lg font-semibold">{t('pilot.dialogs.addPerson')}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t('pilot.dialogs.addPersonDesc')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-2 shrink-0">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">{t('pilot.dialogs.profile')}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="flex-1 overflow-y-auto m-0 px-6 py-4">
          <div className="space-y-5">
              {/* Identity */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.identity')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.firstName')} *</Label>
                    <Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder={`(${t('pilot.dialogs.firstName').toLowerCase()})`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.lastName')} *</Label>
                    <Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder={`(${t('pilot.dialogs.lastName').toLowerCase()})`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.company')} *</Label>
                    <Select value={form.companyId} onValueChange={(val) => setForm(p => ({ ...p, companyId: val, contactSubtype: '' }))}>
                      <SelectTrigger><SelectValue placeholder={t('pilot.dialogs.selectCompany')} /></SelectTrigger>
                      <SelectContent>
                        {companies.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.contactTypeLabel')} *</Label>
                    <Select value={form.contactSubtype} onValueChange={(val) => setForm(p => ({ ...p, contactSubtype: val }))} disabled={!form.companyId}>
                      <SelectTrigger><SelectValue placeholder={form.companyId ? t('pilot.dialogs.selectContactType') : t('pilot.dialogs.chooseCompanyFirst')} /></SelectTrigger>
                      <SelectContent>
                        {subtypes.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.companyId && subtypes.length === 0 && (
                      <p className="text-xs text-muted-foreground">{t('pilot.dialogs.noSubtypesFound')}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Business Contact */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.businessContact')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.emailBusiness')} *</Label>
                    <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder={`(${t('pilot.dialogs.emailBusiness').toLowerCase()})`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.mobile')}</Label>
                    <Input type="tel" value={form.mobile} onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))} placeholder={`(${t('pilot.dialogs.mobile').toLowerCase()})`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.telephone')}</Label>
                    <Input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder={`(${t('pilot.dialogs.telephone').toLowerCase()})`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.nationality')}</Label>
                    <Select value={form.nationality} onValueChange={(val) => setForm(p => ({ ...p, nationality: val }))}>
                      <SelectTrigger><SelectValue placeholder={t('pilot.dialogs.select')} /></SelectTrigger>
                      <SelectContent>
                        {NATIONALITIES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('pilot.dialogs.language')}</Label>
                    <Select value={form.language} onValueChange={(val) => setForm(p => ({ ...p, language: val }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Profile Photo */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.profilePhoto')}</h4>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    {photoPreview ? (
                      <AvatarImage src={photoPreview} alt="Preview" />
                    ) : (
                      <AvatarFallback className="bg-muted text-muted-foreground text-lg">{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-medium">
                        <Upload className="h-4 w-4" />
                        {t('pilot.dialogs.uploadPhoto')}
                      </div>
                    </label>
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <p className="text-xs text-muted-foreground mt-1">{t('pilot.dialogs.maxFileSize')}</p>
                  </div>
                  {photoPreview && (
                    <Button variant="ghost" size="sm" onClick={() => setPhotoPreview(null)} className="text-xs text-destructive">
                      {t('pilot.dialogs.remove')}
                    </Button>
                  )}
                </div>
              </section>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-background shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('pilot.dialogs.cancel')}</Button>
          <Button onClick={handleSave}>{t('pilot.dialogs.save')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
