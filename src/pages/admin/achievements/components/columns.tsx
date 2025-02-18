
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Achievement = {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  condition_type: string;
};

export const columns: ColumnDef<Achievement>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>{row.original.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return (
        <Badge variant="secondary">
          {row.original.category.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "points",
    header: "Points",
    cell: ({ row }) => {
      return (
        <Badge variant="default">
          {row.original.points} pts
        </Badge>
      );
    },
  },
  {
    accessorKey: "condition_type",
    header: "Condition Type",
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.original.condition_type.replace('_', ' ')}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const navigate = useNavigate();
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/admin/achievements/${row.original.id}/edit`)}
        >
          <Edit className="w-4 h-4" />
        </Button>
      );
    },
  },
];
