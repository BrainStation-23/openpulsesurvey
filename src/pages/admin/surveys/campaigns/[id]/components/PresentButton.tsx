
import { Button } from "@/components/ui/button";
import { Play, Download, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ExportButton } from "./PresentationView/components/ExportButton";
import { SharePresentationModal } from "./PresentationView/components/SharePresentationModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PresentButtonProps {
  campaignId: string;
  instanceId?: string;
  disabled?: boolean;
}

export function PresentButton({ campaignId, instanceId, disabled }: PresentButtonProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const handleShareClick = () => {
    setDropdownOpen(false); // Close the dropdown
    setShowShareModal(true); // Open the share modal
  };

  const handlePresentClick = async () => {
    if (!instanceId) {
      toast({
        variant: "destructive",
        title: "No instance selected",
        description: "Please select an instance before starting the presentation.",
      });
      return;
    }

    setIsGeneratingLink(true);
    setDropdownOpen(false); // Close the dropdown

    try {
      // Check if there's an existing share link for this campaign/instance
      const { data: existingLink, error: fetchError } = await supabase
        .from('shared_presentations')
        .select('access_token')
        .eq('campaign_id', campaignId)
        .eq('instance_id', instanceId)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If exists, use it; otherwise generate a new one
      let token;
      if (existingLink?.access_token) {
        token = existingLink.access_token;
      } else {
        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        
        // Generate a new token
        const accessToken = crypto.randomUUID();
        const { error: insertError } = await supabase
          .from('shared_presentations')
          .insert({
            campaign_id: campaignId,
            instance_id: instanceId,
            access_token: accessToken,
            is_active: true,
            created_by: user.id
          });

        if (insertError) throw insertError;
        token = accessToken;
      }

      // Navigate to the public presentation route with the token
      navigate(`/presentation/${token}`);
    } catch (error) {
      console.error("Error generating presentation link:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start the presentation. Please try again.",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            disabled={disabled || isGeneratingLink}
          >
            <Play className="h-4 w-4" />
            {isGeneratingLink ? "Loading..." : "Present"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handlePresentClick} disabled={isGeneratingLink}>
            <Play className="h-4 w-4 mr-2" />
            Start Presentation
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <ExportButton 
              campaignId={campaignId} 
              instanceId={instanceId}
              variant="dropdown"
            />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareClick}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Presentation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SharePresentationModal
        campaignId={campaignId}
        instanceId={instanceId}
        open={showShareModal}
        onOpenChange={setShowShareModal}
      />
    </>
  );
}
