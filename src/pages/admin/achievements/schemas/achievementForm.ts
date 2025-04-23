
import { z } from "zod";
import { Achievement, AchievementType } from "../types";

export const achievementFormSchema = z.object({
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

export type FormValues = z.infer<typeof achievementFormSchema>;

