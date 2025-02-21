
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComparisonDimension } from "../ReportsTab/types/comparison";

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
        <SelectItem value="sbu">Compare by Department</SelectItem>
        <SelectItem value="gender">Compare by Gender</SelectItem>
        <SelectItem value="location">Compare by Location</SelectItem>
        <SelectItem value="employment_type">Compare by Employment Type</SelectItem>
        <SelectItem value="level">Compare by Level</SelectItem>
        <SelectItem value="employee_type">Compare by Employee Type</SelectItem>
        <SelectItem value="employee_role">Compare by Role</SelectItem>
      </SelectContent>
    </Select>
  );
}
