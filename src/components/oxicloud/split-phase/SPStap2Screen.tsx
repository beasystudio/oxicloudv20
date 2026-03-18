import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Point,
  shoelaceArea,
  clipPolygon,
  findCutPosition,
  SplitPhaseResult,
} from './splitPhaseEngine';

interface Props {
  calcResult: SplitPhaseResult;
  totalFootprintM2: number;
  onConfirm: (polygon: Point[], areaM2: number, totalM2: number) => void;
  onBack: () => void;
}

// SVG footprint polygon (parcel and building)
const PARCEL: Point[] = [
  { x: 50, y: 30 },
  { x: 550, y: 30 },
  { x: 550, y: 370 },
  { x: 50, y: 370 },
];

const ORIGINAL_FOOTPRINT: Point[] = [
  { x: 100, y: 80 },
  { x: 480, y: 80 },
  { x: 480, y: 340 },
  { x: 100, y: 340 },
];

export function SPStap2Screen({ calcResult, totalFootprintM2, onConfirm, onBack }: Props) {
  const { t } = useLanguage();
  const svgRef = useRef<SVGSVGElement>(null);

  const [axis, setAxis] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isDragging, setIsDragging] = useState(false);

  // Find initial cut position
  const initialCut = findCutPosition(ORIGINAL_FOOTPRINT, calcResult.R_phase1, axis);
  const [cutPosition, setCutPosition] = useState(initialCut);

  // SVG scale
  const totalSvgArea = shoelaceArea(ORIGINAL_FOOTPRINT);
  const SVG_SCALE = totalFootprintM2 / totalSvgArea;

  // Compute clipped polygons
  const phase1Points = clipPolygon(ORIGINAL_FOOTPRINT, cutPosition, axis, 'above');
  const phase2Points = clipPolygon(ORIGINAL_FOOTPRINT, cutPosition, axis, 'below');

  const phase1SvgArea = shoelaceArea(phase1Points);
  const phase1AreaM2 = Math.round(phase1SvgArea * SVG_SCALE);
  const phase2AreaM2 = totalFootprintM2 - phase1AreaM2;
  const phase1Ratio = phase1AreaM2 / totalFootprintM2;

  const suggestedM2 = Math.round(totalFootprintM2 * calcResult.R_phase1);
  const suggestedPct = (calcResult.R_phase1 * 100).toFixed(0);
  const drawnPct = totalFootprintM2 > 0 ? ((phase1AreaM2 / totalFootprintM2) * 100).toFixed(0) : '0';

  // Validation
  const tooSmall = phase1Ratio < calcResult.R_min;
  const tooLarge = phase1Ratio > calcResult.R_compliance;
  const isValid = !tooSmall && !tooLarge;

  // R_min and R_compliance positions for visual hints
  const rMinCut = findCutPosition(ORIGINAL_FOOTPRINT, calcResult.R_min, axis);
  const rCompCut = findCutPosition(ORIGINAL_FOOTPRINT, calcResult.R_compliance, axis);

  // Recalculate cut when axis changes
  useEffect(() => {
    const newCut = findCutPosition(ORIGINAL_FOOTPRINT, calcResult.R_phase1, axis);
    setCutPosition(newCut);
  }, [axis, calcResult.R_phase1]);

  // Mouse/touch drag handlers
  const getSvgCoord = useCallback(
    (clientX: number, clientY: number): number => {
      if (!svgRef.current) return cutPosition;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 600 / rect.width;
      const scaleY = 400 / rect.height;
      return axis === 'horizontal'
        ? (clientY - rect.top) * scaleY
        : (clientX - rect.left) * scaleX;
    },
    [axis, cutPosition]
  );

  const coords = ORIGINAL_FOOTPRINT.map((p) => (axis === 'horizontal' ? p.y : p.x));
  const minCoord = Math.min(...coords);
  const maxCoord = Math.max(...coords);

  const handlePointerDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const val = getSvgCoord(e.clientX, e.clientY);
      const clamped = Math.max(minCoord + 5, Math.min(maxCoord - 5, val));
      setCutPosition(clamped);
    },
    [isDragging, getSvgCoord, minCoord, maxCoord]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global pointer events
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: PointerEvent) => {
      const val = getSvgCoord(e.clientX, e.clientY);
      const clamped = Math.max(minCoord + 5, Math.min(maxCoord - 5, val));
      setCutPosition(clamped);
    };
    const handleUp = () => setIsDragging(false);
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, getSvgCoord, minCoord, maxCoord]);

  const handleReset = () => {
    const newCut = findCutPosition(ORIGINAL_FOOTPRINT, calcResult.R_phase1, axis);
    setCutPosition(newCut);
  };

  const pointsToSvg = (pts: Point[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');

  // Cut line coordinates
  const cutLineStart = axis === 'horizontal'
    ? { x: ORIGINAL_FOOTPRINT[0].x, y: cutPosition }
    : { x: cutPosition, y: ORIGINAL_FOOTPRINT[0].y };
  const cutLineEnd = axis === 'horizontal'
    ? { x: ORIGINAL_FOOTPRINT[1].x, y: cutPosition }
    : { x: cutPosition, y: ORIGINAL_FOOTPRINT[2].y };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
          {/* Header */}
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-primary mb-2 block">
              {t('splitPhase.stap2Progress')}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
              {t('splitPhase.stap2Title')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('splitPhase.stap2Instruction')}</p>
          </div>

          {/* Axis toggle */}
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant={axis === 'horizontal' ? 'default' : 'outline'}
              onClick={() => setAxis('horizontal')}
              className="rounded-lg text-xs"
            >
              — {t('splitPhase.stap2ToggleHorizontal')}
            </Button>
            <Button
              size="sm"
              variant={axis === 'vertical' ? 'default' : 'outline'}
              onClick={() => setAxis('vertical')}
              className="rounded-lg text-xs"
            >
              | {t('splitPhase.stap2ToggleVertical')}
            </Button>
          </div>

          <div className="grid grid-cols-[1fr_280px] gap-6">
            {/* SVG Canvas */}
            <div className="rounded-2xl border border-border bg-muted/10 overflow-hidden relative">
              <svg
                ref={svgRef}
                viewBox="0 0 600 400"
                className={cn(
                  'w-full h-auto select-none',
                  isDragging
                    ? axis === 'horizontal' ? 'cursor-ns-resize' : 'cursor-ew-resize'
                    : ''
                )}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {/* Parcel */}
                <polygon
                  points={pointsToSvg(PARCEL)}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                {/* Original footprint */}
                <polygon
                  points={pointsToSvg(ORIGINAL_FOOTPRINT)}
                  fill="hsl(var(--foreground) / 0.08)"
                  stroke="hsl(var(--foreground) / 0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* Phase 2 (grey) */}
                {phase2Points.length >= 3 && (
                  <polygon
                    points={pointsToSvg(phase2Points)}
                    fill="hsl(var(--muted-foreground) / 0.2)"
                    stroke="hsl(var(--muted-foreground) / 0.4)"
                    strokeWidth="1"
                  />
                )}
                {/* Phase 1 (green) */}
                {phase1Points.length >= 3 && (
                  <polygon
                    points={pointsToSvg(phase1Points)}
                    fill="hsl(var(--primary) / 0.25)"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    style={{ opacity: isDragging ? 0.5 : 0.35 }}
                  />
                )}
                {/* Valid range tick marks */}
                {axis === 'horizontal' ? (
                  <>
                    <line x1={85} y1={rMinCut} x2={95} y2={rMinCut} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="2 2" opacity={0.5} />
                    <line x1={85} y1={rCompCut} x2={95} y2={rCompCut} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="2 2" opacity={0.5} />
                  </>
                ) : (
                  <>
                    <line x1={rMinCut} y1={345} x2={rMinCut} y2={355} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="2 2" opacity={0.5} />
                    <line x1={rCompCut} y1={345} x2={rCompCut} y2={355} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="2 2" opacity={0.5} />
                  </>
                )}
                {/* Cut line */}
                <line
                  x1={cutLineStart.x}
                  y1={cutLineStart.y}
                  x2={cutLineEnd.x}
                  y2={cutLineEnd.y}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  className={cn(
                    'transition-none',
                    axis === 'horizontal' ? 'cursor-ns-resize' : 'cursor-ew-resize'
                  )}
                  onPointerDown={handlePointerDown}
                  style={{ pointerEvents: 'all' }}
                />
                {/* Drag handles */}
                <circle
                  cx={cutLineStart.x}
                  cy={cutLineStart.y}
                  r="6"
                  fill="white"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  className={cn(axis === 'horizontal' ? 'cursor-ns-resize' : 'cursor-ew-resize')}
                  onPointerDown={handlePointerDown}
                  style={{ pointerEvents: 'all' }}
                />
                <circle
                  cx={cutLineEnd.x}
                  cy={cutLineEnd.y}
                  r="6"
                  fill="white"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  className={cn(axis === 'horizontal' ? 'cursor-ns-resize' : 'cursor-ew-resize')}
                  onPointerDown={handlePointerDown}
                  style={{ pointerEvents: 'all' }}
                />
                {/* Phase labels */}
                {phase1Points.length >= 3 && (() => {
                  const cx = phase1Points.reduce((s, p) => s + p.x, 0) / phase1Points.length;
                  const cy = phase1Points.reduce((s, p) => s + p.y, 0) / phase1Points.length;
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="text-xs font-medium fill-primary" style={{ fontSize: 14 }}>
                      {t('splitPhase.stap2Fase1Row')}
                    </text>
                  );
                })()}
                {phase2Points.length >= 3 && (() => {
                  const cx = phase2Points.reduce((s, p) => s + p.x, 0) / phase2Points.length;
                  const cy = phase2Points.reduce((s, p) => s + p.y, 0) / phase2Points.length;
                  return (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="text-xs fill-muted-foreground" style={{ fontSize: 14 }}>
                      {t('splitPhase.stap2Fase2Row')}
                    </text>
                  );
                })()}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-xl border border-border px-4 py-2.5 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 border border-dashed border-foreground/30 bg-foreground/5 rounded-sm" />
                  <span className="text-muted-foreground">{t('splitPhase.stap2LegendOriginal')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-primary/30 border border-primary rounded-sm" />
                  <span className="text-foreground font-medium">{t('splitPhase.stap2LegendPhase1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-muted-foreground/20 border border-muted-foreground/40 rounded-sm" />
                  <span className="text-muted-foreground">{t('splitPhase.stap2LegendPhase2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-t-2 border-dashed border-foreground" />
                  <span className="text-muted-foreground">{t('splitPhase.stap2LegendCutline')}</span>
                </div>
              </div>
            </div>

            {/* Floating info panel */}
            <div className="space-y-4">
              <div className="bg-background rounded-xl border border-border p-4 space-y-4 shadow-sm">
                <span className="text-[10px] font-medium tracking-widest uppercase text-primary block">
                  {t('splitPhase.stap2Progress')}
                </span>

                <div className="space-y-2">
                  <InfoRow label={t('splitPhase.stap2Suggested')} value={`${suggestedM2} m²`} sub={`(${suggestedPct}%)`} highlight />
                  <InfoRow label={t('splitPhase.stap2Drawn')} value={`${phase1AreaM2} m²`} sub={`(${drawnPct}%)`} />
                  <InfoRow label={t('splitPhase.stap2Total')} value={`${totalFootprintM2} m²`} />
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="font-medium">{t('splitPhase.stap2Fase1Row')}</span>
                    </div>
                    <span className="tabular-nums">{phase1AreaM2} m² <span className="text-muted-foreground">({drawnPct}%)</span></span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
                      <span className="font-medium">{t('splitPhase.stap2Fase2Row')}</span>
                    </div>
                    <span className="tabular-nums">{phase2AreaM2} m² <span className="text-muted-foreground">({(100 - Number(drawnPct)).toFixed(0)}%)</span></span>
                  </div>
                </div>
              </div>

              {/* Validation errors */}
              {tooSmall && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {t('splitPhase.stap2ErrorTooSmall')}
                </div>
              )}
              {tooLarge && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {t('splitPhase.stap2ErrorTooLarge')}
                </div>
              )}

              {/* CTAs */}
              <div className="space-y-2">
                <Button
                  onClick={() => onConfirm(phase1Points, phase1AreaM2, totalFootprintM2)}
                  disabled={!isValid}
                  className="w-full h-11 rounded-xl"
                >
                  {t('splitPhase.stap2CtaConfirm')}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onBack} className="flex-1 rounded-xl">
                    {t('splitPhase.stap2CtaBack')}
                  </Button>
                  <Button variant="ghost" onClick={handleReset} className="flex-1 rounded-xl">
                    {t('splitPhase.stap2CtaReset')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-medium tabular-nums', highlight && 'text-primary')}>
        {value} {sub && <span className="text-muted-foreground text-xs">{sub}</span>}
      </span>
    </div>
  );
}
