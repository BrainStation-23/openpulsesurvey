
import { useState } from "react";
import * as icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Achievement-specific colors
const iconColors = {
  primary: "#8B5CF6", // Vivid Purple
  secondary: "#D946EF", // Magenta Pink
  warning: "#F97316", // Bright Orange
  info: "#0EA5E9", // Ocean Blue
  success: "#10B981", // Emerald Green
  default: "#6B7280", // Gray
};

// Achievement-specific icons
const achievementIcons = [
  "Trophy",
  "Award", 
  "Star",
  "Medal",
  "Badge",
  "Crown",
  "Shield",
  "Target",
  "Flag"
];

const statusIcons = [
  "CheckCircle",
  "Circle",
  "Heart",
  "ThumbsUp",
  "Smile",
  "Zap",
];

const generalIcons = [
  "Activity",
  "AlertCircle",
  "ArrowRight",
  "ArrowLeft",
  "Bell",
  "Book",
  "Calendar",
  "Check",
  "Clock",
  "Edit",
  "File",
  "Folder",
  "Globe",
  "Home",
  "Info",
  "Mail",
  "MessageSquare",
  "Phone",
  "Plus",
  "Settings",
  "User",
];

const iconCategories = {
  achievement: achievementIcons,
  status: statusIcons,
  general: generalIcons
};

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
  color?: string;
  onColorChange?: (color: string) => void;
};

export function IconPicker({ value, onChange, color = "#8B5CF6", onColorChange }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("achievement");
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(color);

  const getIconComponent = (iconName: string): LucideIcon => {
    const IconComponent = icons[iconName as keyof typeof icons] as LucideIcon;
    return IconComponent || icons.Trophy;
  };

  const IconComponent = getIconComponent(value);

  const getFilteredIcons = (categoryIcons: string[]) => {
    return categoryIcons.filter(icon => 
      icon.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleColorSelect = (newColor: string) => {
    setSelectedColor(newColor);
    onColorChange?.(newColor);
  };

  const renderIcon = (iconName: string) => {
    try {
      const IconComponent = getIconComponent(iconName);
      if (!IconComponent) return null;

      return (
        <TooltipProvider key={iconName}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => {
                  onChange(iconName);
                  setOpen(false);
                }}
              >
                <IconComponent className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{iconName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } catch (error) {
      console.error(`Error rendering icon ${iconName}:`, error);
      return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-10 w-10 flex items-center justify-center"
        >
          {IconComponent && <IconComponent className="w-6 h-6" style={{ color: selectedColor }} />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Select an Icon</DialogTitle>
        
        <div className="space-y-4">
          {/* Color Selection */}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Color:</span>
            <div className="flex gap-2">
              {Object.entries(iconColors).map(([name, colorValue]) => (
                <TooltipProvider key={name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleColorSelect(colorValue)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          selectedColor === colorValue ? 'border-ring' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: colorValue }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="capitalize">{name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center border rounded-md px-3">
            <Search className="w-4 h-4 mr-2 opacity-50" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>

          {/* Icon Categories */}
          <Tabs defaultValue="achievement" value={category} onValueChange={setCategory}>
            <TabsList className="mb-4">
              <TabsTrigger value="achievement">Achievement</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
            {Object.entries(iconCategories).map(([cat, categoryIcons]) => (
              <TabsContent key={cat} value={cat}>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="grid grid-cols-8 gap-2">
                    {getFilteredIcons(categoryIcons).map((iconName) => renderIcon(iconName))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
