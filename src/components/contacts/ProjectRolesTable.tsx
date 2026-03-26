/**
 * Project Roles Table Component
 * Manage default project roles for contact assignment
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getAllProjectRoles, addProjectRole, updateProjectRole, deleteProjectRole } from "@/lib/mockContactDB";
import { ProjectRole } from "@/types/contact";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { Plus } from "lucide-react";
export function ProjectRolesTable() {
  const {
    logApiCall
  } = useMockAuth();
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ProjectRole | null>(null);
  const [roleName, setRoleName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectRole | null>(null);
  useEffect(() => {
    loadRoles();
  }, []);
  const loadRoles = () => {
    setRoles(getAllProjectRoles());
  };
  const handleAdd = () => {
    setEditingRole(null);
    setRoleName("");
    setIsDialogOpen(true);
  };
  const handleEdit = (role: ProjectRole) => {
    setEditingRole(role);
    setRoleName(role.name);
    setIsDialogOpen(true);
  };
  const handleSave = () => {
    if (!roleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }
    if (editingRole) {
      updateProjectRole(editingRole.id, roleName);
      toast.success("Project role updated");
      logApiCall('PUT', '/api/mock/project-roles/' + editingRole.id, {
        name: roleName
      });
    } else {
      addProjectRole(roleName);
      toast.success("Project role added");
      logApiCall('POST', '/api/mock/project-roles', {
        name: roleName
      });
    }
    loadRoles();
    setIsDialogOpen(false);
  };
  const handleDelete = (role: ProjectRole) => {
    setDeleteConfirm(role);
  };
  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteProjectRole(deleteConfirm.id);
      toast.success("Project role deleted");
      logApiCall('DELETE', '/api/mock/project-roles/' + deleteConfirm.id, {
        status: 'deleted'
      });
      loadRoles();
      setDeleteConfirm(null);
    }
  };
  return <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 text-xs">Role Name</TableHead>
                <TableHead className="h-9 text-xs">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map(role => <TableRow 
                  key={role.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-foreground/20 hover:scale-[1.02] hover:z-10"
                  onDoubleClick={() => handleEdit(role)}
                  title="Double-click to edit"
                >
                  <TableCell className="py-2.5 text-sm font-medium">{role.name}</TableCell>
                  <TableCell className="py-2.5">
                    <Badge variant={role.isDefault ? 'secondary' : 'outline'} className="text-xs">
                      {role.isDefault ? 'Default' : 'Custom'}
                    </Badge>
                  </TableCell>
                </TableRow>)}
              {roles.length === 0 && <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6 text-sm">
                    No project roles defined
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">Double-click a row to edit</p>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit' : 'Add'} Project Role</DialogTitle>
            <DialogDescription>
              {editingRole ? 'Update the role name' : 'Add a new project role'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="e.g., Technical Lead" />
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
            <DialogTitle>Delete Project Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
}