import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Polygon, useMap, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { SplitPhaseCalculation } from '@/types/splitPhase';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface SplitPhaseFootprintScreenProps {
  calculation: SplitPhaseCalculation;
  totalFootprint: number;
  originalFootprint?: [number, number][];
  plotCoordinates?: [number, number][];
  buildingFootprints?: [number, number][][];
  projectCoordinates?: [number, number];
  onConfirm: (phase1Footprint: number) => void;
  onBack: () => void;
}

const MAP_COLORS = {
  plot: 'hsl(var(--neon-lime))',
  originalBuilding: 'hsl(var(--foreground))',
  phase1: 'hsl(var(--primary))',
} as const;

const MapInvalidateSize: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(t);
  }, [map]);
  return null;
};

const MapController: React.FC<{ center: [number, number] | null; zoom?: number }> = ({ center, zoom = 18 }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  return null;
};

const DEMO_PROJECT_CENTER: [number, number] = [51.219, 4.4035];
const DEMO_PLOT: [number, number][] = [[51.22, 4.4015], [51.22, 4.4055], [51.218, 4.4055], [51.218, 4.4015]];
const DEMO_BUILDING: [number, number][] = [[51.2195, 4.4025], [51.2195, 4.4045], [51.2185, 4.4045], [51.2185, 4.4025]];

