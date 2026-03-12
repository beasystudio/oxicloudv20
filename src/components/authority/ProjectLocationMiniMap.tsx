import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface ProjectLocationMiniMapProps {
  address: string;
  className?: string;
}

const ProjectLocationMiniMap = ({ address, className }: ProjectLocationMiniMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default coordinates (Belgium center)
    let lat = 50.85;
    let lng = 4.35;

    // Simple geocoding based on address keywords
    if (address.includes('Heverlee')) {
      lat = 50.8637;
      lng = 4.6846;
    } else if (address.includes('Antwerpen')) {
      lat = 51.2194;
      lng = 4.4025;
    } else if (address.includes('Gent')) {
      lat = 51.0543;
      lng = 3.7174;
    } else if (address.includes('Brugge')) {
      lat = 51.2093;
      lng = 3.2247;
    }

    // Initialize the map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    }).setView([lat, lng], 15);

    mapRef.current = map;

    // Add CARTO basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add Belgian Cadastral WMS layer
    L.tileLayer.wms('https://ccff02.minfin.fgov.be/cadgis/gprc/cadmap', {
      layers: 'CADMAP_F',
      format: 'image/png',
      transparent: true,
      opacity: 0.6,
    }).addTo(map);

    // Add custom marker
    const markerIcon = L.divIcon({
      html: `<div style="
        background: #ef4444;
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    L.marker([lat, lng], { icon: markerIcon }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [address]);

  return (
    <div 
      ref={mapContainerRef} 
      className={className}
      style={{ minHeight: '180px' }}
    />
  );
};

export default ProjectLocationMiniMap;
