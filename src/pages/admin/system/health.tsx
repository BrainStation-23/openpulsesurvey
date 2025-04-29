
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, AlertTriangle, Clock, Database, Server, Globe, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { HealthStatusList } from "@/components/admin/health/HealthStatusList";
import { StatusBadge } from "@/components/admin/health/StatusBadge";
import { LogsPanel } from "@/components/admin/health/LogsPanel";

// Service status types
export type ServiceStatus = "operational" | "degraded" | "failed" | "pending";

export interface ServiceCheck {
  name: string;
  status: ServiceStatus;
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

// Edge function types
export interface EdgeFunctionCheck extends ServiceCheck {
  endpoint: string;
}

export default function HealthPage() {
  const { toast } = useToast();
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [progress, setProgress] = useState(0);
  const [services, setServices] = useState<ServiceCheck[]>([
    {
      name: "API Service",
      status: "pending",
      lastChecked: "Never"
    },
    {
      name: "Database",
      status: "pending",
      lastChecked: "Never"
    },
    {
      name: "Storage",
      status: "pending",
      lastChecked: "Never"
    },
    {
      name: "Authentication",
      status: "pending",
      lastChecked: "Never"
    }
  ]);
  
  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunctionCheck[]>([
    {
      name: "Create User",
      status: "pending",
      endpoint: "create-user",
      lastChecked: "Never"
    },
    {
      name: "Delete User",
      status: "pending",
      endpoint: "delete-user",
      lastChecked: "Never"
    },
    {
      name: "Toggle User Status",
      status: "pending",
      endpoint: "toggle-user-status",
      lastChecked: "Never"
    },
    {
      name: "Update User Password",
      status: "pending",
      endpoint: "update-user-password",
      lastChecked: "Never"
    },
    {
      name: "Test Email Config",
      status: "pending",
      endpoint: "test-email-config",
      lastChecked: "Never"
    },
    {
      name: "Export All Users",
      status: "pending",
      endpoint: "export_all_users",
      lastChecked: "Never"
    }
  ]);
  
  const [databaseTables, setDatabaseTables] = useState<ServiceCheck[]>([
    {
      name: "Users",
      status: "pending",
      lastChecked: "Never"
    },
    {
      name: "Profiles",
      status: "pending",
      lastChecked: "Never"
    },
    {
      name: "Surveys",
      status: "pending",
      lastChecked: "Never"
    },
    {
      name: "Campaigns",
      status: "pending",
      lastChecked: "Never"
    }
  ]);
  
  const [logs, setLogs] = useState<string[]>([]);

  // Function to run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setProgress(0);
    setLogs([...logs, "Starting system health check..."]);
    
    try {
      // Test database connectivity first
      await testDatabaseTables();
      setProgress(30);
      
      // Test edge functions
      await testEdgeFunctions();
      setProgress(60);
      
      // Test services
      await testServices();
      setProgress(100);
      
      toast({
        title: "Health Check Complete",
        description: "All system health checks have completed.",
        variant: "default",
      });
      
      setLogs([...logs, "All tests completed successfully"]);
    } catch (error) {
      console.error("Error running tests:", error);
      setLogs([...logs, `Error during tests: ${error.message}`]);
      
      toast({
        title: "Health Check Failed",
        description: "Some tests failed. Check the logs for details.",
        variant: "destructive",
      });
    } finally {
      setIsRunningTests(false);
    }
  };
  
