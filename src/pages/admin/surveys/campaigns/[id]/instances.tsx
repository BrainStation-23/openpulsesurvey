
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useInstanceManagement } from "./hooks/useInstanceManagement";
import { InstanceTable } from "./components/InstanceTable";
import { CronJobManager } from "./components/InstanceAutomation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CampaignInstancesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const campaignId = id as string;

  const {
    instances,
    totalCount,
    campaign,
    isLoading,
    sort,
    pagination,
    updateSort,
    updatePagination,
    updateInstance,
    refreshInstances,
    createInstance,
    deleteInstance,
    hasActiveInstance,
  } = useInstanceManagement(campaignId);

  if (!campaignId) {
    navigate('/admin/surveys/campaigns');
    return null;
  }

  const handleSave = async (data: any) => {
    try {
      await updateInstance(data);
      
      toast({
        title: "Instance updated",
        description: "The campaign instance has been updated successfully.",
      });
      refreshInstances();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating instance",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  const handleDelete = async (instanceId: string) => {
    try {
      await deleteInstance(instanceId);
      toast({
        title: "Instance deleted",
        description: "The campaign instance has been deleted successfully.",
      });
      refreshInstances();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting instance",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  const handleAddInstance = async () => {
    try {
      // Using the new database function to create the next instance
      await createInstance();
      
      toast({
        title: "Instance created",
        description: "New campaign instance has been created successfully.",
      });
      refreshInstances();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating instance",
        description: error.message || "An error occurred. Please try again.",
      });
    }
  };

  const handlePageChange = (page: number) => {
    updatePagination({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    updatePagination({ pageSize, page: 1 });
  };

  const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
    updateSort({ 
      sortBy: sortBy as any, 
      sortDirection 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/surveys/campaigns')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {campaign?.name || "Campaign"} - Instance Configuration
        </h1>
      </div>

      <div className="text-muted-foreground mb-4">
        <p>Manage campaign instances - you can adjust the start and end dates, and change the status.</p>
        <p className="mt-1 text-sm">Note: Only one instance can be active at a time.</p>
      </div>
      
      <Tabs defaultValue="instances" className="space-y-6">
        <TabsList>
          <TabsTrigger value="instances">Instances</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="instances">
          <InstanceTable 
            instances={instances} 
            totalCount={totalCount}
            pagination={pagination}
            sort={sort}
            isLoading={isLoading}
            onSave={handleSave}
            onDelete={handleDelete}
            onAdd={handleAddInstance}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSortChange={handleSortChange}
            campaign={campaign}
            hasActiveInstance={hasActiveInstance}
          />
        </TabsContent>
        
        <TabsContent value="automation">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div>
              <CronJobManager 
                campaignId={campaignId} 
                onUpdated={refreshInstances}
              />
            </div>
          </div>
          
          <div className="mt-6 bg-muted/50 border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">About Automation</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Activation:</strong> Automatically changes instance status from 'upcoming' to 'active' when the start date is reached.
                The system will check once daily at your selected time.
              </p>
              <p>
                <strong>Completion:</strong> Automatically changes instance status from 'active' to 'completed' when the end date is reached.
                The system will check once daily at your selected time.
              </p>
              <p>
                <strong>Daily Check Time:</strong> Set the specific time of day when the system should check for instances that need to be activated or completed. This is more efficient than checking at frequent intervals.
              </p>
              <p>
                <strong>Run Now:</strong> Manually trigger a job to immediately update any instances that meet the criteria, regardless of the scheduled time.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
