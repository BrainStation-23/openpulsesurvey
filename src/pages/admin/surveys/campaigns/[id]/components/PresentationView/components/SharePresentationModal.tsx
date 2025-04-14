
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader, Share, Copy, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SharePresentationModalProps {
  campaignId: string;
  instanceId?: string;
}

export function SharePresentationModal({ campaignId, instanceId }: SharePresentationModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showExpiryDate, setShowExpiryDate] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateShareLink = async () => {
    setIsLoading(true);

    try {
      // Generate a random access token
      const accessToken = crypto.randomUUID();
      
      // Create the share link record in the database
      const { data, error } = await supabase
        .from('shared_presentations')
        .insert({
          campaign_id: campaignId,
          instance_id: instanceId || null,
          access_token: accessToken,
          expires_at: showExpiryDate ? expiryDate?.toISOString() : null,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      // Create the shareable URL
      const shareableUrl = `${window.location.origin}/presentation/${accessToken}`;
      setShareLink(shareableUrl);
      
      toast({
        title: "Share link created",
        description: "Copy and share this link to grant access to the presentation.",
      });
    } catch (error) {
      console.error("Error generating share link:", error);
      toast({
        title: "Error",
        description: "Could not create share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied!",
      description: "Link copied to clipboard."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Presentation</DialogTitle>
          <DialogDescription>
            Create a shareable link that allows others to view this presentation without logging in.
          </DialogDescription>
        </DialogHeader>
        
        {!shareLink ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="expiry-date"
                checked={showExpiryDate}
                onCheckedChange={setShowExpiryDate}
              />
              <Label htmlFor="expiry-date">Set expiry date</Label>
            </div>
            
            {showExpiryDate && (
              <div className="grid gap-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="expiry"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "Select date"}
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
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="share-link">Share Link</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="share-link"
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {showExpiryDate && expiryDate && (
                <p className="text-sm text-muted-foreground">
                  This link will expire on {format(expiryDate, "PPP")}
                </p>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter>
          {!shareLink ? (
            <Button onClick={generateShareLink} disabled={isLoading || (showExpiryDate && !expiryDate)}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Link"
              )}
            </Button>
          ) : (
            <Button onClick={() => setIsOpen(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
