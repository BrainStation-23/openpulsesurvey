
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Settings } from "lucide-react";
import { RolePermissionsList } from "@/components/okr/settings/RolePermissionsList";
import { useOkrRoles } from "@/hooks/okr/useOkrRoles";
import { DefaultSettingsForm } from "@/components/okr/settings/DefaultSettingsForm";

export default function OkrSettingsPage() {
  const { settings, loading, error } = useOkrRoles();
  const { toast } = useToast();
  
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
        <AlertDescription>{error.message}</AlertDescription>
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
                <RolePermissionsList settings={settings} loading={loading} />
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
                <DefaultSettingsForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
