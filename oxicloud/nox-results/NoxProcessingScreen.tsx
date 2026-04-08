import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ProcessingStep {
  labelKey: string;
  duration: number;
}

const STEP_KEYS: ProcessingStep[] = [
  { labelKey: 'noxProcessing.step1', duration: 800 },
  { labelKey: 'noxProcessing.step2', duration: 1000 },
  { labelKey: 'noxProcessing.step3', duration: 900 },
  { labelKey: 'noxProcessing.step4', duration: 800 },
  { labelKey: 'noxProcessing.step5', duration: 500 },
];

interface NoxProcessingScreenProps {
  onComplete: () => void;
}

export function NoxProcessingScreen({ onComplete }: NoxProcessingScreenProps) {
  const { t } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const steps = STEP_KEYS.map(s => ({ label: t(s.labelKey), duration: s.duration }));
  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);

  useEffect(() => {
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step, index) => {
      elapsed += step.duration;
      const timer = setTimeout(() => {
        setCompletedSteps(index + 1);
      }, elapsed);
      timers.push(timer);
    });

    // Hold on completed state, then fade out before transitioning
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, elapsed + 1200);
    timers.push(fadeTimer);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, elapsed + 2000);
    timers.push(finishTimer);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const target = (completedSteps / steps.length) * 100;
        if (prev >= target) return target;
        return Math.min(prev + 1.5, target);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [completedSteps]);

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isFadingOut ? 0 : 1, y: isFadingOut ? -10 : 0 }}
        transition={{ duration: isFadingOut ? 0.6 : 0.4 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
            {t('noxProcessing.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('noxProcessing.subtitle')}
          </p>
        </div>

        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-10">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = index < completedSteps;
            const isActive = index === completedSteps;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isCompleted || isActive ? 1 : 0.3, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        key="pulse"
                        className="w-3 h-3 rounded-full bg-primary"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-border" />
                    )}
                  </AnimatePresence>
                </div>

                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isCompleted
                      ? 'text-foreground'
                      : isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}