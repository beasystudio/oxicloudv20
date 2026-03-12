/**
 * Project Schedules Table Component
 * Manage reusable phase schedules (Provisieschema)
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getAllProjectSchedules, getAllProjectPhases, createProjectSchedule, updateProjectSchedule, deleteProjectSchedule } from "@/lib/mockProjectSettingsDB";
import { ProjectSchedule, ProjectPhase, SchedulePhase, PHASE_TYPES } from "@/types/projectSettings";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";

export function ProjectSchedulesTable() {
  const { logApiCall } = useMockAuth();
  const [schedules, setSchedules] = useState<ProjectSchedule[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ProjectSchedule | null>(null);
  const [scheduleName, setScheduleName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectSchedule | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSchedules(getAllProjectSchedules());
    setPhases(getAllProjectPhases());
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    setScheduleName('');
    setIsDialogOpen(true);
  };

  const handleEdit = (schedule: ProjectSchedule) => {
    setEditingSchedule(schedule);
    setScheduleName(schedule.name);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!scheduleName.trim()) {
      toast.error("Please enter a schedule name");
      return;
    }

    if (editingSchedule) {
      updateProjectSchedule(editingSchedule.id, { name: scheduleName });
      toast.success("Schedule updated (mock)");
      logApiCall('PUT', '/api/mock/project-schedules/' + editingSchedule.id, { name: scheduleName });
    } else {
      // Create schedule with all available phases
      const schedulePhases: SchedulePhase[] = phases.map((p, index) => ({
        id: crypto.randomUUID(),
        phaseId: p.id,
        admin: p.admin,
        invoice: p.invoice,
        type: p.type,
        value: p.value,
        inServiceFee: p.inServiceFee,
        startDate: null,
        endDate: null,
        order: index + 1
      }));

      createProjectSchedule({ name: scheduleName, phases: schedulePhases });
      toast.success("Schedule created (mock)");
      logApiCall('POST', '/api/mock/project-schedules', { name: scheduleName, phases: schedulePhases.length });
    }

    loadData();
    setIsDialogOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteProjectSchedule(deleteConfirm.id);
      toast.success("Schedule deleted (mock)");
      logApiCall('DELETE', '/api/mock/project-schedules/' + deleteConfirm.id, { status: 'deleted' });
      loadData();
      setDeleteConfirm(null);
    }
  };

  const getPhaseById = (id: string): ProjectPhase | undefined => {
    return phases.find(p => p.id === id);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Project Schedules (Provisieschema)</CardTitle>
              <CardDescription>
                Create reusable phase sequences for projects
              </CardDescription>
            </div>
            <Button onClick={handleAdd} size="sm" disabled={phases.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {phases.length === 0 && (
            <div className="text-center text-muted-foreground py-8 border rounded-lg">
              Please create project phases first before creating schedules.
            </div>
          )}

          {schedules.map(schedule => (
            <Collapsible
              key={schedule.id}
              open={expandedSchedule === schedule.id}
              onOpenChange={(open) => setExpandedSchedule(open ? schedule.id : null)}
            >
              <div className="border rounded-lg">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      {expandedSchedule === schedule.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">{schedule.name}</span>
                      <Badge variant="secondary">{schedule.phases.length} phases</Badge>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(schedule)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Color</TableHead>
                          <TableHead>Phase</TableHead>
                          <TableHead className="text-center">Admin</TableHead>
                          <TableHead className="text-center">Invoice</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead className="text-center">In Service</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedule.phases.sort((a, b) => a.order - b.order).map(sp => {
                          const phase = getPhaseById(sp.phaseId);
                          if (!phase) return null;
                          return (
                            <TableRow key={sp.id}>
                              <TableCell>
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: phase.color }}
                                />
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-xs mr-2">{phase.abbreviation}</span>
                                {phase.name}
                              </TableCell>
                              <TableCell className="text-center">
                                {sp.admin ? '✓' : '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {sp.invoice ? '✓' : '-'}
                              </TableCell>
                              <TableCell>
                                {PHASE_TYPES.find(t => t.value === sp.type)?.label}
                              </TableCell>
                              <TableCell className="text-right">
                                {sp.type === 'percentage' ? `${sp.value}%` : 
                                 sp.type === 'fixed' ? `€${sp.value}` : '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {sp.inServiceFee ? '✓' : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}

          {schedules.length === 0 && phases.length > 0 && (
            <div className="text-center text-muted-foreground py-8 border rounded-lg">
              No schedules created yet. Click "Add Schedule" or "Seed Demo Data".
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchedule ? 'Edit' : 'Create'} Schedule</DialogTitle>
            <DialogDescription>
              {editingSchedule 
                ? 'Update the schedule name' 
                : 'A new schedule will include all available phases'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Schedule Name</Label>
              <Input
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="e.g., Standard Residential"
              />
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
            <DialogTitle>Delete Schedule</DialogTitle>
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
