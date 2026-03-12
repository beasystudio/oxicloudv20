import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Building2,
  Users,
  FolderKanban,
  Settings,
  ArrowRight,
  X,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMockAuth } from '@/contexts/MockAuthContext';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  completed: boolean;
  isLegalStep?: boolean;
}

interface OnboardingChecklistProps {
  onComplete?: () => void;
  onDismiss?: () => void;
}

export const OnboardingChecklist = ({ onComplete, onDismiss }: OnboardingChecklistProps) => {
  const navigate = useNavigate();
  const { currentUser } = useMockAuth();
  const [expanded, setExpanded] = useState(true);
  const [legalExpanded, setLegalExpanded] = useState(false);
  const [selfBillingAgreed, setSelfBillingAgreed] = useState(false);
  const [sendConsentAgreed, setSendConsentAgreed] = useState(false);
  const isCeo = currentUser?.role === 'client_owner';

  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'logo-upload',
      title: 'Bedrijfslogo uploaden',
      description: 'Upload uw logo voor een gepersonaliseerde ervaring',
      icon: Building2,
      path: '/dashboard/settings',
      completed: false,
    },
    {
      id: 'partner-terms',
      title: 'Partner voorwaarden lezen',
      description: 'Begrijp hoe u 40% verdient op elk goedgekeurd project',
      icon: Sparkles,
      path: '/dashboard/partner/terms',
      completed: false,
    },
    {
      id: 'legal-agreements',
      title: 'Juridische overeenkomsten accepteren',
      description: isCeo ? 'Accepteer de self-billing en verzendautorisatie (eenmalig, als CEO)' : 'Reeds goedgekeurd door uw CEO',
      icon: ShieldCheck,
      completed: false,
      isLegalStep: true,
    },
    {
      id: 'company-setup',
      title: 'Bedrijf instellen',
      description: 'Voeg bedrijfsgegevens en facturatiegegevens toe',
      icon: Building2,
      path: '/dashboard/settings',
      completed: false,
    },
    {
      id: 'add-users',
      title: 'Teamleden toevoegen',
      description: 'Nodig collega\'s uit en wijs licenties toe',
      icon: Users,
      path: '/dashboard/settings',
      completed: false,
    },
    {
      id: 'contact-types',
      title: 'Contacttypes configureren',
      description: 'Stel uw contacttaxonomie in voor projecten',
      icon: Settings,
      path: '/dashboard/settings',
      completed: false,
    },
    {
      id: 'first-project',
      title: 'Eerste project aanmaken',
      description: 'Begin met verdienen door een project in te dienen',
      icon: FolderKanban,
      path: '/dashboard/projects',
      completed: false,
    },
  ]);

  const completedCount = items.filter(item => item.completed).length;
  const progressPercentage = (completedCount / items.length) * 100;

  useEffect(() => {
    // Load completion state from localStorage
    const savedState = localStorage.getItem('oxicloud_onboarding_checklist');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setItems(prev => prev.map(item => ({
        ...item,
        completed: parsed[item.id] || false,
      })));
      // Restore legal checkbox states
      if (parsed['legal_selfbilling']) setSelfBillingAgreed(true);
      if (parsed['legal_sendconsent']) setSendConsentAgreed(true);
    }

    // If not CEO, auto-complete the legal step (CEO already approved)
    // Check if CEO has previously approved
    const ceoApproved = localStorage.getItem('oxicloud_legal_ceo_approved');
    if (!isCeo && ceoApproved === 'true') {
      setItems(prev => prev.map(item => 
        item.id === 'legal-agreements' ? { ...item, completed: true } : item
      ));
    }
  }, [isCeo]);

  const markComplete = (itemId: string) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === itemId ? { ...item, completed: true } : item
      );
      
      // Save to localStorage
      const completionState = updated.reduce((acc, item) => ({
        ...acc,
        [item.id]: item.completed,
      }), {});
      localStorage.setItem('oxicloud_onboarding_checklist', JSON.stringify(completionState));
      
      // Check if all complete
      if (updated.every(item => item.completed)) {
        onComplete?.();
      }
      
      return updated;
    });
  };

  const handleLegalAccept = () => {
    if (selfBillingAgreed && sendConsentAgreed) {
      markComplete('legal-agreements');
      localStorage.setItem('oxicloud_legal_ceo_approved', 'true');
      // Save checkbox states
      const savedState = JSON.parse(localStorage.getItem('oxicloud_onboarding_checklist') || '{}');
      savedState['legal_selfbilling'] = true;
      savedState['legal_sendconsent'] = true;
      localStorage.setItem('oxicloud_onboarding_checklist', JSON.stringify(savedState));
      setLegalExpanded(false);
    }
  };

  const handleItemClick = (item: ChecklistItem) => {
    if (item.isLegalStep) {
      setLegalExpanded(!legalExpanded);
      return;
    }
    markComplete(item.id);
    if (item.path) navigate(item.path);
  };

  if (completedCount === items.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Aan de slag</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Voltooi deze stappen om te beginnen
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Progress Ring */}
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${progressPercentage * 0.94} 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                  {completedCount}/{items.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onDismiss}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-lg transition-all cursor-pointer group",
                          item.completed 
                            ? "bg-muted/30 border border-border opacity-60" 
                            : "bg-background border border-border hover:border-border hover:bg-muted/50"
                        )}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold",
                          item.completed ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {item.completed ? (
                            <CheckCircle className="w-4 h-4 text-primary" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium text-sm",
                            item.completed ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {item.title}
                          </p>
                          {!item.completed && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        
                        {!item.completed && !item.isLegalStep && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        {item.isLegalStep && !item.completed && (
                          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", legalExpanded && "rotate-180")} />
                        )}
                      </div>

                      {/* Legal agreements inline panel */}
                      <AnimatePresence>
                        {item.isLegalStep && legalExpanded && !item.completed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-11 mt-2 p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                              <p className="text-xs text-muted-foreground">
                                {isCeo 
                                  ? 'Als CEO dient u de volgende overeenkomsten eenmalig te accepteren. Teamleden hoeven dit niet opnieuw te bevestigen.'
                                  : 'Deze overeenkomsten zijn reeds goedgekeurd door uw CEO.'
                                }
                              </p>

                              <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                  <Checkbox
                                    checked={selfBillingAgreed}
                                    onCheckedChange={(c) => setSelfBillingAgreed(c === true)}
                                    disabled={!isCeo}
                                    className="mt-0.5"
                                  />
                                  <div className="text-sm leading-relaxed">
                                    <span className="font-medium">Self-billing overeenkomst</span>
                                    <span className="text-muted-foreground"> — Na ontvangst van betaling door de eindklant zullen wij namens u een self-billing factuur aan OxiCloud opstellen voor de commissie-uitbetaling.</span>
                                    <button type="button" className="block text-primary text-xs mt-1 hover:underline">
                                      <Download className="inline h-3 w-3 mr-1" />
                                      Download overeenkomst (PDF)
                                    </button>
                                  </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                  <Checkbox
                                    checked={sendConsentAgreed}
                                    onCheckedChange={(c) => setSendConsentAgreed(c === true)}
                                    disabled={!isCeo}
                                    className="mt-0.5"
                                  />
                                  <div className="text-sm leading-relaxed">
                                    <span className="font-medium">Verzendautorisatie</span>
                                    <span className="text-muted-foreground"> — Ik autoriseer OxiCloud om offertes namens mijn bedrijf naar eindklanten te versturen.</span>
                                  </div>
                                </label>
                              </div>

                              {isCeo && (
                                <Button
                                  size="sm"
                                  disabled={!selfBillingAgreed || !sendConsentAgreed}
                                  onClick={handleLegalAccept}
                                  className="w-full"
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2" />
                                  Accepteren & doorgaan
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
