import { TopNavigation } from '@/components/TopNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';
const AuthoritySpatialAnalysis = () => {
  return <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto px-6 py-8">
        

        {/* Placeholder content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  
                </div>
                <CardTitle className="text-base">Interactive Map</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View projects on an interactive map with Natura 2000 overlays.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  
                </div>
                <CardTitle className="text-base">Layer Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Toggle cadastral, environmental, and project layers.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  
                </div>
                <CardTitle className="text-base">Buffer Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Distance calculations and impact zone visualization.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  
                </div>
                <CardTitle className="text-base">Coordinate Lookup</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Search by address, coordinates, or parcel reference.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Map placeholder */}
        <Card className="mt-6">
          <CardContent className="p-0">
            <div className="h-[400px] bg-muted/50 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <Map className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground italic">Map visualization to be implemented...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default AuthoritySpatialAnalysis;