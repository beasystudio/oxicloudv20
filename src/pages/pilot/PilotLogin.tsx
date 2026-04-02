import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ArrowUpRight } from '@/components/icons/OxiIcons';
import { getPilotUser, getPilotSession } from '@/lib/pilotSessionStore';
import { logAuditEvent } from '@/lib/securityAuditStore';
import { toast } from 'sonner';
import loginBackground from '@/assets/login-background.jpg';
import oxicloudLogo from '@/assets/oxicloud-logo-white.png';

export default function PilotLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const session = getPilotSession();
    const pilotUser = getPilotUser();
    if (!session || !pilotUser) { setError('No account found. Please register first.'); setLoading(false); return; }
    if (email.toLowerCase() === pilotUser.email.toLowerCase() && password === pilotUser.password) {
      logAuditEvent({ eventType: 'login_success', userId: pilotUser.id, userEmail: pilotUser.email, description: `Succesvol ingelogd als ${pilotUser.firstName} ${pilotUser.lastName}` });
      toast.success(`Welcome back, ${pilotUser.firstName}!`);
      navigate('/pilot-demo/dashboard');
    } else {
      logAuditEvent({ eventType: 'login_failed', userId: 'unknown', userEmail: email, description: `Mislukte inlogpoging voor ${email}` });
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  return (
    <>
      <Helmet>
        <title>Sign In - OxiCloud</title>
        <meta name="description" content="Sign in to your OxiCloud account" />
      </Helmet>

      <div className="min-h-screen flex bg-background">
        {/* Left — Photo panel (stays dark) */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
          <img src={loginBackground} alt="Architecture" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <Link to="/"><img src={oxicloudLogo} alt="OxiCloud" className="h-11 w-auto" /></Link>
            <div className="max-w-md">
              <p className="text-white/50 text-xs uppercase tracking-[0.14em] mb-3">Environmental Compliance</p>
            </div>
          </div>
        </div>

        {/* Right — Light form */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 lg:px-16 xl:px-20">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-sm mx-auto w-full">
            <motion.div variants={item} className="lg:hidden mb-12">
              <Link to="/" className="text-foreground font-semibold text-lg tracking-tight">OxiCloud</Link>
            </motion.div>

            <motion.div variants={item} className="mb-10">
              <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">Welcome back</h1>
              <p className="text-muted-foreground text-sm">Sign in to continue</p>
            </motion.div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <motion.form variants={item} onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
                <Input id="email" type="email" placeholder="you@company.be" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wider">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
              </div>
              <button type="submit" disabled={loading}
                className="group relative w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-6px_hsl(78_90%_65%/0.4)] active:scale-[0.98]">
                <span className="relative z-10">{loading ? 'Signing in…' : 'Sign In'}</span>
                <ArrowUpRight size={14} className="relative z-10 transition-transform duration-300 group-hover:rotate-45" />
              </button>
            </motion.form>

            {/* Demo hint */}
            <motion.div variants={item} className="mt-8 p-4 rounded-xl border border-border bg-muted/30">
              <p className="text-sm font-medium text-foreground/80 mb-1 text-center">
                <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium mr-2">Demo</span>
                Use the credentials you just created
              </p>
              <p className="text-xs text-muted-foreground text-center">Sign in with the email and password from your registration.</p>
            </motion.div>

            {/* Footer Links */}
            <motion.div variants={item} className="mt-8 flex flex-col gap-3">
              <div className="flex items-center justify-center">
                <Link to="/pilot-demo/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">Wachtwoord vergeten?</Link>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Link to="/pilot-demo" className="hover:text-primary transition-colors">Create account</Link>
                <Link to="/" className="hover:text-primary transition-colors">Back to home</Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
