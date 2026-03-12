import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { addPilotEmployee, updatePilotEmployee, updatePilotUser, PilotEmployee } from '@/lib/pilotSessionStore';
import { COUNTRIES, LANGUAGES } from '@/types/user';
import { useLanguage } from '@/i18n/LanguageContext';

interface CompanyOption {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  onSaved: () => void;
  editEmployee?: PilotEmployee | null;
  availableCompanies?: CompanyOption[];
  allEmployees?: PilotEmployee[];
  consultantSubtypes?: string[];
}

type TabType = 'profile' | 'private' | 'access';

export function PilotAddEmployeeDialog({
  open, onOpenChange, companyId, companyName, onSaved, editEmployee,
  availableCompanies = [], allEmployees = [], consultantSubtypes = ['Architect'],
}: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const isOwnerEdit = editEmployee?.id === 'owner';

  const defaultForm = {
    firstName: '', lastName: '', functie: '', employeeType: 'employee' as 'employee' | 'freelancer',
    workEmail: '', gsm: '', phone: '', nationality: '', language: 'NL',
    startDate: null as Date | null, isEmployee: true,
    street: '', number: '', bus: '', postalCode: '', city: '', country: '',
    personalEmail: '', personalPhone: '', nationalNumber: '', birthdate: null as Date | null,
    contractType: 'Standard User', password: '',
    settingsAccess: false, emailAccess: false, financialAccess: false,
    selectedCompanyId: companyId,
    contactSubtype: 'Architect',
  };

  const [form, setForm] = useState(defaultForm);

  const selectedCompanyHasArchitect = allEmployees.some(
    emp => emp.companyId === form.selectedCompanyId && emp.contactSubtype === 'Architect'
  );

  const availableSubtypes = (isOwnerEdit || selectedCompanyHasArchitect)
    ? consultantSubtypes
    : ['Architect'];

  useEffect(() => {
    if (open) {
      setActiveTab('profile');
      if (editEmployee) {
        const isOwner = editEmployee.id === 'owner';
        setForm({
          ...defaultForm,
          firstName: editEmployee.firstName || '',
          lastName: editEmployee.lastName || '',
          functie: editEmployee.function || '',
          employeeType: editEmployee.employeeType || 'employee',
          workEmail: editEmployee.email || '',
          gsm: editEmployee.mobile || '',
          phone: editEmployee.phone || '',
          contractType: isOwner ? 'Power User' : defaultForm.contractType,
          settingsAccess: isOwner ? true : defaultForm.settingsAccess,
          financialAccess: isOwner ? true : defaultForm.financialAccess,
          emailAccess: isOwner ? true : defaultForm.emailAccess,
          selectedCompanyId: editEmployee.companyId || companyId,
          contactSubtype: editEmployee.contactSubtype || editEmployee.function || 'Architect',
        });
      } else {
        setForm({ ...defaultForm, selectedCompanyId: companyId, contactSubtype: 'Architect' });
      }
    }
  }, [open, editEmployee]);

  useEffect(() => {
    if (!isOwnerEdit && !editEmployee) {
      const hasArchitect = allEmployees.some(
        emp => emp.companyId === form.selectedCompanyId && emp.contactSubtype === 'Architect'
      );
      if (!hasArchitect) {
        setForm(p => ({ ...p, contactSubtype: 'Architect' }));
      }
    }
  }, [form.selectedCompanyId]);

  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.workEmail) {
      toast.error(t('pilot.dialogs.fillRequired'));
      setActiveTab('profile');
      return;
    }
    if (editEmployee) {
      if (editEmployee.id === 'owner') {
        updatePilotUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.workEmail,
          phone: form.phone,
        });
        const existingOwnerEmp = allEmployees.find(e => e.id === 'owner-function');
        if (existingOwnerEmp) {
          updatePilotEmployee('owner-function', { contactSubtype: form.contactSubtype, function: form.functie });
        } else {
          addPilotEmployee({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.workEmail,
            phone: form.phone,
            mobile: '',
            function: form.functie,
            contactSubtype: form.contactSubtype,
            employeeType: 'employee',
            companyId: form.selectedCompanyId,
          });
        }
      } else {
        updatePilotEmployee(editEmployee.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.workEmail,
          phone: form.phone,
          mobile: form.gsm,
          function: form.functie,
          contactSubtype: form.contactSubtype,
          employeeType: form.employeeType,
          companyId: form.selectedCompanyId,
        });
      }
      toast.success(t('pilot.dialogs.userUpdated'));
    } else {
      addPilotEmployee({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.workEmail,
        phone: form.phone,
        mobile: form.gsm,
        function: form.functie,
        contactSubtype: form.contactSubtype,
        employeeType: form.employeeType,
        companyId: form.selectedCompanyId,
      });
      toast.success(t('pilot.dialogs.userCreated'));
    }
    onSaved();
    onOpenChange(false);
  };

  const getInitials = () => {
    if (!form.firstName && !form.lastName) return '??';
    return `${form.firstName[0] || ''}${form.lastName[0] || ''}`.toUpperCase();
  };

  const selectedCompanyName = availableCompanies.find(c => c.id === form.selectedCompanyId)?.name || companyName;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'profile', label: t('pilot.dialogs.profileTab') },
    { id: 'private', label: t('pilot.dialogs.privateTab') },
    { id: 'access', label: t('pilot.dialogs.accessTab') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b bg-background shrink-0">
          <h2 className="text-lg font-semibold">{editEmployee ? t('pilot.dialogs.editUser') : t('pilot.dialogs.newUser')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('pilot.dialogs.manageUserDesc')}
          </p>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-5">
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <>
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.identitySection')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.firstName')} *</Label>
                      <Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder={`(${t('pilot.dialogs.firstName').toLowerCase()})`} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.lastName')} *</Label>
                      <Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder={`(${t('pilot.dialogs.lastName').toLowerCase()})`} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.employeeType')} *</Label>
                      <Select value={form.employeeType} onValueChange={v => setForm(p => ({ ...p, employeeType: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">{t('pilot.dialogs.employee')}</SelectItem>
                          <SelectItem value="freelancer">{t('pilot.dialogs.freelancer')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.firm')} *</Label>
                      {availableCompanies.length > 1 && !isOwnerEdit ? (
                        <Select value={form.selectedCompanyId} onValueChange={v => setForm(p => ({ ...p, selectedCompanyId: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {availableCompanies.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input value={selectedCompanyName} readOnly className="bg-muted/50" />
                      )}
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.contactTypeSection')} *</Label>
                      <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 mb-1.5">
                        <span className="text-[11px] text-muted-foreground">{t('pilot.dialogs.mainTypeLabel')}</span>
                        <span className="text-xs font-medium">{t('pilot.dialogs.consultant')}</span>
                      </div>
                      <Select
                        value={form.contactSubtype}
                        onValueChange={v => setForm(p => ({ ...p, contactSubtype: v }))}
                      >
                        <SelectTrigger><SelectValue placeholder={`(${t('pilot.dialogs.select').toLowerCase()})`} /></SelectTrigger>
                        <SelectContent>
                          {availableSubtypes.map(st => (
                            <SelectItem key={st} value={st}>{st}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!selectedCompanyHasArchitect && !isOwnerEdit && (
                        <p className="text-[11px] text-destructive/80">
                          {t('pilot.dialogs.architectFirst')}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.businessContactSection')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.emailWork')} *</Label>
                      <Input type="email" value={form.workEmail} onChange={e => setForm(p => ({ ...p, workEmail: e.target.value }))} placeholder={`(${t('pilot.dialogs.emailWork').toLowerCase()})`} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.gsm')}</Label>
                      <Input value={form.gsm} onChange={e => setForm(p => ({ ...p, gsm: e.target.value }))} placeholder={`(${t('pilot.dialogs.gsm').toLowerCase()})`} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.phoneNr')}</Label>
                      <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder={`(${t('pilot.dialogs.phoneNr').toLowerCase()})`} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.nationality')}</Label>
                      <Select value={form.nationality} onValueChange={v => setForm(p => ({ ...p, nationality: v }))}>
                        <SelectTrigger><SelectValue placeholder={`(${t('pilot.dialogs.select').toLowerCase()})`} /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.language')}</Label>
                      <Select value={form.language} onValueChange={v => setForm(p => ({ ...p, language: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.startDate')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !form.startDate && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.startDate ? format(form.startDate, 'dd/MM/yyyy') : t('pilot.dialogs.selectDate')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={form.startDate || undefined} onSelect={d => setForm(p => ({ ...p, startDate: d || null }))} initialFocus className="pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 pt-1">
                    <Checkbox id="isEmp" checked={form.isEmployee} onCheckedChange={c => setForm(p => ({ ...p, isEmployee: c as boolean }))} />
                    <div>
                      <Label htmlFor="isEmp" className="cursor-pointer text-xs">{t('pilot.dialogs.worksAsEmployee')}</Label>
                      <p className="text-[11px] text-muted-foreground">{t('pilot.dialogs.employeeCheckDesc')}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.profilePhotoSection')}</h4>
                  <div className="rounded-lg border-muted-foreground/25 p-5 border border-dotted">
                    <div className="flex items-center gap-5">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm"><Upload className="h-3.5 w-3.5 mr-1.5" />{t('pilot.dialogs.uploadPhotoBtn')}</Button>
                        <p className="text-[11px] text-muted-foreground mt-1.5">{t('pilot.dialogs.photoDesc')}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* TAB 2: PRIVATE */}
            {activeTab === 'private' && (
              <>
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.homeAddress')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-xs">{t('pilot.dialogs.street')}</Label><Input value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">{t('pilot.dialogs.nr')}</Label><Input value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">{t('pilot.dialogs.bus')}</Label><Input value={form.bus} onChange={e => setForm(p => ({ ...p, bus: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">{t('pilot.dialogs.postalCode')}</Label><Input value={form.postalCode} onChange={e => setForm(p => ({ ...p, postalCode: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">{t('pilot.dialogs.city')}</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">{t('pilot.dialogs.country')}</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} /></div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.privateContact')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-xs">{t('pilot.dialogs.privateEmail')}</Label><Input type="email" value={form.personalEmail} onChange={e => setForm(p => ({ ...p, personalEmail: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">{t('pilot.dialogs.privateTel')}</Label><Input value={form.personalPhone} onChange={e => setForm(p => ({ ...p, personalPhone: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">{t('pilot.dialogs.nationalNumber')}</Label><Input value={form.nationalNumber} onChange={e => setForm(p => ({ ...p, nationalNumber: e.target.value }))} /></div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.birthdate')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !form.birthdate && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.birthdate ? format(form.birthdate, 'dd/MM/yyyy') : t('pilot.dialogs.selectDate')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={form.birthdate || undefined} onSelect={d => setForm(p => ({ ...p, birthdate: d || null }))} initialFocus className="pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* TAB 3: ACCESS */}
            {activeTab === 'access' && (
              <>
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.userType')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.userTypeLabel')}</Label>
                      <Select value={isOwnerEdit ? 'Power User' : form.contractType} onValueChange={v => setForm(p => ({ ...p, contractType: v }))} disabled={isOwnerEdit}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Power User">Power User</SelectItem>
                          <SelectItem value="Standard User">Standard User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.loginEmail')}</Label>
                      <Input value={form.workEmail} readOnly className="bg-muted/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('pilot.dialogs.password')}</Label>
                      <Input type="password" placeholder={t('pilot.dialogs.setPassword')} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('pilot.dialogs.permissions')}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-xs font-medium">{t('pilot.dialogs.myProjectsOnly')}</p>
                        <p className="text-[11px] text-muted-foreground">{t('pilot.dialogs.myProjectsOnlyDesc')}</p>
                      </div>
                      <Switch checked={isOwnerEdit ? true : form.emailAccess} onCheckedChange={c => setForm(p => ({ ...p, emailAccess: c }))} disabled={isOwnerEdit} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-xs font-medium">{t('pilot.dialogs.settingsAccess')}</p>
                        <p className="text-[11px] text-muted-foreground">{t('pilot.dialogs.settingsAccessDesc')}</p>
                      </div>
                      <Switch checked={isOwnerEdit ? true : form.settingsAccess} onCheckedChange={c => setForm(p => ({ ...p, settingsAccess: c }))} disabled={isOwnerEdit} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-xs font-medium">{t('pilot.dialogs.financialAccess')}</p>
                        <p className="text-[11px] text-muted-foreground">{t('pilot.dialogs.financialAccessDesc')}</p>
                      </div>
                      <Switch checked={isOwnerEdit ? true : form.financialAccess} onCheckedChange={c => setForm(p => ({ ...p, financialAccess: c }))} disabled={isOwnerEdit} />
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-background shrink-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t('pilot.dialogs.cancel')}</Button>
          <Button size="sm" onClick={handleSave}>{t('pilot.dialogs.save')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
