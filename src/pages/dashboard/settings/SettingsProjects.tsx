/**
 * Projects Settings Module
 * Manages project types, statuses, phases, schedules, and employee roles
 * Only accessible by Client Admin (owner, admin, client_owner)
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProjectTypesTable } from "@/components/projectSettings/ProjectTypesTable";
import { ProjectStatusesTable } from "@/components/projectSettings/ProjectStatusesTable";
import { ProjectPhasesTable } from "@/components/projectSettings/ProjectPhasesTable";
import { ProjectSchedulesTable } from "@/components/projectSettings/ProjectSchedulesTable";
import { EmployeeRolesTable } from "@/components/projectSettings/EmployeeRolesTable";
import { seedDemoProjectSettings, clearAllProjectSettings } from "@/lib/mockProjectSettingsDB";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
export function SettingsProjects() {
  const {
    logApiCall
  } = useMockAuth();
  const [activeSubTab, setActiveSubTab] = useState("types");
  const [refreshKey, setRefreshKey] = useState(0);
  const handleSeedDemo = () => {
    seedDemoProjectSettings();
    setRefreshKey(prev => prev + 1);
    toast.success("Demo project settings created (mock)");
    logApiCall('POST', '/api/mock/seed-demo-project-settings', {
      status: 'success'
    });
  };
  const handleClearAll = () => {
    clearAllProjectSettings();
    setRefreshKey(prev => prev + 1);
    toast.success("All project settings cleared (mock)");
    logApiCall('DELETE', '/api/mock/clear-project-settings', {
      status: 'success'
    });
  };
  return <div className="space-y-6">
      

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="flex gap-6">
        <TabsList className="flex flex-col h-fit w-48 shrink-0 bg-muted/50 p-2">
          <TabsTrigger value="types" className="w-full justify-start px-3">
            Types
          </TabsTrigger>
          <TabsTrigger value="statuses" className="w-full justify-start px-3">
            Statuses
          </TabsTrigger>
          <TabsTrigger value="phases" className="w-full justify-start px-3">
            Phases
          </TabsTrigger>
          <TabsTrigger value="schedules" className="w-full justify-start px-3">
            Schedules
          </TabsTrigger>
          <TabsTrigger value="roles" className="w-full justify-start px-3">
            Roles
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0">
          <TabsContent value="types" className="mt-0 space-y-4">
            <ProjectTypesTable key={`types-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="statuses" className="mt-0 space-y-4">
            <ProjectStatusesTable key={`statuses-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="phases" className="mt-0 space-y-4">
            <ProjectPhasesTable key={`phases-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="schedules" className="mt-0 space-y-4">
            <ProjectSchedulesTable key={`schedules-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="roles" className="mt-0 space-y-4">
            <EmployeeRolesTable key={`roles-${refreshKey}`} />
          </TabsContent>
        </div>
      </Tabs>
    </div>;
}