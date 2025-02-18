
import { useState } from "react";
import { EmailWindow } from "./components/EmailWindow";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Scenario } from "../scenarios/types";

export default function GamePage() {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);

  const { data: scenarios, isLoading } = useQuery({
    queryKey: ["scenarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_scenarios")
        .select()
        .eq("status", "active");
      if (error) throw error;
      return data as Scenario[];
    }
  });

  const handleComplete = () => {
    // Handle completion - can be expanded later
    setCurrentScenario(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentScenario) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Email Training Game</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios?.map((scenario) => (
            <Card
              key={scenario.id}
              className="p-4 cursor-pointer hover:bg-accent"
              onClick={() => setCurrentScenario(scenario)}
            >
              <h3 className="font-semibold">{scenario.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Difficulty: {scenario.difficulty_level}
              </p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{currentScenario.name}</h1>
      <EmailWindow scenario={currentScenario} onComplete={handleComplete} />
    </div>
  );
}
