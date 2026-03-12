import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, CheckCircle, Search, AlertCircle, CreditCard, MapPin, User, Mail, Info, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
const detailedFormSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  vatNumber: z.string().min(10, 'VAT number must be at least 10 characters'),
  bankAccount: z.string().min(10, 'Bank account (IBAN) is required'),
  poNumber: z.string().optional(),
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  primaryContactName: z.string().min(2, 'Primary contact name is required'),
  primaryContactPhone: z.string().min(8, 'Primary contact phone is required'),
  privateEmail: z.string().email('Valid private email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});
interface ArchitectDetailedFormProps {
  initialData?: {
    companyName?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  onSubmit: (data: z.infer<typeof detailedFormSchema>) => void;
  onBack: () => void;
}
export const ArchitectDetailedForm = ({
  initialData,
  onSubmit,
  onBack
}: ArchitectDetailedFormProps) => {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    vatNumber: '',
    bankAccount: '',
    poNumber: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Belgium',
    primaryContactName: `${initialData?.firstName || ''} ${initialData?.lastName || ''}`.trim(),
    primaryContactPhone: '',
    privateEmail: initialData?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [vatValidated, setVatValidated] = useState(false);
  const [vatLookupLoading, setVatLookupLoading] = useState(false);
  const [vatError, setVatError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    toast
  } = useToast();
  const handleVatLookup = async () => {
    if (!formData.vatNumber || formData.vatNumber.length < 10) {
      setVatError('Please enter a valid Belgian VAT number (e.g., BE0123456789)');
      return;
    }
    setVatLookupLoading(true);
    setVatError(null);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('vat-lookup', {
        body: {
          vatNumber: formData.vatNumber
        }
      });
      if (error) throw error;
      if (data.valid && data.companyName) {
        setFormData(prev => ({
          ...prev,
          companyName: data.companyName || prev.companyName,
          street: data.street || prev.street,
          city: data.city || prev.city,
          postalCode: data.postalCode || prev.postalCode
        }));
        setVatValidated(true);
        toast({
          title: 'Company verified',
          description: `Found: ${data.companyName}`
        });
      } else {
        setVatError(data.error || 'Could not validate VAT number.');
        setVatValidated(false);
      }
    } catch (error) {
      console.error('VAT lookup error:', error);
      setVatError('VAT validation service unavailable. Please fill in details manually.');
      setVatValidated(false);
    } finally {
      setVatLookupLoading(false);
    }
  };
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'vatNumber') {
      setVatValidated(false);
      setVatError(null);
    }
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {
          ...prev
        };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const validated = detailedFormSchema.parse(formData);
      onSubmit(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast({
          title: 'Please check the form',
          description: 'Some fields need your attention.',
          variant: 'destructive'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };
  return <motion.div initial={{
    opacity: 0,
    x: 20
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: -20
  }} transition={{
    duration: 0.4
  }} className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Complete Your Registration</CardTitle>
              <CardDescription>
                Fill in your company details to activate your Partner Account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* VAT Number Section */}
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Company Verification
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="vatNumber">VAT Number *</Label>
                <div className="flex gap-2">
                  <Input id="vatNumber" placeholder="BE0123456789" value={formData.vatNumber} onChange={e => handleChange('vatNumber', e.target.value.toUpperCase())} className={vatValidated ? 'border-primary' : errors.vatNumber ? 'border-destructive' : ''} />
                  <Button type="button" onClick={handleVatLookup} disabled={vatLookupLoading || !formData.vatNumber} variant="secondary">
                    {vatLookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                        <Search className="h-4 w-4 mr-2" />
                        Verify
                      </>}
                  </Button>
                </div>
                {errors.vatNumber && <p className="text-xs text-destructive">{errors.vatNumber}</p>}
              </div>

              {vatValidated && <Alert className="border-primary bg-primary/5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-primary">Company Verified</AlertTitle>
                  <AlertDescription className="text-primary/80">
                    VAT number validated successfully
                  </AlertDescription>
                </Alert>}

              {vatError && <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Issue</AlertTitle>
                  <AlertDescription>{vatError}</AlertDescription>
                </Alert>}

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} placeholder="Your Company BV" disabled={vatValidated} className={vatValidated ? 'bg-muted' : errors.companyName ? 'border-destructive' : ''} />
                {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
              </div>
            </div>

            {/* Bank Account */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Bank Account for Partner Settlement
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="bankAccount">IBAN *</Label>
                <Input id="bankAccount" value={formData.bankAccount} onChange={e => handleChange('bankAccount', e.target.value.toUpperCase())} placeholder="BE00 0000 0000 0000" className={errors.bankAccount ? 'border-destructive' : ''} />
                {errors.bankAccount && <p className="text-xs text-destructive">{errors.bankAccount}</p>}
                <p className="text-xs text-muted-foreground">
                  Partner settlements will be deposited to this account
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poNumber">PO Number (optional)</Label>
                <Input id="poNumber" value={formData.poNumber} onChange={e => handleChange('poNumber', e.target.value)} placeholder="e.g. PO-2026-001" />
                <p className="text-xs text-muted-foreground">
                  Purchase order reference for your internal administration
                </p>
              </div>
            </div>

            {/* Company Address */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Company Address
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input id="street" value={formData.street} onChange={e => handleChange('street', e.target.value)} placeholder="Architectenstraat 123" disabled={vatValidated} className={vatValidated ? 'bg-muted' : errors.street ? 'border-destructive' : ''} />
                  {errors.street && <p className="text-xs text-destructive">{errors.street}</p>}
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input id="postalCode" value={formData.postalCode} onChange={e => handleChange('postalCode', e.target.value)} placeholder="1000" disabled={vatValidated} className={vatValidated ? 'bg-muted' : errors.postalCode ? 'border-destructive' : ''} />
                    {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={formData.city} onChange={e => handleChange('city', e.target.value)} placeholder="Brussels" disabled={vatValidated} className={vatValidated ? 'bg-muted' : errors.city ? 'border-destructive' : ''} />
                    {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" value={formData.country} onChange={e => handleChange('country', e.target.value)} placeholder="Belgium" className={errors.country ? 'border-destructive' : ''} />
                    {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Primary Contact
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryContactName">Full Name *</Label>
                  <Input id="primaryContactName" value={formData.primaryContactName} onChange={e => handleChange('primaryContactName', e.target.value)} placeholder="Jan Janssens" className={errors.primaryContactName ? 'border-destructive' : ''} />
                  {errors.primaryContactName && <p className="text-xs text-destructive">{errors.primaryContactName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primaryContactPhone">Phone Number *</Label>
                  <Input id="primaryContactPhone" type="tel" value={formData.primaryContactPhone} onChange={e => handleChange('primaryContactPhone', e.target.value)} placeholder="+32 XXX XX XX XX" className={errors.primaryContactPhone ? 'border-destructive' : ''} />
                  {errors.primaryContactPhone && <p className="text-xs text-destructive">{errors.primaryContactPhone}</p>}
                </div>
              </div>
            </div>

            {/* Account Credentials */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Account Credentials
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="privateEmail">Private Email (for account access) *</Label>
                  <Input id="privateEmail" type="email" value={formData.privateEmail} onChange={e => handleChange('privateEmail', e.target.value)} placeholder="jan@personal-email.com" className={errors.privateEmail ? 'border-destructive' : ''} />
                  {errors.privateEmail && <p className="text-xs text-destructive">{errors.privateEmail}</p>}
                  <p className="text-xs text-muted-foreground">
                    You'll use this email to log in and receive activation links
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" value={formData.password} onChange={e => handleChange('password', e.target.value)} placeholder="••••••••" className={errors.password ? 'border-destructive' : ''} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} placeholder="••••••••" className={errors.confirmPassword ? 'border-destructive' : ''} />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t">
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" disabled={submitting}>
                {submitting ? <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </> : 'Create Partner Account'}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>;
};