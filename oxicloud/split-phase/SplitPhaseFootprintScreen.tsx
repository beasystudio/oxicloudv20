import { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Polygon, Marker, useMap, FeatureGroup, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Layers, Home } from 'lucide-react';
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

const MapController: React.FC<{ center: [number, number] | null; zoom?: number }> = ({ center, zoom = 18 }) => {
  const map = useMap();
  useEffect(() => {
    if (center) { map.flyTo(center, zoom, { duration: 1 }); }
  }, [center, zoom, map]);
  return null;
};

const MapInvalidateSize: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(t);
  }, [map]);
  return null;
};

const DEMO_PROJECT_CENTER: [number, number] = [51.2190, 4.4035];
const DEMO_PLOT: [number, number][] = [[51.2200, 4.4015], [51.2200, 4.4055], [51.2180, 4.4055], [51.2180, 4.4015]];
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
  const phase1Percent = totalFootprint > 0 ? ((phase1Area / totalFootprint) * 100).toFixed(0) : '0';
  const phase2Area = totalFootprint - phase1Area;
  const phase2Percent = totalFootprint > 0 ? ((phase2Area / totalFootprint) * 100).toFixed(0) : '0';

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
      toast.success(t('modals.phase1FootprintDrawn').replace('{area}', String(area)));
    }
  }, [calculateArea, t]);

  const handleDrawDeleted = useCallback(() => { setPhase1Polygon(null); setPhase1Area(0); }, []);

  const handleConfirm = () => {
    if (!phase1Polygon || phase1Area <= 0) {
      toast.error(t('modals.drawPhase1First'));
      return;
    }
    onConfirm(phase1Area);
  };

  return (
    <div className="w-full h-[calc(100svh-64px)] flex flex-col bg-background overflow-hidden p-2">
      <div className="flex-1 w-full relative min-h-0 overflow-hidden rounded-2xl">
        {/* Top Overlay */}
        <header className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none flex justify-center">
          <div className="pointer-events-auto mt-3 w-[min(28rem,calc(100%-6rem))]">
            <div className="bg-background rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium tracking-widest uppercase text-primary">{t('modals.splitStep2of4')}</span>
                <span className="text-muted-foreground">{t('modals.definePhase1Footprint')}</span>
              </div>
              <div className="bg-background rounded-xl border border-border px-4 py-2.5">
                <div className="flex items-center justify-between text-sm gap-4">
                  <div className="text-center flex-1">
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">{t('modals.suggested')}</span>
                    <span className="font-semibold text-primary text-xs">{suggestedFootprint} m² ({(calculation.finalRatio * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">{t('modals.drawn')}</span>
                    <span className={cn("font-semibold text-xs", phase1Area > 0 ? "text-foreground" : "text-muted-foreground")}>
                      {phase1Area > 0 ? `${phase1Area} m²` : '-'}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">{t('modals.total')}</span>
                    <span className="font-semibold text-foreground text-xs">{totalFootprint} m²</span>
                  </div>
                </div>
              </div>
              {phase1Area > 0 && (
                <div className="bg-background rounded-xl border border-border px-4 py-2.5">
                  <div className="flex items-center justify-between text-sm gap-4">
                    <div className="text-center flex-1">
                      <span className="text-primary block text-[10px] uppercase tracking-wider mb-0.5">{t('modals.phase1')}</span>
                      <span className="font-semibold text-primary text-xs">{phase1Area} m² ({phase1Percent}%)</span>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center flex-1">
                      <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">{t('modals.phase2')}</span>
                      <span className="font-semibold text-foreground text-xs">{phase2Area} m² ({phase2Percent}%)</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Button variant="outline" onClick={onBack} className="h-10 px-4 bg-background shadow-sm">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />{t('modals.back')}
                </Button>
                <Button onClick={handleConfirm} disabled={!phase1Polygon || phase1Area <= 0} className="h-10 flex-1 shadow-sm">
                  {t('modals.confirmFootprint')}<ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center leading-snug font-medium">{t('modals.drawPhase1Hint')}</p>
            </div>
          </div>
          <div className="absolute top-3 left-4 right-4 flex items-start justify-between pointer-events-none">
            <div />
            <Button variant="outline" size="icon" onClick={() => setShowLayers(!showLayers)} className={cn("h-10 w-10 rounded-full bg-background shadow-md border-border pointer-events-auto", showLayers && "ring-2 ring-primary")}>
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {showLayers && (
          <div className="absolute top-36 right-4 z-[1000]">
            <div className="bg-background rounded-xl shadow-md border border-border p-4 w-48">
              <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">{t('modals.mapLayers')}</div>
              <div className="space-y-2.5">
                {[
                  { label: t('modals.basemap'), checked: showBasemap, onChange: setShowBasemap },
                  { label: t('modals.cadastre'), checked: showCadastre, onChange: setShowCadastre },
                ].map((layer) => (
                  <label key={layer.label} className="flex items-center gap-3 cursor-pointer text-sm">
                    <input type="checkbox" checked={layer.checked} onChange={(e) => layer.onChange(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
                    <span className="text-foreground">{layer.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="bg-background rounded-xl shadow-md border border-border px-4 py-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2" style={{ borderColor: MAP_COLORS.plot, backgroundColor: `${MAP_COLORS.plot}15` }} />
              <span className="text-muted-foreground">{t('modals.parcel')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-dashed" style={{ borderColor: MAP_COLORS.originalBuilding, backgroundColor: `${MAP_COLORS.originalBuilding}10` }} />
              <span className="text-muted-foreground">{t('modals.originalFootprint')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2" style={{ borderColor: MAP_COLORS.phase1, backgroundColor: `${MAP_COLORS.phase1}30` }} />
              <span className="text-foreground font-medium">{t('modals.phase1Area')}</span>
            </div>
          </div>
        </div>

        <MapContainer center={center} zoom={18} className="h-full w-full rounded-2xl" zoomControl={false}>
          {showBasemap && <TileLayer attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" subdomains="abcd" maxZoom={20} zIndex={0} />}
          {showCadastre && <WMSTileLayer url="https://ccff02.minfin.fgov.be/geoservices/arcgis/services/WMS/Cadastral_Layers/MapServer/WMSServer" params={{ layers: 'Cadastral_parcel,Cadastral_building', format: 'image/png', transparent: true, version: '1.3.0' }} opacity={0.9} zIndex={10} maxZoom={22} maxNativeZoom={19} />}
          <MapInvalidateSize />
          <MapController center={center} zoom={18} />
          <Polygon positions={plot} pathOptions={{ color: MAP_COLORS.plot, weight: 2, fillOpacity: 0.08 }} />
          {existingBuildings.map((coords, idx) => (
            <Polygon key={`orig-building-${idx}`} positions={coords} pathOptions={{ color: MAP_COLORS.originalBuilding, weight: 2, fillOpacity: 0.06, dashArray: '5, 5' }} />
          ))}
          {!phase1Polygon && (
            <FeatureGroup ref={featureGroupRef}>
              <EditControl position="topright" onCreated={handleDrawCreated} onDeleted={handleDrawDeleted} draw={{ rectangle: { shapeOptions: { color: MAP_COLORS.phase1, fillColor: MAP_COLORS.phase1, fillOpacity: 0.25 } }, circle: false, circlemarker: false, marker: false, polyline: false, polygon: { allowIntersection: false, shapeOptions: { color: MAP_COLORS.phase1, fillColor: MAP_COLORS.phase1, fillOpacity: 0.25 } } }} />
            </FeatureGroup>
          )}
          {phase1Polygon && <Polygon positions={phase1Polygon} pathOptions={{ color: MAP_COLORS.phase1, weight: 3, fillColor: MAP_COLORS.phase1, fillOpacity: 0.25 }} />}
        </MapContainer>
      </div>
    </div>
  );
}
