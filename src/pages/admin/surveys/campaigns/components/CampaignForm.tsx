
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BasicInfoForm } from "./BasicInfoForm";
import { ScheduleConfig } from "./ScheduleConfig";
import { ReviewStep } from "./ReviewStep";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { useState } from "react";

// Helper function to validate dates
const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  survey_id: z.string().min(1, "Survey is required"),
  starts_at: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Start date must be a valid date",
  }).refine(isValidDate, {
    message: "Start date is invalid",
  }),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.string().optional(),
  ends_at: z.date({
    required_error: "End date is required",
    invalid_type_error: "End date must be a valid date",
  }).refine(isValidDate, {
    message: "End date is invalid",
  }),
  instance_duration_days: z.number().optional(),
  instance_end_time: z.string().optional(),
  status: z.string().default("draft"),
  anonymous: z.boolean().default(false),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  onSubmit: (data: CampaignFormData) => void;
  surveys: { id: string; name: string; }[];
  defaultValues?: Partial<CampaignFormData>;
  currentStep: number;
  onStepComplete: (step: number) => void;
  onStepBack: (step: number) => void;
}

export function CampaignForm({ 
  onSubmit, 
  surveys,
  defaultValues,
  currentStep,
  onStepComplete,
  onStepBack,
}: CampaignFormProps) {
  const [isReadyToProceed, setIsReadyToProceed] = useState(false);
  
  // Set default end date to today at 12:00 PM
  const today = new Date();
  const defaultEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);

  // Ensure default values have valid dates
  const safeDefaultValues = {
    ...defaultValues,
    starts_at: defaultValues?.starts_at && isValidDate(defaultValues.starts_at) 
      ? defaultValues.starts_at 
      : new Date(),
    ends_at: defaultValues?.ends_at && isValidDate(defaultValues.ends_at)
      ? defaultValues.ends_at
      : defaultEndDate
  };

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      description: "",
      survey_id: "",
      starts_at: new Date(),
      is_recurring: false,
      recurring_frequency: "daily", // Set default frequency to daily
      ends_at: defaultEndDate,
      instance_duration_days: 1,
      instance_end_time: "00:00", // Set default response due time to 12:00 AM
      status: "draft",
      anonymous: false,
      ...safeDefaultValues,
    },
  });

  const handleNext = async () => {
    if (currentStep < 3) {
      const isValid = await form.trigger();
      if (isValid) {
        onStepComplete(currentStep);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (currentStep < 3) {
      e.preventDefault();
      handleNext();
    } else {
      if (isReadyToProceed) {
        form.handleSubmit(onSubmit)(e);
      } else {
        e.preventDefault();
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm form={form} />;
      case 2:
        return <ScheduleConfig form={form} />;
      case 3:
        return (
          <ReviewStep 
            form={form} 
            isReadyToProceed={isReadyToProceed}
            onReadyToProceedChange={setIsReadyToProceed}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderStepContent()}
        
        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onStepBack(currentStep)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {currentStep === 3 ? (
            <Button type="submit" disabled={!isReadyToProceed}>
              <Send className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
