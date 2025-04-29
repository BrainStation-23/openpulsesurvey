
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DbFunctionCheck } from "@/pages/admin/system/health";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DatabaseFunctionDetailsProps {
  functionData: DbFunctionCheck;
}

export function DatabaseFunctionDetails({ functionData }: DatabaseFunctionDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mt-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-between"
        onClick={toggleExpanded}
      >
        Function Details
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {isExpanded && (
        <Card className="mt-2">
          <CardContent className="p-4 text-sm">
            <div className="grid gap-2">
              <div>
                <span className="font-medium">Function Name:</span> {functionData.functionName}
              </div>
              
              {functionData.schema && (
                <div>
                  <span className="font-medium">Schema:</span> {functionData.schema}
                </div>
              )}
              
              {functionData.responseTime && (
                <div>
                  <span className="font-medium">Response Time:</span> {functionData.responseTime}ms
                </div>
              )}
              
              {functionData.error && (
                <div>
                  <span className="font-medium text-red-500">Error:</span> 
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs mt-1 overflow-auto">
                    {functionData.error}
                  </pre>
                </div>
              )}
              
              {functionData.parameters && (
                <div>
                  <span className="font-medium">Test Parameters:</span>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs mt-1 overflow-auto">
                    {JSON.stringify(functionData.parameters, null, 2)}
                  </pre>
                </div>
              )}
              
              {functionData.result && (
                <div>
                  <span className="font-medium">Result:</span>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs mt-1 overflow-auto max-h-40">
                    {JSON.stringify(functionData.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
