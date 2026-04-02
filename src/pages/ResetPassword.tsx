import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { ArrowUpRight } from '@/components/icons/OxiIcons';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import loginBackground from '@/assets/login-background.jpg';
import oxicloudLogo from '@/assets/oxicloud-logo-white.png';

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) setIsRecovery(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError(t('resetPassword.errorMinLength')); return; }
    if (password !== confirmPassword) { setError(t('resetPassword.errorMismatch')); return; }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else { setSuccess(true); setTimeout(() => navigate('/login'), 3000); }
    setLoading(false);
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  return (
    <>
      <Helmet><title>{t('resetPassword.pageTitle')}</title></Helmet>
      <div className="min-h-screen flex bg-background">
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
          <img src={loginBackground} alt="Architecture" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <Link to="/"><img src={oxicloudLogo} alt="OxiCloud" className="h-11 w-auto" /></Link>
            <div className="max-w-md">
              <p className="text-white/50 text-xs uppercase tracking-[0.14em] mb-3">{t('resetPassword.sidebarTag')}</p>
              <p className="text-white text-2xl font-semibold leading-snug tracking-tight">{t('resetPassword.sidebarTitle')}<br />{t('resetPassword.sidebarTitleBr')}</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 lg:px-16 xl:px-20">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-sm mx-auto w-full">
            <motion.div variants={item} className="mb-10">
              <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">{t('resetPassword.title')}</h1>
              <p className="text-muted-foreground text-sm">{t('resetPassword.subtitle')}</p>
            </motion.div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <motion.div variants={item} className="p-6 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">{t('resetPassword.successTitle')}</p>
                    <p className="text-xs text-muted-foreground">{t('resetPassword.successDesc')}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form variants={item} onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">{t('resetPassword.newPasswordLabel')}</Label>
                  <Input type="password" placeholder={t('resetPassword.newPasswordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} maxLength={100} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">{t('resetPassword.confirmPasswordLabel')}</Label>
                  <Input type="password" placeholder={t('resetPassword.confirmPasswordPlaceholder')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} maxLength={100} className="h-12" />
                </div>
                <button type="submit" disabled={loading} className="group relative w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-6px_hsl(78_90%_65%/0.4)] active:scale-[0.98]">
                  <span className="relative z-10">{loading ? t('resetPassword.saving') : t('resetPassword.savePassword')}</span>
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
