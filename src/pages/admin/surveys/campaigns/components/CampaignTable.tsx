import { format } from "date-fns";
import { Eye, Trash2, Settings, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Campaign } from "../../types";
import { DataTable } from "@/components/ui/data-table";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CampaignTableProps {
  campaigns: Campaign[];
  onDelete: (id: string) => void;
  sortOrder: 'asc' | 'desc';
  sortBy: 'starts_at' | 'ends_at' | null;
  onSort: (field: 'starts_at' | 'ends_at') => void;
}

export function CampaignTable({ campaigns, onDelete, sortOrder, sortBy, onSort }: CampaignTableProps) {
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => {
        const campaign = row.original;
        return (
          <div className="flex flex-col">
            <Link
              to={`/admin/surveys/campaigns/${campaign.id}`}
              className="font-medium hover:underline"
            >
              {campaign.name}
            </Link>
            {campaign.description && (
              <span className="text-sm text-muted-foreground">
                {campaign.description}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "survey.name",
      header: "Survey",
      cell: ({ row }: any) => row.original.survey?.name,
    },
    {
      accessorKey: "starts_at",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => onSort('starts_at')}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          Start Date
          {sortBy === 'starts_at' && (
            sortOrder === 'desc' ? 
              <ChevronDown className="ml-2 h-4 w-4" /> : 
              <ChevronUp className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }: any) => format(new Date(row.original.starts_at), "PPP"),
    },
    {
      accessorKey: "ends_at",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => onSort('ends_at')}
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          End Date
          {sortBy === 'ends_at' && (
            sortOrder === 'desc' ? 
              <ChevronDown className="ml-2 h-4 w-4" /> : 
              <ChevronUp className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }: any) => 
        row.original.ends_at ? format(new Date(row.original.ends_at), "PPP") : "No end date",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === "active"
                ? "default"
                : status === "draft"
                ? "secondary"
                : "destructive"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const campaign = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to={`/admin/surveys/campaigns/${campaign.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to={`/admin/surveys/campaigns/${campaign.id}/performance`}>
                <BarChart3 className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to={`/admin/surveys/campaigns/${campaign.id}/instances`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    campaign and all its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(campaign.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={campaigns} />;
}
