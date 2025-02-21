
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ComparisonDimension = "none" | "gender" | "location" | "employment_type";

interface ComparisonSelectorProps {
  value: ComparisonDimension;
  onChange: (value: ComparisonDimension) => void;
}

export function ComparisonSelector({ value, onChange }: ComparisonSelectorProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as ComparisonDimension)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Compare by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No Comparison</SelectItem>
        <SelectItem value="gender">Compare by Gender</SelectItem>
        <SelectItem value="location">Compare by Location</SelectItem>
        <SelectItem value="employment_type">Compare by Employment Type</SelectItem>
      </SelectContent>
    </Select>
  );
}
