import { CheckCircle2 } from 'lucide-react';

interface BentoTodoTileProps {
  count: number;
}

export function BentoTodoTile({ count }: BentoTodoTileProps) {
  return (
    <div className="col-span-4 lg:col-span-3 rounded-3xl p-6 bg-secondary text-secondary-foreground flex flex-col justify-between min-h-[180px] relative overflow-hidden">
      {/* Decorative ring */}
      <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full border-[6px] border-secondary-foreground/10 pointer-events-none" />

      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-secondary-foreground/50">
          To do
        </p>
        <p className="text-5xl font-bold tracking-tight mt-2">
          {count}
        </p>
      </div>

      <div className="flex justify-center mt-4">
        <div className="w-12 h-12 rounded-full bg-secondary-foreground/10 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-secondary-foreground/60" />
        </div>
      </div>
    </div>
  );
}
