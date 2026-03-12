import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Landmark, Shield, Loader2, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import type { RegistrationData } from '@/types/registration';
import { z } from 'zod';

const authoritySchema = z.object({
  organizationType: z.enum(['municipality', 'province', 'federal', 'regional', 'other']),
  organizationName: z.string().min(2, 'Organization name is required'),
  officialDomain: z.string().optional(),
  employeeName: z.string().min(2, 'Employee name is required'),
  workEmail: z.string().email('Valid work email is required'),
  employeeId: z.string().optional(),
  department: z.string().min(2, 'Department is required'),
});

interface AuthorityRegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  onBack: () => void;
}

const ORGANIZATION_TYPES = [
  { value: 'municipality', label: 'Municipality / Gemeente / Commune' },
  { value: 'province', label: 'Province / Provincie' },
  { value: 'regional', label: 'Regional Government (Vlaanderen/Wallonie/Brussels)' },
  { value: 'federal', label: 'Federal Government' },
  { value: 'other', label: 'Other Public Authority' },
];

const OFFICIAL_DOMAINS = [
  '.vlaanderen.be',
  '.belgium.be',
  '.fgov.be',
  '.wallonie.be',
  '.brussels.be',
  // Common municipality domains
  '.stad.be',
  '.gemeente.be',
  '.gent.be',
  '.antwerpen.be',
  '.brugge.be',
];

export const AuthorityRegistrationForm = ({ onSubmit, onBack }: AuthorityRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    organizationType: '' as 'municipality' | 'province' | 'federal' | 'regional' | 'other' | '',
    organizationName: '',
    officialDomain: '',
    employeeName: '',
    workEmail: '',
    employeeId: '',
    department: '',
  });
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailDomainVerified, setEmailDomainVerified] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validated = authoritySchema.parse(formData);
      
      onSubmit({
        entityType: 'authority',
        ...validated,
        verificationDocument,
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
    
    // Check email domain when work email changes
    if (field === 'workEmail' && value.includes('@')) {
      const domain = value.split('@')[1];
      const isOfficialDomain = OFFICIAL_DOMAINS.some(d => domain?.endsWith(d.replace('.', '')));
      setEmailDomainVerified(isOfficialDomain);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setVerificationDocument(file);
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
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Government Authority Registration</CardTitle>
              <CardDescription>
                Register as a public sector organization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Verification Notice */}
          <Alert className="mb-6 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 dark:text-blue-400">Identity Verification Required</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              To prevent misuse of discounted public sector licensing, all authority registrations 
              are manually verified by our team. Please provide accurate information and supporting documentation.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Details */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                Step 1: Organization Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationType">Organization Type *</Label>
                  <Select 
                    value={formData.organizationType} 
                    onValueChange={(value) => handleChange('organizationType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANIZATION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    value={formData.organizationName}
                    onChange={(e) => handleChange('organizationName', e.target.value)}
                    placeholder="e.g., Stad Gent, Provincie Antwerpen"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="department">Department / Dienst *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="e.g., Dienst Omgeving, Vergunningen"
                  />
                </div>
              </div>
            </div>

            {/* Employee Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Step 2: Employee Information</h3>
              <p className="text-sm text-muted-foreground">
                Provide your official work details for verification.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Full Name *</Label>
                  <Input
                    id="employeeName"
                    value={formData.employeeName}
                    onChange={(e) => handleChange('employeeName', e.target.value)}
                    placeholder="Jan Janssens"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID (optional)</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => handleChange('employeeId', e.target.value)}
                    placeholder="If applicable"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="workEmail">Official Work Email *</Label>
                  <Input
                    id="workEmail"
                    type="email"
                    value={formData.workEmail}
                    onChange={(e) => handleChange('workEmail', e.target.value)}
                    placeholder="jan.janssens@stad.gent.be"
                    className={emailDomainVerified === true ? 'border-green-500' : emailDomainVerified === false ? 'border-amber-500' : ''}
                  />
                  
                  {emailDomainVerified === true && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Official government domain detected
                    </p>
                  )}
                  
                  {emailDomainVerified === false && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Non-standard domain - additional verification required
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Use your official government email (e.g., @vlaanderen.be, @stad.gent.be)
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Document */}
            <div className="space-y-4">
              <h3 className="font-medium">Step 3: Verification Document</h3>
              <p className="text-sm text-muted-foreground">
                Upload proof of employment to expedite verification (e.g., employee badge, appointment letter, 
                signed statement on official letterhead).
              </p>
              
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="verificationDocument"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <label htmlFor="verificationDocument" className="cursor-pointer">
                  {verificationDocument ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">{verificationDocument.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload document</p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, or PNG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
              
              {!verificationDocument && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Without a verification document, our team will contact you via your work email 
                    to verify your identity. This may delay account activation.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4 border-t">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled={submitting}>
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
                Your registration will be reviewed by our team within 2-3 business days.
                We will send a confirmation to your work email.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
