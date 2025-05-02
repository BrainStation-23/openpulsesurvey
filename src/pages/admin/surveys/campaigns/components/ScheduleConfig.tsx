
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CalendarDateTime } from "@/components/ui/calendar-datetime";
import { CampaignFormData } from "./CampaignForm";
import { TimePicker } from "@/components/ui/time-picker";
import { useEffect } from "react";

interface ScheduleConfigProps {
  form: UseFormReturn<CampaignFormData>;
}

const frequencyOptions = [
  { value: "daily", label: "Daily (Runs every day)", maxDays: 1 },
  { value: "weekly", label: "Weekly (Runs every week)", maxDays: 7 },
  { value: "monthly", label: "Monthly (Runs once a month)", maxDays: 31 },
  { value: "quarterly", label: "Quarterly (Runs every 3 months)", maxDays: 90 },
  { value: "yearly", label: "Yearly (Runs once a year)", maxDays: 365 },
];

export function ScheduleConfig({ form }: ScheduleConfigProps) {
  const isRecurring = useWatch({
    control: form.control,
    name: "is_recurring",
  });

  const frequency = useWatch({
    control: form.control,
    name: "recurring_frequency",
  });

  // Set a default instance_end_time when component mounts or when isRecurring changes
  useEffect(() => {
    if (isRecurring && !form.getValues("instance_end_time")) {
      form.setValue("instance_end_time", "17:00"); // Default to 5:00 PM
    }
  }, [isRecurring, form]);

  const getMaxDays = () => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    return option?.maxDays || 1;
  };

  const handleFrequencyChange = (value: string) => {
    form.setValue("recurring_frequency", value);
    const maxDays = frequencyOptions.find(opt => opt.value === value)?.maxDays || 1;
    const currentDuration = form.getValues("instance_duration_days");
    
    if (currentDuration > maxDays) {
      form.setValue("instance_duration_days", maxDays);
    }
  };

  // Validate dates in form (for debugging)
  const validateDates = () => {
    const startsAt = form.getValues("starts_at");
    const endsAt = form.getValues("ends_at");
    
    if (!(startsAt instanceof Date) || isNaN(startsAt.getTime())) {
      console.error("Invalid starts_at date:", startsAt);
    }
    
    if (!(endsAt instanceof Date) || isNaN(endsAt.getTime())) {
      console.error("Invalid ends_at date:", endsAt);
    }
  };

  // Run validation on render
  useEffect(() => {
    validateDates();
  }, []);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Recurring Campaign</FormLabel>
                <FormDescription>
                  Enable if this campaign should repeat on a schedule
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="starts_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date & Time</FormLabel>
                <FormControl>
                  <CalendarDateTime 
                    value={field.value} 
                    onChange={(date) => {
                      if (date instanceof Date && !isNaN(date.getTime())) {
                        field.onChange(date);
                      } else {
                        console.error("Invalid date in starts_at CalendarDateTime:", date);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ends_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign End Date & Time</FormLabel>
                <FormControl>
                  <CalendarDateTime 
                    value={field.value} 
                    onChange={(date) => {
                      if (date instanceof Date && !isNaN(date.getTime())) {
                        field.onChange(date);
                      } else {
                        console.error("Invalid date in ends_at CalendarDateTime:", date);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isRecurring && (
            <>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="recurring_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select 
                        onValueChange={handleFrequencyChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {frequencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instance_end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response Due Time</FormLabel>
                      <FormControl>
                        <TimePicker 
                          value={field.value || "17:00"} // Default to 5:00 PM if not set
                          onChange={field.onChange}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="instance_duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Window (days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={1}
                        max={getMaxDays()}
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          const maxDays = getMaxDays();
                          if (value > maxDays) {
                            field.onChange(maxDays);
                          } else {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum {getMaxDays()} days based on selected frequency
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
