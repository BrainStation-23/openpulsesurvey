
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarRange, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CycleStatusBadge } from './CycleStatusBadge';
import { OKRCycle } from '@/types/okr';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';
import { useToast } from '@/hooks/use-toast';

interface CycleGridProps {
  cycles: OKRCycle[];
  isLoading: boolean;
}

export const CyclesGrid = ({ cycles, isLoading }: CycleGridProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteCycle } = useOKRCycles();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Are you sure you want to delete this cycle? This action cannot be undone.")) {
      deleteCycle.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "OKR cycle deleted successfully",
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: `Failed to delete cycle: ${error.message}`,
          });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-64 animate-pulse flex flex-col">
            <CardHeader className="bg-muted h-8"></CardHeader>
            <CardContent className="flex-1 py-6">
              <div className="h-4 w-2/3 bg-muted rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-muted rounded mb-4"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
            </CardContent>
            <CardFooter className="border-t bg-muted h-12"></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!cycles?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <h3 className="text-lg font-medium mb-2">No OKR Cycles Found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first OKR cycle.
          </p>
          <Button asChild>
            <Link to="/admin/okrs/cycles/create">Create New Cycle</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cycles.map((cycle) => (
        <Card 
          key={cycle.id} 
          className="group transition-all hover:shadow-md hover:border-primary cursor-pointer"
          onClick={() => navigate(`/admin/okrs/cycles/${cycle.id}`)}
        >
          <CardHeader className="pb-2 relative flex flex-row items-center justify-between">
            <div>
              <CardTitle className="group-hover:text-primary transition-colors text-xl">
                {cycle.name}
              </CardTitle>
              <CardDescription>
                {cycle.description || 'No description provided'}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/okrs/cycles/${cycle.id}`);
                }}>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/okrs/cycles/${cycle.id}`);
                }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => handleDelete(cycle.id, e)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex items-center mb-2">
              <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {format(cycle.startDate, 'MMM d, yyyy')} - {format(cycle.endDate, 'MMM d, yyyy')}
              </span>
            </div>
            <CycleStatusBadge status={cycle.status} className="mt-1" />
          </CardContent>
          <CardFooter className="pt-2 border-t flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Created {format(cycle.createdAt, 'MMM d, yyyy')}
            </span>
            <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
              View Details
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
