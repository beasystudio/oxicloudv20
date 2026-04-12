import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  Building2,
  Users,
  Rocket,
  Upload,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  FolderKanban,
  BookUser,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { PilotOnboardingFlow1 } from '@/components/pilot/PilotOnboardingFlow1';
import { useNavigate } from 'react-router-dom';

/* ─── Storage ─── */
const STORAGE_KEY = 'oxicloud_onboarding_v3';

interface SavedState {
  currentStep: number;
  completedSteps: number[];
  dismissed: boolean;
}

const loadState = (): SavedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { currentStep: 0, completedSteps: [], dismissed: false };
};

const saveState = (s: SavedState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

/* ─── Step definitions ─── */
interface WizardStep {
  id: string;
  label: string;
  labelNl: string;
  icon: React.ComponentType<{ className?: string }>;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'company', label: 'Company', labelNl: 'Bedrijf', icon: Building2 },
  { id: 'team', label: 'Team', labelNl: 'Team', icon: Users },
  { id: 'complete', label: 'Ready', labelNl: 'Klaar', icon: Rocket },
];

/* ─── Types ─── */
interface OnboardingChecklistProps {
  onComplete?: () => void;
  onDismiss?: () => void;
  forceShow?: boolean;
}

/* ═══════════════════════════════════════════════
   STEP PANELS
   ═══════════════════════════════════════════════ */

