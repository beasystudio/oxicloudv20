/**
 * Add Project Company Dialog
 * Create a company, save globally, and link to project
 * Optionally add persons to the company
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Plus, X, User } from "lucide-react";
import { getAllTaxonomy, createContact, getHoofdtypes } from "@/lib/mockContactDB";
import { addProjectContact } from "@/lib/mockLocalProjects";
import { ContactType, COUNTRIES } from "@/types/contact";
import { toast } from "sonner";

interface AddProjectCompanyDialogProps {
  open: boolean;
  onOpenChange: () => void;
  projectId: string;
  onContactCreated: () => void;
  onBack: () => void;
}

interface PersonEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function AddProjectCompanyDialog({ 
  open, 
  onOpenChange, 
  projectId,
  onContactCreated,
  onBack 
}: AddProjectCompanyDialogProps) {
  const [taxonomy, setTaxonomy] = useState<ContactType[]>([]);
  const [hoofdtypes, setHoofdtypes] = useState<string[]>([]);
  const [subtypes, setSubtypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddPersons, setShowAddPersons] = useState(false);
  const [persons, setPersons] = useState<PersonEntry[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    vatNumber: '',
    telephone: '',
    email: '',
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
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      name: '',
      vatNumber: '',
      telephone: '',
      email: '',
      street: '',
      number: '',
      postalCode: '',
      city: '',
      country: 'Belgium',
      hoofdtypeId: '',
      subtypeId: '',
    });
    setSubtypes([]);
    setShowAddPersons(false);
    setPersons([]);
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

  const addPerson = () => {
    setPersons(prev => [...prev, {
      id: crypto.randomUUID(),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    }]);
  };

  const updatePerson = (id: string, field: keyof PersonEntry, value: string) => {
    setPersons(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const removePerson = (id: string) => {
    setPersons(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Company name is required");
      return;
    }

    setLoading(true);
    try {
      // 1. Save company globally to Contacts
      const newCompany = createContact({
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
        status: 'Active',
      });

      // 2. Save persons globally (if any)
      const validPersons = persons.filter(p => p.firstName.trim() || p.lastName.trim());
      for (const person of validPersons) {
        createContact({
          hoofdtypeId: formData.hoofdtypeId,
          subtypeId: formData.subtypeId || formData.hoofdtypeId,
          name: `${person.firstName} ${person.lastName}`.trim(),
          contactType: 'individual',
          companyName: formData.name,
          linkedCompanyId: newCompany.id,
          vatNumber: '',
          street: formData.street,
          number: formData.number,
          postalCode: formData.postalCode,
          city: formData.city,
          country: formData.country,
          phone: person.phone,
          gsm: '',
          email: person.email,
          status: 'Active',
        });
      }

      // 3. Link company to project
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
        contactId: newCompany.id,
        contactName: validPersons.length > 0 
          ? `${validPersons[0].firstName} ${validPersons[0].lastName}`.trim()
          : formData.name,
        contactType,
        company: formData.name,
        phone: formData.telephone || '',
        gsm: '',
        email: formData.email || '',
        firstName: validPersons[0]?.firstName,
        lastName: validPersons[0]?.lastName,
        vatNumber: formData.vatNumber,
        invoiceAddress: `${formData.street} ${formData.number}, ${formData.postalCode} ${formData.city}`,
      });

      // 4. Also link additional persons to project
      for (let i = 1; i < validPersons.length; i++) {
        const person = validPersons[i];
        addProjectContact({
          projectId,
          contactId: crypto.randomUUID(),
          contactName: `${person.firstName} ${person.lastName}`.trim(),
          contactType,
          company: formData.name,
          phone: person.phone || '',
          gsm: '',
          email: person.email || '',
          firstName: person.firstName,
          lastName: person.lastName,
        });
      }

      toast.success(`Company${validPersons.length > 0 ? ' and employees' : ''} created and linked to project`);
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
              <DialogTitle>Create Company</DialogTitle>
              <DialogDescription>
                Create a new company and link to this project
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-4">
          <div className="space-y-4 py-2">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="(bedrijfsnaam)"
              />
            </div>

            {/* VAT Number */}
            <div className="space-y-2">
              <Label htmlFor="vatNumber">VAT Number</Label>
              <Input
                id="vatNumber"
                value={formData.vatNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
                placeholder="(btw-nummer)"
              />
            </div>

            {/* Contact Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={selectedHoofdtype} onValueChange={handleHoofdtypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="(selecteer)" />
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
                    <SelectValue placeholder="(selecteer)" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                  placeholder="(telefoonnummer)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="(e-mailadres)"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>Address</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  className="col-span-2"
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="(straatnaam)"
                />
                <Input
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="(nr)"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={formData.postalCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="(postcode)"
                />
                <Input
                  className="col-span-2"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="(gemeente)"
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

            {/* Add Persons Section */}
            <div className="border-t pt-4 mt-4">
              {!showAddPersons ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowAddPersons(true); addPerson(); }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add employees to this company
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Employees</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={addPerson}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {persons.map((person, index) => (
                    <div key={person.id} className="p-3 border rounded-md space-y-2 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <User className="h-4 w-4" />
                          Person {index + 1}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removePerson(person.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="(voornaam)"
                          value={person.firstName}
                          onChange={(e) => updatePerson(person.id, 'firstName', e.target.value)}
                        />
                        <Input
                          placeholder="(achternaam)"
                          value={person.lastName}
                          onChange={(e) => updatePerson(person.id, 'lastName', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="email"
                          placeholder="(e-mailadres)"
                          value={person.email}
                          onChange={(e) => updatePerson(person.id, 'email', e.target.value)}
                        />
                        <Input
                          placeholder="(telefoonnummer)"
                          value={person.phone}
                          onChange={(e) => updatePerson(person.id, 'phone', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
