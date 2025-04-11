
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { EmailTemplate, EmailTemplateStatus } from "@/types/emailTemplates";

export default function EmailTemplatesPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("email_templates" as any)
        .select("*")
        .order("name");

      if (error) throw error;
      setTemplates((data || []) as unknown as EmailTemplate[]);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast({
        variant: "destructive",
        title: "Failed to load email templates",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (template: EmailTemplate, newStatus: EmailTemplateStatus) => {
    try {
      const { error } = await supabase
        .from("email_templates" as any)
        .update({ status: newStatus })
        .eq("id", template.id);

      if (error) throw error;

      setTemplates(templates.map(t => 
        t.id === template.id ? { ...t, status: newStatus } : t
      ));

      toast({
        title: "Template updated",
        description: `${template.name} is now ${newStatus}`,
      });
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast({
        variant: "destructive",
        title: "Failed to update template",
        description: error.message,
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      const { error } = await supabase
        .from("email_templates" as any)
        .delete()
        .eq("id", templateToDelete.id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);

      toast({
        title: "Template deleted",
        description: `${templateToDelete.name} has been deleted`,
      });
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete template",
        description: error.message,
      });
    }
  };

  const duplicateTemplate = async (template: EmailTemplate) => {
    try {
      const { data, error } = await supabase
        .from("email_templates" as any)
        .insert({
          name: `${template.name} (Copy)`,
          description: template.description,
          subject: template.subject,
          html_content: template.html_content,
          plain_text_content: template.plain_text_content,
          category: template.category,
          available_variables: template.available_variables,
          status: 'draft' as EmailTemplateStatus,
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newTemplate = data[0] as unknown as EmailTemplate;
        setTemplates([...templates, newTemplate]);
        toast({
          title: "Template duplicated",
          description: `Created a copy of ${template.name}`,
        });
      }
    } catch (error: any) {
      console.error("Error duplicating template:", error);
      toast({
        variant: "destructive",
        title: "Failed to duplicate template",
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status: EmailTemplateStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <Button onClick={() => navigate("/admin/config/email/templates/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate(`/admin/config/email/templates/${template.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateTemplate(template)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => {
                          setTemplateToDelete(template);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">
                  {template.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium">Subject:</span> {template.subject}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Category:</span> {template.category}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                {getStatusBadge(template.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">Status</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleStatusChange(template, 'draft')}>
                      Set as Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(template, 'active')}>
                      Set as Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(template, 'inactive')}>
                      Set as Inactive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first email template to get started
          </p>
          <Button onClick={() => navigate("/admin/config/email/templates/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the template "{templateToDelete?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplate}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
