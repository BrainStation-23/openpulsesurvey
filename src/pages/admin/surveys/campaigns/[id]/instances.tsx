
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useInstanceManagement } from "./hooks/useInstanceManagement";
import { InstanceTable } from "./components/InstanceTable";

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
    calculateCompletionRate,
    createInstance,
    deleteInstance,
    hasActiveInstance, // New function
  } = useInstanceManagement(campaignId);

  if (!campaignId) {
    navigate('/admin/surveys/campaigns');
    return null;
  }

  const handleSave = async (data: any) => {
    try {
      await updateInstance(data);
      
      // Manually recalculate completion rate after status change
      if (data.status === 'completed') {
        await calculateCompletionRate(data.id);
      }
      
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
    </div>
  );
}
