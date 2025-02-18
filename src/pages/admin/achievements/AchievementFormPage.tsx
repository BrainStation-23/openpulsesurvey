
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  points: z.string().transform(val => parseInt(val, 10)),
  condition_type: z.enum(conditionTypes),
  condition_value: z.string().transform(val => JSON.parse(val)),
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
      icon: "trophy",
      points: "0",
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
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">
        {isEditMode ? "Edit Achievement" : "Create Achievement"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <FormField
            control={form.control}
            name="condition_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition Value (JSON)</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormDescription>
                  Enter the condition value as a JSON object. For example: {"{"}"required_count": 5{"}"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">
            {isEditMode ? "Update Achievement" : "Create Achievement"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
