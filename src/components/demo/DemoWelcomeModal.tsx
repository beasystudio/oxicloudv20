import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Sparkles, Handshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemoWelcomeModalProps {
  onClose: () => void;
}

export function DemoWelcomeModal({ onClose }: DemoWelcomeModalProps) {
  const navigate = useNavigate();

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
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="relative bg-secondary text-secondary-foreground p-6 pb-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <h2 className="text-lg font-semibold">Welcome to OxiCloud!</h2>
          <p className="text-sm text-secondary-foreground/60 mt-0.5">Choose how you'd like to get started</p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Option 1: Setup Guide */}
          <button
            onClick={() => { onClose(); navigate('/dashboard/client/home?showGuide=true'); }}
            className="w-full flex items-start gap-4 p-4 rounded-xl border border-border hover:border-foreground/20 transition-colors text-left group">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Start the Setup Guide</p>
              <p className="text-xs text-muted-foreground mt-0.5">Follow a step-by-step guide to configure your workspace.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
          </button>

          {/* Option 2: Partner Program */}
          <button
            onClick={() => { onClose(); navigate('/dashboard/partnership-program'); }}
            className="w-full flex items-start gap-4 p-4 rounded-xl border border-border hover:border-foreground/20 transition-colors text-left group">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Handshake className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Explore the Partner Program</p>
              <p className="text-xs text-muted-foreground mt-0.5">Discover how to collaborate and grow with OxiCloud.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
          </button>

          {/* Dismiss */}
          <div className="pt-1">
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full text-muted-foreground">
              Explore Demo first
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
