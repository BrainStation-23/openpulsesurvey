import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import * as icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useEffect } from "react";
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
import { AchievementType, ACHIEVEMENT_TYPE_CONFIG } from "./types";
import { TourButton } from "@/components/onboarding/TourButton";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  achievement_type: z.enum(['survey_completion', 'response_rate', 'streak', 'campaign_completion'] as const),
  icon: z.string().min(1, "Icon is required"),
  icon_color: z.string().min(1, "Icon color is required"),
  points: z.coerce.number().min(0, "Points must be a positive number"),
  status: z.enum(['active', 'inactive']),
  condition_value: z.string().transform(val => JSON.parse(val)),
  required_count: z.number().optional().nullable(),
  required_rate: z.number().optional().nullable(),
  required_days: z.number().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

type Achievement = {
  id: string;
  name: string;
  description: string;
  achievement_type: AchievementType;
  icon: string;
  icon_color: string;
  points: number;
  status: 'active' | 'inactive';
  condition_value: any;
  created_at?: string;
  updated_at?: string;
};

export default function AchievementFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      achievement_type: "survey_completion",
      icon: "Trophy",
      icon_color: "blue",
      points: 0,
      status: "active",
      condition_value: "{}",
    },
  });

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

  useEffect(() => {
    if (achievement) {
      const conditionValue = typeof achievement.condition_value === 'string' 
        ? JSON.parse(achievement.condition_value)
        : achievement.condition_value;

      form.reset({
        ...achievement,
        condition_value: JSON.stringify(conditionValue),
        required_count: conditionValue.required_count,
        required_rate: conditionValue.required_rate,
        required_days: conditionValue.required_days,
      });
    }
  }, [achievement, form]);

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from('achievements')
        .insert([{
          name: values.name,
          description: values.description,
          achievement_type: values.achievement_type,
          icon: values.icon,
          icon_color: values.icon_color,
          points: values.points,
          status: values.status,
          condition_value: values.condition_value,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Achievement;
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
      const { data, error } = await supabase
        .from('achievements')
        .update({
          name: values.name,
          description: values.description,
          achievement_type: values.achievement_type,
          icon: values.icon,
          icon_color: values.icon_color,
          points: values.points,
          status: values.status,
          condition_value: values.condition_value,
        })
        .eq('id', id as string)
        .select()
        .single();
      
      if (error) throw error;
      return data as Achievement;
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

  const selectedType = form.watch("achievement_type") as AchievementType;
  const typeConfig = ACHIEVEMENT_TYPE_CONFIG[selectedType];

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Achievement" : "Create Achievement"}
        </h1>
        <TourButton tourId="achievement_create" title="Achievement Creation Guide" />
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
                  {/* Add class names for tour targeting */}
                  <FormField
                    control={form.control}
                    name="achievement_type"
                    render={({ field }) => (
                      <FormItem className="achievement-type-select">
                        <FormLabel>Achievement Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select achievement type" className="text-left" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ACHIEVEMENT_TYPE_CONFIG).map(([type, config]) => (
                              <SelectItem key={type} value={type} className="w-full">
                                <div className="flex flex-col w-full text-left">
                                  <span>{config.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {config.description}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {typeConfig?.description}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="icon-picker">
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <IconPicker 
                              value={field.value} 
                              onChange={field.onChange}
                              color={form.watch("icon_color")}
                              onColorChange={(color) => form.setValue("icon_color", color)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Inactive achievements won't be awarded to users
                        </FormDescription>
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
                      return PreviewIcon ? (
                        <PreviewIcon 
                          className="w-12 h-12" 
                          style={{ color: form.watch("icon_color") || "#8B5CF6" }} 
                        />
                      ) : null;
                    })()}
                    <div>
                      <h3 className="font-semibold">{form.watch("name") || "Achievement Name"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {form.watch("description") || "Achievement description will appear here"}
                      </p>
                      <div className="text-sm font-medium mt-1" style={{ color: form.watch("icon_color") || "#8B5CF6" }}>
                        {form.watch("points")} points
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card className="achievement-conditions">
                <CardHeader>
                  <CardTitle>Achievement Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <ConditionForm 
                      form={form} 
                      achievementType={selectedType}
                      typeConfig={typeConfig}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/achievements')}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg">
              {isEditMode ? "Update Achievement" : "Create Achievement"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
