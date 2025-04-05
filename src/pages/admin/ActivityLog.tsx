
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Clock, User, Award, FileText, ShieldAlert, History, Filter, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActivityLog } from "@/hooks/useActivityLog";

export default function AdminActivityLog() {
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState({
    userId: "",
    activityType: "all",
    period: "30",
    searchTerm: "",
  });

  const { 
    activityLogs, 
    isLoading, 
    activityTypes,
    periodOptions,
    userList
  } = useActivityLog({
    userId: filter.userId !== "" ? filter.userId : undefined,
    activityType: filter.activityType !== "all" ? filter.activityType : undefined,
    period: parseInt(filter.period),
    searchTerm: filter.searchTerm,
    isAdminView: true
  });

  // Render activity badge with appropriate styling based on activity type
  const renderActivityBadge = (type: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let icon = null;
    
    if (type.includes("login") || type.includes("auth")) {
      variant = "secondary";
      icon = <User className="h-3 w-3 mr-1" />;
    } else if (type.includes("survey")) {
      variant = "default";
      icon = <FileText className="h-3 w-3 mr-1" />;
    } else if (type.includes("achievement")) {
      variant = "outline";
      icon = <Award className="h-3 w-3 mr-1" />;
    } else if (type.includes("security")) {
      variant = "destructive";
      icon = <ShieldAlert className="h-3 w-3 mr-1" />;
    }
    
    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {type}
      </Badge>
    );
  };

  const handleExportData = () => {
    // Create CSV data from activity logs
    const headers = ["Timestamp", "User", "Activity Type", "Description", "IP Address", "Additional Data"];
    const csvRows = [
      headers.join(","),
      ...activityLogs.map(log => {
        const timestamp = format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss");
        const user = log.user_details?.email || log.user_id;
        const activityType = log.activity_type;
        const description = log.description.replace(/,/g, ";"); // Replace commas to avoid CSV issues
        const ipAddress = log.ip_address;
        const additionalData = JSON.stringify(log.metadata || {}).replace(/,/g, ";");
        
        return [timestamp, user, activityType, description, ipAddress, additionalData].join(",");
      })
    ];
    
    // Generate CSV file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Create download link and click it
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `activity_logs_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Activity Logs</h1>
          <p className="text-muted-foreground">
            Track user activity and system events across the platform.
          </p>
        </div>
        <Button onClick={handleExportData} className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" /> Activity Dashboard
          </CardTitle>
          <CardDescription>
            Monitor all user activities and system events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex flex-wrap justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All Activity</TabsTrigger>
                <TabsTrigger value="auth">Authentication</TabsTrigger>
                <TabsTrigger value="surveys">Surveys</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <div className="mt-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1 mb-4">
                  <Filter className="h-4 w-4" /> Advanced Filters
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Input
                placeholder="Search activities..."
                value={filter.searchTerm}
                onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                className="w-full sm:w-40 md:w-60"
              />
              
              <Select
                value={filter.userId}
                onValueChange={(value) => setFilter({ ...filter, userId: value })}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Users</SelectItem>
                  {userList.map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.email || user.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filter.activityType}
                onValueChange={(value) => setFilter({ ...filter, activityType: value })}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {activityTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={filter.period}
                onValueChange={(value) => setFilter({ ...filter, period: value })}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Activity Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        </TableRow>
                      ))
                    ) : activityLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No activity records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                          </TableCell>
                          <TableCell>
                            {log.user_details?.email || 
                             log.user_details?.full_name || 
                             log.user_id.substring(0, 8)}
                          </TableCell>
                          <TableCell>{renderActivityBadge(log.activity_type)}</TableCell>
                          <TableCell>{log.description}</TableCell>
                          <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Additional tab contents similar to the user view but with more details */}
            <TabsContent value="auth" className="space-y-4">
              {/* Authentication-related activities */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Device / Browser</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(3).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      activityLogs
                        .filter(log => log.activity_type.includes('auth') || log.activity_type.includes('login'))
                        .map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                            </TableCell>
                            <TableCell>{log.user_details?.email || log.user_id.substring(0, 8)}</TableCell>
                            <TableCell>{log.activity_type}</TableCell>
                            <TableCell>{log.metadata?.user_agent || 'Unknown'}</TableCell>
                            <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Similar tables for other tabs... */}
            <TabsContent value="surveys" className="space-y-4">
              {/* Survey-related activities */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Survey</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Similar content to user view but with user column */}
                    {isLoading ? (
                      Array(3).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      activityLogs
                        .filter(log => log.activity_type.includes('survey'))
                        .map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {format(new Date(log.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>{log.user_details?.email || log.user_id.substring(0, 8)}</TableCell>
                            <TableCell>{log.metadata?.survey_name || 'Unknown Survey'}</TableCell>
                            <TableCell>{log.activity_type}</TableCell>
                            <TableCell>{log.metadata?.completion_percentage ? `${log.metadata.completion_percentage}%` : 'N/A'}</TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-4">
              {/* Achievement-related activities */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Achievement</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Content similar to user view but with user column */}
                    {isLoading ? (
                      Array(3).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      activityLogs
                        .filter(log => log.activity_type.includes('achievement'))
                        .map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {format(new Date(log.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>{log.user_details?.email || log.user_id.substring(0, 8)}</TableCell>
                            <TableCell>{log.metadata?.achievement_name || 'Unknown Achievement'}</TableCell>
                            <TableCell>{log.metadata?.points || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {log.metadata?.category || 'General'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              {/* Security-related activities */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(3).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      activityLogs
                        .filter(log => 
                          log.activity_type.includes('security') || 
                          log.activity_type.includes('password') ||
                          log.activity_type.includes('permission')
                        )
                        .map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                            </TableCell>
                            <TableCell>{log.user_details?.email || log.user_id.substring(0, 8)}</TableCell>
                            <TableCell>
                              <Badge variant="destructive" className="flex items-center">
                                <ShieldAlert className="h-3 w-3 mr-1" />
                                {log.activity_type}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.description}</TableCell>
                            <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
