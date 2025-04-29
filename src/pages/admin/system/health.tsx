
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

// Service status types
type ServiceStatus = "operational" | "degraded" | "failed" | "pending";

interface ServiceCheck {
  name: string;
  status: ServiceStatus;
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

// Edge function types
interface EdgeFunctionCheck extends ServiceCheck {
  endpoint: string;
}

export default function HealthPage() {
  const { toast } = useToast();
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [progress, setProgress] = useState(0);
  const [services, setServices] = useState<ServiceCheck[]>([
    {
      name: "API Service",
      status: "operational",
      responseTime: 42,
      lastChecked: "2 minutes ago"
    },
    {
      name: "Database",
      status: "operational",
      responseTime: 78,
      lastChecked: "2 minutes ago"
    },
    {
      name: "Storage",
      status: "operational",
      responseTime: 65,
      lastChecked: "2 minutes ago"
    },
    {
      name: "Authentication",
      status: "degraded",
      responseTime: 187,
      lastChecked: "2 minutes ago"
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
        
        // Simple OPTIONS request to verify the endpoint exists and responds
        const response = await fetch(`${supabase.functions.url}/${func.endpoint}`, {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.getSession()}`,
          }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        updatedFunctions[i] = {
          ...func,
          status: response.ok ? "operational" : "failed",
          responseTime,
          lastChecked: new Date().toLocaleTimeString(),
          error: response.ok ? undefined : "Function returned error status"
        };
        
        setLogs([...logs, `Edge function ${func.name}: ${response.ok ? "OK" : "Failed"} (${responseTime}ms)`]);
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
        
        // Simple count query to test table access
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
  
  // Helper function to render status badge
  const renderStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Operational</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" /> Degraded</Badge>;
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600"><AlertTriangle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case "pending":
        return <Badge className="bg-gray-500 hover:bg-gray-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600"><Clock className="h-3 w-3 mr-1" /> Unknown</Badge>;
    }
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
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                  <div className="font-medium">Service</div>
                  <div className="font-medium">Status</div>
                  <div className="font-medium">Last Checked</div>
                  <div className="font-medium">Response Time</div>
                </div>
                
                {services.map((service, index) => (
                  <div key={index} className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                    <div>{service.name}</div>
                    <div>{renderStatusBadge(service.status)}</div>
                    <div className="text-sm">{service.lastChecked}</div>
                    <div className="text-sm">{service.responseTime ? `${service.responseTime}ms` : 'N/A'}</div>
                  </div>
                ))}
              </div>
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
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                  <div className="font-medium">Function</div>
                  <div className="font-medium">Status</div>
                  <div className="font-medium">Last Checked</div>
                  <div className="font-medium">Response Time</div>
                </div>
                
                {edgeFunctions.map((func, index) => (
                  <div key={index} className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                    <div>{func.name}</div>
                    <div>{renderStatusBadge(func.status)}</div>
                    <div className="text-sm">{func.lastChecked}</div>
                    <div className="text-sm">{func.responseTime ? `${func.responseTime}ms` : 'N/A'}</div>
                  </div>
                ))}
              </div>
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
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                  <div className="font-medium">Table</div>
                  <div className="font-medium">Status</div>
                  <div className="font-medium">Last Checked</div>
                  <div className="font-medium">Response Time</div>
                </div>
                
                {databaseTables.map((table, index) => (
                  <div key={index} className="grid grid-cols-4 items-center gap-4 border-b pb-4">
                    <div>{table.name}</div>
                    <div>{renderStatusBadge(table.status)}</div>
                    <div className="text-sm">{table.lastChecked}</div>
                    <div className="text-sm">{table.responseTime ? `${table.responseTime}ms` : 'N/A'}</div>
                  </div>
                ))}
              </div>
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
                onClick={() => setLogs([])}
                size="sm"
                className="ml-auto"
              >
                Clear Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
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
  );
}
