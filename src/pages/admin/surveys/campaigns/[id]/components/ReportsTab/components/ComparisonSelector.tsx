
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComparisonDimension } from "../../PresentationView/types/comparison";
import { 
  Building2, 
  Users, 
  MapPin, 
  Briefcase, 
  LucideIcon,
  GraduationCap,
  UserSquare,
  UserCog,
  Users2,
  Ban
} from "lucide-react";

interface ComparisonSelectorProps {
  value: ComparisonDimension;
  onChange: (value: ComparisonDimension) => void;
  questionType?: string;
  rateCount?: number;
}

type ComparisonOption = {
  value: ComparisonDimension;
  label: string;
  icon: LucideIcon;
  showFor?: string[];
}

export function ComparisonSelector({ 
  value, 
  onChange, 
  questionType, 
  rateCount 
}: ComparisonSelectorProps) {
  const isSatisfaction = questionType === 'rating' && rateCount === 5;
  
  const comparisonOptions: ComparisonOption[] = [
    { value: "none", label: "No comparison", icon: Ban },
    { value: "sbu", label: "SBU", icon: Building2 },
    { value: "gender", label: "Gender", icon: Users },
    { value: "location", label: "Location", icon: MapPin },
    { value: "employment_type", label: "Employment Type", icon: Briefcase },
    { value: "level", label: "Level", icon: GraduationCap },
    { value: "employee_type", label: "Employee Type", icon: UserSquare },
    { value: "employee_role", label: "Employee Role", icon: UserCog },
    { value: "supervisor", label: "Supervisor", icon: Users2, showFor: ['satisfaction'] },
  ];

  // Filter options based on question type
  const filteredOptions = comparisonOptions.filter(option => {
    if (option.showFor) {
      if (option.value === 'supervisor' && !isSatisfaction) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Compare by:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select comparison" />
        </SelectTrigger>
        <SelectContent>
          {filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
