import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ArrowUpRight } from '@/components/icons/OxiIcons';
import { getPilotUser } from '@/lib/pilotSessionStore';
import loginBackground from '@/assets/login-background.jpg';

export default function PilotForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 600));
    const pilotUser = getPilotUser();
    if (!pilotUser || pilotUser.email.toLowerCase() !== email.toLowerCase()) {
      setError('Geen account gevonden met dit e-mailadres.');
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  return (
    <>
      <Helmet><title>Wachtwoord vergeten — OxiCloud Demo</title></Helmet>
      <div className="min-h-screen flex bg-background">
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
          <img src={loginBackground} alt="Architecture" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <Link to="/" className="text-white font-semibold text-lg tracking-tight">OxiCloud</Link>
            <div className="max-w-md">
              <p className="text-white/50 text-xs uppercase tracking-[0.14em] mb-3">Demo Mode</p>
              <p className="text-white text-2xl font-semibold leading-snug tracking-tight">Password recovery<br />simulation.</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 lg:px-16 xl:px-20">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-sm mx-auto w-full">
            <motion.div variants={item} className="lg:hidden mb-12">
              <Link to="/" className="text-foreground font-semibold text-lg tracking-tight">OxiCloud</Link>
            </motion.div>

            <motion.div variants={item} className="mb-10">
              <Link to="/pilot-demo/login" className="inline-flex items-center gap-1.5 text-muted-foreground text-xs hover:text-primary transition-colors mb-6">
                <ArrowLeft className="h-3.5 w-3.5" /> Terug naar inloggen
              </Link>
              <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">Wachtwoord vergeten</h1>
              <p className="text-muted-foreground text-sm">Voer uw e-mailadres in om een resetlink te ontvangen.</p>
            </motion.div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {sent ? (
              <motion.div variants={item} className="space-y-6">
                <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Resetlink verzonden</p>
                      <p className="text-xs text-muted-foreground">
                        In productie ontvangt u een e-mail op <span className="text-foreground/70">{email}</span>.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="text-primary/80 font-medium">Demo:</span> Uw huidig wachtwoord is nog steeds actief. Ga terug naar login.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Link to="/pilot-demo/login" className="text-xs text-primary hover:underline">Terug naar inloggen</Link>
                </div>
              </motion.div>
            ) : (
              <motion.form variants={item} onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider">E-mailadres</Label>
                  <Input id="email" type="email" placeholder="you@company.be" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255} className="h-12" />
                </div>
                <button type="submit" disabled={loading}
                  className="group relative w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-6px_hsl(78_90%_65%/0.4)] active:scale-[0.98]">
                  <span className="relative z-10">{loading ? 'Verzenden…' : 'Resetlink verzenden'}</span>
                  <ArrowUpRight size={14} className="relative z-10 transition-transform duration-300 group-hover:rotate-45" />
                </button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
