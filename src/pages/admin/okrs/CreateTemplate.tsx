
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTemplates, CreateTemplateInput } from '@/hooks/okr/useTemplates';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from "sonner";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TemplateObjective } from '@/types/okr';
import { ChevronLeft, PlusCircle, Save } from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TemplateObjectiveForm } from '@/components/okr/templates/TemplateObjectiveForm';

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  is_public: z.boolean().default(true),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

const AdminCreateOKRTemplate = () => {
  const navigate = useNavigate();
  const { createTemplate } = useTemplates();
  const { user } = useCurrentUser();
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

  const onSubmit = async (values: TemplateFormValues) => {
    if (!user?.id) {
      toast.error("You must be logged in to create a template");
      return;
    }

    setSaving(true);
    
    try {
      const templateInput: CreateTemplateInput = {
        name: values.name,
        description: values.description,
        is_public: values.is_public,
        created_by: user.id,
      };
      
      const template = await createTemplate(templateInput);
      
      toast.success("Template created successfully");
      navigate(`/admin/okrs/templates/${template.id}`);
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error("Failed to create template");
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Create OKR Template</h1>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Template
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
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Template</FormLabel>
                      <FormDescription>
                        Make this template available to all users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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

export default AdminCreateOKRTemplate;
