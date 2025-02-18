
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Scenario } from "./types";
import { ScenariosTable } from "./components/ScenariosTable";
import { ScenarioDialog } from "./components/ScenarioDialog";

export default function ScenariosPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const handleCreate = async (scenario: Omit<Scenario, "id" | "created_at" | "updated_at" | "created_by">) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("email_scenarios")
        .insert([{
          ...scenario,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scenario created successfully",
      });

      refetch();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email Training Scenarios</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Scenario
        </Button>
      </div>

      {scenarios && <ScenariosTable scenarios={scenarios} onUpdate={refetch} />}

      <ScenarioDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
