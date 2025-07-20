import React from "react";
import { Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IssueBoardPermission } from "../types";

interface RuleSettingsSectionProps {
  permission: Partial<IssueBoardPermission>;
  index: number;
  updatePermission: (index: number, field: keyof IssueBoardPermission, value: any) => void;
}

export function RuleSettingsSection({
  permission,
  index,
  updatePermission
}: RuleSettingsSectionProps) {
  return (
    <div>
      <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Rule Settings
      </h4>
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`rule_name_${index}`} className="text-sm font-medium">
              Rule Name
            </Label>
            <Input
              id={`rule_name_${index}`}
              value={permission.rule_name || ''}
              onChange={(e) => updatePermission(index, 'rule_name', e.target.value)}
              placeholder={`Rule ${index + 1}`}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`rule_type_${index}`} className="text-sm font-medium">
              Rule Type
            </Label>
            <Select
              value={permission.rule_type || 'include'}
              onValueChange={(value) => updatePermission(index, 'rule_type', value)}
            >
              <SelectTrigger id={`rule_type_${index}`} className="text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="include">Include - Grant Access</SelectItem>
                <SelectItem value="exclude">Exclude - Deny Access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`priority_${index}`} className="text-sm font-medium">
              Priority (0-1000)
            </Label>
            <Input
              id={`priority_${index}`}
              type="number"
              min={0}
              max={1000}
              value={permission.priority || 100}
              onChange={(e) => updatePermission(index, 'priority', parseInt(e.target.value) || 100)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id={`is_active_${index}`}
                checked={permission.is_active ?? true}
                onCheckedChange={(checked) => updatePermission(index, 'is_active', checked)}
              />
              <label
                htmlFor={`is_active_${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Rule is Active
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}