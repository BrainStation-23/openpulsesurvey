
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useInstanceManagement } from "./hooks/useInstanceManagement";
import { InstanceTable } from "./components/InstanceTable";
import { InstanceEditDialog } from "./components/InstanceEditDialog";

export default function CampaignInstancesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);
  const campaignId = id as string;

  const {
    instances,
    campaign,
    isLoading,
    updateInstance,
    refreshInstances,
    calculateCompletionRate,
  } = useInstanceManagement(campaignId);

  if (!campaignId) {
    navigate('/admin/surveys/campaigns');
    return null;
  }

  const handleEdit = (instance: any) => {
    setSelectedInstance(instance);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      await updateInstance(data);
      
      // Manually recalculate completion rate after status change
      if (data.status === 'completed') {
        await calculateCompletionRate(data.id);
      }
      
      setIsEditDialogOpen(false);
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
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      <InstanceEditDialog
        instance={selectedInstance}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
        isRecurring={campaign?.is_recurring}
      />
    </div>
  );
}
