import { BentoStatCard } from './BentoStatCard';

interface KpiItem {
  label: string;
  value: string | number;
  sub: string;
  accent?: boolean;
  variant?: 'default' | 'dark' | 'green';
}

interface BentoKpiClusterProps {
  kpis: KpiItem[];
}

export function BentoKpiCluster({ kpis }: BentoKpiClusterProps) {
  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
      {kpis.map((kpi, i) => (
        <BentoStatCard
          key={i}
          label={kpi.label}
          value={kpi.value}
          sub={kpi.sub}
          accent={kpi.accent}
          variant={kpi.variant}
        />
      ))}
    </div>
  );
}
