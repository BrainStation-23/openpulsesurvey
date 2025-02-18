
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

// Group icons by categories for better organization
const iconCategories = {
  achievement: ["Trophy", "Award", "Star", "Medal", "Badge", "Crown", "Shield", "Target", "Flag"],
  status: ["CheckCircle", "Circle", "Heart", "ThumbsUp", "Smile", "Zap", "Sparkles"],
  general: Object.keys(icons).filter(icon => 
    !["Trophy", "Award", "Star", "Medal", "Badge", "Crown", "Shield", "Target", "Flag", 
      "CheckCircle", "Circle", "Heart", "ThumbsUp", "Smile", "Zap", "Sparkles"].includes(icon)
  )
};

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("achievement");
  const [open, setOpen] = useState(false);

  const IconComponent = (icons[value as keyof typeof icons] as LucideIcon) || icons.Trophy;

  const getFilteredIcons = (categoryIcons: string[]) => {
    return categoryIcons.filter(icon => 
      icon.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 gap-2">
          {IconComponent && <IconComponent className="w-5 h-5" />}
          <span className="text-sm">{value}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Select an Icon</DialogTitle>
        <div className="flex items-center border rounded-md px-3 mb-4">
          <Search className="w-4 h-4 mr-2 opacity-50" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
        </div>
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
                  {getFilteredIcons(categoryIcons).map((iconName) => {
                    const IconComponent = icons[iconName as keyof typeof icons] as LucideIcon;
                    return IconComponent ? (
                      <TooltipProvider key={iconName}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 w-10 p-2"
                              onClick={() => {
                                onChange(iconName);
                                setOpen(false);
                              }}
                            >
                              <IconComponent className="w-full h-full" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{iconName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : null;
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
