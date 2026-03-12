import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Loader2, Save, Percent } from 'lucide-react';

export function CommissionSettings() {
  const { toast } = useToast();
  const [commissionPercentage, setCommissionPercentage] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('setting_key', 'commission_percentage')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      const settingValue = data?.setting_value as { value?: number } | null;
      if (settingValue?.value !== undefined) {
        setCommissionPercentage(settingValue.value);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (commissionPercentage < 0 || commissionPercentage > 100) {
      toast({
        title: "Invalid Value",
        description: "Commission percentage must be between 0 and 100",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const user = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          setting_key: 'commission_percentage',
          setting_value: { value: commissionPercentage },
          updated_by: user.data.user?.id
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: `Commission percentage updated to ${commissionPercentage}%`
      });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Commission Settings
        </CardTitle>
        <CardDescription>
          Configure the commission percentage for client companies.
          This percentage is paid to the company after they submit their invoice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="commissionPercentage">Commission Percentage</Label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Input
                id="commissionPercentage"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={commissionPercentage}
                onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                className="pr-10"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
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
          <p className="text-sm text-muted-foreground">
            Currently, {commissionPercentage}% of each payment will be paid as commission to the client company.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">Example Calculation</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Quote Amount:</span>
              <span className="ml-2 font-mono">€2,500.00</span>
            </div>
            <div>
              <span className="text-muted-foreground">Commission ({commissionPercentage}%):</span>
              <span className="ml-2 font-mono text-primary">
                €{(2500 * commissionPercentage / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
