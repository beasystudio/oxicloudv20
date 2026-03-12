import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle2,
  ChevronDown,
  Building2,
  Users,
  Settings,
  ShieldCheck,
  Upload,
  Rocket,
  Lock,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

/* ─── Storage key ─── */
const STORAGE_KEY = 'oxicloud_onboarding_v2';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  mandatory: boolean;
  path?: string;
  hasInlinePanel?: boolean;
}

interface SavedState {
  completedSteps: string[];
  legalSelfBilling: boolean;
  legalSendConsent: boolean;
  dismissed: boolean;
}

const loadState = (): SavedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { completedSteps: [], legalSelfBilling: false, legalSendConsent: false, dismissed: false };
};

const saveState = (state: SavedState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

/* ─── Component ─── */
interface OnboardingChecklistProps {
  onComplete?: () => void;
  onDismiss?: () => void;
}

export const OnboardingChecklist = ({ onComplete, onDismiss }: OnboardingChecklistProps) => {
  const navigate = useNavigate();
  const { currentUser } = useMockAuth();
  const { language } = useLanguage();
  const isCeo = currentUser?.role === 'client_owner';
  const nl = language === 'nl';

  const steps: OnboardingStep[] = [
    {
      id: 'company-profile',
      title: nl ? 'Bedrijfsprofiel instellen' : 'Set up Company Profile',
      description: nl
        ? 'Upload uw logo, bevestig bedrijfsgegevens en BTW-nummer'
        : 'Upload logo, confirm legal name, address and VAT details',
      icon: Building2,
      mandatory: true,
      path: '/pilot-demo/settings',
    },
    {
      id: 'team-setup',
      title: nl ? 'Team configureren' : 'Set up your Team',
      description: nl
        ? 'Maak teamgroepen aan, nodig leden uit en wijs rollen toe'
        : 'Create team groups, invite members and assign roles',
      icon: Users,
      mandatory: true,
      path: '/pilot-demo/settings',
    },
    {
      id: 'contact-config',
      title: nl ? 'Contactconfiguratie' : 'Configure Contacts',
      description: nl
        ? 'Stel contacttaxonomie, standaardvelden en tags in'
        : 'Define contact taxonomy, default fields and custom tags',
      icon: Settings,
      mandatory: true,
      path: '/pilot-demo/settings',
    },
    {
      id: 'financial-agreement',
      title: nl ? 'Financiële overeenkomst' : 'Financial Agreement',
      description: isCeo
        ? nl
          ? 'Accepteer de self-billing en offerte-autorisatie (eenmalig, als CEO)'
          : 'Review and sign self-billing & quote approval (one-time, as CEO)'
        : nl
          ? 'Reeds goedgekeurd door uw CEO'
          : 'Already approved by your CEO',
      icon: ShieldCheck,
      mandatory: true,
      hasInlinePanel: true,
    },
    {
      id: 'data-migration',
      title: nl ? 'Datamigratie' : 'Data Migration',
      description: nl
        ? 'Importeer een bestaand klantenbestand via CSV (optioneel)'
        : 'Import an existing client database via CSV upload (optional)',
      icon: Upload,
      mandatory: false,
      path: '/pilot-demo/contacts',
    },
    {
      id: 'workspace-ready',
      title: nl ? 'Workspace klaar' : 'Workspace Ready',
      description: nl
        ? 'Ga naar het projectdashboard en maak uw eerste dossier'
        : 'Head to the project dashboard and create your first dossier',
      icon: Rocket,
      mandatory: true,
      path: '/pilot-demo/projects',
    },
  ];

  const [state, setState] = useState<SavedState>(loadState);
  const [expandedLegal, setExpandedLegal] = useState(false);
  const [selfBilling, setSelfBilling] = useState(state.legalSelfBilling);
  const [sendConsent, setSendConsent] = useState(state.legalSendConsent);

  // Persist
  useEffect(() => { saveState(state); }, [state]);

  // Auto-complete legal for non-CEO if CEO approved
  useEffect(() => {
    if (!isCeo && state.legalSelfBilling && state.legalSendConsent) {
      markComplete('financial-agreement');
    }
  }, []);

  const completedSet = new Set(state.completedSteps);
  const completedCount = steps.filter(s => completedSet.has(s.id)).length;
  const mandatorySteps = steps.filter(s => s.mandatory);
  const mandatoryComplete = mandatorySteps.every(s => completedSet.has(s.id));

  // Sequential unlock: a step is unlocked if all prior mandatory steps are done (or it's optional and prior mandatory are done)
  const isUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    // All mandatory steps before this index must be complete
    for (let i = 0; i < index; i++) {
      if (steps[i].mandatory && !completedSet.has(steps[i].id)) {
        // Exception: step 5 (data-migration, optional) can be skipped
        if (steps[i].id === 'data-migration') continue;
        return false;
      }
    }
    return true;
  };

  const markComplete = (stepId: string) => {
    setState(prev => {
      if (prev.completedSteps.includes(stepId)) return prev;
      const next = { ...prev, completedSteps: [...prev.completedSteps, stepId] };
      // Check all mandatory done
      const allDone = mandatorySteps.every(s => next.completedSteps.includes(s.id));
      if (allDone) onComplete?.();
      return next;
    });
  };

  const handleStepClick = (step: OnboardingStep, index: number) => {
    if (!isUnlocked(index)) return;
    if (completedSet.has(step.id)) return;

    if (step.hasInlinePanel) {
      setExpandedLegal(!expandedLegal);
      return;
    }

    // Mark complete and navigate
    markComplete(step.id);
    if (step.path) navigate(step.path);
  };

  const handleSkipMigration = () => {
    markComplete('data-migration');
  };

  const handleLegalAccept = () => {
    if (selfBilling && sendConsent) {
      setState(prev => ({ ...prev, legalSelfBilling: true, legalSendConsent: true }));
      markComplete('financial-agreement');
      setExpandedLegal(false);
    }
  };

  const handleDismiss = () => {
    setState(prev => ({ ...prev, dismissed: true }));
    onDismiss?.();
  };

  // Hide when all mandatory done
  if (mandatoryComplete && completedSet.has('data-migration')) return null;
  if (state.dismissed && mandatoryComplete) return null;

  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <div className="rounded-2xl border border-border bg-card px-5 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {nl ? 'Configuratie voltooien' : 'Complete Configuration'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {nl ? 'Voltooi elke stap om uw workspace te activeren' : 'Complete each step to activate your workspace'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress ring */}
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2.5"
                  strokeDasharray={`${progressPct * 0.94} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
                {completedCount}/{steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-1">
          {steps.map((step, index) => {
            const done = completedSet.has(step.id);
            const unlocked = isUnlocked(index);
            const Icon = step.icon;

            return (
              <div key={step.id}>
                <button
                  onClick={() => handleStepClick(step, index)}
                  disabled={!unlocked || done}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group',
                    done && 'opacity-40',
                    !unlocked && !done && 'opacity-30 cursor-not-allowed',
                    unlocked && !done && 'hover:bg-muted/50 cursor-pointer'
                  )}
                >
                  {/* Step indicator */}
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold',
                    done
                      ? 'bg-foreground text-background'
                      : unlocked
                        ? 'border border-border text-muted-foreground'
                        : 'border border-border/50 text-muted-foreground/40'
                  )}>
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : !unlocked ? <Lock className="h-3 w-3" /> : index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm font-medium', done && 'line-through text-muted-foreground')}>
                        {step.title}
                      </p>
                      {!step.mandatory && !done && (
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
                          {nl ? 'Optioneel' : 'Optional'}
                        </span>
                      )}
                    </div>
                    {!done && unlocked && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{step.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  {step.hasInlinePanel && !done && unlocked && (
                    <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform shrink-0', expandedLegal && 'rotate-180')} />
                  )}
                  {step.id === 'data-migration' && !done && unlocked && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSkipMigration(); }}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      {nl ? 'Overslaan' : 'Skip'}
                    </button>
                  )}
                </button>

                {/* Legal inline panel */}
                <AnimatePresence>
                  {step.hasInlinePanel && expandedLegal && !done && unlocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-9 mt-1.5 p-4 rounded-xl border border-border bg-muted/20 space-y-3.5">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {isCeo
                            ? nl
                              ? 'Als CEO dient u de volgende overeenkomsten eenmalig te accepteren.'
                              : 'As CEO, you must accept the following agreements once.'
                            : nl
                              ? 'Deze overeenkomsten zijn reeds goedgekeurd door uw CEO.'
                              : 'These agreements have already been approved by your CEO.'
                          }
                        </p>

                        <div className="space-y-2.5">
                          <label className="flex items-start gap-2.5 cursor-pointer">
                            <Checkbox
                              checked={selfBilling}
                              onCheckedChange={(c) => setSelfBilling(c === true)}
                              disabled={!isCeo}
                              className="mt-0.5"
                            />
                            <div className="text-sm leading-relaxed">
                              <span className="font-medium">Self-billing {nl ? 'overeenkomst' : 'agreement'}</span>
                              <span className="text-muted-foreground">
                                {nl
                                  ? ' — Na ontvangst van betaling stellen wij namens u een self-billing factuur op voor de commissie-uitbetaling.'
                                  : ' — Upon payment receipt, we issue a self-billing invoice on your behalf for commission settlement.'}
                              </span>
                              <button type="button" className="block text-primary text-xs mt-1 hover:underline">
                                <Download className="inline h-3 w-3 mr-1" />
                                {nl ? 'Download overeenkomst (PDF)' : 'Download agreement (PDF)'}
                              </button>
                            </div>
                          </label>

                          <label className="flex items-start gap-2.5 cursor-pointer">
                            <Checkbox
                              checked={sendConsent}
                              onCheckedChange={(c) => setSendConsent(c === true)}
                              disabled={!isCeo}
                              className="mt-0.5"
                            />
                            <div className="text-sm leading-relaxed">
                              <span className="font-medium">{nl ? 'Offerte-autorisatie' : 'Quote authorization'}</span>
                              <span className="text-muted-foreground">
                                {nl
                                  ? ' — Ik autoriseer OxiCloud om offertes namens mijn bedrijf naar eindklanten te versturen.'
                                  : ' — I authorize OxiCloud to send quotes to end clients on behalf of my company.'}
                              </span>
                            </div>
                          </label>
                        </div>

                        {isCeo && (
                          <Button
                            size="sm"
                            disabled={!selfBilling || !sendConsent}
                            onClick={handleLegalAccept}
                            className="w-full"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            {nl ? 'Accepteren & doorgaan' : 'Accept & continue'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
