import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getPilotSession } from '@/lib/pilotSessionStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

/* ── Blocked email domains ── */
const BLOCKED_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'msn.com',
  'aol.com', 'icloud.com', 'me.com', 'mac.com', 'mail.com', 'protonmail.com',
  'proton.me', 'zoho.com', 'yandex.com', 'gmx.com', 'gmx.de', 'web.de',
  'tutanota.com', 'fastmail.com', 'hey.com',
];

const isPersonalEmail = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? BLOCKED_DOMAINS.includes(domain) : false;
};

/* ── Dropdown options ── */
const COMPANY_SIZES = ['1–5', '6–20', '21–50', '51–200', '200+'];

export default function PilotRegister() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [form, setForm] = useState({
    email: '',
    companyName: '',
    companyWebsite: '',
    firstName: '',
    lastName: '',
    phone: '',
    companySize: '',
    jobFunction: '',
    message: '',
  });

  const session = getPilotSession();
  if (!session) {
    navigate('/pilot-demo');
    return null;
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const setSelect = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const canContinue = step === 0
    ? form.email && form.companyName
    : form.firstName && form.lastName && form.phone;

  const handleNext = async () => {
    if (step === 0) {
      if (isPersonalEmail(form.email)) {
        setEmailError(t('pilotRegister.workEmailError'));
        return;
      }
      setEmailError('');
      setStep(1);
      return;
    }
    if (!canContinue) {
      toast.error(t('pilotRegister.fillAllFields'));
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    sessionStorage.setItem('pilot_registration', JSON.stringify(form));
    navigate('/pilot-demo/activation-sent');
  };

  const progress = ((step + 1) / 2) * 100;
  const JOB_FUNCTIONS = [t('pilotRegister.jobArch'), t('pilotRegister.jobEng'), t('pilotRegister.jobPM'), t('pilotRegister.jobSustain'), t('pilotRegister.jobOther')];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border/40 bg-background">
        <div className="flex items-center justify-between px-6 h-14 max-w-screen-xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-sm font-semibold tracking-tight text-foreground hover:text-foreground/70 transition-colors">OxiCloud</button>
          <Link to="/register" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            {t('pilotRegister.back')} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="h-[2px] bg-border/30">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          layout
          className="w-full max-w-[540px] bg-background rounded-2xl border border-border/50 shadow-[0_2px_24px_-6px_rgba(0,0,0,0.06)] p-10 md:p-12"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground mb-1 text-balance">
                {step === 0 ? t('pilotRegister.step1Title') : t('pilotRegister.step2Title')}
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                {step === 0 ? t('pilotRegister.step1Subtitle') : t('pilotRegister.step2Subtitle')}
              </p>

              <div>
                {step === 0 ? (
                  <>
                    <FieldRow label={t('pilotRegister.workEmail')} value={form.email} onChange={(e) => { set('email')(e); setEmailError(''); }} placeholder="jan@firm.be" type="email" autoFocus error={emailError} />
                    <FieldRow label={t('pilotRegister.company')} value={form.companyName} onChange={set('companyName')} placeholder={t('pilotRegister.companyPlaceholder')} />
                    <FieldRow label={t('pilotRegister.website')} value={form.companyWebsite} onChange={set('companyWebsite')} placeholder="www.firm.be" last optional />
                  </>
                ) : (
                  <>
                    <FieldRow label={t('pilotRegister.firstName')} value={form.firstName} onChange={set('firstName')} placeholder="Jan" autoFocus />
                    <FieldRow label={t('pilotRegister.lastName')} value={form.lastName} onChange={set('lastName')} placeholder="Vermeersch" />
                    <FieldRow label={t('pilotRegister.phone')} value={form.phone} onChange={set('phone')} placeholder="+32 470 00 00 00" type="tel" />
                    <SelectRow label={t('pilotRegister.companySize')} value={form.companySize} options={COMPANY_SIZES} placeholder={t('pilotRegister.companySizePlaceholder')} onSelect={v => setSelect('companySize', v)} />
                    <SelectRow label={t('pilotRegister.jobFunction')} value={form.jobFunction} options={JOB_FUNCTIONS} placeholder={t('pilotRegister.jobFunctionPlaceholder')} onSelect={v => setSelect('jobFunction', v)} />
                    <TextareaRow label={t('pilotRegister.anythingElse')} sublabel={t('pilotRegister.optional')} value={form.message} onChange={set('message')} placeholder={t('pilotRegister.messagePlaceholder')} last />
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-8">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-sm font-semibold text-foreground hover:text-foreground/70 transition-colors"
                  >
                     {t('pilotRegister.back')}
                  </button>
                ) : (
                  <span />
                )}
                <SubmitButton
                  onClick={handleNext}
                  loading={isLoading}
                  disabled={!canContinue}
                  label={step === 0 ? t('pilotRegister.continue') : t('pilotRegister.submit')}
                />
              </div>

              {step === 1 && (
                <p className="text-[11px] text-muted-foreground/40 mt-8 text-center leading-relaxed">
                  {t('pilotRegister.privacyText')}{' '}
                  <Link to="/contact" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">{t('pilotRegister.privacyPolicy')}</Link>.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Text input row ── */
function FieldRow({
  label, value, onChange, placeholder, type = 'text', last = false, autoFocus = false, error = '', optional = false,
}: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; type?: string; last?: boolean; autoFocus?: boolean; error?: string; optional?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`py-3 ${!last ? 'border-b border-border/40' : ''}`}>
      <div className="flex items-center gap-6">
        <label className="text-sm font-semibold w-[130px] shrink-0 text-foreground">
          {label}
          {optional && <span className="text-muted-foreground/40 font-normal ml-1 text-xs">optional</span>}
        </label>
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`h-9 border shadow-none bg-transparent text-sm rounded-md px-3 transition-all duration-200 placeholder:text-muted-foreground/30 ${
            error
              ? 'border-destructive/60 ring-2 ring-destructive/10'
              : focused
                ? 'border-primary/60 ring-2 ring-primary/10'
                : 'border-border/60 hover:border-border'
          }`}
        />
      </div>
      {error && (
        <p className="text-xs text-destructive mt-1.5 ml-[154px]">{error}</p>
      )}
    </div>
  );
}

/* ── Custom select dropdown row ── */
function SelectRow({
  label, value, options, placeholder, onSelect, last = false,
}: {
  label: string; value: string; options: string[]; placeholder: string;
  onSelect: (v: string) => void; last?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`flex items-center gap-6 py-3 ${!last ? 'border-b border-border/40' : ''}`}>
      <label className="text-sm font-semibold text-foreground w-[130px] shrink-0">{label}</label>
      <div ref={ref} className="relative flex-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full h-9 flex items-center justify-between px-3 text-sm rounded-md border transition-all duration-200 ${
            open
              ? 'border-primary/60 ring-2 ring-primary/10'
              : 'border-border/60 hover:border-border'
          } ${value ? 'text-foreground' : 'text-muted-foreground/40'}`}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden"
            >
              {options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onSelect(opt); setOpen(false); }}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between transition-colors ${
                    value === opt
                      ? 'bg-primary/8 text-foreground font-medium'
                      : 'text-foreground hover:bg-muted/60'
                  }`}
                >
                  {opt}
                  {value === opt && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Textarea row ── */
function TextareaRow({
  label, sublabel, value, onChange, placeholder, last = false,
}: {
  label: string; sublabel?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string; last?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`flex gap-6 py-3 ${!last ? 'border-b border-border/40' : ''}`}>
      <div className="w-[130px] shrink-0 pt-2">
        <label className="text-sm font-semibold text-foreground block">{label}</label>
        {sublabel && <span className="text-xs text-muted-foreground/50">{sublabel}</span>}
      </div>
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={3}
        className={`flex-1 text-sm border shadow-none bg-transparent rounded-md px-3 py-2 resize-y transition-all duration-200 placeholder:text-muted-foreground/30 ${
          focused
            ? 'border-primary/60 ring-2 ring-primary/10'
            : 'border-border/60 hover:border-border'
        }`}
      />
    </div>
  );
}

/* ── Submit button with spinning border ── */
function SubmitButton({
  onClick, loading, disabled, label,
}: {
  onClick: () => void; loading: boolean; disabled: boolean; label: string;
}) {
  return (
    <div className="relative">
      {loading && (
        <motion.div
          className="absolute -inset-[2px] rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, hsl(var(--primary)), transparent 30%, transparent 70%, hsl(var(--primary)))',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
          transition-all duration-200
          ${disabled && !loading
            ? 'bg-muted text-muted-foreground/40 cursor-not-allowed'
            : loading
              ? 'bg-background text-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <motion.span
              className="inline-block w-3.5 h-3.5 border-2 border-foreground/20 border-t-foreground rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
            />
            Submitting…
          </span>
        ) : (
          <>
            {label}
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </div>
  );
}
