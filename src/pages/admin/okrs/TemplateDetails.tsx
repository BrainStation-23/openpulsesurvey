
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminOKRTemplateDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Template Details</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Template #{id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will display detailed information about this specific OKR template
            and allow you to edit it.
            This page is under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOKRTemplateDetails;
