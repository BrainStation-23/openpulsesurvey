
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { Clock, Sun, Moon } from "lucide-react";

interface TimeSliderProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

export function TimeSlider({ value, onChange, className }: TimeSliderProps) {
  // Convert HH:mm to minutes since midnight (0-1440)
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes back to HH:mm format
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const minutes = timeToMinutes(value);

  const handleSliderChange = (newValue: number[]) => {
    onChange(minutesToTime(newValue[0]));
  };

  const getTimeLabel = (minutes: number): string => {
    const time = minutesToTime(minutes);
    const hour = Math.floor(minutes / 60);
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${time.split(":")[1]} ${period}`;
  };

  const getTimeIcon = () => {
    const hour = Math.floor(minutes / 60);
    if (hour >= 6 && hour < 18) {
      return <Sun className="h-4 w-4 text-yellow-500" />;
    }
    return <Moon className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Time</span>
        </div>
        <div className="flex items-center gap-2">
          {getTimeIcon()}
          <span className="text-sm">{getTimeLabel(minutes)}</span>
        </div>
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center"
        value={[minutes]}
        max={1439}
        step={15}
        onValueChange={handleSliderChange}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-4 w-4 rounded-full border border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Root>
      <div className="flex justify-between px-1">
        <span className="text-xs text-muted-foreground">12:00 AM</span>
        <span className="text-xs text-muted-foreground">12:00 PM</span>
        <span className="text-xs text-muted-foreground">11:59 PM</span>
      </div>
    </div>
  );
}
