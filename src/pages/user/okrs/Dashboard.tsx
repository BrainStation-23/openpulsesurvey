
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserOKRDashboard = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My OKRs Dashboard</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Objectives Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your OKR dashboard will show your objectives, key results, and progress.
            This page is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserOKRDashboard;
