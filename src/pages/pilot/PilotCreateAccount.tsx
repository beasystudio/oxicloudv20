import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Loader2, CheckCircle2, AlertCircle, Building2, ShieldAlert, Globe } from 'lucide-react';
import { lookupVATNumber, type KBOCompanyData } from '@/lib/vatLookupService';
import {
  getPilotSession, createPilotSession, createPilotUser, createPilotCompany,
  addPilotEmployee, updatePilotOnboarding,
} from '@/lib/pilotSessionStore';
import { logAuditEvent } from '@/lib/securityAuditStore';

/* ── Accepted NACE-BEL codes ── */
const ACCEPTED_NACE_CODES = ['71111', '71112', '71121', '71122', '71129', '71201', '71202'];

/* ── i18n ── */
const T = {
  nl: {
    title: 'Workspace aanmaken',
    subtitle: 'Registreer uw bedrijf. Het BTW-nummer is uw unieke identificatie.',
    company: 'Bedrijfsgegevens',
    vat: 'BTW-nummer',
    lookup: 'Opzoeken',
    lookupSuccess: 'Gegevens opgehaald',
    companyName: 'Bedrijfsnaam',
    kboNumber: 'KBO Nummer',
    peppolId: 'Peppol ID',
    street: 'Straat',
    nr: 'Huisnummer',
    bus: 'Bus',
    postal: 'Postcode',
    city: 'Gemeente',
    country: 'Land',
    contact: 'Primair contact',
    fullName: 'Volledige naam',
    email: 'E-mailadres',
    phone: 'Telefoonnummer',
    security: 'Beveiliging',
    password: 'Wachtwoord',
    confirmPw: 'Bevestig wachtwoord',
    minChars: 'Min. 8 tekens',
    terms: 'Voorwaarden',
    agreeTerms: 'Ik ga akkoord met de',
    termsLink: 'Algemene Voorwaarden',
    agreePrivacy: 'Ik ga akkoord met het',
    privacyLink: 'Privacybeleid',
    submit: 'Account Aanmaken',
    submitting: 'Account aanmaken…',
    hasAccount: 'Heeft u al een account?',
    login: 'Inloggen',
    back: 'Terug',
    required: 'Verplicht',
    invalidEmail: 'Ongeldig e-mailadres',
    pwMinChars: 'Minimaal 8 tekens',
    pwMismatch: 'Wachtwoorden komen niet overeen',
    fillAll: 'Vul alle verplichte velden in',
    notFound: 'Bedrijf niet gevonden',
    notFoundMsg: 'We konden geen bedrijf vinden met dit BTW-nummer in de Belgische Kruispuntbank van Ondernemingen. Controleer het BTW-nummer en probeer opnieuw.',
    inactive: 'Inactief bedrijf',
    inactiveMsg: 'Dit bedrijf lijkt inactief te zijn in de Belgische Kruispuntbank van Ondernemingen. Alleen actieve bedrijven kunnen zich registreren.',
    ineligible: 'Uw bedrijf komt momenteel niet in aanmerking',
    ineligibleMsg: 'Ons platform is momenteel alleen beschikbaar voor architecten- en ingenieursbureaus. Volgens de Belgische Kruispuntbank van Ondernemingen is uw bedrijf geregistreerd onder een andere activiteitensector.',
    contactSupport: 'Contact support',
    backToReg: 'Terug naar registratie',
  },
  en: {
    title: 'Create Workspace',
    subtitle: 'Register your company. The VAT number is your unique identifier.',
    company: 'Business Information',
    vat: 'VAT Number',
    lookup: 'Lookup',
    lookupSuccess: 'Data retrieved',
    companyName: 'Company Name',
    kboNumber: 'KBO Number',
    peppolId: 'PEPPOL ID',
    street: 'Street',
    nr: 'House Number',
    bus: 'Bus',
    postal: 'Postal Code',
    city: 'City',
    country: 'Country',
    contact: 'Primary contact',
    fullName: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    security: 'Security',
    password: 'Password',
    confirmPw: 'Confirm password',
    minChars: 'Min. 8 characters',
    terms: 'Terms',
    agreeTerms: 'I agree to the',
    termsLink: 'Terms & Conditions',
    agreePrivacy: 'I agree to the',
    privacyLink: 'Privacy Policy',
    submit: 'Create Account',
    submitting: 'Creating account…',
    hasAccount: 'Already have an account?',
    login: 'Sign in',
    back: 'Back',
    required: 'Required',
    invalidEmail: 'Invalid email',
    pwMinChars: 'Minimum 8 characters',
    pwMismatch: 'Passwords do not match',
    fillAll: 'Please fill in all required fields',
    notFound: 'Company not found',
    notFoundMsg: 'We couldn\'t find a company with this VAT number in the Belgian Crossroads Bank for Enterprises. Please check the VAT number and try again.',
    inactive: 'Inactive company',
    inactiveMsg: 'This company appears to be inactive in the Belgian Crossroads Bank for Enterprises. Only active companies can register.',
    ineligible: 'Your company is currently not eligible',
    ineligibleMsg: 'Our platform is currently available only to architecture and engineering firms. According to the Belgian Crossroads Bank for Enterprises, your company is registered under a different activity sector.',
    contactSupport: 'Contact support',
    backToReg: 'Back to registration',
  },
} as const;

