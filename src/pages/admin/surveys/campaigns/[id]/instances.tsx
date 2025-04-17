
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
    filters,
    sort,
    pagination,
    updateFilters,
    updateSort,
    updatePagination,
    updateInstance,
    refreshInstances,
    calculateCompletionRate,
    createInstance,
    deleteInstance,
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
      // Get next period number
      const nextPeriod = instances.length > 0 
        ? Math.max(...instances.map(i => i.period_number)) + 1 
        : 1;
      
      // Set default dates - start date tomorrow, end date a week later
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(0, 0, 0, 0); // Fixed syntax error: removed extra comma
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      
      await createInstance({
        campaign_id: campaignId,
        period_number: nextPeriod,
        starts_at: startDate.toISOString(),
        ends_at: endDate.toISOString(),
        status: 'upcoming',
      });
      
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

  const handleFilterChange = (newFilters: any) => {
    updateFilters(newFilters);
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
        <p className="text-sm text-yellow-600 mt-2">
          Note: Manual changes may override automated scheduling. Use with caution.
        </p>
      </div>

      <InstanceTable 
        instances={instances} 
        totalCount={totalCount}
        pagination={pagination}
        sort={sort}
        filters={filters}
        isLoading={isLoading}
        onSave={handleSave}
        onDelete={handleDelete}
        onAdd={handleAddInstance}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        campaign={campaign}
      />
    </div>
  );
}
