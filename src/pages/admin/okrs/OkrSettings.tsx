
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { OkrRoleSettings } from "@/types/okr-settings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function OkrSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<OkrRoleSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, we would fetch from okr_role_settings table
        // For now, let's set placeholder data
        setTimeout(() => {
          setSettings({
            id: "1",
            can_create_objectives: [],
            can_create_org_objectives: [],
            can_create_dept_objectives: [],
            can_create_team_objectives: [], 
            can_create_key_results: [],
            can_create_alignments: [],
            can_align_with_org_objectives: [],
            can_align_with_dept_objectives: [],
            can_align_with_team_objectives: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setLoading(false);
        }, 1000);
      } catch (error: any) {
        console.error("Error fetching OKR settings:", error);
        setError(error.message);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Failed to load settings",
          description: "There was a problem loading the OKR role settings.",
        });
      }
    };

    fetchSettings();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Helmet>
        <title>OKR Settings | Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">OKR Role Settings</h1>
          <p className="text-muted-foreground">
            Configure which roles can perform different actions in the OKR system.
          </p>
        </div>

        <Tabs defaultValue="permissions">
          <TabsList>
            <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
            <TabsTrigger value="defaults">Default Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>OKR Role Permissions</CardTitle>
                <CardDescription>
                  Define which employee roles can create and manage objectives, key results, and alignments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  This is a placeholder for OKR role permission settings. 
                  The actual implementation will allow configuring which roles can create objectives,
                  key results, and create alignments between objectives.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="defaults">
            <Card>
              <CardHeader>
                <CardTitle>Default OKR Settings</CardTitle>
                <CardDescription>
                  Configure system-wide default settings for OKRs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is a placeholder for default OKR settings.
                  The actual implementation will include options for default visibility,
                  approval requirements, and other system-wide settings.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
