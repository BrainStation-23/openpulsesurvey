
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

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  survey_id: z.string().min(1, "Survey is required"),
  starts_at: z.date({
    required_error: "Start date is required",
  }),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.string().optional(),
  recurring_ends_at: z.date().optional()
    .superRefine((date, ctx) => {
      const parentData = ctx.parent as { is_recurring: boolean };
      const isRecurring = parentData.is_recurring;
      
      if (isRecurring && !date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Campaign end date is required for recurring campaigns"
        });
      }
    }),
  instance_duration_days: z.number().optional(),
  instance_end_time: z.string().optional(),
  ends_at: z.date().optional()
    .superRefine((date, ctx) => {
      const parentData = ctx.parent as { is_recurring: boolean };
      const isRecurring = parentData.is_recurring;
      
      if (!isRecurring && !date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date is required for non-recurring campaigns"
        });
      }
    }),
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
  defaultValues,
  currentStep,
  onStepComplete,
  onStepBack,
}: CampaignFormProps) {
  const [isReadyToProceed, setIsReadyToProceed] = useState(false);
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      description: "",
      survey_id: "",
      starts_at: new Date(),
      is_recurring: false,
      recurring_frequency: undefined,
      instance_duration_days: 7,
      instance_end_time: "17:00",
      status: "draft",
      anonymous: false,
      ...defaultValues,
    },
  });

  const validateCurrentStep = async () => {
    // Define which fields should be validated for each step
    const stepFields: Record<number, (keyof CampaignFormData)[]> = {
      1: ['name', 'description', 'survey_id', 'anonymous'],
      2: ['starts_at', 'is_recurring', 'recurring_frequency', 'recurring_ends_at', 'instance_duration_days', 'instance_end_time', 'ends_at'],
      3: [] // Review step doesn't need validation
    };

    const currentFields = stepFields[currentStep];
    if (!currentFields) return true;

    const result = await form.trigger(currentFields);
    return result;
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      const isValid = await validateCurrentStep();
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
