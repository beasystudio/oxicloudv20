import { cn } from '@/lib/utils';

interface TeamMoment {
  type: 'birthday' | 'anniversary' | 'new_member';
  name: string;
  detail?: string;
}

interface BentoTeamMomentsTileProps {
  moments: TeamMoment[];
}

const labelMap = {
  birthday: '🎉',
  anniversary: '🏆',
  new_member: '👋',
};

export function BentoTeamMomentsTile({ moments }: BentoTeamMomentsTileProps) {
  if (moments.length === 0) return null;

  return (
    <div className="col-span-12 lg:col-span-5 rounded-3xl p-6 bg-background border border-border/40">
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] font-medium mb-4">
        Team Momenten
      </p>
      <div className="space-y-3">
        {moments.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-sm"
          >
            <span className="text-lg leading-none">{labelMap[m.type]}</span>
            <div>
              <span className="text-foreground font-semibold">{m.name}</span>
              {m.detail && (
                <span className="text-muted-foreground text-xs ml-1.5">- {m.detail}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
