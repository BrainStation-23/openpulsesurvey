
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTemplates } from '@/hooks/okr/useTemplates';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TemplateObjectiveForm } from '@/components/okr/templates/TemplateObjectiveForm';
import { OKRTemplate, TemplateObjective } from '@/types/okr';
import { ChevronLeft, PlusCircle, Save } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  is_public: z.boolean().default(true),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

const AdminOKRTemplateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTemplate, updateTemplate } = useTemplates();
  const [template, setTemplate] = useState<OKRTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [objectives, setObjectives] = useState<TemplateObjective[]>([]);
  const [saving, setSaving] = useState(false);

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      is_public: true,
    },
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        if (id) {
          const data = await getTemplate(id);
          setTemplate(data);
          form.reset({
            name: data.name,
            description: data.description || "",
            is_public: data.is_public ?? true,
          });
          setObjectives(data.objectives || []);
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        toast.error("Error loading template");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, getTemplate, form]);

  const onSubmit = async (values: TemplateFormValues) => {
    if (!id) return;
    setSaving(true);
    
    try {
      await updateTemplate({
        id,
        ...values,
      });
      
      // Handle objectives and key results update (this would require separate API calls)
      // For now, let's just assume we're updating the basic template info
      
      toast.success("Template updated successfully");
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error("Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  const addNewObjective = () => {
    const newObjective: TemplateObjective = {
      title: "New Objective",
      description: "",
      key_results: [],
    };
    setObjectives([...objectives, newObjective]);
  };

  const updateObjective = (index: number, updatedObjective: TemplateObjective) => {
    const updatedObjectives = [...objectives];
    updatedObjectives[index] = updatedObjective;
    setObjectives(updatedObjectives);
  };

  const removeObjective = (index: number) => {
    const updatedObjectives = [...objectives];
    updatedObjectives.splice(index, 1);
    setObjectives(updatedObjectives);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Template</h1>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={saving || !form.formState.isDirty}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
              <CardDescription>Basic information about this OKR template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter template name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Template Objectives</CardTitle>
            <CardDescription>Define objectives and key results for this template</CardDescription>
          </div>
          <Button 
            onClick={addNewObjective} 
            variant="outline" 
            size="sm"
          >
            <PlusCircle className="mr-1 h-4 w-4" /> Add Objective
          </Button>
        </CardHeader>
        <CardContent>
          {objectives.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {objectives.map((objective, index) => (
                <AccordionItem key={index} value={`objective-${index}`}>
                  <AccordionTrigger className="text-left">
                    {objective.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <TemplateObjectiveForm 
                      objective={objective}
                      onChange={(updated) => updateObjective(index, updated)}
                      onDelete={() => removeObjective(index)}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No objectives have been added to this template yet.</p>
              <Button onClick={addNewObjective} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Objective
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOKRTemplateDetails;
