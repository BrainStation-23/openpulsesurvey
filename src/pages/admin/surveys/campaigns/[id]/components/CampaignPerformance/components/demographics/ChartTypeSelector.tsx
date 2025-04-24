
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartTypeSelectorProps {
  value: "pie" | "bar";
  onValueChange: (value: "pie" | "bar") => void;
}

export function ChartTypeSelector({ value, onValueChange }: ChartTypeSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium">Chart Type:</span>
      <Select value={value} onValueChange={(value) => onValueChange(value as "pie" | "bar")}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select chart type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pie">Pie Chart</SelectItem>
          <SelectItem value="bar">Bar Chart</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
