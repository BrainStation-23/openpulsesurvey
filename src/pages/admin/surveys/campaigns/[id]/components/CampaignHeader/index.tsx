
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HeaderActions } from "./HeaderActions";
import { CampaignStatus } from "./CampaignStatus";
import { CampaignDates } from "./CampaignDates";

interface CampaignHeaderProps {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    starts_at: string;
    ends_at: string;
  } | undefined;
  isLoading: boolean;
  selectedInstanceId?: string;
}

export function CampaignHeader({ campaign, isLoading, selectedInstanceId }: CampaignHeaderProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedStatus, setEditedStatus] = useState("");

  useEffect(() => {
    if (campaign) {
      setEditedName(campaign.name);
      setEditedDescription(campaign.description || "");
      setEditedStatus(campaign.status);
    }
  }, [campaign]);

  const canEditStatus = campaign?.status !== 'completed' && campaign?.status !== 'archived';

  const handleSave = async () => {
    if (!campaign) return;

    try {
      const { error } = await supabase
        .from("survey_campaigns")
        .update({
          name: editedName,
          description: editedDescription,
          status: editedStatus,
        })
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: "Campaign updated",
        description: "Your changes have been saved successfully.",
      });
      
      setIsEditing(false);
      navigate(`/admin/surveys/campaigns/${id}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update campaign. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    if (campaign) {
      setEditedName(campaign.name);
      setEditedDescription(campaign.description || "");
      setEditedStatus(campaign.status);
    }
    setIsEditing(false);
  };

  const handlePresent = () => {
    if (!selectedInstanceId) {
      toast({
        variant: "destructive",
        title: "No instance selected",
        description: "Please select an instance before starting the presentation.",
      });
      return;
    }
    navigate(`/admin/surveys/campaigns/${id}/present?instance=${selectedInstanceId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold"
                placeholder="Campaign name"
              />
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="min-h-[100px]"
                placeholder="Campaign description"
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-muted-foreground">{campaign.description}</p>
              )}
            </>
          )}
        </div>
        <HeaderActions
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancel}
          onSave={handleSave}
          onPresent={handlePresent}
          isDisabled={campaign.status === 'completed' || campaign.status === 'archived'}
        />
      </div>

      <div className="flex items-center gap-4">
        <CampaignStatus
          status={campaign.status}
          isEditing={isEditing}
          canEditStatus={canEditStatus}
          editedStatus={editedStatus}
          onStatusChange={setEditedStatus}
        />
        <CampaignDates
          createdAt={campaign.created_at}
          startsAt={campaign.starts_at}
          endsAt={campaign.ends_at}
        />
      </div>
    </div>
  );
}
