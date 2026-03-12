import { TopNavigation } from '@/components/TopNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
const AuthorityRegulatoryHub = () => {
  return <div className="min-h-screen bg-background">
      <TopNavigation />
      
      <div className="container mx-auto px-6 py-8">
        

        {/* Placeholder content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                
                <CardTitle className="text-base">Stikstofdecreet</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Current version: v1.2. Nitrogen legislation framework and thresholds.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                
                <CardTitle className="text-base">Guidelines</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Assessment guidelines and best practices for NOx evaluations.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                
                <CardTitle className="text-base">Reference Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                KDW tables, emission factors, and official datasets.
              </p>
            </CardContent>
          </Card>
        </div>

        
      </div>
    </div>;
};
export default AuthorityRegulatoryHub;