
import { useState } from "react";
import { useVersionHistory } from "@/hooks/useSystemVersion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function SystemInfo() {
  const { versions, isLoading } = useVersionHistory();
  const { user, isAdmin } = useCurrentUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("version-history");

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need administrator privileges to view system information.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Information</h1>
        <p className="text-sm text-muted-foreground">
          View system version history and manage updates
        </p>
      </div>

      <Tabs
        defaultValue="version-history"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="version-history">Version History</TabsTrigger>
          <TabsTrigger value="current-version">Current Version</TabsTrigger>
        </TabsList>

        <TabsContent value="version-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                Complete history of system version updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Schema</TableHead>
                        <TableHead>Frontend</TableHead>
                        <TableHead>Edge Functions</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No version history found
                          </TableCell>
                        </TableRow>
                      ) : (
                        versions.map((version, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              v{version.version}
                            </TableCell>
                            <TableCell>
                              {format(version.appliedAt, "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>v{version.schemaVersion}</TableCell>
                            <TableCell>v{version.frontendVersion}</TableCell>
                            <TableCell>v{version.edgeFunctionsVersion}</TableCell>
                            <TableCell>
                              {index === 0 ? (
                                <Badge>Current</Badge>
                              ) : (
                                <Badge variant="outline">Historical</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current-version" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Version Details</CardTitle>
              <CardDescription>
                Detailed information about the current system version
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : versions.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Version Information</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Version</div>
                      <div>v{versions[0].version}</div>
                      
                      <div className="text-sm font-medium text-muted-foreground">Released Date</div>
                      <div>{format(versions[0].releasedAt, "PPP")}</div>
                      
                      <div className="text-sm font-medium text-muted-foreground">Applied Date</div>
                      <div>{format(versions[0].appliedAt, "PPP")}</div>
                      
                      <div className="text-sm font-medium text-muted-foreground">Schema Version</div>
                      <div>v{versions[0].schemaVersion}</div>
                      
                      <div className="text-sm font-medium text-muted-foreground">Frontend Version</div>
                      <div>v{versions[0].frontendVersion}</div>
                      
                      <div className="text-sm font-medium text-muted-foreground">Edge Functions Version</div>
                      <div>v{versions[0].edgeFunctionsVersion}</div>
                    </div>
                  </div>
                  
                  {versions[0].changelog && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Changelog</h3>
                      <p className="text-sm whitespace-pre-line">{versions[0].changelog}</p>
                    </div>
                  )}
                  
                  {versions[0].releaseNotes && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Release Notes</h3>
                      <p className="text-sm whitespace-pre-line">{versions[0].releaseNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  No version information available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
