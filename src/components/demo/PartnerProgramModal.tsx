import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        
        {/* Header — production dark style */}
        <div className="relative bg-secondary text-secondary-foreground p-6 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <h2 className="text-lg font-semibold">Welcome to OxiCloud</h2>
          <p className="text-sm text-secondary-foreground/60 mt-0.5">Your Partner Program overview</p>
        </div>

        {/* Content — production spacing */}
        <div className="p-5 space-y-4">
          {/* Free message */}
          <div className="flex items-center gap-2 p-3 rounded-xl border border-border">
            <p className="text-sm text-foreground">
              <strong>OxiCloud is completely free</strong> for architects. No subscriptions, no hidden costs.
            </p>
          </div>

          {/* How it works */}
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">HOW YOU EARN COMMISSION</p>
            <div className="space-y-2">
              {[
              { step: '1', text: 'Your firm creates a project and generates a NOx report' },
              { step: '2', text: 'The client (bouwheer) receives a quote and pays via bank transfer' },
              { step: '3', text: 'Commission is transferred to the registered company\'s bank account' }].
              map((s) =>
              <div key={s.step} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">{s.step}</span>
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                </div>
              )}
            </div>
          </div>

          {/* Important distinction */}
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you're an employee, commission earned through your firm's projects goes to the firm — not to you personally. 
              Are you self-employed or running your own practice? Create your own Workspace to receive payments directly.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button onClick={() => {onClose();navigate('/pilot-demo/create-account');}} size="sm" className="flex-1 gap-1.5 font-medium">
              Create my Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
              Explore Demo first
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>);

}
