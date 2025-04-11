
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EmailTemplate, TemplateVariable } from "@/types/email-templates";
import { HtmlEditor } from "./HtmlEditor";
import { Eye, EyeOff, Variable } from "lucide-react";

interface TemplateFormProps {
  template?: EmailTemplate | null;
  onCancel: () => void;
  onSuccess: (templateId: string) => void;
}

// Create a schema for form validation
const templateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  html_content: z.string().min(1, "HTML content is required"),
  plain_text_content: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["active", "draft", "archived"]),
  available_variables: z.array(z.string()).optional(),
});

export function TemplateForm({ template, onCancel, onSuccess }: TemplateFormProps) {
  const queryClient = useQueryClient();
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("html");
  const [templateVariables, setTemplateVariables] = useState<TemplateVariable[]>([]);

  // Get available template variables
  const { data: variables = [] } = useQuery({
    queryKey: ["template-variables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_variables")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data as TemplateVariable[];
    },
  });

  useEffect(() => {
    if (variables.length > 0) {
      setTemplateVariables(variables);
    }
  }, [variables]);

  const defaultValues = {
    name: template?.name || "",
    description: template?.description || "",
    subject: template?.subject || "",
    html_content: template?.html_content || "<p>Hello {{user_name}},</p><p>Your message here...</p>",
    plain_text_content: template?.plain_text_content || "Hello {{user_name}},\n\nYour message here...",
    category: template?.category || "notification",
    status: template?.status || "draft",
    available_variables: template?.available_variables || ["user_name", "user_email"],
  };

  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues,
  });

  // Save template
  const saveTemplate = useMutation({
    mutationFn: async (values: z.infer<typeof templateSchema>) => {
      const templateData = {
        ...values,
        updated_at: new Date().toISOString(),
      };

      if (template?.id) {
        // Update existing template
        const { data, error } = await supabase
          .from("email_templates")
          .update(templateData)
          .eq("id", template.id)
          .select()
          .single();

        if (error) throw error;
        return data as EmailTemplate;
      } else {
        // Create new template
        const { data, error } = await supabase
          .from("email_templates")
          .insert([{ ...templateData, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) throw error;
        return data as EmailTemplate;
      }
    },
    onSuccess: (savedTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success(
        template?.id
          ? "Template updated successfully"
          : "Template created successfully"
      );
      onSuccess(savedTemplate.id);
    },
    onError: (error) => {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    },
  });

  const onSubmit = (values: z.infer<typeof templateSchema>) => {
    saveTemplate.mutate(values);
  };

  // Handle inserting variables into content
  const insertVariable = (variable: TemplateVariable) => {
    const variableTag = `{{${variable.name}}}`;
    
    if (activeTab === "html") {
      // For HTML editor, we need to use the editor instance method
      const editor = (window as any).tinymce.get("html-editor");
      if (editor) {
        editor.execCommand("mceInsertContent", false, variableTag);
        
        // Update the form value
        const currentContent = form.getValues("html_content");
        form.setValue("html_content", currentContent, { shouldDirty: true });
      }
    } else {
      // For plain text, we can manipulate the textarea directly
      const textarea = document.getElementById("plain-text-editor") as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = form.getValues("plain_text_content") || "";
        
        const newContent = 
          currentContent.substring(0, start) + 
          variableTag + 
          currentContent.substring(end);
        
        form.setValue("plain_text_content", newContent, { shouldDirty: true });
        
        // Reset cursor position after the inserted variable
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + variableTag.length, start + variableTag.length);
        }, 0);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>
                Basic information about the email template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="notification">Notification</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="transactional">Transactional</SelectItem>
                          <SelectItem value="account">Account</SelectItem>
                          <SelectItem value="survey">Survey</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the template's purpose"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email subject line"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can use variables in the subject like: {{user_name}}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Only active templates can be used for sending emails
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2">
              <Card>
                <CardHeader className="space-y-1">
                  <div className="flex justify-between items-center">
                    <CardTitle>Template Content</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Hide Preview
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Show Preview
                        </>
                      )}
                    </Button>
                  </div>
                  <CardDescription>
                    Create the HTML and plain text versions of your email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue="html"
                    onValueChange={(value) => setActiveTab(value)}
                  >
                    <TabsList className="mb-4">
                      <TabsTrigger value="html">HTML Content</TabsTrigger>
                      <TabsTrigger value="plain">Plain Text</TabsTrigger>
                    </TabsList>
                    <TabsContent value="html" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="html_content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <HtmlEditor
                                id="html-editor"
                                initialValue={field.value}
                                onChange={(content) => field.onChange(content)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    <TabsContent value="plain" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="plain_text_content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                id="plain-text-editor"
                                placeholder="Plain text version of the email"
                                className="min-h-[300px] font-mono"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Plain text version is used as a fallback when HTML cannot be displayed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-1">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Variables</CardTitle>
                    <CardDescription>
                      Click to insert variables into your template
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {templateVariables.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          No variables available
                        </p>
                      ) : (
                        Object.entries(
                          templateVariables.reduce((acc, variable) => {
                            if (!acc[variable.category]) {
                              acc[variable.category] = [];
                            }
                            acc[variable.category].push(variable);
                            return acc;
                          }, {} as Record<string, TemplateVariable[]>)
                        ).map(([category, vars]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="text-sm font-medium">{category}</h4>
                            <div className="flex flex-wrap gap-2">
                              {vars.map((variable) => (
                                <TooltipProvider key={variable.id}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => insertVariable(variable)}
                                        className="h-auto py-1"
                                      >
                                        <Variable className="mr-1 h-3 w-3" />
                                        {variable.name}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p className="font-medium">{variable.description}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Example: {variable.sample_value}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {showPreview && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Preview</CardTitle>
                      <CardDescription>
                        Preview how your email will look
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Subject</h4>
                          <div className="p-2 border rounded-md bg-muted/50">
                            {form.watch("subject")}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Body</h4>
                          <div className="border rounded-md bg-white overflow-auto max-h-[400px]">
                            {activeTab === "html" ? (
                              <div 
                                className="p-4" 
                                dangerouslySetInnerHTML={{ 
                                  __html: form.watch("html_content")
                                }} 
                              />
                            ) : (
                              <pre className="p-4 whitespace-pre-wrap font-mono text-sm">
                                {form.watch("plain_text_content")}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <Card>
            <CardFooter className="flex justify-between p-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={saveTemplate.isPending}
              >
                {saveTemplate.isPending ? "Saving..." : template?.id ? "Update Template" : "Create Template"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
