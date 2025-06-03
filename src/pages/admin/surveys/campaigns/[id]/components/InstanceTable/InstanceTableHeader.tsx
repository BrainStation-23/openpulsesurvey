
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstanceTableHeaderProps {
  onAdd: () => void;
}

export function InstanceTableHeader({ onAdd }: InstanceTableHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Campaign Instances</h3>
      
      <Button 
        onClick={onAdd} 
        className="bg-primary text-primary-foreground flex items-center gap-1"
      >
        <Plus className="h-4 w-4" /> Add Instance
      </Button>
    </div>
  );
}
