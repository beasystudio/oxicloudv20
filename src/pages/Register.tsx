import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { ArrowUpRight } from '@/components/icons/OxiIcons';
import { LanguageToggle } from '@/components/LanguageToggle';
import { supabase } from '@/integrations/supabase/client';

type UserCategory = null | 'professional' | 'government';

interface ProfessionalType {
  id: string;
  label: string;
  description: string;
}

const professionalTypes: ProfessionalType[] = [
  { id: 'architect', label: 'Architect', description: 'Registered architect or architecture firm' },
  { id: 'engineer', label: 'Engineer', description: 'Structural, civil, or environmental engineer' },
  { id: 'surveyor', label: 'Surveyor', description: 'Land surveyor or geometer' },
];

export default function Register() {
  const [category, setCategory] = useState<UserCategory>(null);
  const [professionalType, setProfessionalType] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/login',
        data: {
          full_name: fullName,
          user_category: category,
          professional_type: professionalType,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    try {
      const { lovable } = await import('@/integrations/lovable/index');
      await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
    } catch {
      setError('Google sign-up is not available at the moment.');
    }
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  const stepNumber = !category ? 1 : (category === 'professional' && !professionalType) ? 2 : category === 'government' ? 3 : 3;

  return (
    <>
      <Helmet>
        <title>Create Account — OxiCloud</title>
        <meta name="description" content="Create your free OxiCloud account. Choose your role and get started." />
      </Helmet>

      <div className="min-h-screen bg-secondary flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 lg:px-12 py-5">
          <Link to="/" className="text-white font-semibold text-lg tracking-tight">OxiCloud</Link>
          <Link to="/login" className="text-xs text-white/40 hover:text-primary transition-colors">
            Already have an account? <span className="text-primary font-medium">Sign in</span>
          </Link>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-lg">
            <AnimatePresence mode="wait">
              {success ? (
                <SuccessScreen email={email} onGoToLogin={() => navigate('/login')} />
              ) : !category ? (
                <CategorySelection key="category" container={container} item={item} onSelect={setCategory} />
              ) : category === 'government' ? (
                <GovernmentNotice key="gov" container={container} item={item} onBack={() => setCategory(null)} />
              ) : !professionalType ? (
                <ProfessionalTypeSelection
                  key="proftype"
                  container={container}
                  item={item}
                  onSelect={setProfessionalType}
                  onBack={() => setCategory(null)}
                />
              ) : (
                <SignupForm
                  key="form"
                  container={container}
                  item={item}
                  professionalType={professionalType}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  fullName={fullName}
                  setFullName={setFullName}
                  loading={loading}
                  error={error}
                  onSubmit={handleSubmit}
                  onGoogleSignUp={handleGoogleSignUp}
                  onBack={() => setProfessionalType(null)}
                />
              )}
            </AnimatePresence>

            {/* Step indicator */}
            {!success && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      s <= stepNumber ? 'w-8 bg-primary' : 'w-4 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Step 1: Category Selection ─── */
function CategorySelection({
  container,
  item,
  onSelect,
}: {
  container: any;
  item: any;
  onSelect: (cat: UserCategory) => void;
}) {
  return (
    <motion.div
      key="category"
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      <motion.div variants={item} className="text-center">
        <h1 className="text-3xl font-semibold text-white tracking-tight mb-3">
          How will you use OxiCloud?
        </h1>
        <p className="text-white/40 text-sm max-w-sm mx-auto">
          Choose your role so we can tailor the experience for you.
        </p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Professional card */}
        <button
          onClick={() => onSelect('professional')}
          className="group relative flex flex-col justify-between text-left p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 min-h-[180px]"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-white">Professional</h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold uppercase tracking-wider">
                Free
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              Architect, engineer, surveyor, or related design professional.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Continue</span>
            <ArrowUpRight size={12} className="group-hover:rotate-45 transition-transform" />
          </div>
        </button>

        {/* Government card */}
        <button
          onClick={() => onSelect('government')}
          className="group relative flex flex-col justify-between text-left p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 min-h-[180px]"
        >
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Government</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              Municipality, province, or federal/regional authority.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Continue</span>
            <ArrowUpRight size={12} className="group-hover:rotate-45 transition-transform" />
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Step 2a: Professional Type ─── */
function ProfessionalTypeSelection({
  container,
  item,
  onSelect,
  onBack,
}: {
  container: any;
  item: any;
  onSelect: (type: string) => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      key="proftype"
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      <motion.div variants={item}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <h1 className="text-3xl font-semibold text-white tracking-tight mb-3">
          What best describes you?
        </h1>
        <p className="text-white/40 text-sm">Select your discipline to get started.</p>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        {professionalTypes.map((pt) => (
          <button
            key={pt.id}
            onClick={() => onSelect(pt.id)}
            className="group w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-white transition-colors">{pt.label}</p>
              <p className="text-xs text-white/35 mt-0.5">{pt.description}</p>
            </div>
            <ArrowUpRight size={14} className="text-white/20 group-hover:text-primary group-hover:rotate-45 transition-all shrink-0" />
          </button>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── Step 2b: Government Notice ─── */
function GovernmentNotice({
  container,
  item,
  onBack,
}: {
  container: any;
  item: any;
  onBack: () => void;
}) {
  return (
    <motion.div
      key="gov"
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -12 }}
      className="space-y-8"
    >
      <motion.div variants={item}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </motion.div>

      <motion.div variants={item} className="text-center py-4">
        <h2 className="text-2xl font-semibold text-white mb-3">Government Access</h2>
        <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed mb-8">
          Government accounts require a dedicated onboarding process with identity verification and domain validation.
        </p>

        <div className="space-y-4 max-w-sm mx-auto text-left">
          {[
            'Official domain email verification',
            'Organization identity check',
            'Dedicated account manager',
          ].map((text) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <CheckCircle className="w-3 h-3 text-white/40" />
              </div>
              <span className="text-sm text-white/50">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-3">
          <a
            href="mailto:support@oxicloud.be?subject=Government%20Account%20Request"
            className="group w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Contact us for access
            <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform" />
          </a>
          <p className="text-[11px] text-white/25">
            Or reach out at <span className="text-white/40">support@oxicloud.be</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Step 3: Signup Form (professionals) ─── */
function SignupForm({
  container,
  item,
  professionalType,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  fullName,
  setFullName,
  loading,
  error,
  onSubmit,
  onGoogleSignUp,
  onBack,
}: {
  container: any;
  item: any;
  professionalType: string;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignUp: () => void;
  onBack: () => void;
}) {
  const typeLabel = professionalTypes.find((p) => p.id === professionalType)?.label ?? 'Professional';

  return (
    <motion.div
      key="form"
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      <motion.div variants={item}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
          Create your {typeLabel} account
        </h1>
        <p className="text-white/40 text-sm">100% free. No credit card required.</p>
      </motion.div>

      {/* Free badge */}
      <motion.div variants={item} className="p-3 rounded-xl border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">FREE</span>
          <span className="text-sm text-white/70">OxiCloud is free for {typeLabel.toLowerCase()}s</span>
        </div>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <motion.form variants={item} onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-white/60 text-xs uppercase tracking-wider">Full Name</Label>
          <Input
            id="fullName" type="text" placeholder="Jan Vermeersch"
            value={fullName} onChange={(e) => setFullName(e.target.value)} required
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/60 text-xs uppercase tracking-wider">Email</Label>
          <Input
            id="email" type="email" placeholder="you@company.be"
            value={email} onChange={(e) => setEmail(e.target.value)} required
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/60 text-xs uppercase tracking-wider">Password</Label>
            <Input
              id="password" type="password" placeholder="Min. 6 chars"
              value={password} onChange={(e) => setPassword(e.target.value)} required
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/60 text-xs uppercase tracking-wider">Confirm</Label>
            <Input
              id="confirmPassword" type="password" placeholder="••••••••"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
            />
          </div>
        </div>
        <button
          type="submit" disabled={loading}
          className="group relative w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-6px_hsl(78_90%_65%/0.4)] active:scale-[0.98]"
        >
          <span className="relative z-10">{loading ? 'Creating account…' : 'Create Free Account'}</span>
          <ArrowUpRight size={14} className="relative z-10 transition-transform duration-300 group-hover:rotate-45" />
        </button>
      </motion.form>

      {/* Divider */}
      <motion.div variants={item} className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
        <div className="relative flex justify-center">
          <span className="bg-secondary px-4 text-[10px] uppercase tracking-[0.16em] text-white/30">or</span>
        </div>
      </motion.div>

      {/* Google */}
      <motion.div variants={item}>
        <button
          type="button" onClick={onGoogleSignUp}
          className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Success Screen ─── */
function SuccessScreen({ email, onGoToLogin }: { email: string; onGoToLogin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Check your inbox</h2>
      <p className="text-white/50 text-sm mb-6">
        We've sent a verification link to <span className="text-white font-medium">{email}</span>.
        <br />Click the link to activate your account.
      </p>
      <button onClick={onGoToLogin} className="text-sm text-primary hover:underline">
        Go to Login
      </button>
    </motion.div>
  );
}
