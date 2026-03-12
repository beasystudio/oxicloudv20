/**
 * Employee Roles Table Component
 * Manage employee roles with daily rates per company
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getAllEmployeeRoles, createEmployeeRole, updateEmployeeRole, deleteEmployeeRole } from "@/lib/mockProjectSettingsDB";
import { EmployeeRole } from "@/types/projectSettings";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/i18n/LanguageContext";

// Mock companies for demo
const MOCK_COMPANIES = [
  { id: 'gdesign', name: 'GDesign Architecten' },
  { id: 'artebeau', name: 'Artebeau BV' },
  { id: 'oxicloud', name: 'OxiCloud' }
];

export function EmployeeRolesTable() {
  const { logApiCall } = useMockAuth();
  const { t } = useLanguage();
  const [roles, setRoles] = useState<EmployeeRole[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<EmployeeRole | null>(null);
  const [formData, setFormData] = useState({
    companyId: '',
    companyName: '',
    roleName: '',
    dailyRate: 0,
    effectiveFrom: new Date()
  });
  const [deleteConfirm, setDeleteConfirm] = useState<EmployeeRole | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    setRoles(getAllEmployeeRoles());
  };

  const handleAdd = () => {
    setEditingRole(null);
    setFormData({
      companyId: '',
      companyName: '',
      roleName: '',
      dailyRate: 0,
      effectiveFrom: new Date()
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (role: EmployeeRole) => {
    setEditingRole(role);
    setFormData({
      companyId: role.companyId,
      companyName: role.companyName,
      roleName: role.roleName,
      dailyRate: role.dailyRate,
      effectiveFrom: new Date(role.effectiveFrom)
    });
    setIsDialogOpen(true);
  };

  const handleCompanyChange = (companyId: string) => {
    const company = MOCK_COMPANIES.find(c => c.id === companyId);
    setFormData({ 
      ...formData, 
      companyId, 
      companyName: company?.name || '' 
    });
  };

  const handleSave = () => {
    if (!formData.companyId || !formData.roleName.trim() || formData.dailyRate <= 0) {
      toast.error(t('employeeRoles.fillRequired'));
      return;
    }

    const roleData = {
      companyId: formData.companyId,
      companyName: formData.companyName,
      roleName: formData.roleName,
      dailyRate: formData.dailyRate,
      effectiveFrom: formData.effectiveFrom
    };

    if (editingRole) {
      updateEmployeeRole(editingRole.id, roleData);
      toast.success(t('employeeRoles.updated'));
      logApiCall('PUT', '/api/mock/employee-roles/' + editingRole.id, roleData);
    } else {
      createEmployeeRole(roleData);
      toast.success(t('employeeRoles.created'));
      logApiCall('POST', '/api/mock/employee-roles', roleData);
    }

    loadRoles();
    setIsDialogOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteEmployeeRole(deleteConfirm.id);
      toast.success(t('employeeRoles.deleted'));
      logApiCall('DELETE', '/api/mock/employee-roles/' + deleteConfirm.id, { status: 'deleted' });
      loadRoles();
      setDeleteConfirm(null);
    }
  };

  // Group roles by company
  const groupedRoles = roles.reduce((acc, role) => {
    if (!acc[role.companyName]) acc[role.companyName] = [];
    acc[role.companyName].push(role);
    return acc;
  }, {} as Record<string, EmployeeRole[]>);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>{t('employeeRoles.title')}</CardTitle>
              <CardDescription>
                {t('employeeRoles.description')}
              </CardDescription>
            </div>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('employeeRoles.addRole')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employeeRoles.company')}</TableHead>
                <TableHead>{t('employeeRoles.roleName')}</TableHead>
                <TableHead className="text-right">{t('employeeRoles.dailyRate')}</TableHead>
                <TableHead>{t('employeeRoles.effectiveFrom')}</TableHead>
                <TableHead className="w-24">{t('employeeRoles.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedRoles).map(([companyName, companyRoles]) => (
                companyRoles.map((role, index) => (
                  <TableRow key={role.id} className="cursor-pointer" onDoubleClick={() => handleEdit(role)}>
                    <TableCell className={index > 0 ? 'text-muted-foreground' : 'font-medium'}>
                      {index === 0 ? companyName : ''}
                    </TableCell>
                    <TableCell>{role.roleName}</TableCell>
                    <TableCell className="text-right font-mono">
                      €{role.dailyRate.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(role.effectiveFrom), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(role)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t('employeeRoles.noRoles')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? t('employeeRoles.editRole') : t('employeeRoles.addRoleTitle')}</DialogTitle>
            <DialogDescription>
              {t('employeeRoles.dialogDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('employeeRoles.company')} *</Label>
              <Select value={formData.companyId} onValueChange={handleCompanyChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('employeeRoles.selectCompany')} />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_COMPANIES.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('employeeRoles.roleName')} *</Label>
              <Input
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                placeholder={t('employeeRoles.roleNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('employeeRoles.dailyRate')} *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.dailyRate}
                onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                placeholder="650.00"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('employeeRoles.effectiveFrom')}</Label>
              <Input
                type="date"
                value={format(formData.effectiveFrom, 'yyyy-MM-dd')}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: new Date(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('employeeRoles.cancel')}</Button>
            <Button onClick={handleSave}>{t('employeeRoles.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('employeeRoles.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('employeeRoles.deleteConfirm').replace('{role}', deleteConfirm?.roleName || '').replace('{company}', deleteConfirm?.companyName || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t('employeeRoles.cancel')}</Button>
            <Button variant="destructive" onClick={confirmDelete}>{t('employeeRoles.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
