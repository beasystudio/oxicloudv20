import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface NoxExceedanceScreenProps {
  project: OxiCloudProject;
  results: CalculationResults;
  onAdjustParameter: (category: string) => void;
  onSplitPhases: () => void;
  onRequestPassendeBeoordeling: () => void;
  onBackToProjects: () => void;
}

interface FailingCriterion {
  id: string;
  title: string;
  explanation: string;
  percent: number;
  adjustId: string;
}

const ALL_CRITERIA: (keyof CalculationResults)[] = [
  'percent_stationary',
  'percent_light_construction',
  'percent_heavy_construction',
  'percent_light_operation',
  'percent_heavy_operation',
];

export function NoxExceedanceScreen({
  project,
  results,
  onAdjustParameter,
  onSplitPhases,
  onRequestPassendeBeoordeling,
  onBackToProjects
}: NoxExceedanceScreenProps) {
  const { t } = useLanguage();

  const CRITERION_META: Record<string, { title: string; explanation: string; adjustId: string }> = {
    percent_stationary: {
      title: t('noxExceedance.constructionStationary'),
      explanation: t('noxExceedance.constructionStationaryExpl'),
      adjustId: 'adjust_construction',
    },
    percent_light_construction: {
      title: t('noxExceedance.constructionLight'),
      explanation: t('noxExceedance.constructionLightExpl'),
      adjustId: 'adjust_traffic',
    },
    percent_heavy_construction: {
      title: t('noxExceedance.constructionHeavy'),
      explanation: t('noxExceedance.constructionHeavyExpl'),
      adjustId: 'adjust_traffic',
    },
    percent_light_operation: {
      title: t('noxExceedance.operationLight'),
      explanation: t('noxExceedance.operationLightExpl'),
      adjustId: 'reduce_traffic',
    },
    percent_heavy_operation: {
      title: t('noxExceedance.operationHeavy'),
      explanation: t('noxExceedance.operationHeavyExpl'),
      adjustId: 'reduce_traffic',
    },
  };

  const ACTION_PATHS = [
    { id: 'adjust', title: t('noxExceedance.adjustParams'), subtitle: t('noxExceedance.quickestFix'), recommended: true },
    { id: 'split', title: t('noxExceedance.splitPhases'), subtitle: t('noxExceedance.divideProject'), recommended: false },
    { id: 'passende', title: t('noxExceedance.appropriateAssessment'), subtitle: t('noxExceedance.extendedAnalysis'), recommended: false },
  ];

  const failingCriteria = useMemo(() => {
    const exceeding = ALL_CRITERIA
      .filter((key) => (results[key] as number) > 1)
      .map((key) => ({
        id: key,
        percent: (results[key] as number) * 100,
        ...CRITERION_META[key],
      }));
    return exceeding.sort((a, b) => b.percent - a.percent).slice(0, 3);
  }, [results, t]);

  const handleActionClick = (actionId: string) => {
    if (actionId === 'adjust' && failingCriteria.length > 0) {
      onAdjustParameter(failingCriteria[0].adjustId);
    } else if (actionId === 'split') {
      onSplitPhases();
    } else if (actionId === 'passende') {
      onRequestPassendeBeoordeling();
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] p-4 md:p-10">
      <motion.div
        className="w-full max-w-5xl mx-auto space-y-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="text-center space-y-4">
          <motion.div
            className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
          >
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {t('noxExceedance.nonCompliant')}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              {t('noxExceedance.description')}
              <br className="hidden sm:block" />
              {t('noxExceedance.chooseBelow')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div className="lg:col-span-3 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground text-center">
              {t('noxExceedance.bottlenecks')}
            </p>

            <div className="space-y-4">
              {failingCriteria.map((criterion, i) => {
                const overshoot = criterion.percent - 100;
                const barMax = Math.max(criterion.percent, 120);
                const thresholdPos = (100 / barMax) * 100;
                const projectPos = (criterion.percent / barMax) * 100;

                return (
                  <motion.div
                    key={criterion.id}
                    className="group relative rounded-2xl border-border/60 overflow-hidden bg-card hover:shadow-destructive/5 hover:border-destructive/20 transition-all duration-500 ease-out border-0 shadow-lg"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="p-5 sm:p-6 space-y-4 border-0 shadow-lg">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[15px] font-semibold text-foreground tracking-tight">{criterion.title}</p>
                        <motion.div
                          className="shrink-0 flex items-center gap-1.5 bg-destructive/8 border border-destructive/15 rounded-full px-3 py-1.5"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 200 }}
                        >
                          <span className="text-xs font-bold text-destructive tabular-nums">↓ {overshoot.toFixed(0)}%</span>
                        </motion.div>
                      </div>

                      <div className="space-y-2">
                        <div className="relative h-3 bg-muted/60 rounded-full overflow-visible">
                          <motion.div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-destructive/50 via-destructive/80 to-destructive"
                            initial={{ width: 0 }}
                            animate={{ width: `${projectPos}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                          />
                          <div className="absolute top-[-4px] bottom-[-4px] w-[2px] bg-foreground/30 rounded-full z-10" style={{ left: `${thresholdPos}%` }} />
                          <motion.div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-destructive border-2 border-card shadow-md z-20"
                            style={{ left: `${projectPos}%`, marginLeft: '-8px' }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.2 + i * 0.1, type: 'spring', stiffness: 300 }}
                          />
                        </div>

                        <div className="relative flex text-[11px] font-medium text-muted-foreground">
                          <span className="absolute left-0">0%</span>
                          <span className="absolute -translate-x-1/2 text-foreground/60" style={{ left: `${thresholdPos}%` }}>100%</span>
                          <motion.span
                            className="absolute -translate-x-1/2 text-destructive font-bold tabular-nums"
                            style={{ left: `${projectPos}%` }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.3 + i * 0.1 }}
                          >
                            {criterion.percent.toFixed(0)}%
                          </motion.span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed pt-1">{criterion.explanation}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div className="lg:col-span-2 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground text-center">
              {t('noxExceedance.choosePath')}
            </p>

            <div className="space-y-2">
              {ACTION_PATHS.map((action, i) => (
                <motion.button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className={cn(
                    "group w-full bg-card rounded-xl px-4 py-3.5 text-left hover:shadow-md transition-all duration-300 border-0",
                    action.recommended ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border hover:border-primary/20'
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{action.title}</p>
                        {action.recommended && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            {t('noxExceedance.recommended')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{action.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <button
            onClick={onBackToProjects}
            className="h-10 px-6 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors text-sm font-medium"
          >
            {t('noxExceedance.backToProjects')}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}