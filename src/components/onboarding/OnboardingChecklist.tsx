import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  X,
  Plus,
  Trash2 } from
'lucide-react';
import { cn } from '@/lib/utils';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { PilotOnboardingFlow1 } from '@/components/pilot/PilotOnboardingFlow1';

/* ─── Storage ─── */
const STORAGE_KEY = 'oxicloud_onboarding_v2';

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

const saveState = (s: SavedState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

/* ─── Types ─── */
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{className?: string;}>;
  mandatory: boolean;
}

interface OnboardingChecklistProps {
  onComplete?: () => void;
  onDismiss?: () => void;
  forceShow?: boolean;
}

/* ═══════════════════════════════════════════════
   STEP PANELS — each step opens as a modal overlay
   ═══════════════════════════════════════════════ */

function StepModal({ title, children, onClose }: {title: string;children: React.ReactNode;onClose: () => void;}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>);

}

/* Step 1: Company Profile */
function CompanyProfilePanel({ onComplete, onClose, nl }: {onComplete: () => void;onClose: () => void;nl: boolean;}) {
  const [companyName, setCompanyName] = useState('Architectenbureau Janssen');
  const [address, setAddress] = useState('Koningin Astridlaan 12, 2800 Mechelen');
  const [vat, setVat] = useState('BE0123.456.789');
  const [logoUploaded, setLogoUploaded] = useState(false);

  return (
    <StepModal title={nl ? 'Bedrijfsprofiel instellen' : 'Set up Company Profile'} onClose={onClose}>
      <div className="space-y-4">
        {/* Logo */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{nl ? 'Bedrijfslogo' : 'Company Logo'}</label>
          <div
            className={cn(
              "mt-1.5 border-2 border-dashed rounded-xl h-24 flex items-center justify-center cursor-pointer transition-colors",
              logoUploaded ? "border-foreground/20 bg-muted/30" : "border-border hover:border-foreground/20"
            )}
            onClick={() => setLogoUploaded(true)}>
            
            {logoUploaded ?
            <div className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4" />
                <span>logo.png</span>
              </div> :

            <div className="text-center">
                <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">{nl ? 'Klik om te uploaden' : 'Click to upload'}</p>
              </div>
            }
          </div>
        </div>

        {/* Fields */}
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
          {nl ? 'Bevestigen & doorgaan' : 'Confirm & continue'}
        </Button>
      </div>
    </StepModal>);

}

/* Step 2: Team Setup */
function TeamSetupPanel({ onComplete, onClose, nl }: {onComplete: () => void;onClose: () => void;nl: boolean;}) {
  const [emails, setEmails] = useState<string[]>(['']);

  return (
    <StepModal title={nl ? 'Team configureren' : 'Set up your Team'} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {nl ? 'Nodig teamleden uit via e-mail. U kunt dit later ook doen.' : 'Invite team members by email. You can also do this later.'}
        </p>

        <div className="space-y-2">
          {emails.map((email, i) =>
          <div key={i} className="flex gap-2">
              <Input
              placeholder={nl ? 'E-mailadres' : 'Email address'}
              value={email}
              onChange={(e) => {
                const next = [...emails];
                next[i] = e.target.value;
                setEmails(next);
              }} />
            
              {emails.length > 1 &&
            <button onClick={() => setEmails(emails.filter((_, j) => j !== i))} className="p-2 text-muted-foreground hover:text-foreground">
                  <Trash2 className="w-4 h-4" />
                </button>
            }
            </div>
          )}
        </div>

        <button
          onClick={() => setEmails([...emails, ''])}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          
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
    </StepModal>);

}

/* Step 3: Contact Configuration */
function ContactConfigPanel({ onComplete, onClose, nl }: {onComplete: () => void;onClose: () => void;nl: boolean;}) {
  // Build editable state from DEFAULT_TAXONOMY
  const [taxonomy, setTaxonomy] = useState(() =>
    DEFAULT_TAXONOMY.map((group) => ({
      hoofdtype: group.hoofdtype,
      subtypes: group.subtypes.map((st) => ({ name: st, isDefault: true })),
      isDefault: true,
    }))
  );
  const [editingCell, setEditingCell] = useState<{ groupIdx: number; subIdx: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newSubtype, setNewSubtype] = useState<{ [groupIdx: number]: string }>({});

  const startRename = (groupIdx: number, subIdx: number, currentName: string) => {
    setEditingCell({ groupIdx, subIdx });
    setEditValue(currentName);
  };

  const confirmRename = () => {
    if (!editingCell || !editValue.trim()) { setEditingCell(null); return; }
    setTaxonomy((prev) => {
      const next = prev.map((g, gi) => gi === editingCell.groupIdx ? {
        ...g,
        subtypes: g.subtypes.map((s, si) => si === editingCell.subIdx ? { ...s, name: editValue.trim() } : s)
      } : g);
      return next;
    });
    setEditingCell(null);
  };

  const addSubtype = (groupIdx: number) => {
    const val = (newSubtype[groupIdx] || '').trim();
    if (!val) return;
    setTaxonomy((prev) => prev.map((g, gi) => gi === groupIdx ? {
      ...g,
      subtypes: [...g.subtypes, { name: val, isDefault: false }]
    } : g));
    setNewSubtype((prev) => ({ ...prev, [groupIdx]: '' }));
  };

  const removeCustomSubtype = (groupIdx: number, subIdx: number) => {
    setTaxonomy((prev) => prev.map((g, gi) => gi === groupIdx ? {
      ...g,
      subtypes: g.subtypes.filter((_, si) => si !== subIdx)
    } : g));
  };

  return (
    <StepModal title={nl ? 'Contactconfiguratie' : 'Configure Contacts'} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          {nl
            ? 'Dit is de standaard contacttaxonomie. U kunt namen aanpassen of subtypes toevoegen.'
            : 'This is the default contact taxonomy. You can rename or add subtypes.'}
        </p>

        {taxonomy.map((group, gi) => (
          <div key={gi} className="space-y-1">
            {/* Group header */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-t-lg bg-muted/60 border border-border">
              <span className="text-sm font-semibold text-foreground">{group.hoofdtype}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                {nl ? 'Verplicht' : 'Required'}
              </span>
            </div>

            {/* Subtypes */}
            <div className="border border-t-0 border-border rounded-b-lg divide-y divide-border overflow-hidden">
              {group.subtypes.map((sub, si) => (
                <div key={si} className="flex items-center justify-between px-3 py-2 bg-background">
                  {editingCell?.groupIdx === gi && editingCell?.subIdx === si ? (
                    <Input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={confirmRename}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setEditingCell(null); }}
                      className="h-7 text-sm max-w-[200px]"
                    />
                  ) : (
                    <span
                      className="text-sm text-foreground cursor-pointer hover:text-primary transition-colors"
                      onClick={() => startRename(gi, si, sub.name)}
                      title={nl ? 'Klik om te hernoemen' : 'Click to rename'}
                    >
                      {sub.name}
                    </span>
                  )}
                  {!sub.isDefault ? (
                    <button
                      onClick={() => removeCustomSubtype(gi, si)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/60">{nl ? 'standaard' : 'default'}</span>
                  )}
                </div>
              ))}

              {/* Add new subtype */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/20">
                <Input
                  placeholder={nl ? 'Nieuw subtype toevoegen...' : 'Add new subtype...'}
                  value={newSubtype[gi] || ''}
                  onChange={(e) => setNewSubtype((prev) => ({ ...prev, [gi]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') addSubtype(gi); }}
                  className="h-7 text-sm flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0"
                />
                <button
                  onClick={() => addSubtype(gi)}
                  disabled={!(newSubtype[gi] || '').trim()}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <Button onClick={onComplete} className="w-full mt-2">
          {nl ? 'Bevestigen & doorgaan' : 'Confirm & continue'}
        </Button>
      </div>
    </StepModal>
  );
}

/* Step 4: Financial Agreement */
function FinancialAgreementPanel({ onComplete, onClose, nl, isCeo }: {onComplete: () => void;onClose: () => void;nl: boolean;isCeo: boolean;}) {
  const [selfBilling, setSelfBilling] = useState(false);
  const [sendConsent, setSendConsent] = useState(false);

  return (
    <StepModal title={nl ? 'Financiële overeenkomst' : 'Financial Agreement'} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isCeo ?
          nl ? 'Als CEO dient u de volgende overeenkomsten eenmalig te accepteren.' : 'As CEO, you must accept the following agreements once.' :
          nl ? 'Deze overeenkomsten zijn reeds goedgekeurd door uw CEO.' : 'These agreements have already been approved by your CEO.'
          }
        </p>

        <div className="space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox checked={selfBilling} onCheckedChange={(c) => setSelfBilling(c === true)} disabled={!isCeo} className="mt-0.5" />
            <div className="text-sm leading-relaxed">
              <span className="font-medium">Self-billing {nl ? 'overeenkomst' : 'agreement'}</span>
              <span className="text-muted-foreground">
                {nl ?
                ' — Na ontvangst van betaling stellen wij namens u een self-billing factuur op voor de commissie-uitbetaling.' :
                ' — Upon payment receipt, we issue a self-billing invoice on your behalf for commission settlement.'}
              </span>
              <button type="button" className="block text-primary text-xs mt-1 hover:underline">
                <Download className="inline h-3 w-3 mr-1" />
                {nl ? 'Download overeenkomst (PDF)' : 'Download agreement (PDF)'}
              </button>
            </div>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox checked={sendConsent} onCheckedChange={(c) => setSendConsent(c === true)} disabled={!isCeo} className="mt-0.5" />
            <div className="text-sm leading-relaxed">
              <span className="font-medium">{nl ? 'Offerte-autorisatie' : 'Quote authorization'}</span>
              <span className="text-muted-foreground">
                {nl ?
                ' — Ik autoriseer OxiCloud om offertes namens mijn bedrijf naar eindklanten te versturen.' :
                ' — I authorize OxiCloud to send quotes to end clients on behalf of my company.'}
              </span>
            </div>
          </label>
        </div>

        {isCeo &&
        <Button disabled={!selfBilling || !sendConsent} onClick={onComplete} className="w-full">
            <ShieldCheck className="w-4 h-4 mr-2" />
            {nl ? 'Accepteren & doorgaan' : 'Accept & continue'}
          </Button>
        }
      </div>
    </StepModal>);

}

/* Step 5: Data Migration */
function DataMigrationPanel({ onComplete, onClose, nl }: {onComplete: () => void;onClose: () => void;nl: boolean;}) {
  const [fileUploaded, setFileUploaded] = useState(false);

  return (
    <StepModal title={nl ? 'Datamigratie' : 'Data Migration'} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {nl ?
          'Importeer een bestaand klantenbestand (bijv. uit ArchX) via CSV. U kunt dit ook later doen vanuit het Contacten-module.' :
          'Import an existing client database (e.g. from ArchX) via CSV. You can also do this later from the Contacts module.'}
        </p>

        <div
          className={cn(
            "border-2 border-dashed rounded-xl h-32 flex items-center justify-center cursor-pointer transition-colors",
            fileUploaded ? "border-foreground/20 bg-muted/30" : "border-border hover:border-foreground/20"
          )}
          onClick={() => setFileUploaded(true)}>
          
          {fileUploaded ?
          <div className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <span>contacts_export.csv</span>
            </div> :

          <div className="text-center">
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1.5" />
              <p className="text-sm text-muted-foreground">{nl ? 'Sleep een CSV-bestand hierheen' : 'Drop a CSV file here'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{nl ? 'of klik om te bladeren' : 'or click to browse'}</p>
            </div>
          }
        </div>

        <div className="flex gap-2.5 pt-1">
          <Button variant="ghost" onClick={onComplete} className="flex-1 text-muted-foreground">
            {nl ? 'Overslaan' : 'Skip'}
          </Button>
          <Button onClick={onComplete} disabled={!fileUploaded} className="flex-1">
            {nl ? 'Importeren' : 'Import'}
          </Button>
        </div>
      </div>
    </StepModal>);

}

/* Step 6: Workspace Ready */
function WorkspaceReadyPanel({ onComplete, onClose, nl }: {onComplete: () => void;onClose: () => void;nl: boolean;}) {
  return (
    <StepModal title={nl ? 'Workspace klaar!' : 'Workspace Ready!'} onClose={onClose}>
      <div className="space-y-4 text-center">
        

        
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {nl ? 'Uw workspace is volledig geconfigureerd' : 'Your workspace is fully configured'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {nl ?
            'U kunt nu uw eerste projectdossier aanmaken en beginnen met verdienen.' :
            'You can now create your first project dossier and start earning.'}
          </p>
        </div>
        <Button onClick={onComplete} className="w-full" size="lg">
          {nl ? 'Ga naar projecten →' : 'Go to projects →'}
        </Button>
      </div>
    </StepModal>);

}

/* ═══════════════════════════════════════════════
   MAIN CHECKLIST
   ═══════════════════════════════════════════════ */
export const OnboardingChecklist = ({ onComplete, onDismiss, forceShow }: OnboardingChecklistProps) => {
  const { currentUser } = useMockAuth();
  const { language } = useLanguage();
  const isCeo = currentUser?.role === 'client_owner';
  const nl = language === 'nl';

  const steps: OnboardingStep[] = [
  { id: 'company-profile', title: nl ? 'Bedrijfsprofiel instellen' : 'Set up Company Profile', description: nl ? 'Upload logo, bevestig bedrijfsgegevens en BTW' : 'Upload logo, confirm legal name, address & VAT', icon: Building2, mandatory: true },
  { id: 'team-setup', title: nl ? 'Team configureren' : 'Set up your Team', description: nl ? 'Nodig leden uit en wijs rollen toe' : 'Invite members and assign roles', icon: Users, mandatory: true },
  { id: 'contact-config', title: nl ? 'Contactconfiguratie' : 'Configure Contacts', description: nl ? 'Stel contacttaxonomie en standaardvelden in' : 'Define contact taxonomy and default fields', icon: Settings, mandatory: true },
  { id: 'financial-agreement', title: nl ? 'Financiële overeenkomst' : 'Financial Agreement', description: isCeo ? nl ? 'Accepteer self-billing en offerte-autorisatie' : 'Review and sign self-billing & quote approval' : nl ? 'Reeds goedgekeurd door uw CEO' : 'Already approved by your CEO', icon: ShieldCheck, mandatory: true },
  { id: 'data-migration', title: nl ? 'Datamigratie' : 'Data Migration', description: nl ? 'Importeer een bestaand klantenbestand via CSV' : 'Import existing client database via CSV', icon: Upload, mandatory: false },
  { id: 'workspace-ready', title: nl ? 'Workspace klaar' : 'Workspace Ready', description: nl ? 'Start met uw eerste projectdossier' : 'Create your first project dossier', icon: Rocket, mandatory: true }];


  const [state, setState] = useState<SavedState>(loadState);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  useEffect(() => {saveState(state);}, [state]);

  const completedSet = new Set(state.completedSteps);
  const completedCount = steps.filter((s) => completedSet.has(s.id)).length;
  const allDone = steps.every((s) => completedSet.has(s.id));

  const isUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    for (let i = 0; i < index; i++) {
      if (steps[i].mandatory && !completedSet.has(steps[i].id)) return false;
      // Optional steps don't block, but only if they come before
      if (!steps[i].mandatory && !completedSet.has(steps[i].id)) {
        // optional steps don't block next steps
        continue;
      }
    }
    return true;
  };

  const markComplete = (stepId: string) => {
    setState((prev) => {
      if (prev.completedSteps.includes(stepId)) return prev;
      const next = { ...prev, completedSteps: [...prev.completedSteps, stepId] };
      return next;
    });
    setActiveStep(null);
    // Check if everything done after state update
    const nextCompleted = new Set([...state.completedSteps, stepId]);
    if (steps.every((s) => nextCompleted.has(s.id))) onComplete?.();
  };

  const handleStepClick = (step: OnboardingStep, index: number) => {
    if (!isUnlocked(index) || completedSet.has(step.id)) return;
    setActiveStep(step.id);
  };

  if (allDone && !forceShow) return null;

  const progressPct = Math.round(completedCount / steps.length * 100);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}>
        
        <div className="rounded-2xl border border-border bg-card px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {nl ? 'Setup Guide' : 'Setup Guide'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {nl ? 'Voltooi elke stap om uw workspace te activeren' : 'Complete each step to activate your workspace'}
              </p>
            </div>
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeDasharray={`${progressPct * 0.94} 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
                {completedCount}/{steps.length}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {steps.map((step, index) => {
              const done = completedSet.has(step.id);
              const unlocked = isUnlocked(index);

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step, index)}
                  disabled={!unlocked || done}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group',
                    done && 'opacity-40',
                    !unlocked && !done && 'opacity-30 cursor-not-allowed',
                    unlocked && !done && 'hover:bg-muted/50 cursor-pointer'
                  )}>
                  
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold',
                    done ? 'bg-foreground text-background' : unlocked ? 'border border-border text-muted-foreground' : 'border border-border/50 text-muted-foreground/40'
                  )}>
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : !unlocked ? <Lock className="h-3 w-3" /> : index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm font-medium', done && 'line-through text-muted-foreground')}>{step.title}</p>
                      {!step.mandatory && !done &&
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
                          {nl ? 'Optioneel' : 'Optional'}
                        </span>
                      }
                    </div>
                    {!done && unlocked &&
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{step.description}</p>
                    }
                  </div>
                </button>);

            })}
          </div>
        </div>
      </motion.div>

      {/* Step Modals */}
      <AnimatePresence>
        {(activeStep === 'company-profile' || activeStep === 'team-setup') &&
        <PilotOnboardingFlow1
          initialStep={activeStep === 'team-setup' ? 'team' : 'company-details'}
          onStepComplete={(stepId) => {
            if (stepId === 'company') markComplete('company-profile');
            if (stepId === 'team') markComplete('team-setup');
          }}
          onComplete={() => {
            markComplete('company-profile');
            markComplete('team-setup');
            setActiveStep(null);
          }}
          onClose={() => setActiveStep(null)}
        />
        }
        {activeStep === 'contact-config' &&
        <ContactConfigPanel nl={nl} onComplete={() => markComplete('contact-config')} onClose={() => setActiveStep(null)} />
        }
        {activeStep === 'financial-agreement' &&
        <FinancialAgreementPanel nl={nl} isCeo={isCeo} onComplete={() => markComplete('financial-agreement')} onClose={() => setActiveStep(null)} />
        }
        {activeStep === 'data-migration' &&
        <DataMigrationPanel nl={nl} onComplete={() => markComplete('data-migration')} onClose={() => setActiveStep(null)} />
        }
        {activeStep === 'workspace-ready' &&
        <WorkspaceReadyPanel nl={nl} onComplete={() => markComplete('workspace-ready')} onClose={() => setActiveStep(null)} />
        }
      </AnimatePresence>
    </>);

};