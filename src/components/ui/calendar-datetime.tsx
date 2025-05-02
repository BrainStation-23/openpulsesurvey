
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarDateTimeProps {
  value?: Date;
  onChange?: (date: Date) => void;
}

export function CalendarDateTime({
  value,
  onChange,
}: CalendarDateTimeProps) {
  // Initialize with a valid time format that matches the TimePicker's expected format
  const [time, setTime] = React.useState(
    value ? format(value, "HH:mm") : "00:00"
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !onChange) return;

    try {
      // Try to parse the time string
      const [hours, minutes] = time.split(":").map(Number);
      
      // Validate parsed values
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error("Invalid time format:", time);
        // Use default time as fallback
        date.setHours(0, 0, 0, 0);
      } else {
        date.setHours(hours, minutes, 0, 0);
      }
      
      onChange(date);
    } catch (error) {
      console.error("Error setting time:", error);
      // Use current date/time as fallback
      onChange(date);
    }
  };

  const handleTimeChange = (newTime: string) => {
    // Store the raw time string from TimePicker
    setTime(newTime);

    if (value && onChange) {
      try {
        const newDate = new Date(value);
        
        // Try to parse the time string, which may be in 12h or 24h format
        let hours = 0;
        let minutes = 0;
        
        // Handle both 12h and 24h formats
        if (newTime.toLowerCase().includes('am') || newTime.toLowerCase().includes('pm')) {
          // 12-hour format
          const isPM = newTime.toLowerCase().includes('pm');
          const timeValue = newTime.toLowerCase().replace(/(am|pm)/i, '').trim();
          const [h, m] = timeValue.split(":").map(Number);
          
          hours = h;
          if (isPM && hours !== 12) hours += 12;
          if (!isPM && hours === 12) hours = 0;
          minutes = m;
        } else {
          // 24-hour format
          const [h, m] = newTime.split(":").map(Number);
          hours = h;
          minutes = m;
        }
        
        // Validate parsed values
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          console.error("Invalid time format:", newTime);
          return;
        }
        
        newDate.setHours(hours, minutes, 0, 0);
        onChange(newDate);
      } catch (error) {
        console.error("Error updating time:", error);
      }
    }
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            defaultMonth={value}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      <TimePicker
        value={time}
        onChange={handleTimeChange}
        className="w-full"
      />
    </div>
  );
}