export function SplitPhaseFootprintScreen({
  calculation, totalFootprint, originalFootprint, plotCoordinates, buildingFootprints, projectCoordinates, onConfirm, onBack,
}: SplitPhaseFootprintScreenProps) {
  const { t } = useLanguage();
  const plot = plotCoordinates && plotCoordinates.length >= 3 ? plotCoordinates : DEMO_PLOT;
  const existingBuildings = buildingFootprints && buildingFootprints.length > 0 ? buildingFootprints : [originalFootprint ?? DEMO_BUILDING];
  const center = projectCoordinates ?? DEMO_PROJECT_CENTER;

  const [phase1Polygon, setPhase1Polygon] = useState<[number, number][] | null>(null);
  const [phase1Area, setPhase1Area] = useState<number>(0);
  const [showLayers, setShowLayers] = useState(false);
  const [showBasemap, setShowBasemap] = useState(true);
  const [showCadastre, setShowCadastre] = useState(true);
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const suggestedFootprint = Math.round(totalFootprint * calculation.finalRatio);
  const phase1Ratio = totalFootprint > 0 ? phase1Area / totalFootprint : 0;
  const phase1Percent = (phase1Ratio * 100).toFixed(0);

  // Spec §4.3 — area ratio must fall within [R_min, R_compliance]
  const minR = calculation.minimumRatio;
  const maxR = calculation.complianceRatio;
  const validation = useMemo<{ valid: boolean; message: string | null }>(() => {
    if (phase1Area <= 0) return { valid: false, message: null };
    if (phase1Ratio < minR) return { valid: false, message: `Below minimum ${(minR * 100).toFixed(0)}% (R_min)` };
    if (phase1Ratio > maxR) return { valid: false, message: `Above compliance ceiling ${(maxR * 100).toFixed(0)}% (R_compliance)` };
    return { valid: true, message: null };
  }, [phase1Area, phase1Ratio, minR, maxR]);

  const calculateArea = useCallback((coords: [number, number][]) => {
    if (coords.length < 3) return 0;
    try {
      const turfCoords = coords.map(([lat, lng]) => [lng, lat]);
      turfCoords.push(turfCoords[0]);
      const polygon = turf.polygon([turfCoords]);
      return Math.round(turf.area(polygon));
    } catch { return 0; }
  }, []);

  const handleDrawCreated = useCallback((e: any) => {
    const layer = e.layer;
    if (layer instanceof L.Polygon) {
      const latLngs = layer.getLatLngs()[0] as L.LatLng[];
      const coords: [number, number][] = latLngs.map((ll) => [ll.lat, ll.lng]);
      setPhase1Polygon(coords);
      const area = calculateArea(coords);
      setPhase1Area(area);
    }
  }, [calculateArea]);

  const handleDrawDeleted = useCallback(() => { setPhase1Polygon(null); setPhase1Area(0); }, []);

  const handleResetToSuggestion = () => {
    // Reset map drawing — user can redraw or accept suggested
    setPhase1Polygon(null);
    setPhase1Area(suggestedFootprint);
    toast.success(`Reset to suggested ${suggestedFootprint} m²`);
  };

  const handleConfirm = () => {
    if (!validation.valid && phase1Area === suggestedFootprint) {
      // Allow the suggested area as a fallback
      onConfirm(suggestedFootprint);
      return;
    }
    if (!validation.valid) {
      toast.error(validation.message ?? t('splitPhase.drawFirst'));
      return;
    }
    onConfirm(phase1Area);
  };

  return (
    <div className="w-full h-[calc(100svh-64px)] flex flex-col bg-background overflow-hidden p-2">
      <div className="flex-1 w-full relative min-h-0 overflow-hidden rounded-xl border border-border">
        {/* ── Top overlay: sandbox-tight ── */}
        <header className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none flex justify-center">
          <div className="pointer-events-auto mt-3 w-[min(28rem,calc(100%-6rem))]">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl border border-border shadow-sm p-3 space-y-2.5">
              {/* Eyebrow */}
              <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                <span className="tabular-nums text-foreground/80">02 / 04</span>
                <span className="h-px w-6 bg-border" />
                <span>{t('splitPhase.defineFootprint')}</span>
              </div>

              {/* Areas grid */}
              <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg overflow-hidden">
                <Cell label={t('splitPhase.suggested')} value={`${suggestedFootprint} m²`} sub={`${(calculation.finalRatio * 100).toFixed(0)}%`} />
                <Cell
                  label={t('splitPhase.drawn')}
                  value={phase1Area > 0 ? `${phase1Area} m²` : '—'}
                  sub={phase1Area > 0 ? `${phase1Percent}%` : ''}
                  emphasized={phase1Area > 0}
                />
                <Cell label={t('splitPhase.totalLabel')} value={`${totalFootprint} m²`} sub="100%" />
              </div>

              {/* Validation */}
              {phase1Area > 0 && (
                <div
                  className={cn(
                    'flex items-center justify-between text-[11px] rounded-md px-2.5 py-1.5 border',
                    validation.valid
                      ? 'border-border bg-card text-foreground'
                      : 'border-foreground/30 bg-foreground/5 text-foreground',
                  )}
                >
                  <span className="text-muted-foreground">
                    Allowed: {(minR * 100).toFixed(0)}% – {(maxR * 100).toFixed(0)}%
                  </span>
                  <span className="font-medium tabular-nums">
                    {validation.valid ? '✓ within range' : validation.message}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  {t('modals.back')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetToSuggestion}
                  className="h-8 rounded-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset to suggested
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!validation.valid}
                  className="h-8 flex-1 rounded-full text-xs gap-1"
                >
                  {t('modals.confirmFootprint')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground text-center leading-snug">
                {t('splitPhase.drawHint')}
              </p>
            </div>
          </div>

          <div className="absolute top-3 right-4 pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowLayers((v) => !v)}
              className={cn(
                'h-9 w-9 rounded-full bg-background border-border shadow-sm pointer-events-auto',
                showLayers && 'ring-1 ring-foreground',
              )}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {showLayers && (
          <div className="absolute top-16 right-4 z-[1000]">
            <div className="bg-background rounded-xl border border-border shadow-sm p-3 w-44">
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">
                {t('splitPhase.mapLayers')}
              </div>
              <div className="space-y-2">
                {[
                  { label: t('splitPhase.basemap'), checked: showBasemap, onChange: setShowBasemap },
                  { label: t('splitPhase.cadastre'), checked: showCadastre, onChange: setShowCadastre },
                ].map((layer) => (
                  <label key={layer.label} className="flex items-center gap-2.5 cursor-pointer text-[12px]">
                    <input
                      type="checkbox"
                      checked={layer.checked}
                      onChange={(e) => layer.onChange(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border accent-foreground"
                    />
                    <span className="text-foreground">{layer.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[1000]">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg border border-border shadow-sm px-3 py-2 flex items-center gap-3 text-[11px]">
            <LegendDot color={MAP_COLORS.plot} label={t('splitPhase.plot')} />
            <LegendDot color={MAP_COLORS.originalBuilding} label={t('splitPhase.originalFootprint')} dashed />
            <LegendDot color={MAP_COLORS.phase1} label={t('splitPhase.phase1Area')} />
          </div>
        </div>

        <MapContainer center={center} zoom={18} className="h-full w-full" zoomControl={false}>
          {showBasemap && (
            <TileLayer
              attribution="&copy; OpenStreetMap &copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
              zIndex={0}
            />
          )}
          {showCadastre && (
            <WMSTileLayer
              url="https://ccff02.minfin.fgov.be/geoservices/arcgis/services/WMS/Cadastral_Layers/MapServer/WMSServer"
              params={{ layers: 'Cadastral_parcel,Cadastral_building', format: 'image/png', transparent: true, version: '1.3.0' }}
              opacity={0.9}
              zIndex={10}
              maxZoom={22}
              maxNativeZoom={19}
            />
          )}
          <MapInvalidateSize />
          <MapController center={center} zoom={18} />
          <Polygon positions={plot} pathOptions={{ color: MAP_COLORS.plot, weight: 2, fillOpacity: 0.08 }} />
          {existingBuildings.map((coords, idx) => (
            <Polygon
              key={`orig-building-${idx}`}
              positions={coords}
              pathOptions={{ color: MAP_COLORS.originalBuilding, weight: 2, fillOpacity: 0.06, dashArray: '5, 5' }}
            />
          ))}
          {!phase1Polygon && (
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleDrawCreated}
                onDeleted={handleDrawDeleted}
                draw={{
                  rectangle: { shapeOptions: { color: MAP_COLORS.phase1, fillColor: MAP_COLORS.phase1, fillOpacity: 0.25 } },
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                  polygon: { allowIntersection: false, shapeOptions: { color: MAP_COLORS.phase1, fillColor: MAP_COLORS.phase1, fillOpacity: 0.25 } },
                }}
              />
            </FeatureGroup>
          )}
          {phase1Polygon && (
            <Polygon
              positions={phase1Polygon}
              pathOptions={{ color: MAP_COLORS.phase1, weight: 3, fillColor: MAP_COLORS.phase1, fillOpacity: 0.25 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

function Cell({ label, value, sub, emphasized }: { label: string; value: string; sub?: string; emphasized?: boolean }) {
  return (
    <div className="px-2.5 py-1.5 text-center bg-card">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={cn('text-[12px] font-semibold tabular-nums leading-tight mt-0.5', emphasized ? 'text-foreground' : 'text-foreground')}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground tabular-nums">{sub}</p>}
    </div>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn('w-3 h-3 rounded-sm border', dashed ? 'border-dashed' : '')}
        style={{ borderColor: color, borderWidth: 2, backgroundColor: `${color}15` }}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
