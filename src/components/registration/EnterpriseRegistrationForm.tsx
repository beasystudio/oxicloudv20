import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Building2, CheckCircle, Loader2, AlertCircle, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { RegistrationData } from '@/types/registration';
import { z } from 'zod';

const enterpriseSchema = z.object({
  vatNumber: z.string().min(10, 'VAT number must be at least 10 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  companyAddress: z.string().min(5, 'Company address is required'),
  ceoName: z.string().min(2, 'CEO/Representative name is required'),
  ceoEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(8, 'Phone number is required'),
});

interface EnterpriseRegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  onBack: () => void;
}

interface VatLookupResult {
  valid: boolean;
  companyName?: string;
  address?: string;
  error?: string;
}

export const EnterpriseRegistrationForm = ({ onSubmit, onBack }: EnterpriseRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    vatNumber: '',
    companyName: '',
    companyAddress: '',
    ceoName: '',
    ceoEmail: '',
    contactPhone: '',
  });
  const [vatValidated, setVatValidated] = useState(false);
  const [vatLookupLoading, setVatLookupLoading] = useState(false);
  const [vatError, setVatError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleVatLookup = async () => {
    if (!formData.vatNumber || formData.vatNumber.length < 10) {
      setVatError('Please enter a valid Belgian VAT number (e.g., BE0123456789)');
      return;
    }

    setVatLookupLoading(true);
    setVatError(null);

    try {
      // Call the VAT lookup edge function
      const { data, error } = await supabase.functions.invoke('vat-lookup', {
        body: { vatNumber: formData.vatNumber }
      });

      if (error) throw error;

      if (data.valid && data.companyName) {
        setFormData(prev => ({
          ...prev,
          companyName: data.companyName || prev.companyName,
          companyAddress: data.address || prev.companyAddress,
        }));
        setVatValidated(true);
        toast({
          title: 'Company verified',
          description: `Found: ${data.companyName}`,
        });
      } else {
        setVatError(data.error || 'Could not validate VAT number. Please check and try again.');
        setVatValidated(false);
      }
    } catch (error) {
      console.error('VAT lookup error:', error);
      setVatError('VAT validation service unavailable. Your registration will require manual verification.');
      // Allow registration to continue with manual verification
      setVatValidated(false);
    } finally {
      setVatLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validated = enterpriseSchema.parse(formData);
      
      onSubmit({
        entityType: 'enterprise',
        ...validated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'vatNumber') {
      setVatValidated(false);
      setVatError(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to selection
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Enterprise Registration</CardTitle>
              <CardDescription>
                Register your company to access OxiCloud
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* VAT Number Section */}
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                Step 1: Verify your company
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="vatNumber">Belgian VAT Number *</Label>
                <div className="flex gap-2">
                  <Input
                    id="vatNumber"
                    placeholder="BE0123456789"
                    value={formData.vatNumber}
                    onChange={(e) => handleChange('vatNumber', e.target.value.toUpperCase())}
                    className={vatValidated ? 'border-green-500' : ''}
                  />
                  <Button 
                    type="button" 
                    onClick={handleVatLookup}
                    disabled={vatLookupLoading || !formData.vatNumber}
                    variant="secondary"
                  >
                    {vatLookupLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your Belgian VAT number to auto-fill company details
                </p>
              </div>

              {vatValidated && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-400">Company Verified</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    VAT number validated successfully
                  </AlertDescription>
                </Alert>
              )}

              {vatError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Issue</AlertTitle>
                  <AlertDescription>
                    {vatError}
                    <br />
                    <span className="text-xs mt-1 block">
                      You can still proceed - our team will manually verify your company.
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Step 2: Company Details</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Your Company BV"
                    disabled={vatValidated}
                    className={vatValidated ? 'bg-muted' : ''}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">Registered Address *</Label>
                  <Input
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={(e) => handleChange('companyAddress', e.target.value)}
                    placeholder="Street 123, 1000 Brussels"
                    disabled={vatValidated}
                    className={vatValidated ? 'bg-muted' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-4">
              <h3 className="font-medium">Step 3: Primary Contact (CEO/Representative)</h3>
              <p className="text-sm text-muted-foreground">
                This person will be the Client Owner with full administrative rights.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ceoName">Full Name *</Label>
                  <Input
                    id="ceoName"
                    value={formData.ceoName}
                    onChange={(e) => handleChange('ceoName', e.target.value)}
                    placeholder="Jan Janssens"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    placeholder="+32 XXX XX XX XX"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="ceoEmail">Private/Work Email *</Label>
                  <Input
                    id="ceoEmail"
                    type="email"
                    value={formData.ceoEmail}
                    onChange={(e) => handleChange('ceoEmail', e.target.value)}
                    placeholder="jan.janssens@company.be"
                  />
                  <p className="text-xs text-muted-foreground">
                    This email will be used for account activation and important notifications.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t">
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration Request'
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                By submitting, you agree to our Terms of Service and Privacy Policy.
                Your registration will be reviewed by our team.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
