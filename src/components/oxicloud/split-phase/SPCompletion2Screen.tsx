import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { CheckCircle2, Settings } from 'lucide-react';

interface Props {
  onContinue: () => void;
  onBackToProjects: () => void;
}

export function SPCompletion2Screen({ onContinue, onBackToProjects }: Props) {
  const { t } = useLanguage();
  const bullets = t('splitPhase.completion2Bullets') as unknown as string[];
  const steps = t('splitPhase.completion2Steps') as unknown as string[];

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="relative w-20 h-20 mx-auto mb-6"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center border-2 border-background">
                <Settings className="w-4 h-4 text-primary" />
              </div>
            </motion.div>
            <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">
              {t('splitPhase.completion2Supra')}
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
              {t('splitPhase.completion2Title')}
            </h1>
            <p className="text-base text-muted-foreground">
              {t('splitPhase.completion2Subtitle')}
            </p>
          </div>

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-5">
            <ul className="space-y-2 text-sm">
              {(Array.isArray(bullets) ? bullets : []).map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">
              {t('splitPhase.stap3Title') === t('splitPhase.stap3Title') ? 'Next steps' : ''}
            </h2>
            {(Array.isArray(steps) ? steps : []).map((step, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-muted/20 p-4">
                <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-semibold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4">
            <Button onClick={onContinue} className="w-full h-12 rounded-xl text-base font-medium">
              {t('splitPhase.completion2CtaPrimary')}
            </Button>
            <Button onClick={onBackToProjects} variant="outline" className="w-full h-12 rounded-xl">
              {t('splitPhase.completion2CtaBack')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
