import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MainNavigation } from '@/components/MainNavigation';
import { useLanguage } from '@/i18n/LanguageContext';
import { z } from 'zod';
import type { User, Session } from '@supabase/supabase-js';

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  username: z.string().trim().min(2, { message: "Username must be at least 2 characters" }).max(50).optional(),
});

const Auth = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) setTimeout(() => navigate('/projects'), 0);
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) navigate('/projects');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('signup-email') as string;
    const password = formData.get('signup-password') as string;
    const username = formData.get('username') as string;
    try {
      const validated = authSchema.parse({ email, password, username });
      const { error } = await supabase.auth.signUp({
        email: validated.email, password: validated.password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { username: validated.username } }
      });
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Welcome to OxiCloud" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) toast({ title: "Validation error", description: error.errors[0].message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('signin-email') as string;
    const password = formData.get('signin-password') as string;
    try {
      const validated = authSchema.parse({ email, password });
      const { error } = await supabase.auth.signInWithPassword({ email: validated.email, password: validated.password });
      if (error) toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } catch (error) {
      if (error instanceof z.ZodError) toast({ title: "Validation error", description: error.errors[0].message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet>
        <title>{t('auth.signIn')} - OxiCloud</title>
        <meta name="description" content="Sign in to OxiCloud" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <MainNavigation />
        <main className="container mx-auto px-6 py-16 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">{t('auth.welcome')}</CardTitle>
              <CardDescription className="text-center">{t('auth.signInOrCreate')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                  <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">{t('auth.email')}</Label>
                      <Input id="signin-email" name="signin-email" type="email" placeholder="you@example.com" required maxLength={255} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">{t('auth.password')}</Label>
                      <Input id="signin-password" name="signin-password" type="password" placeholder="••••••••" required minLength={6} maxLength={100} />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t('auth.signingIn') : t('auth.signIn')}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">{t('auth.username')}</Label>
                      <Input id="username" name="username" type="text" placeholder="your_username" required minLength={2} maxLength={50} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('auth.email')}</Label>
                      <Input id="signup-email" name="signup-email" type="email" placeholder="you@example.com" required maxLength={255} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('auth.password')}</Label>
                      <Input id="signup-password" name="signup-password" type="password" placeholder="••••••••" required minLength={6} maxLength={100} />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default Auth;
