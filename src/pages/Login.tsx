import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ArrowUpRight } from '@/components/icons/OxiIcons';
import { useLanguage } from '@/i18n/LanguageContext';
import { getAvatarByEmail } from '@/lib/avatarMap';
import { supabase } from '@/integrations/supabase/client';
import loginBackground from '@/assets/login-monochrome.jpg';

interface DemoAccount {
  label: string;
  email: string;
  role: string;
  initials: string;
}

const demoAccounts: DemoAccount[] = [
{ label: 'Owner', email: 'paul@oxicloud.com', role: 'Paul Gijsemans', initials: 'PG' },
{ label: 'Admin', email: 'christine@oxicloud.com', role: 'Christine Duong', initials: 'CD' },
{ label: 'Power User', email: 'jan@gdesign.be', role: 'Jan Vermeersch', initials: 'JV' },
{ label: 'Power User', email: 'maria@gdesign.be', role: 'Maria Peeters', initials: 'MP' },
{ label: 'Standard User', email: 'lisa@gdesign.be', role: 'Lisa De Smet', initials: 'LS' },
{ label: 'Authority (Power)', email: 'koen@antwerpen.be', role: 'Koen Van den Berg', initials: 'KD' }];


const Login = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const navigate = useNavigate();
  const { login, currentUser, users } = useMockAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'owner' || currentUser.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (currentUser.role === 'authority' || currentUser.role === 'authority_standard') {
        navigate('/dashboard/authority');
      } else {
        navigate('/dashboard/partner');
      }
    }
  }, [currentUser, navigate]);

  // Check for Supabase session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/dashboard/demo');
      }
    });
  }, [navigate]);

  if (currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // First try MockAuth (demo accounts)
    const mockResult = login(email, password);
    if (mockResult.success) {
      toast({ title: "Welcome back!", description: "Login successful" });
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        if (user.role === 'owner' || user.role === 'admin') navigate('/dashboard/admin');else
        if (user.role === 'authority' || user.role === 'authority_standard') navigate('/dashboard/authority');else
        navigate('/dashboard/partner');
      }
      setLoading(false);
      return;
    }

    // Then try Supabase auth (real accounts)
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setError('Invalid email or password.');
      toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
    } else if (data.session) {
      toast({ title: "Welcome back!", description: "Login successful" });
      // Check if user has a workspace
      const { data: profile } = await supabase.
      from('profiles').
      select('workspace_id').
      eq('id', data.session.user.id).
      single();

      if (profile?.workspace_id) {
        navigate('/dashboard/partner');
      } else {
        navigate('/dashboard/demo');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const { lovable } = await import('@/integrations/lovable/index');
      await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin
      });
    } catch {
      setError('Google login is not available at the moment.');
    }
  };

  const handleDemoLogin = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword('demo123');
    setTimeout(() => {
      const result = login(account.email, 'demo123');
      if (result.success) {
        toast({ title: `Welcome, ${account.label}!`, description: "Demo login successful" });
        const user = users.find((u) => u.email.toLowerCase() === account.email.toLowerCase());
        if (user) {
          if (user.role === 'owner' || user.role === 'admin') navigate('/dashboard/admin');else
          if (user.role === 'authority' || user.role === 'authority_standard') navigate('/dashboard/authority');else
          navigate('/dashboard/partner');
        }
      }
    }, 200);
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  return (
    <>
      <Helmet>
        <title>Login — OxiCloud</title>
        <meta name="description" content="Sign in to your OxiCloud account" />
      </Helmet>

      <div className="min-h-screen flex bg-secondary">
        {/* Left — Photo panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img src={loginBackground} alt="Architecture" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/30 to-transparent" />
          <div className="relative z-10 flex flex-col justify-between pt-14 pb-12 pl-12 pr-12 w-full">
            <Link to="/" className="font-semibold text-lg tracking-tight text-white">OxiCloud</Link>
            <div className="max-w-md">
              <p className="text-white/50 text-xs uppercase tracking-[0.14em] mb-3">{t('login.envCompliance')}</p>
              

              
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-12 xl:px-16 overflow-y-auto">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-[400px] w-full py-12">
            <motion.div variants={item} className="mb-16">
              <Link to="/" className="font-semibold text-lg tracking-tight text-white">OxiCloud</Link>
            </motion.div>

            <motion.div variants={item} className="mb-10">
              <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">{t('login.title')}</h1>
              <p className="text-white/40 text-sm">{t('login.subtitle')}</p>
            </motion.div>

            {error &&
            <Alert variant="destructive" className="mb-6 border-destructive/30 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            }

            <motion.form variants={item} onSubmit={handleSubmit} className="space-y-5 py-0 my-0">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/60 text-xs uppercase tracking-wider">{t('login.emailLabel')}</Label>
                <Input
                  id="email" type="email" placeholder="you@company.be"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20" />
                
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/60 text-xs uppercase tracking-wider">{t('login.passwordLabel')}</Label>
                <Input
                  id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20" />
                
              </div>
              <button
                type="submit" disabled={loading}
                className="group relative w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-6px_hsl(108_96%_52%/0.4)] active:scale-[0.98]">
                
                <span className="relative z-10">{loading ? t('login.signingIn') : t('login.signInBtn')}</span>
                <ArrowUpRight size={14} className="relative z-10 transition-transform duration-300 group-hover:rotate-45" />
              </button>
            </motion.form>

            {/* Google login */}
            <motion.div variants={item} className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center">
                <span className="bg-secondary px-4 text-[10px] uppercase tracking-[0.16em] text-white/30">or</span>
              </div>
            </motion.div>

            <motion.div variants={item}>
              <button
                type="button" onClick={handleGoogleLogin}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </motion.div>

            {/* Quick Access Toggle */}
            <motion.div variants={item} className="mt-8">
              <button
                type="button"
                onClick={() => setShowQuickAccess(!showQuickAccess)}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-white/30 hover:text-white/50 transition-colors">
                
                Quick access to my accounts
                {showQuickAccess ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <AnimatePresence>
                {showQuickAccess &&
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden">
                  
                    <div className="space-y-1.5 pt-3">
                      {demoAccounts.map((account) =>
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleDemoLogin(account)}
                      className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-primary/30 transition-all duration-300">
                      
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 group-hover:ring-2 group-hover:ring-primary/40 transition-all duration-300 shrink-0">
                            {getAvatarByEmail(account.email) ?
                        <img src={getAvatarByEmail(account.email)} alt={account.label} className="w-full h-full object-cover" /> :

                        <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-white/60 group-hover:text-primary transition-colors duration-300">{account.initials}</span>
                              </div>
                        }
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">{account.role}</p>
                            <p className="text-[11px] text-white/30 truncate">{account.email}</p>
                          </div>
                          <span className="text-[10px] text-white/25 bg-white/5 px-2 py-0.5 rounded-full shrink-0">{account.label}</span>
                        </button>
                    )}
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </motion.div>

            {/* Pilot demo link */}
            <motion.div variants={item} className="mt-6">
              <button onClick={() => navigate('/pilot-demo')}
              className="group w-full flex items-center gap-4 px-5 py-4 rounded-xl border border-white/8 bg-white/[0.02] hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{t('login.newToOxi')}</p>
                  <p className="text-xs text-white/30 mt-0.5 whitespace-nowrap">{t('login.tryDemo')}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-primary group-hover:rotate-45 flex items-center justify-center transition-all duration-300 shrink-0">
                  <ArrowUpRight size={14} className="text-white/40 group-hover:text-primary-foreground transition-colors" />
                </div>
              </button>
            </motion.div>

            <motion.div variants={item} className="mt-8 flex flex-col gap-3">
              <div className="flex items-center justify-center">
                <Link to="/forgot-password" className="text-xs text-white/40 hover:text-primary transition-colors">{t('login.forgotPassword')}</Link>
              </div>
              <div className="flex items-center justify-between text-xs text-white/30">
                <Link to="/register" className="hover:text-primary transition-colors">{t('login.createAccount')}</Link>
                <Link to="/activation" className="hover:text-primary transition-colors">{t('login.activateAccount')}</Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>);

};

export default Login;