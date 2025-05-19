
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DateTimePicker({
  date,
  setDate,
  disabled,
}: DateTimePickerProps) {
  const [timeInput, setTimeInput] = useState(() => {
    if (!date) return "12:00";
    try {
      return format(date, "HH:mm");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "12:00";
    }
  });

  // Handle date change from calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    try {
      // Create a new date to avoid mutating the original
      const newDate = new Date(selectedDate);

      // If we already have a date, carry over the time
      if (date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        newDate.setHours(hours, minutes, 0, 0);
      } else {
        // Parse time from the input
        const [hours, minutes] = timeInput.split(":").map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          newDate.setHours(hours, minutes, 0, 0);
        }
      }
      
      setDate(newDate);
    } catch (error) {
      console.error("Error setting date:", error);
      setDate(selectedDate);
    }
  };

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeInput = e.target.value;
    setTimeInput(newTimeInput);
    
    if (!date) return;
    try {
      const [hours, minutes] = newTimeInput.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        setDate(newDate);
      }
    } catch (error) {
      console.error("Error updating time:", error);
    }
  };

  const getFormattedDate = () => {
    try {
      return date ? format(date, "PPP") : null;
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return null;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getFormattedDate() ? getFormattedDate() : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Input
          type="time"
          value={timeInput}
          onChange={handleTimeChange}
          className="w-full"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
