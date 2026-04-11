import { useSandbox } from '../SandboxWorkspace';
import { CompliancePanel } from '../CompliancePanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Info } from 'lucide-react';
import { SEEDS, calcDailyTripsConstruction, calcLineSourceConstruction } from '../sandboxConstants';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

interface TabProps { onBack: () => void; }

export function Tab3BouwfaseLijnHV({ onBack }: TabProps) {
  const { t } = useLanguage();
  const { state, update, emissions, thresholds, remaining, progress, isCompliant } = useSandbox();
  const src = 'bouwfase_lijn_hv' as const;

  const dailyTrips = calcDailyTripsConstruction(state.hv_trips_rate);
  const seedEmission = calcLineSourceConstruction(SEEDS.hv_trips_rate, 0.014, SEEDS.prefab_percentage);
  const showAmber = dailyTrips > 8;

  const handleReset = () => {
    update({ hv_trips_rate: SEEDS.hv_trips_rate, prefab_percentage: SEEDS.prefab_percentage });
  };

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('sandboxTabs.trafficRatesHeader')}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">{t('sandboxTabs.hvTripsRate')}</label>
              <span className="text-[10px] text-muted-foreground">{t('sandboxTabs.tripsUnit')}</span>
            </div>
            <Input
              type="number" value={state.hv_trips_rate}
              onChange={e => update({ hv_trips_rate: Math.max(0, Number(e.target.value)) })}
              min={0} max={10} step={0.1}
              className="h-9 text-sm tabular-nums"
            />
            <div className={cn("px-3 py-1.5 rounded-lg text-xs tabular-nums", showAmber ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
              {t('sandboxTabs.dailyProjectTrips')} <strong>{dailyTrips}</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">{t('sandboxTabs.prefabPercentage')}</label>
              <span className="text-[10px] text-muted-foreground">{t('sandboxTabs.prefabRange')}</span>
            </div>
            <Input
              type="number" value={state.prefab_percentage}
              onChange={e => update({ prefab_percentage: Math.min(1, Math.max(0, Number(e.target.value))) })}
              min={0} max={1} step={0.01}
              className="h-9 text-sm tabular-nums"
            />
            <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              {t('sandboxTabs.prefabAffectsPointLV')}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('sandboxTabs.calculatedTrafficEmission')}</p>
            <p className={cn("text-xl font-bold tabular-nums", isCompliant[src] ? "text-foreground" : "text-destructive")}>
              {emissions[src].toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kg NOₓ</span>
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-xs gap-1.5">
              <ArrowLeft className="h-3 w-3" /> {t('sandboxTabs.back')}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1.5">
              <RotateCcw className="h-3 w-3" /> {t('sandboxTabs.resetValues')}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <CompliancePanel
            label={t('sandboxTabs.complianceStatusLijn').replace('{type}', 'HV')}
            threshold={thresholds[src]}
            currentEmission={emissions[src]}
            remaining={remaining[src]}
            progress={progress[src]}
            isCompliant={isCompliant[src]}
            beforeValue={Math.round(seedEmission * 10) / 10}
          />
        </div>
      </div>
    </div>
  );
}