  // Test edge functions
  const testEdgeFunctions = async () => {
    let updatedFunctions = [...edgeFunctions];
    setLogs([...logs, "Testing edge functions..."]);
    
    for (let i = 0; i < updatedFunctions.length; i++) {
      const func = updatedFunctions[i];
      const startTime = Date.now();
      
      try {
        setLogs([...logs, `Testing edge function: ${func.name}...`]);
        
        // Use the invoke method to test the edge function exists
        const { data, error } = await supabase.functions.invoke(func.endpoint, {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        updatedFunctions[i] = {
          ...func,
          status: error ? "failed" : "operational",
          responseTime,
          lastChecked: new Date().toLocaleTimeString(),
          error: error ? error.message : undefined
        };
        
        setLogs([...logs, `Edge function ${func.name}: ${error ? "Failed" : "OK"} (${responseTime}ms)`]);
      } catch (error) {
        updatedFunctions[i] = {
          ...func,
          status: "failed",
          lastChecked: new Date().toLocaleTimeString(),
          error: error.message
        };
        
        setLogs([...logs, `Edge function ${func.name}: Error - ${error.message}`]);
      }
      
      // Update state after each test to show progress
      setEdgeFunctions(updatedFunctions);
    }
  };
  
  // Test database tables
  const testDatabaseTables = async () => {
    let updatedTables = [...databaseTables];
    setLogs([...logs, "Testing database tables..."]);
    
    for (let i = 0; i < updatedTables.length; i++) {
      const table = updatedTables[i];
      const startTime = Date.now();
      
      try {
        setLogs([...logs, `Testing table: ${table.name}...`]);
        
        // Map the display name to the actual table name
        let queryTable;
        
        // Map the display name to the actual table name
        switch (table.name) {
          case "Users":
            queryTable = "auth.users";
            break;
          case "Profiles":
            queryTable = "profiles";
            break;
          case "Surveys":
            queryTable = "surveys";
            break;
          case "Campaigns":
            queryTable = "campaigns";
            break;
          default:
            queryTable = table.name.toLowerCase();
        }
        
        const { count, error } = await supabase
          .from(queryTable)
          .select('*', { count: 'exact', head: true });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        updatedTables[i] = {
          ...table,
          status: error ? "failed" : "operational",
          responseTime,
          lastChecked: new Date().toLocaleTimeString(),
          error: error ? error.message : undefined
        };
        
        setLogs([...logs, `Table ${table.name}: ${error ? "Failed" : "OK"} (${responseTime}ms)`]);
      } catch (error) {
        updatedTables[i] = {
          ...table,
          status: "failed",
          lastChecked: new Date().toLocaleTimeString(),
          error: error.message
        };
        
        setLogs([...logs, `Table ${table.name}: Error - ${error.message}`]);
      }
      
      // Update state after each test to show progress
      setDatabaseTables(updatedTables);
    }
  };
  
  // Test core services
  const testServices = async () => {
    let updatedServices = [...services];
    setLogs([...logs, "Testing core services..."]);
    
    // Test API service (Supabase REST API)
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      updatedServices[0] = {
        ...updatedServices[0],
        status: error ? "failed" : "operational",
        responseTime,
        lastChecked: new Date().toLocaleTimeString(),
        error: error ? error.message : undefined
      };
      
      setLogs([...logs, `API Service: ${error ? "Failed" : "OK"} (${responseTime}ms)`]);
    } catch (error) {
      updatedServices[0] = {
        ...updatedServices[0],
        status: "failed",
        lastChecked: new Date().toLocaleTimeString(),
        error: error.message
      };
      
      setLogs([...logs, `API Service: Error - ${error.message}`]);
    }
    
    // Test Database service (already tested in table tests, but updating timestamp)
    updatedServices[1] = {
      ...updatedServices[1],
      lastChecked: new Date().toLocaleTimeString()
    };
    
    // Test Storage service
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.storage.listBuckets();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      updatedServices[2] = {
        ...updatedServices[2],
        status: error ? "failed" : "operational",
        responseTime,
        lastChecked: new Date().toLocaleTimeString(),
        error: error ? error.message : undefined
      };
      
      setLogs([...logs, `Storage Service: ${error ? "Failed" : "OK"} (${responseTime}ms)`]);
    } catch (error) {
      updatedServices[2] = {
        ...updatedServices[2],
        status: "failed",
        lastChecked: new Date().toLocaleTimeString(),
        error: error.message
      };
      
      setLogs([...logs, `Storage Service: Error - ${error.message}`]);
    }
    
    // Test Authentication service
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      updatedServices[3] = {
        ...updatedServices[3],
        status: error ? "failed" : "operational",
        responseTime,
        lastChecked: new Date().toLocaleTimeString(),
        error: error ? error.message : undefined
      };
      
      setLogs([...logs, `Authentication Service: ${error ? "Failed" : "OK"} (${responseTime}ms)`]);
    } catch (error) {
      updatedServices[3] = {
        ...updatedServices[3],
        status: "failed",
        lastChecked: new Date().toLocaleTimeString(),
        error: error.message
      };
      
      setLogs([...logs, `Authentication Service: Error - ${error.message}`]);
    }
    
    // Update state
    setServices(updatedServices);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground">Monitor the health and status of system components</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Button 
          onClick={runAllTests} 
          disabled={isRunningTests}
          className="bg-primary text-white"
        >
          {isRunningTests ? "Running Tests..." : "Run All Tests"}
        </Button>
        
        {isRunningTests && (
          <div className="w-64">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Running health checks ({progress}%)</p>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="services">Core Services</TabsTrigger>
          <TabsTrigger value="edge-functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Server className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Core Services</CardTitle>
                <CardDescription>Status of essential system components</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <HealthStatusList items={services} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edge-functions">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <FileCode className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Edge Functions</CardTitle>
                <CardDescription>Status of Supabase edge functions</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <HealthStatusList items={edgeFunctions} />
            </CardContent>
            {edgeFunctions.some(func => func.status === "failed") && (
              <CardFooter>
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Edge Function Errors</AlertTitle>
                  <AlertDescription>
                    Some edge functions are not responding correctly. Check the logs for details.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="database">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Database Tables</CardTitle>
                <CardDescription>Status of critical database tables</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <HealthStatusList items={databaseTables} />
            </CardContent>
            {databaseTables.some(table => table.status === "failed") && (
              <CardFooter>
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Database Table Errors</AlertTitle>
                  <AlertDescription>
                    Some database tables are not responding correctly. Check the logs for details.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <LogsPanel logs={logs} onClearLogs={() => setLogs([])} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
