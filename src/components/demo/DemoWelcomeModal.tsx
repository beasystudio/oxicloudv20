import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, FolderOpen, Users, Settings, Handshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

interface DemoWelcomeModalProps {
  onClose: () => void;
}

export function DemoWelcomeModal({ onClose }: DemoWelcomeModalProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    { icon: FolderOpen, text: t('demoWelcome.projects') },
    { icon: Users, text: t('demoWelcome.contacts') },
    { icon: Settings, text: t('demoWelcome.settings') },
    { icon: Handshake, text: t('demoWelcome.partner') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">

        {/* Close button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-muted hover:bg-muted-foreground/10 flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-1 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('demoWelcome.title')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('demoWelcome.body')}</p>
          </div>

          {/* Feature list */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t('demoWelcome.explore')}</p>
            <div className="space-y-1.5">
              {features.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[13px] text-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic">{t('demoWelcome.disclaimer')}</p>

          <p className="text-sm text-muted-foreground">{t('demoWelcome.readyCta')}</p>

          {/* Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={() => { onClose(); navigate('/pilot-demo/create-account'); }}
              className="h-11 rounded-xl font-semibold text-sm w-full gap-2">
              {t('demoWelcome.createWorkspace')}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-[11px] text-muted-foreground text-center -mt-1">{t('demoWelcome.createWorkspaceDesc')}</p>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full text-muted-foreground">
              {t('demoWelcome.exploreDemo')}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
