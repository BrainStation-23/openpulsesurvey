
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { TimeSlider } from "@/components/ui/time-slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarDateTimeProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

export function CalendarDateTime({
  value,
  onChange,
  className
}: CalendarDateTimeProps) {
  const [open, setOpen] = React.useState(false);
  const [time, setTime] = React.useState(
    value ? format(value, "HH:mm") : "00:00"
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !onChange) return;

    const [hours, minutes] = time.split(":").map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);
    onChange(date);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);

    if (value && onChange) {
      const newDate = new Date(value);
      const [hours, minutes] = newTime.split(":").map(Number);
      
      // If time is past midnight (00:00) and we're setting it from a PM time,
      // increment the date by one day
      if (hours === 0 && value.getHours() >= 12) {
        newDate.setDate(newDate.getDate() + 1);
      }
      // If time is PM and we're setting it from midnight (00:00),
      // decrement the date by one day
      else if (hours >= 12 && value.getHours() === 0) {
        newDate.setDate(newDate.getDate() - 1);
      }
      
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      onChange(newDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              handleDateSelect(date);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <TimeSlider 
        value={time}
        onChange={handleTimeChange}
      />
    </div>
  );
}
