import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, GeoJSON, useMap, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Lock, Check, Loader2, Circle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});
export interface MapFootprintResult {
  distance: number;
  sitename: string;
  sitecode: string;
  kdw: number;
  footprintCoords: number[][][];
  projectCoordinates: {
    lat: number;
    lon: number;
  };
}
interface MapFootprintSelectorProps {
  onComplete: (result: MapFootprintResult) => void;
}
interface SPASite {
  sitecode: string;
  sitename: string;
  geometry: GeoJSON.Geometry;
}
interface KDWData {
  [sitecode: string]: {
    kdw: number;
    name: string;
  };
}
function MapController({
  center
}: {
  center: [number, number] | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
}
export function MapFootprintSelector({
  onComplete
}: MapFootprintSelectorProps) {
  const [address, setAddress] = useState('');
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [natura2000Data, setNatura2000Data] = useState<GeoJSON.FeatureCollection | null>(null);
  const [kdwData, setKdwData] = useState<KDWData | null>(null);
  const [nearestSPA, setNearestSPA] = useState<{
    distance: number;
    sitename: string;
    sitecode: string;
    kdw: number;
  } | null>(null);
  const [footprintCoords, setFootprintCoords] = useState<number[][][] | null>(null);
  const [isFootprintLocked, setIsFootprintLocked] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  // Load GeoJSON data
  useEffect(() => {
    Promise.all([fetch('/data/belgium-natura2000.geojson').then(res => res.json()), fetch('/data/kdw.json').then(res => res.json())]).then(([natura2000, kdw]) => {
      setNatura2000Data(natura2000);
      setKdwData(kdw);
    }).catch(err => {
      console.error('Failed to load map data:', err);
      setError('Failed to load map data');
    });
  }, []);

  // Calculate nearest SPA when marker position changes
  useEffect(() => {
    if (!markerPosition || !natura2000Data || !kdwData) return;
    const markerPoint = turf.point([markerPosition[1], markerPosition[0]]);
    let minDistance = Infinity;
    let nearest: SPASite | null = null;
    natura2000Data.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        // Cast to any to avoid complex type issues with turf
        const centroid = turf.centroid(feature as any);
        const distance = turf.distance(markerPoint, centroid, {
          units: 'meters'
        });
        if (distance < minDistance) {
          minDistance = distance;
          nearest = {
            sitecode: feature.properties?.SITECODE || '',
            sitename: feature.properties?.SITENAME || '',
            geometry: feature.geometry
          };
        }
      }
    });
    if (nearest) {
      const kdwValue = kdwData[(nearest as SPASite).sitecode]?.kdw || 0;
      setNearestSPA({
        distance: Math.round(minDistance * 10) / 10,
        sitename: (nearest as SPASite).sitename,
        sitecode: (nearest as SPASite).sitecode,
        kdw: kdwValue
      });
    }
  }, [markerPosition, natura2000Data, kdwData]);
  const handleLocate = async () => {
    if (!address.trim()) return;
    setIsLocating(true);
    setError(null);
    try {
      const query = encodeURIComponent(`${address}, Belgium`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const {
          lat,
          lon
        } = data[0];
        setMarkerPosition([parseFloat(lat), parseFloat(lon)]);
      } else {
        setError('Address not found. Please try a different address.');
      }
    } catch (err) {
      setError('Failed to locate address. Please try again.');
    } finally {
      setIsLocating(false);
    }
  };
  const handleDrawCreated = useCallback((e: any) => {
    const layer = e.layer;
    if (layer instanceof L.Polygon) {
      const geoJSON = layer.toGeoJSON();
      // Cast coordinates to number[][][] to handle Position type
      const coords = geoJSON.geometry.coordinates as number[][][];
      setFootprintCoords(coords);
    }
  }, []);
  const handleDrawDeleted = useCallback(() => {
    setFootprintCoords(null);
    setIsFootprintLocked(false);
  }, []);
  const handleLockFootprint = () => {
    if (!footprintCoords || !nearestSPA || !markerPosition) return;
    setIsFootprintLocked(true);
    onComplete({
      distance: nearestSPA.distance,
      sitename: nearestSPA.sitename,
      sitecode: nearestSPA.sitecode,
      kdw: nearestSPA.kdw,
      footprintCoords,
      projectCoordinates: {
        lat: markerPosition[0],
        lon: markerPosition[1]
      }
    });
  };
  const geoJsonStyle = {
    fillColor: '#22c55e',
    fillOpacity: 0.2,
    color: '#16a34a',
    weight: 2
  };
  return <div className="space-y-4">

      {/* Address Search */}
      <div className="flex gap-2 my-px">
        <Input placeholder="Enter Belgian address..." value={address} onChange={e => setAddress(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLocate()} disabled={isFootprintLocked} />
        <Button type="button" onClick={handleLocate} disabled={isLocating || isFootprintLocked || !address.trim()} className="shrink-0">
          {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
              <Circle className="h-4 w-4 mr-1" />
              Locate
            </>}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Map Container - Belgian Cadastral Map */}
      <div className="h-[400px] rounded-lg overflow-hidden border border-border">
        <MapContainer center={[50.85, 4.35]} zoom={8} className="h-full w-full my-0">
          {/* Belgian Cadastral WMS Layer */}
          <TileLayer 
            attribution='&copy; <a href="https://eservices.minfin.fgov.be/ecad-web/">SPF Finances - Cadastre</a>' 
            url="https://ccff02.minfin.fgov.be/geoservices/arcgis/rest/services/WMS/Cadastral_Viewer/MapServer/tile/{z}/{y}/{x}"
          />
          {/* Overlay with parcel boundaries */}
          <TileLayer 
            url="https://ccff02.minfin.fgov.be/geoservices/arcgis/rest/services/WMS/Cadastral_Parcels/MapServer/tile/{z}/{y}/{x}"
            opacity={0.7}
          />
          
          <MapController center={markerPosition} />
          
          {natura2000Data && <GeoJSON data={natura2000Data} style={geoJsonStyle} />}
          
          {markerPosition && <Marker position={markerPosition} />}
          
          {!isFootprintLocked && <FeatureGroup ref={featureGroupRef}>
              <EditControl position="topright" onCreated={handleDrawCreated} onDeleted={handleDrawDeleted} draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: {
              allowIntersection: false,
              shapeOptions: {
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.3
              }
            }
          }} />
            </FeatureGroup>}
        </MapContainer>
      </div>

      {/* SPA Info Panel */}
      {nearestSPA && <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <h4 className="text-sm font-medium">Nearest SPA (Special Protection Area)</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Site Name:</span>
              <p className="font-medium">{nearestSPA.sitename}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Site Code:</span>
              <p className="font-medium">{nearestSPA.sitecode}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Distance:</span>
              <p className="font-medium">{nearestSPA.distance.toLocaleString()} m</p>
            </div>
            <div>
              <span className="text-muted-foreground">Lowest KDW:</span>
              <p className="font-medium">{nearestSPA.kdw} kg N/ha/yr</p>
            </div>
          </div>
        </div>}

      {/* Lock Button */}
      {footprintCoords && !isFootprintLocked && <Button type="button" onClick={handleLockFootprint} className="w-full" disabled={!nearestSPA || !markerPosition}>
          <Lock className="h-4 w-4 mr-2" />
          Lock Footprint & Confirm Location
        </Button>}

      {/* Confirmation Message */}
      {isFootprintLocked && <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 p-3 rounded-lg">
          <Check className="h-4 w-4" />
          <span>Footprint selected </span>
        </div>}
    </div>;
}