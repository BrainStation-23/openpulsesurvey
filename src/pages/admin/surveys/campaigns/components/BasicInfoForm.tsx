import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { EyeOff } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "./CampaignForm";
import { SurveySelector } from "./SurveySelector";

interface BasicInfoFormProps {
  form: UseFormReturn<CampaignFormData>;
}

export function BasicInfoForm({ form }: BasicInfoFormProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter campaign name" {...field} />
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
                <Textarea
                  placeholder="Enter campaign description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="survey_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Survey</FormLabel>
              <FormControl>
                <SurveySelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="anonymous"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="flex items-center gap-2">
                  Anonymous Responses <EyeOff className="h-4 w-4 text-muted-foreground" />
                </FormLabel>
                <FormDescription>
                  When enabled, responses will be collected anonymously. Respondent information will not be stored with their answers.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </Card>
  );
}