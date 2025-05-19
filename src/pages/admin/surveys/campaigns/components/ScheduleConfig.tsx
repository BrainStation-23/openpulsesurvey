
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
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { CampaignFormData } from "./CampaignForm";

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
                  <DateTimePicker 
                    date={field.value} 
                    setDate={(date) => date && field.onChange(date)}
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
                  <DateTimePicker
                    date={field.value}
                    setDate={(date) => date && field.onChange(date)}
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
                          value={field.value} 
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
