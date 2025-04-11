
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Settings, FileText } from "lucide-react";

export default function EmailConfigPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Configuration</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="settings">SMTP Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Templates</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Create and manage reusable email templates with variable support
                </p>
                <Button 
                  className="w-full mt-4"
                  onClick={() => navigate("/admin/config/email/templates")}
                >
                  Manage Templates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMTP Configuration</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Settings</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Configure SMTP settings for sending emails from the platform
                </p>
                <Button 
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => setActiveTab("settings")}
                >
                  Email Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Testing</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Test Emails</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Send test emails to verify your configuration is working properly
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Send Test Email
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started with Email Templates</CardTitle>
              <CardDescription>
                Learn how to create and use email templates in your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">1. Create Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Start by creating reusable email templates with HTML content and variable placeholders.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">2. Define Variables</h3>
                <p className="text-sm text-muted-foreground">
                  Use variables like {"{{{user_first_name}}}"} that will be replaced with actual values when sending emails.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">3. Test Your Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Preview your templates with sample data to ensure they look correct before sending.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">4. Use in Your Application</h3>
                <p className="text-sm text-muted-foreground">
                  Integrate templates with your email sending logic using our API endpoints.
                </p>
              </div>
              
              <Button onClick={() => navigate("/admin/config/email/templates")} className="mt-2">
                Go to Templates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Create and manage reusable email templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/admin/config/email/templates")}>
                Manage Templates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Settings</CardTitle>
              <CardDescription>
                Configure your email delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">SMTP configuration is coming soon.</p>
              <Button variant="outline" onClick={() => setActiveTab("overview")}>
                Back to Overview
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
