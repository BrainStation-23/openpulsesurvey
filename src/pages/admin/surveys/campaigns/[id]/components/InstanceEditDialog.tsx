import { useState, useEffect } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Instance } from "../hooks/useInstanceManagement";

interface InstanceEditDialogProps {
  instance: Instance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  isRecurring?: boolean;
}

const formSchema = z.object({
  id: z.string(),
  status: z.enum(['upcoming', 'active', 'completed', 'inactive']),
  starts_at: z.date({
    required_error: "Start date is required",
  }),
  starts_at_time: z.string(),
  ends_at: z.date({
    required_error: "End date is required",
  }),
  ends_at_time: z.string(),
});

export function InstanceEditDialog({
  instance,
  open,
  onOpenChange,
  onSave,
  isRecurring,
}: InstanceEditDialogProps) {
  const [showWarning, setShowWarning] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      status: "upcoming" as const,
      starts_at: new Date(),
      starts_at_time: "09:00",
      ends_at: new Date(),
      ends_at_time: "17:00",
    },
  });

  useEffect(() => {
    if (instance) {
      const startDate = new Date(instance.starts_at);
      const endDate = new Date(instance.ends_at);

      form.reset({
        id: instance.id,
        status: instance.status as any,
        starts_at: startDate,
        starts_at_time: format(startDate, "HH:mm"),
        ends_at: endDate,
        ends_at_time: format(endDate, "HH:mm"),
      });

      // Show warning if this is part of a recurring campaign
      setShowWarning(!!isRecurring);
    }
  }, [instance, isRecurring, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Combine date and time
    const startDateTime = new Date(data.starts_at);
    const [startHours, startMinutes] = data.starts_at_time.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(data.ends_at);
    const [endHours, endMinutes] = data.ends_at_time.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);

    onSave({
      id: data.id,
      status: data.status,
      starts_at: startDateTime.toISOString(),
      ends_at: endDateTime.toISOString(),
    });
  };

  // Check if dates are valid
  const isValidForm = () => {
    const startDate = form.getValues("starts_at");
    const endDate = form.getValues("ends_at");
    
    if (!startDate || !endDate) return false;
    
    // End date cannot be before start date
    if (endDate < startDate) {
      form.setError("ends_at", {
        type: "manual",
        message: "End date cannot be before start date",
      });
      return false;
    }
    
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Instance</DialogTitle>
          <DialogDescription>
            Adjust the campaign instance details below.
          </DialogDescription>
        </DialogHeader>

        {showWarning && (
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm mb-4">
            <p className="font-semibold">Warning: Recurring Campaign</p>
            <p>
              This is part of a recurring campaign. Manual changes may override
              automated scheduling. Future instances could still be affected by
              the campaign's recurrence settings.
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="starts_at"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="starts_at_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ends_at"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ends_at_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!isValidForm()}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
