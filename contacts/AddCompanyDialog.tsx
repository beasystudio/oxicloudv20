/**
 * Add Company Dialog
 * Form for creating a new company contact with full entity structure
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star } from "lucide-react";
import { getAllTaxonomy, createContact, getHoofdtypes } from "@/lib/mockContactDB";
import { ContactType, COUNTRIES } from "@/types/contact";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const LANGUAGES = ['Dutch', 'French', 'English', 'German', 'Spanish', 'Italian', 'Portuguese'];

export function AddCompanyDialog({ open, onOpenChange, onSaved }: AddCompanyDialogProps) {
  const { logApiCall } = useMockAuth();
  const [taxonomy, setTaxonomy] = useState<ContactType[]>([]);
  const [hoofdtypes, setHoofdtypes] = useState<string[]>([]);
  const [subtypes, setSubtypes] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    vatNumber: '',
    telephone: '',
    email: '',
    website: '',
    language: 'Dutch',
    street: '',
    number: '',
    postalCode: '',
    city: '',
    country: 'Belgium',
    peppolId: '',
    poNummer: '',
    kboNumber: '',
    description: '',
    hoofdtypeId: '',
    subtypeId: '',
    evaluationNotes: '',
  });

  useEffect(() => {
    if (open) {
      const allTaxonomy = getAllTaxonomy();
      setTaxonomy(allTaxonomy);
      // Exclude 'Consultant' (internal only) from external company creation
      setHoofdtypes(getHoofdtypes().filter(h => h !== 'Consultant'));
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      name: '',
      vatNumber: '',
      telephone: '',
      email: '',
      website: '',
      language: 'Dutch',
      street: '',
      number: '',
      postalCode: '',
      city: '',
      country: 'Belgium',
      peppolId: '',
      poNummer: '',
      kboNumber: '',
      description: '',
      hoofdtypeId: '',
      subtypeId: '',
      evaluationNotes: '',
    });
    setRating(0);
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

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Company name is required");
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
      status: 'Active',
    });

    logApiCall('POST', '/api/mock/contacts', { 
      ...newContact, 
      website: formData.website,
      peppolId: formData.peppolId,
      language: formData.language,
      kboNumber: formData.kboNumber,
      description: formData.description,
      evaluation: rating,
      evaluationNotes: formData.evaluationNotes,
    });
    
    toast.success("Company created successfully");
    onSaved();
    onOpenChange(false);
  };

  const selectedHoofdtype = taxonomy.find(t => t.id === formData.hoofdtypeId)?.hoofdtype || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Company</DialogTitle>
          <DialogDescription>
            Create a new external company contact
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-2">
            {/* Section: Company Information */}
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Company Information
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>

            {/* VAT Number */}
            <div className="space-y-2">
              <Label htmlFor="vatNumber">VAT Number</Label>
              <Input
                id="vatNumber"
                value={formData.vatNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
                placeholder="BE 0123.456.789"
              />
            </div>

            {/* Telephone */}
            <div className="space-y-2">
              <Label htmlFor="telephone">Telephone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                placeholder="+32 ..."
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@company.com"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            {/* Preferred Language */}
            <div className="space-y-2">
              <Label>Preferred Language</Label>
              <Select value={formData.language} onValueChange={(v) => setFormData(prev => ({ ...prev, language: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
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

            {/* Peppol ID */}
            <div className="space-y-2">
              <Label htmlFor="peppolId">Peppol ID</Label>
              <Input
                id="peppolId"
                value={formData.peppolId}
                onChange={(e) => setFormData(prev => ({ ...prev, peppolId: e.target.value }))}
                placeholder="e.g. 0208:0123456789"
              />
            </div>

            {/* PO Nummer */}
            <div className="space-y-2">
              <Label htmlFor="poNummer">PO Nummer <span className="text-muted-foreground text-xs">(optioneel)</span></Label>
              <Input
                id="poNummer"
                value={formData.poNummer}
                onChange={(e) => setFormData(prev => ({ ...prev, poNummer: e.target.value }))}
                placeholder="PO-12345"
              />
            </div>

            {/* KBO Number */}
            <div className="space-y-2">
              <Label htmlFor="kboNumber">KBO Number</Label>
              <Input
                id="kboNumber"
                value={formData.kboNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, kboNumber: e.target.value }))}
                placeholder="0123.456.789"
              />
            </div>

            {/* Company Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the company..."
                rows={3}
              />
            </div>

            {/* Removed Contact Type section — contact types are only assigned within project dossiers */}

            {/* Section: Evaluation */}
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide pt-2">
              Evaluation
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Evaluation Notes */}
            <div className="space-y-2">
              <Label htmlFor="evaluationNotes">Notes & Feedback</Label>
              <Textarea
                id="evaluationNotes"
                value={formData.evaluationNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, evaluationNotes: e.target.value }))}
                placeholder="Experience working with this company, notes, feedback..."
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Company</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}