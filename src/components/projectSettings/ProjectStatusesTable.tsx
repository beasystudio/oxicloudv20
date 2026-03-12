/**
 * Project Statuses Table Component
 * Manage project statuses with color picker and toggles
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getAllProjectStatuses, createProjectStatus, updateProjectStatus, deleteProjectStatus } from "@/lib/mockProjectSettingsDB";
import { ProjectStatus } from "@/types/projectSettings";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function ProjectStatusesTable() {
  const { logApiCall } = useMockAuth();
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<ProjectStatus | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#22c55e',
    employeeCost: true,
    overhead: true,
    profit: true,
    management: true,
    companyOverhead: true,
    visible: true,
    workHours: true
  });
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectStatus | null>(null);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = () => {
    setStatuses(getAllProjectStatuses());
  };

  const handleAdd = () => {
    setEditingStatus(null);
    setFormData({
      name: '',
      color: '#22c55e',
      employeeCost: true,
      overhead: true,
      profit: true,
      management: true,
      companyOverhead: true,
      visible: true,
      workHours: true
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (status: ProjectStatus) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      color: status.color,
      employeeCost: status.employeeCost,
      overhead: status.overhead,
      profit: status.profit,
      management: status.management,
      companyOverhead: status.companyOverhead,
      visible: status.visible,
      workHours: status.workHours
    });
    setIsDialogOpen(true);
  };

  const handleToggle = (status: ProjectStatus, field: keyof ProjectStatus, value: boolean) => {
    updateProjectStatus(status.id, { [field]: value });
    loadStatuses();
    logApiCall('PATCH', '/api/mock/project-statuses/' + status.id, { [field]: value });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a status name");
      return;
    }

    if (editingStatus) {
      updateProjectStatus(editingStatus.id, formData);
      toast.success("Project status updated (mock)");
      logApiCall('PUT', '/api/mock/project-statuses/' + editingStatus.id, formData);
    } else {
      createProjectStatus(formData);
      toast.success("Project status created (mock)");
      logApiCall('POST', '/api/mock/project-statuses', formData);
    }

    loadStatuses();
    setIsDialogOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteProjectStatus(deleteConfirm.id);
      toast.success("Project status deleted (mock)");
      logApiCall('DELETE', '/api/mock/project-statuses/' + deleteConfirm.id, { status: 'deleted' });
      loadStatuses();
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Project Statuses</CardTitle>
              <CardDescription>
                Define project statuses and their calculation overrides
              </CardDescription>
            </div>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Status
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Emp Cost</TableHead>
                  <TableHead className="text-center">Overhead</TableHead>
                  <TableHead className="text-center">Profit</TableHead>
                  <TableHead className="text-center">Mgmt</TableHead>
                  <TableHead className="text-center">Co. OH</TableHead>
                  <TableHead className="text-center">Visible</TableHead>
                  <TableHead className="text-center">Hours</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.map(status => (
                  <TableRow key={status.id}>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-full border" 
                        style={{ backgroundColor: status.color }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{status.name}</TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={status.employeeCost} 
                        onCheckedChange={(v) => handleToggle(status, 'employeeCost', v)} 
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={status.overhead} 
                        onCheckedChange={(v) => handleToggle(status, 'overhead', v)} 
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={status.profit} 
                        onCheckedChange={(v) => handleToggle(status, 'profit', v)} 
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={status.management} 
                        onCheckedChange={(v) => handleToggle(status, 'management', v)} 
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={status.companyOverhead} 
                        onCheckedChange={(v) => handleToggle(status, 'companyOverhead', v)} 
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={status.visible} 
                        onCheckedChange={(v) => handleToggle(status, 'visible', v)} 
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={status.workHours} 
                        onCheckedChange={(v) => handleToggle(status, 'workHours', v)} 
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(status)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(status)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {statuses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No project statuses. Click "Seed Demo Data" to add defaults.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStatus ? 'Edit' : 'Add'} Project Status</DialogTitle>
            <DialogDescription>
              Configure the status and its calculation overrides
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 p-1"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Status Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Open"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Override Settings</Label>
              {[
                { key: 'employeeCost', label: 'Employee Cost' },
                { key: 'overhead', label: 'Overhead' },
                { key: 'profit', label: 'Profit' },
                { key: 'management', label: 'Management' },
                { key: 'companyOverhead', label: 'Company Overhead' },
                { key: 'visible', label: 'Visible' },
                { key: 'workHours', label: 'Work Hours' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={(formData as any)[key]}
                    onCheckedChange={(v) => setFormData({ ...formData, [key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
