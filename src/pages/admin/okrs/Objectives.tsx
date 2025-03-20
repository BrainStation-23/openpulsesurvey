
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminAllObjectives = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Objectives</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Organization Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will display all objectives across the organization and allow you to manage them.
            This page is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAllObjectives;
