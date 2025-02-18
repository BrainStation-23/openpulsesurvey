
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ACHIEVEMENT_TYPE_CONFIG, AchievementType } from "../types";

type Achievement = {
  id: string;
  name: string;
  description: string;
  achievement_type: AchievementType;
  points: number;
  icon: string;
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
    accessorKey: "achievement_type",
    header: "Type",
    cell: ({ row }) => {
      const config = ACHIEVEMENT_TYPE_CONFIG[row.original.achievement_type];
      return (
        <Badge variant="secondary">
          {config.label}
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
