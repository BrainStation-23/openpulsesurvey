
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  ExternalLink, 
  Loader2, 
  ToggleLeft, 
  ToggleRight, 
  Trash
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface SharedPresentation {
  id: string;
  title: string | null;
  description: string | null;
  access_token: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  campaign_name: string;
  instance_period?: number | null;
}

export default function SharedPresentationsPage() {
  const { toast } = useToast();
  const [presentations, setPresentations] = useState<SharedPresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPresentations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("shared_presentations")
        .select(`
          id,
          title,
          description,
          access_token,
          created_at,
          expires_at,
          is_active,
          campaign_id,
          instance_id,
          survey_campaigns!inner (
            name
          ),
          campaign_instances (
            period_number
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to needed format
      const processedData = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        access_token: item.access_token,
        created_at: item.created_at,
        expires_at: item.expires_at,
        is_active: item.is_active,
        campaign_name: item.survey_campaigns.name,
        instance_period: item.campaign_instances?.[0]?.period_number
      }));

      setPresentations(processedData);
    } catch (error) {
      console.error("Error fetching shared presentations:", error);
      toast({
        title: "Error",
        description: "Failed to load shared presentations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("shared_presentations")
        .update({ is_active: !currentState })
        .eq("id", id);

      if (error) throw error;

      setPresentations(prev => 
        prev.map(p => p.id === id ? { ...p, is_active: !currentState } : p)
      );

      toast({
        title: "Success",
        description: `Presentation link ${!currentState ? "activated" : "deactivated"}`
      });
    } catch (error) {
      console.error("Error toggling presentation status:", error);
      toast({
        title: "Error",
        description: "Failed to update presentation status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("shared_presentations")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setPresentations(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);
      
      toast({
        title: "Success",
        description: "Presentation link deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting presentation:", error);
      toast({
        title: "Error",
        description: "Failed to delete presentation link",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyLinkToClipboard = (token: string) => {
    const url = `${window.location.origin}/presentations/${token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Presentation link copied to clipboard",
    });
  };

  const openPresentation = (token: string) => {
    window.open(`/presentations/${token}`, "_blank");
  };

  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shared Presentations</h1>
        <p className="text-muted-foreground mt-2">
          Manage public links to survey presentations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shared Presentations</CardTitle>
          <CardDescription>
            View and manage all presentation links that have been created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : presentations.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No shared presentations found</p>
              <p className="text-sm mt-2">
                Create shared links from the campaign or presentation pages
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presentations.map((presentation) => (
                  <TableRow key={presentation.id}>
                    <TableCell className="font-medium">
                      {presentation.title || "Untitled"}
                      {presentation.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                          {presentation.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {presentation.campaign_name}
                      {presentation.instance_period && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Period {presentation.instance_period})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(presentation.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      {presentation.expires_at
                        ? format(new Date(presentation.expires_at), "dd MMM yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        presentation.is_active 
                          ? "bg-green-50 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {presentation.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyLinkToClipboard(presentation.access_token)}
                          title="Copy Link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openPresentation(presentation.access_token)}
                          title="Open Presentation"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(presentation.id, presentation.is_active)}
                          title={presentation.is_active ? "Deactivate" : "Activate"}
                        >
                          {presentation.is_active ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(presentation.id)}
                          title="Delete"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shared presentation link? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
