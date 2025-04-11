
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import HtmlEditor from "@/components/email-templates/HtmlEditor";
import TemplatePreview from "@/components/email-templates/TemplatePreview";
import VariablesSelector from "@/components/email-templates/VariablesSelector";
import { EmailTemplate, EmailTemplateCategory, TemplateVariable } from "@/types/emailTemplates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateFormProps {
  templateId?: string;
}

interface FormValues {
  name: string;
  description: string;
  subject: string;
  html_content: string;
  plain_text_content: string;
  category: EmailTemplateCategory;
  status: string;
  available_variables: string[];
}

export default function TemplateForm({ templateId }: TemplateFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [selectedTab, setSelectedTab] = useState("edit");

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      subject: "",
      html_content: "<p>Enter your email content here...</p>",
      plain_text_content: "",
      category: "other",
      status: "draft",
      available_variables: [],
    },
  });

  useEffect(() => {
    fetchVariables();
    if (templateId) {
      fetchTemplate(templateId);
    }
  }, [templateId]);

  const fetchTemplate = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (data) {
        setTemplate(data);
        form.reset({
          name: data.name,
          description: data.description || "",
          subject: data.subject,
          html_content: data.html_content,
          plain_text_content: data.plain_text_content || "",
          category: data.category,
          status: data.status,
          available_variables: data.available_variables,
        });
      }
    } catch (error: any) {
      console.error("Error fetching template:", error);
      toast({
        variant: "destructive",
        title: "Failed to load template",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVariables = async () => {
    try {
      const { data, error } = await supabase
        .from("template_variables")
        .select("*")
        .order("name");

      if (error) throw error;
      setVariables(data || []);
    } catch (error: any) {
      console.error("Error fetching variables:", error);
      toast({
        variant: "destructive",
        title: "Failed to load variables",
        description: error.message,
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSaving(true);
      
      if (templateId) {
        // Update existing template
        const { error } = await supabase
          .from("email_templates")
          .update({
            name: values.name,
            description: values.description,
            subject: values.subject,
            html_content: values.html_content,
            plain_text_content: values.plain_text_content,
            category: values.category,
            status: values.status,
            available_variables: values.available_variables,
          })
          .eq("id", templateId);

        if (error) throw error;

        toast({
          title: "Template updated",
          description: "The email template has been updated successfully",
        });
      } else {
        // Create new template
        const { data, error } = await supabase
          .from("email_templates")
          .insert({
            name: values.name,
            description: values.description,
            subject: values.subject,
            html_content: values.html_content,
            plain_text_content: values.plain_text_content,
            category: values.category,
            status: values.status,
            available_variables: values.available_variables,
          })
          .select();

        if (error) throw error;

        toast({
          title: "Template created",
          description: "The email template has been created successfully",
        });
      }

      // Redirect back to templates list
      navigate("/admin/config/email/templates");
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        variant: "destructive",
        title: "Failed to save template",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewClick = () => {
    setSelectedTab("preview");
  };

  const handleEditClick = () => {
    setSelectedTab("edit");
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading template...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Welcome Email" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive name for this email template
                </FormDescription>
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
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="survey">Survey</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="password_reset">Password Reset</SelectItem>
                    <SelectItem value="invitation">Invitation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Categorize this template for easier management
                </FormDescription>
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
                  placeholder="Describe when and how this template should be used..."
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description to explain the template's purpose
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          rules={{ required: "Subject line is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Line</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Welcome to {{organization_name}}"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The subject line for the email. You can use variables like {{variable_name}}
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
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Set the template's status. Only active templates can be used.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="available_variables"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Variables</FormLabel>
              <FormControl>
                <VariablesSelector
                  variables={variables}
                  selectedVariables={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Select variables that can be used in this template
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border rounded-md">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <div className="p-4 border-b bg-muted/50">
              <TabsList>
                <TabsTrigger value="edit">Edit HTML</TabsTrigger>
                <TabsTrigger value="plain">Plain Text</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="edit" className="p-0">
              <FormField
                control={form.control}
                name="html_content"
                rules={{ required: "HTML content is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <HtmlEditor
                        value={field.value}
                        onChange={field.onChange}
                        variables={variables.filter(v => 
                          form.getValues().available_variables.includes(v.name)
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="plain" className="p-4">
              <FormField
                control={form.control}
                name="plain_text_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plain Text Version</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={12}
                        placeholder="Enter a plain text version of your email for clients that don't support HTML..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional plain text version of the email for clients that don't support HTML
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="preview" className="p-4 min-h-[400px] bg-gray-50">
              <TemplatePreview
                html={form.getValues().html_content}
                subject={form.getValues().subject}
                variables={variables.filter(v => 
                  form.getValues().available_variables.includes(v.name)
                )}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/config/email/templates")}
          >
            Cancel
          </Button>
          
          <div className="space-x-2">
            {selectedTab !== "preview" ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviewClick}
              >
                Preview
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleEditClick}
              >
                Back to Edit
              </Button>
            )}
            
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : templateId ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
