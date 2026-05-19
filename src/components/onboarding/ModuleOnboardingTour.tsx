/**
 * Module-Specific Onboarding Tour
 * Shows spotlight-based walkthroughs at each module location
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
 import { X, ArrowRight, ArrowLeft, Apple, Hand, HelpCircle } from 'lucide-react';
import { 
  type ModuleOnboardingStep, 
  type OnboardingModule,
  getStepsForModule,
  saveOnboardingProgress,
  completeOnboarding 
} from '@/lib/pilotAccountUtils';
import { useNavigate } from 'react-router-dom';

interface ModuleOnboardingTourProps {
  module: OnboardingModule;
  onComplete: () => void;
  onSkip: () => void;
  startAtStep?: number;
}

export const ModuleOnboardingTour = ({ 
  module, 
  onComplete, 
  onSkip, 
  startAtStep = 0 
}: ModuleOnboardingTourProps) => {
  const navigate = useNavigate();
  const steps = getStepsForModule(module);
  const [currentStepIndex, setCurrentStepIndex] = useState(startAtStep);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (!currentStep) return;
    
    // Small delay to let DOM settle
    const timer = setTimeout(() => {
      updatePosition();
    }, 100);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStepIndex, currentStep]);

  useEffect(() => {
    if (currentStep?.requireInteraction) {
      const target = document.querySelector(currentStep.targetSelector);
      if (target) {
        const handleClick = () => {
          // Save progress
          saveOnboardingProgress(module, currentStepIndex + 1);
          
          // Navigate if specified
          if (currentStep.navigateTo) {
            navigate(currentStep.navigateTo);
          }
          
          if (isLastStep) {
            onComplete();
          } else {
            setCurrentStepIndex(prev => prev + 1);
          }
        };
        target.addEventListener('click', handleClick, { once: true });
        return () => target.removeEventListener('click', handleClick);
      }
    }
  }, [currentStepIndex, currentStep, isLastStep, onComplete, navigate, module]);

  const updatePosition = () => {
    const target = document.querySelector(currentStep?.targetSelector || '');
    if (!target) {
      // If target not found, center the tooltip
      setTooltipPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 175,
      });
      setSpotlightRect(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    setSpotlightRect(rect);

    const tooltipWidth = 380;
    const tooltipHeight = 280; // Increased to account for interaction hint
    const gap = 20;

    let top = 0;
    let left = 0;

    // Calculate available space in each direction
    const spaceRight = window.innerWidth - rect.right - gap;
    const spaceLeft = rect.left - gap;
    const spaceBottom = window.innerHeight - rect.bottom - gap;
    const spaceTop = rect.top - gap;

    // Smart placement - prefer specified but fallback if not enough space
    let effectivePlacement = currentStep.placement;
    
    if (effectivePlacement === 'bottom' && spaceBottom < tooltipHeight) {
      effectivePlacement = spaceRight >= tooltipWidth ? 'right' : 'top';
    } else if (effectivePlacement === 'top' && spaceTop < tooltipHeight) {
      effectivePlacement = spaceRight >= tooltipWidth ? 'right' : 'bottom';
    } else if (effectivePlacement === 'right' && spaceRight < tooltipWidth) {
      effectivePlacement = spaceLeft >= tooltipWidth ? 'left' : 'bottom';
    } else if (effectivePlacement === 'left' && spaceLeft < tooltipWidth) {
      effectivePlacement = spaceRight >= tooltipWidth ? 'right' : 'bottom';
    }

    switch (effectivePlacement) {
      case 'top':
        top = rect.top - tooltipHeight - gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + gap;
        break;
    }

    // Keep tooltip within viewport with padding
    const viewportPadding = 20;
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipWidth - viewportPadding));
    top = Math.max(viewportPadding, Math.min(top, window.innerHeight - tooltipHeight - viewportPadding));

    setTooltipPosition({ top, left });
  };

  const handleNext = () => {
    saveOnboardingProgress(module, currentStepIndex + 1);
    
    if (isLastStep) {
      if (currentStep.navigateTo) {
        navigate(currentStep.navigateTo);
      }
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    onSkip();
  };

  if (!currentStep) return null;

  // Spotlight region and overlays
  // We keep the spotlight area *fully clickable* by blocking clicks only around it.
  // The dark overlay is rendered visually via SVG (no pointer events).
  const spotlightPadding = 12;
  const spotlight = spotlightRect
    ? {
        top: spotlightRect.top - spotlightPadding,
        left: spotlightRect.left - spotlightPadding,
        right: spotlightRect.right + spotlightPadding,
        bottom: spotlightRect.bottom + spotlightPadding,
        width: spotlightRect.width + spotlightPadding * 2,
        height: spotlightRect.height + spotlightPadding * 2,
      }
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      {/* Visual overlay (rounded cutout) - does not capture pointer events */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="hsl(var(--foreground) / 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Invisible click blockers around spotlight - block outside, leave spotlight clickable */}
      {spotlight ? (
        <>
          <div
            className="absolute left-0 right-0 top-0 pointer-events-auto"
            style={{ height: spotlight.top }}
          />
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-auto"
            style={{ top: spotlight.bottom }}
          />
          <div
            className="absolute left-0 pointer-events-auto"
            style={{
              top: spotlight.top,
              width: spotlight.left,
              height: spotlight.height,
            }}
          />
          <div
            className="absolute right-0 pointer-events-auto"
            style={{
              top: spotlight.top,
              left: spotlight.right,
              height: spotlight.height,
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 pointer-events-auto" />
      )}

      {/* Spotlight border animation - visual only */}
      {spotlight && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute border-2 border-primary rounded-xl pointer-events-none"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: '0 0 0 4px hsl(var(--primary) / 0.2), 0 0 30px hsl(var(--primary) / 0.3)',
          }}
        />
      )}

      {/* Tooltip - must have pointer-events to be interactive */}
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        key={`${module}-${currentStepIndex}`}
        className="absolute w-[380px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-[101] pointer-events-auto"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/50" />

        <div className="p-6">
          {/* Step indicator + Close */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentStepIndex 
                        ? 'w-6 bg-primary' 
                        : idx < currentStepIndex 
                          ? 'w-2 bg-primary/50' 
                          : 'w-2 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {currentStepIndex + 1}/{steps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
              onClick={handleSkip}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-foreground mb-2 leading-tight">
              {currentStep.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Interaction hint - more prominent */}
          {currentStep.requireInteraction && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 mb-5"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Hand className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Click to continue</p>
                <p className="text-xs text-muted-foreground">Select the highlighted element above</p>
              </div>
            </motion.div>
          )}

          {/* Actions - cleaner layout */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Skip tour
            </button>
            
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handlePrev}
                  className="h-9 px-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              
              {!currentStep.requireInteraction && (
                <Button 
                  size="sm" 
                  onClick={handleNext}
                  className="h-9 px-4 font-medium"
                >
                  {isLastStep ? 'Finish' : 'Continue'}
                  {!isLastStep && <ArrowRight className="w-4 h-4 ml-1.5" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Tooltip helper for stuck users
 */
export const OnboardingTooltip = ({ 
  text, 
  children 
}: { 
  text: string; 
  children: React.ReactNode;
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 px-3 py-2 text-xs text-foreground bg-popover border border-border rounded-lg shadow-lg whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 mb-2"
          >
            {text}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-popover border-r border-b border-border rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Help button for stuck users
 */
export const StuckHelpButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <HelpCircle className="w-4 h-4" />
      Need help?
    </Button>
  );
};
