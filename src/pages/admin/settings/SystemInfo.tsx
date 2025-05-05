
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
        </Tabs>
      </div>
    </>
  );
}
