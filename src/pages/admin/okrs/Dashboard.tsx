
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminOKRDashboard = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">OKRs Dashboard</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Organization OKRs Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The OKR dashboard provides an overview of all objectives and key results across the organization.
            This page is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOKRDashboard;
