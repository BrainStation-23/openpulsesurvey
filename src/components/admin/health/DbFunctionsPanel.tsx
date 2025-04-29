
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Database } from "lucide-react";
import { DbFunctionCheck } from "@/pages/admin/system/health";
import { DbFunctionCategory } from "./DbFunctionCategory";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface DbFunctionsPanelProps {
  functions: DbFunctionCheck[];
  onTestCategory: (category: string) => void;
  isRunningTests: boolean;
}

export function DbFunctionsPanel({ 
  functions, 
  onTestCategory,
  isRunningTests 
}: DbFunctionsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Group functions by category
  const getGroupedDbFunctions = () => {
    const filtered = searchTerm 
      ? functions.filter(func => 
          func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          func.functionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (func.category && func.category.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : functions;
      
    const grouped: { [key: string]: DbFunctionCheck[] } = {};
    
    filtered.forEach(func => {
      const category = func.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(func);
    });
    
    return grouped;
  };

  const groupedFunctions = getGroupedDbFunctions();
  const hasFailedFunctions = functions.some(func => func.status === "failed");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <CardTitle>Database Functions</CardTitle>
          <CardDescription>Status of Supabase database functions</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search functions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="space-y-6">
          {Object.entries(groupedFunctions).length > 0 ? (
            Object.entries(groupedFunctions).map(([category, funcs], index, array) => (
              <React.Fragment key={category}>
                <DbFunctionCategory 
                  category={category} 
                  functions={funcs} 
                  onTestCategory={onTestCategory}
                  isRunningTests={isRunningTests}
                />
                {index < array.length - 1 && <Separator className="my-4" />}
              </React.Fragment>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No functions match your search criteria</p>
            </div>
          )}
        </div>
      </CardContent>
      {hasFailedFunctions && (
        <CardFooter>
          <Alert variant="destructive" className="mt-4 w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Database Function Errors</AlertTitle>
            <AlertDescription>
              Some database functions are not responding correctly. Check the logs for details.
            </AlertDescription>
          </Alert>
        </CardFooter>
      )}
    </Card>
  );
}
