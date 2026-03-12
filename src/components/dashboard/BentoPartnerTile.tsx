import { ArrowRight } from 'lucide-react';
import hotStreaksImg from '@/assets/hot-streaks.webp';

interface BentoPartnerTileProps {
  onNavigate: () => void;
}

export function BentoPartnerTile({ onNavigate }: BentoPartnerTileProps) {
  return (
    <button
      onClick={onNavigate}
      className="col-span-8 lg:col-span-4 rounded-3xl bg-secondary text-secondary-foreground flex flex-col justify-between text-left group transition-all hover:ring-2 hover:ring-primary/30 overflow-hidden"
    >
      {/* Image area */}
      <div className="h-28 w-full overflow-hidden relative">
        <img
          src={hotStreaksImg}
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-secondary-foreground/40 font-semibold mb-2">
            Partnerprogramma
          </p>
          <h2 className="text-base font-bold tracking-tight text-secondary-foreground leading-snug">
            Samenwerken aan
            <br />
            succesvolle projecten
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-3">
          Programmadetails bekijken
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
}
