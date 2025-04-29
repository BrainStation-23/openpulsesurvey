
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HealthPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground">Monitor the health and status of system components</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current status of all system components</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                <div className="font-medium">Component</div>
                <div className="font-medium">Status</div>
                <div className="font-medium">Last Checked</div>
                <div className="font-medium">Response Time</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                <div>API Service</div>
                <div><Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Operational</Badge></div>
                <div className="text-sm">2 minutes ago</div>
                <div className="text-sm">42ms</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                <div>Database</div>
                <div><Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Operational</Badge></div>
                <div className="text-sm">2 minutes ago</div>
                <div className="text-sm">78ms</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                <div>Storage</div>
                <div><Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Operational</Badge></div>
                <div className="text-sm">2 minutes ago</div>
                <div className="text-sm">65ms</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div>Authentication</div>
                <div><Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" /> Degraded</Badge></div>
                <div className="text-sm">2 minutes ago</div>
                <div className="text-sm">187ms</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>Performance metrics for the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24%</div>
                  <p className="text-xs text-muted-foreground">Average over 24h</p>
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: "24%" }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42%</div>
                  <p className="text-xs text-muted-foreground">Average over 24h</p>
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Disk Space</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">58%</div>
                  <p className="text-xs text-muted-foreground">Used space</p>
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: "58%" }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
