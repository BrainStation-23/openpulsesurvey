
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserObjectives = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Objectives</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Objectives List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will display all your objectives and their associated key results.
            This page is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserObjectives;
