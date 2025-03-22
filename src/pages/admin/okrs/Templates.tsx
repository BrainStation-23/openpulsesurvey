
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Edit, Trash2, Copy } from "lucide-react";
import { useTemplates } from '@/hooks/okr/useTemplates';
import { OKRTemplate } from '@/types/okr';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AdminOKRTemplates = () => {
  const { templates, isLoading, error, deleteTemplate } = useTemplates();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<OKRTemplate | null>(null);

  const handleDeleteClick = (template: OKRTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      try {
        await deleteTemplate(templateToDelete.id);
        toast.success("Template deleted successfully");
        setDeleteDialogOpen(false);
        setTemplateToDelete(null);
      } catch (error) {
        toast.error("Failed to delete template");
      }
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">OKR Templates</h1>
        <Button asChild>
          <Link to="/admin/okrs/templates/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Error loading templates: {error.message}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-end mt-4 space-x-2">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : templates && templates.length > 0 ? (
          templates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onDelete={handleDeleteClick}
            />
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No templates found. Create your first OKR template to get started.</p>
                <Button asChild>
                  <Link to="/admin/okrs/templates/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Template
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete OKR Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TemplateCardProps {
  template: OKRTemplate;
  onDelete: (template: OKRTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onDelete }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{template.name}</CardTitle>
        <CardDescription className="line-clamp-1">{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-4">
          <p className="text-muted-foreground">
            {template.objectives?.length || 0} Objectives
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="outline" asChild>
            <Link to={`/admin/okrs/templates/${template.id}`}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Link>
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onDelete(template)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to={`/admin/okrs/templates/${template.id}/use`}>
              <Copy className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminOKRTemplates;
