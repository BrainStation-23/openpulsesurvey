import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Share, Copy, Check, Loader } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
interface SharePresentationModalProps {
  campaignId: string;
  instanceId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function SharePresentationModal({
  campaignId,
  instanceId,
  open,
  onOpenChange
}: SharePresentationModalProps) {
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showExpiryDate, setShowExpiryDate] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (open) {
      fetchExistingShareLink();
    }
  }, [open]);
  const fetchExistingShareLink = async () => {
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from('shared_presentations').select('access_token').eq('campaign_id', campaignId).eq('instance_id', instanceId).eq('is_active', true).maybeSingle();
      if (error) throw error;
      if (data) {
        const shareableUrl = `${window.location.origin}/presentation/${data.access_token}`;
        setShareLink(shareableUrl);
      }
    } catch (error) {
      console.error("Error fetching share link:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const generateShareLink = async () => {
    setIsLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const accessToken = crypto.randomUUID();
      const {
        data,
        error
      } = await supabase.from('shared_presentations').insert({
        campaign_id: campaignId,
        instance_id: instanceId || null,
        access_token: accessToken,
        expires_at: showExpiryDate ? expiryDate?.toISOString() : null,
        is_active: true,
        created_by: user.id
      }).select().single();
      if (error) throw error;
      const shareableUrl = `${window.location.origin}/presentation/${accessToken}`;
      setShareLink(shareableUrl);
      toast({
        title: "Share link created",
        description: "Copy and share this link to grant access to the presentation."
      });
    } catch (error) {
      console.error("Error generating share link:", error);
      toast({
        title: "Error",
        description: "Could not create share link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard."
    });
    setTimeout(() => setCopied(false), 2000);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Presentation</DialogTitle>
          <DialogDescription>
            Create a shareable link that allows others to view this presentation without logging in.
          </DialogDescription>
        </DialogHeader>
        
        {!shareLink ? <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Switch id="expiry-date" checked={showExpiryDate} onCheckedChange={setShowExpiryDate} />
              <Label htmlFor="expiry-date">Set expiry date</Label>
            </div>
            
            {showExpiryDate && <div className="grid gap-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="expiry" variant="outline" className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus disabled={date => date < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>}
          </div> : <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="share-link">Share Link</Label>
              <div className="flex items-center space-x-2">
                <Input id="share-link" value={shareLink} readOnly className="flex-1" />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {showExpiryDate && expiryDate && <p className="text-sm text-muted-foreground">
                  This link will expire on {format(expiryDate, "PPP")}
                </p>}
            </div>
          </div>}
        
        <DialogFooter>
          {!shareLink ? <Button onClick={generateShareLink} disabled={isLoading || showExpiryDate && !expiryDate}>
              {isLoading ? <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </> : "Generate Link"}
            </Button> : <Button onClick={() => setIsOpen(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}