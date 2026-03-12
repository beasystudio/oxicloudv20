import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, XCircle, Search, FileSearch } from 'lucide-react';
import { SubmittedProject } from '@/pages/dashboard/AuthorityDashboard';
import { useState } from 'react';
import { cn } from '@/lib/utils';
interface AuthorityProjectListProps {
  projects: SubmittedProject[];
  onSelectProject: (project: SubmittedProject) => void;
}
const getStatusIcon = (status: SubmittedProject['calculationStatus']) => {
  switch (status) {
    case 'valid':
      return;
    case 'needs_clarification':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'exceeds_threshold':
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
};
const getStatusBadge = (status: SubmittedProject['calculationStatus']) => {
  switch (status) {
    case 'valid':
      return null;
    case 'needs_clarification':
      return null;
    case 'exceeds_threshold':
      return null;
    default:
      return null;
  }
};
const getDecisionBadge = (decision: SubmittedProject['legalDecision']) => {
  switch (decision) {
    case 'below_threshold':
      return;
    case 'conditional':
      return <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          Conditional
        </Badge>;
    case 'exceeds_threshold':
      return <Badge variant="outline" className="gap-1 border-red-500/30 text-red-600">
          <XCircle className="h-3 w-3" />
          Exceeds Threshold
        </Badge>;
  }
};
export function AuthorityProjectList({
  projects,
  onSelectProject
}: AuthorityProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || project.applicant.toLowerCase().includes(searchQuery.toLowerCase()) || project.applicantCompany.toLowerCase().includes(searchQuery.toLowerCase()) || project.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.calculationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const stats = {
    total: projects.length,
    valid: projects.filter(p => p.calculationStatus === 'valid').length,
    needsClarification: projects.filter(p => p.calculationStatus === 'needs_clarification').length,
    exceeds: projects.filter(p => p.calculationStatus === 'exceeds_threshold').length
  };
  return <div className="space-y-6">
      {/* Header */}
      

      {/* Stats Cards */}
      

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by project, applicant, or location..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="needs_clarification">Needs Clarification</SelectItem>
                <SelectItem value="exceeds_threshold">Exceeds Threshold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Project List */}
      <div className="space-y-4">
        {filteredProjects.map(project => <Card key={project.id} className={cn("hover:shadow-md transition-all cursor-pointer border-l-4", project.calculationStatus === 'valid' && "border-l-green-500", project.calculationStatus === 'needs_clarification' && "border-l-amber-500", project.calculationStatus === 'exceeds_threshold' && "border-l-red-500")} onClick={() => onSelectProject(project)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-base">{project.projectName}</h3>
                      {getStatusBadge(project.calculationStatus)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 text-xs">
                        
                        {project.applicantCompany}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        
                        {project.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        
                        {new Date(project.submissionDate).toLocaleDateString('nl-BE')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-sm">
                        <span className="text-muted-foreground">Natura2000:</span>{' '}
                        <span className="font-medium">{project.natura2000Site}</span>
                        <span className="text-muted-foreground ml-1">({project.natura2000Code})</span>
                      </span>
                      <span className="text-sm">
                        <span className="text-muted-foreground">Distance:</span>{' '}
                        <span className="font-medium">{project.distanceToSite}m</span>
                      </span>
                      <span className="text-sm">
                        <span className="text-muted-foreground">Impact:</span>{' '}
                        <span className={cn("font-bold", project.overallImpactPercent >= 1 ? "text-red-600" : project.overallImpactPercent >= 0.8 ? "text-amber-600" : "text-green-600")}>
                          {project.overallImpactPercent.toFixed(2)}%
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>)}

        {filteredProjects.length === 0 && <Card>
            <CardContent className="p-12 text-center">
              <FileSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No submissions found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </CardContent>
          </Card>}
      </div>
    </div>;
}