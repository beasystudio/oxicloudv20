import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, XCircle, AlertTriangle, History, 
  User, Calendar, FileText, Lock, Eye, EyeOff 
} from 'lucide-react';
import { SubmittedProject } from '@/pages/dashboard/AuthorityDashboard';
import { cn } from '@/lib/utils';

interface DecisionAuditTrailProps {
  project: SubmittedProject;
  internalNotes: string;
  onNotesChange: (notes: string) => void;
}

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
  type: 'system' | 'user' | 'decision';
}

export function DecisionAuditTrail({ project, internalNotes, onNotesChange }: DecisionAuditTrailProps) {
  const [decision, setDecision] = useState<string>('');
  
  // Mock audit entries
  const auditEntries: AuditEntry[] = [
    {
      id: '1',
      action: 'Calculation submitted',
      user: project.applicant,
      timestamp: project.calculatedAt,
      details: `Submitted via OxiCloud by ${project.applicantCompany}`,
      type: 'system'
    },
    {
      id: '2',
      action: 'Automatic validation passed',
      user: 'OxiCloud System',
      timestamp: new Date(new Date(project.calculatedAt).getTime() + 60000).toISOString(),
      details: 'All input fields verified, datasets validated',
      type: 'system'
    },
    {
      id: '3',
      action: 'Assigned for review',
      user: 'Queue Manager',
      timestamp: project.submissionDate,
      details: 'Routed to permit officer queue',
      type: 'system'
    },
    {
      id: '4',
      action: 'Review started',
      user: 'Jan De Clerck',
      timestamp: new Date().toISOString(),
      details: 'Permit officer opened validation view',
      type: 'user'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Decision Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Authority Decision
          </CardTitle>
          <CardDescription>
            Record your official decision for this permit application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decision Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Decision</label>
            <Select value={decision} onValueChange={setDecision}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your decision..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Approved - Permit can be granted
                  </div>
                </SelectItem>
                <SelectItem value="conditional">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Conditional - Requires modifications
                  </div>
                </SelectItem>
                <SelectItem value="rejected">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Rejected - Does not meet requirements
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Internal Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-muted-foreground" />
                Internal Notes
              </label>
              <Badge variant="outline" className="text-xs">
                Not visible to applicants
              </Badge>
            </div>
            <Textarea
              placeholder="Add internal notes about this decision (e.g., reasoning, concerns, follow-up items)..."
              value={internalNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
            />
          </div>

          {/* Decision Info Box */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Decision will be recorded permanently</p>
                <p className="text-muted-foreground mt-1">
                  Once submitted, this decision becomes part of the immutable audit trail. 
                  Your user ID, timestamp, and the data versions used will be logged automatically.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          <CardDescription>
            Complete history of all actions on this submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditEntries.map((entry, index) => (
              <div key={entry.id} className="relative">
                {/* Timeline connector */}
                {index < auditEntries.length - 1 && (
                  <div className="absolute left-5 top-10 w-0.5 h-full bg-border" />
                )}
                
                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10",
                    entry.type === 'system' ? "bg-muted" :
                    entry.type === 'decision' ? "bg-primary" :
                    "bg-blue-100"
                  )}>
                    {entry.type === 'system' && <FileText className="h-4 w-4 text-muted-foreground" />}
                    {entry.type === 'user' && <User className="h-4 w-4 text-blue-600" />}
                    {entry.type === 'decision' && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{entry.action}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString('nl-BE', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      By: {entry.user}
                    </p>
                    {entry.details && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {entry.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legal Defensibility Note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Court-Proof Documentation</h3>
              <p className="text-muted-foreground mt-2">
                Every decision made through OxiCloud is fully documented with:
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Who reviewed and decided (authenticated user ID)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  When the decision was made (cryptographic timestamp)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Which data versions were used (immutable snapshot)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Complete calculation trail (verifiable by both parties)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
