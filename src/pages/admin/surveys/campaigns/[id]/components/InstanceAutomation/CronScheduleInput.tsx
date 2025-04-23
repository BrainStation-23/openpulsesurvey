
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CronScheduleInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

// Common cron schedule presets
const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every 30 minutes", value: "*/30 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every 2 hours", value: "0 */2 * * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
  { label: "Every 12 hours", value: "0 */12 * * *" },
  { label: "Once a day (midnight)", value: "0 0 * * *" },
  { label: "Once a day (noon)", value: "0 12 * * *" },
  { label: "Custom", value: "custom" }
];

export const CronScheduleInput: React.FC<CronScheduleInputProps> = ({ 
  value, 
  onChange,
  onBlur,
  disabled = false
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("custom");
  
  // Initialize selected preset when component mounts
  useEffect(() => {
    const preset = PRESETS.find(p => p.value === value);
    if (preset) {
      setSelectedPreset(preset.value);
      setIsCustom(false);
    } else {
      setSelectedPreset("custom");
      setIsCustom(true);
    }
  }, [value]);

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue);
    if (presetValue === "custom") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      onChange(presetValue);
    }
  };

  return (
    <div className="space-y-2">
      <Select 
        value={selectedPreset} 
        onValueChange={handlePresetChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select schedule" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {isCustom && (
        <div className="space-y-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="e.g., 0 * * * *"
            disabled={disabled}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Format: minute hour day month day_of_week
          </p>
        </div>
      )}
    </div>
  );
};
