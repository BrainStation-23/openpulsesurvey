
import React from "react";
import { HealthStatusList } from "./HealthStatusList";
import { DbFunctionCheck } from "@/pages/admin/system/health";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

interface DbFunctionCategoryProps {
  category: string;
  functions: DbFunctionCheck[];
  onTestCategory: (category: string) => void;
  isRunningTests: boolean;
}

export function DbFunctionCategory({ 
  category, 
  functions, 
  onTestCategory,
  isRunningTests
}: DbFunctionCategoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{category}</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onTestCategory(category)}
          disabled={isRunningTests}
        >
          <PlayIcon className="h-4 w-4 mr-2" />
          Test Category
        </Button>
      </div>
      <HealthStatusList items={functions} />
    </div>
  );
}
