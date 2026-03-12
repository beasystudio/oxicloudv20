import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface YearConfig {
  year: number;
  overheadEnabled: boolean;
  overheadAmount: number;
  overheadDate: Date | null;
  marginPerUserEnabled: boolean;
  marginPerUserPercent: number;
  fixedMarginEnabled: boolean;
  fixedMarginAmount: number;
}

export const InternalCostSettings = () => {
  const { toast } = useToast();
  const { logApiCall } = useMockAuth();
  const [configs, setConfigs] = useState<YearConfig[]>([]);
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const saved = localStorage.getItem('internalCostSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setConfigs(parsed.map((c: any) => ({
        ...c,
        overheadDate: c.overheadDate ? new Date(c.overheadDate) : null
      })));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('internalCostSettings', JSON.stringify(configs));
    logApiCall('POST', '/api/mock/internal-costs/save', { configs });
    toast({
      title: "Internal cost settings saved (mock)",
      description: "Your cost configurations have been updated"
    });
  };

  const handleAddYear = () => {
    if (configs.find(c => c.year === newYear)) {
      toast({
        title: "Year already exists",
        variant: "destructive"
      });
      return;
    }

    const newConfig: YearConfig = {
      year: newYear,
      overheadEnabled: false,
      overheadAmount: 0,
      overheadDate: null,
      marginPerUserEnabled: false,
      marginPerUserPercent: 0,
      fixedMarginEnabled: false,
      fixedMarginAmount: 0
    };

    setConfigs(prev => [...prev, newConfig].sort((a, b) => b.year - a.year));
    setNewYear(newYear + 1);
  };

  const handleRemoveYear = (year: number) => {
    setConfigs(prev => prev.filter(c => c.year !== year));
  };

  const updateConfig = (year: number, updates: Partial<YearConfig>) => {
    setConfigs(prev => prev.map(c => c.year === year ? { ...c, ...updates } : c));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Internal Cost Settings</CardTitle>
          <CardDescription>
            Configure overhead, margins, and cost parameters per year (mock only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Year */}
          <div className="flex items-end gap-2 p-4 bg-muted rounded-lg">
            <div className="flex-1 space-y-2">
              <Label htmlFor="newYear">Add Year Configuration</Label>
              <Input
                id="newYear"
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(parseInt(e.target.value))}
                placeholder="2025"
              />
            </div>
            <Button onClick={handleAddYear}>
              <Plus className="h-4 w-4 mr-2" />
              Add Year
            </Button>
          </div>

          {/* Year Configurations */}
          {configs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No year configurations yet. Add one to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <Card key={config.year}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Year {config.year}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveYear(config.year)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Overhead */}
                    <div className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Overhead (EUR)</Label>
                          <p className="text-sm text-muted-foreground">Apply overhead cost to projects</p>
                        </div>
                        <Switch
                          checked={config.overheadEnabled}
                          onCheckedChange={(checked) => updateConfig(config.year, { overheadEnabled: checked })}
                        />
                      </div>
                      {config.overheadEnabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                              type="number"
                              value={config.overheadAmount}
                              onChange={(e) => updateConfig(config.year, { overheadAmount: parseFloat(e.target.value) })}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Effective Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !config.overheadDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {config.overheadDate ? format(config.overheadDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={config.overheadDate || undefined}
                                  onSelect={(date) => updateConfig(config.year, { overheadDate: date || null })}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Margin per User */}
                    <div className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Margin per User (%)</Label>
                          <p className="text-sm text-muted-foreground">Percentage increase on personnel cost</p>
                        </div>
                        <Switch
                          checked={config.marginPerUserEnabled}
                          onCheckedChange={(checked) => updateConfig(config.year, { marginPerUserEnabled: checked })}
                        />
                      </div>
                      {config.marginPerUserEnabled && (
                        <div className="space-y-2">
                          <Label>Percentage</Label>
                          <Input
                            type="number"
                            value={config.marginPerUserPercent}
                            onChange={(e) => updateConfig(config.year, { marginPerUserPercent: parseFloat(e.target.value) })}
                            placeholder="0"
                            step="0.1"
                          />
                        </div>
                      )}
                    </div>

                    {/* Fixed Margin */}
                    <div className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Fixed Margin (EUR)</Label>
                          <p className="text-sm text-muted-foreground">Flat amount per project</p>
                        </div>
                        <Switch
                          checked={config.fixedMarginEnabled}
                          onCheckedChange={(checked) => updateConfig(config.year, { fixedMarginEnabled: checked })}
                        />
                      </div>
                      {config.fixedMarginEnabled && (
                        <div className="space-y-2">
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            value={config.fixedMarginAmount}
                            onChange={(e) => updateConfig(config.year, { fixedMarginAmount: parseFloat(e.target.value) })}
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} size="lg">
              Save Cost Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
