import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Unit {
  id: string;
  name: string;
  internalCost: number;
  externalCost: number;
}

interface PerformanceType {
  id: string;
  name: string;
  active: boolean;
  unitId: string;
  overheadEnabled: boolean;
  marginEnabled: boolean;
  costOverride: boolean;
  overrideCost: number;
}

export const UnitsAndPerformance = () => {
  const { toast } = useToast();
  const { logApiCall } = useMockAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [performanceTypes, setPerformanceTypes] = useState<PerformanceType[]>([]);
  
  const [newUnit, setNewUnit] = useState({ name: "", internalCost: 0, externalCost: 0 });
  const [newPerformance, setNewPerformance] = useState({
    name: "",
    active: true,
    unitId: "",
    overheadEnabled: false,
    marginEnabled: false,
    costOverride: false,
    overrideCost: 0
  });

  useEffect(() => {
    const savedUnits = localStorage.getItem('units');
    const savedPerformance = localStorage.getItem('performanceTypes');
    if (savedUnits) setUnits(JSON.parse(savedUnits));
    if (savedPerformance) setPerformanceTypes(JSON.parse(savedPerformance));
  }, []);

  const saveData = () => {
    localStorage.setItem('units', JSON.stringify(units));
    localStorage.setItem('performanceTypes', JSON.stringify(performanceTypes));
    logApiCall('POST', '/api/mock/units-performance/save', { units, performanceTypes });
    toast({
      title: "Settings saved (mock)",
      description: "Units and performance types have been updated"
    });
  };

  const handleAddUnit = () => {
    if (!newUnit.name.trim()) {
      toast({ title: "Unit name required", variant: "destructive" });
      return;
    }

    const unit: Unit = {
      id: Date.now().toString(),
      ...newUnit
    };

    setUnits(prev => [...prev, unit]);
    setNewUnit({ name: "", internalCost: 0, externalCost: 0 });
    toast({ title: "Unit added" });
  };

  const handleRemoveUnit = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
    toast({ title: "Unit removed" });
  };

  const handleAddPerformance = () => {
    if (!newPerformance.name.trim() || !newPerformance.unitId) {
      toast({ title: "Name and unit required", variant: "destructive" });
      return;
    }

    const performance: PerformanceType = {
      id: Date.now().toString(),
      ...newPerformance
    };

    setPerformanceTypes(prev => [...prev, performance]);
    setNewPerformance({
      name: "",
      active: true,
      unitId: "",
      overheadEnabled: false,
      marginEnabled: false,
      costOverride: false,
      overrideCost: 0
    });
    toast({ title: "Performance type added" });
  };

  const handleRemovePerformance = (id: string) => {
    setPerformanceTypes(prev => prev.filter(p => p.id !== id));
    toast({ title: "Performance type removed" });
  };

  const getUnitName = (unitId: string) => {
    return units.find(u => u.id === unitId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Units Section */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>Units</CardTitle>
            <CardDescription>
              Define measurement units (hour, m², etc.) with costs
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Unit Form */}
          <div className="p-4 bg-muted rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unit Name</Label>
                <Input
                  value={newUnit.name}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., hour, m²"
                />
              </div>
              <div className="space-y-2">
                <Label>Internal Cost (EUR)</Label>
                <Input
                  type="number"
                  value={newUnit.internalCost}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, internalCost: parseFloat(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>External Cost (EUR)</Label>
                <Input
                  type="number"
                  value={newUnit.externalCost}
                  onChange={(e) => setNewUnit(prev => ({ ...prev, externalCost: parseFloat(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <Button onClick={handleAddUnit} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </div>

          {/* Units List */}
          <div className="space-y-2">
            {units.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No units defined yet</p>
            ) : (
              <div className="space-y-2">
                {units.map(unit => (
                  <div key={unit.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{unit.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Internal: €{unit.internalCost.toFixed(2)} | External: €{unit.externalCost.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveUnit(unit.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Types Section */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>Performance Types</CardTitle>
            <CardDescription>
              Define performance templates for project costing and timesheets
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Performance Type Form */}
          <div className="p-4 bg-muted rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Performance Type Name</Label>
                <Input
                  value={newPerformance.name}
                  onChange={(e) => setNewPerformance(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Design Concept, Site Visit"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={newPerformance.unitId}
                  onValueChange={(value) => setNewPerformance(prev => ({ ...prev, unitId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newPerformance.active}
                  onCheckedChange={(checked) => setNewPerformance(prev => ({ ...prev, active: checked }))}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newPerformance.overheadEnabled}
                  onCheckedChange={(checked) => setNewPerformance(prev => ({ ...prev, overheadEnabled: checked }))}
                />
                <Label>Overhead</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newPerformance.marginEnabled}
                  onCheckedChange={(checked) => setNewPerformance(prev => ({ ...prev, marginEnabled: checked }))}
                />
                <Label>Margin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newPerformance.costOverride}
                  onCheckedChange={(checked) => setNewPerformance(prev => ({ ...prev, costOverride: checked }))}
                />
                <Label>Override Cost</Label>
              </div>
            </div>

            {newPerformance.costOverride && (
              <div className="space-y-2">
                <Label>Override Cost (EUR)</Label>
                <Input
                  type="number"
                  value={newPerformance.overrideCost}
                  onChange={(e) => setNewPerformance(prev => ({ ...prev, overrideCost: parseFloat(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
            )}

            <Button onClick={handleAddPerformance} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Performance Type
            </Button>
          </div>

          {/* Performance Types List */}
          <div className="space-y-2">
            {performanceTypes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No performance types defined yet</p>
            ) : (
              <div className="space-y-2">
                {performanceTypes.map(perf => (
                  <div key={perf.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{perf.name}</p>
                        {perf.active ? (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>Unit: {getUnitName(perf.unitId)}</span>
                        {perf.overheadEnabled && <Badge variant="outline">Overhead</Badge>}
                        {perf.marginEnabled && <Badge variant="outline">Margin</Badge>}
                        {perf.costOverride && <Badge variant="outline">Override: €{perf.overrideCost}</Badge>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePerformance(perf.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveData} size="lg">
          Save All Settings
        </Button>
      </div>
    </div>
  );
};
