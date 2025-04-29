
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

interface LogsPanelProps {
  logs: string[];
  onClearLogs: () => void;
}

export function LogsPanel({ logs, onClearLogs }: LogsPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>Test execution logs and error messages</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No logs available. Run tests to generate logs.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-muted-foreground mr-2">[{new Date().toLocaleTimeString()}]</span>
                <span>{log}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={onClearLogs}
          size="sm"
          className="ml-auto"
        >
          Clear Logs
        </Button>
      </CardFooter>
    </Card>
  );
}
