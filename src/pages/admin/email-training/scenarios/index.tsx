
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Scenario } from "./types";
import { ScenariosTable } from "./components/ScenariosTable";
import { useNavigate } from "react-router-dom";

export default function ScenariosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: scenarios, refetch } = useQuery({
    queryKey: ["scenarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_scenarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Scenario[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email Training Scenarios</h1>
        <Button onClick={() => navigate("create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Scenario
        </Button>
      </div>

      {scenarios && <ScenariosTable scenarios={scenarios} onUpdate={refetch} />}
    </div>
  );
}
