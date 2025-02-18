
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
      // First, get the count of active scenarios
      const { count, error: countError } = await supabase
        .from('email_scenarios')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (countError) throw countError;
      if (!count || count === 0) {
        toast.error("No active scenarios available.");
        return;
      }

      // Get a random offset
      const randomOffset = Math.floor(Math.random() * count);

      // Fetch the random scenario
      const { data: scenarios, error } = await supabase
        .from('email_scenarios')
        .select('*')
        .eq('status', 'active')
        .range(randomOffset, randomOffset)
        .limit(1);

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