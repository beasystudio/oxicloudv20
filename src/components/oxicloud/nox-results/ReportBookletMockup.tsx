/**
 * 3D open booklet mockup - realistic printed report on a light gray surface
 * Features: strong perspective tilt, center spine shadow, drop shadow, paper texture
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReportBookletMockupProps {
  projectName: string;
  isPaid: boolean;
  isUnblurring: boolean;
  t: (key: string) => string;
}

export function ReportBookletMockup({ projectName, isPaid, isUnblurring, t }: ReportBookletMockupProps) {
  const blurClass = cn(
    'select-none transition-all duration-700 ease-out',
    !isUnblurring && 'blur-[6px]',
    isUnblurring && 'blur-0'
  );

  return (
    <div className="relative py-10 px-4">
      {/* Surface background - subtle gradient */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--muted) / 0.2) 0%, hsl(var(--muted) / 0.4) 100%)',
        }}
      />

      {/* Drop shadow under booklet - elongated ellipse */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-3 w-[80%] h-6"
        style={{
          background: 'radial-gradient(ellipse 80% 100% at center, hsl(var(--foreground) / 0.12) 0%, transparent 70%)',
          filter: 'blur(6px)',
        }}
      />

      {/* Booklet container with strong perspective */}
      <div
        className="relative mx-auto max-w-[600px]"
        style={{ perspective: '800px' }}
      >
        <div
          className="grid grid-cols-2 gap-0 rounded-lg overflow-hidden"
          style={{
            transform: 'rotateX(4deg) rotateY(-1deg)',
            transformOrigin: 'center 80%',
            boxShadow: '0 20px 40px -12px hsl(var(--foreground) / 0.10), 0 8px 16px -8px hsl(var(--foreground) / 0.06)',
          }}
        >
          {/* ─── Left page: cover / title ─── */}
          <div
            className="relative p-5 min-h-[300px]"
            style={{
              background: 'linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.15) 100%)',
              borderRight: '1px solid hsl(var(--foreground) / 0.04)',
            }}
          >
            {/* Paper grain overlay */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              }}
            />
            {/* Inner shadow from spine */}
            <div
              className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
              style={{
                background: 'linear-gradient(to left, hsl(var(--foreground) / 0.04), transparent)',
              }}
            />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-0.5">
                  {t('reportHeld.technicalReport')} - {t('reportHeld.environmentalPermit')}
                </p>
                <div className="w-8 h-[2px] bg-primary/40 rounded-full mt-2 mb-4" />

                <h3 className="text-[15px] font-bold text-foreground leading-snug mb-1.5">
                  {t('reportHeld.nitrogenEmission')}
                </h3>
                <p className={cn('text-[11px] text-muted-foreground/60 leading-relaxed', blurClass)}>
                  {t('reportHeld.preAssessment')}
                </p>
              </div>

              <div className="space-y-3 mt-6">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: t('reportHeld.projectLabel'), value: projectName },
                    { label: t('reportHeld.phaseLabel'), value: t('reportHeld.constructionPhase') },
                    { label: t('reportHeld.methodologyLabel'), value: 'VITO 2024' },
                    { label: t('reportHeld.regulationLabel'), value: t('reportHeld.nitrogenDecree') },
                  ].map((field) => (
                    <div key={field.label}>
                      <p className="text-[7px] text-muted-foreground/40 uppercase tracking-[0.15em] mb-0.5">
                        {field.label}
                      </p>
                      <p className={cn('text-[10px] font-medium text-foreground/70 leading-tight', blurClass)}>
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Spine crease ─── */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, hsl(var(--foreground) / 0.02), hsl(var(--foreground) / 0.08) 50%, hsl(var(--foreground) / 0.02))',
              boxShadow: '-2px 0 4px hsl(var(--foreground) / 0.03), 2px 0 4px hsl(var(--foreground) / 0.03)',
            }}
          />

          {/* ─── Right page: data ─── */}
          <div
            className="relative p-5 min-h-[300px]"
            style={{
              background: 'linear-gradient(215deg, hsl(var(--card)) 0%, hsl(var(--muted) / 0.1) 100%)',
              borderLeft: '1px solid hsl(var(--foreground) / 0.04)',
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              }}
            />
            {/* Inner shadow from spine */}
            <div
              className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, hsl(var(--foreground) / 0.04), transparent)',
              }}
            />

            <div className="relative z-10 h-full flex flex-col">
              {/* Status badge */}
              <div className="flex justify-end mb-3">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] transition-all duration-500',
                    isPaid
                      ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10'
                      : 'text-amber-600 border-amber-500/30 bg-amber-500/10'
                  )}
                >
                  {isPaid ? (t('reportHeld.unlockedBadge') || 'Unlocked') : t('reportHeld.heldBadge')}
                </Badge>
              </div>

              {/* Metric tiles */}
              <div className="space-y-2.5 flex-1">
                {[
                  { label: t('reportHeld.totalNox'), value: '14.85', unit: 'kg/jaar' },
                  { label: t('reportHeld.threshold'), value: '938.00', unit: 'kg/jaar' },
                  { label: t('reportHeld.status'), value: t('reportHeld.compliant'), unit: '< 1%', isBadge: true },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-border/15 p-3 bg-muted/5">
                    <p className="text-[7px] text-muted-foreground/50 uppercase tracking-[0.15em] mb-1">{metric.label}</p>
                    <div className={cn('flex items-baseline gap-1.5', blurClass)}>
                      {metric.isBadge ? (
                        <Badge className="bg-primary/20 text-primary text-[10px] font-semibold">{metric.value}</Badge>
                      ) : (
                        <span className="text-base font-bold text-foreground">{metric.value}</span>
                      )}
                      <span className="text-[9px] text-muted-foreground/60">{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blurred placeholder rows */}
              <div className="space-y-1.5 mt-3">
                {['w-full', 'w-4/5', 'w-11/12'].map((w, i) => (
                  <div key={i} className={cn(`h-1.5 ${w} rounded-full bg-muted/30 transition-all duration-700 ease-out`, !isUnblurring && 'blur-[4px]', isUnblurring && 'blur-0')} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
