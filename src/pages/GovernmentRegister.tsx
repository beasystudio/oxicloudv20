import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const BLOCKED_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
  'hotmail.com', 'hotmail.be', 'outlook.com', 'live.com', 'live.be',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me',
  'aol.com', 'mail.com', 'zoho.com', 'yandex.com',
  'gmx.com', 'gmx.de', 'gmx.net',
  'tutanota.com', 'fastmail.com',
];

const KNOWN_GOV_PATTERNS = [
  '.gov.', '.gob.', '.govt.',
  'vlaanderen.be', 'gov.be', 'belgium.be', 'fgov.be',
  'wallonie.be', 'brussels.be',
  'milieu.be', 'environment.gov',
  'stad.be', 'gemeente.be',
];

function isWorkEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return !BLOCKED_DOMAINS.includes(domain);
}

function isKnownGovDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return KNOWN_GOV_PATTERNS.some(p => domain.includes(p));
}

const formSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(100),
  workEmail: z.string().trim().email('Valid email required').max(255).refine(isWorkEmail, 'Please use a work email address — personal email providers are not accepted.'),
  organization: z.string().trim().min(2, 'Organization is required').max(200),
  position: z.string().trim().min(2, 'Position is required').max(100),
  country: z.string().trim().min(2, 'Country is required').max(100),
  message: z.string().max(1000).optional(),
});

const GovernmentRegister = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isNL = language === 'nl';

  const [form, setForm] = useState({
    fullName: '', workEmail: '', organization: '', position: '', country: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailDomain = form.workEmail.includes('@') ? form.workEmail.split('@')[1] : '';
  const isBlocked = emailDomain ? BLOCKED_DOMAINS.includes(emailDomain.toLowerCase()) : false;
  const isGov = emailDomain ? isKnownGovDomain(form.workEmail) : false;

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    // Stubbed submission
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
    toast({
      title: isNL ? 'Aanvraag ontvangen' : 'Request received',
      description: isNL ? 'Ons team neemt binnen 2-3 werkdagen contact op.' : 'Our team will be in touch within 2-3 business days.',
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <LandingNavbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {isNL ? 'Aanvraag ontvangen' : 'Request received'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isNL
                  ? 'Ons team verifieert uw gegevens en neemt binnen 2-3 werkdagen contact met u op via uw werkemail.'
                  : 'Our team will verify your details and reach out within 2-3 business days via your work email.'}
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>
                {isNL ? 'Terug naar home' : 'Back to home'}
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const fields: { key: string; label: string; labelNL: string; placeholder: string; required: boolean; type?: string }[] = [
    { key: 'fullName', label: 'Full Name', labelNL: 'Volledige naam', placeholder: 'Jan Janssens', required: true },
    { key: 'workEmail', label: 'Work Email', labelNL: 'Werkemail', placeholder: 'jan@vlaanderen.be', required: true, type: 'email' },
    { key: 'organization', label: 'Organization', labelNL: 'Organisatie', placeholder: isNL ? 'bv. Provincie Antwerpen' : 'e.g. Province of Antwerp', required: true },
    { key: 'position', label: 'Position / Role', labelNL: 'Functie / Rol', placeholder: isNL ? 'bv. Milieuambtenaar' : 'e.g. Environmental Officer', required: true },
    { key: 'country', label: 'Country', labelNL: 'Land', placeholder: isNL ? 'België' : 'Belgium', required: true },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{isNL ? 'Toegang aanvragen — Overheid' : 'Request access — Government'} | OxiCloud</title>
        <meta name="description" content={isNL ? 'Vraag toegang aan tot OxiCloud als overheid of milieuautoriteit.' : 'Request access to OxiCloud as a government or environmental authority.'} />
      </Helmet>

      <LandingNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl">
              {isNL ? 'Toegang aanvragen' : 'Request access'}
            </CardTitle>
            <CardDescription>
              {isNL
                ? 'Voor overheden en milieuautoriteiten. Ons team verifieert uw aanvraag.'
                : 'For government and environmental authorities. Our team will verify your request.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(f => (
                <div key={f.key} className="space-y-1.5">
                  <Label htmlFor={f.key}>
                    {isNL ? f.labelNL : f.label} {f.required && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id={f.key}
                    type={f.type || 'text'}
                    value={(form as any)[f.key]}
                    onChange={e => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={errors[f.key] ? 'border-destructive' : ''}
                  />
                  {f.key === 'workEmail' && isBlocked && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {isNL ? 'Persoonlijke e-mailproviders worden niet geaccepteerd. Gebruik een werkemail.' : 'Personal email providers are not accepted. Please use a work email.'}
                    </p>
                  )}
                  {f.key === 'workEmail' && isGov && !isBlocked && (
                    <p className="text-xs text-primary flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {isNL ? 'Overheidsdomein herkend' : 'Government domain recognized'}
                    </p>
                  )}
                  {errors[f.key] && (
                    <p className="text-xs text-destructive">{errors[f.key]}</p>
                  )}
                </div>
              ))}

              {/* Optional message */}
              <div className="space-y-1.5">
                <Label htmlFor="message">
                  {isNL ? 'Bericht (optioneel)' : 'Message (optional)'}
                </Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                  placeholder={isNL ? 'Eventuele opmerkingen of context...' : 'Any additional context...'}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting || isBlocked}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isNL ? 'Verzenden...' : 'Submitting...'}
                  </>
                ) : (
                  isNL ? 'Aanvraag indienen' : 'Submit request'
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {isNL
                  ? 'Uw aanvraag wordt binnen 2-3 werkdagen beoordeeld. We nemen contact op via uw werkemail.'
                  : 'Your request will be reviewed within 2-3 business days. We will contact you via your work email.'}
              </p>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default GovernmentRegister;
