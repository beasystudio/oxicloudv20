import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
interface ValidationStepCardProps {
  stepNumber: number;
  title: string;
  status: 'passed' | 'failed' | 'warning';
  description: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  legalReference: string;
}
export function ValidationStepCard({
  stepNumber,
  title,
  status,
  description,
  details,
  legalReference
}: ValidationStepCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'passed':
        return;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
  };
  const getStatusBadge = () => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">✔ Verified</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">✗ Issue Found</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">⚠ Review Needed</Badge>;
    }
  };
  return <Card className="border">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Step Number Circle */}
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg shrink-0", status === 'passed' ? "bg-green-100 text-green-700" : status === 'failed' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
            {stepNumber}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <h3 className="font-semibold text-lg">{title}</h3>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary cursor-pointer">
                <span>📘 {legalReference}</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>

            <p className="text-muted-foreground">{description}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 p-4 rounded-lg bg-white">
              {details.map((detail, index) => <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{detail.label}</span>
                  <span className="text-sm font-medium">{detail.value}</span>
                </div>)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}