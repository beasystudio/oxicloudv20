import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { MainNavigation } from '@/components/MainNavigation';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Activation = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();
  const { activateAccount, users } = useMockAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      const user = users.find(u => u.activationToken === token);
      if (user) { setEmail(user.email); setUserName(user.name); setTokenValid(true); }
      else { setError(t('activation.errorInvalidToken')); setTokenValid(false); }
    } else { setError(t('activation.errorNoToken')); setTokenValid(false); }
  }, [token, users, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!token) { setError(t('activation.errorInvalidLink')); setLoading(false); return; }
    if (password !== confirmPassword) { setError(t('activation.errorPasswordMismatch')); setLoading(false); return; }
    if (password.length < 6) { setError(t('activation.errorPasswordLength')); setLoading(false); return; }
    const result = activateAccount(token, password);
    if (result.success) {
      toast({ title: t('activation.successTitle'), description: t('activation.successDesc') });
      navigate('/login');
    } else {
      setError(result.error || 'Activation failed');
      toast({ title: "Activation failed", description: result.error, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>{t('activation.pageTitle')}</title>
        <meta name="description" content="Activate your OxiCloud account" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <MainNavigation />
        <main className="container mx-auto px-6 py-16 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">{t('activation.title')}</CardTitle>
              <CardDescription className="text-center">{t('activation.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {tokenValid && userName && (
                <Alert className="mb-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Welcome, <strong>{userName}</strong>! {t('activation.welcomeMessage')}
                  </AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('activation.email')}</Label>
                  <Input id="email" type="email" value={email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('activation.password')}</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={!tokenValid} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('activation.confirmPassword')}</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} disabled={!tokenValid} />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !tokenValid}>
                  {loading ? t('activation.activating') : t('activation.activateAccount')}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  {t('activation.alreadyActivated')}{' '}
                  <Link to="/login" className="text-primary hover:underline">{t('activation.signInHere')}</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default Activation;
