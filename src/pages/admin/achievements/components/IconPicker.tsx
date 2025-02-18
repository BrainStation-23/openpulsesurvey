
import { useState } from "react";
import * as icons from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const achievementIcons = [
  "Trophy", "Award", "Star", "Medal", "Badge", "Flag", "Gift", "Gem", "Ribbon", "Target",
  "Crown", "Shield", "Heart", "Circle", "Sun", "Sparkles", "Zap", "Flame"
] as const;

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredIcons = achievementIcons.filter(icon => 
    icon.toLowerCase().includes(search.toLowerCase())
  );

  const LucideIcon = icons[value as keyof typeof icons] || icons.Trophy;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-20 gap-2">
          <LucideIcon className="w-8 h-8" />
          <span className="text-xs">{value}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
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
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.map((iconName) => {
              const Icon = icons[iconName as keyof typeof icons];
              return (
                <Button
                  key={iconName}
                  variant="outline"
                  className="h-12 p-2"
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                >
                  <Icon className="w-full h-full" />
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
