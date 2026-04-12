/**
 * Quote Sending Screen - Realistic Peppol/Email delivery animation
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Mail, Shield, Send, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

interface QuoteSendingScreenProps {
  recipientName: string;
  recipientEmail: string;
  quoteReference: string;
  onComplete: () => void;
}

export function QuoteSendingScreen({ recipientName, recipientEmail, quoteReference, onComplete }: QuoteSendingScreenProps) {
  const { t } = useLanguage();

  const STEPS = [
    { id: 'prepare', labelKey: 'quoteFlow.sendStep1', icon: FileCheck, duration: 1200 },
    { id: 'sign', labelKey: 'quoteFlow.sendStep2', icon: Shield, duration: 1000 },
    { id: 'peppol', labelKey: 'quoteFlow.sendStep3', icon: Send, duration: 1500 },
    { id: 'send', labelKey: 'quoteFlow.sendStep4', icon: Mail, duration: 1800 },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      const timer = setTimeout(onComplete, 1200);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, STEPS[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const allDone = currentStep >= STEPS.length;

  return (
    <div className="max-w-lg mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
        >
          {allDone ? (
            <CheckCircle2 className="h-8 w-8 text-primary" />
          ) : (
            <Send className="h-8 w-8 text-primary animate-pulse" />
          )}
        </motion.div>
        <h1 className="text-xl font-semibold mb-2">
          {allDone ? t('quoteFlow.sentTitle') : t('quoteFlow.sendingTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {allDone
            ? `${recipientName} ${t('quoteFlow.sentRecipientMsg')} ${recipientEmail}`
            : `${t('quoteFlow.reference')}: ${quoteReference}`
          }
        </p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = currentStep === index && !isCompleted;
          const isPending = index > currentStep;
          const StepIcon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                isCompleted && "border-primary/30 bg-primary/5",
                isActive && "border-primary/50 bg-primary/10 shadow-sm",
                isPending && "border-border/40 bg-muted/20 opacity-50"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                isCompleted && "bg-primary text-primary-foreground",
                isActive && "bg-primary/20 text-primary",
                isPending && "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <StepIcon className={cn("h-5 w-5", isActive && "animate-pulse")} />
                )}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  isPending && "text-muted-foreground"
                )}>
                  {t(step.labelKey)}
                </p>
                {isActive && (
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: step.duration / 1000, ease: 'linear' }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                )}
              </div>
              {isCompleted && (
                <span className="text-xs text-primary font-medium">{t('quoteFlow.completed')}</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {t('quoteFlow.sentFooter')}
          </p>
        </motion.div>
      )}
    </div>
  );
}