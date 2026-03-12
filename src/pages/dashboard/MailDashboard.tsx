import { TopNavigation } from "@/components/TopNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Inbox, FileText, Euro, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { useState, useMemo } from "react";
interface CommissionNotification {
  id: string;
  projectId: string;
  projectName: string;
  quoteNumber: string;
  quoteAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  endClientName: string;
  paidAt: string;
  status: 'pending_invoice' | 'invoice_received' | 'paid';
  companyId: string;
}

// Demo commission notifications matching demo projects
const allCommissionNotifications: CommissionNotification[] = [
// GDesign projects
{
  id: "1",
  projectId: "proj-gdesign-001",
  projectName: "Pauwels Herent",
  quoteNumber: "NOX-2025-001",
  quoteAmount: 1850.00,
  commissionPercentage: 15,
  commissionAmount: 277.50,
  endClientName: "Artebeau BV",
  paidAt: "2025-01-15",
  status: 'pending_invoice',
  companyId: 'gdesign'
}, {
  id: "2",
  projectId: "proj-gdesign-002",
  projectName: "Office Tower Brussels",
  quoteNumber: "NOX-2025-002",
  quoteAmount: 4500.00,
  commissionPercentage: 15,
  commissionAmount: 675.00,
  endClientName: "Immobel SA",
  paidAt: "2025-01-10",
  status: 'invoice_received',
  companyId: 'gdesign'
}, {
  id: "3",
  projectId: "proj-gdesign-003",
  projectName: "Renovatie Villa Mechelen",
  quoteNumber: "NOX-2024-089",
  quoteAmount: 2240.92,
  commissionPercentage: 15,
  commissionAmount: 336.14,
  endClientName: "Familie Van den Berghe",
  paidAt: "2024-12-20",
  status: 'paid',
  companyId: 'gdesign'
},
// 4TAKT project
{
  id: "4",
  projectId: "proj-4takt-001",
  projectName: "School Campus Gent",
  quoteNumber: "NOX-2024-015",
  quoteAmount: 3200.00,
  commissionPercentage: 15,
  commissionAmount: 480.00,
  endClientName: "Stad Gent",
  paidAt: "2024-11-05",
  status: 'paid',
  companyId: '4takt'
}];
const MailDashboard = () => {
  const {
    currentUser,
    getSelectedCompany,
    selectedCompanyId
  } = useMockAuth();
  const selectedCompany = getSelectedCompany();
  const [activeTab, setActiveTab] = useState("inbox");

  // Filter notifications by selected company
  const commissionNotifications = useMemo(() => {
    if (!selectedCompanyId) return [];
    return allCommissionNotifications.filter(n => n.companyId === selectedCompanyId);
  }, [selectedCompanyId]);
  const getStatusBadge = (status: CommissionNotification['status']) => {
    switch (status) {
      case 'pending_invoice':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30"><Clock className="h-3 w-3 mr-1" /> Awaiting Invoice</Badge>;
      case 'invoice_received':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30"><FileText className="h-3 w-3 mr-1" /> Invoice Received</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Paid</Badge>;
    }
  };
  const pendingCount = commissionNotifications.filter(n => n.status === 'pending_invoice').length;
  const totalPending = commissionNotifications.filter(n => n.status === 'pending_invoice').reduce((sum, n) => sum + n.commissionAmount, 0);
  return <div className="min-h-screen bg-background">
      <TopNavigation />
      
      
    </div>;
};
export default MailDashboard;