import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { motion } from 'framer-motion';
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
    // Merge sources that share a single combined limit (LV + HV under one cap)
    // so the UI is logic-proof: one shared limit → one card.
    const groups: Record<string, FailingCriterion> = {};
    const groupKey = (id: string) => {
      if (id === 'percent_light_construction' || id === 'percent_heavy_construction') return 'construction_line';
      if (id === 'percent_light_operation' || id === 'percent_heavy_operation') return 'operation_line';
      return id;
    };
    exceeding.forEach((c) => {
      const k = groupKey(c.id);
      if (k === 'construction_line') {
        groups[k] = {
          id: k,
          title: t('noxExceedance.constructionTraffic') || 'Construction traffic (LV + HV)',
          explanation: t('noxExceedance.constructionTrafficExpl') || 'Light and heavy construction traffic share one combined limit.',
          percent: Math.max(c.percent, groups[k]?.percent ?? 0),
          adjustId: 'adjust_traffic',
        };
      } else if (k === 'operation_line') {
        groups[k] = {
          id: k,
          title: t('noxExceedance.operationTraffic') || 'Operational traffic (LV + HV)',
          explanation: t('noxExceedance.operationTrafficExpl') || 'Light and heavy operational traffic share one combined limit.',
          percent: Math.max(c.percent, groups[k]?.percent ?? 0),
          adjustId: 'reduce_traffic',
        };
      } else {
        groups[k] = c as FailingCriterion;
      }
    });
    return Object.values(groups).sort((a, b) => b.percent - a.percent);
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
    <div className="min-h-[calc(100vh-180px)] bg-background p-4 md:p-12">
      <motion.div
        className="w-full max-w-4xl mx-auto space-y-14"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="text-center space-y-5">
          <div className="space-y-3">
            <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground block">
              {t('noxExceedance.nonCompliant')}
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              {t('noxExceedance.nonCompliant')}
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {t('noxExceedance.description')}{' '}
              {t('noxExceedance.chooseBelow')}
            </p>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Bottlenecks — handles 1..N failing sources, with shared-limit merging */}
          <div className="space-y-4 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                {t('noxExceedance.bottlenecks')}
              </p>
              <span className="text-[10px] tabular-nums text-muted-foreground border border-border rounded-full px-2 py-0.5">
                {failingCriteria.length}
              </span>
            </div>

            <div
              className={cn(
                'space-y-2.5',
                failingCriteria.length > 3 && 'max-h-[460px] overflow-y-auto pr-1 -mr-1',
              )}
            >
              {failingCriteria.map((criterion, idx) => {
                const overshoot = Math.max(0, criterion.percent - 100);
                // Fixed visual scale (0–200%) so cards are comparable when N grows.
                const visualPct = Math.min(criterion.percent, 200);
                const thresholdPos = 50; // 100% sits at midpoint of 0–200 scale
                const projectPos = (visualPct / 200) * 100;

                return (
                  <div
                    key={criterion.id}
                    className="border border-border rounded-lg px-4 py-3.5 space-y-3 bg-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="text-[10px] tabular-nums text-muted-foreground w-4 shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-medium text-foreground truncate">{criterion.title}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-foreground border border-border rounded-full px-2 py-0.5 tabular-nums">
                        +{overshoot.toFixed(0)}%
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="relative h-1 bg-muted rounded-full">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                          style={{ width: `${projectPos}%` }}
                        />
                        <div
                          className="absolute top-[-2px] bottom-[-2px] w-px bg-foreground/50"
                          style={{ left: `${thresholdPos}%` }}
                        />
                      </div>
                      <div className="relative h-3 text-[10px] text-muted-foreground tabular-nums">
                        <span className="absolute left-0">0%</span>
                        <span
                          className="absolute -translate-x-1/2"
                          style={{ left: `${thresholdPos}%` }}
                        >
                          limit
                        </span>
                        <span className="absolute right-0 text-foreground font-medium">
                          {criterion.percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {criterion.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Solution path */}
          <div className="space-y-5">
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground text-center">
              {t('noxExceedance.choosePath')}
            </p>

            <ol className="space-y-3">
              {ACTION_PATHS.map((action, i) => (
                <li key={action.id}>
                  <button
                    onClick={() => handleActionClick(action.id)}
                    className={cn(
                      "group w-full text-left border rounded-lg px-5 py-4 transition-colors flex items-center gap-4",
                      action.recommended
                        ? "border-primary bg-primary/5 hover:bg-primary/10"
                        : "border-border bg-card hover:border-foreground/30"
                    )}
                  >
                    <span className="text-xs font-medium text-muted-foreground tabular-nums w-4 shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{action.title}</p>
                        {action.recommended && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-primary-foreground bg-primary px-1.5 py-0.5 rounded">
                            {t('noxExceedance.recommended')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">→</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Back */}
        <div className="text-center pt-4">
          <button
            onClick={onBackToProjects}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            {t('noxExceedance.backToProjects')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}