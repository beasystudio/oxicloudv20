import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OxiCloudProject } from '@/types/oxicloud';
import { OxiCloudStatusBadge } from './OxiCloudStatusBadge';
import { format } from 'date-fns';
import { Download, FileText, Receipt } from 'lucide-react';

interface InvoicePaymentViewProps {
  projects: OxiCloudProject[];
}

export function InvoicePaymentView({ projects }: InvoicePaymentViewProps) {
  const paidProjects = projects.filter(p => p.paymentData);
  const pendingProjects = projects.filter(p => p.status === 'awaiting_payment' && p.priceData);

  const totalPaid = paidProjects.reduce((sum, p) => sum + (p.priceData?.totalPrice || 0), 0);
  const totalPending = pendingProjects.reduce((sum, p) => sum + (p.priceData?.totalPrice || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{totalPaid.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{paidProjects.length} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              €{totalPending.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{pendingProjects.length} awaiting</p>
          </CardContent>
        </Card>
      </div>

      {/* Paid Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Paid Invoices
          </CardTitle>
          <CardDescription>Download invoices for completed payments</CardDescription>
        </CardHeader>
        <CardContent>
          {paidProjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No paid invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {paidProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{project.paymentData?.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.name} • {format(new Date(project.paymentData!.paymentDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      €{project.priceData?.totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </span>
                    <OxiCloudStatusBadge status="paid" />
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Payments */}
      {pendingProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Receipt className="h-5 w-5" />
              Awaiting Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Valid until: {format(new Date(project.priceData!.validUntil), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      €{project.priceData?.totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                    </span>
                    <OxiCloudStatusBadge status="awaiting_payment" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
