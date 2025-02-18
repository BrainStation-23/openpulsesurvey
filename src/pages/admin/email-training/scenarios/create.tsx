
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Bold, Italic, List, ListOrdered, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const scenarioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  story: z.string().min(1, "Story is required"),
  difficulty_level: z.number().min(1),
  tags: z.array(z.string()),
  status: z.enum(["active", "inactive", "draft"]).default("draft"),
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

export default function CreateScenarioPage() {
  const [newTag, setNewTag] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      name: "",
      story: "",
      difficulty_level: 1,
      tags: [],
      status: "draft",
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      form.setValue("story", html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[150px] p-4',
      },
    },
  });

  const handleAddTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      form.setValue("tags", [...form.getValues("tags"), newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      form.getValues("tags").filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (data: ScenarioFormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("email_scenarios")
        .insert({
          name: data.name,
          story: data.story,
          difficulty_level: data.difficulty_level,
          tags: data.tags,
          status: data.status,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scenario created successfully",
      });

      navigate("/admin/email-training/scenarios");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Scenario</h1>
      </div>

      <div className="max-w-[800px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter scenario name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="story"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Story</FormLabel>
                  <FormControl>
                    <div className="border rounded-md overflow-hidden">
                      <div className="border-b bg-muted p-2 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                          data-active={editor?.isActive('bold')}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                          data-active={editor?.isActive('italic')}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => editor?.chain().focus().toggleBulletList().run()}
                          data-active={editor?.isActive('bulletList')}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                          data-active={editor?.isActive('orderedList')}
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                      </div>
                      <EditorContent editor={editor} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("tags").map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Create Scenario</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
