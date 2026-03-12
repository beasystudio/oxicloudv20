import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PartnerProgramModalProps {
  onClose: () => void;
}

export function PartnerProgramModal({ onClose }: PartnerProgramModalProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-background rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="relative bg-secondary text-secondary-foreground p-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            

            
            <div>
              <h2 className="text-xl font-semibold">Welcome to OxiCloud</h2>
              <p className="text-sm text-secondary-foreground/60">Your Partner Program overview</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Free message */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            
            <p className="text-sm text-foreground">
              <strong>OxiCloud is completely free</strong> for architects. No subscriptions, no hidden costs.
            </p>
          </div>

          {/* How it works */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">How you earn commission</h3>
            <div className="space-y-2.5">
              {[
              { step: '1', text: 'Your firm creates a project and generates a NOx report' },
              { step: '2', text: 'The client (bouwheer) receives a quote and pays via bank transfer' },
              { step: '3', text: 'Commission is transferred to the registered company\'s bank account' }].
              map((s) =>
              <div key={s.step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                </div>
              )}
            </div>
          </div>

          {/* Important distinction */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {' '}
              If you're an employee, commission earned through your firm's projects goes to the firm — not to you personally. 
              Are you self-employed or running your own practice? Create your own Workspace to receive payments directly.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => {onClose();navigate('/register/workspace');}} className="flex-1 gap-1.5">
              
              Create my Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Explore Demo first
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>);

}