type Lang = 'nl' | 'en';
type LookupStatus = 'idle' | 'loading' | 'success' | 'error-not-found' | 'error-inactive' | 'error-nace';

export default function PilotCreateAccount() {
  const navigate = useNavigate();
  const vatInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<Lang>('nl');
  const t = T[lang];

  const [vatInput, setVatInput] = useState('');
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [kboData, setKboData] = useState<KBOCompanyData | null>(null);

  const [form, setForm] = useState({
    companyName: '', legalForm: '', peppolId: '', kboNumber: '', bus: '',
    street: '', number: '', postalCode: '', city: '', country: 'Belgium', companyEmail: '',
    contactName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    termsAccepted: false, privacyAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!getPilotSession()) createPilotSession();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  // ── BTW Lookup ──
  const handleVATLookup = async () => {
    if (!vatInput.trim()) return;
    setLookupStatus('loading');
    setKboData(null);
    const result = await lookupVATNumber(vatInput, true);
    if (!result.success || !result.data) { setLookupStatus('error-not-found'); return; }
    const data = result.data;
    if (data.status && data.status.toLowerCase() !== 'active') { setLookupStatus('error-inactive'); setKboData(data); return; }
    if (data.naceCode && !ACCEPTED_NACE_CODES.includes(data.naceCode)) { setLookupStatus('error-nace'); setKboData(data); return; }
    setKboData(data);
    setForm(prev => ({
      ...prev,
      companyName: data.companyName || prev.companyName,
      legalForm: data.legalForm || prev.legalForm,
      peppolId: data.peppolId || prev.peppolId,
      street: data.street || prev.street,
      number: data.number || prev.number,
      postalCode: data.postalCode || prev.postalCode,
      city: data.city || prev.city,
      country: data.country || 'Belgium',
      contactName: data.director ? `${data.director.firstName} ${data.director.lastName}` : prev.contactName,
      email: data.email || prev.email,
      phone: data.phone || prev.phone,
    }));
    setLookupStatus('success');
    toast.success(lang === 'nl' ? 'Bedrijfsgegevens opgehaald uit het KBO-register' : 'Company data retrieved from KBO registry');
  };

  // ── Validation ──
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = t.required;
    if (!form.peppolId.trim()) e.peppolId = t.required;
    if (!form.number.trim()) e.number = t.required;
    if (!form.companyEmail.trim()) e.companyEmail = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail)) e.companyEmail = t.invalidEmail;
    if (!form.contactName.trim()) e.contactName = t.required;
    if (!form.email.trim()) e.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.invalidEmail;
    if (!form.phone.trim()) e.phone = t.required;
    if (!form.password) e.password = t.required;
    else if (form.password.length < 8) e.password = t.pwMinChars;
    if (form.password !== form.confirmPassword) e.confirmPassword = t.pwMismatch;
    if (!form.termsAccepted) e.terms = t.required;
    if (!form.privacyAccepted) e.privacy = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) { toast.error(t.fillAll); return; }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    const fullAddress = form.number ? `${form.street} ${form.number}` : form.street;
    const company = createPilotCompany({ name: form.companyName, vatNumber: vatInput || '', legalAddress: fullAddress, postalCode: form.postalCode, city: form.city, country: form.country, peppolId: form.peppolId, legalForm: form.legalForm });
    const nameParts = form.contactName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const user = createPilotUser({ email: form.email, firstName, lastName, phone: form.phone, password: form.password });
    addPilotEmployee({ firstName, lastName, email: form.email, phone: form.phone, function: 'Zaakvoerder', employeeType: 'employee', companyId: company.id });
    logAuditEvent({ eventType: 'account_created', userId: user.id, userEmail: user.email, description: `Account aangemaakt voor ${form.companyName}`, metadata: { companyId: company.id, companyName: company.name } });
    logAuditEvent({ eventType: 'role_assigned', userId: user.id, userEmail: user.email, description: `Rol OWNER automatisch toegewezen aan ${firstName} ${lastName}`, metadata: { role: 'OWNER', automatic: true } });
    updatePilotOnboarding({ flow1Complete: false, flow2Complete: false, flow3Complete: false, currentFlow: 1, currentStep: 0 });
    sessionStorage.removeItem('pilot_registration');
    toast.success(lang === 'nl' ? 'Account succesvol aangemaakt!' : 'Account created successfully!');
    navigate('/pilot-demo/login');
  };

  const resetLookup = () => { setLookupStatus('idle'); setVatInput(''); };

  // ── Edge case screens ──
  if (lookupStatus === 'error-not-found') return <Shell lang={lang} setLang={setLang} t={t}><ErrorCard icon={<AlertCircle className="h-6 w-6 text-destructive" />} title={t.notFound} message={t.notFoundMsg} onBack={resetLookup} backLabel={t.backToReg} /></Shell>;
  if (lookupStatus === 'error-inactive') return <Shell lang={lang} setLang={setLang} t={t}><ErrorCard icon={<Building2 className="h-6 w-6 text-destructive" />} title={t.inactive} message={t.inactiveMsg} onBack={resetLookup} backLabel={t.backToReg} /></Shell>;
  if (lookupStatus === 'error-nace') return <Shell lang={lang} setLang={setLang} t={t}><ErrorCard icon={<ShieldAlert className="h-6 w-6 text-amber-500" />} title={t.ineligible} message={t.ineligibleMsg} onBack={resetLookup} backLabel={t.backToReg} showContactSupport contactLabel={t.contactSupport} /></Shell>;

  return (
    <Shell lang={lang} setLang={setLang} t={t}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[540px] bg-background rounded-xl border border-border/50 shadow-sm"
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-border/40">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{t.title}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{t.subtitle}</p>
        </div>

        <div className="px-7 py-5 space-y-5">
          {/* ── Bedrijfsgegevens ── */}
          <Section label={t.company}>
            <div className="flex gap-2">
              <Input ref={vatInputRef} placeholder="BE 0123.456.789" value={vatInput}
                onChange={e => { setVatInput(e.target.value); if (lookupStatus === 'success') setLookupStatus('idle'); }}
                onKeyDown={e => e.key === 'Enter' && handleVATLookup()}
                className="h-9 flex-1 text-[13px]"
              />
              <button type="button" onClick={handleVATLookup} disabled={lookupStatus === 'loading' || !vatInput.trim()}
                className="h-9 px-3.5 rounded-md bg-foreground text-background text-[13px] font-medium flex items-center gap-1.5 hover:bg-foreground/90 transition-colors disabled:opacity-30 shrink-0"
              >
                {lookupStatus === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                {t.lookup}
              </button>
            </div>
            {lookupStatus === 'success' && (
              <div className="flex items-center gap-1.5 -mt-1">
                <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{t.lookupSuccess} — {kboData?.naceDescription || 'Architectenactiviteiten'}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Row 1: Company Name + VAT Number */}
              <div className="grid grid-cols-2 gap-3">
                <F label={`${t.companyName} *`} value={form.companyName} onChange={set('companyName')} error={errors.companyName} />
                <F label={`${t.vat} *`} value={vatInput} onChange={e => { setVatInput(e.target.value); if (lookupStatus === 'success') setLookupStatus('idle'); }} readOnly={lookupStatus === 'success'} />
              </div>
              {/* Row 2: KBO Number + PEPPOL ID */}
              <div className="grid grid-cols-2 gap-3">
                <F label={t.kboNumber} value={form.kboNumber} onChange={set('kboNumber')} placeholder="0123.456.789" />
                <F label={t.peppolId} value={form.peppolId} onChange={set('peppolId')} placeholder="0208:BE0453671077" />
              </div>
              {/* Row 3: Street + House Number + Bus */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-3">
                <F label={`${t.street} *`} value={form.street} onChange={set('street')} />
                <div className="w-24">
                  <F label={`${t.nr} *`} value={form.number} onChange={set('number')} error={errors.number} />
                </div>
                <div className="w-20">
                  <F label={t.bus} value={form.bus} onChange={set('bus')} />
                </div>
              </div>
              {/* Row 4: Postal Code + City */}
              <div className="grid grid-cols-2 gap-3">
                <F label={`${t.postal} *`} value={form.postalCode} onChange={set('postalCode')} />
                <F label={`${t.city} *`} value={form.city} onChange={set('city')} />
              </div>
              {/* Row 5: Company Email + Country */}
              <div className="grid grid-cols-2 gap-3">
                <F label={`${t.companyEmail} *`} value={form.companyEmail} onChange={set('companyEmail')} type="email" placeholder="info@company.be" error={errors.companyEmail} />
                <F label={t.country} value={form.country} onChange={set('country')} />
              </div>
            </div>
          </Section>

          {/* ── Primair Contact ── */}
          <Section label={t.contact}>
            <div className="grid grid-cols-1 gap-3">
              <F label={`${t.fullName} *`} value={form.contactName} onChange={set('contactName')} error={errors.contactName} />
              <F label={`${t.email} *`} value={form.email} onChange={set('email')} type="email" placeholder="jan@voorbeeld.be" error={errors.email} />
              <F label={`${t.phone} *`} value={form.phone} onChange={set('phone')} type="tel" placeholder="+32 470 00 00 00" error={errors.phone} />
            </div>
          </Section>

          {/* ── Beveiliging ── */}
          <Section label={t.security}>
            <div className="grid grid-cols-2 gap-3">
              <F label={`${t.password} *`} value={form.password} onChange={set('password')} type="password" placeholder={t.minChars} error={errors.password} />
              <F label={`${t.confirmPw} *`} value={form.confirmPassword} onChange={set('confirmPassword')} type="password" error={errors.confirmPassword} />
            </div>
          </Section>

          {/* ── Voorwaarden ── */}
          <Section label={t.terms}>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.termsAccepted} onCheckedChange={v => setForm(p => ({ ...p, termsAccepted: !!v }))} className="h-3.5 w-3.5" />
                <span className="text-[13px] text-foreground">{t.agreeTerms} <Link to="/contact" className="text-foreground underline underline-offset-2 font-medium">{t.termsLink}</Link></span>
              </label>
              {errors.terms && <p className="text-[11px] text-destructive pl-5">{errors.terms}</p>}
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.privacyAccepted} onCheckedChange={v => setForm(p => ({ ...p, privacyAccepted: !!v }))} className="h-3.5 w-3.5" />
                <span className="text-[13px] text-foreground">{t.agreePrivacy} <Link to="/contact" className="text-foreground underline underline-offset-2 font-medium">{t.privacyLink}</Link></span>
              </label>
              {errors.privacy && <p className="text-[11px] text-destructive pl-5">{errors.privacy}</p>}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-7 pb-6 pt-1">
          <button type="button" onClick={handleSubmit} disabled={isSubmitting}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-[13px] transition-all duration-200 hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.4)] active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t.submitting}</> : <>{t.submit}<ArrowRight className="h-3.5 w-3.5" /></>}
          </button>
          <p className="text-[11px] text-muted-foreground/50 mt-4 text-center">
            {t.hasAccount}{' '}<Link to="/pilot-demo/login" className="text-foreground underline underline-offset-2 font-medium">{t.login}</Link>
          </p>
        </div>
      </motion.div>
    </Shell>
  );
}

