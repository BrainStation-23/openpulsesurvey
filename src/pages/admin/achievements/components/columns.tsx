
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import * as icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ACHIEVEMENT_TYPE_CONFIG, AchievementType } from "../types";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type Achievement = {
  id: string;
  name: string;
  description: string;
  achievement_type: AchievementType;
  points: number;
  icon: string;
  icon_color: string;
  status: 'active' | 'inactive';
};

export const columns: ColumnDef<Achievement>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const IconComponent = icons[row.original.icon as keyof typeof icons] as LucideIcon || icons.Trophy;
      return (
        <div className="flex items-center gap-2">
          <IconComponent 
            className="w-4 h-4" 
            style={{ color: row.original.icon_color || '#8B5CF6' }} 
          />
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const [isLoading, setIsLoading] = useState(false);
      const queryClient = useQueryClient();

      const toggleStatus = async () => {
        try {
          setIsLoading(true);
          const newStatus = row.original.status === 'active' ? 'inactive' : 'active';
          
          const { error } = await supabase
            .from('achievements')
            .update({ status: newStatus })
            .eq('id', row.original.id);

          if (error) throw error;

          queryClient.setQueryData(['achievements'], (oldData: Achievement[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(achievement => 
              achievement.id === row.original.id 
                ? { ...achievement, status: newStatus }
                : achievement
            );
          });

          toast.success(`Achievement ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        } catch (error) {
          console.error('Error toggling status:', error);
          toast.error("Failed to update achievement status");
          queryClient.invalidateQueries({ queryKey: ['achievements'] });
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.status === 'active'}
            onCheckedChange={toggleStatus}
            disabled={isLoading}
          />
          <span className="text-sm">
            {row.original.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const [isDeleting, setIsDeleting] = useState(false);
      const queryClient = useQueryClient();

      const deleteAchievement = async () => {
        try {
          setIsDeleting(true);
          const { error } = await supabase
            .from('achievements')
            .delete()
            .eq('id', row.original.id);

          if (error) throw error;

          queryClient.setQueryData(['achievements'], (oldData: Achievement[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.filter(achievement => achievement.id !== row.original.id);
          });

          toast.success("Achievement deleted successfully");
        } catch (error) {
          console.error('Error deleting achievement:', error);
          toast.error("Failed to delete achievement");
          queryClient.invalidateQueries({ queryKey: ['achievements'] });
        } finally {
          setIsDeleting(false);
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/achievements/${row.original.id}/edit`)}
          >
            <Edit className="w-4 h-4" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Achievement</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this achievement? This action will also remove all related user progress and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAchievement}
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
