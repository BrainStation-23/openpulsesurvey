
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { achievementFormSchema, FormValues } from "../schemas/achievementForm";
import { Achievement } from "../types";

export function useAchievementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const form = useForm<FormValues>({
    resolver: zodResolver(achievementFormSchema),
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

  return {
    form,
    isEditMode,
    isLoadingAchievement,
    achievement,
    onSubmit,
  };
}
