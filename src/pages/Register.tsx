import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ArrowUpRight } from '@/components/icons/OxiIcons';
import { supabase } from '@/integrations/supabase/client';
import loginBackground from '@/assets/login-monochrome.jpg';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      // Fallback if lovable module not ready
      setError('Google sign-up is not available at the moment.');
    }
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  return (
    <>
      <Helmet>
        <title>Create Account — OxiCloud</title>
        <meta name="description" content="Create your free OxiCloud account. No subscriptions, no hidden costs." />
      </Helmet>

      <div className="min-h-screen flex bg-secondary">
        {/* Left — Photo panel */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
          <img src={loginBackground} alt="Architecture" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/30 to-transparent" />
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <Link to="/" className="text-white font-semibold text-lg tracking-tight">OxiCloud</Link>
            <div className="max-w-md">
              <p className="text-white/50 text-xs uppercase tracking-[0.14em] mb-3">For Architects</p>
              <p className="text-white text-2xl font-semibold leading-snug tracking-tight">
                Compliance made simple.<br />
                Start for free, forever.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  '100% free for architects — no subscriptions',
                  'No credit card required',
                  'Explore the full platform in Demo mode',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-white/70 text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 lg:px-16 xl:px-20">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-sm mx-auto w-full">
            {/* Mobile logo */}
            <motion.div variants={item} className="lg:hidden mb-12">
              <Link to="/" className="text-white font-semibold text-lg tracking-tight">OxiCloud</Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={item} className="mb-10">
              <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                Create your account
              </h1>
              <p className="text-white/40 text-sm">
                Completely free. No strings attached.
              </p>
            </motion.div>

            {/* Free badge */}
            <motion.div variants={item} className="mb-6 p-3 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">FREE</span>
                <span className="text-sm text-white/70">OxiCloud is 100% free for architects</span>
              </div>
            </motion.div>

            {success ? (
              <motion.div variants={item} className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Check your inbox</h2>
                <p className="text-white/50 text-sm mb-6">
                  We've sent a verification link to <span className="text-white font-medium">{email}</span>.
                  <br />Click the link to activate your account.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-primary hover:underline"
                >
                  Go to Login
                </button>
              </motion.div>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-6 border-destructive/30 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-destructive">{error}</AlertDescription>
                  </Alert>
                )}

                <motion.form variants={item} onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/60 text-xs uppercase tracking-wider">Email</Label>
                    <Input
                      id="email" type="email" placeholder="you@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/60 text-xs uppercase tracking-wider">Password</Label>
                    <Input
                      id="password" type="password" placeholder="Min. 6 characters"
                      value={password} onChange={e => setPassword(e.target.value)} required
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white/60 text-xs uppercase tracking-wider">Confirm Password</Label>
                    <Input
                      id="confirmPassword" type="password" placeholder="••••••••"
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <button
                    type="submit" disabled={loading}
                    className="group relative w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-6px_hsl(108_96%_52%/0.4)] active:scale-[0.98]"
                  >
                    <span className="relative z-10">{loading ? 'Creating account…' : 'Create Free Account'}</span>
                    <ArrowUpRight size={14} className="relative z-10 transition-transform duration-300 group-hover:rotate-45" />
                  </button>
                </motion.form>

                {/* Divider */}
                <motion.div variants={item} className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <div className="relative flex justify-center">
                    <span className="bg-secondary px-4 text-[10px] uppercase tracking-[0.16em] text-white/30">or</span>
                  </div>
                </motion.div>

                {/* Google */}
                <motion.div variants={item}>
                  <button
                    type="button" onClick={handleGoogleSignUp}
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

                {/* Footer */}
                <motion.div variants={item} className="mt-8 text-center">
                  <p className="text-sm text-white/30">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
