
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
import { Clock, User, Award, FileText, ShieldAlert, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { useActivityLog } from "@/hooks/useActivityLog";

export default function ActivityLog() {
  const { userId } = useCurrentUser();
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState({
    activityType: "all",
    period: "30",
    searchTerm: "",
  });

  const { 
    activityLogs, 
    isLoading, 
    activityTypes,
    periodOptions
  } = useActivityLog({
    userId,
    activityType: filter.activityType !== "all" ? filter.activityType : undefined,
    period: parseInt(filter.period),
    searchTerm: filter.searchTerm
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          Track your activity and important events in the system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" /> My Activity History
          </CardTitle>
          <CardDescription>
            View the history of your activities and system events.
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
              </TabsList>
              
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <Input
                  placeholder="Search activities..."
                  value={filter.searchTerm}
                  onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                  className="w-full sm:w-40 md:w-60"
                />
                
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
            </div>

            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
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
                          <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        </TableRow>
                      ))
                    ) : activityLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No activity records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
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
            
            <TabsContent value="auth" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
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
            
            <TabsContent value="surveys" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Survey</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(3).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Achievement</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(3).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
