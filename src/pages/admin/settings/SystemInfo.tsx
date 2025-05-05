
import React from 'react';
import { useVersionHistory } from '@/hooks/useSystemVersion';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';

export default function SystemInfo() {
  const { versions, isLoading, error } = useVersionHistory();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-opacity-50 rounded-full border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading system information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load system information</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const currentVersion = versions[0];

  return (
    <>
      <Helmet>
        <title>System Information | Admin Portal</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Information</h1>
          <p className="text-muted-foreground">
            View and manage system version information
          </p>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList>
            <TabsTrigger value="current">Current Version</TabsTrigger>
            <TabsTrigger value="history">Version History</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4 pt-4">
            {currentVersion ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Version {currentVersion.version}</CardTitle>
                    <Badge variant="outline">
                      Applied: {format(currentVersion.appliedAt, 'MMM d, yyyy')}
                    </Badge>
                  </div>
                  <CardDescription>
                    Current system version information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Component Versions</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted-foreground">Frontend:</span>
                          <span>{currentVersion.frontendVersion}</span>
                          
                          <span className="text-muted-foreground">Backend:</span>
                          <span>{currentVersion.schemaVersion}</span>
                          
                          <span className="text-muted-foreground">Edge Functions:</span>
                          <span>{currentVersion.edgeFunctionsVersion}</span>
                          
                          <span className="text-muted-foreground">Released:</span>
                          <span>{format(currentVersion.releasedAt, 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {currentVersion.changelog && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Changelog</h3>
                        <p className="text-sm whitespace-pre-line">{currentVersion.changelog}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-6 bg-muted rounded-md">
                <p>No version information available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 pt-4">
            {versions.length > 0 ? (
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Version {version.version}</CardTitle>
                        <Badge variant={index === 0 ? "default" : "outline"} className="ml-2">
                          {index === 0 ? "Current" : "Previous"}
                        </Badge>
                      </div>
                      <CardDescription>
                        Applied: {format(version.appliedAt, 'MMM d, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm">
                        {version.changelog && (
                          <div className="mt-2">
                            <p className="font-medium">Changes:</p>
                            <p className="text-muted-foreground whitespace-pre-line">{version.changelog}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-muted rounded-md">
                <p>No version history available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="docs" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Version Management Guide</CardTitle>
                <CardDescription>
                  Documentation for managing system versions
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <h3>Architecture Overview</h3>
                <p>
                  Each instance of Survey Pulse operates independently with:
                </p>
                <ul>
                  <li>Its own Supabase backend</li>
                  <li>Its own frontend deployment</li>
                  <li>No connection to other instances</li>
                </ul>

                <h3>Manual Migration Process</h3>
                <p>
                  To update an instance to a new version:
                </p>
                
                <ol>
                  <li>
                    <strong>Preparation</strong>:
                    <ul>
                      <li>Identify the current version</li>
                      <li>Gather migration SQL scripts</li>
                      <li>Back up the database (recommended)</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Database Migration</strong>:
                    <ul>
                      <li>Run migration scripts sequentially</li>
                      <li>Verify successful execution</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Edge Functions Update</strong>:
                    <ul>
                      <li>Deploy updated edge functions</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Frontend Deployment</strong>:
                    <ul>
                      <li>Deploy the new frontend code</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Version Record Update</strong>:
                    <ul>
                      <li>Execute the <code>update_system_version</code> function</li>
                    </ul>
                  </li>
                </ol>

                <h3>For more information</h3>
                <p>
                  See the complete documentation in <code>docs/VERSION_MANAGEMENT.md</code>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
