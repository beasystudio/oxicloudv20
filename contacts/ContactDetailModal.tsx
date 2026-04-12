import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X, Phone, Mail, Plus, Trash2, Search, Building2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

export interface ContactAddress {
  id: string;
  name: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  tag: string;
}

export interface RelatedContact {
  id: string;
  name: string;
  function: string;
  email: string;
  gsm: string;
}

export interface ContactData {
  id: string;
  name: string;
  company: string;
  email: string;
  mobilePhone: string;
  workPhone: string;
  homePhone: string;
  isCompany?: boolean;
  contactCategory?: string;
  companyId?: string;
  vatNumber?: string;
  kboNumber?: string;
  peppolId?: string;
  website?: string;
  city?: string;
  contactType?: string;
  monitoring?: boolean;
  billingStreet?: string;
  billingNumber?: string;
  billingPostalCode?: string;
  billingCity?: string;
  billingAddress?: string;
  billingCountry?: string;
  internalNotes?: string;
  addresses?: ContactAddress[];
  relatedContacts?: RelatedContact[];
  firstName?: string;
  lastName?: string;
  function?: string;
  nationalNumber?: string;
  companyNo?: string;
  role?: string;
  category?: string;
  projectReference?: string;
  notes?: string;
  contactTypes?: string[];
}

interface ContactDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: ContactData | null;
  onContactUpdated?: (contact: ContactData) => void;
}

const CONTACT_TYPE_KEYS: Record<string, string> = {
  'Aannemers': 'contactDetail.ctAannemers',
  'Advies': 'contactDetail.ctAdvies',
  'Algemeen': 'contactDetail.ctAlgemeen',
  'Klanten bedrijf': 'contactDetail.ctKlantenBedrijf',
  'Klanten particulier': 'contactDetail.ctKlantenParticulier',
  'Materialen': 'contactDetail.ctMaterialen',
  'Openbare Instellingen': 'contactDetail.ctOpenbareInstellingen',
  'Promotor': 'contactDetail.ctPromotor',
  'Prospect': 'contactDetail.ctProspect',
  'Studiebureau': 'contactDetail.ctStudiebureau',
};

const CONTACT_TYPES = [
  'Aannemers', 'Advies', 'Algemeen', 'Klanten bedrijf', 'Klanten particulier',
  'Materialen', 'Openbare Instellingen', 'Promotor', 'Prospect', 'Studiebureau',
];

const ADDRESS_TAGS = ['Billing', 'Delivery', 'Branch', 'Warehouse', 'Office'];
const MAX_NOTES_LENGTH = 500;

