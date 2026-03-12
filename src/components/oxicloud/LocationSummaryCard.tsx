import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Lock, Eye, Square } from 'lucide-react';
import { CadastralMapResult } from './CadastralMapSelector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MapContainer, TileLayer, Polygon, Marker, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationSummaryCardProps {
  mapData: CadastralMapResult;
  onEdit?: () => void;
}

export const LocationSummaryCard: React.FC<LocationSummaryCardProps> = ({
  mapData,
  onEdit
}) => {
  const [showFullMap, setShowFullMap] = useState(false);

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            Site Location
          </CardTitle>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Locked
          </Badge>
        </div>
        <CardDescription className="line-clamp-1">
          {mapData.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Natura 2000 Info */}
        {mapData.nearestSPA && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-muted-foreground">Nearest Natura 2000</p>
                <p className="font-medium text-sm">{mapData.nearestSPA.name}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {mapData.nearestSPA.code}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="text-xl font-bold text-primary">
                  {mapData.nearestSPA.distance.toLocaleString()}
                  <span className="text-xs font-normal ml-1">m</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">KDW</p>
                <p className="text-xl font-bold">
                  {mapData.nearestSPA.kdw}
                  <span className="text-xs font-normal ml-1">mol/ha/yr</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mini Map Preview */}
        <Dialog open={showFullMap} onOpenChange={setShowFullMap}>
          <DialogTrigger asChild>
            <div 
              className="relative h-32 rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors group"
            >
              {/* Static preview */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Square className="h-3 w-3 text-amber-500" />
                      <span>1 plot</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3 text-blue-500" />
                      <span>{mapData.buildingFootprints.length} building(s)</span>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">
                    Click to view full map
                  </p>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Site Location Map</DialogTitle>
            </DialogHeader>
            <div className="flex-1 h-full min-h-[500px]">
              <MapContainer
                center={mapData.coordinates}
                zoom={17}
                style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                
                {/* Marker */}
                <Marker position={mapData.coordinates} />
                
                {/* Plot boundary */}
                {mapData.plotCoordinates.length > 0 && (
                  <Polygon
                    positions={mapData.plotCoordinates}
                    pathOptions={{
                      color: '#f59e0b',
                      weight: 3,
                      fillColor: '#f59e0b',
                      fillOpacity: 0.15,
                      dashArray: '5, 5'
                    }}
                  />
                )}
                
                {/* Building footprints */}
                {mapData.buildingFootprints.map((coords, index) => (
                  <Polygon
                    key={index}
                    positions={coords}
                    pathOptions={{
                      color: '#3b82f6',
                      weight: 3,
                      fillColor: '#3b82f6',
                      fillOpacity: 0.3
                    }}
                  />
                ))}
              </MapContainer>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit button */}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onEdit}
          >
            <Eye className="h-4 w-4 mr-2" />
            Edit Location
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationSummaryCard;
