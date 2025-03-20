
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminCreateOKRCycle = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create OKR Cycle</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New OKR Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will contain a form to create a new OKR cycle.
            This page is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreateOKRCycle;
