
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComparisonDimension } from "../types/comparison";
import { Building, Briefcase, Users, MapPin, GraduationCap, User, UserCog } from "lucide-react";

interface ComparisonSelectorProps {
  value: ComparisonDimension;
  onChange: (value: ComparisonDimension) => void;
}

export function ComparisonSelector({ value, onChange }: ComparisonSelectorProps) {
  return (
    <Select value={value} onValueChange={(value) => onChange(value as ComparisonDimension)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Compare by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No Comparison</SelectItem>
        <SelectItem value="sbu">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>By Department</span>
          </div>
        </SelectItem>
        <SelectItem value="gender">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>By Gender</span>
          </div>
        </SelectItem>
        <SelectItem value="location">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>By Location</span>
          </div>
        </SelectItem>
        <SelectItem value="employment_type">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>By Employment Type</span>
          </div>
        </SelectItem>
        <SelectItem value="level">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>By Level</span>
          </div>
        </SelectItem>
        <SelectItem value="employee_type">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>By Employee Type</span>
          </div>
        </SelectItem>
        <SelectItem value="employee_role">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>By Role</span>
          </div>
        </SelectItem>
        <SelectItem value="supervisor">
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span>By Supervisor</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
