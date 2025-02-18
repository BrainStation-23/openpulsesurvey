
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { columns } from "./components/columns";
import { useNavigate } from "react-router-dom";
import { AchievementType } from "./types";

type Achievement = {
  id: string;
  name: string;
  description: string;
  achievement_type: AchievementType;
  icon: string;
  points: number;
  condition_value: any;
  created_at: string;
  updated_at: string;
};

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Achievement[];
    },
  });

  return (
    <div className="space-y-4 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Achievements</h1>
        <Button onClick={() => navigate('/admin/achievements/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Achievement
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={achievements || []}
        isLoading={isLoading}
      />
    </div>
  );
}
