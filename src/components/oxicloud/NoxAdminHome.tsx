import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, Database, FileText, Calculator, Clock, CheckCircle2, ArrowRight, Activity, RefreshCw, Upload, Edit, Cog } from 'lucide-react';
import { format } from 'date-fns';
interface ChangeLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  category: 'algorithm' | 'vito' | 'template' | 'form' | 'system';
}
interface NoxAdminHomeProps {
  onNavigate?: (section: string) => void;
}

// Mock data for the admin dashboard
const mockChangeLog: ChangeLogEntry[] = [{
  id: '1',
  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  action: 'VITO Table Updated',
  user: 'Christine',
  details: 'Updated VITO Table 3 with new emission factors for 2024',
  category: 'vito'
}, {
  id: '2',
  timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  action: 'Algorithm Version Published',
  user: 'Paul',
  details: 'Published algorithm v2.4.1 with optimized transport calculations',
  category: 'algorithm'
}, {
  id: '3',
  timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  action: 'Report Template Modified',
  user: 'Christine',
  details: 'Added new summary section to compliance report template',
  category: 'template'
}, {
  id: '4',
  timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  action: 'Form Field Added',
  user: 'Christine',
  details: 'Added "Expected traffic increase" field to detailed calculation form',
  category: 'form'
}, {
  id: '5',
  timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
  action: 'System Maintenance',
  user: 'Paul',
  details: 'Performed database optimization and backup',
  category: 'system'
}];
const getCategoryColor = (category: ChangeLogEntry['category']) => {
  switch (category) {
    case 'algorithm':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'vito':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'template':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'form':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'system':
      return 'bg-muted text-muted-foreground border-muted';
  }
};
const getCategoryIcon = (category: ChangeLogEntry['category']) => {
  switch (category) {
    case 'algorithm':
      return Calculator;
    case 'vito':
      return Database;
    case 'template':
      return FileText;
    case 'form':
      return Edit;
    case 'system':
      return Cog;
  }
};
export function NoxAdminHome({
  onNavigate
}: NoxAdminHomeProps) {
  return <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Algorithm Version */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wide">Algorithm Version</CardDescription>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">v2.4.1</span>
              <span className="text-xs text-muted-foreground">published 24h ago</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optimized transport calculations
            </p>
          </CardContent>
        </Card>

        {/* VITO Tables */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wide">VITO Tables</CardDescription>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Database className="h-3 w-3 mr-1" />
                3 Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Table 1</span>
                <span className="text-muted-foreground">v3.2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Table 3</span>
                <span className="text-muted-foreground">v2.8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Table 4</span>
                <span className="text-muted-foreground">v2.5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Template */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wide">Report Template</CardDescription>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <FileText className="h-3 w-3 mr-1" />
                Published
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">v1.8</span>
              <span className="text-xs text-muted-foreground">Standard</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated 2 days ago
            </p>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs uppercase tracking-wide">System Status</CardDescription>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                <Activity className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">99.9%</span>
              <span className="text-xs text-muted-foreground">uptime</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg. calc time: 1.2s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 items-center justify-center" onClick={() => onNavigate?.('vito-tables')}>
              <Upload className="h-5 w-5 text-blue-500" />
              <span className="text-sm">Update VITO Tables</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 items-center justify-center" onClick={() => onNavigate?.('pdf-template')}>
              <Edit className="h-5 w-5 text-green-500" />
              <span className="text-sm">Edit PDF Template</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 items-center justify-center" onClick={() => onNavigate?.('forms')}>
              <Settings className="h-5 w-5 text-orange-500" />
              <span className="text-sm">Configure Forms</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 items-center justify-center" onClick={() => onNavigate?.('engine')}>
              <Calculator className="h-5 w-5 text-purple-500" />
              <span className="text-sm">Calculation Engine</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Changes Log */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Changes</CardTitle>
              <CardDescription>Latest system updates and modifications</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockChangeLog.map((entry, index) => {
            const Icon = getCategoryIcon(entry.category);
            return <div key={entry.id}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(entry.category)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{entry.action}</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {entry.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.details}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}</span>
                        <span>•</span>
                        <span>by {entry.user}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  {index < mockChangeLog.length - 1 && <Separator className="mt-4" />}
                </div>;
          })}
          </div>
        </CardContent>
      </Card>
    </div>;
}