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
import { X, Phone, Mail, Plus, Trash2, Search, Building2, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export interface ContactAddress {
  id: string;
  name: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  tag: string;
}

export interface ProjectInfo {
  id: string;
  projectNumber: string;
  projectName: string;
  status: 'Open' | 'In Progress' | 'On Hold' | 'Completed';
}

export interface ProjectContactData {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  mobile?: string;
  isCompany?: boolean;
  function?: string;
  // Company fields
  vatNumber?: string;
  kboNumber?: string;
  peppolId?: string;
  website?: string;
  city?: string;
  contactType?: string;
  monitoring?: boolean;
  // Billing address
  billingStreet?: string;
  billingNumber?: string;
  billingPostalCode?: string;
  billingCity?: string;
  // Internal notes
  internalNotes?: string;
  // Multiple addresses
  addresses?: ContactAddress[];
  // Associated projects
  projects?: ProjectInfo[];
}

interface ProjectContactDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: ProjectContactData | null;
  currentProject?: ProjectInfo;
  onContactUpdated?: (contact: ProjectContactData) => void;
}

const CONTACT_TYPES = [
  'Aannemers',
  'Advies', 
  'Algemeen',
  'Klanten bedrijf',
  'Klanten particulier',
  'Materialen',
  'Openbare Instellingen',
  'Promotor',
  'Prospect',
  'Studiebureau',
];

const ADDRESS_TAGS = ['Billing', 'Delivery', 'Branch', 'Warehouse', 'Office'];

const MAX_NOTES_LENGTH = 500;

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Open': return 'bg-blue-500';
    case 'In Progress': return 'bg-amber-500';
    case 'On Hold': return 'bg-muted-foreground';
    case 'Completed': return 'bg-emerald-500';
    default: return 'bg-muted-foreground';
  }
};

