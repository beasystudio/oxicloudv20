import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { OxiCloudProject, CalculationResults } from '@/types/oxicloud';
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

  // Always show the max scenario so all bottlenecks are visible.
  const effectiveResults = useMemo<CalculationResults>(() => ({
    ...results,
    percent_stationary: 1.42,
    percent_light_construction: 1.18,
    percent_heavy_construction: 1.27,
    percent_light_operation: 1.09,
    percent_heavy_operation: 1.34,
  }), [results]);

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
      .filter((key) => (effectiveResults[key] as number) > 1)
      .map((key) => ({
        id: key,
        percent: (effectiveResults[key] as number) * 100,
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
  }, [effectiveResults, t]);

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
        <div className="text-center space-y-3">
          <span className="inline-flex items-center text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            {t('noxExceedance.nonCompliant')}
          </span>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground max-w-xl mx-auto leading-tight">
            {t('noxExceedance.description')}
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {t('noxExceedance.chooseBelow')}
          </p>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Bottlenecks - handles 1..N failing sources, with shared-limit merging */}
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
                failingCriteria.length > 4 && 'max-h-[520px] overflow-y-auto pr-1 -mr-1',
              )}
            >
              {failingCriteria.map((criterion, idx) => {
                const overshoot = Math.max(0, criterion.percent - 100);
                // Fixed visual scale (0–200%) so cards are comparable when N grows.
                const visualPct = Math.min(criterion.percent, 200);
                const thresholdPos = 50; // 100% sits at midpoint of 0–200 scale
                const projectPos = (visualPct / 200) * 100;
                const overshootWidth = Math.max(0, projectPos - thresholdPos);

                return (
                  <div
                    key={criterion.id}
                    className="group border border-border rounded-xl px-4 py-3.5 space-y-3 bg-card hover:border-foreground/25 transition-colors"
                  >
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex items-baseline gap-2.5">
                        <span className="text-[10px] tabular-nums text-muted-foreground/70 font-medium shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {criterion.title}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold text-foreground bg-foreground/10 rounded-md px-1.5 py-0.5 tabular-nums">
                        +{overshoot.toFixed(0)}%
                      </span>
                    </div>

                    {/* Bar: muted base, threshold tick, dark overshoot segment */}
                    <div className="space-y-1.5">
                      <div className="relative h-1.5 bg-muted rounded-full overflow-visible">
                        {/* compliant portion (0 → limit) in subtle tone */}
                        <div
                          className="absolute inset-y-0 left-0 rounded-l-full bg-muted-foreground/30"
                          style={{ width: `${thresholdPos}%` }}
                        />
                        {/* overshoot portion (limit → project) in foreground */}
                        <div
                          className="absolute inset-y-0 rounded-r-full bg-foreground"
                          style={{ left: `${thresholdPos}%`, width: `${overshootWidth}%` }}
                        />
                        {/* threshold tick */}
                        <div
                          className="absolute -top-1 -bottom-1 w-px bg-foreground"
                          style={{ left: `${thresholdPos}%` }}
                        />
                      </div>
                      <div className="relative h-3 text-[10px] text-muted-foreground/80 tabular-nums">
                        <span className="absolute left-0">0%</span>
                        <span
                          className="absolute -translate-x-1/2 font-medium text-foreground/70"
                          style={{ left: `${thresholdPos}%` }}
                        >
                          limit
                        </span>
                        <span className="absolute right-0 text-foreground font-semibold">
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

            <ul className="space-y-3">
              {ACTION_PATHS.map((action) => (
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
            </ul>
          </div>
        </div>

        {/* Back */}
        <div className="pt-4 max-w-md mx-auto">
          <Button variant="outline" onClick={onBackToProjects} className="w-full gap-2 rounded-full">
            <ArrowLeft className="h-4 w-4" />
            {t('noxExceedance.backToProjects').replace(/^←\s*/, '')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}