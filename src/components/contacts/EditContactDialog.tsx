/**
 * Edit Contact Dialog
 * Modal for editing a contact from the Contacts module
 * Supports both company and individual contacts
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Star, Trash2, Building2 } from "lucide-react";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";

// Contact type matching the UnifiedContact structure
interface EditableContact {
  id: string;
  name: string;
  company: string;
  email: string;
  mobilePhone: string;
  workPhone: string;
  homePhone: string;
  contactCategory: string;
  companyId?: string;
  // Extended fields for editing
  isCompany?: boolean;
  vatNumber?: string;
  website?: string;
  address?: string;
  peppolId?: string;
  kboNumber?: string;
  description?: string;
  rating?: number;
  evaluationNotes?: string;
  jobTitle?: string;
  department?: string;
  privateEmail?: string;
  marketingOptIn?: boolean;
}
interface EditContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: EditableContact | null;
  onContactUpdated: (contact: EditableContact) => void;
  onContactDeleted?: (id: string) => void;
}
const CONTACT_CATEGORIES = [{
  value: 'aannemers',
  label: 'Aannemers'
}, {
  value: 'advies',
  label: 'Advies'
}, {
  value: 'algemeen',
  label: 'Algemeen'
}, {
  value: 'klanten-bedrijf',
  label: 'Klanten bedrijf'
}, {
  value: 'klanten-particulier',
  label: 'Klanten particulier'
}, {
  value: 'materialen',
  label: 'Materialen'
}, {
  value: 'openbare-instellingen',
  label: 'Openbare Instellingen'
}, {
  value: 'promotor',
  label: 'Promotor'
}, {
  value: 'prospect',
  label: 'Prospect'
}, {
  value: 'studiebureau',
  label: 'Studiebureau'
}];
export function EditContactDialog({
  open,
  onOpenChange,
  contact,
  onContactUpdated,
  onContactDeleted
}: EditContactDialogProps) {
  const {
    currentUser,
    logApiCall
  } = useMockAuth();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    mobilePhone: '',
    workPhone: '',
    homePhone: '',
    contactCategory: '',
    vatNumber: '',
    website: '',
    address: '',
    peppolId: '',
    kboNumber: '',
    description: '',
    evaluationNotes: '',
    jobTitle: '',
    department: '',
    privateEmail: '',
    marketingOptIn: false
  });
  const isOwnerOrAdmin = currentUser?.role === 'client_owner' || currentUser?.role === 'client_admin';
  const isCompany = contact?.isCompany ?? contact?.company === contact?.name;
  useEffect(() => {
    if (contact && open) {
      setFormData({
        name: contact.name || '',
        company: contact.company || '',
        email: contact.email || '',
        mobilePhone: contact.mobilePhone || '',
        workPhone: contact.workPhone || '',
        homePhone: contact.homePhone || '',
        contactCategory: contact.contactCategory || 'algemeen',
        vatNumber: contact.vatNumber || '',
        website: contact.website || '',
        address: contact.address || '',
        peppolId: contact.peppolId || '',
        kboNumber: contact.kboNumber || '',
        description: contact.description || '',
        evaluationNotes: contact.evaluationNotes || '',
        jobTitle: contact.jobTitle || '',
        department: contact.department || '',
        privateEmail: contact.privateEmail || '',
        marketingOptIn: contact.marketingOptIn || false
      });
      setRating(contact.rating || 0);
    }
  }, [contact, open]);
  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    const updatedContact: EditableContact = {
      ...contact!,
      name: formData.name,
      company: isCompany ? formData.name : formData.company,
      email: formData.email,
      mobilePhone: formData.mobilePhone,
      workPhone: formData.workPhone,
      homePhone: formData.homePhone,
      contactCategory: formData.contactCategory,
      vatNumber: formData.vatNumber,
      website: formData.website,
      address: formData.address,
      peppolId: formData.peppolId,
      kboNumber: formData.kboNumber,
      description: formData.description,
      rating: rating,
      evaluationNotes: formData.evaluationNotes,
      jobTitle: formData.jobTitle,
      department: formData.department,
      privateEmail: formData.privateEmail,
      marketingOptIn: formData.marketingOptIn
    };
    logApiCall('PUT', `/api/mock/contacts/${contact?.id}`, updatedContact);
    setTimeout(() => {
      setLoading(false);
      toast.success("Contact updated successfully");
      onContactUpdated(updatedContact);
      onOpenChange(false);
    }, 300);
  };
  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    logApiCall('DELETE', `/api/mock/contacts/${contact?.id}`, {
      id: contact?.id
    });
    toast.success("Contact deleted");
    onContactDeleted?.(contact!.id);
    onOpenChange(false);
  };
  if (!contact) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCompany ? <>
                <Building2 className="h-5 w-5" />
                Edit Company
              </> : <>
                
                Edit Contact
              </>}
          </DialogTitle>
          <DialogDescription>
            {isOwnerOrAdmin ? 'Update contact information' : 'View contact details'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{isCompany ? 'Company Name' : 'Full Name'} *</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({
              ...prev,
              name: e.target.value
            }))} disabled={!isOwnerOrAdmin} />
            </div>

            {/* Company (for individuals) */}
            {!isCompany && <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={formData.company} onChange={e => setFormData(prev => ({
              ...prev,
              company: e.target.value
            }))} disabled={!isOwnerOrAdmin} />
              </div>}

            {/* Contact Category */}
            <div className="space-y-2">
              <Label>Contact Type</Label>
              <Select value={formData.contactCategory} onValueChange={v => setFormData(prev => ({
              ...prev,
              contactCategory: v
            }))} disabled={!isOwnerOrAdmin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{isCompany ? 'Email' : 'Work Email'}</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => setFormData(prev => ({
              ...prev,
              email: e.target.value
            }))} disabled={!isOwnerOrAdmin} />
            </div>

            {/* Private Email (for individuals) */}
            {!isCompany && <div className="space-y-2">
                <Label htmlFor="privateEmail">Private Email</Label>
                <Input id="privateEmail" type="email" value={formData.privateEmail} onChange={e => setFormData(prev => ({
              ...prev,
              privateEmail: e.target.value
            }))} disabled={!isOwnerOrAdmin} />
              </div>}

            {/* Work Phone */}
            <div className="space-y-2">
              <Label htmlFor="workPhone">{isCompany ? 'Telephone' : 'Business Phone'}</Label>
              <Input id="workPhone" value={formData.workPhone} onChange={e => setFormData(prev => ({
              ...prev,
              workPhone: e.target.value
            }))} disabled={!isOwnerOrAdmin} />
            </div>

            {/* Mobile Phone */}
            <div className="space-y-2">
              <Label htmlFor="mobilePhone">Mobile Phone</Label>
              <Input id="mobilePhone" value={formData.mobilePhone} onChange={e => setFormData(prev => ({
              ...prev,
              mobilePhone: e.target.value
            }))} disabled={!isOwnerOrAdmin} />
            </div>

            {/* Home Phone (for individuals) */}
            {!isCompany && <div className="space-y-2">
                <Label htmlFor="homePhone">Home Phone</Label>
                <Input id="homePhone" value={formData.homePhone} onChange={e => setFormData(prev => ({
              ...prev,
              homePhone: e.target.value
            }))} disabled={!isOwnerOrAdmin} />
              </div>}

            {/* Job Title & Department (for individuals) */}
            {!isCompany && <>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" value={formData.jobTitle} onChange={e => setFormData(prev => ({
                ...prev,
                jobTitle: e.target.value
              }))} disabled={!isOwnerOrAdmin} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={formData.department} onChange={e => setFormData(prev => ({
                ...prev,
                department: e.target.value
              }))} disabled={!isOwnerOrAdmin} />
                </div>
              </>}

            {/* Company-specific fields */}
            {isCompany && <>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input id="vatNumber" value={formData.vatNumber} onChange={e => setFormData(prev => ({
                ...prev,
                vatNumber: e.target.value
              }))} disabled={!isOwnerOrAdmin} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={formData.website} onChange={e => setFormData(prev => ({
                ...prev,
                website: e.target.value
              }))} disabled={!isOwnerOrAdmin} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={formData.address} onChange={e => setFormData(prev => ({
                ...prev,
                address: e.target.value
              }))} disabled={!isOwnerOrAdmin} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peppolId">Peppol ID</Label>
                    <Input id="peppolId" value={formData.peppolId} onChange={e => setFormData(prev => ({
                  ...prev,
                  peppolId: e.target.value
                }))} disabled={!isOwnerOrAdmin} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kboNumber">KBO Number</Label>
                    <Input id="kboNumber" value={formData.kboNumber} onChange={e => setFormData(prev => ({
                  ...prev,
                  kboNumber: e.target.value
                }))} disabled={!isOwnerOrAdmin} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))} disabled={!isOwnerOrAdmin} rows={3} />
                </div>

                {/* Evaluation */}
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => isOwnerOrAdmin && setRating(star)} onMouseEnter={() => isOwnerOrAdmin && setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className={`p-1 transition-transform ${isOwnerOrAdmin ? 'hover:scale-110' : ''}`} disabled={!isOwnerOrAdmin}>
                        <Star className={`h-5 w-5 ${star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      </button>)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evaluationNotes">Evaluation Notes</Label>
                  <Textarea id="evaluationNotes" value={formData.evaluationNotes} onChange={e => setFormData(prev => ({
                ...prev,
                evaluationNotes: e.target.value
              }))} disabled={!isOwnerOrAdmin} rows={3} />
                </div>
              </>}

            {/* Marketing Opt-in (for individuals) */}
            {!isCompany && <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="marketingOptIn">Marketing Opt-in</Label>
                  <p className="text-xs text-muted-foreground">
                    Receives newsletters, events, promotions
                  </p>
                </div>
                <Switch id="marketingOptIn" checked={formData.marketingOptIn} onCheckedChange={checked => setFormData(prev => ({
              ...prev,
              marketingOptIn: checked
            }))} disabled={!isOwnerOrAdmin} />
              </div>}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between">
          {isOwnerOrAdmin && onContactDeleted && <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {isOwnerOrAdmin ? 'Cancel' : 'Close'}
            </Button>
            {isOwnerOrAdmin && <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}