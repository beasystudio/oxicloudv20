import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { getPilotSession, createPilotUser, createPilotCompany, addPilotContact, updatePilotOnboarding, addPilotEmployee } from '@/lib/pilotSessionStore';
import { logAuditEvent } from '@/lib/securityAuditStore';
import { lookupVATNumber, formatVATNumber } from '@/lib/vatLookupService';

/**
 * PilotCreateAccount - Full registration form with prefilled data from initial form
 * User completes company info, sets password, and accepts agreements
 */
export default function PilotCreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [kboLoaded, setKboLoaded] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Company - will be auto-filled from KBO data
    companyName: '',
    legalForm: '',
    vatNumber: '',
    legalAddress: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    country: 'Belgium',
    peppolId: '',
    // Contact - auto-filled from initial form
    fullName: '',
    email: '',
    phone: '',
    // Security
    password: '',
    confirmPassword: '',
    // Agreements
    termsAccepted: false,
    privacyAccepted: false,
    selfBillingAccepted: true
  });
  useEffect(() => {
    // Check session
    const session = getPilotSession();
    if (!session) {
      navigate('/pilot-demo');
      return;
    }

    // Load initial registration data
    const stored = sessionStorage.getItem('pilot_registration');
    if (stored) {
      const data = JSON.parse(stored);
      setInitialData(data);

      // Prefill form with data from initial registration
      // PilotRegister stores full formData including legalAddress etc from KBO lookup
      setFormData(prev => ({
        ...prev,
        fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: data.email || '',
        phone: data.phone || '',
        vatNumber: data.vatNumber || '',
        companyName: data.companyName || '',
        legalForm: data.legalForm || '',
        legalAddress: data.legalAddress || '',
        houseNumber: data.houseNumber || '',
        postalCode: data.postalCode || '',
        city: data.city || '',
        country: data.country || 'Belgium',
        peppolId: data.peppolId || ''
      }));
    }
  }, [navigate]);
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'vatNumber') {
      setKboLoaded(false);
      setLookupError(null);
    }
  };

  const handleVATLookup = async () => {
    if (!formData.vatNumber.trim()) return;
    setIsLookingUp(true);
    setLookupError(null);
    const result = await lookupVATNumber(formData.vatNumber, true);
    if (result.success && result.data) {
      const data = result.data;
      setFormData(prev => ({
        ...prev,
        vatNumber: formatVATNumber(data.vatNumber),
        companyName: data.companyName || data.legalName,
        legalForm: data.legalForm,
        legalAddress: data.street,
        houseNumber: data.number,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        peppolId: data.peppolId,
      }));
      setKboLoaded(true);
      toast.success('Bedrijfsgegevens opgehaald uit KBO');
    } else {
      setLookupError(result.error || 'Bedrijf niet gevonden');
      toast.error(result.error || 'Bedrijf niet gevonden in KBO databank');
    }
    setIsLookingUp(false);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.companyName) {
      toast.error('Bedrijfsnaam is verplicht');
      return;
    }
    if (!formData.peppolId) {
      toast.error('Peppol ID is verplicht voor e-facturatie');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Wachtwoord moet minimaal 8 tekens bevatten');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }
    if (!formData.termsAccepted || !formData.privacyAccepted || !formData.selfBillingAccepted) {
      toast.error('Accepteer alle voorwaarden om door te gaan');
      return;
    }
    setIsLoading(true);

    // Simulate account creation
    await new Promise(resolve => setTimeout(resolve, 800));

    // Create pilot company with real KBO data
    const fullAddress = formData.houseNumber ? `${formData.legalAddress} ${formData.houseNumber}` : formData.legalAddress;
    const company = createPilotCompany({
      name: formData.companyName,
      vatNumber: formData.vatNumber,
      legalAddress: fullAddress,
      postalCode: formData.postalCode,
      city: formData.city,
      country: formData.country,
      peppolId: formData.peppolId,
      legalForm: formData.legalForm
    });

    // Create pilot user (the owner)
    const nameParts = formData.fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const user = createPilotUser({
      email: formData.email,
      firstName,
      lastName,
      phone: formData.phone,
      password: formData.password
    });

    // Add user as first employee (owner)
    addPilotEmployee({
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone,
      function: 'Zaakvoerder',
      employeeType: 'employee',
      companyId: company.id
    });

    // NOTE: Do NOT add owner as a separate contact — PilotContacts
    // already constructs the owner entry from the user record.

    // Log security events
    logAuditEvent({
      eventType: 'account_created',
      userId: user.id,
      userEmail: user.email,
      description: `Account aangemaakt voor ${formData.companyName}`,
      metadata: { companyId: company.id, companyName: company.name },
    });

    logAuditEvent({
      eventType: 'role_assigned',
      userId: user.id,
      userEmail: user.email,
      description: `Rol OWNER automatisch toegewezen aan ${user.firstName} ${user.lastName}`,
      metadata: { role: 'OWNER', automatic: true },
    });

    // Initialize onboarding state
    updatePilotOnboarding({
      flow1Complete: false,
      flow2Complete: false,
      flow3Complete: false,
      currentFlow: 1,
      currentStep: 0
    });

    // Clear temp registration data
    sessionStorage.removeItem('pilot_registration');
    toast.success('Account succesvol aangemaakt! Log nu in met uw gegevens.');

    // Navigate to pilot login - user must sign in with their new credentials
    navigate('/pilot-demo/login');
  };
  return <div className="min-h-screen bg-background">
      {/* Simple header */}
      <header className="border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link to="/" className="text-lg font-semibold text-primary">
            OxiCloud
          </Link>
        </div>
      </header>

      <div className="py-8 px-6">
        <Card className="max-w-2xl mx-auto p-8 border-border/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Maak uw gratis OxiCloud-account aan
              </h1>
              <p className="text-muted-foreground text-sm">
                Voltooi uw registratie om toegang te krijgen tot het platform.
              </p>
            </div>

            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Bedrijfsgegevens
              </h3>

              {/* VAT/KBO Lookup */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  BTW-nummer
                </Label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="BE 0123.456.789"
                      value={formData.vatNumber}
                      onChange={e => handleInputChange('vatNumber', e.target.value)}
                      className={`h-11 ${lookupError ? 'border-destructive' : ''}`}
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={handleVATLookup} disabled={isLookingUp || !formData.vatNumber} className="h-11 px-6">
                    {isLookingUp ? 'Opzoeken...' : 'Opzoeken'}
                  </Button>
                </div>
                {lookupError && <p className="text-xs text-destructive">{lookupError}</p>}
                {!lookupError && <p className="text-xs text-muted-foreground">
                  Voer uw BTW-nummer in om bedrijfsgegevens automatisch op te halen, of vul de velden handmatig in.
                </p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">
                    Bedrijfsnaam <span className="text-destructive">*</span>
                  </Label>
                  <Input value={formData.companyName} onChange={e => handleInputChange('companyName', e.target.value)} className={`h-11 ${kboLoaded ? 'bg-muted/50' : ''}`} />
                  {formData.legalForm && <p className="text-xs text-muted-foreground">Rechtsvorm: {formData.legalForm}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Peppol ID <span className="text-destructive">*</span>
                  </Label>
                  <Input placeholder="0208:XXXXXXXXXX" value={formData.peppolId} onChange={e => handleInputChange('peppolId', e.target.value)} className="h-11" />
                  <p className="text-xs text-muted-foreground">Vereist voor e-facturatie</p>
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">Straat</Label>
                  <Input value={formData.legalAddress} onChange={e => handleInputChange('legalAddress', e.target.value)} className={`h-11 ${initialData?.kboData ? 'bg-muted/50' : ''}`} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nr</Label>
                  <Input value={formData.houseNumber} onChange={e => handleInputChange('houseNumber', e.target.value)} className={`h-11 ${initialData?.kboData ? 'bg-muted/50' : ''}`} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Postcode</Label>
                  <Input value={formData.postalCode} onChange={e => handleInputChange('postalCode', e.target.value)} className={`h-11 ${initialData?.kboData ? 'bg-muted/50' : ''}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gemeente</Label>
                  <Input value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className={`h-11 ${initialData?.kboData ? 'bg-muted/50' : ''}`} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Land</Label>
                  <Input value={formData.country} onChange={e => handleInputChange('country', e.target.value)} className={`h-11 ${initialData?.kboData ? 'bg-muted/50' : ''}`} />
                </div>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Primair Contact
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">
                    Volledige naam <span className="text-destructive">*</span>
                  </Label>
                  <Input value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="h-11 bg-muted/50" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    E-mailadres <span className="text-destructive">*</span>
                  </Label>
                  <Input value={formData.email} className="h-11 bg-muted/50" readOnly />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Telefoonnummer <span className="text-destructive">*</span>
                  </Label>
                  <Input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="h-11 bg-muted/50" />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Beveiliging
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Wachtwoord <span className="text-destructive">*</span>
                  </Label>
                  <Input type="password" placeholder="Minimaal 8 tekens" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="h-11" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Bevestig wachtwoord <span className="text-destructive">*</span>
                  </Label>
                  <Input type="password" placeholder="Herhaal wachtwoord" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} className="h-11" />
                </div>
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Voorwaarden
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={formData.termsAccepted} onCheckedChange={checked => handleInputChange('termsAccepted', checked as boolean)} className="mt-0.5" />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    Ik ga akkoord met de <span className="text-primary underline">Algemene Voorwaarden</span>
                  </Label>
                </div>
                
                <div className="flex items-start gap-3">
                  <Checkbox id="privacy" checked={formData.privacyAccepted} onCheckedChange={checked => handleInputChange('privacyAccepted', checked as boolean)} className="mt-0.5" />
                  <Label htmlFor="privacy" className="text-sm cursor-pointer">
                    Ik ga akkoord met het <span className="text-primary underline">Privacybeleid</span>
                  </Label>
                </div>
                
                
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
              {isLoading ? 'Account aanmaken...' : 'Account Aanmaken'}
            </Button>

            {/* Login link */}
            <p className="text-center text-sm text-muted-foreground">
              Heeft u al een account?{' '}
              <Link to="/pilot-demo/login" className="text-primary hover:underline">
                Inloggen
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>;
}