
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

type ConditionFormProps = {
  form: UseFormReturn<any>;
  conditionType: string;
};

export function ConditionForm({ form, conditionType }: ConditionFormProps) {
  useEffect(() => {
    // Reset condition value when type changes
    form.setValue("condition_value", "{}");
  }, [conditionType, form]);

  const updateConditionValue = (values: Record<string, any>) => {
    form.setValue("condition_value", JSON.stringify(values));
  };

  switch (conditionType) {
    case "survey_count":
      return (
        <FormField
          control={form.control}
          name="required_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Survey Count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Enter required number of surveys"
                  onChange={(e) => {
                    field.onChange(e);
                    updateConditionValue({ required_count: parseInt(e.target.value) });
                  }}
                />
              </FormControl>
              <FormDescription>
                Number of surveys that need to be completed to earn this achievement
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "response_rate":
      return (
        <FormField
          control={form.control}
          name="required_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Response Rate (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Enter required response rate"
                  onChange={(e) => {
                    field.onChange(e);
                    updateConditionValue({ required_rate: parseInt(e.target.value) });
                  }}
                />
              </FormControl>
              <FormDescription>
                Percentage of surveys that need to be completed to earn this achievement
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "streak_days":
      return (
        <FormField
          control={form.control}
          name="required_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Consecutive Days</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Enter required streak days"
                  onChange={(e) => {
                    field.onChange(e);
                    updateConditionValue({ required_days: parseInt(e.target.value) });
                  }}
                />
              </FormControl>
              <FormDescription>
                Number of consecutive days required to earn this achievement
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "response_quality":
      return (
        <>
          <FormField
            control={form.control}
            name="min_rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Rating</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateConditionValue({ 
                      min_rating: parseInt(value),
                      min_length: form.getValues("min_length") || 0 
                    });
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select minimum rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} Star{rating > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Minimum rating required for responses
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="min_length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Response Length</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Enter minimum character count"
                    onChange={(e) => {
                      field.onChange(e);
                      updateConditionValue({ 
                        min_length: parseInt(e.target.value),
                        min_rating: form.getValues("min_rating") || 1
                      });
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Minimum character count for text responses (0 for no minimum)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );

    case "event_participation":
      return (
        <>
          <FormField
            control={form.control}
            name="event_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateConditionValue({ 
                      event_type: value,
                      required_count: form.getValues("participation_count") || 1
                    });
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="survey_campaign">Survey Campaign</SelectItem>
                    <SelectItem value="feedback_session">Feedback Session</SelectItem>
                    <SelectItem value="special_survey">Special Survey</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Type of event that needs to be participated in
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="participation_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Participation Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Enter required participation count"
                    onChange={(e) => {
                      field.onChange(e);
                      updateConditionValue({ 
                        event_type: form.getValues("event_type") || "survey_campaign",
                        required_count: parseInt(e.target.value)
                      });
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Number of times user needs to participate in the selected event type
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );

    default:
      return null;
  }
}
