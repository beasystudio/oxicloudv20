import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { getPilotSession } from '@/lib/pilotSessionStore';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Loader2, CheckCircle2, AlertCircle, Building2, ShieldAlert } from 'lucide-react';
import { lookupVATNumber, formatVATNumber, type KBOCompanyData } from '@/lib/vatLookupService';

/* ── Accepted NACE-BEL codes ── */
const ACCEPTED_NACE_CODES = ['71111', '71112', '71121', '71122', '71129', '71201', '71202'];
const NACE_DESCRIPTIONS: Record<string, string> = {
  '71111': 'Architectenactiviteiten',
  '71112': 'Landschapsarchitectuur',
  '71121': 'Ingenieursactiviteiten',
  '71122': 'Technisch ontwerp en advies',
  '71129': 'Overige ingenieursactiviteiten',
  '71201': 'Technische controle, landmeting, opmeting, verkaveling',
  '71202': 'Inspectieactiviteiten (grond, gebouwen)',
};

type LookupStatus = 'idle' | 'loading' | 'success' | 'error-not-found' | 'error-inactive' | 'error-nace';

export default function PilotRegister() {
  const navigate = useNavigate();
  const vatInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ──
  const [vatInput, setVatInput] = useState('');
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
  const [kboData, setKboData] = useState<KBOCompanyData | null>(null);

  const [form, setForm] = useState({
    companyName: '',
    peppolId: '',
    street: '',
    number: '',
    postalCode: '',
    city: '',
    country: 'Belgium',
    contactName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    privacyAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  // ── BTW Lookup ──
  const handleVATLookup = async () => {
    if (!vatInput.trim()) return;
    setLookupStatus('loading');
    setKboData(null);

    const result = await lookupVATNumber(vatInput, true); // mock mode

    if (!result.success || !result.data) {
      setLookupStatus('error-not-found');
      return;
    }

    const data = result.data;

    // Check status
    if (data.status && data.status.toLowerCase() !== 'active') {
      setLookupStatus('error-inactive');
      setKboData(data);
      return;
    }

    // Check NACE code
    if (data.naceCode && !ACCEPTED_NACE_CODES.includes(data.naceCode)) {
      setLookupStatus('error-nace');
      setKboData(data);
      return;
    }

    // Success — auto-fill form
    setKboData(data);
    setForm(prev => ({
      ...prev,
      companyName: data.companyName || prev.companyName,
      peppolId: data.peppolId || prev.peppolId,
      street: data.street || prev.street,
      number: data.number || prev.number,
      postalCode: data.postalCode || prev.postalCode,
      city: data.city || prev.city,
      country: data.country || 'Belgium',
    }));
    setLookupStatus('success');
    toast.success('Bedrijfsgegevens opgehaald uit het KBO-register');
  };

  // ── Validation ──
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.companyName.trim()) errs.companyName = 'Verplicht';
    if (!form.peppolId.trim()) errs.peppolId = 'Verplicht';
    if (!form.contactName.trim()) errs.contactName = 'Verplicht';
    if (!form.email.trim()) errs.email = 'Verplicht';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Ongeldig e-mailadres';
    if (!form.phone.trim()) errs.phone = 'Verplicht';
    if (!form.password) errs.password = 'Verplicht';
    else if (form.password.length < 8) errs.password = 'Minimaal 8 tekens';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Wachtwoorden komen niet overeen';
    if (!form.termsAccepted) errs.terms = 'Vereist';
    if (!form.privacyAccepted) errs.privacy = 'Vereist';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Vul alle verplichte velden in');
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1400));
    sessionStorage.setItem('pilot_registration', JSON.stringify({
      ...form,
      vatNumber: vatInput,
      kboData,
    }));
    navigate('/pilot-demo/activation-sent');
  };

  // ── Edge case screens ──
  if (lookupStatus === 'error-not-found') {
    return (
      <Shell>
        <ErrorCard
          icon={<AlertCircle className="h-8 w-8 text-destructive" />}
          title="Bedrijf niet gevonden"
          message="We konden geen bedrijf vinden met dit BTW-nummer in de Belgische Kruispuntbank van Ondernemingen. Controleer het BTW-nummer en probeer opnieuw."
          onBack={() => { setLookupStatus('idle'); setVatInput(''); }}
        />
      </Shell>
    );
  }

  if (lookupStatus === 'error-inactive') {
    return (
      <Shell>
        <ErrorCard
          icon={<Building2 className="h-8 w-8 text-destructive" />}
          title="Inactief bedrijf"
          message="Dit bedrijf lijkt inactief te zijn in de Belgische Kruispuntbank van Ondernemingen. Alleen actieve bedrijven kunnen zich registreren."
          onBack={() => { setLookupStatus('idle'); setVatInput(''); }}
        />
      </Shell>
    );
  }

  if (lookupStatus === 'error-nace') {
    return (
      <Shell>
        <ErrorCard
          icon={<ShieldAlert className="h-8 w-8 text-amber-500" />}
          title="Uw bedrijf komt momenteel niet in aanmerking"
          message="Ons platform is momenteel alleen beschikbaar voor architecten- en ingenieursbureaus. Volgens de Belgische Kruispuntbank van Ondernemingen is uw bedrijf geregistreerd onder een andere activiteitensector. Als u denkt dat dit onjuist is of uw bedrijf ook architectuur- of ingenieursdiensten uitvoert, neem dan contact op met ons team."
          onBack={() => { setLookupStatus('idle'); setVatInput(''); }}
          showContactSupport
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[620px] bg-background rounded-2xl border border-border/50 shadow-[0_2px_24px_-6px_rgba(0,0,0,0.06)] p-8 md:p-10"
      >
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-1">
          Workspace aanmaken
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Registreer uw bedrijf om te beginnen. Het BTW-nummer is uw unieke identificatie.
        </p>

        {/* ── Section: Bedrijfsgegevens ── */}
        <SectionHeader label="Bedrijfsgegevens" />

        {/* BTW Lookup */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">BTW-nummer</Label>
          <div className="flex gap-2">
            <Input
              ref={vatInputRef}
              placeholder="BE 0123.456.789"
              value={vatInput}
              onChange={e => { setVatInput(e.target.value); if (lookupStatus === 'success') setLookupStatus('idle'); }}
              onKeyDown={e => e.key === 'Enter' && handleVATLookup()}
              className="h-10 flex-1"
            />
            <button
              type="button"
              onClick={handleVATLookup}
              disabled={lookupStatus === 'loading' || !vatInput.trim()}
              className="h-10 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors disabled:opacity-40"
            >
              {lookupStatus === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Opzoeken
            </button>
          </div>
          {lookupStatus === 'success' && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-primary">Gegevens opgehaald — {kboData?.naceDescription || 'Architectenactiviteiten'}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <FormField label="Bedrijfsnaam *" value={form.companyName} onChange={set('companyName')} error={errors.companyName} />
          </div>
          <div className="col-span-2">
            <FormField label="Peppol ID *" value={form.peppolId} onChange={set('peppolId')} placeholder="0208:BE0123456789" error={errors.peppolId} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Straat" value={form.street} onChange={set('street')} />
          <FormField label="Nr" value={form.number} onChange={set('number')} />
          <FormField label="Postcode" value={form.postalCode} onChange={set('postalCode')} />
          <FormField label="Gemeente" value={form.city} onChange={set('city')} />
          <div className="col-span-2">
            <FormField label="Land" value={form.country} onChange={set('country')} />
          </div>
        </div>

        {/* ── Section: Primair Contact ── */}
        <SectionHeader label="Primair contact" className="mt-8" />
        <div className="grid grid-cols-1 gap-4 mb-4">
          <FormField label="Volledige naam *" value={form.contactName} onChange={set('contactName')} error={errors.contactName} />
          <FormField label="E-mailadres *" value={form.email} onChange={set('email')} type="email" placeholder="info@firma.be" error={errors.email} />
          <FormField label="Telefoonnummer *" value={form.phone} onChange={set('phone')} type="tel" placeholder="+32 470 00 00 00" error={errors.phone} />
        </div>

        {/* ── Section: Beveiliging ── */}
        <SectionHeader label="Beveiliging" className="mt-8" />
        <div className="grid grid-cols-1 gap-4 mb-4">
          <FormField label="Wachtwoord *" value={form.password} onChange={set('password')} type="password" placeholder="Min. 8 tekens" error={errors.password} />
          <FormField label="Bevestig wachtwoord *" value={form.confirmPassword} onChange={set('confirmPassword')} type="password" error={errors.confirmPassword} />
        </div>

        {/* ── Section: Voorwaarden ── */}
        <SectionHeader label="Voorwaarden" className="mt-8" />
        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="terms"
              checked={form.termsAccepted}
              onCheckedChange={v => setForm(prev => ({ ...prev, termsAccepted: !!v }))}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
              Ik ga akkoord met de <Link to="/contact" className="text-primary underline underline-offset-2">Algemene Voorwaarden</Link>
            </label>
          </div>
          {errors.terms && <p className="text-xs text-destructive ml-6">{errors.terms}</p>}

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="privacy"
              checked={form.privacyAccepted}
              onCheckedChange={v => setForm(prev => ({ ...prev, privacyAccepted: !!v }))}
              className="mt-0.5"
            />
            <label htmlFor="privacy" className="text-sm text-foreground cursor-pointer">
              Ik ga akkoord met het <Link to="/contact" className="text-primary underline underline-offset-2">Privacybeleid</Link>
            </label>
          </div>
          {errors.privacy && <p className="text-xs text-destructive ml-6">{errors.privacy}</p>}
        </div>

        {/* ── Submit ── */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all duration-200 hover:shadow-[0_0_30px_-6px_hsl(108_96%_52%/0.4)] active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Account aanmaken…
            </span>
          ) : (
            <>
              Account Aanmaken
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-muted-foreground/50 mt-6 text-center">
          Heeft u al een account?{' '}
          <Link to="/pilot-demo/login" className="text-primary underline underline-offset-2">Inloggen</Link>
        </p>
      </motion.div>
    </Shell>
  );
}

/* ── Layout Shell ── */
function Shell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="border-b border-border/40 bg-background">
        <div className="flex items-center justify-between px-6 h-14 max-w-screen-xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-sm font-semibold tracking-tight text-foreground hover:text-foreground/70 transition-colors">
            OxiCloud
          </button>
          <Link to="/register" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            Terug <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</h3>
      <div className="h-px bg-border/40 mt-2" />
    </div>
  );
}

/* ── Form Field ── */
function FormField({
  label, value, onChange, type = 'text', placeholder, error,
}: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`h-10 ${error ? 'border-destructive/60 ring-1 ring-destructive/20' : ''}`}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ── Error Card ── */
function ErrorCard({
  icon, title, message, onBack, showContactSupport = false,
}: {
  icon: React.ReactNode; title: string; message: string;
  onBack: () => void; showContactSupport?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-[480px] bg-background rounded-2xl border border-border/50 shadow-[0_2px_24px_-6px_rgba(0,0,0,0.06)] p-8 md:p-10 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{message}</p>
      <div className="flex flex-col gap-3">
        {showContactSupport && (
          <Link
            to="/contact"
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Contact support
          </Link>
        )}
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center h-10 px-5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          Terug naar registratie
        </button>
      </div>
    </motion.div>
  );
}