export const ContactDetailModal = ({ open, onOpenChange, contact, onContactUpdated }: ContactDetailModalProps) => {
  const { t } = useLanguage();
  const [editedContact, setEditedContact] = useState<ContactData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (contact) {
      setEditedContact({
        ...contact,
        addresses: contact.addresses || [],
        relatedContacts: contact.relatedContacts || [],
      });
      setIsEditing(false);
      setHasChanges(false);
    }
  }, [contact]);

  if (!editedContact) return null;

  const getInitials = () => {
    if (editedContact.isCompany) {
      return (editedContact.company || editedContact.name)?.substring(0, 2).toUpperCase() || 'CO';
    }
    const nameParts = editedContact.name?.split(' ') || [];
    const first = nameParts[0] || '';
    const last = nameParts.slice(-1)[0] || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'NA';
  };

  const displayName = editedContact.isCompany ? (editedContact.company || editedContact.name) : (editedContact.name || editedContact.company);

  const updateField = (field: keyof ContactData, value: any) => {
    setEditedContact(prev => prev ? { ...prev, [field]: value } : null);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (editedContact && onContactUpdated) {
      onContactUpdated(editedContact);
      toast.success(t('contactDetail.contactUpdated'));
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    if (contact) {
      setEditedContact({ ...contact });
    }
    setIsEditing(false);
    setHasChanges(false);
    onOpenChange(false);
  };

  const handlePhoneClick = (phone: string) => {
    if (phone) window.open(`tel:${phone}`, '_self');
  };

  const handleEmailClick = (email: string) => {
    if (email) window.open(`mailto:${email}`, '_self');
  };

  const addAddress = () => {
    const newAddress: ContactAddress = {
      id: crypto.randomUUID(),
      name: '',
      street: '',
      number: '',
      postalCode: '',
      city: '',
      tag: 'Office',
    };
    updateField('addresses', [...(editedContact.addresses || []), newAddress]);
  };

  const updateAddress = (id: string, field: keyof ContactAddress, value: string) => {
    const updated = (editedContact.addresses || []).map(addr =>
      addr.id === id ? { ...addr, [field]: value } : addr
    );
    updateField('addresses', updated);
  };

  const removeAddress = (id: string) => {
    updateField('addresses', (editedContact.addresses || []).filter(addr => addr.id !== id));
  };

  const notesRemaining = MAX_NOTES_LENGTH - (editedContact.internalNotes?.length || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden gap-0">
        {/* Green Header */}
        <div className="bg-primary px-6 py-4 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary-foreground/30">
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-lg font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-primary-foreground">{displayName}</h2>
              {editedContact.contactType && (
                <Badge variant="secondary" className="mt-1 bg-primary-foreground/20 text-primary-foreground border-0">
                  {CONTACT_TYPE_KEYS[editedContact.contactType] ? t(CONTACT_TYPE_KEYS[editedContact.contactType]) : editedContact.contactType}
                </Badge>
              )}
            </div>
            {hasChanges && (
              <Button onClick={handleSave} variant="secondary" size="sm">
                {t('contactDetail.saveChanges')}
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-4 px-6 py-3 border-b bg-muted/30">
          <button
            onClick={() => handlePhoneClick(editedContact.workPhone || editedContact.mobilePhone || '')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={!editedContact.workPhone && !editedContact.mobilePhone}
          >
            <Phone className="h-4 w-4" />
            <span>{t('contactDetail.call')}</span>
          </button>
          <button
            onClick={() => handleEmailClick(editedContact.email || '')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={!editedContact.email}
          >
            <Mail className="h-4 w-4" />
            <span>{t('contactDetail.sendMessage')}</span>
          </button>
          <div className="flex-1" />
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {t('contactDetail.editContact')}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              {t('contactDetail.cancel')}
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Main Info Section */}
            <section className="grid grid-cols-2 gap-x-8 gap-y-4">
              {editedContact.isCompany ? (
                <>
                  <FieldInput label={t('contactDetail.companyName')} value={editedContact.company || editedContact.name} onChange={v => updateField('company', v)} readOnly={!isEditing} required />
                  <FieldInput label={t('contactDetail.vatNumber')} value={editedContact.vatNumber} onChange={v => updateField('vatNumber', v)} readOnly={!isEditing} placeholder="BE0XXX.XXX.XXX" />
                  <FieldInput label={t('contactDetail.kbo')} value={editedContact.kboNumber} onChange={v => updateField('kboNumber', v)} readOnly={!isEditing} />
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{t('contactDetail.peppolId')}</Label>
                    {isEditing ? (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={editedContact.peppolId || ''} onChange={e => updateField('peppolId', e.target.value)} className="pl-9" placeholder={t('contactDetail.searchPeppol')} />
                      </div>
                    ) : (
                      <div className="text-sm py-2">{editedContact.peppolId || '-'}</div>
                    )}
                  </div>
                  <FieldInput label={t('contactDetail.website')} value={editedContact.website} onChange={v => updateField('website', v)} readOnly={!isEditing} placeholder="https://" />
                </>
              ) : (
                <>
                  <FieldInput label={t('contactDetail.firstName')} value={editedContact.firstName || editedContact.name?.split(' ')[0]} onChange={v => updateField('firstName', v)} readOnly={!isEditing} />
                  <FieldInput label={t('contactDetail.lastName')} value={editedContact.lastName || editedContact.name?.split(' ').slice(1).join(' ')} onChange={v => updateField('lastName', v)} readOnly={!isEditing} />
                  <FieldInput label={t('contactDetail.company')} value={editedContact.company} onChange={v => updateField('company', v)} readOnly={true} />
                </>
              )}

              <FieldInput label={t('contactDetail.email')} value={editedContact.email} onChange={v => updateField('email', v)} readOnly={!isEditing} required />
              <FieldInput label={t('contactDetail.telephone')} value={editedContact.workPhone} onChange={v => updateField('workPhone', v)} readOnly={!isEditing} />
              {!editedContact.isCompany && (
                <FieldInput label={t('contactDetail.mobile')} value={editedContact.mobilePhone} onChange={v => updateField('mobilePhone', v)} readOnly={!isEditing} />
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">{t('contactDetail.contactType')} <span className="text-destructive">*</span></Label>
                {isEditing ? (
                  <Select value={editedContact.contactType || ''} onValueChange={v => updateField('contactType', v)}>
                    <SelectTrigger><SelectValue placeholder={t('contactDetail.selectType')} /></SelectTrigger>
                    <SelectContent>
                      {CONTACT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {CONTACT_TYPE_KEYS[type] ? t(CONTACT_TYPE_KEYS[type]) : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm py-2">
                    {editedContact.contactType ? (
                      <Badge variant="outline">
                        {CONTACT_TYPE_KEYS[editedContact.contactType] ? t(CONTACT_TYPE_KEYS[editedContact.contactType]) : editedContact.contactType}
                      </Badge>
                    ) : '-'}
                  </div>
                )}
              </div>

              {editedContact.isCompany && (
                <div className="flex items-center gap-3 col-span-2 pt-2">
                  <Checkbox id="monitoring" checked={editedContact.monitoring || false} onCheckedChange={checked => updateField('monitoring', checked)} disabled={!isEditing} />
                  <Label htmlFor="monitoring" className="text-sm font-normal cursor-pointer">{t('contactDetail.monitoring')}</Label>
                </div>
              )}
            </section>

            <Separator />

            {/* Billing Address - Company only */}
            {editedContact.isCompany && (
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-4">{t('contactDetail.billingAddress')}</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <FieldInput label={t('contactDetail.street')} value={editedContact.billingStreet || editedContact.billingAddress} onChange={v => updateField('billingStreet', v)} readOnly={!isEditing} />
                  <FieldInput label={t('contactDetail.number')} value={editedContact.billingNumber} onChange={v => updateField('billingNumber', v)} readOnly={!isEditing} />
                  <FieldInput label={t('contactDetail.postalCode')} value={editedContact.billingPostalCode} onChange={v => updateField('billingPostalCode', v)} readOnly={!isEditing} />
                  <FieldInput label={t('contactDetail.city')} value={editedContact.billingCity} onChange={v => updateField('billingCity', v)} readOnly={!isEditing} />
                </div>
              </section>
            )}

            <Separator />

            {/* Notes */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4">{t('contactDetail.info')}</h3>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">{t('contactDetail.internalNotes')}</Label>
                {isEditing ? (
                  <div>
                    <Textarea
                      value={editedContact.internalNotes || ''}
                      onChange={e => updateField('internalNotes', e.target.value.slice(0, MAX_NOTES_LENGTH))}
                      className="min-h-[100px] resize-none"
                      placeholder={t('contactDetail.addNotes')}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {notesRemaining} {t('contactDetail.charactersRemaining')}
                    </p>
                  </div>
                ) : (
                  <div className="text-sm py-2 min-h-[60px] whitespace-pre-wrap">
                    {editedContact.internalNotes || <span className="text-muted-foreground italic">{t('contactDetail.noNotes')}</span>}
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Addresses Section - Company only */}
            {editedContact.isCompany && (
              <>
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">{t('contactDetail.branchesAddresses')}</h3>
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={addAddress}>
                        <Plus className="h-4 w-4 mr-1" />
                        {t('contactDetail.addAddress')}
                      </Button>
                    )}
                  </div>
                  {(editedContact.addresses?.length || 0) > 0 ? (
                    <div className="space-y-3">
                      {editedContact.addresses?.map(addr => (
                        <div key={addr.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                          <Building2 className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                          {isEditing ? (
                            <div className="flex-1 grid grid-cols-6 gap-2">
                              <Input value={addr.name} onChange={e => updateAddress(addr.id, 'name', e.target.value)} placeholder={t('contactForm.name')} className="col-span-2" />
                              <Input value={addr.street} onChange={e => updateAddress(addr.id, 'street', e.target.value)} placeholder={t('contactDetail.street')} className="col-span-2" />
                              <Input value={addr.number} onChange={e => updateAddress(addr.id, 'number', e.target.value)} placeholder="Nr" className="col-span-1" />
                              <Select value={addr.tag} onValueChange={v => updateAddress(addr.id, 'tag', v)}>
                                <SelectTrigger className="col-span-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {ADDRESS_TAGS.map(tag => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Input value={addr.postalCode} onChange={e => updateAddress(addr.id, 'postalCode', e.target.value)} placeholder={t('contactDetail.postalCode')} className="col-span-1" />
                              <Input value={addr.city} onChange={e => updateAddress(addr.id, 'city', e.target.value)} placeholder={t('contactDetail.city')} className="col-span-2" />
                              <Button variant="ghost" size="icon" className="col-span-1 h-9" onClick={() => removeAddress(addr.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{addr.name || t('contactDetail.unnamed')}</span>
                                <Badge variant="secondary" className="text-xs">{addr.tag}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {addr.street} {addr.number}, {addr.postalCode} {addr.city}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">{t('contactDetail.noAdditionalAddresses')}</p>
                  )}
                </section>

                <Separator />
              </>
            )}

            {/* Related Contacts */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4">{t('contactDetail.relatedContacts')}</h3>
              {(editedContact.relatedContacts?.length || 0) > 0 ? (
                <div className="space-y-1">
                  {editedContact.relatedContacts?.map(rc => (
                    <div key={rc.id} className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{rc.name}</p>
                          <p className="text-xs text-muted-foreground">{rc.function || t('contactDetail.noRole')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {rc.email && (
                          <button onClick={() => handleEmailClick(rc.email)} className="text-sm text-primary hover:underline">
                            {rc.email}
                          </button>
                        )}
                        {rc.gsm && (
                          <button onClick={() => handlePhoneClick(rc.gsm)} className="text-sm text-muted-foreground hover:text-foreground">
                            {rc.gsm}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">{t('contactDetail.noRelatedContacts')}</p>
              )}
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Reusable field input component
interface FieldInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
}

const FieldInput = ({ label, value, onChange, readOnly, required, placeholder }: FieldInputProps) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {readOnly ? (
      <div className="text-sm py-2">{value || '-'}</div>
    ) : (
      <Input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

export default ContactDetailModal;
