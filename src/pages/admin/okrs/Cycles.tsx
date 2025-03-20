
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { CyclesGrid } from '@/components/okr/cycles/CyclesGrid';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';

const AdminOKRCycles = () => {
  const { cycles, isLoading, error } = useOKRCycles();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">OKR Cycles</h1>
        <Button asChild>
          <Link to="/admin/okrs/cycles/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Cycle
          </Link>
        </Button>
      </div>
      
      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {error instanceof Error ? error.message : 'An error occurred while loading OKR cycles'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <CyclesGrid cycles={cycles || []} isLoading={isLoading} />
      )}
    </div>
  );
};

export default AdminOKRCycles;