export const ProjectContactDetailModal = ({ 
  open, 
  onOpenChange, 
  contact, 
  currentProject,
  onContactUpdated 
}: ProjectContactDetailModalProps) => {
  const [editedContact, setEditedContact] = useState<ProjectContactData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (contact) {
      // Combine current project with any other projects
      const projects: ProjectInfo[] = currentProject 
        ? [currentProject, ...(contact.projects || []).filter(p => p.id !== currentProject.id)]
        : (contact.projects || []);
      
      setEditedContact({
        ...contact,
        addresses: contact.addresses || [],
        projects,
      });
      setIsEditing(false);
      setHasChanges(false);
    }
  }, [contact, currentProject]);

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

  const displayName = editedContact.isCompany ? editedContact.company : editedContact.name;

  const updateField = (field: keyof ProjectContactData, value: any) => {
    setEditedContact(prev => prev ? { ...prev, [field]: value } : null);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (editedContact && onContactUpdated) {
      onContactUpdated(editedContact);
      toast.success('Contact updated');
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
        {/* Header */}
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
                  {editedContact.contactType}
                </Badge>
              )}
            </div>
            {hasChanges && (
              <Button onClick={handleSave} variant="secondary" size="sm">
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4 px-6 py-3 border-b bg-muted/30">
          <button 
            onClick={() => handlePhoneClick(editedContact.phone || editedContact.mobile || '')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={!editedContact.phone && !editedContact.mobile}
          >
            <Phone className="h-4 w-4" />
            <span>Call</span>
          </button>
          <button 
            onClick={() => handleEmailClick(editedContact.email || '')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={!editedContact.email}
          >
            <Mail className="h-4 w-4" />
            <span>Send Message</span>
          </button>
          <div className="flex-1" />
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Contact
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Main Info Section */}
            <section className="grid grid-cols-2 gap-x-8 gap-y-4">
              <FieldInput
                label="Name"
                value={editedContact.name}
                onChange={v => updateField('name', v)}
                readOnly={!isEditing}
              />
              <FieldInput
                label="Company"
                value={editedContact.company}
                onChange={v => updateField('company', v)}
                readOnly={!isEditing}
                required
              />
              <FieldInput
                label="VAT Number"
                value={editedContact.vatNumber}
                onChange={v => updateField('vatNumber', v)}
                readOnly={!isEditing}
                required
                placeholder="BE0XXX.XXX.XXX"
              />
              <FieldInput
                label="KBO"
                value={editedContact.kboNumber}
                onChange={v => updateField('kboNumber', v)}
                readOnly={!isEditing}
                required
              />
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Peppol ID <span className="text-destructive">*</span>
                </Label>
                {isEditing ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={editedContact.peppolId || ''}
                      onChange={e => updateField('peppolId', e.target.value)}
                      className="pl-9"
                      placeholder="Search or enter Peppol ID..."
                    />
                  </div>
                ) : (
                  <div className="text-sm py-2">{editedContact.peppolId || '-'}</div>
                )}
              </div>
              <FieldInput
                label="Website"
                value={editedContact.website}
                onChange={v => updateField('website', v)}
                readOnly={!isEditing}
                placeholder="https://"
              />
              <FieldInput
                label="City"
                value={editedContact.city || editedContact.billingCity}
                onChange={v => updateField('city', v)}
                readOnly={!isEditing}
              />
              <FieldInput
                label="Email"
                value={editedContact.email}
                onChange={v => updateField('email', v)}
                readOnly={!isEditing}
                required
              />
              <FieldInput
                label="Telephone"
                value={editedContact.phone}
                onChange={v => updateField('phone', v)}
                readOnly={!isEditing}
                required
              />
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Contact Type <span className="text-destructive">*</span>
                </Label>
                {isEditing ? (
                  <Select
                    value={editedContact.contactType || ''}
                    onValueChange={v => updateField('contactType', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm py-2">
                    {editedContact.contactType ? (
                      <Badge variant="outline">{editedContact.contactType}</Badge>
                    ) : '-'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 col-span-2 pt-2">
                <Checkbox
                  id="monitoring"
                  checked={editedContact.monitoring || false}
                  onCheckedChange={checked => updateField('monitoring', checked)}
                  disabled={!isEditing}
                />
                <Label htmlFor="monitoring" className="text-sm font-normal cursor-pointer">
                  Markeer dit bedrijf voor opvolging (monitoring)
                </Label>
              </div>
            </section>

            <Separator />

            {/* Billing Address Section */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4">Billing Address</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <FieldInput
                  label="Straat"
                  value={editedContact.billingStreet}
                  onChange={v => updateField('billingStreet', v)}
                  readOnly={!isEditing}
                  required
                />
                <FieldInput
                  label="Nummer"
                  value={editedContact.billingNumber}
                  onChange={v => updateField('billingNumber', v)}
                  readOnly={!isEditing}
                  required
                />
                <FieldInput
                  label="Postcode"
                  value={editedContact.billingPostalCode}
                  onChange={v => updateField('billingPostalCode', v)}
                  readOnly={!isEditing}
                  required
                />
                <FieldInput
                  label="Gemeente"
                  value={editedContact.billingCity}
                  onChange={v => updateField('billingCity', v)}
                  readOnly={!isEditing}
                  required
                />
              </div>
            </section>

            <Separator />

            {/* Info Section */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4">Info</h3>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Interne notities over dit bedrijf</Label>
                {isEditing ? (
                  <div>
                    <Textarea
                      value={editedContact.internalNotes || ''}
                      onChange={e => updateField('internalNotes', e.target.value.slice(0, MAX_NOTES_LENGTH))}
                      className="min-h-[100px] resize-none"
                      placeholder="Add internal notes..."
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {notesRemaining} characters remaining
                    </p>
                  </div>
                ) : (
                  <div className="text-sm py-2 min-h-[60px] whitespace-pre-wrap">
                    {editedContact.internalNotes || <span className="text-muted-foreground italic">No notes</span>}
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Addresses Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Vestigingen / Adressen</h3>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={addAddress}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Address
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
                          <Input
                            value={addr.name}
                            onChange={e => updateAddress(addr.id, 'name', e.target.value)}
                            placeholder="Name"
                            className="col-span-2"
                          />
                          <Input
                            value={addr.street}
                            onChange={e => updateAddress(addr.id, 'street', e.target.value)}
                            placeholder="Street"
                            className="col-span-2"
                          />
                          <Input
                            value={addr.number}
                            onChange={e => updateAddress(addr.id, 'number', e.target.value)}
                            placeholder="Nr"
                            className="col-span-1"
                          />
                          <Select
                            value={addr.tag}
                            onValueChange={v => updateAddress(addr.id, 'tag', v)}
                          >
                            <SelectTrigger className="col-span-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ADDRESS_TAGS.map(tag => (
                                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={addr.postalCode}
                            onChange={e => updateAddress(addr.id, 'postalCode', e.target.value)}
                            placeholder="Postal"
                            className="col-span-1"
                          />
                          <Input
                            value={addr.city}
                            onChange={e => updateAddress(addr.id, 'city', e.target.value)}
                            placeholder="City"
                            className="col-span-2"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="col-span-1 h-9"
                            onClick={() => removeAddress(addr.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{addr.name || 'Unnamed'}</span>
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
                <p className="text-sm text-muted-foreground italic">No additional addresses</p>
              )}
            </section>

            <Separator />

            {/* Projects Section - Unique to Project Binder */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-4">Projects</h3>
              {(editedContact.projects?.length || 0) > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Status</TableHead>
                      <TableHead>Project Number</TableHead>
                      <TableHead>Project Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedContact.projects?.map(proj => (
                      <TableRow key={proj.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(proj.status)}`} />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{proj.projectNumber}</TableCell>
                        <TableCell>{proj.projectName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground italic">No projects linked</p>
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

export default ProjectContactDetailModal;
