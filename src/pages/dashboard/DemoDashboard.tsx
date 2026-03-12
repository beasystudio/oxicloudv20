import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TopNavigation } from '@/components/TopNavigation';
import {
  Info, ArrowRight, Users,
  FolderKanban, BookOpen, CreditCard, CheckCircle,
  X, Sparkles } from
'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { InviteManagerDialog } from '@/components/demo/InviteManagerDialog';
import { PartnerProgramModal } from '@/components/demo/PartnerProgramModal';

export default function DemoDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
        return;
      }
      const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'there';
      setUserName(name);
    });
  }, [navigate]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Demo Environment — OxiCloud</title>
        <meta name="description" content="Explore OxiCloud in Demo mode" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Nav — matches production compact header */}
        <header className="border-b border-border bg-background sticky top-0 z-50">
          <div className="flex items-center justify-between px-6 h-14 max-w-6xl mx-auto">
            <span className="text-sm font-semibold tracking-tight text-foreground">OxiCloud</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-primary">Demo Mode</span>
              <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-5 max-w-5xl">
          {/* Header — matches production greeting */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4">
            
            <p className="text-sm text-muted-foreground mb-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight leading-[1.15] text-foreground">
              {greeting()},<br />{userName}.
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              You're exploring the OxiCloud Demo Environment
            </p>
          </motion.header>

          {/* Demo Banner — production card style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-2">
            
            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-0.5">
                    You are currently exploring the OxiCloud Demo Environment
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Browse modules freely. To unlock full features, create your Workspace.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Partner Program Card — production dark card style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-2">
            
            <div className="rounded-2xl bg-secondary text-secondary-foreground p-4 overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-secondary-foreground">Partner Program</h3>
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-primary">Earn Commission</span>
                  </div>
                  <p className="text-sm text-secondary-foreground/70 mb-4 leading-relaxed">
                    Architects earn commission when their firm creates a project and generates a NOx report. 
                    The client pays for the report — commission is transferred to the registered company's bank account.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                    {[
                    { step: '1', title: 'Create project', desc: 'Add project details in OxiCloud' },
                    { step: '2', title: 'Generate report', desc: 'Client receives & pays the quote' },
                    { step: '3', title: 'Earn commission', desc: 'Payment transferred to your firm' }].
                    map((s) =>
                    <div key={s.step} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{s.step}</span>
                        <div>
                          <p className="text-sm font-medium text-secondary-foreground">{s.title}</p>
                          <p className="text-xs text-secondary-foreground/50">{s.desc}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Workspace CTA — production card style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-2">
            
            <div className="rounded-2xl border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-0.5">Unlock Full OxiCloud</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create your company Workspace to access the Partner Program, create real projects, and start earning commission. It's completely free.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/pilot-demo/create-account')} size="sm" className="gap-1.5 font-medium">
                  Create my Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowInviteDialog(true)} className="gap-1.5">
                  Invite my manager
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Browse Modules — production card grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}>
            
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">EXPLORE MODULES</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
              { label: 'Projecten', desc: 'Browse sample projects', icon: FolderKanban, path: '/dashboard/projects' },
              { label: 'Contacten', desc: 'View sample contacts', icon: Users, path: '/dashboard/contacts' },
              { label: 'Financieel', desc: 'Settlement overview', icon: CreditCard, path: '/dashboard/financial' },
              { label: 'Partnership', desc: 'Program details', icon: BookOpen, path: '/dashboard/partnership-program' }].
              map((mod) =>
              <div
                key={mod.label}
                className="rounded-2xl border border-border p-4 cursor-pointer hover:border-foreground/20 transition-colors group"
                onClick={() => navigate(mod.path)}>
                
                  <p className="text-sm font-medium text-foreground mb-0.5">{mod.label}</p>
                  <p className="text-sm text-muted-foreground">{mod.desc}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Free messaging — production style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center">
            
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              {['100% free for architects', 'No subscriptions', 'No credit card'].map((t) =>
              <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  {t}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <InviteManagerDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />
      
      <AnimatePresence>
        {showPartnerModal &&
        <PartnerProgramModal onClose={() => setShowPartnerModal(false)} />
        }
      </AnimatePresence>
    </>);

}
