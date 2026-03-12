import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Plus, Loader2, Save, Search } from 'lucide-react';
import type { CompanyBillingInfo } from '@/types/payment';

export function CompanyBillingManager() {
  const { toast } = useToast();
  const [billingInfos, setBillingInfos] = useState<CompanyBillingInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentBilling, setCurrentBilling] = useState<Partial<CompanyBillingInfo>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBillingInfos();
  }, []);

  const fetchBillingInfos = async () => {
    try {
      const { data, error } = await supabase
        .from('company_billing_info')
        .select('*')
        .order('company_name');

      if (error) throw error;
      setBillingInfos((data || []) as CompanyBillingInfo[]);
    } catch (error) {
      console.error('Failed to fetch billing info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentBilling.company_id || !currentBilling.company_name || !currentBilling.email) {
      toast({
        title: "Missing Information",
        description: "Company ID, name, and email are required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      if (currentBilling.id) {
        // Update existing
        const { error } = await supabase
          .from('company_billing_info')
          .update({
            company_name: currentBilling.company_name,
            email: currentBilling.email,
            vat_number: currentBilling.vat_number,
            peppol_id: currentBilling.peppol_id,
            address: currentBilling.address
          })
          .eq('id', currentBilling.id);

        if (error) throw error;
        toast({ title: "Updated", description: "Billing info updated successfully" });
      } else {
        // Create new
        const { error } = await supabase
          .from('company_billing_info')
          .insert({
            company_id: currentBilling.company_id,
            company_name: currentBilling.company_name,
            email: currentBilling.email,
            vat_number: currentBilling.vat_number,
            peppol_id: currentBilling.peppol_id,
            address: currentBilling.address
          });

        if (error) throw error;
        toast({ title: "Created", description: "Billing info created successfully" });
      }

      setEditDialogOpen(false);
      setCurrentBilling({});
      fetchBillingInfos();
    } catch (error: any) {
      console.error('Failed to save billing info:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save billing info",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (billing?: CompanyBillingInfo) => {
    setCurrentBilling(billing || {});
    setEditDialogOpen(true);
  };

  const filteredBillingInfos = billingInfos.filter(billing => {
    const query = searchQuery.toLowerCase();
    return (
      billing.company_name.toLowerCase().includes(query) ||
      billing.company_id.toLowerCase().includes(query) ||
      billing.email.toLowerCase().includes(query) ||
      (billing.vat_number || '').toLowerCase().includes(query)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Billing Info
            </CardTitle>
            <CardDescription>
              Fixed billing details for each client company (used for quotes and invoices)
            </CardDescription>
          </div>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openEditDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentBilling.id ? 'Edit' : 'Add'} Company Billing Info
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyId">Company ID</Label>
                  <Input
                    id="companyId"
                    placeholder="gdesign"
                    value={currentBilling.company_id || ''}
                    onChange={(e) => setCurrentBilling(prev => ({ ...prev, company_id: e.target.value }))}
                    disabled={!!currentBilling.id}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="GDesign Architecten"
                    value={currentBilling.company_name || ''}
                    onChange={(e) => setCurrentBilling(prev => ({ ...prev, company_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Billing Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="billing@company.be"
                    value={currentBilling.email || ''}
                    onChange={(e) => setCurrentBilling(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    placeholder="BE0123456789"
                    value={currentBilling.vat_number || ''}
                    onChange={(e) => setCurrentBilling(prev => ({ ...prev, vat_number: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peppolId">Peppol ID</Label>
                  <Input
                    id="peppolId"
                    placeholder="12345-ABCDE"
                    value={currentBilling.peppol_id || ''}
                    onChange={(e) => setCurrentBilling(prev => ({ ...prev, peppol_id: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Street 123, 1000 Brussels"
                    value={currentBilling.address || ''}
                    onChange={(e) => setCurrentBilling(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : billingInfos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No company billing info configured yet
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, email, or VAT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-10">Company</TableHead>
                    <TableHead className="h-10">Email</TableHead>
                    <TableHead className="h-10">VAT Number</TableHead>
                    <TableHead className="h-10">Peppol ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TooltipProvider>
                    {filteredBillingInfos.map((billing) => (
                      <Tooltip key={billing.id}>
                        <TooltipTrigger asChild>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onDoubleClick={() => openEditDialog(billing)}
                          >
                            <TableCell className="py-3">
                              <div>
                                <div className="font-medium">{billing.company_name}</div>
                                <div className="text-xs text-muted-foreground">{billing.company_id}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3">{billing.email}</TableCell>
                            <TableCell className="py-3 font-mono text-sm">{billing.vat_number || '-'}</TableCell>
                            <TableCell className="py-3 font-mono text-sm">{billing.peppol_id || '-'}</TableCell>
                          </TableRow>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Double-click to edit</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {filteredBillingInfos.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No companies match your search
                        </TableCell>
                      </TableRow>
                    )}
                  </TooltipProvider>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
