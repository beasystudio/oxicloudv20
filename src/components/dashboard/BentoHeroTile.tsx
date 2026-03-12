import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BentoHeroTileProps {
  greeting: string;
  firstName: string;
  summaryLine?: string | null;
  onCreateProject: () => void;
}

export function BentoHeroTile({
  greeting,
  firstName,
  summaryLine,
  onCreateProject
}: BentoHeroTileProps) {
  return (
    <div className="col-span-12 flex items-start justify-between gap-6 pb-2">
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          {new Date().toLocaleDateString('nl-BE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-foreground">
          {greeting},
          <br />
          {firstName}.
        </h1>
        {summaryLine && (
          <p className="text-sm text-muted-foreground mt-3 max-w-md">
            {summaryLine}
          </p>
        )}
      </div>

      <Button
        onClick={onCreateProject}
        className="h-10 px-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-full shrink-0 mt-4"
      >
        <Plus className="h-4 w-4" />
        Nieuw Project
      </Button>
    </div>
  );
}
