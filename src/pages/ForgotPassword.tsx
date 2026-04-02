import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { ArrowUpRight } from '@/components/icons/OxiIcons';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import loginBackground from '@/assets/login-background.jpg';
import oxicloudLogo from '@/assets/oxicloud-logo-white.png';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  return (
    <>
      <Helmet><title>{t('forgotPassword.pageTitle')}</title></Helmet>
      <div className="min-h-screen flex bg-background">
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
          <img src={loginBackground} alt="Architecture" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <Link to="/"><img src={oxicloudLogo} alt="OxiCloud" className="h-8 w-auto" /></Link>
            <div className="max-w-md">
              <p className="text-white/50 text-xs uppercase tracking-[0.14em] mb-3">{t('forgotPassword.sidebarTag')}</p>
              <p className="text-white text-2xl font-semibold leading-snug tracking-tight">
                {t('forgotPassword.sidebarTitle')}<br />{t('forgotPassword.sidebarTitleBr')}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 lg:px-16 xl:px-20">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-sm mx-auto w-full">
            <motion.div variants={item} className="lg:hidden mb-12">
              <Link to="/" className="text-foreground font-semibold text-lg tracking-tight">OxiCloud</Link>
            </motion.div>

            <motion.div variants={item} className="mb-10">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-muted-foreground text-xs hover:text-primary transition-colors mb-6">
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('forgotPassword.backToLogin')}
              </Link>
              <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">{t('forgotPassword.title')}</h1>
              <p className="text-muted-foreground text-sm">{t('forgotPassword.subtitle')}</p>
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
                      <p className="text-sm font-medium text-foreground mb-1">{t('forgotPassword.linkSentTitle')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('forgotPassword.linkSentDesc1')} <span className="text-foreground/70">{email}</span> {t('forgotPassword.linkSentDesc2')}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {t('forgotPassword.noEmail')}{' '}
                  <button onClick={() => { setSent(false); setEmail(''); }} className="text-primary hover:underline">{t('forgotPassword.tryAgain')}</button>.
                </p>
              </motion.div>
            ) : (
              <motion.form variants={item} onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider">{t('forgotPassword.emailLabel')}</Label>
                  <Input id="email" type="email" placeholder="you@company.be" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255} className="h-12" />
                </div>
                <button type="submit" disabled={loading}
                  className="group relative w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-6px_hsl(78_90%_65%/0.4)] active:scale-[0.98]">
                  <span className="relative z-10">{loading ? t('forgotPassword.sending') : t('forgotPassword.sendResetLink')}</span>
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
