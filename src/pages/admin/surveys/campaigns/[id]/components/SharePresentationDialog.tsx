
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Copy, ExternalLink, Share2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SharePresentationDialogProps {
  campaignId: string;
  instanceId?: string;
}

export function SharePresentationDialog({
  campaignId,
  instanceId,
}: SharePresentationDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Get base URL for sharing
  const baseUrl = window.location.origin;
  const shareUrl = accessToken 
    ? `${baseUrl}/presentations/${accessToken}` 
    : null;

  const handleCreateShareLink = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("shared_presentations")
        .insert({
          campaign_id: campaignId,
          instance_id: instanceId || null,
          title: title || null,
          description: description || null,
          expires_at: hasExpiry && expiryDate ? expiryDate.toISOString() : null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select("access_token")
        .single();

      if (error) throw error;
      
      setAccessToken(data.access_token);
      toast({
        title: "Success",
        description: "Shareable presentation link created",
      });
    } catch (error) {
      console.error("Error creating share link:", error);
      toast({
        title: "Error",
        description: "Failed to create shareable link",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyLinkToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Presentation link copied to clipboard",
      });
    }
  };

  const openPresentation = () => {
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setExpiryDate(undefined);
    setHasExpiry(false);
    setAccessToken(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Presentation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Presentation</DialogTitle>
          <DialogDescription>
            Create a public link to share this presentation without requiring login.
          </DialogDescription>
        </DialogHeader>

        {!accessToken ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My presentation"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notes about this shared presentation"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="expiry"
                checked={hasExpiry}
                onCheckedChange={setHasExpiry}
              />
              <Label htmlFor="expiry">Set expiration date</Label>
            </div>
            {hasExpiry && (
              <div className="grid gap-2">
                <Label>Expiration Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Shareable Link</Label>
              <div className="flex items-center">
                <Input
                  value={shareUrl || ""}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyLinkToClipboard}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This link allows anyone to view the presentation without logging in.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {!accessToken ? (
            <Button onClick={handleCreateShareLink} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Share Link"}
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetForm}>
                Create Another
              </Button>
              <Button onClick={openPresentation}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Presentation
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
