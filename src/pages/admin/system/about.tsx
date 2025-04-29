
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">About the System</h1>
        <p className="text-muted-foreground">Information about the application and its components</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Info className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Application details and version information</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium">Application:</span>
              <span>Employee Feedback Platform</span>
              
              <span className="font-medium">Version:</span>
              <span>1.0.0</span>
              
              <span className="font-medium">Last Updated:</span>
              <span>April 29, 2025</span>
              
              <span className="font-medium">Build:</span>
              <span>#20250429-1</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technologies</CardTitle>
            <CardDescription>Core libraries and technologies used</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>React 18 for UI components</li>
              <li>TypeScript for type safety</li>
              <li>Tailwind CSS for styling</li>
              <li>Shadcn/UI for component library</li>
              <li>Supabase for backend services</li>
              <li>React Query for data fetching</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
