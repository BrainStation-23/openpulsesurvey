
import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sun, Sunset, Moon, Sunrise } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

function getTimeOfDay(minutes: number) {
  if (minutes >= 360 && minutes < 720) return "morning";
  if (minutes >= 720 && minutes < 1080) return "afternoon";
  if (minutes >= 1080 && minutes < 1440) return "evening";
  return "night";
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function getMinutesFromTimeString(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const minutes = getMinutesFromTimeString(value);
  const timeOfDay = getTimeOfDay(minutes);
  const isNextDay = minutes < 360; // Before 6 AM

  const handleSliderChange = (newValue: number[]) => {
    onChange(formatTime(newValue[0]));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {timeOfDay === "morning" && <Sun className="h-4 w-4 text-yellow-500" />}
          {timeOfDay === "afternoon" && <Sun className="h-4 w-4 text-orange-500" />}
          {timeOfDay === "evening" && <Sunset className="h-4 w-4 text-blue-500" />}
          {timeOfDay === "night" && <Moon className="h-4 w-4 text-indigo-500" />}
          <span className="font-medium">{value}</span>
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
      </div>

      <div className="relative pt-1">
        <div className="absolute w-full h-2 -mt-1 flex">
          <div className="w-1/4 bg-indigo-100/10" /> {/* Night */}
          <div className="w-1/4 bg-yellow-100/10" /> {/* Morning */}
          <div className="w-1/4 bg-orange-100/10" /> {/* Afternoon */}
          <div className="w-1/4 bg-blue-100/10" /> {/* Evening */}
        </div>
        <div className="absolute w-full flex justify-between text-xs text-muted-foreground -mt-6">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:59</span>
        </div>
        <Slider
          min={0}
          max={1439}
          step={15}
          value={[minutes]}
          onValueChange={handleSliderChange}
          className="z-10"
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