/* Final Screen: Workspace Configured */
/* Auto-mark step 2 as completed on first render */
function CompleteStepWrapper({
  completedSet,
  markStepComplete,
  children,
}: {
  completedSet: Set<number>;
  markStepComplete: (i: number) => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!completedSet.has(2)) {
      markStepComplete(2);
    }
  }, []); // only on first mount

  return (
    <motion.div
      key="complete"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

function WorkspaceCompletePanel({ nl, onNavigate }: { nl: boolean; onNavigate: (path: string) => void }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-8">
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {nl ? 'Uw workspace is volledig geconfigureerd!' : 'Your workspace is successfully fully configured!'}
      </h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
        {nl
          ? 'Kies hieronder waar u wilt beginnen.'
          : 'Choose where you\'d like to start next.'}
      </p>

      <div className="w-full space-y-3 max-w-sm">
        <button
          onClick={() => onNavigate('/pilot-demo/projects')}
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all"
        >
          <span>{nl ? 'Maak uw eerste project' : 'Create your first project'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigate('/pilot-demo/contacts')}
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-full border border-border text-foreground font-medium text-sm hover:bg-muted/40 transition-all"
        >
          <span>{nl ? 'Ga naar Contacten' : 'Go to Contacts'}</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground/60 mt-8 max-w-xs leading-relaxed">
        {nl
          ? 'U kunt altijd meer gedetailleerde instellingen (bv. privacy-machtigingen voor teams) later aanpassen in Instellingen.'
          : 'You can always adjust more detailed settings (e.g., privacy permissions for teams) later in Settings.'}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROGRESS STEPPER
   ═══════════════════════════════════════════════ */
function ProgressStepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  nl,
}: {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (index: number) => void;
  nl: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 w-full">
      {steps.map((step, i) => {
        const done = completedSteps.has(i);
        const active = i === currentStep;
        const clickable = done || i <= Math.max(...Array.from(completedSteps), -1) + 1;

        return (
          <button
            key={step.id}
            onClick={() => clickable && onStepClick(i)}
            className={cn(
              'flex items-center gap-3 w-full rounded-xl px-3 py-2 text-left transition-all',
              active && 'bg-muted/60',
              clickable && !active && 'hover:bg-muted/30 cursor-pointer',
              !clickable && 'cursor-default opacity-35'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold transition-colors',
                done
                  ? 'bg-foreground text-background'
                  : active
                  ? 'border-2 border-foreground text-foreground'
                  : 'border border-border text-muted-foreground'
              )}
            >
              {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium',
                done ? 'text-muted-foreground line-through' : active ? 'text-foreground' : 'text-muted-foreground/70'
              )}>
                {nl ? step.labelNl : step.label}
              </p>
            </div>
            {active && !done && (
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN WIZARD
   ═══════════════════════════════════════════════ */
export const OnboardingChecklist = ({ onComplete, onDismiss, forceShow }: OnboardingChecklistProps) => {
  const { currentUser } = useMockAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const nl = language === 'nl';

  const [state, setState] = useState<SavedState>(loadState);
  const [showWizardModal, setShowWizardModal] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const completedSet = new Set(state.completedSteps);
  const allDone = WIZARD_STEPS.every((_, i) => completedSet.has(i));

  const markStepComplete = (stepIndex: number) => {
    setState((prev) => {
      const next = {
        ...prev,
        completedSteps: [...new Set([...prev.completedSteps, stepIndex])],
        currentStep: Math.min(stepIndex + 1, WIZARD_STEPS.length - 1),
      };
      return next;
    });
  };

  const goToStep = (stepIndex: number) => {
    setState((prev) => ({ ...prev, currentStep: stepIndex }));
  };

  const handleNavigate = (path: string) => {
    setState((prev) => ({ ...prev, dismissed: true }));
    setShowWizardModal(false);
    navigate(path);
    onComplete?.();
  };

  const handleDismiss = () => {
    setState((prev) => ({ ...prev, dismissed: true }));
    setShowWizardModal(false);
    onDismiss?.();
  };

  // If all done and not forced, hide the card
  if (allDone && !forceShow && state.dismissed) return null;

  const progressPct = Math.round((completedSet.size / WIZARD_STEPS.length) * 100);

  return (
    <>
      {/* Summary card on dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
      >
        <div className="rounded-2xl border border-border bg-card px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {nl ? 'Setup Guide' : 'Setup Guide'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {allDone
                  ? nl ? 'Uw workspace is volledig geconfigureerd' : 'Your workspace is fully configured'
                  : nl ? 'Voltooi elke stap om uw workspace te activeren' : 'Complete each step to activate your workspace'}
              </p>
            </div>
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeDasharray={`${progressPct * 0.94} 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
                {completedSet.size}/{WIZARD_STEPS.length}
              </span>
            </div>
          </div>

          {/* Mini stepper preview */}
          <ProgressStepper
            steps={WIZARD_STEPS}
            currentStep={state.currentStep}
            completedSteps={completedSet}
            onStepClick={(i) => {
              goToStep(i);
              setShowWizardModal(true);
            }}
            nl={nl}
          />

          <Button
            variant="outline"
            onClick={() => setShowWizardModal(true)}
            className="w-full mt-3"
            size="sm"
          >
            {allDone
              ? nl ? 'Bekijk resultaat' : 'View result'
              : nl ? 'Doorgaan met instellen' : 'Continue setup'}
          </Button>
        </div>
      </motion.div>

      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowWizardModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="max-w-xl w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with stepper */}
              <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-foreground">
                    {nl ? 'Workspace instellen' : 'Set up your Workspace'}
                  </h3>
                  <button
                    onClick={() => setShowWizardModal(false)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <ProgressStepper
                  steps={WIZARD_STEPS}
                  currentStep={state.currentStep}
                  completedSteps={completedSet}
                  onStepClick={goToStep}
                  nl={nl}
                />
              </div>

              {/* Step content */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Step 0: Company */}
                  {state.currentStep === 0 && (
                    <motion.div
                      key="company"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CompanyStepInline
                        nl={nl}
                        done={completedSet.has(0)}
                        onComplete={() => markStepComplete(0)}
                      />
                    </motion.div>
                  )}

                  {/* Step 1: Team */}
                  {state.currentStep === 1 && (
                    <motion.div
                      key="team"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.15 }}
                    >
                      <TeamStepInline
                        nl={nl}
                        done={completedSet.has(1)}
                        onComplete={() => markStepComplete(1)}
                        onBack={() => goToStep(0)}
                      />
                    </motion.div>
                  )}

                  {/* Step 2: Complete - auto-mark as done on first visit */}
                  {state.currentStep === 2 && (
                    <CompleteStepWrapper
                      completedSet={completedSet}
                      markStepComplete={markStepComplete}
                    >
                      <WorkspaceCompletePanel nl={nl} onNavigate={handleNavigate} />
                    </CompleteStepWrapper>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legacy PilotOnboardingFlow1 modal - reused for company/team content */}
      <AnimatePresence>
        {/* We embed the steps inline now, no separate flow needed */}
      </AnimatePresence>
    </>
  );
};

/* ═══════════════════════════════════════════════
   INLINE STEP PANELS (inside wizard modal)
   ═══════════════════════════════════════════════ */

function CompanyStepInline({ nl, done, onComplete }: { nl: boolean; done: boolean; onComplete: () => void }) {
  const [companyName, setCompanyName] = useState('Architectenbureau Janssen');
  const [address, setAddress] = useState('Koningin Astridlaan 12, 2800 Mechelen');
  const [vat, setVat] = useState('BE0123.456.789');
  const [logoUploaded, setLogoUploaded] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-0.5">
          {nl ? 'Bedrijfsprofiel instellen' : 'Set up Company Profile'}
        </h4>
        <p className="text-xs text-muted-foreground">
          {nl ? 'Upload logo, bevestig bedrijfsgegevens en BTW' : 'Upload logo, confirm legal name, address & VAT'}
        </p>
      </div>

      {/* Logo */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {nl ? 'Bedrijfslogo' : 'Company Logo'}
        </label>
        <div
          className={cn(
            'mt-1.5 border-2 border-dashed rounded-xl h-20 flex items-center justify-center cursor-pointer transition-colors',
            logoUploaded ? 'border-foreground/20 bg-muted/30' : 'border-border hover:border-foreground/20'
          )}
          onClick={() => setLogoUploaded(true)}
        >
          {logoUploaded ? (
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <span>logo.png</span>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">{nl ? 'Klik om te uploaden' : 'Click to upload'}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{nl ? 'Bedrijfsnaam' : 'Company Name'}</label>
        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{nl ? 'Adres' : 'Address'}</label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{nl ? 'BTW-nummer' : 'VAT Number'}</label>
        <Input value={vat} onChange={(e) => setVat(e.target.value)} className="mt-1.5" />
      </div>

      <Button onClick={onComplete} className="w-full mt-2">
        {done
          ? nl ? 'Opnieuw opgeslagen' : 'Saved'
          : nl ? 'Bevestigen & doorgaan' : 'Confirm & continue'}
      </Button>
    </div>
  );
}

function TeamStepInline({
  nl,
  done,
  onComplete,
  onBack,
}: {
  nl: boolean;
  done: boolean;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [emails, setEmails] = useState<string[]>(['']);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-0.5">
            {nl ? 'Team configureren' : 'Set up your Team'}
          </h4>
          <p className="text-xs text-muted-foreground">
            {nl ? 'Nodig teamleden uit via e-mail. U kunt dit later ook doen.' : 'Invite team members by email. You can also do this later.'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {emails.map((email, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder={nl ? 'E-mailadres' : 'Email address'}
              value={email}
              onChange={(e) => {
                const next = [...emails];
                next[i] = e.target.value;
                setEmails(next);
              }}
            />
            {emails.length > 1 && (
              <button
                onClick={() => setEmails(emails.filter((_, j) => j !== i))}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setEmails([...emails, ''])}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {nl ? 'Nog iemand toevoegen' : 'Add another'}
      </button>

      <div className="flex gap-2.5 pt-2">
        <Button variant="ghost" onClick={onComplete} className="flex-1 text-muted-foreground">
          {nl ? 'Overslaan' : 'Skip for now'}
        </Button>
        <Button onClick={onComplete} className="flex-1">
          {nl ? 'Uitnodigingen versturen' : 'Send invites'}
        </Button>
      </div>
    </div>
  );
}
