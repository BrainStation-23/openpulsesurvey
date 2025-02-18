
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { ScenarioDisplay } from "./components/ScenarioDisplay";
import { EmailWindow } from "./components/EmailWindow";
import type { Scenario } from "../types";

export default function GamePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [gameState, setGameState] = useState<'initial' | 'playing' | 'submitted'>('initial');
  const navigate = useNavigate();

  useEffect(() => {
    loadRandomScenario();
  }, []);

  const loadRandomScenario = async () => {
    try {
      const { data: scenarios, error } = await supabase
        .from('email_scenarios')
        .select('*')
        .eq('status', 'active')
        .limit(1)
        .select('*', { head: true, count: 'exact' })
        .then(result => {
          if (result.count && result.count > 0) {
            // If we have scenarios, get a random offset
            const randomOffset = Math.floor(Math.random() * result.count);
            // Fetch the random scenario
            return supabase
              .from('email_scenarios')
              .select('*')
              .eq('status', 'active')
              .limit(1)
              .range(randomOffset, randomOffset);
          }
          return result;
        });

      if (error) throw error;
      
      if (scenarios && scenarios.length > 0) {
        setScenario(scenarios[0]);
      } else {
        toast.error("No active scenarios available.");
      }
    } catch (error) {
      console.error('Error loading scenario:', error);
      toast.error("Failed to load scenario. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    if (!scenario) return;
    
    try {
      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data: session, error: sessionError } = await supabase
        .from('email_training_sessions')
        .insert({
          scenario_id: scenario.id,
          user_id: user.id,
          status: 'playing'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      
      setGameState('playing');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error("Failed to start session. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg">No scenarios available.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Email Training</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioDisplay scenario={scenario} />
        
        {gameState === 'initial' ? (
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-card">
            <Button 
              size="lg"
              onClick={handleStart}
              className="gap-2"
            >
              <Play className="w-4 w-4" />
              Start Training
            </Button>
          </div>
        ) : (
          <EmailWindow 
            scenario={scenario}
            onComplete={() => setGameState('submitted')}
          />
        )}
      </div>
    </div>
  );
}
