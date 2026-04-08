import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Demo project coordinates based on Belgian locations
const PROJECT_COORDINATES: Record<string, {
  lat: number;
  lng: number;
}> = {
  'proj-gdesign-001': {
    lat: 50.8614,
    lng: 4.4277
  },
  // Vilvoorde
  'proj-gdesign-002': {
    lat: 50.8559,
    lng: 4.3598
  },
  // Brussels Nord
  'proj-gdesign-003': {
    lat: 51.0259,
    lng: 4.4776
  },
  // Mechelen
  'proj-4takt-001': {
    lat: 51.0543,
    lng: 3.7174
  },
  // Gent
  'proj-empty-001': {
    lat: 50.85,
    lng: 4.35
  } // Default Belgium
};
interface ProjectLocationMapProps {
  projectId: string;
  location?: string;
  className?: string;
}
export const ProjectLocationMap = ({
  projectId,
  location,
  className
}: ProjectLocationMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup previous map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    const coords = PROJECT_COORDINATES[projectId] || {
      lat: 50.85,
      lng: 4.35
    };

    // Initialize the map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false
    }).setView([coords.lat, coords.lng], 15);
    mapRef.current = map;

    // Add CARTO basemap for clean look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Add Belgian Cadastral WMS layer for official parcel boundaries
    L.tileLayer.wms('https://ccff02.minfin.fgov.be/cadgis/gprc/cadmap', {
      layers: 'CADMAP_F',
      format: 'image/png',
      transparent: true,
      opacity: 0.5
    }).addTo(map);

    // Add custom marker with primary color styling
    const markerIcon = L.divIcon({
      html: `<div style="
        background: hsl(var(--primary));
        width: 20px;
        height: 20px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      "></div>`,
      className: 'custom-project-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 20]
    });
    L.marker([coords.lat, coords.lng], {
      icon: markerIcon
    }).addTo(map);
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [projectId]);
  return <div className={`rounded-lg overflow-hidden border border-border/50 ${className}`}>
      
    </div>;
};

// Fallback component when map is not available
export const ProjectLocationPlaceholder = ({
  location,
  className
}: {
  location?: string;
  className?: string;
}) => <div className={`aspect-[16/10] bg-gradient-to-br from-muted to-muted/50 rounded-lg flex flex-col items-center justify-center text-muted-foreground border border-border/50 ${className}`}>
    <MapPin className="h-6 w-6 mb-1.5 opacity-50" />
    <span className="text-[10px] text-center px-2">{location || 'Location'}</span>
  </div>;