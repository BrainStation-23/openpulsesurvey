
import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sun, Sunset, Moon, Sunrise, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
  disabled?: boolean;
}

function getTimeOfDay(minutes: number) {
  if (minutes >= 360 && minutes < 720) return "morning";
  if (minutes >= 720 && minutes < 1080) return "afternoon";
  if (minutes >= 1080 && minutes < 1440) return "evening";
  return "night";
}

function formatTime(minutes: number, use24Hour: boolean): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (use24Hour) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  } else {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  }
}

function getMinutesFromTimeString(time: string): number {
  const isPM = time.toLowerCase().includes('pm');
  const isAM = time.toLowerCase().includes('am');
  
  const cleanTime = time.toLowerCase().replace(/(am|pm)/i, '').trim();
  const [hours, minutes] = cleanTime.split(':').map(Number);
  
  let adjustedHours = hours;
  if (isPM && hours !== 12) adjustedHours += 12;
  if (isAM && hours === 12) adjustedHours = 0;
  
  return adjustedHours * 60 + minutes;
}

export function TimePicker({ value, onChange, className, disabled = false }: TimePickerProps) {
  const [use24Hour, setUse24Hour] = React.useState(true);
  const minutes = getMinutesFromTimeString(value);
  const timeOfDay = getTimeOfDay(minutes);
  const isNextDay = minutes < 360; // Before 6 AM

  const handleSliderChange = (newValue: number[]) => {
    if (!disabled) {
      onChange(formatTime(newValue[0], use24Hour));
    }
  };

  const formattedValue = formatTime(minutes, use24Hour);

  const handleFormatChange = (checked: boolean) => {
    setUse24Hour(checked);
    onChange(formatTime(minutes, checked));
  };

  return (
    <div className={cn("space-y-4", className, disabled ? "opacity-70" : "")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {timeOfDay === "morning" && <Sun className="h-4 w-4 text-yellow-500" />}
          {timeOfDay === "afternoon" && <Sun className="h-4 w-4 text-orange-500" />}
          {timeOfDay === "evening" && <Sunset className="h-4 w-4 text-blue-500" />}
          {timeOfDay === "night" && <Moon className="h-4 w-4 text-indigo-500" />}
          <span className="font-medium">{formattedValue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <Switch
            checked={use24Hour}
            onCheckedChange={handleFormatChange}
            disabled={disabled}
            className="scale-75"
          />
          <span>{use24Hour ? "24h" : "12h"}</span>
        </div>
      </div>

      {isNextDay && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-xs text-muted-foreground">Next day</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>This time is in the early hours of the next day</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div className="relative pt-1">
        <div className="absolute w-full h-2 -mt-1 flex">
          <div className="w-1/4 bg-indigo-100/10" /> {/* Night */}
          <div className="w-1/4 bg-yellow-100/10" /> {/* Morning */}
          <div className="w-1/4 bg-orange-100/10" /> {/* Afternoon */}
          <div className="w-1/4 bg-blue-100/10" /> {/* Evening */}
        </div>
        <div className="absolute w-full flex justify-between text-xs text-muted-foreground -mt-6">
          <span>{use24Hour ? "00:00" : "12:00 AM"}</span>
          <span>{use24Hour ? "06:00" : "6:00 AM"}</span>
          <span>{use24Hour ? "12:00" : "12:00 PM"}</span>
          <span>{use24Hour ? "18:00" : "6:00 PM"}</span>
          <span>{use24Hour ? "23:59" : "11:59 PM"}</span>
        </div>
        <Slider
          min={0}
          max={1439}
          step={15}
          value={[minutes]}
          onValueChange={handleSliderChange}
          className="z-10"
          disabled={disabled}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Moon className="h-3 w-3" />
          <span>Night</span>
        </div>
        <div className="flex items-center gap-1">
          <Sunrise className="h-3 w-3" />
          <span>Morning</span>
        </div>
        <div className="flex items-center gap-1">
          <Sun className="h-3 w-3" />
          <span>Afternoon</span>
        </div>
        <div className="flex items-center gap-1">
          <Sunset className="h-3 w-3" />
          <span>Evening</span>
        </div>
      </div>
    </div>
  );
}
