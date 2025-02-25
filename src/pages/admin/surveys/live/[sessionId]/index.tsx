
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SessionHeader } from "./components/SessionHeader";
import { QuestionManager } from "./components/QuestionManager";
import { PresentationView } from "./components/PresentationView";
import { LiveSession, SessionStatus } from "../types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LiveSessionControlPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<LiveSession | null>(null);

  // Fetch session data
  const { data: session, isLoading } = useQuery({
    queryKey: ["live-session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_survey_sessions")
        .select(`
          *,
          survey:surveys(*)
        `)
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      return data as LiveSession;
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_survey_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setSessionData(payload.new as LiveSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Update session status
  const updateSessionStatus = async (newStatus: SessionStatus) => {
    try {
      const { error } = await supabase
        .from("live_survey_sessions")
        .update({ status: newStatus })
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Session status updated",
        description: `Session is now ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error updating session",
        description: "Failed to update session status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading session...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Session not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/surveys/live")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Live Session Control</h1>
      </div>

      <SessionHeader 
        session={sessionData || session}
        onStatusChange={updateSessionStatus}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuestionManager
          session={sessionData || session}
        />
        <PresentationView
          session={sessionData || session}
        />
      </div>
    </div>
  );
}
