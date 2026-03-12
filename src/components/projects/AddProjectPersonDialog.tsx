/**
 * Add Project Person Dialog
 * Create an individual contact and link to project
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { getAllTaxonomy, getAllContacts, createContact, getHoofdtypes } from "@/lib/mockContactDB";
import { addProjectContact } from "@/lib/mockLocalProjects";
import { ContactType, Contact, COUNTRIES } from "@/types/contact";
import { toast } from "sonner";

interface AddProjectPersonDialogProps {
  open: boolean;
  onOpenChange: () => void;
  projectId: string;
  onContactCreated: () => void;
  onBack: () => void;
}

// Internal companies to exclude
const INTERNAL_COMPANIES = ['gdesign architecten', 'gdesign', '4takt'];

export function AddProjectPersonDialog({ 
  open, 
  onOpenChange, 
  projectId,
  onContactCreated,
  onBack 
}: AddProjectPersonDialogProps) {
  const [taxonomy, setTaxonomy] = useState<ContactType[]>([]);
  const [hoofdtypes, setHoofdtypes] = useState<string[]>([]);
  const [subtypes, setSubtypes] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    linkedCompanyId: '',
    jobTitle: '',
    street: '',
    number: '',
    postalCode: '',
    city: '',
    country: 'Belgium',
    hoofdtypeId: '',
    subtypeId: '',
  });

  useEffect(() => {
    if (open) {
      const allTaxonomy = getAllTaxonomy();
      setTaxonomy(allTaxonomy);
      setHoofdtypes(getHoofdtypes());
      
      // Get company contacts for linking
      const allContacts = getAllContacts();
      const companyContacts = allContacts.filter(c => 
        c.contactType === 'company' && 
        !INTERNAL_COMPANIES.includes(c.name.toLowerCase())
      );
      setCompanies(companyContacts);
      
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      mobile: '',
      linkedCompanyId: '',
      jobTitle: '',
      street: '',
      number: '',
      postalCode: '',
      city: '',
      country: 'Belgium',
      hoofdtypeId: '',
      subtypeId: '',
    });
    setSubtypes([]);
  };

  const handleHoofdtypeChange = (value: string) => {
    const matchingEntries = taxonomy.filter(t => t.hoofdtype === value);
    const subs = [...new Set(matchingEntries.map(t => t.subtype))];
    setSubtypes(subs);
    
    setFormData(prev => ({
      ...prev,
      hoofdtypeId: matchingEntries[0]?.id || '',
      subtypeId: '',
    }));
  };

  const handleSubtypeChange = (subtype: string) => {
    const entry = taxonomy.find(t => 
      t.subtype === subtype && 
      taxonomy.find(x => x.id === formData.hoofdtypeId)?.hoofdtype === t.hoofdtype
    );
    setFormData(prev => ({
      ...prev,
      subtypeId: entry?.id || prev.hoofdtypeId,
    }));
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const linkedCompany = companies.find(c => c.id === formData.linkedCompanyId);

      // 1. Save person globally to Contacts
      createContact({
        hoofdtypeId: formData.hoofdtypeId,
        subtypeId: formData.subtypeId || formData.hoofdtypeId,
        name: fullName,
        contactType: 'individual',
        companyName: linkedCompany?.name,
        linkedCompanyId: formData.linkedCompanyId || undefined,
        vatNumber: '',
        street: formData.street || linkedCompany?.street || '',
        number: formData.number || linkedCompany?.number || '',
        postalCode: formData.postalCode || linkedCompany?.postalCode || '',
        city: formData.city || linkedCompany?.city || '',
        country: formData.country,
        phone: formData.phone,
        gsm: formData.mobile,
        email: formData.email,
        status: 'Active',
      });

      // 2. Link person to project
      let contactType: 'client' | 'team' | 'external_team' | 'contractor' | 'others' = 'others';
      const selectedHoofdtype = taxonomy.find(t => t.id === formData.hoofdtypeId)?.hoofdtype || '';
      if (selectedHoofdtype.toLowerCase().includes('client')) {
        contactType = 'client';
      } else if (selectedHoofdtype.toLowerCase().includes('contractor')) {
        contactType = 'contractor';
      } else if (selectedHoofdtype.toLowerCase().includes('consultant')) {
        contactType = 'external_team';
      }

      addProjectContact({
        projectId,
        contactId: crypto.randomUUID(),
        contactName: fullName,
        contactType,
        company: linkedCompany?.name || fullName,
        phone: formData.phone || '',
        gsm: formData.mobile || '',
        email: formData.email || '',
        firstName: formData.firstName,
        lastName: formData.lastName,
        function: formData.jobTitle || undefined,
        invoiceAddress: formData.street 
          ? `${formData.street} ${formData.number}, ${formData.postalCode} ${formData.city}`
          : linkedCompany 
            ? `${linkedCompany.street} ${linkedCompany.number}, ${linkedCompany.postalCode} ${linkedCompany.city}`
            : undefined,
      });

      toast.success("Contact created and linked to project");
      onContactCreated();
    } catch (error: any) {
      toast.error(error.message || "Failed to create contact");
    } finally {
      setLoading(false);
    }
  };

  const selectedHoofdtype = taxonomy.find(t => t.id === formData.hoofdtypeId)?.hoofdtype || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>Create Person</DialogTitle>
              <DialogDescription>
                Create a new individual contact and link to this project
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-4">
          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Company Link */}
            <div className="space-y-2">
              <Label>Company (optional)</Label>
              <Select 
                value={formData.linkedCompanyId} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, linkedCompanyId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No company</SelectItem>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            {/* Contact Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={selectedHoofdtype} onValueChange={handleHoofdtypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {hoofdtypes.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subtype</Label>
                <Select 
                  value={taxonomy.find(t => t.id === formData.subtypeId)?.subtype || ''} 
                  onValueChange={handleSubtypeChange}
                  disabled={subtypes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subtype" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="person@company.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+32 ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  placeholder="+32 4..."
                />
              </div>
            </div>

            {/* Address (optional if no company) */}
            {!formData.linkedCompanyId && (
              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    className="col-span-2"
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="Street"
                  />
                  <Input
                    value={formData.number}
                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="Nr"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Postal"
                  />
                  <Input
                    className="col-span-2"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <Select value={formData.country} onValueChange={(v) => setFormData(prev => ({ ...prev, country: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Creating...' : 'Create & Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
