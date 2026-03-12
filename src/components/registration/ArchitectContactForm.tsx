import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, Smile, Search, CheckCircle2, Building2 } from 'lucide-react';
import { z } from 'zod';
import { lookupVATNumber, type KBOCompanyData } from '@/lib/vatLookupService';

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Phone number is required'),
  companyName: z.string().min(2, 'Company name is required')
});

interface ArchitectContactFormProps {
  onSubmit: (data: z.infer<typeof contactSchema>) => void;
}

export const ArchitectContactForm = ({ onSubmit }: ArchitectContactFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: ''
  });
  const [vatNumber, setVatNumber] = useState('');
  const [vatLooking, setVatLooking] = useState(false);
  const [vatResult, setVatResult] = useState<KBOCompanyData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleVatLookup = async () => {
    if (!vatNumber.trim()) return;
    setVatLooking(true);
    setVatResult(null);

    // Always use mock mode — any input returns fake data
    const result = await lookupVATNumber(vatNumber, true);

    if (result.success && result.data) {
      setVatResult(result.data);
      // Auto-fill form fields
      setFormData(prev => ({
        ...prev,
        companyName: result.data!.companyName,
        firstName: result.data!.director?.firstName || prev.firstName,
        lastName: result.data!.director?.lastName || prev.lastName,
      }));
      toast({
        title: 'Company found',
        description: `${result.data.companyName} — ${result.data.city}`,
      });
    }
    setVatLooking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const validated = contactSchema.parse(formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(validated);
      toast({
        title: 'Registration link sent!',
        description: `Check your email at ${formData.email} for the detailed registration form.`
      });
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="border-2">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Smile className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="heading-sm">Join as Architecture Partner</CardTitle>
          <CardDescription className="body-md px-0 text-sm">
            Fill in your contact details and we'll send you a registration link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* VAT Number Lookup */}
            <div className="space-y-2">
              <Label htmlFor="vatNumber" className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                VAT Number *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="vatNumber"
                  value={vatNumber}
                  onChange={e => setVatNumber(e.target.value)}
                  placeholder="BE0XXX.XXX.XXX"
                  className="flex-1"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleVatLookup();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleVatLookup}
                  disabled={vatLooking || !vatNumber.trim()}
                  className="shrink-0"
                >
                  {vatLooking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter any VAT number to retrieve company data
              </p>

              {/* Retrieved company card */}
              {vatResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{vatResult.companyName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Legal Form: {vatResult.legalForm}</span>
                    <span>KBO: {vatResult.kboNumber}</span>
                    <span>{vatResult.street} {vatResult.number}</span>
                    <span>{vatResult.postalCode} {vatResult.city}</span>
                    {vatResult.director && (
                      <span className="col-span-2">
                        Director: {vatResult.director.firstName} {vatResult.director.lastName} ({vatResult.director.role})
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 py-[6px] my-[10px]">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  First Name *
                </Label>
                <Input id="firstName" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} placeholder="Jan" className={errors.firstName ? 'border-destructive' : ''} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-2 py-0 px-0 my-[7px]">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} placeholder="Janssens" className={errors.lastName ? 'border-destructive' : ''} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Work Email *
              </Label>
              <Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="jan.janssens@architecture-firm.be" className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              <p className="text-xs text-muted-foreground">
                We'll send a secure registration link to this email
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                Phone Number *
              </Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+32 XXX XX XX XX" className={errors.phone ? 'border-destructive' : ''} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                Company Name *
              </Label>
              <Input id="companyName" value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} placeholder="Architecture Studio BV" className={errors.companyName ? 'border-destructive' : ''} />
              {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  Send Registration Link
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              We verify your information before sending the detailed registration form.
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
