import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import * as icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { IconPicker } from "./components/IconPicker";
import { ConditionForm } from "./components/ConditionForm";

const achievementCategories = [
  "survey_completion",
  "response_rate",
  "streak",
  "quality",
  "special_event",
] as const;

const conditionTypes = [
  "survey_count",
  "response_rate",
  "streak_days",
  "response_quality",
  "event_participation",
] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(achievementCategories),
  icon: z.string().min(1, "Icon is required"),
  points: z.coerce.number().min(0, "Points must be a positive number"),
  condition_type: z.enum(conditionTypes),
  condition_value: z.string().transform(val => JSON.parse(val)),
  required_count: z.number().optional(),
  required_rate: z.number().optional(),
  required_days: z.number().optional(),
  min_rating: z.number().optional(),
  min_length: z.number().optional(),
  event_type: z.string().optional(),
  participation_count: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Achievement = {
  id: string;
  name: string;
  description: string;
  category: typeof achievementCategories[number];
  icon: string;
  points: number;
  condition_type: typeof conditionTypes[number];
  condition_value: any;
  created_at?: string;
  updated_at?: string;
};

export default function AchievementFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const { data: achievement, isLoading: isLoadingAchievement } = useQuery({
    queryKey: ['achievement', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Achievement;
    },
    enabled: isEditMode,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "survey_completion",
      icon: "Trophy",
      points: 0,
      condition_type: "survey_count",
      condition_value: "{}",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const achievementData: Omit<Achievement, 'id' | 'created_at' | 'updated_at'> = {
        name: values.name,
        description: values.description,
        category: values.category,
        icon: values.icon,
        points: values.points,
        condition_type: values.condition_type,
        condition_value: values.condition_value,
      };

      const { data, error } = await supabase
        .from('achievements')
        .insert([achievementData])
        .select();
      
      if (error) throw error;
      return data[0] as Achievement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success("Achievement created successfully");
      navigate('/admin/achievements');
    },
    onError: (error) => {
      toast.error("Failed to create achievement");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const achievementData: Omit<Achievement, 'id' | 'created_at' | 'updated_at'> = {
        name: values.name,
        description: values.description,
        category: values.category,
        icon: values.icon,
        points: values.points,
        condition_type: values.condition_type,
        condition_value: values.condition_value,
      };

      const { data, error } = await supabase
        .from('achievements')
        .update(achievementData)
        .eq('id', id as string)
        .select();
      
      if (error) throw error;
      return data[0] as Achievement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success("Achievement updated successfully");
      navigate('/admin/achievements');
    },
    onError: (error) => {
      toast.error("Failed to update achievement");
      console.error(error);
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isEditMode) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  if (isEditMode && isLoadingAchievement) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Achievement" : "Create Achievement"}
        </h1>
        <Button onClick={() => navigate('/admin/achievements')}>Back to Achievements</Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <IconPicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="survey_completion">Survey Completion</SelectItem>
                            <SelectItem value="response_rate">Response Rate</SelectItem>
                            <SelectItem value="streak">Streak</SelectItem>
                            <SelectItem value="quality">Quality</SelectItem>
                            <SelectItem value="special_event">Special Event</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    {form.watch("icon") && (() => {
                      const PreviewIcon = icons[form.watch("icon") as keyof typeof icons] as LucideIcon;
                      return PreviewIcon ? <PreviewIcon className="w-12 h-12 text-primary" /> : null;
                    })()}
                    <div>
                      <h3 className="font-semibold">{form.watch("name") || "Achievement Name"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {form.watch("description") || "Achievement description will appear here"}
                      </p>
                      <div className="text-sm font-medium text-primary mt-1">
                        {form.watch("points")} points
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Achievement Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="condition_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="survey_count">Survey Count</SelectItem>
                            <SelectItem value="response_rate">Response Rate</SelectItem>
                            <SelectItem value="streak_days">Streak Days</SelectItem>
                            <SelectItem value="response_quality">Response Quality</SelectItem>
                            <SelectItem value="event_participation">Event Participation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border rounded-lg p-4 bg-muted/50">
                    <ConditionForm 
                      form={form} 
                      conditionType={form.watch("condition_type")} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" size="lg">
              {isEditMode ? "Update Achievement" : "Create Achievement"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