/* ── Shell ── */
function Shell({ children, lang, setLang, t }: { children: React.ReactNode; lang: Lang; setLang: (l: Lang) => void; t: (typeof T)[Lang] }) {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="border-b border-border/40 bg-background">
        <div className="flex items-center justify-between px-6 h-12 max-w-screen-xl mx-auto">
          <span className="text-sm font-semibold tracking-tight text-foreground">OxiCloud</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === 'nl' ? 'en' : 'nl')}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <Globe className="h-3 w-3" />
              {lang === 'nl' ? 'EN' : 'NL'}
            </button>
            <Link to="/dashboard/demo" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              {t.back} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-1 flex items-start justify-center px-4 py-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/* ── Section ── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className="flex-1 h-px bg-border/40" />
      </div>
      {children}
    </div>
  );
}

/* ── Field ── */
function F({ label, value, onChange, type = 'text', placeholder, error, span, readOnly }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; error?: string; span?: number; readOnly?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${span === 2 ? 'col-span-2' : ''}`}>
      <label className="text-[12px] font-semibold text-foreground">{label}</label>
      <Input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        className={`h-10 text-[13px] ${readOnly ? 'bg-muted/50 cursor-default' : ''} ${error ? 'border-destructive/60 ring-1 ring-destructive/20' : ''}`}
      />
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}

/* ── Error Card ── */
function ErrorCard({ icon, title, message, onBack, backLabel, showContactSupport = false, contactLabel }:
  { icon: React.ReactNode; title: string; message: string; onBack: () => void; backLabel: string; showContactSupport?: boolean; contactLabel?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-[420px] bg-background rounded-xl border border-border/50 shadow-sm p-8 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">{icon}</div>
      <h2 className="text-base font-semibold text-foreground mb-1.5">{title}</h2>
      <p className="text-[13px] text-muted-foreground mb-6 leading-relaxed">{message}</p>
      <div className="flex flex-col gap-2">
        {showContactSupport && (
          <Link to="/contact" className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors">
            {contactLabel}
          </Link>
        )}
        <button onClick={onBack} className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-border text-[13px] font-medium text-foreground hover:bg-muted/50 transition-colors">
          {backLabel}
        </button>
      </div>
    </motion.div>
  );
}
