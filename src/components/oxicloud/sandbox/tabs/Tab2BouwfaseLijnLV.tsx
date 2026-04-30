import { useSandbox } from '../SandboxWorkspace';
import { CompliancePanel } from '../CompliancePanel';
import { SandboxTabShell, Section, NumField } from '../SandboxTabShell';
import { SEEDS } from '../sandboxConstants';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface TabProps { onBack: () => void; onConfirm?: () => void; }

/**
 * JOINT panel for Sources 2 & 3 (Construction line — LV + HV).
 * Spec: LV/HV share one limit, assessed combined: (LV/MaxLV + HV/MaxHV) ≤ 100%.
 * Tab3 imports and renders this same panel.
 */
export function Tab2BouwfaseLijnLV({ onBack, onConfirm }: TabProps) {
  const { t } = useLanguage();
  const { state, update, emissions, thresholds, remaining, progress, isCompliant, seedEmissions } = useSandbox();

  const lvSrc = 'bouwfase_lijn_lv' as const;
  const hvSrc = 'bouwfase_lijn_hv' as const;

  const lvPct = thresholds[lvSrc] > 0 ? (emissions[lvSrc] / thresholds[lvSrc]) * 100 : 0;
  const hvPct = thresholds[hvSrc] > 0 ? (emissions[hvSrc] / thresholds[hvSrc]) * 100 : 0;
  const combinedPct = lvPct + hvPct;
  const jointCompliant = combinedPct <= 100;

  const handleResetAll = () => {
    update({
      floor_area: SEEDS.floor_area,
      construction_months: SEEDS.construction_months,
      prefab_percentage: SEEDS.prefab_percentage,
      lv_trips_override: null,
      hv_trips_override: null,
    });
  };

  const inputs = (
    <>
      <Section title={t('sandboxTabs.jointLinePanelTitle')} hint={t('sandboxTabs.jointLineHelp')}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <NumField
            label={t('sandboxTabs.floorArea')}
            value={state.floor_area}
            onChange={(v) => update({ floor_area: v })}
            unit="m²"
            max={50000}
            hint={t('sandboxTabs.sharedNote')}
          />
          <NumField
            label={t('sandboxTabs.constructionMonths')}
            value={state.construction_months}
            onChange={(v) => update({ construction_months: v })}
            unit={t('sandboxTabs.months')}
            min={1}
            max={60}
            hint={t('sandboxTabs.sharedNote')}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">{t('sandboxTabs.prefabLevel')}</label>
            <span className="text-sm tabular-nums text-foreground/80">
              {Math.round(state.prefab_percentage * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={80}
            value={Math.round(state.prefab_percentage * 100)}
            onChange={(e) => update({ prefab_percentage: Number(e.target.value) / 100 })}
            className="w-full accent-muted-foreground"
          />
        </div>
      </Section>

      <UsageBreakdown
        lvLabel={t('sandboxTabs.lvSection')}
        hvLabel={t('sandboxTabs.hvSection')}
        lvValue={emissions[lvSrc]}
        hvValue={emissions[hvSrc]}
        lvLimit={thresholds[lvSrc]}
        hvLimit={thresholds[hvSrc]}
        unitT={t('sandboxTabs.ofLimit')}
        combinedLabel={t('sandboxTabs.combinedUsage')}
        combinedPct={combinedPct}
      />
    </>
  );

  // CompliancePanel uses the combined LV+HV emission as one number for visualisation
  const combinedEmission = emissions[lvSrc] + emissions[hvSrc];
  const combinedThreshold = thresholds[lvSrc] + thresholds[hvSrc];
  const combinedSeed = seedEmissions[lvSrc] + seedEmissions[hvSrc];
  const combinedRemaining = Math.max(0, combinedEmission - combinedThreshold);
  const combinedProgress = combinedSeed > combinedThreshold
    ? Math.min(100, (1 - combinedRemaining / (combinedSeed - combinedThreshold)) * 100)
    : 100;

  return (
    <SandboxTabShell
      onResetAll={handleResetAll}
      inputs={inputs}
      onBack={onBack}
      onConfirm={onConfirm}
      compliance={
        <CompliancePanel
          label={t('sandboxTabs.emissionProjectionLabel')}
          threshold={combinedThreshold}
          currentEmission={Math.round(combinedEmission * 10) / 10}
          remaining={combinedRemaining}
          progress={combinedProgress}
          isCompliant={jointCompliant}
          beforeValue={Math.round(combinedSeed * 10) / 10}
        />
      }
    />
  );
}

function UsageBreakdown({
  lvLabel, hvLabel, lvValue, hvValue, lvLimit, hvLimit, unitT, combinedLabel, combinedPct,
}: {
  lvLabel: string; hvLabel: string;
  lvValue: number; hvValue: number;
  lvLimit: number; hvLimit: number;
  unitT: string; combinedLabel: string; combinedPct: number;
}) {
  const lvPct = lvLimit > 0 ? (lvValue / lvLimit) * 100 : 0;
  const hvPct = hvLimit > 0 ? (hvValue / hvLimit) * 100 : 0;

  return (
    <div className="rounded-md border border-border/70 bg-background p-3 space-y-3">
      <UsageRow label={lvLabel} value={lvValue} pct={lvPct} unit={unitT} />
      <UsageRow label={hvLabel} value={hvValue} pct={hvPct} unit={unitT} />
      <div className="border-t border-border pt-2 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{combinedLabel}</span>
        <span className={cn(
          'text-base tabular-nums text-foreground/80',
          combinedPct > 100 && 'font-normal',
        )}>
          {combinedPct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function UsageRow({ label, value, pct, unit }: { label: string; value: number; pct: number; unit: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground/80">
          {value.toFixed(1)} kg <span className="text-muted-foreground">· {pct.toFixed(0)}% {unit}</span>
        </span>
      </div>
      <div className="mt-1 h-1 w-full bg-muted/70 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', pct > 100 ? 'bg-muted-foreground/45' : 'bg-muted-foreground/25')}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
