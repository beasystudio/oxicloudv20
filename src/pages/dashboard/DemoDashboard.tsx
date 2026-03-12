import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { InviteManagerDialog } from '@/components/demo/InviteManagerDialog';
import { PartnerProgramModal } from '@/components/demo/PartnerProgramModal';

const INSIGHTS = [
  'NOx report missing for 1 active project',
  '2 projects waiting for payment',
  'Your team has 6 active members',
];

const ACTIVITIES = [
  { label: 'New team member added', time: '3 days' },
];

export default function DemoDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/login'); return; }
      const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'there';
      setUserName(name);
    });
  }, [navigate]);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const fade = (d: number) => ({ initial: { opacity: 0, y: 8 } as const, animate: { opacity: 1, y: 0 } as const, transition: { delay: d, duration: 0.3 } });

  return (
    <>
      <Helmet>
        <title>Demo Environment — OxiCloud</title>
        <meta name="description" content="Explore OxiCloud in Demo mode" />
      </Helmet>

      <div className="min-h-screen bg-background overflow-y-auto">
        {/* Header */}
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

        <div className="max-w-[1120px] mx-auto px-5 py-6 pb-16">
          {/* Demo Marquee Banner */}
          <motion.div {...fade(0.05)} className="mb-5">
            <div className="rounded-2xl border border-border bg-card py-2.5 overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span key={i} className="flex items-center gap-6 mx-6 text-[13px] text-muted-foreground">
                    <span className="font-medium text-foreground">You are currently exploring the OxiCloud Demo Environment.</span>
                    <span>All data is fictional. Create a Workspace to start working for real.</span>
                    <span className="text-primary">•</span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Greeting */}
          <motion.div {...fade(0.1)} className="mb-5">
            <p className="text-xs text-muted-foreground mb-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-[2rem] font-bold tracking-tight leading-[1.1] text-foreground">
              {greet()},<br />{userName}.
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              You have 3 open actions and 2 active projects
            </p>
          </motion.div>

          {/* Row 1: Insights | New Project + To Do */}
          <div className="grid grid-cols-12 gap-2.5 mb-2.5">
            <motion.div {...fade(0.15)} className="col-span-12 lg:col-span-7">
              <Card>
                <Label>Smart Insights</Label>
                <div className="space-y-2 mt-2.5">
                  {INSIGHTS.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-[6px] shrink-0" />
                      <span className="text-[13px] text-foreground leading-snug">{t}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div {...fade(0.18)} className="col-span-12 lg:col-span-5 flex flex-col gap-2.5">
              <Button
                onClick={() => navigate('/dashboard/projects')}
                className="h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm w-full shrink-0"
              >
                New Project
              </Button>
              <div className="rounded-2xl bg-foreground text-background px-5 py-4">
                <Label className="text-background/50">Next Step</Label>
                <div className="space-y-2 mt-2.5">
                  <Button
                    onClick={() => navigate('/pilot-demo/create-account')}
                    className="w-full h-9 rounded-full bg-background text-foreground hover:bg-background/90 text-xs font-semibold"
                  >
                    Create my Workspace
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteDialog(true)}
                    className="w-full h-9 rounded-full border-background/20 text-background hover:bg-background/10 text-xs"
                  >
                    Invite my manager
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 2: Team + Projects | Action Required */}
          <div className="grid grid-cols-12 gap-2.5 mb-2.5">
            <motion.div {...fade(0.2)} className="col-span-12 lg:col-span-3 grid grid-rows-2 gap-2.5">
              <Card>
                <Label>Team</Label>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-1">6</p>
                <p className="text-xs text-muted-foreground">active members</p>
              </Card>
              <Card>
                <Label>Projects</Label>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-1">3</p>
                <p className="text-xs text-muted-foreground">2 active</p>
              </Card>
            </motion.div>

            <motion.div {...fade(0.22)} className="col-span-12 lg:col-span-9">
              <Card className="flex items-center justify-between">
                <Label>Action Required</Label>
                <span className="text-sm font-semibold text-foreground">3</span>
              </Card>
            </motion.div>
          </div>

          {/* Row 3: Partner Program | To Do */}
          <div className="grid grid-cols-12 gap-2.5 mb-2.5">
            <motion.div {...fade(0.25)} className="col-span-12 lg:col-span-7">
              <Card>
                <p className="text-sm font-semibold text-foreground">OxiCloud Partner Program</p>
                <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                  Turn every project into revenue. As an OxiCloud partner, your firm earns a commission each time a NOx report is generated — automatically, with zero admin overhead. Clients receive a transparent quote and pay via bank transfer. Your commission settles directly to your company account. No invoicing. No chasing. Just build, and get paid.
                </p>
              </Card>
            </motion.div>

            <motion.div {...fade(0.27)} className="col-span-12 lg:col-span-5">
              <Card>
                <Label>To do</Label>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-1">3</p>
              </Card>
            </motion.div>
          </div>

          {/* Row 4: Explore Modules */}
          <motion.div {...fade(0.3)} className="mb-6">
            <Label className="mb-2">Explore Modules</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {[
                { label: 'Projecten', desc: 'Browse sample projects', path: '/dashboard/projects' },
                { label: 'Contacten', desc: 'View sample contacts', path: '/dashboard/contacts' },
                { label: 'Financieel', desc: 'Settlement overview', path: '/dashboard/financial' },
                { label: 'Partnership', desc: 'Program details', path: '/dashboard/partnership-program' },
              ].map((mod) => (
                <div
                  key={mod.label}
                  onClick={() => navigate(mod.path)}
                  className="rounded-2xl border border-border bg-card px-4 py-3 cursor-pointer hover:border-foreground/20 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{mod.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer badges */}
          <motion.div {...fade(0.35)}>
            <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground">
              {['100% free for architects', 'No subscriptions', 'No credit card'].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <InviteManagerDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />
      <AnimatePresence>
        {showPartnerModal && <PartnerProgramModal onClose={() => setShowPartnerModal(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ── Primitives ── */

function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-2xl border border-border bg-card px-5 py-3.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

function Label({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={`text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}
