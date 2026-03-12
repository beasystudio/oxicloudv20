import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Info, ArrowRight, Users, Plus,
  FolderKanban, BookOpen, CreditCard, CheckCircle,
  Sparkles, Send, Activity, Lightbulb, CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { InviteManagerDialog } from '@/components/demo/InviteManagerDialog';
import { PartnerProgramModal } from '@/components/demo/PartnerProgramModal';

/* ── mock data ── */
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

  const fade = (d: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.35 } });

  return (
    <>
      <Helmet>
        <title>Demo Environment — OxiCloud</title>
        <meta name="description" content="Explore OxiCloud in Demo mode" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* ── Header ── */}
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

        <div className="max-w-[1120px] mx-auto px-5 py-6">
          {/* ── Demo Banner ── */}
          <motion.div {...fade(0.05)} className="mb-5">
            <div className="rounded-2xl border border-border bg-card px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground leading-tight">
                    You are currently exploring the OxiCloud Demo Environment.
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">
                    All data is fictional. Create a Workspace to start working for real.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" className="h-8 px-4 text-xs font-semibold rounded-full" onClick={() => navigate('/pilot-demo/create-account')}>
                  Create my Workspace
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-4 text-xs rounded-full gap-1.5" onClick={() => setShowInviteDialog(true)}>
                  <Send className="w-3 h-3" />
                  Invite my manager
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ── Greeting ── */}
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

          {/* ── Bento Grid ── */}
          <div className="grid grid-cols-12 gap-2.5">

            {/* Row 1: Insights + New Project + To Do */}
            <motion.div {...fade(0.15)} className="col-span-12 lg:col-span-7">
              <BentoCard className="h-full">
                <CardLabel>Smart Insights</CardLabel>
                <div className="space-y-2.5 mt-3">
                  {INSIGHTS.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-[7px] shrink-0" />
                      <span className="text-[13px] text-foreground leading-snug">{t}</span>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </motion.div>

            <motion.div {...fade(0.18)} className="col-span-6 lg:col-span-5 flex flex-col gap-2.5">
              {/* New Project button */}
              <Button
                onClick={() => navigate('/dashboard/projects')}
                className="h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm gap-2 w-full"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Button>

              {/* To Do */}
              <BentoCard className="flex-1 flex flex-col justify-between">
                <CardLabel>To do</CardLabel>
                <p className="text-3xl font-bold tracking-tight text-foreground mt-1">3</p>
              </BentoCard>
            </motion.div>

            {/* Row 2: Team + Recent Activity */}
            <motion.div {...fade(0.2)} className="col-span-6 lg:col-span-3 flex flex-col gap-2.5">
              <BentoCard>
                <CardLabel>Team</CardLabel>
                <p className="text-3xl font-bold tracking-tight text-foreground mt-1">6</p>
                <p className="text-xs text-muted-foreground">active members</p>
              </BentoCard>
              <BentoCard>
                <CardLabel>Projects</CardLabel>
                <p className="text-3xl font-bold tracking-tight text-foreground mt-1">3</p>
                <p className="text-xs text-muted-foreground">2 active</p>
              </BentoCard>
            </motion.div>

            <motion.div {...fade(0.22)} className="col-span-6 lg:col-span-9">
              <BentoCard className="h-full flex flex-col">
                <CardLabel>Recent Activity</CardLabel>
                <div className="flex-1 mt-3">
                  {ACTIVITIES.length > 0 ? (
                    <div className="space-y-3">
                      {ACTIVITIES.map((a, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[13px] text-foreground">{a.label}</span>
                          <span className="text-xs text-muted-foreground shrink-0 ml-3">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </BentoCard>
            </motion.div>

            {/* Row 3: Partner Program + Next Step */}
            <motion.div {...fade(0.25)} className="col-span-12 lg:col-span-7">
              <BentoCard className="bg-card">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">OxiCloud Partner Program</p>
                    <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                      Architects earn commission when their firm creates a project and generates a NOx report. 
                      The client pays for the report via bank transfer after receiving a quote. 
                      Commission is transferred to the company's bank account.
                    </p>
                  </div>
                </div>
              </BentoCard>
            </motion.div>

            <motion.div {...fade(0.27)} className="col-span-12 lg:col-span-5">
              <BentoCard className="bg-foreground text-background h-full flex flex-col justify-between">
                <CardLabel className="text-background/50">Next Step</CardLabel>
                <div className="space-y-2 mt-3">
                  <Button
                    onClick={() => navigate('/pilot-demo/create-account')}
                    className="w-full h-9 rounded-full bg-background text-foreground hover:bg-background/90 text-xs font-semibold gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create my Workspace
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteDialog(true)}
                    className="w-full h-9 rounded-full border-background/20 text-background hover:bg-background/10 text-xs gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Invite my manager
                  </Button>
                </div>
              </BentoCard>
            </motion.div>

            {/* Row 4: Explore Modules */}
            <motion.div {...fade(0.3)} className="col-span-12">
              <CardLabel className="mb-2">Explore Modules</CardLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { label: 'Projecten', desc: 'Browse sample projects', icon: FolderKanban, path: '/dashboard/projects' },
                  { label: 'Contacten', desc: 'View sample contacts', icon: Users, path: '/dashboard/contacts' },
                  { label: 'Financieel', desc: 'Settlement overview', icon: CreditCard, path: '/dashboard/financial' },
                  { label: 'Partnership', desc: 'Program details', icon: BookOpen, path: '/dashboard/partnership-program' },
                ].map((mod) => (
                  <div
                    key={mod.label}
                    onClick={() => navigate(mod.path)}
                    className="rounded-2xl border border-border bg-card p-4 cursor-pointer hover:border-foreground/20 transition-colors"
                  >
                    <mod.icon className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">{mod.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Footer badges */}
            <motion.div {...fade(0.35)} className="col-span-12 mt-2 mb-2">
              <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground">
                {['100% free for architects', 'No subscriptions', 'No credit card'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InviteManagerDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />
      <AnimatePresence>
        {showPartnerModal && <PartnerProgramModal onClose={() => setShowPartnerModal(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ── Shared primitives ── */

function BentoCard({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-2xl border border-border bg-card px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardLabel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={`text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}
