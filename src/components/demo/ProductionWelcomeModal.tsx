import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Check, ArrowRight, Settings, Users, FolderKanban, Building2, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProductionWelcomeModalProps {
  userName: string;
  onClose: () => void;
}

const CHECKLIST_ITEMS = [
  {
    key: 'company',
    icon: Building2,
    title: 'Set up your company profile',
    description: 'Add your company details, BTW number, and address.',
    path: '/dashboard/settings',
  },
  {
    key: 'team',
    icon: Users,
    title: 'Invite your team members',
    description: 'Add colleagues so they can manage projects too.',
    path: '/dashboard/settings',
  },
  {
    key: 'contacts',
    icon: Settings,
    title: 'Configure contact types',
    description: 'Set up how you organize clients and partners.',
    path: '/dashboard/contacts',
  },
  {
    key: 'financial',
    icon: CreditCard,
    title: 'Complete financial setup',
    description: 'Set up your bank account for commission payouts.',
    path: '/dashboard/settings',
  },
  {
    key: 'project',
    icon: FolderKanban,
    title: 'Create your first project',
    description: 'Start a new project and submit a NOx report.',
    path: '/dashboard/projects',
  },
];

export function ProductionWelcomeModal({ userName, onClose }: ProductionWelcomeModalProps) {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggleCompleted = (key: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const progress = Math.round((completed.size / CHECKLIST_ITEMS.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="relative bg-secondary text-secondary-foreground p-6 pb-5 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <h2 className="text-lg font-semibold">Welcome, {userName}!</h2>
          <p className="text-sm text-secondary-foreground/60 mt-0.5">Complete these steps to get the most out of OxiCloud</p>
          
          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-secondary-foreground/50 tabular-nums">{completed.size}/{CHECKLIST_ITEMS.length}</span>
          </div>
        </div>

        {/* Checklist */}
        <div className="p-4 space-y-1.5 overflow-y-auto flex-1">
          {CHECKLIST_ITEMS.map((item) => {
            const done = completed.has(item.key);
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer group',
                  done
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-border hover:border-foreground/20'
                )}
                onClick={() => toggleCompleted(item.key)}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                  done
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/30'
                )}>
                  {done && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium transition-colors',
                    done ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-primary'
                  )}>{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
                {!done && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onClose(); navigate(item.path); }}
                    className="text-muted-foreground hover:text-primary transition-colors mt-0.5 shrink-0"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 pt-2 border-t border-border shrink-0">
          <Button onClick={onClose} className="w-full" size="sm">
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
