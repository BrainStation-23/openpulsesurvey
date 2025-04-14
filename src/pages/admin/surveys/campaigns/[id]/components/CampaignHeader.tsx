
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, Edit2, Play, X, Clock } from "lucide-react";
import { format, isValid } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { SharePresentationDialog } from "./SharePresentationDialog";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CampaignHeaderProps {
  campaign: any;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy HH:mm') : 'Invalid date';
  };

  if (isLoading) {
    return (
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </div>
      </Card>
    );
  }

  if (!campaign) return null;

  return (
    <Card className="mb-6">
      <div className="p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:space-y-0">
          {/* Campaign Title and Description */}
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-xl font-bold"
                  placeholder="Campaign name"
                />
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="min-h-[80px]"
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

          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            {isEditing && canEditStatus ? (
              <Select
                value={editedStatus}
                onValueChange={setEditedStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                {campaign.status}
              </Badge>
            )}
          </div>
        </div>

        <Separator className="my-4" />
        
        {/* Bottom section with dates and actions */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Created: {formatDate(campaign.created_at)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>Period: {formatDate(campaign.starts_at)} - {formatDate(campaign.ends_at)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handlePresent}
                  variant="default"
                  size="sm"
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Present
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  disabled={campaign.status === 'completed' || campaign.status === 'archived'}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <SharePresentationDialog 
                  campaignId={campaign.id}
                  instanceId={selectedInstanceId}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
