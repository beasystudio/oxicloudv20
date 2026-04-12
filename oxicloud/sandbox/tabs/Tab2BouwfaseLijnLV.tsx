import { useSandbox } from '../SandboxWorkspace';
import { CompliancePanel } from '../CompliancePanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Info, AlertTriangle } from 'lucide-react';
import { SEEDS, calcDailyTripsConstruction, calcLineSourceConstruction } from '../sandboxConstants';
import { cn } from '@/lib/utils';

interface TabProps { onBack: () => void; }

export function Tab2BouwfaseLijnLV({ onBack }: TabProps) {
  const { state, update, emissions, thresholds, remaining, progress, isCompliant } = useSandbox();
  const src = 'bouwfase_lijn_lv' as const;

  const dailyTrips = calcDailyTripsConstruction(state.lv_trips_rate);
  const seedEmission = calcLineSourceConstruction(SEEDS.lv_trips_rate, 0.0021, SEEDS.prefab_percentage);

  const handleReset = () => {
    update({ lv_trips_rate: SEEDS.lv_trips_rate, prefab_percentage: SEEDS.prefab_percentage });
  };

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left */}
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Traffic Generation Rates - gebaseerd op CROW 381, Brugge Mobiliteitsstudie
            </p>
          </div>

          {/* LV trips rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">LV trips rate</label>
              <span className="text-[10px] text-muted-foreground">trips/1000m²/dag</span>
            </div>
            <Input
              type="number" value={state.lv_trips_rate}
              onChange={e => update({ lv_trips_rate: Math.max(0, Number(e.target.value)) })}
              min={0} max={30} step={0.1}
              className="h-9 text-sm tabular-nums"
            />
            <p className="text-xs text-muted-foreground">Dagelijkse projectritten: <strong className="text-foreground tabular-nums">{dailyTrips}</strong></p>
          </div>

          {/* Prefab percentage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Prefabricage percentage</label>
              <span className="text-[10px] text-muted-foreground">0.00-1.00</span>
            </div>
            <Input
              type="number" value={state.prefab_percentage}
              onChange={e => update({ prefab_percentage: Math.min(1, Math.max(0, Number(e.target.value))) })}
              min={0} max={1} step={0.01}
              className="h-9 text-sm tabular-nums"
            />
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                30%-56% prefabricage houdt beide lijnbron- en puntbrondrempels in de bouwfase conform.
              </p>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              Dit percentage beïnvloedt ook de berekeningen voor Bouwfase Puntbronnen en Lijnbron HV.
            </p>
          </div>

          {/* Live emission display */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Berekende verkeersemissie</p>
            <p className={cn("text-xl font-bold tabular-nums", isCompliant[src] ? "text-foreground" : "text-destructive")}>
              {emissions[src].toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kg NOₓ</span>
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-xs gap-1.5">
              <ArrowLeft className="h-3 w-3" /> Terug
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1.5">
              <RotateCcw className="h-3 w-3" /> Reset Values
            </Button>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2">
          <CompliancePanel
            label="Compliance Status - Lijnbron LV"
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
