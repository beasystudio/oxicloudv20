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
    { icon: Handshake, name: t('demoWelcome.partner_name'), desc: t('demoWelcome.partner_desc') },
    { icon: Settings, name: t('demoWelcome.settings_name'), desc: t('demoWelcome.settings_desc') },
    { icon: FolderOpen, name: t('demoWelcome.projects_name'), desc: t('demoWelcome.projects_desc') },
    { icon: Users, name: t('demoWelcome.contacts_name'), desc: t('demoWelcome.contacts_desc') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/40 dark:bg-background/60 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">

        {/* Close button + badge */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center rounded-full bg-primary px-3 py-1"
          >
            <span className="text-[11px] font-semibold tracking-wide text-primary-foreground uppercase">Demo</span>
          </motion.div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-4 space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">{t('demoWelcome.title')}</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{t('demoWelcome.body')}</p>
          </div>

          {/* Feature list */}
          <div className="rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/50 p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-3">{t('demoWelcome.explore')}</p>
            <div className="space-y-2.5">
              {features.map(({ icon: Icon, name, desc }, i) => {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.06 }}
                    className="flex items-start gap-2.5"
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-lg bg-card dark:bg-secondary flex items-center justify-center shrink-0 border border-border/60">
                      <Icon className="w-3 h-3 text-foreground/70" />
                    </div>
                    <span className="text-[13px] text-foreground leading-snug">
                      <span className="font-semibold">{name}</span> {desc}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/80 italic">{t('demoWelcome.disclaimer')}</p>

          <p className="text-[13px] text-muted-foreground leading-relaxed">{t('demoWelcome.readyCta')}</p>

          {/* Buttons */}
          <div className="flex flex-col gap-1.5 pt-1">
            <Button
              onClick={() => { onClose(); navigate('/pilot-demo/create-account'); }}
              className="h-12 rounded-full font-semibold text-sm w-full gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
              {t('demoWelcome.createWorkspace')}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-[11px] text-muted-foreground/70 text-center">{t('demoWelcome.createWorkspaceDesc')}</p>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full text-muted-foreground mt-1 rounded-full">
              {t('demoWelcome.exploreDemo')}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
